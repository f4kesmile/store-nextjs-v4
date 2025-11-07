// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, variantId, quantity, resellerId, customerInfo, notes } = body 

    const { name: customerName, phone: customerPhone } = customerInfo || {};

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check stock
    let availableStock = product.stock
    let variantInfo = 'Standard'
    let selectedVariant = null
    
    // --- LOGIKA HARGA & STOK DIPERBARUI ---
    let unitPrice = parseFloat(product.price.toString()) // Harga default

    if (variantId) {
      selectedVariant = product.variants.find((v) => v.id === variantId)
      if (selectedVariant) {
        availableStock = selectedVariant.stock
        variantInfo = `${selectedVariant.name}: ${selectedVariant.value}`
        // Gunakan harga varian JIKA ADA, jika tidak, pakai harga produk
        if (selectedVariant.price != null) {
          unitPrice = parseFloat(selectedVariant.price.toString())
        }
      }
    }
    // ------------------------------------

    // Validate stock
    if (availableStock < quantity) {
      return NextResponse.json(
        { error: 'Stok tidak mencukupi' },
        { status: 400 }
      )
    }

    // ... (Logika Reseller tetap sama) ...
    const settings = await prisma.siteSettings.findFirst()
    let whatsappNumber = settings?.supportWhatsApp || '6285185031023'
    let resellerName = settings?.storeName || 'Official Store'
    let resellerRecord = null
    let finalResellerDbId = null 

    if (resellerId) {
      resellerRecord = await prisma.reseller.findUnique({
        where: { uniqueId: resellerId }, 
      })

      if (resellerRecord) {
        whatsappNumber = resellerRecord.whatsappNumber
        resellerName = resellerRecord.name
        finalResellerDbId = resellerRecord.id 
      }
    }

    // --- KALKULASI TOTALPRICE DIPERBARUI ---
    const totalPrice = unitPrice * quantity
    // -------------------------------------

    // CREATE TRANSACTION RECORD
    const transaction = await prisma.transaction.create({
      data: {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        resellerId: finalResellerDbId, 
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        quantity,
        totalPrice, // Harga total yang sudah benar
        status: 'PENDING',
        notes: notes || null,
      },
    })
    
    // ... (Logika Update Stok tetap sama) ...
    if (variantId && selectedVariant) {
      await prisma.variant.update({
        where: { id: selectedVariant.id },
        data: { stock: selectedVariant.stock - quantity },
      })
    } else {
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - quantity },
      })
    }
    
    // ... (Logika Pesan WhatsApp tetap sama) ...
    const now = new Date()
    const orderDate = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const orderTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    let message = `Halo ${resellerName}! 👋\n\n`
    message += `Pesanan Baru:\n`
    message += `━━━━━━━━━━━━━━━━━━━━━\n`
    message += `🆔 Order ID: #${transaction.id}\n`
    message += `📅 Tanggal: ${orderDate}\n`
    message += `⏰ Waktu: ${orderTime} WIB\n`
    message += `👤 Nama Customer: ${customerName || '-'}\n`
    message += `📞 Telepon Customer: ${customerPhone || '-'}\n`
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`
    message += `Detail Pesanan:\n`
    message += `📦 Produk: ${product.name}\n`
    message += `🎨 Varian: ${variantInfo}\n`
    message += `🔢 Jumlah: ${quantity}\n`
    
    if (notes) {
      message += `📝 Catatan: ${notes}\n`
    }
    
    message += `\n💰 Total Pembayaran: Rp ${totalPrice.toLocaleString('id-ID')}\n`
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`
    message += `Mohon diproses ya. Terima kasih! 🙏`

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
      whatsappUrl,
      transactionId: transaction.id,
      resellerName,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}