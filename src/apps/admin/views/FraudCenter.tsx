import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, ShieldX, ScanEye, Activity, Search, ShieldCheck, Crosshair, Users, ArrowUpRight, Copy, MapPin, StopCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel, SortingState } from '@tanstack/react-table';

const alerts = [
  { id: 'fra_01', type: 'Velocity', user: 'JD Corp (usr_8sf7)', score: 98, desc: '14 transactions in 3 minutes. Exceeds standard limit by 400%.', status: 'pending' },
  { id: 'fra_02', type: 'Duplicate', user: 'Global NGO Ltd', score: 85, desc: 'Exact same payout amount ($125,000) requested 3 times.', status: 'blocked' },
  { id: 'fra_03', type: 'Geolocation', user: 'Sarah Connor', score: 92, desc: 'IP mismatch. Source IP in Russia, previous login in Kenya 2h ago.', status: 'frozen' },
];

const suspiciousTxns = [
  { id: 'txn_99xx11', date: '10:15 UTC', user: 'Wade Corp', amount: '$45,000.00', ip: '192.168.1.1', reason: 'Unusually High Transfer', status: 'held' },
  { id: 'txn_99xx12', date: '09:42 UTC', user: 'Acme LLC', amount: '$5,210.00', ip: '203.0.113.41', reason: 'Card Country Mismatch', status: 'flagged' },
  { id: 'txn_99xx13', date: '08:21 UTC', user: 'John Doe', amount: '$150.00', ip: '198.51.100.9', reason: 'High-risk ISP (VPN)', status: 'flagged' },
];

export default function FraudCenter() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = [
    { accessorKey: 'id', header: 'Txn ID', cell: ({ row }: any) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span> },
    { accessorKey: 'date', header: 'Time' },
    { accessorKey: 'user', header: 'Entity', cell: ({ row }: any) => <span className="font-medium text-foreground">{row.original.user}</span> },
    { accessorKey: 'amount', header: 'Amount' },
    { accessorKey: 'reason', header: 'Trigger Reason', cell: ({ row }: any) => <span className="text-amber-600 font-medium text-xs">{row.original.reason}</span> },
    { accessorKey: 'status', header: 'Action Taken', cell: ({ row }: any) => {
        const isHeld = row.original.status === 'held';
        return <Badge variant="outline" className={isHeld ? "border-red-200 text-red-700 bg-red-50 text-[10px]" : "border-amber-200 text-amber-700 bg-amber-50 text-[10px]"}>
          {isHeld ? 'FUNDS HELD' : 'FLAGGED / MONITORED'}
        </Badge>
    }},
    { id: 'actions', cell: () => <Button variant="ghost" size="sm" className="h-7 text-xs">Review</Button> }
  ];

  const table = useReactTable({
    data: suspiciousTxns,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Fraud & Security Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time risk intelligence, transaction anomalies, and account monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-semibold text-emerald-700">Sentries Active</span>
          </div>
          <Button variant="outline" className="h-9 shadow-sm"><Activity className="w-4 h-4 mr-2"/> Alert Settings</Button>
        </div>
      </div>

      {/* Fraud Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground border-transparent shadow shadow-slate-900/10">
          <CardContent className="p-5 flex flex-col justify-between min-h-[140px]">
            <ScanEye className="w-5 h-5 text-indigo-400 mb-4" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Scanned (24H)</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold tracking-tighter">1.28M</p>
                 <span className="text-xs text-emerald-400">Stable</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between min-h-[140px]">
            <Crosshair className="w-5 h-5 text-rose-500 mb-4" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Interventions / Blocked</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold tracking-tighter text-foreground">142</p>
                 <span className="text-xs text-rose-500">+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between min-h-[140px]">
            <Users className="w-5 h-5 text-amber-500 mb-4" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Accounts Frozen</p>
               <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold tracking-tighter text-foreground">18</p>
                 <span className="text-xs text-amber-600">Pending Review</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between min-h-[140px]">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mb-4" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">False Positive Rate</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-3xl font-bold tracking-tighter text-foreground">0.04%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Left Column: Suspicious Transactions & Realtime Feed */}
         <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-border/60">
              <CardHeader className="border-b border-border/40 bg-muted/50 py-4 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-base text-foreground">Suspicious Transactions queue</CardTitle>
                   <CardDescription>Awaiting manual review by the Risk Team.</CardDescription>
                </div>
                <div className="relative w-64">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
                   <Input placeholder="Search ID or reason..." className="pl-9 h-9 text-sm bg-card" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border/40 uppercase">
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th key={header.id} className="px-5 py-3 font-semibold">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-muted/80 transition-colors">
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-5 py-3 whitespace-nowrap">
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

            <div className="flex items-center justify-between mt-8 mb-4">
               <h2 className="text-base font-bold text-foreground flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-500"/> Account Risk Scores</h2>
               <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">View All Accounts <ArrowUpRight className="w-3 h-3 ml-1"/></Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                  { name: 'JD Corp', id: 'usr_8sf7', score: 98, risk: 'Critical', signal: 'Volume Surge' },
                  { name: 'Sarah Connor', id: 'usr_12ma', score: 92, risk: 'High', signal: 'Geo Anomaly' },
                  { name: 'Tech Solutions', id: 'usr_9xks', score: 75, risk: 'Elevated', signal: 'Failed Auth Limit' },
                  { name: 'GreenOrg NGO', id: 'usr_0mna', score: 62, risk: 'Watch', signal: 'Dormant Login' },
               ].map((acc, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-semibold text-foreground">{acc.name}</span>
                           <span className="text-[10px] font-mono text-muted-foreground/70">{acc.id}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Trigger: {acc.signal}</div>
                     </div>
                     <div className="text-right">
                        <div className="text-xl font-black text-rose-600">{acc.score}/100</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{acc.risk}</div>
                     </div>
                  </div>
               ))}
            </div>

         </div>

         {/* Right Column: Realtime Alerts Feed */}
         <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between mb-2">
               <h2 className="text-base font-bold text-foreground flex items-center gap-2"><StopCircle className="w-4 h-4 text-rose-500"/> High Priority Actions</h2>
            </div>
            
            <div className="space-y-4">
              {alerts.map(alert => (
                <Card key={alert.id} className="border-border shadow-sm overflow-hidden flex flex-col relative group">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
                  <CardHeader className="p-4 pb-2">
                     <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 text-[10px] font-bold uppercase tracking-widest">
                          {alert.type} Alert
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground/70">Score: {alert.score}</span>
                     </div>
                     <CardTitle className="text-sm text-foreground mt-2">{alert.user}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col justify-between flex-1">
                     <p className="text-xs text-muted-foreground mb-4">{alert.desc}</p>
                     
                     <div className="flex flex-col gap-2 mt-auto">
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs h-8">Review Intervention</Button>
                        {alert.status !== 'frozen' && alert.status !== 'blocked' ? (
                          <Button size="sm" variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-xs h-8">
                             <ShieldX className="w-3.5 h-3.5 mr-1.5" /> Freeze Account Context
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 py-1 border border-rose-100 bg-rose-50 rounded-md">
                             <CheckCircle2 className="w-3.5 h-3.5" /> Account Protected (Frozen)
                          </div>
                        )}
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>

         </div>

      </div>
    </div>
  );
}

