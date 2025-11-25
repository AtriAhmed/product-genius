import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  order: z.number().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "order";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [{ question: { contains: search } }, { answer: { contains: search } }];
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sortBy) {
      case "question":
        orderBy = { question: sortOrder };
        break;
      case "createdAt":
        orderBy = { createdAt: sortOrder };
        break;
      case "order":
      default:
        orderBy = { order: sortOrder };
        break;
    }

    const skip = (page - 1) * limit;

    const [faqs, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.fAQ.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      data: faqs,
      total,
      page,
      limit,
      pages,
    });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateFaqSchema.parse(body);

    const faq = await prisma.fAQ.create({
      data: {
        question: validatedData.question,
        answer: validatedData.answer,
        order: validatedData.order,
      },
    });

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
  }
}
