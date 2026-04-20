"use client";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

export async function getGeminiAdvice(stats: any) {
  try {
    const prompt = `
      Tu es un expert en gestion immobilière à Bouaké, Côte d'Ivoire.
      Voici les statistiques actuelles de l'agence "INCH'ALLAH IMMOBILIER" :
      - Nombre de résidences : ${stats.totalResidences}
      - Nombre d'appartements : ${stats.totalAppartements} (Occupés: ${stats.occupiedAppartements})
      - Locataires actifs : ${stats.totalLocataires}
      - Recettes du mois : ${stats.totalPaiementsMois} FCFA
      - Locataires avec arriérés : ${stats.locatairesArrieres}

      Analyse brièvement ces chiffres et donne 3 conseils stratégiques courts pour l'administrateur.
      Réponds en français, avec un ton professionnel et encourageant.
      Format: JSON { "summary": "...", "advices": ["...", "...", "..."] }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}

export async function verifyLocalization(quartier: string, ville: string) {
  try {
    const prompt = `Vérifie la localisation du quartier "${quartier}" à "${ville}", Côte d'Ivoire. Donne-moi une description brève de la zone et confirme s'il s'agit d'une zone résidentielle ou commerciale.`;
    
    // Using grounding if possible, but avoiding type error if 'tools' is not recognized directly
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      tools: [{ googleSearch: {} }],
    } as any);

    return response.text;
  } catch (error) {
    console.error("Gemini Grounding Error:", error);
    return "Désolé, impossible de vérifier la localisation pour le moment.";
  }
}
