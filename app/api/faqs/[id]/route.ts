import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateFaqSchema = z.object({
  question: z.string().min(1, "Question is required").optional(),
  answer: z.string().min(1, "Answer is required").optional(),
  order: z.number().optional(),
});

export async function GET(request: NextRequest, ctx: RouteContext<"/api/faqs/[id]">) {
  try {
    const params = await ctx.params;
    const faqId = parseInt(params.id);

    if (isNaN(faqId)) {
      return NextResponse.json({ error: "Invalid FAQ ID" }, { status: 400 });
    }

    const faq = await prisma.fAQ.findUnique({
      where: { id: faqId },
    });

    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return NextResponse.json({ error: "Failed to fetch FAQ" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/faqs/[id]">) {
  try {
    const params = await ctx.params;
    const faqId = parseInt(params.id);

    if (isNaN(faqId)) {
      return NextResponse.json({ error: "Invalid FAQ ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = UpdateFaqSchema.parse(body);

    // Check if FAQ exists
    const existingFaq = await prisma.fAQ.findUnique({
      where: { id: faqId },
    });

    if (!existingFaq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    // Update FAQ
    const faq = await prisma.fAQ.update({
      where: { id: faqId },
      data: {
        ...(validatedData.question && { question: validatedData.question }),
        ...(validatedData.answer && { answer: validatedData.answer }),
        ...(validatedData.order !== undefined && { order: validatedData.order }),
      },
    });

    return NextResponse.json({ faq });
  } catch (error) {
    console.error("Error updating FAQ:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to update FAQ" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/faqs/[id]">) {
  try {
    const params = await ctx.params;
    const faqId = parseInt(params.id);

    if (isNaN(faqId)) {
      return NextResponse.json({ error: "Invalid FAQ ID" }, { status: 400 });
    }

    // Check if FAQ exists
    const existingFaq = await prisma.fAQ.findUnique({
      where: { id: faqId },
    });

    if (!existingFaq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await prisma.fAQ.delete({
      where: { id: faqId },
    });

    return NextResponse.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ" }, { status: 500 });
  }
}
