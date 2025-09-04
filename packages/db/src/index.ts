import { PrismaClient } from "../generated/prisma/index"

const prisma = new PrismaClient();

export { prisma }
export default prisma