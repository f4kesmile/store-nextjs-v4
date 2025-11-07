"use client";

import React, { useState, useEffect, useMemo } from "react";
import AdminCard from "../../../components/admin/shared/AdminCard";
import AdminDialog from "../../../components/admin/shared/AdminDialog";
import AdminTable from "../../../components/admin/shared/AdminTable";
import {
  StatusBadge,
  ActionDropdown,
  FormGrid,
  createCommonActions,
} from "../../../components/admin/shared/AdminComponents";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Users, UserPlus, Calendar } from "lucide-react";
import { toast } from "sonner"; // Ganti import

// Interface berdasarkan data API Anda (dari /api/users/route.ts)
interface Role {
  id: number;
  name: string;
}
interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  roleId: number;
  createdAt: string;
  password?: string; // Untuk form
}

const UsersPage: React.FC = () => {
  // Ganti data statis dengan state kosong
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Fungsi untuk mengambil data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error("Gagal memuat users");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (res.ok) setRoles(await res.json());
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  };

  // Panggil fetch saat komponen dimuat
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleCreateUser = () => {
    setSelectedUser({
      username: "",
      email: "",
      roleId: roles.find((r) => r.name === "ADMIN")?.id || roles[0]?.id,
    });
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Anda yakin ingin menghapus user ${user.username}?`)) {
      try {
        const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("User dihapus", {
            description: `${user.username} telah dihapus.`,
          });
          fetchUsers(); // Muat ulang data
        } else {
          toast.error("Gagal menghapus");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan");
      }
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    // Siapkan payload, hapus password jika kosong
    const payload = { ...selectedUser };
    if (payload.password === "") {
      delete payload.password;
    }

    const url = isCreateMode ? "/api/users" : `/api/users/${selectedUser.id}`;
    const method = isCreateMode ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Berhasil disimpan", {
          description: `Data user ${selectedUser.username} tersimpan.`,
        });
        setIsDialogOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Muat ulang data
      } else {
        const err = await res.json();
        toast.error("Gagal menyimpan", {
          description: err.error,
        });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Sesuaikan kolom dengan data dari API
  const columns = [
    {
      key: "username",
      label: "User",
      render: (value: string, user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-[hsl(var(--foreground))]">{value}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (role: Role) => (
        <StatusBadge
          status={role.name}
          variant={role.name === "DEVELOPER" ? "danger" : "default"}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Bergabung",
      className: "hidden lg:table-cell",
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
          <Calendar className="w-3 h-3" />
          {formatDate(value)}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      className: "w-12",
      render: (
        _: any,
        user: User // <-- FIX implicit 'any'
      ) => (
        <ActionDropdown
          actions={createCommonActions.crud(
            undefined, // Tidak ada view, langsung edit
            () => handleEditUser(user),
            () => handleDeleteUser(user)
          )}
        />
      ),
    },
  ];

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchValue.toLowerCase()) ||
          user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          user.role.name.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [users, searchValue]
  );

  const handleDialogChange = (field: keyof User, value: any) => {
    setSelectedUser((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground mt-1">
              Kelola user dan hak akses sistem
            </p>
          </div>
          <Button
            onClick={handleCreateUser}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Tambah User
          </Button>
        </div>

        {/* Users Table */}
        <AdminCard
          title="All Users"
          description={`${filteredUsers.length} users ditemukan`}
        >
          <AdminTable
            columns={columns}
            data={filteredUsers}
            loading={loading}
            searchable
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder="Cari user, email, atau role..."
            emptyMessage="User tidak ditemukan"
          />
        </AdminCard>

        {/* User Dialog */}
        <AdminDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={
            isCreateMode ? "Tambah User Baru" : `Edit ${selectedUser?.username}`
          }
          description={
            isCreateMode
              ? "Buat akun user baru"
              : "Lihat dan edit informasi user"
          }
          size="lg"
          footer={
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSaveUser}>
                {isCreateMode ? "Buat User" : "Simpan Perubahan"}
              </Button>
            </div>
          }
        >
          {selectedUser && (
            <div className="space-y-6">
              <FormGrid columns={2}>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Masukkan username"
                    value={selectedUser.username || ""}
                    onChange={(e) =>
                      handleDialogChange("username", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={selectedUser.email || ""}
                    onChange={(e) =>
                      handleDialogChange("email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  {/* FIX: Ganti defaultValue dengan value dan onValueChange */}
                  <Select
                    value={String(selectedUser.roleId || "")}
                    onValueChange={(value) =>
                      handleDialogChange("roleId", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={
                      isCreateMode
                        ? "Masukkan password"
                        : "Kosongkan jika tidak ganti"
                    }
                    onChange={(e) =>
                      handleDialogChange("password", e.target.value)
                    }
                  />
                </div>
              </FormGrid>
            </div>
          )}
        </AdminDialog>
      </div>
    </div>
  );
};

export default UsersPage;
