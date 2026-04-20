import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

export type ActionType =
  | 'CONNEXION'
  | 'DECONNEXION'
  | 'CREATION'
  | 'MODIFICATION'
  | 'SUPPRESSION'
  | 'PAIEMENT_ENREGISTRE'
  | 'LOCATAIRE_PARTI'
  | 'SMS_ENVOYE'
  | 'EXPORT_PDF'
  | 'EXPORT_EXCEL'

export type EntiteType =
  | 'Propriétaire'
  | 'Résidence'
  | 'Appartement'
  | 'Locataire'
  | 'Paiement'
  | 'Utilisateur'
  | 'Système'

export async function enregistrerAction(params: {
  userId?: string
  action: ActionType
  entite: EntiteType
  entiteId?: string
  entiteNom?: string
  details?: string
}) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'inconnue'

    // Verify if userId is valid and exists in DB to avoid FK constraint errors
    let validUserId: string | null = null
    if (params.userId && params.userId !== 'admin-id-fallback') {
      const user = await prisma.user.findUnique({ where: { id: params.userId }, select: { id: true } })
      if (user) {
        validUserId = user.id
      }
    }

    await prisma.activityLog.create({
      data: {
        userId: validUserId,
        action: params.action,
        entite: params.entite,
        entiteId: params.entiteId,
        entiteNom: params.entiteNom,
        details: params.details,
        ipAddress: ip,
      }
    })
  } catch (error) {
    console.error('Erreur audit log:', error)
  }
}

export function formaterAction(action: ActionType, entite: EntiteType): string {
  const verbes: Record<ActionType, string> = {
    CONNEXION: 'S\'est connecté',
    DECONNEXION: 'S\'est déconnecté',
    CREATION: `A créé un(e) ${entite}`,
    MODIFICATION: `A modifié un(e) ${entite}`,
    SUPPRESSION: `A supprimé un(e) ${entite}`,
    PAIEMENT_ENREGISTRE: 'A enregistré un paiement',
    LOCATAIRE_PARTI: 'A marqué un locataire comme parti',
    SMS_ENVOYE: 'A envoyé un SMS',
    EXPORT_PDF: 'A exporté en PDF',
    EXPORT_EXCEL: 'A exporté en Excel',
  }
  return verbes[action] || action
}
