const { PrismaClient } = require("./src/prisma-client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");
const bcrypt = require("bcryptjs");
require("dotenv").config();

neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.admin.findUnique({
    where: { username: "testadmin" }
  });

  if (existing) {
    console.log("Test admin already exists.");
  } else {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const admin = await prisma.admin.create({
      data: {
        username: "testadmin",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        name: "Test Admin",
      }
    });
    console.log("Test admin created successfully:", admin.username);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
