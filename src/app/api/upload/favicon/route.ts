// src/app/api/upload/favicon/route.ts
import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("favicon") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validasi (tetap sama)
    const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.ico')) {
      return NextResponse.json({ error: "File must be .ico or .png format" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 2MB allowed for favicon" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.toLowerCase().endsWith('.ico') ? 'ico' : 'png';
    // Simpan di folder 'settings' di dalam blob store
    const filename = `settings/favicon-${timestamp}.${extension}`;
    
    // Upload ke Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });
    
    return NextResponse.json({ 
      faviconPath: blob.url, // Return URL dari Blob
      success: true,
      message: "Favicon uploaded successfully"
    });
    
  } catch (error) {
    console.error("Favicon upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload favicon" }, 
      { status: 500 }
    );
  }
}