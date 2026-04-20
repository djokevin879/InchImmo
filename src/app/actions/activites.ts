'use server'

import prisma from '@/lib/prisma'

export async function getActivites(filtres?: {
  userId?: string
  entite?: string
  dateDebut?: Date
  dateFin?: Date
}) {
  return await prisma.activityLog.findMany({
    where: {
      ...(filtres?.userId && { userId: filtres.userId }),
      ...(filtres?.entite && { entite: filtres.entite }),
      ...(filtres?.dateDebut && {
        createdAt: {
          gte: filtres.dateDebut,
          ...(filtres?.dateFin && { lte: filtres.dateFin }),
        }
      }),
    },
    include: {
      user: {
        select: { nom: true, prenom: true, role: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
}

export async function getActivitesByUser(userId: string) {
  return await prisma.activityLog.findMany({
    where: { userId },
    include: {
      user: { select: { nom: true, prenom: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}
