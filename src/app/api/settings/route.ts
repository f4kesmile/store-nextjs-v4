import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      // PERBAIKAN: Blok create() ini sekarang mencocokkan schema.prisma Anda
      // Ini akan membuat baris default jika database kosong.
      settings = await prisma.siteSettings.create({
        data: {
          storeName: "Store Saya",
          storeDescription: "Toko online modern dengan sistem manajemen lengkap",
          supportWhatsApp: "6285185031023",
          supportEmail: "support@store.com",
          aboutTitle: "Tentang Devlog Store",
          primaryColor: "#2563EB",
          secondaryColor: "#10B981",
          theme: "light",
          locale: "id",
          // Bidang opsional (String?) bisa dikosongkan
          storeLocation: null,
          aboutDescription: null,
          logoUrl: null,
          faviconUrl: null,
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    // Menambahkan log error di server untuk debugging
    console.error("Settings GET error:", error); 
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Logika update yang aman: temukan ID dulu
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      // Jika GET gagal atau ada race condition, create di sini juga harus lengkap
      settings = await prisma.siteSettings.create({ data: body });
    } else {
      // Jika ada, update
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: body,
      });
    }

    await logActivity(
      parseInt(session.user.id),
      `Updated site settings`
    );
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings PUT error:", error); // Tambahkan log error
    return NextResponse.json(
      { error: "Failed to update settings" }, 
      { status: 500 }
    );
  }
}