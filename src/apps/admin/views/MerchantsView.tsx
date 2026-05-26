import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Store, MoreHorizontal, CheckCircle2, XCircle, Clock, Building, Plus, ArrowUpRight, BarChart3, QrCode, Banknote, Landmark } from 'lucide-react';
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

const mockMerchants = [
  { id: 'm_001', name: 'Acme Supermart', category: 'Retail', volume: '$124.5K', status: 'active', joined: 'Oct 15, 2023', kyc_status: 'verified' },
  { id: 'm_002', name: 'TechHaven Electronics', category: 'Electronics', volume: '$89.2K', status: 'active', joined: 'Oct 10, 2023', kyc_status: 'verified' },
  { id: 'm_003', name: 'Fresh Foods Co', category: 'Grocery', volume: '$45.1K', status: 'pending', joined: 'Oct 26, 2023', kyc_status: 'review' },
  { id: 'm_004', name: 'Global Logistics', category: 'Services', volume: '$210.0K', status: 'active', joined: 'Sep 05, 2023', kyc_status: 'verified' },
  { id: 'm_005', name: 'Urban Coffee', category: 'Food & Beverage', volume: '$12.4K', status: 'suspended', joined: 'Oct 01, 2023', kyc_status: 'rejected' },
  { id: 'm_006', name: 'EduBooks Store', category: 'Education', volume: '$34.8K', status: 'active', joined: 'Aug 22, 2023', kyc_status: 'verified' },
];

export default function MerchantsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'analytics' | 'settlements' | 'payouts'>('directory');

  const columns = [
    {
      accessorKey: 'name',
      header: 'Merchant Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
            <Building className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{row.original.id}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'volume',
      header: 'Est. Volume',
      cell: ({ getValue }: any) => <span className="font-medium text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'kyc_status',
      header: 'KYC Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'verified') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Verified</Badge>;
        if (s === 'review') return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50"><Clock className="w-3 h-3 mr-1"/> In Review</Badge>;
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50"><XCircle className="w-3 h-3 mr-1"/> Rejected</Badge>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Account Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        return (
          <span className={`text-xs font-medium capitalize flex items-center gap-1.5 ${s === 'active' ? 'text-emerald-600' : s === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s === 'active' ? 'bg-emerald-500' : s === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            {s}
          </span>
        );
      }
    },
    {
      accessorKey: 'joined',
      header: 'Joined Date',
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
                <DropdownMenuItem>View profile</DropdownMenuItem>
                <DropdownMenuItem>Review KYC</DropdownMenuItem>
                <DropdownMenuItem>Transaction history</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Suspend merchant</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockMerchants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting }
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-500" />
            Merchant Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage merchant profiles, QR payments, settlements and payouts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-primary-foreground gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Onboard Merchant
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Merchants</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">1,248</h2>
               </div>
               <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600"><Store className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">+12 this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total TPV (30D)</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">$48.5M</h2>
               </div>
               <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground"><BarChart3 className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">+5.2% vs last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending Settlements</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">$1.2M</h2>
               </div>
               <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-600"><Banknote className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-amber-600 mt-2 font-medium">To be paid out today</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-indigo-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">QR Code Volume</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">428k</h2>
               </div>
               <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600"><QrCode className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-indigo-600 mt-2 font-medium">Transactions processed</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-6 border-b border-border">
        <button 
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'directory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Merchant Directory
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Merchant Analytics
        </button>
        <button 
          onClick={() => setActiveTab('settlements')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settlements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Settlements & Schedules
        </button>
        <button 
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'payouts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Payout Control
        </button>
      </div>

      {activeTab === 'directory' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  placeholder="Search by name, ID, or category..." 
                  className="pl-10 h-10 bg-card"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-10 gap-1.5 bg-card"><Filter className="w-4 h-4"/> Filter Status</Button>
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
                        <th key={header.id} className="px-6 py-4 font-semibold cursor-pointer hover:text-foreground" onClick={header.column.getToggleSortingHandler()}>
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
                No merchants found.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
           <Card className="border-border shadow-sm col-span-2">
             <CardHeader>
               <CardTitle className="text-base text-foreground">QR Payment Analytics</CardTitle>
               <CardDescription>Scan volume and transaction processing success rates across all static and dynamic QRs.</CardDescription>
             </CardHeader>
             <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-md mx-6 mb-6">
                <div className="text-muted-foreground/70 text-sm flex flex-col items-center">
                   <BarChart3 className="w-8 h-8 mb-2 opacity-50"/>
                   [QR Scan Volume Chart Rendering]
                </div>
             </CardContent>
           </Card>
           
           <Card className="border-border shadow-sm">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Top Performing Merchants</CardTitle>
               <CardDescription>By transaction volume (30D)</CardDescription>
             </CardHeader>
             <CardContent>
                 <div className="space-y-4">
                    {[
                      { name: 'Global Logistics', vol: '$210.0K' },
                      { name: 'Acme Supermart', vol: '$124.5K' },
                      { name: 'TechHaven Electronics', vol: '$89.2K' },
                      { name: 'Fresh Foods Co', vol: '$45.1K' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{i+1}</div>
                            <span className="text-sm font-medium text-foreground/90">{m.name}</span>
                         </div>
                         <span className="text-sm font-bold text-foreground">{m.vol}</span>
                      </div>
                    ))}
                 </div>
             </CardContent>
           </Card>
        </div>
      )}

      {activeTab === 'settlements' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50">
             <div className="flex justify-between items-center">
                <div>
                   <CardTitle className="text-base">Settlement Schedules</CardTitle>
                   <CardDescription>View upcoming batch settlements and payout configurations.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-card"><Landmark className="w-4 h-4"/> Configure Settlement Rules</Button>
             </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { name: 'T+1 Settlement', count: '845 Merchants', next: 'Today, 23:00 UTC', vol: '$840.5K' },
                   { name: 'T+2 Settlement', count: '210 Merchants', next: 'Tomorrow, 23:00 UTC', vol: '$125.0K' },
                   { name: 'Weekly (Fridays)', count: '125 Merchants', next: 'Nov 1, 23:00 UTC', vol: '$245.2K' },
                 ].map((s, i) => (
                    <div key={i} className="border border-border rounded-lg p-5 bg-card">
                       <h3 className="font-bold text-foreground mb-1">{s.name}</h3>
                       <p className="text-xs text-muted-foreground mb-4">{s.count}</p>
                       
                       <div className="space-y-2 mb-5">
                          <div className="flex justify-between text-xs">
                             <span className="text-muted-foreground">Next Batch:</span>
                             <span className="font-medium text-foreground">{s.next}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                             <span className="text-muted-foreground">Est. Volume:</span>
                             <span className="font-medium text-foreground">{s.vol}</span>
                          </div>
                       </div>
                       
                       <Button variant="outline" className="w-full text-xs h-8">View Batch Details</Button>
                    </div>
                 ))}
             </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payouts' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50">
            <CardTitle className="text-base text-foreground">Merchant Payout Control</CardTitle>
            <CardDescription>Manage fund holds, release blocked payouts, or manually trigger disbursements.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Entity</th>
                          <th className="px-6 py-4 font-semibold">Held Amount</th>
                          <th className="px-6 py-4 font-semibold">Reason</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                       {[
                          { entity: 'Urban Coffee', id: 'm_005', amt: '$3,450.00', reason: 'High Chargeback Rate', status: 'held' },
                          { entity: 'Sneaker Headz', id: 'm_219', amt: '$12,000.00', reason: 'Suspicious Velocity Flag', status: 'reviewing' },
                       ].map((item, i) => (
                           <tr key={i} className="hover:bg-muted/30">
                              <td className="px-6 py-4">
                                 <div className="font-medium text-foreground">{item.entity}</div>
                                 <div className="text-[10px] text-muted-foreground font-mono">{item.id}</div>
                              </td>
                              <td className="px-6 py-4 font-bold text-foreground">{item.amt}</td>
                              <td className="px-6 py-4 text-muted-foreground">{item.reason}</td>
                              <td className="px-6 py-4">
                                 <Badge variant="outline" className={item.status === 'held' ? 'border-red-200 text-red-700 bg-red-50' : 'border-amber-200 text-amber-700 bg-amber-50'}>
                                    {item.status === 'held' ? 'Funds Held' : 'Under Review'}
                                 </Badge>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex gap-2">
                                     <Button size="sm" variant="outline" className="h-8 text-xs bg-card text-emerald-600 border-emerald-200 hover:bg-emerald-50">Release Funds</Button>
                                     <Button size="sm" variant="outline" className="h-8 text-xs bg-card">View Case</Button>
                                 </div>
                              </td>
                           </tr>
                       ))}
                    </tbody>
                 </table>
             </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

