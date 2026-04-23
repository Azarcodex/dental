import { PrismaClient } from "../prisma-client";
import { PrismaNeon } from "@prisma/adapter-neon";

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is missing. Please restart your dev server (pnpm dev) to load the .env file."
    );
  }

  // In Prisma 7, PrismaNeon is a factory that creates the Pool internally
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
