"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enregistrerAction } from "@/lib/audit";
import { auth } from "@/auth";

export async function getProprietaires() {
  return await prisma.proprietaire.findMany({
    include: {
      _count: {
        select: { residences: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProprietaire(data: {
  nom: string;
  telephone: string;
  ville: string;
  observation?: string;
}) {
  const session = await auth();
  const p = await prisma.proprietaire.create({
    data: {
      nom: data.nom,
      telephone: data.telephone,
      ville: data.ville,
      observation: data.observation,
    },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "CREATION",
      entite: "Propriétaire",
      entiteId: p.id,
      entiteNom: p.nom,
    });
  }

  revalidatePath("/admin/proprietaires");
  return p;
}

export async function updateProprietaire(id: string, data: {
  nom: string;
  telephone: string;
  ville: string;
  observation?: string;
}) {
  const session = await auth();
  const p = await prisma.proprietaire.update({
    where: { id },
    data: {
      nom: data.nom,
      telephone: data.telephone,
      ville: data.ville,
      observation: data.observation,
    },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "MODIFICATION",
      entite: "Propriétaire",
      entiteId: p.id,
      entiteNom: p.nom,
    });
  }

  revalidatePath("/admin/proprietaires");
  return p;
}

export async function deleteProprietaire(id: string) {
  const session = await auth();
  const p = await prisma.proprietaire.findUnique({ where: { id } });
  
  await prisma.proprietaire.delete({
    where: { id },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "SUPPRESSION",
      entite: "Propriétaire",
      entiteId: id,
      entiteNom: p?.nom,
    });
  }

  revalidatePath("/admin/proprietaires");
}
