import prisma from "./src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function testAuth() {
  const email = "admin@inchallah.ci";
  const password = "Admin@1234";

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User not found in DB");
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  console.log("Password correct:", isPasswordCorrect);
  console.log("User active:", user.isActive);
}

testAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
