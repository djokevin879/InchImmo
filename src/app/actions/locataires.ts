"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enregistrerAction } from "@/lib/audit";
import { auth } from "@/auth";
import { calculerScoreRisque } from '@/lib/score-risque'

export async function getLocataires() {
  return await prisma.locataire.findMany({
    include: {
      appartement: {
        include: { 
          residence: {
            include: { proprietaire: true }
          } 
        }
      },
    },
    orderBy: { nom: "asc" },
  });
}

export async function createLocataire(data: any) {
  const session = await auth();
  const l = await prisma.$transaction(async (tx) => {
    const locataire = await tx.locataire.create({
      data: {
        nom: data.nom,
        fonction: data.fonction,
        typePiece: data.typePiece,
        numPiece: data.numPiece,
        nationalite: data.nationalite,
        telephone: data.telephone,
        loyer: data.loyer,
        arriere: data.arriere || 0,
        observation: data.observation,
        dateEntree: new Date(data.dateEntree),
        appartementId: data.appartementId,
        statut: "ACTIF",
      },
    });

    // Mark apartment as occupied
    await tx.appartement.update({
      where: { id: data.appartementId },
      data: { statut: "OCCUPE" },
    });

    return locataire;
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "CREATION",
      entite: "Locataire",
      entiteId: l.id,
      entiteNom: l.nom,
      details: `Appartement : ${data.appartementId}`,
    });
  }

  revalidatePath("/admin/locataires");
  revalidatePath("/admin/appartements");
  return l;
}

export async function updateLocataire(id: string, data: any) {
  const session = await auth();
  const l = await prisma.locataire.update({
    where: { id },
    data: {
      nom: data.nom,
      fonction: data.fonction,
      typePiece: data.typePiece,
      numPiece: data.numPiece,
      nationalite: data.nationalite,
      telephone: data.telephone,
      loyer: data.loyer,
      arriere: data.arriere,
      observation: data.observation,
      dateEntree: new Date(data.dateEntree),
      appartementId: data.appartementId,
    },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "MODIFICATION",
      entite: "Locataire",
      entiteId: l.id,
      entiteNom: l.nom,
    });
  }

  revalidatePath("/admin/locataires");
  return l;
}

export async function marquerCommeParti(id: string, motif: string) {
  const session = await auth();
  const l = await prisma.$transaction(async (tx) => {
    const locataire = await tx.locataire.update({
      where: { id },
      data: {
        statut: "PARTI",
        dateDepart: new Date(),
        motifDepart: motif,
      },
    });

    // Libérer l'appartement
    await tx.appartement.update({
      where: { id: locataire.appartementId },
      data: { statut: "LIBRE" },
    });
    
    return locataire;
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "LOCATAIRE_PARTI",
      entite: "Locataire",
      entiteId: id,
      entiteNom: (l as any).nom,
      details: `Motif : ${motif}`,
    });
  }

  revalidatePath("/admin/locataires");
  revalidatePath("/admin/appartements");
}

export async function getScoreRisqueLocataire(locataireId: string) {
  return await calculerScoreRisque(locataireId)
}
