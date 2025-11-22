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

async function main() {
  // Check if the free plan already exists
  let plan = await prisma.plan.findFirst({
    where: { isFree: true },
  });

  const intervals = ["DAY", "WEEK", "MONTH", "YEAR"] as const;

  const prices = intervals.map((interval) => ({
    interval: interval,
  }));

  if (!plan) {
    plan = await prisma.plan.create({
      data: {
        name: "Free Plan",
        description: "A free plan with limited features",
        isFree: true,
        mostPopular: false,
        features: [
          {
            key: "imported-products",
            value: "10",
            description: "Import 10 products to shopify",
            included: true,
            note: "",
          },
        ],
        prices: {
          create: prices,
        },
      },
    });
  }

  console.log("Seed completed: Free plan and pricing setup.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
