"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { enregistrerAction } from "@/lib/audit";
import { auth } from "@/auth";

export async function getResidences() {
  return await prisma.residence.findMany({
    include: {
      proprietaire: true,
      agent: true,
      _count: {
        select: { appartements: true },
      },
    },
    orderBy: { quartier: "asc" },
  });
}

export async function createResidence(data: {
  quartier: string;
  ville: string;
  ilot?: string;
  localisation?: string;
  observation?: string;
  proprietaireId: string;
  agentId?: string;
}) {
  const session = await auth();
  const r = await prisma.residence.create({
    data: {
      quartier: data.quartier,
      ville: data.ville || "BOUAKE",
      ilot: data.ilot,
      localisation: data.localisation,
      observation: data.observation,
      proprietaireId: data.proprietaireId,
      agentId: data.agentId,
    },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "CREATION",
      entite: "Résidence",
      entiteId: r.id,
      entiteNom: `${r.quartier} - ${r.ville}`,
    });
  }

  revalidatePath("/admin/residences");
  return r;
}

export async function updateResidence(id: string, data: {
  quartier: string;
  ville: string;
  ilot?: string;
  localisation?: string;
  observation?: string;
  proprietaireId: string;
  agentId?: string;
}) {
  const session = await auth();
  const r = await prisma.residence.update({
    where: { id },
    data: {
      quartier: data.quartier,
      ville: data.ville,
      ilot: data.ilot,
      localisation: data.localisation,
      observation: data.observation,
      proprietaireId: data.proprietaireId,
      agentId: data.agentId || null,
    },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "MODIFICATION",
      entite: "Résidence",
      entiteId: r.id,
      entiteNom: `${r.quartier} - ${r.ville}`,
    });
  }

  revalidatePath("/admin/residences");
  return r;
}

export async function deleteResidence(id: string) {
  const session = await auth();
  const r = await prisma.residence.findUnique({ where: { id } });

  await prisma.residence.delete({
    where: { id },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "SUPPRESSION",
      entite: "Résidence",
      entiteId: id,
      entiteNom: r ? `${r.quartier} - ${r.ville}` : undefined,
    });
  }

  revalidatePath("/admin/residences");
}

export async function getAgents() {
  return await prisma.user.findMany({
    where: { role: "AGENT", isActive: true },
    select: { id: true, nom: true, prenom: true },
  });
}
