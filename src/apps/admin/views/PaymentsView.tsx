import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, RefreshCcw, ArrowUpRight, ArrowDownRight, CreditCard, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { TransactionDetailPanel } from './TransactionDetailPanel';

const mockPayments = [
  { id: 'txn_98fa72', amount: '$1,250.00', status: 'completed', type: 'collection', method: 'Card', user: 'JD Corp', time: '2 mins ago' },
  { id: 'txn_32ns81', amount: '$450.00', status: 'pending', type: 'collection', method: 'Bank Transfer', user: 'Acme Inc', time: '15 mins ago' },
  { id: 'txn_77vcs1', amount: '$8,900.00', status: 'failed', type: 'payout', method: 'Wire', user: 'Tech Innovations', time: '1 hr ago' },
  { id: 'txn_12mx90', amount: '$120.00', status: 'completed', type: 'collection', method: 'Mobile Money', user: 'Alice W.', time: '2 hrs ago' },
  { id: 'txn_11pqr3', amount: '$45,000.00', status: 'completed', type: 'payout', method: 'Wire', user: 'Lincoln High', time: '3 hrs ago' },
  { id: 'txn_65tyu3', amount: '$24.50', status: 'completed', type: 'collection', method: 'Card', user: 'Sarah C.', time: '4 hrs ago' },
  { id: 'txn_89bnm1', amount: '$12,400.00', status: 'pending', type: 'payout', method: 'Bank Transfer', user: 'Global Aid', time: '5 hrs ago' },
];

export default function PaymentsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const columns = [
    {
      accessorKey: 'id',
      header: 'Transaction ID',
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ getValue }: any) => <span className="font-semibold text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'completed') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>;
        if (s === 'pending') return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>;
      }
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }: any) => {
        const t = getValue();
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize font-medium">
            {t === 'collection' ? <ArrowDownRight className="w-4 h-4 text-emerald-500" /> : <ArrowUpRight className="w-4 h-4 text-indigo-500" />}
            {t}
          </div>
        );
      }
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'user',
      header: 'Customer / Entity',
      cell: ({ getValue }: any) => <span className="text-sm font-medium text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'time',
      header: 'Time',
      cell: ({ getValue }: any) => <span className="text-xs text-muted-foreground">{getValue()}</span>
    }
  ];

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const table = useReactTable({
    data: mockPayments,
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
            <CreditCard className="w-6 h-6 text-indigo-500" />
            Payments Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time ledger of inbound collections and outbound disbursements.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card" onClick={() => window.location.reload()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Sync Ledger
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Volume Today', value: '$1.2M', trend: '+12%', color: 'text-emerald-500' },
          { label: 'Settled', value: '$950K', trend: '98% Success', color: 'text-indigo-500' },
          { label: 'In Transit', value: '$250K', trend: 'Bank Processing', color: 'text-amber-500' },
          { label: 'Failed/Refunds', value: '$8.9K', trend: 'Requires action', color: 'text-red-500' },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm border-border/60">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <span className={`text-[10px] font-medium ${stat.color} bg-muted/30 px-1.5 py-0.5 rounded`}>{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Provider Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">St</div>
                <div>
                   <div className="text-sm font-semibold text-foreground">Stripe</div>
                   <div className="text-xs text-muted-foreground">Cards & Wallets</div>
                </div>
             </div>
             <div className="text-right">
                <div className="text-sm font-bold text-foreground">$850K</div>
                <div className="text-[10px] text-emerald-600 font-mono">99.9% Succ</div>
             </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-600 font-bold">Fl</div>
                <div>
                   <div className="text-sm font-semibold text-foreground">Flutterwave</div>
                   <div className="text-xs text-muted-foreground">Africa Local</div>
                </div>
             </div>
             <div className="text-right">
                <div className="text-sm font-bold text-foreground">$215K</div>
                <div className="text-[10px] text-emerald-600 font-mono">98.5% Succ</div>
             </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-amber-50 flex items-center justify-center text-amber-600 font-bold">Mo</div>
                <div>
                   <div className="text-sm font-semibold text-foreground">MTN MoMo</div>
                   <div className="text-xs text-muted-foreground">Mobile Money</div>
                </div>
             </div>
             <div className="text-right">
                <div className="text-sm font-bold text-foreground">$135K</div>
                <div className="text-[10px] text-amber-600 font-mono">94.2% Succ</div>
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search transaction ID, amount, or user..." 
                className="pl-10 h-10 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select className="h-10 px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select className="h-10 px-3 py-2 bg-card border border-border rounded-md text-sm text-foreground/90 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="">All Types</option>
                <option value="collection">Collection</option>
                <option value="payout">Payout</option>
              </select>
              <Button variant="outline" size="sm" className="h-10 gap-2 px-4 bg-card"><Filter className="w-4 h-4"/> Filters</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto w-full">
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
                  <tr key={row.id} className="hover:bg-muted/30/60 transition-colors group cursor-pointer" onClick={() => setSelectedTransactionId((row.original as any).id)}>
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

          {/* Mobile Transaction Cards */}
          <div className="md:hidden flex flex-col divide-y divide-border/40">
            {table.getRowModel().rows.map(row => {
              const payment = row.original as any;
              return (
                <div key={row.id} className="p-4 bg-card active:bg-muted/30 transition-colors flex flex-col gap-3 cursor-pointer" onClick={() => setSelectedTransactionId(payment.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="font-semibold text-foreground">{payment.user}</span>
                       <span className="text-[10px] text-muted-foreground/70 font-mono">{payment.id}</span>
                    </div>
                    <span className="font-bold text-foreground">{payment.amount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium capitalize">
                      {payment.type === 'collection' ? <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />}
                      {payment.type} • {payment.method}
                    </div>
                    
                    <div>
                      {payment.status === 'completed' ? <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-[10px] py-0 h-5"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge> :
                       payment.status === 'pending' ? <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 text-[10px] py-0 h-5"><Clock className="w-3 h-3 mr-1"/> Pending</Badge> :
                       <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 text-[10px] py-0 h-5"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Slide-over */}
      {selectedTransactionId && (
        <>
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" onClick={() => setSelectedTransactionId(null)} />
          <TransactionDetailPanel transactionId={selectedTransactionId} onClose={() => setSelectedTransactionId(null)} />
        </>
      )}
    </div>
  );
}
