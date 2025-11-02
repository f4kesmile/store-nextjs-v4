"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const IconUser = (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0112 0"/></svg>);
const Icons = { plus: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><path d="M12 5v14M5 12h14"/></svg>), edit: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>), trash: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>), };

interface User { id: number; username: string; email: string; roleId: number; role: { id: number; name: string }; createdAt: string; }
interface Role { id: number; name: string }

export default function UsersManagement() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", roleId: "" });
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  useEffect(() => { if (session?.user.role !== "DEVELOPER") { window.location.href = "/admin"; return; } fetchUsers(); fetchRoles(); }, [session]);
  const fetchUsers = async () => { try { const res = await fetch("/api/users"); const data = await res.json(); setUsers(data); } catch (e) { console.error(e); } finally { setLoading(false); } };
  const fetchRoles = async () => { try { const res = await fetch("/api/roles"); const data = await res.json(); setRoles(data); } catch (e) { console.error(e); } };

  const resetForm = () => { setEditingUser(null); setFormData({ username: "", email: "", password: "", roleId: "" }); };
  const handleEdit = (user: User) => { setEditingUser(user); setFormData({ username: user.username, email: user.email, password: "", roleId: user.roleId.toString() }); setShowModal(true); };
  const handleDelete = async (id: number) => { if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return; try { const res = await fetch(`/api/users/${id}`, { method: "DELETE" }); if (res.ok) await fetchUsers(); } catch (e) { console.error(e); } };

  const filtered = useMemo(() => users.filter((u) => (roleFilter === "ALL" ? true : u.role?.name === roleFilter) && (u.username.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()))), [users, roleFilter, query]);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); try { const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"; const method = editingUser ? "PUT" : "POST"; const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); if (!res.ok) { const err = await res.json().catch(() => ({})); alert(err.error || "Failed to save user"); return; } await fetchUsers(); setShowModal(false); resetForm(); } catch (e) { console.error(e); alert("Failed to save user"); } finally { setLoading(false); } };

  if (session?.user.role !== "DEVELOPER") return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Manajemen Users</CardTitle>
              <CardDescription>Kelola pengguna dan hak akses</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => { resetForm(); setShowModal(true); }}><Icons.plus className="w-4 h-4" /> Tambah User</Button>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <Input placeholder="Cari username/email..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                {roles.map((r) => (<SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-full bg-muted grid place-items-center">
                          <IconUser className="w-5 h-5"/>
                        </span>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell><Badge variant={user.role?.name === "DEVELOPER" ? "destructive" : "secondary"}>{user.role?.name}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("id-ID")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" className="gap-2" onClick={() => handleEdit(user)}><Icons.edit className="w-4 h-4"/>Edit</Button>
                        <Button variant="destructive" className="gap-2" onClick={() => handleDelete(user.id)}><Icons.trash className="w-4 h-4"/>Hapus</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">{editingUser ? "Edit User" : "Tambah User"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Username</label><Input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Email</label><Input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Password {editingUser && "(Kosongkan jika tidak diubah)"}</label><Input type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Role</label><Select value={formData.roleId || ""} onValueChange={(v: any) => setFormData({ ...formData, roleId: v })}><SelectTrigger className="w-full"><SelectValue placeholder="Pilih role" /></SelectTrigger><SelectContent><SelectItem value="">Pilih Role</SelectItem>{roles.map((role) => (<SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>))}</SelectContent></Select></div>
              <div className="flex gap-3 pt-4"><Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : editingUser ? "Update" : "Simpan"}</Button><Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>Batal</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
