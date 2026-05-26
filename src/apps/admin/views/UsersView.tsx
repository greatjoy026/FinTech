import React, { useState } from 'react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Search, Settings2, ShieldBan, Verified, RotateCcw, AlertTriangle, Filter, Download, Bookmark, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserProfilePanel } from './UserProfilePanel';

const mockUsers = [
  { id: 'usr_8sf7sa', name: 'John Doe', role: 'CUSTOMER', status: 'active', balance: '$240.50', risk: 'low', lastActive: '2h ago' },
  { id: 'usr_w3gfa8', name: 'Acme Corp', role: 'MERCHANT', status: 'active', balance: '$12,450.00', risk: 'low', lastActive: 'Just now' },
  { id: 'usr_9fasd2', name: 'Jane Smith', role: 'CUSTOMER', status: 'frozen', balance: '$1,200.00', risk: 'high', lastActive: '2d ago' },
  { id: 'usr_2ks883', name: 'Global Aid', role: 'NGO', status: 'review', balance: '$0.00', risk: 'medium', lastActive: '1w ago' },
  { id: 'usr_m23400', name: 'Lincoln High', role: 'SCHOOL', status: 'active', balance: '$45,000.00', risk: 'low', lastActive: '1h ago' },
  { id: 'usr_8afasf', name: 'Alice Walker', role: 'CUSTOMER', status: 'active', balance: '$12.00', risk: 'low', lastActive: '4h ago' },
  { id: 'usr_7hfds4', name: 'Tech Innovations', role: 'MERCHANT', status: 'active', balance: '$4,500.00', risk: 'medium', lastActive: '5m ago' },
];

export default function UsersView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const columns = [
    {
      accessorKey: 'name',
      header: 'User & ID',
      cell: ({ row }: any) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-muted">
              <AvatarFallback className="text-xs">{u.name.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground group-hover:text-indigo-600 transition-colors">{u.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{u.id}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }: any) => <Badge variant="secondary" className="text-[10px]">{getValue()}</Badge>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        let color = 'bg-muted text-muted-foreground';
        if (s === 'active') color = 'bg-emerald-100 text-emerald-700';
        if (s === 'frozen') color = 'bg-red-100 text-red-700';
        if (s === 'review') color = 'bg-amber-100 text-amber-700';
        return <Badge variant="outline" className={`capitalize border-none ${color}`}>{s}</Badge>
      }
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ getValue }: any) => <span className="font-medium text-sm text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'risk',
      header: 'Risk Score',
      cell: ({ getValue }: any) => {
        const r = getValue();
        return (
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${r === 'high' ? 'bg-red-500' : r === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-xs text-muted-foreground capitalize">{r}</span>
          </div>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }: any) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSelectedUserId(row.original.id)}>View Profile</DropdownMenuItem>
                <DropdownMenuItem>View Transactions</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-emerald-600"><Verified className="w-4 h-4 mr-2"/> Force KYC Verify</DropdownMenuItem>
              <DropdownMenuItem className="text-amber-600"><RotateCcw className="w-4 h-4 mr-2"/> Reset PIN</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600"><ShieldBan className="w-4 h-4 mr-2"/> Freeze Account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockUsers,
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Global registry of all Monivexa ecosystem participants.</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" className="gap-2"><Bookmark className="w-4 h-4 text-muted-foreground" /> Saved Views</Button>} />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Your Views</DropdownMenuLabel>
                <DropdownMenuItem>High Risk Customers</DropdownMenuItem>
                <DropdownMenuItem>Pending KYC (<kbd className="ml-auto text-xs bg-muted px-1 rounded">K</kbd>)</DropdownMenuItem>
                <DropdownMenuItem>Active NGOs</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Plus className="w-4 h-4 mr-2"/> Save Current View</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
        </div>
      </div>

      <Card className="shadow-sm border-border/60 font-sans relative z-10">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96 flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search users by name, email, or ID..." 
                className="pl-10 h-10 bg-card"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="h-10 gap-2 px-4 shadow-sm"><Filter className="w-4 h-4"/> Advanced Filters</Button>
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
                  <tr key={row.id} className="hover:bg-muted/30/60 transition-colors group cursor-pointer" onClick={() => setSelectedUserId(row.original.id)}>
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
          
          <div className="flex items-center justify-end space-x-2 py-4 px-6 border-t border-border/40 bg-muted/50 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Supplementary details area for tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-0">
        <Card className="shadow-sm border-amber-200/60 bg-amber-50/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 text-amber-700 font-semibold mb-2">
              <AlertTriangle className="w-5 h-5"/>
              High Risk Accounts
            </div>
            <p className="text-sm text-amber-800/80">3 accounts flagged by the ML model in the last 24h requiring manual compliance review.</p>
            <Button variant="outline" className="border-amber-200 text-amber-700 bg-card mt-4 h-8 text-xs">Review Queue →</Button>
          </CardContent>
        </Card>
      </div>

      {/* User Profile Slide-over */}
      {selectedUserId && (
        <>
          <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-40" onClick={() => setSelectedUserId(null)} />
          <UserProfilePanel userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
        </>
      )}
    </div>
  );
}
