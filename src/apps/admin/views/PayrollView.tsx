import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Briefcase, MoreHorizontal, CheckCircle2, XCircle, Clock, Users, Plus, Download } from 'lucide-react';
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

const mockPayrollRuns = [
  { id: 'pr_84920', company: 'Acme Corp', employees: 145, amount: '$420,500', status: 'completed', date: '2023-10-31', type: 'Monthly' },
  { id: 'pr_84921', company: 'TechHaven', employees: 42, amount: '$180,200', status: 'processing', date: '2023-10-31', type: 'Bi-Weekly' },
  { id: 'pr_84922', company: 'Global Logistics', employees: 850, amount: '$2,150,000', status: 'pending', date: '2023-11-01', type: 'Monthly' },
  { id: 'pr_84923', company: 'Fresh Foods Co', employees: 12, amount: '$24,000', status: 'failed', date: '2023-10-28', type: 'Weekly' },
  { id: 'pr_84924', company: 'EduBooks', employees: 8, amount: '$18,400', status: 'completed', date: '2023-10-25', type: 'Monthly' },
];

export default function PayrollView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const columns = [
    {
      accessorKey: 'id',
      header: 'Run ID',
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'company',
      header: 'Company / Employer',
      cell: ({ row }: any) => (
        <span className="font-medium text-foreground">{row.original.company}</span>
      )
    },
    {
      accessorKey: 'type',
      header: 'Schedule',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'employees',
      header: 'Employees',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{getValue()}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Total Payroll',
      cell: ({ getValue }: any) => <span className="font-semibold text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'completed') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Settled</Badge>;
        if (s === 'processing') return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50"><Clock className="w-3 h-3 mr-1"/> Processing</Badge>;
        if (s === 'pending') return <Badge variant="outline" className="border-border text-foreground/90 bg-muted/30">Pending Review</Badge>;
        return <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>;
      }
    },
    {
      accessorKey: 'date',
      header: 'Execution Date',
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
                <DropdownMenuItem>View Batch Details</DropdownMenuItem>
                <DropdownMenuItem>Download Report</DropdownMenuItem>
                <DropdownMenuItem>Re-run Failed Txns</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Cancel Pending Run</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockPayrollRuns,
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
            <Briefcase className="w-6 h-6 text-teal-600" />
            Payroll Processing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage bulk salary disbursements, compliance, and employee direct deposits.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card gap-2 text-muted-foreground">
            <Download className="w-4 h-4" /> Export Ledger
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Schedule Bulk Run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payroll Active orgs</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">104</h2>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">+5 this month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Disbursed (Oct)</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$45.2M</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">245 successful runs</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Processing Today</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$1.4M</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Across 12 batches</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Failed Txns</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">2</h2>
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">Action required</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search run IDs or company names..." 
                className="pl-9 h-9 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-card"><Filter className="w-4 h-4"/> Filters</Button>
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
              No payroll runs found matching criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
