import prisma from '@/lib/prisma'

export type TypeNotification =
  | 'ARRIERE_CRITIQUE'
  | 'BAIL_EXPIRANT'
  | 'PAIEMENT_RECU'
  | 'NOUVEAU_LOCATAIRE'
  | 'ALERTE_SYSTEME'

// Créer une notification pour un utilisateur
export async function creerNotification(params: {
  userId: string
  titre: string
  message: string
  type: TypeNotification
  lien?: string
}) {
  return await prisma.notification.create({
    data: {
      userId: params.userId,
      titre: params.titre,
      message: params.message,
      type: params.type,
      lien: params.lien,
      lue: false,
    }
  })
}

// Notifier tous les admins
export async function notifierAdmins(params: {
  titre: string
  message: string
  type: TypeNotification
  lien?: string
}) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', isActive: true },
    select: { id: true }
  })

  await Promise.all(
    admins.map(admin =>
      creerNotification({ ...params, userId: admin.id })
    )
  )
}

// Vérifier et générer les alertes automatiques
export async function genererAlertesAutomatiques() {
  const aujourd_hui = new Date()

  // ── ARRIÉRÉS CRITIQUES (> 2 mois de loyer) ──────────────
  const locatairesEnRetard = await prisma.locataire.findMany({
    where: {
      statut: 'ACTIF',
      arriere: { gt: 0 },
    },
    include: {
      appartement: { include: { residence: true } }
    }
  })

  for (const l of locatairesEnRetard) {
    const moisEnRetard = Math.floor(l.arriere / (l.loyer || 1))
    if (moisEnRetard >= 2) {
      const dejaNotifie = await prisma.notification.findFirst({
        where: {
          type: 'ARRIERE_CRITIQUE',
          lien: `/admin/locataires?id=${l.id}`,
          createdAt: { gte: new Date(aujourd_hui.getTime() - 7 * 24 * 3600 * 1000) }
        }
      })
      if (!dejaNotifie) {
        await notifierAdmins({
          titre: 'Arriéré critique',
          message: `${l.nom} — ${new Intl.NumberFormat('fr-FR').format(l.arriere)} FCFA d'arriérés (${moisEnRetard} mois) — ${l.appartement?.residence?.quartier}`,
          type: 'ARRIERE_CRITIQUE',
          lien: `/admin/locataires?id=${l.id}`,
        })
      }
    }
  }

  // ── BAUX EXPIRANT DANS 30 JOURS ──────────────────────────
  const dans30Jours = new Date(aujourd_hui)
  dans30Jours.setDate(dans30Jours.getDate() + 30)

  // Note: Assuming a bail is for 1 year from dateEntree in this logic
  // Filtering locataires who entered nearly a year ago
  const locatairesExpiration = await prisma.locataire.findMany({
    where: {
      statut: 'ACTIF',
      dateEntree: {
        lte: new Date(aujourd_hui.getFullYear() - 1, aujourd_hui.getMonth(), aujourd_hui.getDate() + 30)
      }
    },
    include: {
      appartement: { include: { residence: true } }
    }
  })

  for (const l of locatairesExpiration) {
    const dateEntree = new Date(l.dateEntree)
    const dateExpiration = new Date(dateEntree)
    dateExpiration.setFullYear(dateExpiration.getFullYear() + 1)

    const joursRestants = Math.floor(
      (dateExpiration.getTime() - aujourd_hui.getTime()) / (1000 * 3600 * 24)
    )

    if (joursRestants >= 0 && joursRestants <= 30) {
      const dejaNotifie = await prisma.notification.findFirst({
        where: {
          type: 'BAIL_EXPIRANT',
          lien: `/admin/locataires?id=${l.id}`,
          createdAt: { gte: new Date(aujourd_hui.getTime() - 7 * 24 * 3600 * 1000) }
        }
      })
      if (!dejaNotifie) {
        await notifierAdmins({
          titre: 'Bail expirant bientôt',
          message: `Le bail de ${l.nom} expire dans ${joursRestants} jour(s) — ${l.appartement?.libelle} (${l.appartement?.residence?.quartier})`,
          type: 'BAIL_EXPIRANT',
          lien: `/admin/locataires?id=${l.id}`,
        })
      }
    }
  }
}

// Notifier quand un agent enregistre un paiement
export async function notifierNouveauPaiement(params: {
  agentNom: string
  locataireNom: string
  montant: number
  residence: string
}) {
  await notifierAdmins({
    titre: 'Nouveau paiement enregistré',
    message: `${params.agentNom} a enregistré ${new Intl.NumberFormat('fr-FR').format(params.montant)} FCFA de ${params.locataireNom} (${params.residence})`,
    type: 'PAIEMENT_RECU',
    lien: '/admin/paiements',
  })
}
