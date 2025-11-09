import { PrismaClient } from "@/app/generated/prisma";
import { PlanPrice } from "@/types";

const prisma = new PrismaClient();

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
