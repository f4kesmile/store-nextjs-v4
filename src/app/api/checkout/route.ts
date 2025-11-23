// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { items, productId, variantId, quantity, notes, resellerId, customerInfo } = body;
    
    if (!items || !Array.isArray(items)) {
      if (productId && quantity) {
        items = [{
          productId,
          variantId,
          quantity,
          notes
        }];
      } else {
        // Jika items tidak ada DAN productId tidak ada -> Error
        return NextResponse.json(
          { error: "Data pesanan tidak valid (Items missing)" },
          { status: 400 }
        );
      }
    }

    const { name: customerName, phone: customerPhone } = customerInfo || {};

    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const orderId = `ORDR-${dateCode}-${uniqueSuffix}`;

    // 1. Cek & Ambil Data Reseller (Cukup sekali)
    const settings = await prisma.siteSettings.findFirst();
    let whatsappNumber = settings?.supportWhatsApp || "6285185031023";
    let resellerName = settings?.storeName || "Official Store";
    let resellerRecord = null;
    let finalResellerDbId: number | null = null;

    if (resellerId) {
      resellerRecord = await prisma.reseller.findUnique({
        where: { uniqueId: resellerId },
      });

      if (resellerRecord) {
        whatsappNumber = resellerRecord.whatsappNumber;
        resellerName = resellerRecord.name;
        finalResellerDbId = resellerRecord.id;
      }
    }

    // Persiapan Pesan WhatsApp Header
    const now = new Date();
    const orderDate = now.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Jakarta", });
    const orderTime = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta", });

    let message = `Halo ${resellerName}! 👋\n\n`;
    message += `Pesanan Baru #${orderId}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📅 Tanggal: ${orderDate}\n`;
    message += `⏰ Waktu: ${orderTime} WIB\n`;
    message += `👤 Nama: ${customerName || "-"}\n`;
    message += `📞 No. HP: ${customerPhone || "-"}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Detail Pesanan:\n`;

    let grandTotal = 0;
    const transactionIds = [];

    // 2. Loop Items untuk Validasi, Simpan DB, dan Susun Pesan
    // Kita gunakan Prisma Transaction agar jika satu gagal, semua batal (opsional tapi disarankan)
    // Namun untuk simplifikasi logika pesan, kita loop manual dulu.

    for (const item of items) {
        const { productId, variantId, quantity, notes } = item;

        // Ambil data produk
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { variants: true },
        });

        if (!product || product.status !== "ACTIVE") {
            return NextResponse.json({ error: `Produk ID ${productId} tidak tersedia` }, { status: 400 });
        }

        let unitPrice = parseFloat(product.price.toString());
        let variantInfo = "-";
        let selectedVariant = null;

        // Cek Varian
        if (variantId) {
            selectedVariant = product.variants.find((v) => v.id === variantId);
            if (selectedVariant) {
                 if (selectedVariant.status !== "ACTIVE") {
                    return NextResponse.json({ error: `Varian ${selectedVariant.name} tidak tersedia` }, { status: 400 });
                 }
                 if (selectedVariant.stock < quantity) {
                    return NextResponse.json({ error: `Stok varian ${selectedVariant.value} tidak cukup` }, { status: 400 });
                 }
                 
                 variantInfo = `${selectedVariant.name}: ${selectedVariant.value}`;
                 if (selectedVariant.price != null) {
                    unitPrice = parseFloat(selectedVariant.price.toString());
                 }
            }
        } else {
             // Cek Stok Produk Utama
             if (product.stock < quantity) {
                return NextResponse.json({ error: `Stok produk ${product.name} tidak cukup` }, { status: 400 });
             }
        }

        const itemTotalPrice = unitPrice * quantity;
        grandTotal += itemTotalPrice;

        // --- SIMPAN KE DATABASE (Satu per satu sesuai schema) ---
        const transaction = await prisma.transaction.create({
            data: {
                orderId: orderId,
                productId: product.id,
                variantId: selectedVariant?.id || null,
                resellerId: finalResellerDbId,
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                quantity,
                totalPrice: itemTotalPrice,
                status: "PENDING",
                notes: notes || null,
            },
        });
        
        transactionIds.push(transaction.id);

        // --- UPDATE STOK ---
        if (variantId && selectedVariant) {
            await prisma.variant.update({
                where: { id: selectedVariant.id },
                data: { stock: selectedVariant.stock - quantity },
            });
        } else {
            await prisma.product.update({
                where: { id: product.id },
                data: { stock: product.stock - quantity },
            });
        }

        // --- SUSUN PESAN PER ITEM ---
        message += `📦 ${product.name}\n`;
        if (variantInfo !== "-") message += `   🎨 Varian: ${variantInfo}\n`;
        message += `   🔢 Qty: ${quantity} x Rp ${unitPrice.toLocaleString("id-ID")}\n`;
        if (notes) message += `   📝 Catatan: ${notes}\n`;
        message += `   💵 Subtotal: Rp ${itemTotalPrice.toLocaleString("id-ID")}\n`;
        message += `   🆔 Ref Transaksi: #${transaction.id}\n`; // Karena DB pisah, ID transaksi tetap pisah
        message += `-----------------------------\n`;
    }

    // 3. Finalisasi Pesan
    message += `\n💰 TOTAL PEMBAYARAN: Rp ${grandTotal.toLocaleString("id-ID")}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Mohon diproses ya. Terima kasih! 🙏`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({
      whatsappUrl,
      transactionIds,
      resellerName,
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}