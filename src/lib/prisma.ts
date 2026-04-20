import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

let prisma: ReturnType<typeof prismaClientSingleton> | undefined;

export const getPrisma = () => {
  if (!prisma) {
    prisma = globalThis.prisma ?? prismaClientSingleton();
    if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
  }
  return prisma;
};

export default getPrisma();
