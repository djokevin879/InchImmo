import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function reset() {
  const email = "admin@inchallah.ci";
  const pass = "Admin@1234";
  const hashed = await bcrypt.hash(pass, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password: hashed, isActive: true },
    create: {
      email,
      password: hashed,
      nom: "Administrateur",
      prenom: "Principal",
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log("Admin user reset successful");
}

reset().finally(() => prisma.$disconnect());
