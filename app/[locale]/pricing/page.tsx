import Footer from "@/app/[locale]/Footer";
import FAQSection from "@/app/[locale]/pricing/FAQSection";
import Plans from "@/app/[locale]/pricing/Plans";
import { prisma } from "@/lib/prisma";
import { Plan } from "@/types";

async function getPlans() {
  try {
    const sortOrder = "asc";
    const page = 1;
    const limit = 100;

    // Build where clause
    const where: any = {};

    // Build orderBy clause
    const orderBy: any = { sortOrder: sortOrder };

    where.active = true;

    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        include: {
          prices: true,
          _count: {
            select: {
              subscriptions: true,
              products: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.plan.count({ where }),
    ]);

    return plans;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function page() {
  const plans = await getPlans();
  return (
    <div>
      <Plans plans={plans as Plan[]} />
      <FAQSection />
      <Footer />
    </div>
  );
}
