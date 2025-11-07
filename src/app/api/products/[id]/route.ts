import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/logger'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        variants: true,
        images: true, // <-- TAMBAHAN: Sertakan gambar galeri
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    // Cek permission jika perlu
    // if (!session || !hasPermission(session.user.permissions, PERMISSIONS.PRODUCTS_UPDATE)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await req.json()
    const { name, description, iconUrl, price, stock, status, enableNotes, images } = body

    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        description,
        iconUrl,
        price: parseFloat(price),
        stock: parseInt(stock),
        status,
        enableNotes: enableNotes !== undefined ? enableNotes : true,
        // --- TAMBAHAN: Update Galeri Gambar ---
        // Strategi: Hapus semua gambar lama, masukkan yang baru
        images: {
            deleteMany: {}, 
            create: images && Array.isArray(images) 
              ? images.map((url: string) => ({ url })) 
              : []
        }
        // ------------------------------------
      },
      include: {
        variants: true,
        images: true, // Sertakan di response
      },
    })

    if (session?.user?.id) {
        await logActivity(parseInt(session.user.id), `Updated product: ${product.name}`)
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    // if (!session || !hasPermission(session.user.permissions, PERMISSIONS.PRODUCTS_DELETE)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Hapus produk (images akan otomatis terhapus karena onDelete: Cascade di schema)
    const product = await prisma.product.delete({
      where: { id: parseInt(params.id) },
    })

    if (session?.user?.id) {
        await logActivity(parseInt(session.user.id), `Deleted product: ${product.name}`)
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}