import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "winwaterfall",
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });

const email = "agent@gmail.com";
const name = "Agent";
const password = "password";
const role = Role.AGENT;

async function main() {
  console.log("🌱 Starting seed...");

  // Create a user
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      passwordHash: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("🎉 Seed completed successfully!");

  console.log("\n📋 Summary:");
  console.log(`- User: ${user.email} (password: password)`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
