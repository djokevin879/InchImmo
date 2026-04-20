import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// GET — Récupérer les notifications de l'utilisateur connecté
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const nonLues = notifications.filter(n => !n.lue).length

  return NextResponse.json({ notifications, nonLues })
}

// PATCH — Marquer toutes comme lues
export async function PATCH() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  await prisma.notification.updateMany({
    where: { userId: session.user.id, lue: false },
    data: { lue: true }
  })

  return NextResponse.json({ succes: true })
}
