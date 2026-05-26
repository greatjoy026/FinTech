import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, GraduationCap, MoreHorizontal, CheckCircle2, XCircle, Clock, Building, Plus, BarChart3, CreditCard, Banknote, AlertCircle, ArrowUpRight } from 'lucide-react';
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

const mockSchools = [
  { id: 'sch_492', name: 'Lincoln High School', district: 'District 4', students: 1250, status: 'active', joined: 'Sep 01, 2023', kyc_status: 'verified' },
  { id: 'sch_493', name: 'Oakridge Elementary', district: 'District 2', students: 840, status: 'active', joined: 'Sep 15, 2023', kyc_status: 'verified' },
  { id: 'sch_494', name: 'St. Mary\'s Academy', district: 'Private', students: 420, status: 'pending', joined: 'Oct 20, 2023', kyc_status: 'review' },
  { id: 'sch_495', name: 'Westside Tech', district: 'District 9', students: 2100, status: 'active', joined: 'Aug 10, 2023', kyc_status: 'verified' },
  { id: 'sch_496', name: 'Greenville Middle', district: 'District 4', students: 650, status: 'suspended', joined: 'Oct 05, 2023', kyc_status: 'rejected' },
];

const mockPayments = [
  { id: 'txn_901', parent: 'Alice Johnson', student: 'Tommy Johnson', amount: '$450.00', status: 'completed', date: 'Today, 09:41 AM' },
  { id: 'txn_902', parent: 'Robert Smith', student: 'Sarah Smith', amount: '$120.00', status: 'completed', date: 'Today, 08:15 AM' },
  { id: 'txn_903', parent: 'Maria Garcia', student: 'Carlos Garcia', amount: '$450.00', status: 'failed', date: 'Yesterday, 14:20 PM' },
  { id: 'txn_904', parent: 'James Lee', student: 'Emma Lee', amount: '$300.00', status: 'pending', date: 'Yesterday, 11:05 AM' },
];

export default function SchoolsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'analytics' | 'payments' | 'balances'>('directory');

  const columns = [
    {
      accessorKey: 'name',
      header: 'School Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{row.original.id}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'district',
      header: 'District / Type',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'students',
      header: 'Registered Students',
      cell: ({ getValue }: any) => <span className="font-medium text-foreground/90">{getValue().toLocaleString()}</span>
    },
    {
      accessorKey: 'kyc_status',
      header: 'Verification',
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
    data: mockSchools,
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
            <GraduationCap className="w-6 h-6 text-blue-500" />
            School Management Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage school accounts, fee collections, parent payments, and balances.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700 text-primary-foreground gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Onboard School
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Schools</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">142</h2>
               </div>
               <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600"><Building className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">+3 this month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fee Volume (YTD)</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">$14.2M</h2>
               </div>
               <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground"><Banknote className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">+15% relative to last term</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-amber-500">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Outstanding Balances</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">$840K</h2>
               </div>
               <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-600"><AlertCircle className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-amber-600 mt-2 font-medium">Across 1,204 accounts</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Digital Adoption</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">68%</h2>
               </div>
               <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600"><CreditCard className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">Online portal usage</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-6 border-b border-border">
        <button 
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'directory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          School Directory
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Fee Collection Analytics
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Parent Payment Tracking
        </button>
        <button 
          onClick={() => setActiveTab('balances')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'balances' ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Outstanding Balance Reports
        </button>
      </div>

      {activeTab === 'directory' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  placeholder="Search by school name, ID, or district..." 
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
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <Card className="border-border shadow-sm col-span-2">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Term-over-term Collection Trend</CardTitle>
               <CardDescription>Breakdown of tuition payments, auxiliary fees, and late fines across all participating schools.</CardDescription>
             </CardHeader>
             <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-md mx-6 mb-6">
                <div className="text-muted-foreground/70 text-sm flex flex-col items-center">
                   <BarChart3 className="w-8 h-8 mb-2 opacity-50"/>
                   [Fee Collection Analytics Chart Rendering]
                </div>
             </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Collection Rates</CardTitle>
               <CardDescription>Top districts by % of tuition collected</CardDescription>
             </CardHeader>
             <CardContent>
                 <div className="space-y-4">
                    {[
                      { name: 'District 4', percent: '94%' },
                      { name: 'District 9', percent: '91%' },
                      { name: 'Private Net.', percent: '88%' },
                      { name: 'District 2', percent: '82%' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">{i+1}</div>
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

      {activeTab === 'payments' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base">Real-time Parent Payments</CardTitle>
                <CardDescription>Track incoming tuition and fee settlements across the network.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input placeholder="Search parent or sub ID..." className="pl-9 h-9 text-sm bg-card" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Transaction ID</th>
                          <th className="px-6 py-4 font-semibold">Parent / Payer</th>
                          <th className="px-6 py-4 font-semibold">Student Context</th>
                          <th className="px-6 py-4 font-semibold">Amount</th>
                          <th className="px-6 py-4 font-semibold">Date</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                       {mockPayments.map((p, i) => (
                           <tr key={i} className="hover:bg-muted/30">
                              <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">{p.id}</td>
                              <td className="px-6 py-4 font-medium text-foreground">{p.parent}</td>
                              <td className="px-6 py-4 text-muted-foreground">{p.student}</td>
                              <td className="px-6 py-4 font-bold text-foreground">{p.amount}</td>
                              <td className="px-6 py-4 text-muted-foreground">{p.date}</td>
                              <td className="px-6 py-4">
                                 <Badge variant="outline" className={
                                   p.status === 'completed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                                   p.status === 'failed' ? 'border-red-200 text-red-700 bg-red-50' : 
                                   'border-amber-200 text-amber-700 bg-amber-50'
                                 }>
                                    {p.status}
                                 </Badge>
                              </td>
                           </tr>
                       ))}
                    </tbody>
                 </table>
             </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'balances' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base text-amber-900">Outstanding Balance Reports</CardTitle>
                <CardDescription>Accounts overdue for tuition, meal plans, or extracurricular fees.</CardDescription>
              </div>
              <Button variant="outline" className="bg-card gap-2 font-medium">Export Arrears Report</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Account / Parent</th>
                          <th className="px-6 py-4 font-semibold">School</th>
                          <th className="px-6 py-4 font-semibold text-right">Overdue Amount</th>
                          <th className="px-6 py-4 font-semibold">Days Overdue</th>
                          <th className="px-6 py-4 font-semibold">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                       {[
                         { parent: 'Sarah Connor', school: 'Lincoln High School', amount: '$1,200.00', overdue: 45 },
                         { parent: 'John Doe', school: 'Lincoln High School', amount: '$450.00', overdue: 12 },
                         { parent: 'Acme Corp Scholarships', school: 'Westside Tech', amount: '$12,400.00', overdue: 60 },
                       ].map((item, i) => (
                           <tr key={i} className="hover:bg-muted/30">
                              <td className="px-6 py-4 font-medium text-foreground">{item.parent}</td>
                              <td className="px-6 py-4 text-muted-foreground">{item.school}</td>
                              <td className="px-6 py-4 font-bold text-amber-600 text-right">{item.amount}</td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className={item.overdue > 30 ? 'border-red-200 text-red-700 bg-red-50' : 'border-amber-200 text-amber-700 bg-amber-50'}>
                                  {item.overdue} Days
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                 <Button size="sm" variant="ghost" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold gap-1">Send Notice <ArrowUpRight className="w-3 h-3"/></Button>
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
