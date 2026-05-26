import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Wallet, ArrowRightLeft, Lock, Unlock, DownloadCloud } from 'lucide-react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { WalletDetailPanel } from './WalletDetailPanel';

const mockWallets = [
  { id: 'wal_09xs12', type: 'Customer', user: 'John Doe', tier: 'Tier 1', balance: '$240.50', status: 'active' },
  { id: 'wal_77bcn3', type: 'Merchant', user: 'Tech Store', tier: 'Business', balance: '$12,450.00', status: 'active' },
  { id: 'wal_12zmx2', type: 'Customer', user: 'Jane Smith', tier: 'Tier 2', balance: '$1,200.00', status: 'frozen' },
  { id: 'wal_99kxp8', type: 'Escrow', user: 'NGO Aid Campaign', tier: 'Enterprise', balance: '$0.00', status: 'active' },
  { id: 'wal_44lqs1', type: 'Treasury', user: 'Monivexa Fees', tier: 'Internal', balance: '$45,000.00', status: 'active' },
];

export default function WalletsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);

  const columns = [
    {
      accessorKey: 'id',
      header: 'Wallet ID',
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-indigo-600 hover:underline cursor-pointer">{getValue()}</span>
    },
    {
      accessorKey: 'user',
      header: 'Owner',
      cell: ({ getValue }: any) => <span className="text-sm font-medium text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'type',
      header: 'Wallet Type',
      cell: ({ getValue }: any) => <span className="text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'tier',
      header: 'KYC Tier',
      cell: ({ getValue }: any) => <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">{getValue()}</Badge>
    },
    {
      accessorKey: 'balance',
      header: 'Current Balance',
      cell: ({ getValue }: any) => <span className="font-semibold text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        return (
          <Badge variant="outline" className={s === 'active' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-red-200 text-red-700 bg-red-50 capitalize'}>
            {s}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const isFrozen = row.original.status === 'frozen';
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View Ledger">
              <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={isFrozen ? 'Unfreeze' : 'Freeze Wallet'}>
              {isFrozen ? <Unlock className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground/70" />}
            </Button>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockWallets,
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
            <Wallet className="w-6 h-6 text-blue-500" />
            Wallet Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage e-money issuance, ecosystem liquidity, and user balances.</p>
        </div>
        <Button variant="outline" className="bg-card gap-2 text-muted-foreground">
          <DownloadCloud className="w-4 h-4" /> Export Ledger
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-primary-foreground shadow-xl shadow-slate-900/10 border-transparent overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-slate-800 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest mb-1">Total System Liquidity</p>
            <h2 className="text-4xl font-light tracking-tight mb-4">$5,492,000.00</h2>
            <div className="flex items-center justify-between text-xs font-medium border-t border-slate-800 pt-4 mt-4">
              <span className="text-muted-foreground/70">Supported by central reserve</span>
              <span className="text-emerald-400">Fully collateralized</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/60 bg-card md:col-span-2">
          <CardContent className="p-6 h-full flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-foreground mb-4">Liquidity Distribution</h3>
            <div className="flex h-4 rounded-full overflow-hidden mb-3">
              <div className="bg-blue-500 w-[60%]" title="Customer Wallets: 60%"></div>
              <div className="bg-indigo-500 w-[30%]" title="Merchant Wallets: 30%"></div>
              <div className="bg-emerald-500 w-[10%]" title="Internal Treasury: 10%"></div>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Customers (60%)</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Merchants (30%)</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Treasury (10%)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search wallet ID or user..." 
                className="pl-9 h-9 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                      <th key={header.id} className="px-6 py-3 font-medium">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border/40 bg-card">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-muted/30/60 transition-colors cursor-pointer" onClick={() => setSelectedWalletId(row.original.id)}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap" onClick={(e) => {
                        if (cell.column.id === 'actions') {
                          e.stopPropagation();
                        }
                      }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Detail Slide-over */}
      {selectedWalletId && (
        <>
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" onClick={() => setSelectedWalletId(null)} />
          <WalletDetailPanel walletId={selectedWalletId} onClose={() => setSelectedWalletId(null)} />
        </>
      )}
    </div>
  );
}
