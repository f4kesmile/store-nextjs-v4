import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "settings.json");

async function readSettings() {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    await mkdir(path.dirname(FILE_PATH), { recursive: true });
    const defaults = {
      storeName: "Store Saya",
      storeDescription: "Toko online modern dengan sistem manajemen lengkap",
      supportWhatsApp: "",
      supportEmail: "",
      storeLocation: "",
      aboutTitle: "",
      aboutDescription: "",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      theme: "light",
      locale: "id",
    };
    await writeFile(FILE_PATH, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const current = await readSettings();
  const body = await req.json();
  const merged = { ...current, ...body };
  await writeFile(FILE_PATH, JSON.stringify(merged, null, 2));
  return NextResponse.json(merged);
}
