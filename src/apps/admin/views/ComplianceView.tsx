import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, FileCheck, MoreHorizontal, CheckCircle2, Clock, Download, AlertTriangle, UserCheck, Shield, FileText, ArrowUpRight, BarChart3, Database } from 'lucide-react';
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

const mockComplianceCases = [
  { id: 'case_291', entity: 'TechHaven Electronics', type: 'Merchant KYC', status: 'pending', severity: 'high', date: '2023-10-27' },
  { id: 'case_290', entity: 'John Doe', type: 'Customer AML Flag', status: 'investigating', severity: 'critical', date: '2023-10-26' },
  { id: 'case_289', entity: 'Acme Supermart', type: 'Txn Limit Breach', status: 'resolved', severity: 'medium', date: '2023-10-25' },
  { id: 'case_288', entity: 'Jane Smith', type: 'Sanctions Match', status: 'pending', severity: 'critical', date: '2023-10-25' },
  { id: 'case_287', entity: 'Global Logistics', type: 'UBO Verification', status: 'pending', severity: 'medium', date: '2023-10-24' },
];

const mockKYCQueue = [
  { id: 'kyc_991', user: 'Michael Scott', type: 'Tier 2 Upgrade', submitted: '10 mins ago', risk: 'low', documents: 2 },
  { id: 'kyc_992', user: 'Dwight Schrute', type: 'Business Onboarding', submitted: '25 mins ago', risk: 'medium', documents: 5 },
  { id: 'kyc_993', user: 'Jim Halpert', type: 'ID Verification', submitted: '1 hr ago', risk: 'low', documents: 1 },
];

export default function ComplianceView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'cases' | 'kyc' | 'reports'>('cases');

  const columns = [
    {
      accessorKey: 'id',
      header: 'Case ID',
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'entity',
      header: 'Entity / Subject',
      cell: ({ getValue }: any) => <span className="font-medium text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'type',
      header: 'Case Type',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'severity',
      header: 'Risk Level',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'critical') return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50"><AlertTriangle className="w-3 h-3 mr-1"/> Critical</Badge>;
        if (s === 'high') return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50"><AlertTriangle className="w-3 h-3 mr-1"/> High</Badge>;
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Medium</Badge>;
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'resolved') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Resolved</Badge>;
        if (s === 'investigating') return <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50"><Search className="w-3 h-3 mr-1"/> Investigating</Badge>;
        return <Badge variant="outline" className="border-border text-foreground/90 bg-muted/30"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      }
    },
    {
      accessorKey: 'date',
      header: 'Date Created',
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
                <DropdownMenuItem>Review Case</DropdownMenuItem>
                <DropdownMenuItem>Request Information</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Freeze Account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockComplianceCases,
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
            <Shield className="w-6 h-6 text-foreground/90" />
            Compliance & AML Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage KYC operations, AML investigations, and regulatory audit reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card gap-2 text-muted-foreground px-4">
            <Download className="w-4 h-4" /> Export SAR
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-primary-foreground gap-2 shadow-sm">
            <FileText className="w-4 h-4" /> Regulatory Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Investigations</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">42</h2>
               </div>
               <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground"><Search className="w-4 h-4"/></div>
             </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"/>
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">High Risk Flags</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">8</h2>
               </div>
               <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center text-red-600"><AlertTriangle className="w-4 h-4"/></div>
             </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">KYC Queue</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">156</h2>
               </div>
               <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600"><UserCheck className="w-4 h-4"/></div>
             </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Auto-Approval Rate</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">94.2%</h2>
               </div>
               <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-4 h-4"/></div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-6 border-b border-border">
        <button 
          onClick={() => setActiveTab('cases')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'cases' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          AML Cases & Investigations
        </button>
        <button 
          onClick={() => setActiveTab('kyc')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'kyc' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          KYC / KYB Verification Queue
          <span className="bg-muted text-muted-foreground py-0.5 px-2 rounded-full text-[10px]">156</span>
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reports' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Audit & Reporting
        </button>
      </div>

      {activeTab === 'cases' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  placeholder="Search case ID, entity..." 
                  className="pl-10 h-10 bg-card"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-10 gap-1.5 bg-card"><Filter className="w-4 h-4"/> Filters</Button>
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
          </CardContent>
        </Card>
      )}

      {activeTab === 'kyc' && (
        <div className="space-y-4 animate-in fade-in duration-300">
           <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Entities Awaiting Verification</h3>
              <div className="flex items-center gap-2">
                 <select className="h-9 px-3 py-1 bg-card border border-border rounded-md text-sm text-foreground/90">
                    <option>Oldest First</option>
                    <option>Newest First</option>
                    <option>Highest Risk</option>
                 </select>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockKYCQueue.map(item => (
                 <Card key={item.id} className="shadow-sm border-border">
                    <CardHeader className="p-4 pb-2">
                       <div className="flex justify-between items-start">
                          <Badge variant="secondary" className="bg-muted text-foreground/90 font-mono text-[10px]">{item.id}</Badge>
                          <Badge variant="outline" className={item.risk === 'medium' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-blue-200 text-blue-700 bg-blue-50'}>
                             {item.risk} risk
                          </Badge>
                       </div>
                       <CardTitle className="text-lg mt-2">{item.user}</CardTitle>
                       <CardDescription>{item.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                       <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5"/> {item.documents} docs</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {item.submitted}</span>
                       </div>
                       <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs h-8">Review Documents</Button>
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-primary-foreground transition-colors">
                   <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1 flex items-center justify-between">
                   Suspicious Activity Report <ArrowUpRight className="w-4 h-4 text-muted-foreground/70 group-hover:text-indigo-600" />
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">Generate official SAR files for regulatory submission regarding flagged transactions.</p>
             </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-primary-foreground transition-colors">
                   <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1 flex items-center justify-between">
                   Complete Data Export <ArrowUpRight className="w-4 h-4 text-muted-foreground/70 group-hover:text-emerald-600" />
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">Download a full verifiable audit trail of system transactions and state changes.</p>
             </CardContent>
          </Card>

          <Card className="border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-primary-foreground transition-colors">
                   <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1 flex items-center justify-between">
                   Compliance Analytics <ArrowUpRight className="w-4 h-4 text-muted-foreground/70 group-hover:text-blue-600" />
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">View SLA metrics for identity verification and historical breakdown of risk flags.</p>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

