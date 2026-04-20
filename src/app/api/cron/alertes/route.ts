import { NextResponse } from 'next/server'
import { genererAlertesAutomatiques } from '@/lib/notifications'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    await genererAlertesAutomatiques()
    return NextResponse.json({ succes: true })
  } catch (error) {
    console.error("Erreur lors de la génération des alertes automatiques", error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
