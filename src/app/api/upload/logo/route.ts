// src/app/api/upload/logo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validasi (tetap sama)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 5MB allowed" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'png';
    // Simpan di folder 'settings' di dalam blob store
    const filename = `settings/logo-${timestamp}.${extension}`;
    
    // Upload ke Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });
    
    return NextResponse.json({ 
      logoPath: blob.url, // Return URL dari Blob
      success: true,
      message: "Logo uploaded successfully"
    });
    
  } catch (error) {
    console.error("Logo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" }, 
      { status: 500 }
    );
  }
}