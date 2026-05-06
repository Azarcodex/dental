const { PrismaClient } = require("./src/prisma-client");
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany({
    select: { id: true, name: true, username: true, role: true }
  });
  console.log(JSON.stringify(admins, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
