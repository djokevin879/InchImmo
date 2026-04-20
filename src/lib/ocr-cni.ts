import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! })

export interface DonneesCNI {
  nom: string
  prenom: string
  nomComplet: string
  dateNaissance: string
  nationalite: string
  numeroCNI: string
  lieuNaissance: string
  dateExpiration: string
  sexe: string
  confidence: number
}

export async function extraireDonneesCNI(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<DonneesCNI> {

  const prompt = `
Tu es un expert en lecture de documents d'identité d'Afrique de l'Ouest,
notamment de Côte d'Ivoire.

Analyse cette image de carte d'identité (CNI, passeport ou titre de séjour)
et extrait toutes les informations visibles.

Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "nom": "NOM DE FAMILLE en majuscules",
  "prenom": "Prénom(s)",
  "nomComplet": "NOM Prénom complet",
  "dateNaissance": "JJ/MM/AAAA",
  "nationalite": "Nationalité",
  "numeroCNI": "Numéro de la pièce",
  "lieuNaissance": "Lieu de naissance",
  "dateExpiration": "JJ/MM/AAAA ou vide si non visible",
  "sexe": "M ou F",
  "confidence": nombre entre 0 et 100 indiquant ta confiance dans la lecture
}

Si une information n'est pas visible ou lisible, mets une chaîne vide "".
Ne jamais inventer des données. Uniquement ce qui est visible sur le document.
`

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        }
      },
      { text: prompt }
    ]
  })

  const text = response.text.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Impossible de lire le document')

  return JSON.parse(jsonMatch[0]) as DonneesCNI
}
