import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { readFileSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Validation schema for the request body
const createTempAccountSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Generate a random token
function generateToken(): string {
  return uuidv4().toString().replace(/-/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = createTempAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Check if temp account already exists for this email
    const existingTempAccount = await prisma.tempAccount.findUnique({
      where: { email },
    });

    if (existingTempAccount) {
      // Delete the existing temp account to create a new one
      await prisma.tempAccount.delete({
        where: { email },
      });
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const token = generateToken();

    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create temp account
    const tempAccount = await prisma.tempAccount.create({
      data: {
        email,
        passwordHash,
        token,
        expiresAt,
        attempts: 0,
      },
    });

    // Load email template
    const templatePath = join(
      process.cwd(),
      "email-templates",
      "verification.html"
    );
    const emailTemplate = readFileSync(templatePath, "utf-8");
    console.log("-------------------- emailTemplate --------------------");
    console.log(emailTemplate);

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token, emailTemplate);

    if (!emailSent) {
      // If email fails, delete the temp account and return error
      await prisma.tempAccount.delete({
        where: { id: tempAccount.id },
      });

      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Verification email sent successfully. Please check your inbox.",
        email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating temp account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
