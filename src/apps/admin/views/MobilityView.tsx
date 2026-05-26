import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Car, MoreHorizontal, CheckCircle2, Clock, MapPin, Plus, Navigation } from 'lucide-react';
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

const mockRides = [
  { id: 'trip_9921', driver: 'Samuel O.', rider: 'Jane D.', amount: '$15.50', status: 'completed', date: '10 mins ago', location: 'Downtown Hub' },
  { id: 'trip_9922', driver: 'David K.', rider: 'Michael T.', amount: '$42.00', status: 'active', date: 'Currently Active', location: 'Airport Terminal 2' },
  { id: 'trip_9923', driver: 'Aisha M.', rider: 'Chris L.', amount: '$8.25', status: 'completed', date: '25 mins ago', location: 'Tech Park' },
  { id: 'trip_9924', driver: 'John H.', rider: 'Sarah B.', amount: '$21.00', status: 'payment_pending', date: '1 hr ago', location: 'City Center' },
  { id: 'trip_9925', driver: 'Emmanuel P.', rider: 'Lisa R.', amount: '$18.75', status: 'completed', date: '2 hrs ago', location: 'North Side Station' },
];

export default function MobilityView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');

  const columns = [
    {
      accessorKey: 'id',
      header: 'Trip ID',
      cell: ({ getValue }: any) => <span className="font-mono text-xs text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'driver',
      header: 'Driver',
      cell: ({ getValue }: any) => (
        <div className="flex items-center gap-2">
           <Car className="w-3.5 h-3.5 text-muted-foreground/70" />
           <span className="font-medium text-foreground">{getValue()}</span>
        </div>
      )
    },
    {
      accessorKey: 'rider',
      header: 'Rider',
      cell: ({ getValue }: any) => <span className="text-sm text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'location',
      header: 'Pickup Location',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> {getValue()}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Fare Amount',
      cell: ({ getValue }: any) => <span className="font-semibold text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'completed') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>;
        if (s === 'active') return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50"><Navigation className="w-3 h-3 mr-1"/> In Transit</Badge>;
        return <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Pending Payment</Badge>;
      }
    },
    {
      accessorKey: 'date',
      header: 'Time',
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
                <DropdownMenuItem>View Trip Details</DropdownMenuItem>
                <DropdownMenuItem>Driver Profile</DropdownMenuItem>
                <DropdownMenuItem>Payment Trace</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Refund Rider</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockRides,
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
            <Car className="w-6 h-6 text-orange-500" />
            Mobility & Ride-Hailing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage ride transactions, driver commissions, and transit payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-card gap-2 text-muted-foreground">
             Driver Payouts
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" /> Register Fleet
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Rides Today</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">14,250</h2>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">+24% vs yesterday</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Fare Volume</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$145.2K</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Processed fares</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-orange-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Commission Earned</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">$21.7K</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">At 15% platform fee</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Drivers</p>
            <h2 className="text-2xl font-bold text-foreground mt-1">1,842</h2>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">Currently online</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input 
                placeholder="Search trip IDs, drivers, or riders..." 
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
              No rides found matching criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
