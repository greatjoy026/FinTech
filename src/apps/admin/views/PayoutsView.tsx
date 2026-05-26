import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Send, Clock, CheckCircle2, XCircle, ArrowUpRight, Building2, UploadCloud, Download } from 'lucide-react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { PayoutDetailPanel } from './PayoutDetailPanel';

const mockPayouts = [
  { id: 'po_98fa72', batch: 'Batch-091', amount: '$45,000.00', status: 'completed', method: 'Wire', details: 'NGO Relief Funds', time: '2 mins ago' },
  { id: 'po_32ns81', batch: 'Manual', amount: '$1,250.00', status: 'pending_approval', method: 'Bank Transfer', details: 'Merchant Settlement', time: '15 mins ago' },
  { id: 'po_77vcs1', batch: 'Batch-092', amount: '$120,500.00', status: 'processing', method: 'ACH', details: 'Payroll Execution', time: '1 hr ago' },
  { id: 'po_12mx90', batch: 'Manual', amount: '$50.00', status: 'failed', method: 'Mobile Money', details: 'Customer Refund', time: '2 hrs ago' },
  { id: 'po_11pqr3', batch: 'Batch-090', amount: '$8,900.00', status: 'completed', method: 'Wire', details: 'School Grants', time: '5 hrs ago' },
];

export default function PayoutsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  const columns = [
    {
      accessorKey: 'id',
      header: 'Payout ID',
      cell: ({ getValue, row }: any) => (
        <div>
          <span className="font-mono text-xs text-foreground/90">{getValue()}</span>
          <div className="text-[10px] text-muted-foreground/70 mt-0.5">{row.original.batch}</div>
        </div>
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
        if (s === 'completed') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 pb-0.5"><CheckCircle2 className="w-3 h-3 mr-1 mb-px"/> Completed</Badge>;
        if (s === 'processing') return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 pb-0.5"><Clock className="w-3 h-3 mr-1 mb-px"/> Processing</Badge>;
        if (s === 'pending_approval') return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 pb-0.5"><Clock className="w-3 h-3 mr-1 mb-px"/> Pending Appr.</Badge>;
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 pb-0.5"><XCircle className="w-3 h-3 mr-1 mb-px"/> Failed</Badge>;
      }
    },
    {
      accessorKey: 'method',
      header: 'Route / Method',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5"/> {getValue()}</span>
    },
    {
      accessorKey: 'details',
      header: 'Details / Purpose',
      cell: ({ getValue }: any) => <span className="text-sm font-medium text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'time',
      header: 'Time',
      cell: ({ getValue }: any) => <span className="text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => (
        <div className="flex justify-end">
          {row.original.status === 'pending_approval' ? (
            <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => setSelectedPayoutId((row.original as any).id)}>Approve</Button>
          ) : (
             <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedPayoutId((row.original as any).id)}>Details</Button>
          )}
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: mockPayouts,
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
            <Send className="w-6 h-6 text-indigo-500" />
            Payouts & Disbursements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage outbound settlements, payroll processing, and system withdrawals.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card text-foreground/90 border-border hover:bg-muted/30">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload Batch CSV
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-primary-foreground">
            <ArrowUpRight className="w-4 h-4 mr-2" /> New Payout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Disbursed (Today)', value: '$175.4K', sub: '12 batches, 451 txns', color: 'text-indigo-600' },
          { label: 'Pending Approval', value: '$8,450.00', sub: '4 transactions require review', color: 'text-amber-600' },
          { label: 'Processing', value: '$45,000.00', sub: 'Currently at partner bank', color: 'text-blue-600' },
        ].map(stat => (
          <Card key={stat.label} className="shadow-sm border-border/60 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <div className="mt-2">
                <p className={`text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
            <Input 
              placeholder="Search via Payout ID, batch ID..." 
              className="pl-9 h-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-card"><Filter className="w-4 h-4"/> Filter Status</Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-card"><Download className="w-4 h-4"/> Export</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase tracking-wider">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-3.5 font-medium cursor-pointer hover:text-foreground" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border/40 bg-card">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-muted/30/60 transition-colors group cursor-pointer" onClick={() => setSelectedPayoutId((row.original as any).id)}>
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
          {table.getRowModel().rows.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No payouts found matching your search.
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPayoutId && (
        <>
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" onClick={() => setSelectedPayoutId(null)} />
          <PayoutDetailPanel payoutId={selectedPayoutId} onClose={() => setSelectedPayoutId(null)} />
        </>
      )}
    </div>
  );
}
