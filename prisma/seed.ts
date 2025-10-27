import bcrypt from "bcrypt";
import { PrismaClient, Role } from "../app/generated/prisma";

const prisma = new PrismaClient();

const email = "editor@gmail.com";
const name = "Atri Omar";
const password = "password";
const role = Role.USER;

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
