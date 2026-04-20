import { NextResponse } from 'next/server'
import { genererRapportMensuel } from '@/lib/rapport-ia'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const maintenant = new Date()
    // Si on est le 1er du mois, on génère pour le mois d'avant
    const mois = maintenant.getMonth() === 0 ? 12 : maintenant.getMonth()
    const annee = maintenant.getMonth() === 0
      ? maintenant.getFullYear() - 1
      : maintenant.getFullYear()

    const rapport = await genererRapportMensuel(mois, annee)

    console.log('Rapport mensuel généré:', rapport.genereA)
    return NextResponse.json({ succes: true, rapport })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
