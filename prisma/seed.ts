import {
  PrismaClient,
  Role,
  SubscriptionStatus,
  MediaType,
} from "../app/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create a user
  const hashedPassword = await bcrypt.hash("password", 10);

  const user = await prisma.user.upsert({
    where: { email: "atriahmed.1999@gmail.com" },
    update: {},
    create: {
      email: "atriahmed.1999@gmail.com",
      name: "Ahmed Atri",
      passwordHash: hashedPassword,
      role: Role.OWNER,
    },
  });

  console.log("🎉 Seed completed successfully!");

  console.log("\n📋 Summary:");
  console.log(`- User: ${user.email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
