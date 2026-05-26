import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, PiggyBank, MoreHorizontal, CheckCircle2, TrendingUp, Target, Users, Plus, Download, ShieldCheck } from 'lucide-react';
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

const mockSavingsPools = [
  { id: 'pool_121', name: 'Tech Ops Susu', type: 'Group Contribution', members: 12, balance: '$24,000', status: 'active', nextPayout: 'Nov 15, 2023' },
  { id: 'pool_122', name: 'Q4 Retreat Fund', type: 'Goal Savings', members: 1, balance: '$8,500', status: 'completed', nextPayout: '-' },
  { id: 'pool_123', name: 'Market Traders Ajo', type: 'Group Contribution', members: 45, balance: '$112,500', status: 'active', nextPayout: 'Oct 31, 2023' },
  { id: 'pool_124', name: 'Emergency Fund Cap', type: 'Locked Vault', members: 1, balance: '$5,000', status: 'locked', nextPayout: 'Jan 01, 2024' },
  { id: 'pool_125', name: 'Community Dev Fund', type: 'Donation Pool', members: 154, balance: '$42,300', status: 'active', nextPayout: 'Dec 01, 2023' },
];

export default function SavingsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const columns = [
    {
      accessorKey: 'name',
      header: 'Pool / Goal Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
            <PiggyBank className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{row.original.id}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }: any) => <span className="text-sm font-medium text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'members',
      header: 'Members',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{getValue()}</span>
    },
    {
      accessorKey: 'balance',
      header: 'Total Balance',
      cell: ({ getValue }: any) => <span className="font-semibold text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'completed') return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Completed</Badge>;
        if (s === 'active') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Active</Badge>;
        return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50"><ShieldCheck className="w-3 h-3 mr-1"/> Locked</Badge>;
      }
    },
    {
      accessorKey: 'nextPayout',
      header: 'Next Payout',
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
                <DropdownMenuItem>View Transactions</DropdownMenuItem>
                <DropdownMenuItem>Review Member List</DropdownMenuItem>
                <DropdownMenuItem>Force Unlock</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Freeze Pool</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockSavingsPools,
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
            <PiggyBank className="w-6 h-6 text-emerald-600" />
            Savings & Contributions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage individual goals, locked vaults, and group contribution (Ajo/Susu) pools.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card gap-2 text-muted-foreground">
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Create Managed Pool
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total AUM</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$12.4M</h2>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +8.4% this month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Group Pools</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">3,240</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Ajo / Susu plans</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locked Vaults</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">12,504</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Individual fixed goals</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Upcoming Payouts</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$450K</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search pools, goals, or group names..." 
                className="pl-9 h-9 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-card"><Filter className="w-4 h-4"/> Filter Types</Button>
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
              No savings pools found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
