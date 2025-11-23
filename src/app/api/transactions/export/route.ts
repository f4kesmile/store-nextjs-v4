// src/app/api/transactions/export/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.permissions, PERMISSIONS.TRANSACTIONS_READ)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx';
    const status = searchParams.get('status') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const resellerId = searchParams.get('resellerId');

    // Build where clause for filtering
    const whereClause: any = {};
    
    if (status !== 'all') {
      whereClause.status = status;
    }
    
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
      if (dateTo) whereClause.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
    }
    
    if (resellerId && resellerId !== 'all') {
      if (resellerId === 'direct') {
        whereClause.resellerId = null;
      } else {
        whereClause.resellerId = parseInt(resellerId);
      }
    }

    // Fetch transactions with filters
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        product: true,
        variant: true,
        reseller: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary statistics
    const summary = {
      totalTransactions: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + Number(t.totalPrice), 0),
      pendingCount: transactions.filter(t => t.status === 'PENDING').length,
      completedCount: transactions.filter(t => t.status === 'COMPLETED').length,
      cancelledCount: transactions.filter(t => t.status === 'CANCELLED').length,
      directSales: transactions.filter(t => !t.resellerId).length,
      resellerSales: transactions.filter(t => t.resellerId).length,
    };

    if (format === 'csv') {
      // Generate CSV
      const csvData = [];
      
      // CSV Headers - HAPUS adminNotes
      const headers = [
        "Order ID",
        'ID Transaksi',
        'Tanggal & Waktu',
        'Tanggal Saja',
        'Jam',
        'Produk',
        'Varian',
        'Quantity',
        'Harga Satuan',
        'Total Harga',
        'Reseller',
        'Nama Customer',
        'No. HP Customer',
        'Status',
        'Catatan Customer'
      ];
      
      csvData.push(headers.join(','));

      // CSV Data - HAPUS adminNotes
      transactions.forEach((t) => {
        const createdAt = new Date(t.createdAt);
        const row = [
          `"${t.orderId || '-'}"`,
          t.id,
          `"${createdAt.toLocaleString('id-ID')}"`,
          `"${createdAt.toLocaleDateString('id-ID')}"`,
          `"${createdAt.toLocaleTimeString('id-ID')}"`,
          `"${t.product.name.replace(/"/g, '""')}"`,
          t.variant ? `"${t.variant.name}: ${t.variant.value}"` : 'Standard',
          t.quantity,
          t.product.price,
          t.totalPrice,
          t.reseller ? `"${t.reseller.name.replace(/"/g, '""')}"` : 'Direct',
          t.customerName ? `"${t.customerName.replace(/"/g, '""')}"` : '-',
          t.customerPhone ? `"${t.customerPhone.replace(/"/g, '""')}"` : '-',
          t.status,
          t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '-'
        ];
        csvData.push(row.join(','));
      });

      // Add summary at the end
      csvData.push('');
      csvData.push('=== RINGKASAN ===');
      csvData.push(`Total Transaksi,${summary.totalTransactions}`);
      csvData.push(`Total Revenue,"Rp ${summary.totalRevenue.toLocaleString('id-ID')}"`);
      csvData.push(`Pending,${summary.pendingCount}`);
      csvData.push(`Completed,${summary.completedCount}`);
      csvData.push(`Cancelled,${summary.cancelledCount}`);
      csvData.push(`Direct Sales,${summary.directSales}`);
      csvData.push(`Reseller Sales,${summary.resellerSales}`);

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `Transaksi_Export_${timestamp}.csv`;

      return new Response(csvData.join('\n'), {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': 'text/csv; charset=utf-8',
        },
      });
    }

    // Excel Export using ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = session.user.email || 'Admin';
    workbook.created = new Date();

    // Main transactions sheet
    const worksheet = workbook.addWorksheet('Data Transaksi');

    // Define columns - HAPUS adminNotes
    const columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Tanggal & Waktu', key: 'datetime', width: 18 },
      { header: 'Tanggal', key: 'date', width: 12 },
      { header: 'Jam', key: 'time', width: 10 },
      { header: 'Produk', key: 'product', width: 25 },
      { header: 'Varian', key: 'variant', width: 20 },
      { header: 'Qty', key: 'quantity', width: 8 },
      { header: 'Harga Satuan', key: 'unitPrice', width: 15 },
      { header: 'Total Harga', key: 'totalPrice', width: 15 },
      { header: 'Reseller', key: 'reseller', width: 20 },
      { header: 'Nama Customer', key: 'customerName', width: 20 },
      { header: 'No. HP', key: 'customerPhone', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Catatan Customer', key: 'notes', width: 30 },
    ];

    worksheet.columns = columns;

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '059669' } // Green color for transactions
    };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Add data - HAPUS adminNotes
    transactions.forEach((transaction) => {
      const createdAt = new Date(transaction.createdAt);
      
      worksheet.addRow({
        id: transaction.id,
        datetime: createdAt.toLocaleString('id-ID'),
        date: createdAt.toLocaleDateString('id-ID'),
        time: createdAt.toLocaleTimeString('id-ID'),
        product: transaction.product.name,
        variant: transaction.variant 
          ? `${transaction.variant.name}: ${transaction.variant.value}` 
          : 'Standard',
        quantity: transaction.quantity,
        unitPrice: Number(transaction.product.price),
        totalPrice: Number(transaction.totalPrice),
        reseller: transaction.reseller?.name || 'Direct',
        customerName: transaction.customerName || '-',
        customerPhone: transaction.customerPhone || '-',
        status: transaction.status,
        notes: transaction.notes || '-',
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Format currency columns
    const unitPriceColumn = worksheet.getColumn('unitPrice');
    const totalPriceColumn = worksheet.getColumn('totalPrice');
    unitPriceColumn.numFmt = '"Rp " #,##0';
    totalPriceColumn.numFmt = '"Rp " #,##0';

    // Color code status cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const statusCell = row.getCell('status');
        const status = statusCell.value as string;
        
        switch (status) {
          case 'PENDING':
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEF3C7' } };
            statusCell.font = { color: { argb: '92400E' } };
            break;
          case 'COMPLETED':
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1FAE5' } };
            statusCell.font = { color: { argb: '065F46' } };
            break;
          case 'CANCELLED':
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };
            statusCell.font = { color: { argb: '991B1B' } };
            break;
          case 'CONFIRMED':
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DBEAFE' } };
            statusCell.font = { color: { argb: '1E40AF' } };
            break;
          case 'SHIPPED':
            statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E9D5FF' } };
            statusCell.font = { color: { argb: '7C3AED' } };
            break;
        }
      }
    });

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Ringkasan');
    summarySheet.columns = [
      { header: 'Metrik', key: 'metric', width: 25 },
      { header: 'Nilai', key: 'value', width: 20 },
      { header: 'Persentase', key: 'percentage', width: 15 }
    ];

    // Add summary data
    summarySheet.addRows([
      { 
        metric: 'Total Transaksi', 
        value: summary.totalTransactions,
        percentage: '100%'
      },
      { 
        metric: 'Total Revenue', 
        value: summary.totalRevenue,
        percentage: ''
      },
      { 
        metric: 'Transaksi Pending', 
        value: summary.pendingCount,
        percentage: summary.totalTransactions ? `${((summary.pendingCount / summary.totalTransactions) * 100).toFixed(1)}%` : '0%'
      },
      { 
        metric: 'Transaksi Completed', 
        value: summary.completedCount,
        percentage: summary.totalTransactions ? `${((summary.completedCount / summary.totalTransactions) * 100).toFixed(1)}%` : '0%'
      },
      { 
        metric: 'Transaksi Cancelled', 
        value: summary.cancelledCount,
        percentage: summary.totalTransactions ? `${((summary.cancelledCount / summary.totalTransactions) * 100).toFixed(1)}%` : '0%'
      },
      { 
        metric: 'Penjualan Direct', 
        value: summary.directSales,
        percentage: summary.totalTransactions ? `${((summary.directSales / summary.totalTransactions) * 100).toFixed(1)}%` : '0%'
      },
      { 
        metric: 'Penjualan Reseller', 
        value: summary.resellerSales,
        percentage: summary.totalTransactions ? `${((summary.resellerSales / summary.totalTransactions) * 100).toFixed(1)}%` : '0%'
      },
    ]);

    // Style summary sheet header
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '7C3AED' }
    };

    // Format revenue cell as currency
    const revenueRow = summarySheet.getRow(3);
    revenueRow.getCell('value').numFmt = '"Rp " #,##0';

    // Add metadata sheet
    const metadataSheet = workbook.addWorksheet('Info Export');
    metadataSheet.columns = [
      { header: 'Keterangan', key: 'label', width: 20 },
      { header: 'Nilai', key: 'value', width: 30 }
    ];

    const filterInfo = [];
    if (status !== 'all') filterInfo.push(`Status: ${status}`);
    if (dateFrom) filterInfo.push(`Dari: ${dateFrom}`);
    if (dateTo) filterInfo.push(`Sampai: ${dateTo}`);
    if (resellerId && resellerId !== 'all') {
      if (resellerId === 'direct') {
        filterInfo.push('Reseller: Direct Sales Only');
      } else {
        filterInfo.push(`Reseller ID: ${resellerId}`);
      }
    }

    metadataSheet.addRows([
      { label: 'Laporan', value: 'Data Transaksi Toko' },
      { label: 'Tanggal Export', value: new Date().toLocaleString('id-ID') },
      { label: 'Filter Applied', value: filterInfo.join(', ') || 'Semua data' },
      { label: 'Total Records', value: transactions.length },
      { label: 'Exported By', value: session.user.email },
      { label: 'Format', value: format.toUpperCase() },
    ]);

    // Style metadata sheet
    metadataSheet.getRow(1).font = { bold: true };
    metadataSheet.getColumn(1).font = { bold: true };

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `Transaksi_Export_${timestamp}.xlsx`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export transactions' },
      { status: 500 }
    );
  }
}
