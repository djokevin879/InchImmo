"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enregistrerAction } from "@/lib/audit";
import { auth } from "@/auth";

export async function getAppartements() {
  return await prisma.appartement.findMany({
    include: {
      residence: true,
    },
    orderBy: { libelle: "asc" },
  });
}

export async function createAppartement(data: {
  libelle: string;
  nbrePieces: number;
  loyer: number;
  taux?: number;
  residenceId: string;
}) {
  const session = await auth();
  const a = await prisma.appartement.create({
    data: {
      libelle: data.libelle,
      nbrePieces: data.nbrePieces,
      loyer: data.loyer,
      taux: data.taux || 10,
      residenceId: data.residenceId,
      statut: "LIBRE",
    },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "CREATION",
      entite: "Appartement",
      entiteId: a.id,
      entiteNom: a.libelle,
    });
  }

  revalidatePath("/admin/appartements");
  return a;
}

export async function updateAppartement(id: string, data: {
  libelle: string;
  nbrePieces: number;
  loyer: number;
  taux?: number;
  residenceId: string;
}) {
  const session = await auth();
  const a = await prisma.appartement.update({
    where: { id },
    data: {
      libelle: data.libelle,
      nbrePieces: data.nbrePieces,
      loyer: data.loyer,
      taux: data.taux,
      residenceId: data.residenceId,
    },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "MODIFICATION",
      entite: "Appartement",
      entiteId: a.id,
      entiteNom: a.libelle,
    });
  }

  revalidatePath("/admin/appartements");
  return a;
}

export async function deleteAppartement(id: string) {
  const session = await auth();
  const a = await prisma.appartement.findUnique({ where: { id } });

  await prisma.appartement.delete({
    where: { id },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "SUPPRESSION",
      entite: "Appartement",
      entiteId: id,
      entiteNom: a?.libelle,
    });
  }

  revalidatePath("/admin/appartements");
}
