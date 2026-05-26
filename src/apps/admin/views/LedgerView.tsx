import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, BookOpen, Download, ArrowRightLeft, Calendar } from 'lucide-react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';

const mockLedgerEntries = [
  { id: 'ldg_001', date: '2023-10-27 14:30:00', description: 'Customer deposit settlement', debit: '1010-Bank', credit: '2010-CustomerLiab', amount: '$45,000.00', status: 'settled' },
  { id: 'ldg_002', date: '2023-10-27 14:15:00', description: 'Merchant withdrawal', debit: '2015-MerchantLiab', credit: '1010-Bank', amount: '$1,250.00', status: 'settled' },
  { id: 'ldg_003', date: '2023-10-27 13:45:00', description: 'Transaction fee revenue', debit: '2010-CustomerLiab', credit: '4010-TxnFees', amount: '$2.50', status: 'settled' },
  { id: 'ldg_004', date: '2023-10-27 12:30:00', description: 'Internal treasury transfer', debit: '1020-Reserve', credit: '1010-Bank', amount: '$100,000.00', status: 'pending' },
  { id: 'ldg_005', date: '2023-10-27 11:00:00', description: 'Subscription fee revenue', debit: '2015-MerchantLiab', credit: '4020-SubFees', amount: '$29.99', status: 'settled' },
  { id: 'ldg_006', date: '2023-10-27 09:15:00', description: 'Payroll disbursement funding', debit: '1010-Bank', credit: '2020-PayrollLiab', amount: '$120,500.00', status: 'settled' },
];

export default function LedgerView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const columns = [
    {
      accessorKey: 'id',
      header: 'Entry ID',
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'date',
      header: 'Date & Time',
      cell: ({ getValue }: any) => <span className="text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }: any) => <span className="text-sm font-medium text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'debit',
      header: 'Debit Account',
      cell: ({ getValue }: any) => (
        <Badge variant="outline" className="font-mono text-[10px] bg-muted/30 text-muted-foreground border-border">
          DR: {getValue()}
        </Badge>
      )
    },
    {
      accessorKey: 'credit',
      header: 'Credit Account',
      cell: ({ getValue }: any) => (
        <Badge variant="outline" className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
          CR: {getValue()}
        </Badge>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }: any) => <span className="font-semibold text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        return (
          <span className={`text-[10px] font-medium uppercase tracking-wider ${s === 'settled' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {s}
          </span>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockLedgerEntries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-foreground/90" />
            General Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable double-entry accounting records for all system transactions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" /> Date Range
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Assets</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$5,492,000.00</h2>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">Matches Liabilities</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer Liabilities</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$3,295,200.00</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Wallet Balances</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Merchant Liabilities</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$1,647,600.00</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Pending Settlements</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-indigo-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">System Revenue</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$549,200.00</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Fees & Subscriptions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search ledger entries, accounts..." 
                className="pl-9 h-9 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-card"><Filter className="w-4 h-4"/> Filters</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-3 font-medium cursor-pointer hover:text-foreground" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border/40 bg-card">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-muted/30/60 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table.getRowModel().rows.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No entries found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
