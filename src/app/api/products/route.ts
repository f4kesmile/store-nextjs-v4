// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const admin = searchParams.get('admin')

    const products = await prisma.product.findMany({
      include: {
        variants: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (admin !== 'true') {
      // [PERBAIKAN] Jangan filter produk, hanya filter varian
      const allProductsForPublic = products.map((p) => ({
        ...p,
        // Kita tetap filter varian yang INACTIVE agar tidak muncul di halaman detail
        variants: p.variants.filter((v) => v.status === "ACTIVE"),
      }));
      return NextResponse.json(allProductsForPublic);
    }

    // Admin mendapatkan semua data
    return NextResponse.json(products)
  } catch (error: any) { // Tambahkan 'any'
    console.error('💥 GET /api/products FAILED:', error); // <-- TAMBAHKAN INI
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch products', 
        details: error.message // Kirim detail error ke browser
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    // if (!session || !hasPermission(session.user.permissions, PERMISSIONS.PRODUCTS_CREATE)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await req.json()
    const { name, description, iconUrl, price, stock, status, enableNotes, variants, images } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        iconUrl,
        price: parseFloat(price),
        stock: parseInt(stock),
        status,
        enableNotes: enableNotes !== undefined ? enableNotes : true,
        images: {
            create: images && Array.isArray(images) 
              ? images.map((url: string) => ({ url })) 
              : []
        }
      },
    })

    // --- LOGIKA VARIAN DIPERBARUI ---
    if (variants && variants.length > 0) {
      await prisma.variant.createMany({
        data: variants.map((v: any) => ({
          productId: product.id,
          name: v.name,
          value: v.value,
          stock: parseInt(String(v.stock)) || 0,
          price: v.price ? parseFloat(String(v.price)) : null, // <-- TAMBAHKAN INI
          status: v.status || "ACTIVE",
        })),
      })
    }
    // ---------------------------------

    if (session?.user?.id) {
        await logActivity(parseInt(session.user.id), `Created product: ${product.name}`)
    }

    const productWithRelations = await prisma.product.findUnique({
      where: { id: product.id },
      include: { variants: true, images: true },
    })

    return NextResponse.json(productWithRelations, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}