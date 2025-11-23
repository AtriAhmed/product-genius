import { prisma } from "@/lib/prisma";
import { Plan, User, UserSubscriptionInfo } from "@/types";

export async function getUserSubscriptionInfo(userId: number) {
  const user: User | null = (await prisma.user.findUnique({
    where: { id: userId },
    include: {
      currentSubscription: {
        include: {
          plan: true,
        },
      },
    },
  })) as User;

  const response: UserSubscriptionInfo = {
    hasActiveSubscription: !!user?.currentSubscription,
    isFreeTrial: false,
    canViewProducts: false,
    canImportProducts: false,
    importedProductsCount: 0,
    importedProductsLimit: 0,
  };

  if (!user) {
    return response;
  }

  const subscription = user?.currentSubscription;
  let plan = subscription?.plan;

  if (!plan) {
    plan = (await prisma.plan.findFirst({
      where: { isFree: true },
    })) as Plan;
  }

  response.plan = plan;

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const hasActiveSubscription = !!subscription;
  response.hasActiveSubscription = hasActiveSubscription;
  const isFreeTrial = !hasActiveSubscription && new Date(user?.createdAt || Infinity) > twoWeeksAgo;
  response.isFreeTrial = isFreeTrial;

  const canViewProducts = isFreeTrial || hasActiveSubscription;
  response.canViewProducts = canViewProducts;

  const importedProductsCount = await prisma.productMapping.count({
    where: { userId: user.id, createdAt: { gte: subscription?.startsAt || user?.createdAt } },
  });
  response.importedProductsCount = importedProductsCount;

  const importedProductsFeature = plan.features?.find((f) => f.key === "imported-products");
  const importedProductsLimit =
    hasActiveSubscription || isFreeTrial ? parseInt(importedProductsFeature?.value ?? "0") : importedProductsCount;
  response.importedProductsLimit = importedProductsLimit;
  // const importedProductsPercentage =
  //   importedProductsLimit === Infinity ? 0 : (importedProductsCount / importedProductsLimit) * 100;

  const canImportProducts = isFreeTrial || importedProductsCount < importedProductsLimit;
  response.canImportProducts = canImportProducts;

  return response;
}
