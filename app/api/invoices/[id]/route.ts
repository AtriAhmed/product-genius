import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAuthenticatedServerSide } from "@/lib/authUtils";

const paramsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - allow ADMIN, OWNER, and USER (users can see their own invoices)
    const user = await isAuthenticatedServerSide(
      ["ADMIN", "OWNER", "USER"],
      true
    );
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validatedParams = paramsSchema.parse(params);
    const invoiceId = parseInt(validatedParams.id);

    // Build where clause
    const where: any = { id: invoiceId };

    // Regular users can only see their own invoices
    if (user.role === "USER") {
      where.userId = user.id;
    }

    const invoice = await prisma.invoice.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    sku: true,
                    translations: {
                      select: {
                        title: true,
                        locale: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid invoice ID", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only ADMIN and OWNER can delete invoices
    const user = await isAuthenticatedServerSide(["ADMIN", "OWNER"], true);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const validatedParams = paramsSchema.parse(params);
    const invoiceId = parseInt(validatedParams.id);

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        Order: true,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check if invoice has associated orders - prevent deletion if it does
    if (existingInvoice.Order && existingInvoice.Order.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete invoice with associated orders" },
        { status: 400 }
      );
    }

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({
      message: "Invoice deleted successfully",
      id: invoiceId,
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid invoice ID", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
