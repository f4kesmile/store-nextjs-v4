import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          storeName: "Store Saya",
          supportWhatsApp: "6285185031023",
          supportEmail: "support@store.com",
          primaryColor: "#2563EB",
          secondaryColor: "#10B981",
          theme: "light",
          isMaintenanceMode: false, // Default
        },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Pastikan hanya ADMIN atau DEVELOPER yang bisa ubah
    if (!session || !["ADMIN", "DEVELOPER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Ambil ID settings yang ada
    const existingSettings = await prisma.siteSettings.findFirst();
    
    if (!existingSettings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // Update dengan data baru
    const updatedSettings = await prisma.siteSettings.update({
      where: { id: existingSettings.id },
      data: {
        storeName: body.storeName,
        storeDescription: body.storeDescription,
        supportEmail: body.supportEmail,
        supportWhatsApp: body.supportWhatsApp,
        storeLocation: body.storeLocation,
        aboutTitle: body.aboutTitle,
        aboutDescription: body.aboutDescription,
        logoUrl: body.logoUrl,
        faviconUrl: body.faviconUrl,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        theme: body.theme,
        locale: body.locale,
        // INI YANG PENTING: Pastikan field ini ikut di-update
        isMaintenanceMode: body.isMaintenanceMode, 
      },
    });

    // Catat log aktivitas
    if (session.user.id) {
      await logActivity(
        parseInt(session.user.id),
        `Updated site settings. Maintenance Mode: ${body.isMaintenanceMode ? 'ON' : 'OFF'}`
      );
    }
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" }, 
      { status: 500 }
    );
  }
}