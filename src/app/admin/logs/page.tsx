"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Log { id: number; action: string; timestamp: string; user: { username: string; email: string; role: { name: string } } }

const Icons = { activity: (p:any)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><path d="M22 12h-4l-3 9-6-18-3 9H2"/></svg>) };

export default function ActivityLogsPage(){
  const { data: session } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(()=>{ if (session?.user.role !== "DEVELOPER") { window.location.href = "/admin"; return; } fetchLogs(); }, [session]);

  async function fetchLogs(){ try { const res = await fetch("/api/logs"); const data = await res.json(); setLogs(data); } catch(e){ console.error(e); } finally { setLoading(false); } }

  const filtered = useMemo(()=> logs.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()) || l.user.username.toLowerCase().includes(filter.toLowerCase())), [logs, filter]);
  if (session?.user.role !== "DEVELOPER") return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-md bg-muted grid place-items-center"><Icons.activity className="w-4 h-4"/></span>
            <div>
              <CardTitle className="text-lg">Activity Logs</CardTitle>
              <CardDescription>Semua aktivitas admin</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Filter</CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="Cari aktivitas atau username..." value={filter} onChange={(e)=>setFilter(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log)=>(
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "medium" })}</TableCell>
                    <TableCell>
                      <div className="font-medium">{log.user.username}</div>
                      <div className="text-sm text-muted-foreground">{log.user.email}</div>
                    </TableCell>
                    <TableCell><Badge variant={log.user.role.name === "DEVELOPER" ? "destructive" : "secondary"}>{log.user.role.name}</Badge></TableCell>
                    <TableCell className="text-sm">{log.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!loading && filtered.length === 0 && (<div className="text-center py-8 text-muted-foreground">Tidak ada log ditemukan</div>)}
        </CardContent>
      </Card>
    </div>
  );
}
