import { generateVariants } from "@/lib/variant-generator";
import { NextResponse } from "next/server";

export async function GET() {
  const options = [
    { name: "Size", values: ["Small", "Medium", "Large"] },
    { name: "Color", values: ["Red", "Blue"] },
  ];

  const variants = generateVariants(options, "29.99");

  return NextResponse.json({ variants });
}
