import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Validation schema for query parameters
const querySchema = z.object({
  period: z.enum(["1d", "7d", "30d", "90d", "1y", "all"]).optional().default("30d"),
  timezone: z.string().optional().default("UTC"),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const url = new URL(request.url);
    const { period, timezone } = querySchema.parse({
      period: url.searchParams.get("period") || "30d",
      timezone: url.searchParams.get("timezone") || "UTC",
    });

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "1d":
        startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date("2020-01-01"); // Very early date for "all"
    }

    // User-specific stats
    const [
      totalOrders,
      totalSpent,
      totalProducts,
      productMappings,
      variantMappings,
      shopifyStores,
      currentSubscription,
      notifications,
      recentOrders,
    ] = await Promise.all([
      // Total orders for this user
      prisma.order.count({
        where: {
          userId,
          ...(period !== "all" && { createdAt: { gte: startDate } }),
        },
      }),

      // Total amount spent
      prisma.order.aggregate({
        _sum: { totalCents: true },
        where: {
          userId,
          status: { in: ["PAID", "COMPLETED"] },
          ...(period !== "all" && { createdAt: { gte: startDate } }),
        },
      }),

      // Total products created by user
      prisma.product.count({
        where: {
          productMappings: {
            some: { userId },
          },
        },
      }),

      // Product mappings
      prisma.productMapping.count({
        where: { userId },
      }),

      // Variant mappings
      prisma.variantMapping.count({
        where: { userId },
      }),

      // Shopify stores
      prisma.shopifyStore.count({
        where: { userId },
      }),

      // Current subscription
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          currentSubscription: {
            include: {
              plan: {
                include: {
                  prices: true,
                },
              },
            },
          },
        },
      }),

      // Unread notifications
      prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      }),

      // Recent orders
      prisma.order.findMany({
        where: {
          userId,
          ...(period !== "all" && { createdAt: { gte: startDate } }),
        },
        include: {
          items: {
            select: {
              id: true,
              title: true,
              quantity: true,
              unitPriceCents: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Orders over time (for line charts)
    const orderGrowth = await prisma.order.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      _sum: { totalCents: true },
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // Process order growth data for charts
    const orderGrowthChart = orderGrowth.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + item._count.id;
      return acc;
    }, {} as Record<string, number>);

    const spendingGrowthChart = orderGrowth.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + (item._sum.totalCents || 0);
      return acc;
    }, {} as Record<string, number>);

    // Order status distribution (for pie charts)
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      where: {
        userId,
        ...(period !== "all" && { createdAt: { gte: startDate } }),
      },
    });

    // Monthly spending pattern
    const monthlySpending = await prisma.order.groupBy({
      by: ["createdAt"],
      _sum: { totalCents: true },
      where: {
        userId,
        status: { in: ["PAID", "COMPLETED"] },
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // Top ordered products for this user
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _count: { id: true },
      _sum: { quantity: true },
      where: {
        order: {
          userId,
          ...(period !== "all" && { createdAt: { gte: startDate } }),
        },
        productId: { not: null },
      },
      orderBy: {
        _sum: { quantity: "desc" },
      },
      take: 10,
    });

    // Get product details for top products
    const topProductDetails = await Promise.all(
      topProducts.map(async (item) => {
        if (!item.productId) return null;

        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            translations: {
              where: { locale: "en" },
              select: { title: true },
            },
            category: {
              include: {
                translations: {
                  where: { locale: "en" },
                  select: { title: true },
                },
              },
            },
          },
        });

        return {
          id: item.productId,
          name: product?.translations[0]?.title || `Product ${item.productId}`,
          category: product?.category?.translations[0]?.title || "Uncategorized",
          orderCount: item._count.id,
          totalQuantity: item._sum.quantity || 0,
        };
      })
    );

    // Calculate subscription value
    let subscriptionValue = 0;
    if (currentSubscription?.currentSubscription) {
      const sub = currentSubscription.currentSubscription;
      const price = sub.plan.prices.find((p) => p.interval === sub.interval);
      if (price?.price) {
        subscriptionValue = price.price;
      }
    }

    // Average order value for this user
    const avgOrderValue = totalOrders > 0 ? (totalSpent._sum.totalCents || 0) / totalOrders : 0;

    const response = {
      data: {
        // Overview metrics
        overview: {
          totalOrders,
          totalSpent: (totalSpent._sum.totalCents || 0) / 100,
          totalProducts,
          productMappings,
          variantMappings,
          shopifyStores,
          unreadNotifications: notifications,
          avgOrderValue: Math.round(avgOrderValue) / 100,
          subscriptionValue,
          subscriptionStatus: currentSubscription?.currentSubscription?.status || null,
          planName: currentSubscription?.currentSubscription?.plan?.name || null,
        },

        // Growth charts (line charts)
        growth: {
          orders: orderGrowthChart,
          spending: Object.fromEntries(
            Object.entries(spendingGrowthChart).map(([date, cents]) => [date, Math.round((cents / 100) * 100) / 100])
          ),
        },

        // Distribution charts (pie charts)
        distributions: {
          orderStatus: ordersByStatus.map((item) => ({
            label: item.status,
            value: item._count.id,
          })),
        },

        // Top products for this user
        topProducts: topProductDetails.filter(Boolean),

        // Recent activity
        recent: {
          orders: recentOrders.map((order) => ({
            ...order,
            totalCents: order.totalCents / 100,
            items: order.items,
          })),
        },

        // Subscription info
        subscription: currentSubscription?.currentSubscription
          ? {
              planName: currentSubscription.currentSubscription.plan.name,
              status: currentSubscription.currentSubscription.status,
              interval: currentSubscription.currentSubscription.interval,
              value: subscriptionValue,
              startsAt: currentSubscription.currentSubscription.startsAt,
              endsAt: currentSubscription.currentSubscription.endsAt,
              trialEndsAt: currentSubscription.currentSubscription.trialEndsAt,
              cancelAtPeriodEnd: currentSubscription.currentSubscription.cancelAtPeriodEnd,
            }
          : null,
      },
      total: 1,
      page: 1,
      limit: 1,
      pages: 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 });
  }
}
