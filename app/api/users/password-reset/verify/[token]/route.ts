import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const verifySchema = z.object({
  password: z.string().min(8),
});

export async function POST(request: NextRequest, ctx: RouteContext<"/api/users/password-reset/verify/[token]">) {
  const params = await ctx.params;
  try {
    const { token } = params;
    const body = await request.json();
    const { password } = verifySchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }

    console.error("Password reset verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
