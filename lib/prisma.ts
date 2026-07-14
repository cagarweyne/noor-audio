// Prisma client singleton (mirrors the cilm template: custom generated output
// + Accelerate extension). Reused across hot reloads in dev.
import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaClientSingleton = () => new PrismaClient().$extends(withAccelerate());

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
