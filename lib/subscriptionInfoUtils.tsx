import { prisma } from "@/lib/prisma";
import { User, UserSubscriptionInfo } from "@/types";

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
  };

  if (!user) {
    return response;
  }

  const subscription = user?.currentSubscription;
  const plan = subscription?.plan;

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const hasActiveSubscription = !!subscription;
  response.hasActiveSubscription = hasActiveSubscription;
  const isFreeTrial = !hasActiveSubscription && new Date(user?.createdAt || Infinity) > twoWeeksAgo;
  response.isFreeTrial = isFreeTrial;

  const canViewProducts = isFreeTrial || hasActiveSubscription;
  response.canViewProducts = canViewProducts;

  if (subscription && plan) {
    const importedProductsCount = await prisma.productMapping.count({
      where: { userId: user.id, createdAt: { gte: subscription?.startsAt || user?.createdAt } },
    });
    response.importedProductsCount = importedProductsCount;

    const importedProductsFeature = plan.features?.find((f) => f.key === "imported-products");
    const importedProductsLimit = importedProductsFeature?.value ? parseInt(importedProductsFeature.value, 10) : 10;
    response.importedProductsLimit = importedProductsLimit;
    // const importedProductsPercentage =
    //   importedProductsLimit === Infinity ? 0 : (importedProductsCount / importedProductsLimit) * 100;

    const canImportProducts = isFreeTrial || importedProductsCount < importedProductsLimit;
    response.canImportProducts = canImportProducts;
  }

  return response;
}
