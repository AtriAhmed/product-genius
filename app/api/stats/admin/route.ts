import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for query parameters
const querySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).optional().default("30d"),
  timezone: z.string().optional().default("UTC"),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { period, timezone } = querySchema.parse({
      period: url.searchParams.get("period") || "30d",
      timezone: url.searchParams.get("timezone") || "UTC",
    });

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
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

    // General stats
    const [
      totalUsers,
      totalActiveUsers,
      totalProducts,
      totalActiveProducts,
      totalOrders,
      totalCategories,
      totalRevenue,
      totalPaidInvoices,
      totalSubscriptions,
      totalShopifyStores,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          subscriptions: {
            some: {
              status: { in: ["ACTIVE", "TRIALING"] },
            },
          },
        },
      }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.category.count(),
      prisma.invoice.aggregate({
        _sum: { amountCents: true },
        where: { status: "paid" },
      }),
      prisma.invoice.count({ where: { status: "paid" } }),
      prisma.subscription.count(),
      prisma.shopifyStore.count(),
    ]);

    // User growth over time (for line charts)
    const userGrowth = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // Process user growth data for charts
    const userGrowthChart = userGrowth.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Revenue over time (for line charts)
    const revenueGrowth = await prisma.invoice.groupBy({
      by: ["createdAt"],
      _sum: { amountCents: true },
      where: {
        status: "paid",
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    const revenueGrowthChart = revenueGrowth.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + (item._sum.amountCents || 0);
      return acc;
    }, {} as Record<string, number>);

    // Subscription status distribution (for pie charts)
    const subscriptionsByStatus = await prisma.subscription.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // User roles distribution (for pie charts)
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    });

    // Order status distribution (for pie charts)
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Top categories by product count (for bar charts)
    const topCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
        translations: {
          where: { locale: "en" },
          select: { title: true },
        },
      },
      orderBy: {
        products: { _count: "desc" },
      },
      take: 10,
    });

    // Monthly recurring revenue (MRR)
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ["ACTIVE", "TRIALING"] },
      },
      include: {
        plan: {
          include: {
            prices: true,
          },
        },
      },
    });

    const mrr = activeSubscriptions.reduce((total, subscription) => {
      const price = subscription.plan.prices.find((p) => p.interval === subscription.interval);
      if (price?.price && subscription.interval) {
        let monthlyPrice = price.price;

        // Convert to monthly
        switch (subscription.interval) {
          case "DAY":
            monthlyPrice *= 30;
            break;
          case "WEEK":
            monthlyPrice *= 4;
            break;
          case "YEAR":
            monthlyPrice /= 12;
            break;
          // MONTH is already monthly
        }

        return total + monthlyPrice;
      }
      return total;
    }, 0);

    // Recent activity
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const recentOrders = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        totalCents: true,
        currency: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Product performance
    const topProducts = await prisma.product.findMany({
      select: {
        id: true,
        views: true,
        likes: true,
        popularityScore: true,
        translations: {
          where: { locale: "en" },
          select: { title: true },
        },
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: {
        orderItems: { _count: "desc" },
      },
      take: 10,
    });

    // Plan popularity (for pie charts)
    const planPopularity = await prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            subscriptions: {
              where: {
                status: { in: ["ACTIVE", "TRIALING"] },
              },
            },
          },
        },
      },
      orderBy: {
        subscriptions: { _count: "desc" },
      },
    });

    // Average order value
    const avgOrderValue = await prisma.order.aggregate({
      _avg: { totalCents: true },
      where: {
        status: { in: ["PAID", "COMPLETED"] },
      },
    });

    // Conversion funnel
    const totalVisitors = totalUsers; // Assuming all users are visitors
    const subscribedUsers = await prisma.user.count({
      where: {
        subscriptions: {
          some: {},
        },
      },
    });

    const paidUsers = await prisma.user.count({
      where: {
        orders: {
          some: {
            status: { in: ["PAID", "COMPLETED"] },
          },
        },
      },
    });

    const response = {
      data: {
        // Overview metrics
        overview: {
          totalUsers,
          totalActiveUsers,
          totalProducts,
          totalActiveProducts,
          totalOrders,
          totalCategories,
          totalRevenue: (totalRevenue._sum.amountCents || 0) / 100,
          totalPaidInvoices,
          totalSubscriptions,
          totalShopifyStores,
          mrr: Math.round(mrr * 100) / 100,
          avgOrderValue: Math.round(((avgOrderValue._avg.totalCents || 0) / 100) * 100) / 100,
        },

        // Growth charts (line charts)
        growth: {
          users: userGrowthChart,
          revenue: Object.fromEntries(
            Object.entries(revenueGrowthChart).map(([date, cents]) => [date, Math.round((cents / 100) * 100) / 100])
          ),
        },

        // Distribution charts (pie charts)
        distributions: {
          subscriptionStatus: subscriptionsByStatus.map((item) => ({
            label: item.status,
            value: item._count.id,
          })),
          userRoles: usersByRole.map((item) => ({
            label: item.role,
            value: item._count.id,
          })),
          orderStatus: ordersByStatus.map((item) => ({
            label: item.status,
            value: item._count.id,
          })),
          planPopularity: planPopularity.map((item) => ({
            label: item.name,
            value: item._count.subscriptions,
          })),
        },

        // Bar charts
        topCategories: topCategories.map((category) => ({
          id: category.id,
          name: category.translations[0]?.title || `Category ${category.id}`,
          productCount: category._count.products,
        })),

        topProducts: topProducts.map((product) => ({
          id: product.id,
          name: product.translations[0]?.title || `Product ${product.id}`,
          views: product.views,
          likes: product.likes,
          orders: product._count.orderItems,
          popularityScore: product.popularityScore,
        })),

        // Conversion funnel
        funnel: {
          visitors: totalVisitors,
          subscribers: subscribedUsers,
          paidCustomers: paidUsers,
          conversionRate: {
            visitorToSubscriber: totalVisitors > 0 ? Math.round((subscribedUsers / totalVisitors) * 10000) / 100 : 0,
            subscriberToPaid: subscribedUsers > 0 ? Math.round((paidUsers / subscribedUsers) * 10000) / 100 : 0,
            overallConversion: totalVisitors > 0 ? Math.round((paidUsers / totalVisitors) * 10000) / 100 : 0,
          },
        },

        // Recent activity
        recent: {
          users: recentUsers,
          orders: recentOrders.map((order) => ({
            ...order,
            totalCents: order.totalCents / 100,
          })),
        },
      },
      total: 1,
      page: 1,
      limit: 1,
      pages: 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch admin statistics" }, { status: 500 });
  }
}
