import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShieldCheck, MoreHorizontal, CheckCircle2, Clock, AlertTriangle, Scale, Plus, Download } from 'lucide-react';
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

const mockEscrowTransactions = [
  { id: 'esc_49921', buyer: 'Alice M.', seller: 'Tech Store Ltd', product: 'MacBook Pro M2', amount: '$1,299.00', status: 'held', date: '2023-11-01', releaseDate: '2023-11-08' },
  { id: 'esc_49922', buyer: 'Acme Corp', seller: 'Design Agency X', product: 'Website Redesign', amount: '$4,500.00', status: 'released', date: '2023-10-15', releaseDate: '2023-10-30' },
  { id: 'esc_49923', buyer: 'John D.', seller: 'Auto Dealers Co', product: 'Used Honda Civic', amount: '$8,500.00', status: 'disputed', date: '2023-10-28', releaseDate: '-' },
  { id: 'esc_49924', buyer: 'Sarah B.', seller: 'Freelance Hub', product: 'SEO Optimization', amount: '$450.00', status: 'held', date: '2023-11-02', releaseDate: '2023-11-16' },
  { id: 'esc_49925', buyer: 'Global Trade', seller: 'Import/Export Inc', product: 'Bulk Electronics', amount: '$24,000.00', status: 'refunded', date: '2023-10-10', releaseDate: '-' },
];

export default function EscrowView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const columns = [
    {
      accessorKey: 'id',
      header: 'Escrow ID',
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'product',
      header: 'Product / Service',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
           <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground/70" />
           <span className="font-medium text-foreground">{row.original.product}</span>
        </div>
      )
    },
    {
      accessorKey: 'buyer',
      header: 'Buyer',
      cell: ({ getValue }: any) => <span className="text-sm text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'seller',
      header: 'Seller',
      cell: ({ getValue }: any) => <span className="text-sm text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Amount Held',
      cell: ({ getValue }: any) => <span className="font-semibold text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'released') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Released</Badge>;
        if (s === 'held') return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50"><Clock className="w-3 h-3 mr-1"/> Funds Held</Badge>;
        if (s === 'disputed') return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50"><AlertTriangle className="w-3 h-3 mr-1"/> Disputed</Badge>;
        return <Badge variant="outline" className="border-border text-foreground/90 bg-muted/30">Refunded</Badge>;
      }
    },
    {
      accessorKey: 'releaseDate',
      header: 'Est. Release',
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
                <DropdownMenuItem>View Agreement</DropdownMenuItem>
                <DropdownMenuItem>Trace milestones</DropdownMenuItem>
                <DropdownMenuItem>Force Release</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-amber-600">Open Dispute Resolution</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Refund Buyer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockEscrowTransactions,
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
            <Scale className="w-6 h-6 text-indigo-600" />
            Marketplace Escrow
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage secure payments, milestone releases, and dispute resolutions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card gap-2 text-muted-foreground">
             <Download className="w-4 h-4" /> Export Register
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> New Escrow Contract
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Value Locked</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$4.2M</h2>
            <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">Across active contracts</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Active Contracts</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">1,245</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Awaiting fulfillment</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Active Disputes</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">12</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Action required</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Released Today</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$145K</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Successful completions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search contracts, buyers, or sellers..." 
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
              No escrow contracts found matching criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
