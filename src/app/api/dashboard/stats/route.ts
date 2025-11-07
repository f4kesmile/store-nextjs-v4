import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PENTING: Ini memaksa Next.js untuk selalu menjalankan fungsi ini di server
// setiap kali dipanggil, jangan pernah menggunakan cache.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Jalankan semua query secara paralel agar lebih cepat
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalRevenueResult,
      recentTransactions
    ] = await Promise.all([
      // 1. Total semua produk
      prisma.product.count(),
      // 2. Total produk status ACTIVE
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      // 3. Produk dengan stok menipis (misal di bawah 5)
      prisma.product.count({ where: { stock: { lt: 5 } } }),
      // 4. Total pendapatan (hanya dari transaksi yang COMPLETED/selesai)
      prisma.transaction.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalPrice: true }
      }),
      // 5. 5 Transaksi terbaru
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true } },
          // reseller: { select: { name: true } } // Uncomment jika ingin menampilkan nama reseller
        }
      })
    ])

    return NextResponse.json({
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalRevenue: Number(totalRevenueResult._sum.totalPrice || 0), // Pastikan jadi Number
      recentTransactions
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0', // Header tambahan anti-cache
      }
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}