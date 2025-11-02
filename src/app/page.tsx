"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";

interface Settings {
  storeName: string;
  storeDescription: string;
  supportWhatsApp: string;
  supportEmail: string;
  storeLocation: string;
  aboutTitle: string;
  aboutDescription: string;
}

export default function HomePage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <SiteNavbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 text-gray-800">
          Selamat Datang di{" "}
          <span className="text-purple-600">
            {settings?.storeName || "Store Saya"}
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {settings?.storeDescription ||
            "Platform digital terpercaya untuk semua kebutuhan produk premium dan layanan sosial media."}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/products"
            className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-purple-700 font-bold transition-all"
          >
            🛍️ Belanja Sekarang
          </Link>
          <Link
            href="/contact"
            className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-lg text-lg hover:bg-purple-50 font-bold transition-all"
          >
            📞 Hubungi Kami
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              Cepat & Aman
            </h3>
            <p className="text-gray-600">
              Transaksi cepat dengan sistem keamanan terpercaya
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="text-5xl mb-4">💎</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              Produk Premium
            </h3>
            <p className="text-gray-600">
              Koleksi produk digital berkualitas tinggi
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">
              Support 24/7
            </h3>
            <p className="text-gray-600">
              Tim support siap membantu kapan saja
            </p>
          </div>
        </div>
      </section>

      {/* About Section - Menggunakan data dari settings */}
      {settings?.aboutTitle && settings?.aboutDescription && (
        <section className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-4xl font-bold mb-6">{settings.aboutTitle}</h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto whitespace-pre-line">
              {settings.aboutDescription}
            </p>

            {/* Quick Contact */}
            <div className="flex justify-center gap-4 mt-8">
              <a
                href={`https://wa.me/${settings.supportWhatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-bold transition-all"
              >
                💬 Chat WhatsApp
              </a>
              <a
                href={`mailto:${settings.supportEmail}`}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold transition-all"
              >
                📧 Kirim Email
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">
            {settings?.storeName || "Store Saya"}
          </h3>
          <p className="text-gray-400 mb-4">{settings?.storeDescription}</p>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
            {settings?.storeLocation && (
              <>
                <span>📍 {settings.storeLocation}</span>
                <span>•</span>
              </>
            )}
            <span>📧 {settings?.supportEmail}</span>
            <span>•</span>
            <span>💬 {settings?.supportWhatsApp}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
