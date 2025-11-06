'use client';

import React, { useMemo, useState } from 'react';
import AdminCard from '../../../components/admin/shared/AdminCard';
import AdminDialog from '../../../components/admin/shared/AdminDialog';
import AdminTable from '../../../components/admin/shared/AdminTable';
import { StatusBadge, ActionDropdown, FormGrid, createCommonActions } from '../../../components/admin/shared/AdminComponents';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Package, Plus, Package2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  description?: string;
  createdAt: string;
}

const formatRupiah = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const ProductsPage: React.FC = () => {
  const [products] = useState<Product[]>([
    { id: 1, name: 'Wireless Headphones', sku: 'WH-001', category: 'Electronics', price: 299000, stock: 45, status: 'active', description: 'High-quality wireless headphones with noise cancellation', createdAt: '2024-01-15' },
    { id: 2, name: 'Gaming Mouse', sku: 'GM-002', category: 'Electronics', price: 150000, stock: 0, status: 'out_of_stock', description: 'Professional gaming mouse with RGB lighting', createdAt: '2024-02-20' },
    { id: 3, name: 'Coffee Mug', sku: 'CM-003', category: 'Home & Garden', price: 45000, stock: 120, status: 'active', description: 'Ceramic coffee mug with elegant design', createdAt: '2024-03-10' },
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleCreateProduct = () => { setSelectedProduct(null); setIsCreateMode(true); setIsDialogOpen(true); };
  const handleEditProduct   = (product: Product) => { setSelectedProduct(product); setIsCreateMode(false); setIsDialogOpen(true); };
  const handleViewProduct   = (product: Product) => { setSelectedProduct(product); setIsCreateMode(false); setIsDialogOpen(true); };
  const handleDeleteProduct = (product: Product) => { if (confirm(`Hapus ${product.name}?`)) console.log('Delete product:', product.id); };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
  const getStockStatus = (stock: number) => (stock === 0 ? 'out_of_stock' : stock < 10 ? 'low_stock' : 'in_stock');

  const columns = [
    { key: 'name', label: 'Produk', render: (value: string, product: Product) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-500/15 rounded-md flex items-center justify-center">
          <Package className="w-4.5 h-4.5 text-indigo-400" />
        </div>
        <div>
          <p className="font-medium text-white/95">{value}</p>
          <p className="text-xs text-white/50">{product.sku}</p>
        </div>
      </div>
    ) },
    { key: 'category', label: 'Kategori', render: (v: string) => <span className="text-sm text-white/70">{v}</span> },
    { key: 'price', label: 'Harga', render: (v: number) => <span className="font-medium">{formatRupiah(v)}</span> },
    { key: 'stock', label: 'Stok', render: (v: number) => (
      <div className="flex items-center gap-2">
        <Package2 className="w-4 h-4 text-white/50" />
        <span className="font-medium">{v}</span>
        <StatusBadge status={getStockStatus(v)} />
      </div>
    ) },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Dibuat', className: 'hidden lg:table-cell', render: (v: string) => <span className="text-sm text-white/60">{formatDate(v)}</span> },
    { key: 'actions', label: 'Aksi', className: 'w-10', render: (_: unknown, p: Product) => (
      <ActionDropdown actions={createCommonActions.crud(() => handleViewProduct(p), () => handleEditProduct(p), () => handleDeleteProduct(p))} />
    ) },
  ];

  const filteredProducts = useMemo(() => products.filter(p => [p.name, p.sku, p.category].some(x => x.toLowerCase().includes(searchValue.toLowerCase()))), [products, searchValue]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 sm:p-6 text-[hsl(var(--foreground))]">
      <div className="admin-container space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Produk</h1>
            <p className="text-white/60 mt-1">Kelola katalog produk kamu</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateProduct} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah
            </Button>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <div className="relative w-full sm:w-80">
              <Input placeholder="Cari nama, SKU..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="bg-[hsl(var(--accent))] border-[hsl(var(--border))] placeholder:text-white/40" />
            </div>
          </div>
          <div className="admin-section-content">
            <AdminTable columns={columns} data={filteredProducts} searchable={false} />
          </div>
        </div>

        <AdminDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={isCreateMode ? 'Produk Baru' : selectedProduct ? `Edit ${selectedProduct.name}` : 'Detail Produk'}
          description={isCreateMode ? 'Tambah produk ke katalog' : 'Ubah informasi produk'}
          size="lg"
          footer={(
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button>{isCreateMode ? 'Simpan' : 'Update'}</Button>
            </div>
          )}
        >
          <div className="admin-grid md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input id="name" defaultValue={selectedProduct?.name || ''} className="bg-[hsl(var(--accent))] border-[hsl(var(--border))]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" defaultValue={selectedProduct?.sku || ''} className="bg-[hsl(var(--accent))] border-[hsl(var(--border))]" />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Input readOnly value={selectedProduct?.category || ''} className="bg-[hsl(var(--accent))] border-[hsl(var(--border))]" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedProduct?.status || 'active'} onValueChange={() => {}}>
                <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Harga (IDR)</Label>
              <Input type="number" defaultValue={selectedProduct?.price || ''} className="bg-[hsl(var(--accent))] border-[hsl(var(--border))]" />
            </div>
            <div className="space-y-2">
              <Label>Stok</Label>
              <Input type="number" defaultValue={selectedProduct?.stock || ''} className="bg-[hsl(var(--accent))] border-[hsl(var(--border))]" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Deskripsi</Label>
              <Textarea rows={4} defaultValue={selectedProduct?.description || ''} className="bg-[hsl(var(--accent))] border-[hsl(var(--border))]" />
            </div>
          </div>
        </AdminDialog>
      </div>
    </div>
  );
};

export default ProductsPage;
