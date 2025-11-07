"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Import Button
import { Activity, Trash2, Loader2 } from "lucide-react"; // Import Icon
import { toast } from "sonner"; // Import toast

interface Log {
  id: number;
  action?: string;
  timestamp?: string;
  user?: { username?: string; email?: string; role?: { name?: string } };
}

export default function ActivityLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false); // State untuk loading saat hapus
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.role !== "DEVELOPER") {
      router.replace("/admin");
      return;
    }
    fetchLogs();
  }, [status, session, router]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      const arr = Array.isArray(data) ? data.filter(Boolean) : [];
      setLogs(arr);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat log");
    } finally {
      setLoading(false);
    }
  }

  // Fungsi untuk menghapus log
  async function handleClearLogs() {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus SEMUA activity log? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }

    setClearing(true);
    try {
      const res = await fetch("/api/logs", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Log berhasil dibersihkan");
        setLogs([]); // Kosongkan state lokal
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal membersihkan log");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setClearing(false);
    }
  }

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return logs.filter((l) => {
      const action = (l.action || "").toLowerCase();
      const username = (l.user?.username || "").toLowerCase();
      return action.includes(q) || username.includes(q);
    });
  }, [logs, filter]);

  if (status === "loading") return null;
  if (session?.user?.role !== "DEVELOPER") return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Activity Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Memantau aktivitas pengguna sistem (Maks. 100 terakhir)
          </p>
        </div>

        {/* Tombol Clear Logs */}
        <Button
          variant="destructive"
          onClick={handleClearLogs}
          disabled={clearing || logs.length === 0}
          className="gap-2"
        >
          {clearing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {clearing ? "Membersihkan..." : "Bersihkan Log"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daftar Aktivitas</CardTitle>
            <div className="w-full max-w-sm">
              <Input
                placeholder="Cari aktivitas atau username..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Waktu</TableHead>
                  <TableHead className="w-[200px]">User</TableHead>
                  <TableHead className="w-[100px]">Role</TableHead>
                  <TableHead>Aktivitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" /> Memuat
                        log...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Tidak ada aktivitas ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((l) => {
                    const u = l.user ?? {
                      username: "Unknown",
                      email: "-",
                      role: { name: "-" },
                    };
                    const ts = l.timestamp
                      ? new Date(l.timestamp).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-";

                    return (
                      <TableRow key={l.id} className="hover:bg-muted/50">
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground font-mono">
                          {ts}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{u.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {u.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              u.role?.name === "DEVELOPER"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px] px-2 py-0.5"
                          >
                            {u.role?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{l.action}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-xs text-muted-foreground text-right">
            Menampilkan {filtered.length} dari {logs.length} log terbaru
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
