// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { items, productId, variantId, quantity, notes, resellerId, customerInfo } = body;

    // Normalisasi input
    if (!items || !Array.isArray(items)) {
      if (productId && quantity) {
        items = [{ productId, variantId, quantity, notes }];
      } else {
        return NextResponse.json({ error: "Data pesanan tidak valid" }, { status: 400 });
      }
    }

    const { name: customerName, phone: customerPhone } = customerInfo || {};

    // Buat ID Unik
    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const orderId = `ORDER-${dateCode}-${uniqueSuffix}`;

    // Ambil Data Reseller
    const settings = await prisma.siteSettings.findFirst();
    let whatsappNumber = settings?.supportWhatsApp || "6285185031023";
    let resellerName = settings?.storeName || "Official Store";
    let resellerRecord = null;
    let finalResellerDbId = null;

    if (resellerId) {
      resellerRecord = await prisma.reseller.findUnique({ where: { uniqueId: resellerId } });
      if (resellerRecord) {
        whatsappNumber = resellerRecord.whatsappNumber;
        resellerName = resellerRecord.name;
        finalResellerDbId = resellerRecord.id;
      }
    }

    // === FORMAT PESAN: CLEAN TEXT (TANPA EMOJI) ===
    const now = new Date();
    const orderDate = now.toLocaleDateString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Jakarta",
    });
    const orderTime = now.toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta",
    });

    let message = `Halo *${resellerName}*,\n`;
    message += `Mohon proses pesanan baru berikut ini:\n\n`;

    message += `===========================\n`;
    message += `*DETAIL ORDER*\n`;
    message += `===========================\n`;
    message += `ID    : *${orderId}*\n`;
    message += `Waktu : ${orderDate}, ${orderTime}\n\n`;

    message += `*DATA PEMBELI*\n`;
    message += `Nama  : ${customerName || "-"}\n`;
    message += `No. HP: ${customerPhone || "-"}\n\n`;

    message += `===========================\n`;
    message += `*DAFTAR BELANJA*\n`;
    message += `===========================\n`;

    let grandTotal = 0;
    const createdTransactionIds = [];

    for (const item of items) {
        const { productId, variantId, quantity, notes } = item;

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true },
        });

        if (!product) continue;

        let unitPrice = parseFloat(product.price.toString());
        let variantInfo = "-";
        let selectedVariant = null;

        if (variantId) {
            selectedVariant = product.variants.find((v) => v.id === variantId);
            if (selectedVariant) {
                variantInfo = `${selectedVariant.name}: ${selectedVariant.value}`;
                if (selectedVariant.price != null) unitPrice = parseFloat(selectedVariant.price.toString());
                
                await prisma.variant.update({
                    where: { id: selectedVariant.id },
                    data: { stock: selectedVariant.stock - quantity }
                });
            }
        } else {
             await prisma.product.update({
                where: { id: product.id },
                data: { stock: product.stock - quantity }
            });
        }

        const subTotal = unitPrice * quantity;
        grandTotal += subTotal;

        const trx = await prisma.transaction.create({
            data: {
                orderId, productId: product.id, variantId: selectedVariant?.id || null, resellerId: finalResellerDbId,
                customerName, customerPhone, quantity, totalPrice: subTotal, status: "PENDING", notes: notes || null,
            },
        });
        createdTransactionIds.push(trx.id);

        // --- Layout Produk Rapi ---
        message += `*${product.name}*\n`;
        if (variantInfo !== "-") message += `  > Varian : ${variantInfo}\n`;
        message += `  > Qty    : ${quantity} x Rp ${unitPrice.toLocaleString("id-ID")}\n`;
        message += `  > Total  : Rp ${subTotal.toLocaleString("id-ID")}\n`;
        if (notes) message += `  > Catatan: _${notes}_\n`;
        message += `\n`;
    }

    message += `----------------------------\n`;
    message += `*TOTAL BAYAR: Rp ${grandTotal.toLocaleString("id-ID")}*\n`;
    message += `----------------------------\n\n`;
    message += `Terima kasih!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ whatsappUrl });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}