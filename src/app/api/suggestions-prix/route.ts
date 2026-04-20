import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { suggererPrixLoyer } from '@/lib/suggestion-prix'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const appartementId = searchParams.get('appartementId')
    if (!appartementId) return NextResponse.json({ error: 'ID manquant' }, { status: 400 })

    const suggestion = await suggererPrixLoyer(appartementId)
    return NextResponse.json({ suggestion })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
