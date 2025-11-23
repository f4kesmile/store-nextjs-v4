"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Command,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";

// Import Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Akses Ditolak", {
          description: "Kredensial yang Anda masukkan tidak valid.",
        });
        setLoading(false);
      } else {
        toast.success("Autentikasi Berhasil", {
          description: "Mengalihkan ke dashboard aman...",
        });
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      toast.error("Kesalahan Sistem", {
        description: "Gagal terhubung ke server autentikasi.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background text-foreground">
      {/* --- BAGIAN KIRI: VISUAL & BRANDING (Desktop Only) --- */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 border-r border-border/50 bg-zinc-900 text-zinc-50">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

        {/* Header Logo Area */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Command className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight leading-none">
              Devlog Store
            </span>
            <span className="text-xs text-zinc-400 font-medium tracking-widest uppercase">
              Admin Console v4.0
            </span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Kelola Ekosistem Digital Anda dengan Aman.
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Platform manajemen terpusat untuk produk, reseller, dan transaksi.
            Didesain untuk efisiensi dan keamanan data tingkat tinggi.
          </p>
          <div className="flex gap-4 pt-4">
            {[
              "Enkripsi End-to-End",
              "Real-time Monitoring",
              "Manajemen Stok",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs font-medium text-zinc-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex justify-between items-end text-xs text-zinc-500 font-mono">
          <p>
            &copy; {new Date().getFullYear()} Devlog Inc. All rights reserved.
          </p>
          <div className="text-right">
            <p>System Status: Operational</p>
            <p>Server: Asia-Pacific (ID)</p>
          </div>
        </div>
      </div>

      {/* --- BAGIAN KANAN: FORM LOGIN (Responsive) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative bg-background/50 backdrop-blur-xl">
        {/* Mobile Background Blobs */}
        <div className="lg:hidden absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* 3D Card Effect Wrapper */}
          <div className="relative group">
            {/* Layer Shadow untuk efek 3D */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-blue-600/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />

            <Card className="relative border-border/50 shadow-2xl bg-card/90 backdrop-blur-sm">
              <CardHeader className="space-y-1 text-center pb-6">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-primary/20">
                  <LockKeyhole className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Selamat Datang Kembali
                </CardTitle>
                <CardDescription>
                  Masukkan kredensial admin Anda untuk melanjutkan
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Administrator</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@store.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="h-11 bg-background/50 border-input/60 focus:border-primary focus:ring-primary/20 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Kata Sandi</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="h-11 pr-10 bg-background/50 border-input/60 focus:border-primary focus:ring-primary/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 mt-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        Masuk ke Dashboard{" "}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
                <div className="relative w-full flex items-center py-2">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-card px-1">
                    Atau
                  </span>
                  <Separator className="flex-1" />
                </div>

                <Button
                  variant="outline"
                  className="w-full border-dashed border-border hover:bg-accent/50"
                  asChild
                >
                  <Link href="/">Kembali ke Halaman Utama</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="mt-6 flex items-start gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Halaman ini dilindungi oleh <strong>Secure Auth Protocol</strong>.
              Setiap upaya akses yang mencurigakan akan dicatat beserta alamat
              IP untuk keperluan audit keamanan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
