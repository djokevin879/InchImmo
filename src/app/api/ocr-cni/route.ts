import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { extraireDonneesCNI } from '@/lib/ocr-cni'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const fichier = formData.get('image') as File

    if (!fichier) {
      return NextResponse.json({ error: 'Aucune image fournie' }, { status: 400 })
    }

    const bytes = await fichier.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const donnees = await extraireDonneesCNI(base64, fichier.type)
    return NextResponse.json({ succes: true, donnees })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
