import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@inchallah.ci" },
    update: {},
    create: {
      email: "admin@inchallah.ci",
      password: hashedPassword,
      nom: "Administrateur",
      prenom: "Principal",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
