import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, FileText, MoreHorizontal, CheckCircle2, XCircle, Clock, Building2, Plus, Download } from 'lucide-react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockInvoices = [
  { id: 'inv_49201', issuer: 'TechHaven', recipient: 'Acme Corp', amount: '$45,000', status: 'paid', issuedDate: '2023-10-15', dueDate: '2023-11-15', type: 'B2B Services' },
  { id: 'inv_49202', issuer: 'Global Logistics', recipient: 'Fresh Foods Co', amount: '$12,400', status: 'pending', issuedDate: '2023-10-28', dueDate: '2023-11-28', type: 'Freight Services' },
  { id: 'inv_49203', issuer: 'CloudHost Inc', recipient: 'EduBooks', amount: '$8,500', status: 'overdue', issuedDate: '2023-09-01', dueDate: '2023-10-01', type: 'Infrastructure' },
  { id: 'inv_49204', issuer: 'Marketing Pros', recipient: 'TechHaven', amount: '$24,000', status: 'processing', issuedDate: '2023-10-30', dueDate: '2023-11-30', type: 'Ad Campaign' },
  { id: 'inv_49205', issuer: 'Office Supplies Co', recipient: 'Acme Corp', amount: '$1,200', status: 'paid', issuedDate: '2023-10-20', dueDate: '2023-11-20', type: 'Supplies' },
];

export default function InvoicesView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const columns = [
    {
      accessorKey: 'id',
      header: 'Invoice ID',
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'issuer',
      header: 'Issuer (Biller)',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
           <Building2 className="w-3.5 h-3.5 text-muted-foreground/70" />
           <span className="font-medium text-foreground">{row.original.issuer}</span>
        </div>
      )
    },
    {
      accessorKey: 'recipient',
      header: 'Recipient (Payer)',
      cell: ({ row }: any) => (
        <span className="text-sm text-foreground/90">{row.original.recipient}</span>
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
        if (s === 'paid') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>;
        if (s === 'processing') return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50"><Clock className="w-3 h-3 mr-1"/> Processing</Badge>;
        if (s === 'pending') return <Badge variant="outline" className="border-border text-foreground/90 bg-muted/30">Pending</Badge>;
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50"><XCircle className="w-3 h-3 mr-1"/> Overdue</Badge>;
      }
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ getValue }: any) => <span className="text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      id: 'actions',
      header: '',
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Invoice PDF</DropdownMenuItem>
                <DropdownMenuItem>Payment Trace</DropdownMenuItem>
                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Cancel Invoice</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockInvoices,
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
            <FileText className="w-6 h-6 text-sky-600" />
            B2B Invoicing Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage cross-business invoicing, recurring billing, and collection settlements.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card gap-2 text-muted-foreground">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-700 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Draft Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Volume (30D)</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$4.2M</h2>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">+12% vs last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding (Unpaid)</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$840K</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Across 150 invoices</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Overdue</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$145K</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Require follow-up</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-sky-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">Processing Today</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$24K</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Currently settling</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search invoice IDs or companies..." 
                className="pl-9 h-9 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-card"><Filter className="w-4 h-4"/> Filter Status</Button>
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
                      <td key={cell.id} className="px-6 py-3 whitespace-nowrap">
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
              No invoices found matching criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
