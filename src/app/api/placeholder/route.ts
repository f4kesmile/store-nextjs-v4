// src/app/api/placeholder/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params?: { size?: string } } // FIX: Membuat params optional untuk SSG/SSR
) {
  // FIX: Mengakses size secara aman, fallback ke query atau default 80
  const paramSize = params?.size || request.nextUrl.searchParams.get('size');
  const size = parseInt(paramSize as string) || 80;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-size="${Math.floor(size/6)}">No Image</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  });
}