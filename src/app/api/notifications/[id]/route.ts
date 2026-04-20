import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

// PATCH — Marquer une notification comme lue
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const { id } = await params

  await prisma.notification.update({
    where: { id: id, userId: session.user.id },
    data: { lue: true }
  })

  return NextResponse.json({ succes: true })
}
