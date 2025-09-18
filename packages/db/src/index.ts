import { PrismaClient } from "../prisma/generated/prisma";

const prisma = new PrismaClient();

// export { prisma }
export default prisma;

export * from "../prisma/generated/prisma";
