// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import path from 'path';

// Hapus import fs/promises

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Upload request received');
    
    const data = await request.formData();
    console.log('📋 FormData parsed');
    
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.log('❌ No file in FormData');
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    console.log('📁 File info:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validasi (tetap sama)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json({ 
        error: `Tipe file tidak didukung: ${file.type}. Hanya JPEG, PNG, WebP, dan GIF yang diizinkan` 
      }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json({ 
        error: `File terlalu besar: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maksimal 5MB` 
      }, { status: 400 });
    }

    console.log('✅ File validation passed');

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name) || '.jpg';
    const baseName = path.basename(file.name, fileExtension).replace(/[^a-zA-Z0-9.-]/g, '_');
    // Simpan di folder 'products' di dalam blob store
    const filename = `products/${timestamp}_${baseName}${fileExtension}`;

    console.log('📝 Generated filename:', filename);

    // Upload ke Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });
    
    // Return URL publik dari Vercel Blob
    const imageUrl = blob.url;

    console.log('✅ Upload successful:', imageUrl);
    return NextResponse.json({ 
      message: 'File berhasil diupload', 
      imageUrl, // Kirim URL Vercel Blob
      filename,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('💥 Upload error:', error);
    return NextResponse.json({ 
      error: 'Gagal upload file: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}