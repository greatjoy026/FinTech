import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Webhook, BarChart3, Activity, Server, Clock, RefreshCw, XCircle, CheckCircle2, Play, Code2, Plus } from 'lucide-react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';

const mockLogs = [
  { id: 'evt_9013', endpoint: 'https://api.partner.com/webhook', event: 'payment.success', status: '200', latency: '240ms', date: 'Just now' },
  { id: 'evt_9012', endpoint: 'https://api.merchant.com/hook', event: 'payout.failed', status: '500', latency: '5000ms', date: '2 mins ago' },
  { id: 'evt_9011', endpoint: 'https://api.schoolfee.edu/v1/webhook', event: 'invoice.paid', status: '201', latency: '120ms', date: '5 mins ago' },
  { id: 'evt_9010', endpoint: 'https://hooks.slack.com/services/T0...', event: 'system.alert', status: '429', latency: '800ms', date: '12 mins ago' },
  { id: 'evt_9009', endpoint: 'https://api.partner.com/webhook', event: 'payment.success', status: '200', latency: '210ms', date: '15 mins ago' },
];

export default function WebhooksView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'retries' | 'endpoints' | 'analytics'>('logs');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Webhook className="w-6 h-6 text-indigo-600" />
            Webhook Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage webhook deliveries, failed retry queues, and endpoint latencies.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-primary-foreground gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Endpoint
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Deliveries (24h)</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">2.4M</h2>
               </div>
               <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600"><Activity className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">+15% vs yesterday</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Success Rate</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">99.8%</h2>
               </div>
               <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">Healthy</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-amber-500">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Retry Queue</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">452</h2>
               </div>
               <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-600"><RefreshCw className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-amber-600 mt-2 font-medium">Pending redelivery</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-rose-500">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Latency</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">245ms</h2>
               </div>
               <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-600"><Clock className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-rose-600 mt-2 font-medium">+40ms variance</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-6 border-b border-border">
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Delivery Logs
        </button>
        <button 
          onClick={() => setActiveTab('retries')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'retries' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Retry Queue
        </button>
        <button 
          onClick={() => setActiveTab('endpoints')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'endpoints' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Endpoints & Status
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Latency Analytics
        </button>
      </div>

      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <Card className="shadow-sm border-border/60 col-span-2">
            <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                  <Input 
                    placeholder="Search logs by event ID, endpoint..." 
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
                    <tr>
                      <th className="px-6 py-4 font-semibold">Event ID</th>
                      <th className="px-6 py-4 font-semibold">Endpoint</th>
                      <th className="px-6 py-4 font-semibold">Event Type</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Latency</th>
                      <th className="px-6 py-4 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 bg-card">
                    {mockLogs.map((log, i) => (
                       <tr key={i} className="hover:bg-muted/30 cursor-pointer group">
                          <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground group-hover:text-indigo-600 transition-colors">{log.id}</td>
                          <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]" title={log.endpoint}>{log.endpoint}</td>
                          <td className="px-6 py-4 font-medium text-foreground">{log.event}</td>
                          <td className="px-6 py-4">
                             <Badge variant="outline" className={
                                log.status.startsWith('2') ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                                log.status.startsWith('5') ? 'border-rose-200 text-rose-700 bg-rose-50' :
                                'border-amber-200 text-amber-700 bg-amber-50'
                             }>
                                {log.status}
                             </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{log.latency}</td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{log.date}</td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payload Viewer Side Panel */}
          <Card className="shadow-sm border-border/60 bg-[#0A0A0A] text-slate-300">
             <CardHeader className="border-b border-slate-800 py-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                   <Code2 className="w-4 h-4 text-muted-foreground" />
                   <CardTitle className="text-sm font-medium text-primary-foreground">Payload Inspector</CardTitle>
                </div>
                <div className="flex items-center gap-2 text-xs">
                   <span className="text-emerald-400">200 OK</span>
                   <span className="text-muted-foreground">evt_9013</span>
                </div>
             </CardHeader>
             <CardContent className="p-4 overflow-y-auto max-h-[500px]">
                <pre className="text-[11px] font-mono leading-relaxed">
{`{
  "event": "payment.success",
  "created_at": "2026-05-25T01:25:41Z",
  "data": {
    "transaction_id": "txn_893jd928",
    "amount": 25000,
    "currency": "USD",
    "status": "completed",
    "customer": {
       "id": "cus_92jd92",
       "email": "user@example.com"
    }
  },
  "livemode": true,
  "request_logs": {
     "id": "req_8829dj",
     "idempotency_key": "idemp_232"
  }
}`}
                </pre>
             </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'retries' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base text-amber-900">Failed Retry Queue</CardTitle>
                <CardDescription>Events waiting to be redelivered due to endpoint downtime.</CardDescription>
              </div>
              <Button size="sm" className="bg-amber-100 text-amber-700 hover:bg-amber-200 shadow-sm font-medium gap-2">
                 <Play className="w-3.5 h-3.5"/> Force Retry All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Event ID</th>
                          <th className="px-6 py-4 font-semibold">Failing Endpoint</th>
                          <th className="px-6 py-4 font-semibold">Attempts</th>
                          <th className="px-6 py-4 font-semibold">Next Retry</th>
                          <th className="px-6 py-4 font-semibold">Last Error</th>
                          <th className="px-6 py-4 font-semibold">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                       {[
                         { id: 'evt_9001', endpoint: 'api.merchant.com', attempts: 3, next: 'In 5 mins', err: '500 Internal Server Error' },
                         { id: 'evt_8992', endpoint: 'webhook.site/29f82d', attempts: 8, next: 'In 1 hour', err: '429 Too Many Requests' },
                         { id: 'evt_8940', endpoint: 'api.payouts.net/hook', attempts: 12, next: 'Halted', err: '404 Not Found' },
                       ].map((item, i) => (
                           <tr key={i} className="hover:bg-muted/30">
                              <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">{item.id}</td>
                              <td className="px-6 py-4 font-medium text-foreground">{item.endpoint}</td>
                              <td className="px-6 py-4 text-muted-foreground">
                                 <Badge variant="outline" className="bg-muted">{item.attempts} / 15</Badge>
                              </td>
                              <td className="px-6 py-4 text-amber-600 font-medium">{item.next}</td>
                              <td className="px-6 py-4 text-xs font-mono text-rose-500">{item.err}</td>
                              <td className="px-6 py-4">
                                <Button size="sm" variant="outline" className="h-8 text-xs bg-card text-muted-foreground hover:bg-muted/30">Cancel</Button>
                              </td>
                           </tr>
                       ))}
                    </tbody>
                 </table>
             </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'endpoints' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
             <CardTitle className="text-base text-foreground">Configured Endpoints</CardTitle>
             <CardDescription>Active webhook destinations and their current health status.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Endpoint URL</th>
                          <th className="px-6 py-4 font-semibold">Subscribed Events</th>
                          <th className="px-6 py-4 font-semibold">Health (24h)</th>
                          <th className="px-6 py-4 font-semibold">Avg Latency</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                       {[
                         { url: 'https://api.partner.com/webhook', events: ['payment.*', 'payout.*'], health: '99.9%', latency: '120ms', status: 'active' },
                         { url: 'https://api.merchant.com/hook', events: ['invoice.paid'], health: '85.4%', latency: '5.2s', status: 'degraded' },
                         { url: 'https://hooks.slack.com/services/...', events: ['system.alert'], health: '100%', latency: '80ms', status: 'active' },
                       ].map((item, i) => (
                           <tr key={i} className="hover:bg-muted/30">
                              <td className="px-6 py-4 font-medium text-foreground">{item.url}</td>
                              <td className="px-6 py-4">
                                 <div className="flex gap-1 flex-wrap">
                                     {item.events.map(e => <Badge key={e} variant="secondary" className="text-[10px]">{e}</Badge>)}
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground">{item.health}</td>
                              <td className="px-6 py-4 text-muted-foreground">{item.latency}</td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className={item.status === 'active' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}>
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
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
           <Card className="border-border shadow-sm col-span-2">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Delivery Latency Matrix (p95)</CardTitle>
               <CardDescription>Response times across global webhook endpoints over 24 hours.</CardDescription>
             </CardHeader>
             <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-md mx-6 mb-6">
                <div className="text-muted-foreground/70 text-sm flex flex-col items-center">
                   <BarChart3 className="w-8 h-8 mb-2 opacity-50"/>
                   [Latency Distribution Chart Rendering]
                </div>
             </CardContent>
           </Card>
           
           <Card className="border-border shadow-sm">
             <CardHeader>
               <CardTitle className="text-base text-foreground">Slowest Endpoints</CardTitle>
               <CardDescription>Destinations risking timeout blocks</CardDescription>
             </CardHeader>
             <CardContent>
                 <div className="space-y-4">
                    {[
                      { name: 'api.merchant.com', latency: '5420ms' },
                      { name: 'legacy.school.edu', latency: '4800ms' },
                      { name: 'vendor-hooks.net', latency: '3100ms' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Server className="w-4 h-4 text-muted-foreground/70" />
                            <span className="text-sm font-medium text-foreground/90 truncate max-w-[120px]">{m.name}</span>
                         </div>
                         <span className="text-sm font-bold text-rose-600">{m.latency}</span>
                      </div>
                    ))}
                 </div>
             </CardContent>
           </Card>
        </div>
      )}

    </div>
  );
}
