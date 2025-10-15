import PlanForm from "@/app/[locale]/admin/plans/PlanForm";
import { Plan } from "@/types";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

async function getPlan(id: number): Promise<Plan | null> {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      return null;
    }

    // Transform the plan to match the Plan type
    return {
      ...plan,
      features: plan.features as any, // JSON type from Prisma
    } as Plan;
  } catch (error) {
    console.error("Failed to fetch plan:", error);
    return null;
  }
}

export default async function EditPlanPage({ params }: Props) {
  const { id } = await params;

  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Check user role (ADMIN or OWNER only)
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { role: true },
  });

  if (!user || !["ADMIN", "OWNER"].includes(user.role)) {
    redirect("/");
  }

  const planId = parseInt(id);
  if (isNaN(planId)) {
    notFound();
  }

  const plan = await getPlan(planId);

  if (!plan) {
    notFound();
  }

  return <PlanForm plan={plan} mode="edit" />;
}
