export type ServerSettings = {
  storeName?: string;
  storeDescription?: string;
  faviconUrl?: string;
};

export async function getServerSettings(): Promise<ServerSettings> {
  // Simple server-side fetch to the API route. In real app pull from DB directly.
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/settings`, { cache: "no-store" });
  try { return await res.json(); } catch { return {}; }
}
