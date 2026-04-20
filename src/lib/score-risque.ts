import { GoogleGenAI } from '@google/genai'
import prisma from '@/lib/prisma'

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! })

export interface ScoreRisque {
  score: 'VERT' | 'ORANGE' | 'ROUGE'
  label: string
  pourcentage: number
  explication: string
  recommandation: string
}

export async function calculerScoreRisque(
  locataireId: string
): Promise<ScoreRisque> {

  const locataire = await prisma.locataire.findUnique({
    where: { id: locataireId },
    include: {
      paiements: {
        orderBy: { createdAt: 'desc' },
        take: 12,
      },
      appartement: {
        include: { residence: true }
      }
    }
  })

  if (!locataire) throw new Error('Locataire introuvable')

  const paiements = locataire.paiements
  const totalPaiements = paiements.length
  const paiementsEnRetard = paiements.filter(p => p.reste > 0).length
  const arriereActuel = locataire.arriere

  // Si pas de paiements → pas assez de données
  if (totalPaiements === 0) {
    return {
      score: 'ORANGE',
      label: 'Insuffisant',
      pourcentage: 50,
      explication: 'Aucun historique de paiement disponible pour ce locataire.',
      recommandation: 'Surveiller les premiers paiements attentivement.',
    }
  }

  const historiqueTexte = paiements.map(p =>
    `- ${p.moisLibelle} ${p.annee} : ${p.montant.toLocaleString('fr-FR')} FCFA payé, reste ${p.reste.toLocaleString('fr-FR')} FCFA`
  ).join('\n')

  const prompt = `
Tu es un expert en analyse de risque locatif pour une agence immobilière en Côte d'Ivoire.

Analyse le profil de ce locataire et donne un score de risque de paiement.

INFORMATIONS DU LOCATAIRE :
- Nom : ${locataire.nom}
- Loyer mensuel : ${locataire.loyer.toLocaleString('fr-FR')} FCFA
- Arriérés actuels : ${arriereActuel.toLocaleString('fr-FR')} FCFA
- Nombre de paiements enregistrés : ${totalPaiements}
- Paiements avec reliquat : ${paiementsEnRetard} sur ${totalPaiements}
- Date d'entrée : ${new Date(locataire.dateEntree).toLocaleDateString('fr-FR')}

HISTORIQUE DES 12 DERNIERS PAIEMENTS :
${historiqueTexte}

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "score": "VERT" ou "ORANGE" ou "ROUGE",
  "pourcentage": nombre entre 0 et 100 (fiabilité),
  "explication": "explication courte en français (max 100 caractères)",
  "recommandation": "action recommandée en français (max 120 caractères)"
}

Règles de scoring :
- VERT (75-100%) : Paiements réguliers, peu ou pas d'arriérés, bon historique
- ORANGE (40-74%) : Quelques retards, arriérés modérés, à surveiller
- ROUGE (0-39%) : Retards fréquents, arriérés importants, risque élevé
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    })
    const text = response.text.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Réponse invalide')
    const data = JSON.parse(jsonMatch[0])

    const labels: Record<string, string> = {
      VERT: 'Fiable',
      ORANGE: 'À surveiller',
      ROUGE: 'Risque élevé',
    }

    return {
      score: data.score,
      label: labels[data.score] || data.score,
      pourcentage: data.pourcentage,
      explication: data.explication,
      recommandation: data.recommandation,
    }
  } catch (error) {
    console.error('Erreur Score Risque Gemini:', error)
    // Score par défaut si Gemini échoue
    const tauxRetard = paiementsEnRetard / totalPaiements
    const score = arriereActuel === 0 && tauxRetard < 0.2
      ? 'VERT'
      : tauxRetard > 0.5 || arriereActuel > locataire.loyer * 2
      ? 'ROUGE'
      : 'ORANGE'

    return {
      score,
      label: score === 'VERT' ? 'Fiable' : score === 'ORANGE' ? 'À surveiller' : 'Risque élevé',
      pourcentage: score === 'VERT' ? 85 : score === 'ORANGE' ? 55 : 25,
      explication: `${paiementsEnRetard} retard(s) sur ${totalPaiements} paiements`,
      recommandation: score === 'ROUGE' ? 'Contacter immédiatement le locataire' : 'Surveiller les prochains paiements',
    }
  }
}
