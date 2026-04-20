import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { genererRapportMensuel } from '@/lib/rapport-ia'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const mois = parseInt(searchParams.get('mois') || '1')
    const annee = parseInt(searchParams.get('annee') || '2025')

    const rapport = await genererRapportMensuel(mois, annee)
    return NextResponse.json({ rapport })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
