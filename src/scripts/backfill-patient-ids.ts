import { PrismaClient } from "../prisma-client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing in .env file.");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function backfill() {
  console.log("Starting backfill...");
  const patients = await prisma.patient.findMany({
    where: { displayId: null },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${patients.length} patients without displayId.`);

  let lastPatient = await prisma.patient.findFirst({
    where: { displayId: { startsWith: "P-", not: null } },
    orderBy: { displayId: "desc" },
  });

  let currentNum = lastPatient 
    ? parseInt((lastPatient.displayId as string).replace("P-", "")) 
    : 0;

  for (const patient of patients) {
    currentNum++;
    const nextId = `P-${currentNum.toString().padStart(3, "0")}`;
    await prisma.patient.update({
      where: { id: patient.id },
      data: { displayId: nextId },
    });
    console.log(`Updated ${patient.fullName} -> ${nextId}`);
  }

  console.log("Backfill complete.");
}

backfill()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
