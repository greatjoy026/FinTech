import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, CalendarDays, MoreHorizontal, Ticket, Plus, BarChart3, Users, DollarSign, Wallet } from 'lucide-react';
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

const mockEvents = [
  { id: 'evt_991', name: 'Tech Safari 2024', organizer: 'TechHaven', attendees: 1200, revenue: '$145,000', status: 'upcoming', date: 'Dec 12, 2023', type: 'Technology' },
  { id: 'evt_992', name: 'Global Finance Summit', organizer: 'FinTech Africa', attendees: 850, revenue: '$255,000', status: 'active', date: 'Nov 01, 2023', type: 'Finance' },
  { id: 'evt_993', name: 'Marathon Challenge', organizer: 'City Sports Co', attendees: 5000, revenue: '$25,000', status: 'upcoming', date: 'Jan 15, 2024', type: 'Sports' },
  { id: 'evt_994', name: 'Music Festival X', organizer: 'SoundBeats', attendees: 15400, revenue: '$1.2M', status: 'completed', date: 'Oct 20, 2023', type: 'Entertainment' },
  { id: 'evt_995', name: 'Startup Pitch Night', organizer: 'Ventures Group', attendees: 120, revenue: '$1,200', status: 'upcoming', date: 'Nov 05, 2023', type: 'Business' },
];

export default function EventsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'analytics' | 'sales' | 'checkins' | 'payouts'>('directory');

  const columns = [
    {
      accessorKey: 'name',
      header: 'Event Name',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-violet-50 flex items-center justify-center text-violet-600">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-[10px] text-muted-foreground font-mono">{row.original.id}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: 'organizer',
      header: 'Organizer',
      cell: ({ getValue }: any) => <span className="text-sm font-medium text-foreground/90">{getValue()}</span>
    },
    {
      accessorKey: 'type',
      header: 'Category',
      cell: ({ getValue }: any) => <span className="text-sm text-muted-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'attendees',
      header: 'Tickets Sold',
      cell: ({ getValue }: any) => <span className="text-sm font-medium text-foreground/90 flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5 text-muted-foreground/70"/> {getValue().toLocaleString()}</span>
    },
    {
      accessorKey: 'revenue',
      header: 'Processing Vol.',
      cell: ({ getValue }: any) => <span className="font-semibold text-foreground">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        if (s === 'completed') return <Badge variant="outline" className="border-border text-muted-foreground bg-muted/30">Completed</Badge>;
        if (s === 'active') return <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>Live Now</Badge>;
        return <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Upcoming</Badge>;
      }
    },
    {
      accessorKey: 'date',
      header: 'Event Date',
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
                <DropdownMenuItem>View Sales Dashboard</DropdownMenuItem>
                <DropdownMenuItem>Payout Details</DropdownMenuItem>
                <DropdownMenuItem>Download Attendee List</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Suspend Ticket Sales</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: mockEvents,
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
            <CalendarDays className="w-6 h-6 text-violet-600" />
            Ticketing & Events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage partner events, ticket sales revenue, check-in analytics, and payouts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-violet-600 hover:bg-violet-700 text-primary-foreground gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Organizer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Organizers</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">1,402</h2>
               </div>
               <div className="w-8 h-8 rounded bg-violet-50 flex items-center justify-center text-violet-600"><Users className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">+14 this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live & Upcoming</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">456</h2>
               </div>
               <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground"><CalendarDays className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">Currently selling</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-violet-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Sales (30D)</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">$4.2M</h2>
               </div>
               <div className="w-8 h-8 rounded bg-violet-50 flex items-center justify-center text-violet-600"><DollarSign className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-violet-600 mt-2 font-medium">115,000+ tickets</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending Payouts</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">$850K</h2>
               </div>
               <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-600"><Wallet className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-amber-600 mt-2 font-medium">Held until event completion</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-6 border-b border-border">
        <button 
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'directory' ? 'border-violet-600 text-violet-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Event Directory
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-violet-600 text-violet-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Event Analytics
        </button>
        <button 
          onClick={() => setActiveTab('sales')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sales' ? 'border-violet-600 text-violet-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Ticket Sales Reports
        </button>
        <button 
          onClick={() => setActiveTab('checkins')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'checkins' ? 'border-violet-600 text-violet-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Check-in Analytics
        </button>
        <button 
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'payouts' ? 'border-violet-600 text-violet-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Organizer Payouts
        </button>
      </div>

      {activeTab === 'directory' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  placeholder="Search events, IDs, or organizers..." 
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
                No events found matching criteria.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
           <Card className="border-border shadow-sm col-span-2">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Event Volume Trends</CardTitle>
               <CardDescription>Event creation and ticket processing volume over time.</CardDescription>
             </CardHeader>
             <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-md mx-6 mb-6">
                <div className="text-muted-foreground/70 text-sm flex flex-col items-center">
                   <BarChart3 className="w-8 h-8 mb-2 opacity-50"/>
                   [Event Growth Chart Rendering]
                </div>
             </CardContent>
           </Card>
           
           <Card className="border-border shadow-sm">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Top Categories</CardTitle>
               <CardDescription>By ticket processing volume</CardDescription>
             </CardHeader>
             <CardContent>
                 <div className="space-y-4">
                    {[
                      { name: 'Entertainment', vol: '$4.2M' },
                      { name: 'Technology', vol: '$2.8M' },
                      { name: 'Sports', vol: '$1.5M' },
                      { name: 'Business', vol: '$950K' },
                      { name: 'Arts & Culture', vol: '$450K' },
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

      {activeTab === 'sales' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
             <div className="flex justify-between items-center">
                <div>
                   <CardTitle className="text-base">Ticket Sales Reports</CardTitle>
                   <CardDescription>Real-time analytics on ticket drops, phases, and conversion.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 bg-card"><Ticket className="w-4 h-4"/> Export Sales Ledger</Button>
             </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { event: 'Music Festival X', tickets: '15,400', revenue: '$1.2M', pace: 'Sold out in 4hrs' },
                   { event: 'Tech Safari 2024', tickets: '1,200', revenue: '$145k', pace: 'On track' },
                   { event: 'Global Finance Summit', tickets: '850', revenue: '$255k', pace: 'Needs push' },
                 ].map((s, i) => (
                    <div key={i} className="border border-border rounded-lg p-5 bg-card">
                       <h3 className="font-bold text-foreground mb-1">{s.event}</h3>
                       <p className="text-xs text-muted-foreground mb-4">{s.tickets} tickets sold</p>
                       
                       <div className="space-y-2 mb-5">
                          <div className="flex justify-between text-xs">
                             <span className="text-muted-foreground">Total Revenue:</span>
                             <span className="font-medium text-foreground">{s.revenue}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                             <span className="text-muted-foreground">Sales Pace:</span>
                             <span className="font-medium text-foreground">{s.pace}</span>
                          </div>
                       </div>
                       
                       <Button variant="outline" className="w-full text-xs h-8">View Demographics</Button>
                    </div>
                 ))}
             </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'checkins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <Card className="border-border shadow-sm col-span-2">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Live Check-in Analytics</CardTitle>
               <CardDescription>Real-time ingress rates for active events.</CardDescription>
             </CardHeader>
             <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-md mx-6 mb-6">
                <div className="text-muted-foreground/70 text-sm flex flex-col items-center">
                   <BarChart3 className="w-8 h-8 mb-2 opacity-50"/>
                   [Throughput Chart Rendering]
                </div>
             </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Current Ingress</CardTitle>
               <CardDescription>Global Finance Summit</CardDescription>
             </CardHeader>
             <CardContent>
                 <div className="space-y-6 mt-4">
                    <div className="text-center">
                        <div className="text-4xl font-light text-foreground mb-1">42%</div>
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Arrived (357/850)</div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                       <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/40">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Peak Rate</span>
                            <span className="font-medium text-foreground">45 pax / min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Denied (Fake/Dupes)</span>
                            <span className="font-medium text-rose-600">3 attempts</span>
                        </div>
                    </div>
                 </div>
             </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'payouts' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <CardTitle className="text-base text-foreground">Organizer Payout Tracking</CardTitle>
            <CardDescription>Manage fund holds, release blocked payouts, or manually trigger disbursements.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Organizer</th>
                          <th className="px-6 py-4 font-semibold">Event</th>
                          <th className="px-6 py-4 font-semibold">Held Amount</th>
                          <th className="px-6 py-4 font-semibold">Release Date</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                       {[
                          { organizer: 'Ventures Group', event: 'Startup Pitch Night', amt: '$1,200.00', date: 'T+2 (Nov 07)', status: 'processing' },
                          { organizer: 'FinTech Africa', event: 'Global Finance Summit', amt: '$255,000.00', date: 'Held until completion', status: 'held' },
                          { organizer: 'SoundBeats', event: 'Music Festival X', amt: '$1.2M', date: 'Available', status: 'ready' },
                       ].map((item, i) => (
                           <tr key={i} className="hover:bg-muted/30">
                              <td className="px-6 py-4 font-medium text-foreground">{item.organizer}</td>
                              <td className="px-6 py-4 text-muted-foreground">{item.event}</td>
                              <td className="px-6 py-4 font-bold text-foreground">{item.amt}</td>
                              <td className="px-6 py-4 text-muted-foreground">{item.date}</td>
                              <td className="px-6 py-4">
                                 <Badge variant="outline" className={
                                    item.status === 'held' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                                    item.status === 'ready' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                                    'border-blue-200 text-blue-700 bg-blue-50'
                                 }>
                                    {item.status === 'held' ? 'Funds Held' : item.status === 'ready' ? 'Ready to Payout' : 'Processing'}
                                 </Badge>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex gap-2">
                                     {item.status === 'ready' ? (
                                        <Button size="sm" variant="default" className="h-8 text-xs bg-primary">Initiate Transfer</Button>
                                     ) : (
                                        <Button size="sm" variant="outline" className="h-8 text-xs bg-card text-emerald-600 border-emerald-200 hover:bg-emerald-50">Release Manually</Button>
                                     )}
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

