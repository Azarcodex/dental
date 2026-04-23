import { PrismaClient } from "../prisma-client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("Checking appointments...");
  const apps = await prisma.appointment.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    select: {
        id: true,
        status: true,
        date: true,
        startTime: true,
        token: true,
        patient: { select: { fullName: true } }
    }
  });

  console.log(JSON.stringify(apps, null, 2));
  await prisma.$disconnect();
}

run().catch(console.error);
