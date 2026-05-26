import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Server, Cpu, Database, Network, Clock, CheckCircle2, AlertTriangle, AlertCircle, RefreshCcw } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

const mockLatencyData = [
  { time: '10:00', latency: 45 },
  { time: '10:05', latency: 52 },
  { time: '10:10', latency: 48 },
  { time: '10:15', latency: 120 },
  { time: '10:20', latency: 155 },
  { time: '10:25', latency: 85 },
  { time: '10:30', latency: 42 },
  { time: '10:35', latency: 40 },
  { time: '10:40', latency: 38 },
];

export default function SystemMonitoringView() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            System Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time infrastructure health, latency, and resource utilization.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none font-normal px-2.5 py-1 text-primary-foreground flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-card animate-pulse"></span> All Systems Operational</Badge>
          <Button variant="outline" className="bg-card gap-2 text-muted-foreground" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Server, label: 'API Servers', value: '4 / 4 Online', sub: '99.99% Uptime', status: 'optimal' },
          { icon: Database, label: 'Database Nodes', value: 'Primary + 2 Replicas', sub: 'Replication lag < 10ms', status: 'optimal' },
          { icon: Cpu, label: 'Worker Queue', value: '1,240 Jobs', sub: 'Processing at 420/sec', status: 'warning' },
          { icon: Network, label: 'Global Latency', value: '42ms avg', sub: 'P99: 120ms', status: 'optimal' },
        ].map((node, i) => (
          <Card key={i} className="shadow-sm border-border/60 transition-all hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${node.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <node.icon className="w-5 h-5" />
                </div>
                {node.status === 'optimal' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">{node.label}</p>
                <h3 className="text-xl font-bold text-foreground mt-1">{node.value}</h3>
                <p className="text-xs text-muted-foreground/70 mt-1">{node.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/60">
          <CardHeader className="pb-2 border-b border-border/40 mb-4">
            <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
              API Latency (Last 30 Minutes)
              <Badge variant="secondary" className="font-mono text-xs">P90: 85ms</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] w-full p-4 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockLatencyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#64748b', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold text-foreground">Active Alerts</CardTitle>
            <CardDescription className="text-xs">System-generated warnings</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-4">
            <div className="space-y-4">
              {[
                { type: 'warning', title: 'High Memory Usage', desc: 'Worker node worker-eu-02 memory > 85%', time: '2m ago' },
                { type: 'error', title: 'Webhook Delivery Failed', desc: 'Partner API endpoint timeout (3 retries)', time: '15m ago' },
                { type: 'info', title: 'Database Backup Completed', desc: 'Daily automated snapshot success', time: '1h ago' },
              ].map((alert, i) => (
                <div key={i} className="flex gap-3 items-start border-b border-border/40 last:border-0 pb-3 last:pb-0">
                  <div className={`mt-0.5 rounded-full p-1 
                    ${alert.type === 'error' ? 'bg-red-100 text-red-600' : 
                      alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                      'bg-blue-100 text-blue-600'}`}>
                    {alert.type === 'info' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                     alert.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5" /> : 
                     <AlertCircle className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">{alert.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm border-border/60">
        <CardHeader className="border-b border-border/40 bg-muted/50 py-3">
          <CardTitle className="text-sm font-semibold text-foreground flex justify-between items-center">
            Service Endpoints
            <Badge variant="outline" className="text-xs bg-card">6 Monitored</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40">
                <tr>
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-6 py-3 font-medium">Region</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Latency</th>
                  <th className="px-6 py-3 font-medium">Uptime (30d)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 bg-card">
                {[
                  { name: 'Core API Gateway', region: 'eu-west-1', status: 'Operational', latency: '45ms', uptime: '99.999%' },
                  { name: 'Payment Processing Engine', region: 'eu-west-1', status: 'Operational', latency: '120ms', uptime: '99.99%' },
                  { name: 'Wallet Ledger Service', region: 'eu-central-1', status: 'Operational', latency: '35ms', uptime: '100.00%' },
                  { name: 'Fraud Analysis ML Node', region: 'us-east-1', status: 'Degraded', latency: '450ms', uptime: '99.95%' },
                  { name: 'Notification Service', region: 'eu-west-1', status: 'Operational', latency: '12ms', uptime: '99.99%' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30/60 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap font-medium text-foreground flex items-center gap-2">
                       {row.name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-muted-foreground"><Badge variant="secondary" className="bg-muted font-normal">{row.region}</Badge></td>
                    <td className="px-6 py-3 whitespace-nowrap">
                       <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.status === 'Operational' ? 'text-emerald-600' : 'text-amber-600'}`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                         {row.status}
                       </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-muted-foreground font-mono text-xs">{row.latency}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-muted-foreground">{row.uptime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
