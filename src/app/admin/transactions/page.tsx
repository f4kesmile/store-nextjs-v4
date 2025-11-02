"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatPrice } from "@/lib/utils";

// ... (imports & interfaces remain the same)

export default function TransactionsPage() {
  // ... (state & effects remain the same)

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter.toLowerCase());
    params.set("format", "xlsx");
    return `/api/transactions/export?${params.toString()}`;
  }, [statusFilter]);

  // ... (rest of component remains the same, only header button updated)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Manajemen Transaksi</CardTitle>
              <CardDescription>Kelola transaksi dengan filter dan ekspor</CardDescription>
            </div>
            <Button asChild className="gap-2">
              <a href={exportUrl} target="_blank" rel="noopener">Export</a>
            </Button>
          </div>
          {/* toolbar below unchanged */}
        </CardHeader>
      </Card>
      {/* rest of JSX unchanged */}
    </div>
  );
}
