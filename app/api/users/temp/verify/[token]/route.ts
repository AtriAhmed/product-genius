import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

interface Params {
  token: string;
}

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/users/temp/verify/[token]">
) {
  try {
    const params = await ctx.params;
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find the temp account with the provided token
    const tempAccount = await prisma.tempAccount.findUnique({
      where: { token },
    });

    if (!tempAccount) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 404 }
      );
    }

    // Check if the token has expired
    if (new Date() > tempAccount.expiresAt) {
      // Delete the expired temp account
      await prisma.tempAccount.delete({
        where: { id: tempAccount.id },
      });

      return NextResponse.json(
        { error: "Verification token has expired. Please register again." },
        { status: 410 }
      );
    }

    // Check if user already exists (edge case)
    const existingUser = await prisma.user.findUnique({
      where: { email: tempAccount.email },
    });

    if (existingUser) {
      // Delete the temp account since user already exists
      await prisma.tempAccount.delete({
        where: { id: tempAccount.id },
      });

      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create the user account first
    const user = await prisma.user.create({
      data: {
        name: tempAccount.name,
        email: tempAccount.email,
        passwordHash: tempAccount.passwordHash,
        role: "USER",
      },
    });

    try {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id.toString(),
        },
      });

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customer.id,
        },
      });
    } catch (stripeError) {
      console.error("Error creating Stripe customer:", stripeError);
      // User is already created, so we log the error but don't fail the verification
      // The customer can be created later when they try to subscribe
    }

    // Delete the temp account after successful user creation
    await prisma.tempAccount.delete({
      where: { id: tempAccount.id },
    });

    // Redirect to a success page or login page
    const successUrl = `${
      process.env.NEXT_PUBLIC_APP_URL
    }/auth/login?verified=true&email=${encodeURIComponent(user.email)}`;

    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("Error verifying temp account:", error);

    // Redirect to an error page instead of returning JSON for GET requests
    const errorUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login?error=verification_failed`;
    return NextResponse.redirect(errorUrl);
  }
}
