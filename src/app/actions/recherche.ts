'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export interface ResultatRecherche {
  id: string
  type: 'locataire' | 'residence' | 'appartement' | 'paiement'
  titre: string
  sousTitre: string
  url: string
  badge?: string
  badgeColor?: 'green' | 'red' | 'orange' | 'gray'
}

export async function rechercheGlobale(
  query: string
): Promise<ResultatRecherche[]> {

  const session = await auth()
  if (!session || query.trim().length < 2) return []

  const q = query.trim().toLowerCase()
  const resultats: ResultatRecherche[] = []

  // ── LOCATAIRES ──────────────────────────────────────────
  const locataires = await prisma.locataire.findMany({
    where: {
      OR: [
        { nom: { contains: q, mode: 'insensitive' } },
        { telephone: { contains: q, mode: 'insensitive' } },
        { numPiece: { contains: q, mode: 'insensitive' } },
        { nationalite: { contains: q, mode: 'insensitive' } },
      ],
      statut: 'ACTIF',
    },
    include: {
      appartement: { include: { residence: true } }
    },
    take: 4,
  })

  locataires.forEach(l => {
    resultats.push({
      id: l.id,
      type: 'locataire',
      titre: l.nom,
      sousTitre: [
        l.appartement?.libelle,
        l.appartement?.residence?.quartier,
        l.telephone,
      ].filter(Boolean).join(' · '),
      url: `/admin/locataires?id=${l.id}`,
      badge: l.arriere > 0
        ? `${new Intl.NumberFormat('fr-FR').format(l.arriere)} FCFA d'arriérés`
        : 'À jour',
      badgeColor: l.arriere > 0 ? 'red' : 'green',
    })
  })

  // ── RÉSIDENCES ───────────────────────────────────────────
  const residences = await prisma.residence.findMany({
    where: {
      OR: [
        { quartier: { contains: q, mode: 'insensitive' } },
        { ville: { contains: q, mode: 'insensitive' } },
        { localisation: { contains: q, mode: 'insensitive' } },
        { proprietaire: { nom: { contains: q, mode: 'insensitive' } } },
      ],
    },
    include: {
      proprietaire: true,
      appartements: true,
      agent: true,
    },
    take: 3,
  })

  residences.forEach(r => {
    const occupes = r.appartements.filter(a => a.statut === 'OCCUPE').length
    resultats.push({
      id: r.id,
      type: 'residence',
      titre: `${r.quartier} — ${r.ville}`,
      sousTitre: [
        r.proprietaire?.nom,
        `${r.appartements.length} apparts`,
        r.agent ? `Agent : ${r.agent.nom}` : null,
      ].filter(Boolean).join(' · '),
      url: `/admin/residences?id=${r.id}`,
      badge: `${occupes}/${r.appartements.length} occupés`,
      badgeColor: occupes === r.appartements.length ? 'green' : 'orange',
    })
  })

  // ── APPARTEMENTS ─────────────────────────────────────────
  const appartements = await prisma.appartement.findMany({
    where: {
      OR: [
        { libelle: { contains: q, mode: 'insensitive' } },
        { residence: { quartier: { contains: q, mode: 'insensitive' } } },
      ],
    },
    include: {
      residence: { include: { proprietaire: true } },
    },
    take: 3,
  })

  appartements.forEach(a => {
    resultats.push({
      id: a.id,
      type: 'appartement',
      titre: a.libelle,
      sousTitre: [
        a.residence?.quartier,
        `${a.nbrePieces} pièces`,
        `${new Intl.NumberFormat('fr-FR').format(a.loyer)} FCFA/mois`,
      ].filter(Boolean).join(' · '),
      url: `/admin/appartements?id=${a.id}`,
      badge: a.statut === 'OCCUPE' ? 'Occupé' : 'Libre',
      badgeColor: a.statut === 'OCCUPE' ? 'orange' : 'green',
    })
  })

  // ── PAIEMENTS ────────────────────────────────────────────
  const paiements = await prisma.paiement.findMany({
    where: {
      OR: [
        { locataire: { nom: { contains: q, mode: 'insensitive' } } },
        { moisLibelle: { contains: q, mode: 'insensitive' } },
        { motif: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: {
      locataire: {
        include: {
          appartement: { include: { residence: true } }
        }
      },
      agent: true,
    },
    orderBy: { datePaiement: 'desc' },
    take: 3,
  })

  paiements.forEach(p => {
    resultats.push({
      id: p.id,
      type: 'paiement',
      titre: `${p.locataire?.nom} — ${p.moisLibelle} ${p.annee}`,
      sousTitre: [
        `${new Intl.NumberFormat('fr-FR').format(p.montant)} FCFA`,
        p.locataire?.appartement?.residence?.quartier,
        new Date(p.datePaiement).toLocaleDateString('fr-FR'),
      ].filter(Boolean).join(' · '),
      url: `/admin/paiements?id=${p.id}`,
      badge: p.reste > 0 ? 'Reliquat' : 'Soldé',
      badgeColor: p.reste > 0 ? 'red' : 'green',
    })
  })

  return resultats
}
