import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcrypt";

type RouteContext<T> = {
  params: Promise<{ id: string }>;
};

// Validation schema for user updates
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["OWNER", "ADMIN", "EDITOR", "AGENT", "USER"]).optional(),
});

export async function GET(request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  const params = await ctx.params;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Check permissions - users can view their own profile, admins can view all
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    });

    const isOwnerOrAdmin = currentUser && ["OWNER", "ADMIN"].includes(currentUser.role);
    const isOwnProfile = parseInt(session.user.id) === userId;

    if (!isOwnerOrAdmin && !isOwnProfile) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        currentSubscription: {
          select: {
            id: true,
            status: true,
            startsAt: true,
            endsAt: true,
            plan: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
            startsAt: true,
            endsAt: true,
            plan: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalCents: true,
            currency: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  const params = await ctx.params;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    });

    const isOwnerOrAdmin = currentUser && ["OWNER", "ADMIN"].includes(currentUser.role);
    const isOwnProfile = parseInt(session.user.id) === userId;

    // Users can update their own profile (except role), admins can update all
    if (!isOwnerOrAdmin && !isOwnProfile) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent non-admins from changing roles
    if (validatedData.role && !isOwnerOrAdmin) {
      return NextResponse.json({ error: "Cannot change role" }, { status: 403 });
    }

    // Check email uniqueness if email is being updated
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
    }

    const updateData: any = {};

    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.role && isOwnerOrAdmin) updateData.role = validatedData.role;

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
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }

    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/users/[id]">) {
  const params = await ctx.params;

  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Only OWNER or ADMIN can delete users
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true },
    });

    if (!currentUser || !["OWNER", "ADMIN"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    // Prevent self-deletion
    if (parseInt(session.user.id) === userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User deletion error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
