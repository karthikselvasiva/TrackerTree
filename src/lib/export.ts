import * as XLSX from 'xlsx';
import type { Transaction, Category } from '@/types';
import { formatDate, formatCurrency } from './utils';

export function exportToCSV(transactions: Transaction[], categories: Category[], filename: string = 'transactions') {
  const data = transactions.map((t) => {
    const cat = categories.find((c) => c.id === t.category_id);
    return {
      Date: formatDate(t.date),
      Type: t.type === 'income' ? 'Income' : 'Expense',
      Category: cat?.name || 'Unknown',
      Amount: t.amount,
      'Payment Mode': t.payment_mode.toUpperCase(),
      Status: t.status,
      'UPI Ref': t.upi_ref || '',
      Tags: t.tags || '',
      Notes: t.notes || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  XLSX.writeFile(wb, `${filename}.csv`);
}

export function exportToExcel(transactions: Transaction[], categories: Category[], filename: string = 'transactions') {
  const data = transactions.map((t) => {
    const cat = categories.find((c) => c.id === t.category_id);
    return {
      Date: formatDate(t.date),
      Type: t.type === 'income' ? 'Income' : 'Expense',
      Category: cat?.name || 'Unknown',
      Amount: t.amount,
      'Formatted Amount': formatCurrency(t.amount),
      'Payment Mode': t.payment_mode.toUpperCase(),
      Status: t.status,
      'UPI Ref': t.upi_ref || '',
      Tags: t.tags || '',
      Notes: t.notes || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { width: 15 }, { width: 10 }, { width: 15 }, { width: 12 },
    { width: 15 }, { width: 15 }, { width: 10 }, { width: 20 },
    { width: 12 }, { width: 30 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
