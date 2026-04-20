import { GoogleGenAI } from '@google/genai'
import prisma from '@/lib/prisma'

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! })

export interface SuggestionPrix {
  statut: 'BIEN_POSITIONNE' | 'SOUS_EVALUE' | 'SUREVALUE'
  label: string
  loyerActuel: number
  loyerSuggere: number | null
  ecart: number
  ecartPourcentage: number
  explication: string
  contexte: string
}

export async function suggererPrixLoyer(
  appartementId: string
): Promise<SuggestionPrix> {

  const appartement = await prisma.appartement.findUnique({
    where: { id: appartementId },
    include: {
      residence: {
        include: {
          appartements: {
            where: { id: { not: appartementId } },
            include: {
              locataires: {
                where: { statut: 'ACTIF' },
                select: { loyer: true }
              }
            }
          }
        }
      }
    }
  })

  if (!appartement) throw new Error('Appartement introuvable')

  // Appartements similaires dans la même résidence
  const apptsMemeResidence = appartement.residence.appartements
    .filter(a => Math.abs(a.nbrePieces - appartement.nbrePieces) <= 1)

  // Appartements similaires dans le même quartier
  const apptsQuartier = await prisma.appartement.findMany({
    where: {
      residence: {
        quartier: appartement.residence.quartier,
        id: { not: appartement.residenceId }
      },
      nbrePieces: {
        gte: appartement.nbrePieces - 1,
        lte: appartement.nbrePieces + 1,
      },
      id: { not: appartementId },
    },
    select: { loyer: true, nbrePieces: true },
    take: 10,
  })

  const loyersMemeResidence = apptsMemeResidence.map(a => a.loyer)
  const loyersQuartier = apptsQuartier.map(a => a.loyer)
  const tousLesLoyers = [...loyersMemeResidence, ...loyersQuartier]

  const loyerMoyen = tousLesLoyers.length > 0
    ? Math.round(tousLesLoyers.reduce((s, l) => s + l, 0) / tousLesLoyers.length)
    : appartement.loyer

  const prompt = `
Tu es un expert en marché immobilier locatif à Bouaké, Côte d'Ivoire.

Analyse si le prix de loyer de cet appartement est bien positionné.

APPARTEMENT ANALYSÉ :
- Libellé : ${appartement.libelle}
- Nombre de pièces : ${appartement.nbrePieces}
- Loyer actuel : ${appartement.loyer.toLocaleString('fr-FR')} FCFA
- Résidence : ${appartement.residence.quartier}
- Statut : ${appartement.statut}

MARCHÉ LOCAL :
- Nombre d'appartements similaires trouvés : ${tousLesLoyers.length}
- Loyers dans la même résidence : ${loyersMemeResidence.map(l => l.toLocaleString('fr-FR') + ' FCFA').join(', ') || 'Aucun'}
- Loyers dans le même quartier : ${loyersQuartier.map(l => l.toLocaleString('fr-FR') + ' FCFA').join(', ') || 'Aucun'}
- Loyer moyen calculé : ${loyerMoyen.toLocaleString('fr-FR')} FCFA

Réponds UNIQUEMENT en JSON :
{
  "statut": "BIEN_POSITIONNE" ou "SOUS_EVALUE" ou "SUREVALUE",
  "loyerSuggere": nombre en FCFA ou null si bien positionné,
  "explication": "explication courte en français (max 120 caractères)",
  "contexte": "contexte du marché en français (max 150 caractères)"
}

Règles :
- BIEN_POSITIONNE : écart < 10% avec le marché
- SOUS_EVALUE : loyer actuel < loyer moyen - 10% (l'agence perd de l'argent)
- SUREVALUE : loyer actuel > loyer moyen + 10% (risque de vacance)
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

    const ecart = data.loyerSuggere
      ? data.loyerSuggere - appartement.loyer
      : 0
    const ecartPourcentage = appartement.loyer > 0
      ? Math.round((ecart / appartement.loyer) * 100)
      : 0

    const labels: Record<string, string> = {
      BIEN_POSITIONNE: 'Prix correct',
      SOUS_EVALUE: 'Sous-évalué',
      SUREVALUE: 'Surévalué',
    }

    return {
      statut: data.statut,
      label: labels[data.statut],
      loyerActuel: appartement.loyer,
      loyerSuggere: data.loyerSuggere,
      ecart,
      ecartPourcentage,
      explication: data.explication,
      contexte: data.contexte,
    }
  } catch (error) {
    console.error('Erreur Suggestion Prix Gemini:', error)
    const ecart = loyerMoyen - appartement.loyer
    const ecartPct = Math.round((ecart / appartement.loyer) * 100)
    const statut = Math.abs(ecartPct) < 10
      ? 'BIEN_POSITIONNE'
      : ecart > 0 ? 'SOUS_EVALUE' : 'SUREVALUE'

    return {
      statut,
      label: statut === 'BIEN_POSITIONNE' ? 'Prix correct' : statut === 'SOUS_EVALUE' ? 'Sous-évalué' : 'Surévalué',
      loyerActuel: appartement.loyer,
      loyerSuggere: statut !== 'BIEN_POSITIONNE' ? loyerMoyen : null,
      ecart,
      ecartPourcentage: ecartPct,
      explication: `Loyer moyen du quartier : ${loyerMoyen.toLocaleString('fr-FR')} FCFA`,
      contexte: `Basé sur ${tousLesLoyers.length} appartements similaires dans ${appartement.residence.quartier}`,
    }
  }
}
