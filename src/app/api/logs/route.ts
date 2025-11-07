import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.LOGS_READ)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const logs = await prisma.activityLog.findMany({
      take: 100, // MEMBATASI HANYA 100 LOG TERAKHIR AGAR TIDAK MENUMPUK DI UI
      include: {
        user: {
          select: {
            username: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}

// --- TAMBAHAN: METODE DELETE ---
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Hanya DEVELOPER yang boleh menghapus log
    if (!session || session.user.role !== 'DEVELOPER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Hapus semua log
    await prisma.activityLog.deleteMany({})

    // Opsional: Catat siapa yang menghapus log (akan jadi log pertama setelah bersih)
    // await prisma.activityLog.create({
    //   data: {
    //     userId: parseInt(session.user.id),
    //     action: "Cleared all activity logs",
    //   }
    // })

    return NextResponse.json({ message: 'All logs cleared successfully' })
  } catch (error) {
    console.error("Clear logs error:", error)
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    )
  }
}