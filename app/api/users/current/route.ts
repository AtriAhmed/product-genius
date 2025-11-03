import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";
import { isAuthenticatedServerSide } from "@/lib/authUtilsServer";

// Validation schema for profile updates
const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await isAuthenticatedServerSide([], false);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(currentUser.id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        currentSubscription: {
          select: {
            id: true,
            status: true,
            startsAt: true,
            endsAt: true,
            trialEndsAt: true,
            cancelAtPeriodEnd: true,
            plan: {
              select: {
                id: true,
                name: true,
                price: true,
                interval: true,
                features: true,
              },
            },
          },
        },
        shopifyStores: {
          select: {
            id: true,
            shop: true,
            name: true,
            createdAt: true,
          },
        },
        // orders: {
        //   select: {
        //     id: true,
        //     orderNumber: true,
        //     status: true,
        //     totalCents: true,
        //     currency: true,
        //     createdAt: true,
        //   },
        //   orderBy: {
        //     createdAt: "desc",
        //   },
        //   take: 5,
        // },
        // agentProfile: {
        //   select: {
        //     id: true,
        //     companyName: true,
        //     contactNumber: true,
        //     details: true,
        //   },
        // },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Current user fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const userId = parseInt(session.user.id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check email uniqueness if email is being updated
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.name) updateData.name = validatedData.name;

    // Hash password if provided
    if (validatedData.password) {
      updateData.passwordHash = await bcrypt.hash(validatedData.password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
