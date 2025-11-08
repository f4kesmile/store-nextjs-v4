// src/app/api/products/[id]/variants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { variants } = body;

    // Delete all existing variants
    await prisma.variant.deleteMany({
      where: { productId: parseInt(params.id) },
    });

    // Create new variants
    if (variants && variants.length > 0) {
      await prisma.variant.createMany({
        data: variants.map((v: any) => ({
          productId: parseInt(params.id),
          name: v.name,
          value: v.value,
          stock: v.stock,
          // [FIX] Tambahkan field 'price' di sini
          price: v.price ? parseFloat(String(v.price)) : null,
          // [FITUR] Tambahkan field 'status' (untuk Fitur #3)
          status: v.status || "ACTIVE",
        })),
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: { variants: true },
    });

    await logActivity(
      parseInt(session.user.id),
      `Updated variants for product: ${product?.name}`
    );

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to update variants" },
      { status: 500 }
    );
  }
}