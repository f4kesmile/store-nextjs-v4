"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";
import AdminCard from "@/components/admin/shared/AdminCard";
import AdminDialog from "@/components/admin/shared/AdminDialog";
import AdminTable from "@/components/admin/shared/AdminTable";
import {
  ActionDropdown,
  createCommonActions,
} from "@/components/admin/shared/AdminComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Users, Lock } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Role {
  id: number;
  name: string;
  permissions: string[];
  _count?: {
    users: number;
  };
  createdAt: string;
}

export default function RolesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
  });
  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user.role !== "DEVELOPER") {
      router.replace("/admin");
      return;
    }
    fetchRoles();
  }, [session, status, router]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      } else {
        toast.error("Gagal memuat roles");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setFormData({ name: "", permissions: [] });
    setShowModal(true);
  };

  const handleEditRole = (role: Role) => {
    if (role.name === "DEVELOPER") {
      toast.warning("Role DEVELOPER tidak dapat diedit!");
      return;
    }
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions,
    });
    setShowModal(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.name === "DEVELOPER") {
      toast.warning("Tidak dapat menghapus role DEVELOPER!");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus role ${role.name}?`))
      return;

    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Role ${role.name} berhasil dihapus`);
        fetchRoles();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menghapus role");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nama role harus diisi");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingRole ? "Role diperbarui" : "Role dibuat");
        setShowModal(false);
        fetchRoles();
      } else {
        const error = await res.json();
        toast.error(error.error || "Gagal menyimpan role");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const selectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: Object.values(PERMISSIONS),
    }));
  };

  const deselectAllPermissions = () => {
    setFormData((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  // Group permissions by category
  const permissionGroups = useMemo(
    () => ({
      Products: Object.values(PERMISSIONS).filter((p) =>
        p.startsWith("products:")
      ),
      Resellers: Object.values(PERMISSIONS).filter((p) =>
        p.startsWith("resellers:")
      ),
      Users: Object.values(PERMISSIONS).filter((p) => p.startsWith("users:")),
      Others: Object.values(PERMISSIONS).filter(
        (p) =>
          !p.startsWith("products:") &&
          !p.startsWith("resellers:") &&
          !p.startsWith("users:")
      ),
    }),
    []
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "name",
      label: "Role Name",
      render: (name: string, role: Role) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          {name === "DEVELOPER" && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
              <Lock className="w-3 h-3 mr-1" /> Protected
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "_count",
      label: "Users",
      render: (_: any, role: Role) => (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{role._count?.users || 0}</span>
        </div>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (perms: string[]) => (
        <Badge variant="outline">{perms.length} Access</Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      className: "hidden md:table-cell text-muted-foreground text-sm",
      render: (date: string) => formatDate(date),
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (_: any, role: Role) => (
        <ActionDropdown
          disabled={role.name === "DEVELOPER"}
          actions={createCommonActions.crud(
            undefined,
            () => handleEditRole(role),
            () => handleDeleteRole(role)
          )}
        />
      ),
    },
  ];

  const filteredRoles = useMemo(() => {
    return roles.filter((role) =>
      role.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [roles, searchValue]);

  if (status === "loading" || session?.user.role !== "DEVELOPER") return null;

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Roles & Permissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola hak akses pengguna sistem
            </p>
          </div>
          <Button onClick={handleCreateRole} className="gap-2">
            <Plus className="w-4 h-4" /> Role Baru
          </Button>
        </div>

        <AdminCard
          title="Daftar Role"
          description={`${filteredRoles.length} role tersedia`}
        >
          <AdminTable
            columns={columns}
            data={filteredRoles}
            loading={loading}
            searchable
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Cari role..."
          />
        </AdminCard>

        {/* Modal Create/Edit Role */}
        <AdminDialog
          open={showModal}
          onOpenChange={setShowModal}
          title={
            editingRole ? `Edit Role: ${editingRole.name}` : "Buat Role Baru"
          }
          size="lg"
          footer={
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Role"}
              </Button>
            </div>
          }
        >
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="roleName">Nama Role</Label>
              <Input
                id="roleName"
                placeholder="Contoh: STAFF_GUDANG"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value.toUpperCase(),
                  }))
                }
                disabled={!!editingRole} // Nama role sebaiknya tidak diubah jika sudah dibuat untuk konsistensi, atau buka jika perlu.
              />
              <p className="text-xs text-muted-foreground">
                Nama role akan otomatis dikonversi ke HURUF BESAR.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Permissions Access</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={selectAllPermissions}
                    className="h-7 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={deselectAllPermissions}
                    className="h-7 text-xs"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="space-y-6">
                  {Object.entries(permissionGroups).map(([group, perms]) => (
                    <div key={group}>
                      <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                        {group}{" "}
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5"
                        >
                          {perms.length}
                        </Badge>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {perms.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-start space-x-2 border p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={permission}
                              checked={formData.permissions.includes(
                                permission
                              )}
                              onCheckedChange={() =>
                                togglePermission(permission)
                              }
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={permission}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {permission}
                              </label>
                              <p className="text-[11px] text-muted-foreground capitalize">
                                {permission.replace(":", " ")} access
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="text-right text-xs text-muted-foreground">
                Total terpilih: {formData.permissions.length}
              </div>
            </div>
          </div>
        </AdminDialog>
      </div>
    </div>
  );
}
