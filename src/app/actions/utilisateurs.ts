"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { enregistrerAction } from "@/lib/audit";
import { auth } from "@/auth";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(data: any) {
  const session = await auth();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error("Cet email est déjà utilisé par un autre utilisateur.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.create({
    data: {
      nom: data.nom,
      prenom: data.prenom,
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role as Role,
      isActive: true,
    },
  });
  
  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "CREATION",
      entite: "Utilisateur",
      entiteId: user.id,
      entiteNom: `${user.prenom} ${user.nom}`,
    });
  }

  revalidatePath("/admin/utilisateurs");
  return user;
}

export async function updateUser(id: string, data: any) {
  const session = await auth();
  const normalizedEmail = data.email.trim().toLowerCase();

  // Check if email is being changed and if it already exists for another user
  const existingUser = await prisma.user.findFirst({
    where: {
      email: normalizedEmail,
      id: { not: id },
    },
  });

  if (existingUser) {
    throw new Error("Cet email est déjà utilisé par un autre utilisateur.");
  }

  const updateData: any = {
    nom: data.nom,
    prenom: data.prenom,
    email: normalizedEmail,
    role: data.role as Role,
    isActive: data.isActive,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });
  
  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "MODIFICATION",
      entite: "Utilisateur",
      entiteId: user.id,
      entiteNom: `${user.prenom} ${user.nom}`,
    });
  }

  revalidatePath("/admin/utilisateurs");
  return user;
}

export async function deleteUser(id: string) {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id } });

  // Prevent deleting self? (maybe handle in UI)
  await prisma.user.delete({
    where: { id },
  });

  if (session?.user?.id) {
    await enregistrerAction({
      userId: session.user.id,
      action: "SUPPRESSION",
      entite: "Utilisateur",
      entiteId: id,
      entiteNom: user ? `${user.prenom} ${user.nom}` : undefined,
    });
  }

  revalidatePath("/admin/utilisateurs");
}
