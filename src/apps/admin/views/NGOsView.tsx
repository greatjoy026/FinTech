import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, HeartHandshake, MoreHorizontal, CheckCircle2, XCircle, Clock, Plus, BarChart3, Users, DollarSign, Map, Zap, Send, Building } from 'lucide-react';
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

const mockNGOs = [
  { id: 'ngo_101', name: 'Global Relief Foundation', focus: 'Disaster Relief', disbursed: '$1.2M', status: 'active', joined: 'Jan 15, 2023', kyc_status: 'verified' },
  { id: 'ngo_102', name: 'EduCare Network', focus: 'Education', disbursed: '$450K', status: 'active', joined: 'Mar 10, 2023', kyc_status: 'verified' },
  { id: 'ngo_103', name: 'Clean Water Initiative', focus: 'Infrastructure', disbursed: '$0', status: 'pending', joined: 'Oct 26, 2023', kyc_status: 'review' },
  { id: 'ngo_104', name: 'Health First Aid', focus: 'Medical', disbursed: '$890K', status: 'active', joined: 'Feb 05, 2023', kyc_status: 'verified' },
  { id: 'ngo_105', name: 'Urban Shelter Assoc', focus: 'Housing', disbursed: '$120K', status: 'suspended', joined: 'Jun 01, 2023', kyc_status: 'rejected' },
];

export default function NGOsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'analytics' | 'disbursements' | 'map'>('directory');

  const columns = [
    {
      accessorKey: 'name',
      header: 'NGO Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-rose-50 flex items-center justify-center text-rose-500">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{row.original.id}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'focus',
      header: 'Primary Focus',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'disbursed',
      header: 'Total Disbursed',
      cell: ({ getValue }: any) => <span className="font-medium text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'kyc_status',
      header: 'Verification (KYC/AML)',
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
                <DropdownMenuItem>View dashboard</DropdownMenuItem>
                <DropdownMenuItem>Review documents</DropdownMenuItem>
                <DropdownMenuItem>Disbursement ledger</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Suspend access</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockNGOs,
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
            <HeartHandshake className="w-6 h-6 text-rose-500" />
            NGO Disbursement Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage partner NGOs, field disbursements, beneficiary analytics, and bulk transfers.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-rose-600 hover:bg-rose-700 text-primary-foreground gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Onboard NGO
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Partner NGOs</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">45</h2>
               </div>
               <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-600"><Building className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">+2 this month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Disbursed (YTD)</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">$14.5M</h2>
               </div>
               <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600"><DollarSign className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">Across 12 campaigns</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-amber-500">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Beneficiaries</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">104.2K</h2>
               </div>
               <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-600"><Users className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-amber-600 mt-2 font-medium">Verified individuals</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-blue-500">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Campaigns</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">18</h2>
               </div>
               <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600"><Zap className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-blue-600 mt-2 font-medium">Currently distributing aid</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-6 border-b border-border">
        <button 
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'directory' ? 'border-rose-600 text-rose-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          NGO Directory
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-rose-600 text-rose-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Beneficiary Analytics
        </button>
        <button 
          onClick={() => setActiveTab('disbursements')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'disbursements' ? 'border-rose-600 text-rose-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Disbursements & Transfers
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'map' ? 'border-rose-600 text-rose-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Geographic Map
        </button>
      </div>

      {activeTab === 'directory' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  placeholder="Search by NGO name, ID, or focus area..." 
                  className="pl-10 h-10 bg-card text-sm"
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
                <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
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
                No NGOs found.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
           <Card className="border-border shadow-sm col-span-2">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Beneficiary Growth & Registration</CardTitle>
               <CardDescription>New beneficiaries registered and verified per month.</CardDescription>
             </CardHeader>
             <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-md mx-6 mb-6">
                <div className="text-muted-foreground/70 text-sm flex flex-col items-center">
                   <BarChart3 className="w-8 h-8 mb-2 opacity-50"/>
                   [Beneficiary Analytics Chart Rendering]
                </div>
             </CardContent>
           </Card>
           
           <Card className="border-border shadow-sm">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Demographics Breakdown</CardTitle>
               <CardDescription>Beneficiary categories across active programs.</CardDescription>
             </CardHeader>
             <CardContent>
                 <div className="space-y-4">
                    {[
                      { name: 'Families with Children', percent: '42%' },
                      { name: 'Disaster Evacuees', percent: '28%' },
                      { name: 'Elderly Individuals', percent: '18%' },
                      { name: 'Students', percent: '12%' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-rose-500" style={{ opacity: 1 - (i * 0.2) }}></div>
                            <span className="text-sm font-medium text-foreground/90">{m.name}</span>
                         </div>
                         <span className="text-sm font-bold text-foreground">{m.percent}</span>
                      </div>
                    ))}
                 </div>
             </CardContent>
           </Card>
        </div>
      )}

      {activeTab === 'disbursements' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="shadow-sm border-border/60">
             <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
               <div className="flex justify-between items-center">
                  <div>
                     <CardTitle className="text-base">Field Disbursement Tracking</CardTitle>
                     <CardDescription>Track funds being pushed to field partners or mobile wallets.</CardDescription>
                  </div>
                  <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-primary-foreground gap-2 shadow-sm font-medium">
                    <Send className="w-3.5 h-3.5"/> Initiate Bulk Transfer
                  </Button>
               </div>
             </CardHeader>
             <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                          <tr>
                             <th className="px-6 py-4 font-semibold">Batch ID</th>
                             <th className="px-6 py-4 font-semibold">Target Campaign</th>
                             <th className="px-6 py-4 font-semibold">Recipients</th>
                             <th className="px-6 py-4 font-semibold">Total Fiat Value</th>
                             <th className="px-6 py-4 font-semibold">Disbursement Date</th>
                             <th className="px-6 py-4 font-semibold">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-border/40 bg-card">
                          {[
                             { id: 'b_8932', campaign: 'Flood Relief Q3', recipients: '4,200', amount: '$420,000', date: 'Today, 10:00 AM', status: 'processing' },
                             { id: 'b_8931', campaign: 'School Meal Subsidies', recipients: '1,500', amount: '$45,000', date: 'Yesterday', status: 'completed' },
                             { id: 'b_8930', campaign: 'Medical Aid Stipends', recipients: '850', amount: '$127,500', date: 'Oct 24, 2023', status: 'completed' },
                          ].map((item, i) => (
                              <tr key={i} className="hover:bg-muted/30">
                                 <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">{item.id}</td>
                                 <td className="px-6 py-4 font-medium text-foreground">{item.campaign}</td>
                                 <td className="px-6 py-4 text-muted-foreground">{item.recipients} wallets</td>
                                 <td className="px-6 py-4 font-bold text-foreground">{item.amount}</td>
                                 <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                                 <td className="px-6 py-4">
                                    <Badge variant="outline" className={
                                       item.status === 'completed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                                       'border-blue-200 text-blue-700 bg-blue-50'
                                    }>
                                       {item.status}
                                    </Badge>
                                 </td>
                              </tr>
                          ))}
                       </tbody>
                    </table>
                </div>
             </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'map' && (
        <Card className="border-border shadow-sm animate-in fade-in duration-300">
           <CardHeader className="border-b border-border/40 py-4 px-6 relative z-10 w-full flex-row justify-between bg-card/80 backdrop-blur-md items-center">
             <div className="flex flex-col">
               <CardTitle className="text-base text-foreground">Geographic Disbursement Map</CardTitle>
               <CardDescription>Heatmap of active beneficiaries and capital flows.</CardDescription>
             </div>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-card"><Filter className="w-3.5 h-3.5 mr-2"/> Region</Button>
                <Button variant="outline" size="sm" className="bg-card"><Zap className="w-3.5 h-3.5 mr-2"/> Campaign type</Button>
             </div>
           </CardHeader>
           <CardContent className="h-[500px] p-0 relative bg-muted flex items-center justify-center overflow-hidden">
               {/* Map overlay gradient effect */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-200 to-transparent pointer-events-none opacity-50 z-0"></div>
               
               <div className="relative z-10 text-muted-foreground text-sm flex flex-col items-center">
                   <Map className="w-12 h-12 mb-3 opacity-20 text-muted-foreground/70" />
                   <p className="font-medium text-muted-foreground">Geographic Data Visualization</p>
                   <p className="text-xs text-muted-foreground/70 mt-1">Requires mapping engine to be loaded.</p>
               </div>
               
               {/* Mock data points over map surface */}
               <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-rose-500/20 rounded-full animate-ping"></div>
               <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center">
                  <div className="absolute top-4 bg-card shadow-md text-[10px] whitespace-nowrap text-foreground/90 px-2 py-0.5 rounded border border-border font-bold">$1.2M Active</div>
               </div>

               <div className="absolute top-2/4 left-2/3 w-4 h-4 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDelay: '1s'}}></div>
               <div className="absolute top-2/4 left-2/3 w-2 h-2 bg-emerald-500 rounded-full flex items-center justify-center"></div>
               
               <div className="absolute top-1/4 left-2/4 w-4 h-4 bg-amber-500/20 rounded-full animate-ping" style={{ animationDelay: '0.5s'}}></div>
               <div className="absolute top-1/4 left-2/4 w-2.5 h-2.5 bg-amber-500 rounded-full flex items-center justify-center"></div>
           </CardContent>
        </Card>
      )}

    </div>
  );
}

