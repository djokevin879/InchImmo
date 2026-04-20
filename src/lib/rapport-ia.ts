import { GoogleGenAI } from '@google/genai'
import prisma from '@/lib/prisma'

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! })

export async function genererRapportMensuel(mois: number, annee: number) {

  const moisPrecedent = mois === 1 ? 12 : mois - 1
  const anneePrecedente = mois === 1 ? annee - 1 : annee

  const MOIS_LABELS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai',
    'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  // Collecte des données
  const [
    locatairesActifs,
    paiementsMois,
    paiementsPrecedent,
    totalAppartements,
    appartOccupes,
    locatairesArrieres,
    totalResidences,
  ] = await Promise.all([
    prisma.locataire.count({ where: { statut: 'ACTIF' } }),
    prisma.paiement.findMany({ where: { mois, annee } }),
    prisma.paiement.findMany({ where: { mois: moisPrecedent, annee: anneePrecedente } }),
    prisma.appartement.count(),
    prisma.appartement.count({ where: { statut: 'OCCUPE' } }),
    prisma.locataire.findMany({
      where: { statut: 'ACTIF', arriere: { gt: 0 } },
      select: { nom: true, arriere: true, loyer: true }
    }),
    prisma.residence.count(),
  ])

  const totalEncaisse = paiementsMois.reduce((s, p) => s + p.montant, 0)
  const totalPrecedent = paiementsPrecedent.reduce((s, p) => s + p.montant, 0)
  const variation = totalPrecedent > 0
    ? Math.round(((totalEncaisse - totalPrecedent) / totalPrecedent) * 100)
    : 0

  const totalAttendu = await prisma.locataire.aggregate({
    where: { statut: 'ACTIF' },
    _sum: { loyer: true }
  })
  const loyersAttendus = totalAttendu._sum.loyer || 0
  const tauxRecouvrement = loyersAttendus > 0
    ? Math.round((totalEncaisse / loyersAttendus) * 100)
    : 0

  const totalArrieres = locatairesArrieres.reduce((s, l) => s + l.arriere, 0)
  const tauxOccupation = totalAppartements > 0
    ? Math.round((appartOccupes / totalAppartements) * 100)
    : 0

  // Top 3 locataires en retard
  const top3Retard = locatairesArrieres
    .sort((a, b) => b.arriere - a.arriere)
    .slice(0, 3)
    .map(l => `${l.nom} : ${l.arriere.toLocaleString('fr-FR')} FCFA (${Math.floor(l.arriere / l.loyer)} mois)`)
    .join(', ')

  const prompt = `
Tu es un consultant expert en gestion immobilière pour l'agence INCH'ALLAH IMMOBILIER
à Bouaké, Côte d'Ivoire. Rédige un rapport mensuel professionnel.

DONNÉES DU MOIS DE ${MOIS_LABELS[mois].toUpperCase()} ${annee} :

FINANCES :
- Loyers attendus : ${loyersAttendus.toLocaleString('fr-FR')} FCFA
- Loyers encaissés : ${totalEncaisse.toLocaleString('fr-FR')} FCFA
- Taux de recouvrement : ${tauxRecouvrement}%
- Variation vs mois précédent : ${variation > 0 ? '+' : ''}${variation}%
- Total arriérés cumulés : ${totalArrieres.toLocaleString('fr-FR')} FCFA

PARC IMMOBILIER :
- Résidences gérées : ${totalResidences}
- Appartements total : ${totalAppartements}
- Appartements occupés : ${appartOccupes} (${tauxOccupation}%)
- Locataires actifs : ${locatairesActifs}
- Locataires avec arriérés : ${locatairesArrieres.length}

TOP 3 LOCATAIRES EN RETARD : ${top3Retard || 'Aucun'}

Génère un rapport structuré avec exactement ces sections :

1. RÉSUMÉ EXÉCUTIF (3 phrases max, bilan global du mois)
2. ANALYSE FINANCIÈRE (commentaire sur les chiffres, points positifs et négatifs)
3. ÉTAT DU PARC (commentaire sur le taux d'occupation et les tendances)
4. ALERTES PRIORITAIRES (locataires critiques à contacter en urgence)
5. 3 RECOMMANDATIONS STRATÉGIQUES (actions concrètes pour améliorer les performances)
6. OBJECTIFS DU MOIS PROCHAIN (2-3 objectifs mesurables)

Ton professionnel, concis, orienté action. En français. Sans markdown excessif.
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    })
    const contenuRapport = response.text

    return {
      mois,
      annee,
      moisLabel: MOIS_LABELS[mois],
      totalEncaisse,
      loyersAttendus,
      tauxRecouvrement,
      variation,
      tauxOccupation,
      totalArrieres,
      locatairesActifs,
      contenu: contenuRapport,
      genereA: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Erreur Rapport IA Gemini:', error)
    throw error
  }
}
