import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, Users, Activity, AlertTriangle, 
  ArrowRight, ShieldCheck, CreditCard, Send, HeartHandshake, DollarSign, 
  Clock, XCircle, Download, Upload, Store, RefreshCw, Zap, TrendingUp,
  Layers, CheckCircle2, ChevronRight, Network
} from 'lucide-react';
import { 
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, 
  CartesianGrid 
} from 'recharts';
import { useAdminStore } from '../store';

// Time-range chart datasets
const chartDataSets: Record<string, Array<{ time: string; volume: number; payouts: number }>> = {
  '24H': [
    { time: '00:00', volume: 12000, payouts: 8000 },
    { time: '04:00', volume: 8000, payouts: 5000 },
    { time: '08:00', volume: 45000, payouts: 25000 },
    { time: '12:00', volume: 89000, payouts: 42000 },
    { time: '16:00', volume: 65000, payouts: 55000 },
    { time: '20:00', volume: 32000, payouts: 18000 },
    { time: '23:59', volume: 18000, payouts: 12000 },
  ],
  '7D': [
    { time: 'Mon', volume: 180000, payouts: 110000 },
    { time: 'Tue', volume: 220000, payouts: 140000 },
    { time: 'Wed', volume: 195000, payouts: 130000 },
    { time: 'Thu', volume: 260000, payouts: 175000 },
    { time: 'Fri', volume: 310000, payouts: 210000 },
    { time: 'Sat', volume: 145000, payouts: 95000 },
    { time: 'Sun', volume: 120000, payouts: 75000 },
  ],
  '30D': [
    { time: 'Week 1', volume: 890000, payouts: 540000 },
    { time: 'Week 2', volume: 1040000, payouts: 690000 },
    { time: 'Week 3', volume: 1210000, payouts: 780000 },
    { time: 'Week 4', volume: 1390000, payouts: 890000 },
  ],
};

const railDataSets: Record<string, Array<{ rail: string; inflow: number; outflow: number; rate: string; latency: string }>> = {
  '24H': [
    { rail: 'Mobile Money', inflow: 542000, outflow: 385000, rate: '99.8%', latency: '1.2s' },
    { rail: 'Card Rails', inflow: 384000, outflow: 260000, rate: '98.9%', latency: '1.8s' },
    { rail: 'Instant Bank', inflow: 295000, outflow: 240000, rate: '99.5%', latency: '2.4s' },
    { rail: 'Agent POS', inflow: 168000, outflow: 120000, rate: '99.2%', latency: '4.1s' },
    { rail: 'Merchant QR', inflow: 92000, outflow: 45000, rate: '99.9%', latency: '0.8s' },
  ],
  '7D': [
    { rail: 'Mobile Money', inflow: 3820000, outflow: 2710000, rate: '99.7%', latency: '1.2s' },
    { rail: 'Card Rails', inflow: 2680000, outflow: 1820000, rate: '98.8%', latency: '1.9s' },
    { rail: 'Instant Bank', inflow: 2060000, outflow: 1680000, rate: '99.6%', latency: '2.3s' },
    { rail: 'Agent POS', inflow: 1180000, outflow: 840000, rate: '99.1%', latency: '4.0s' },
    { rail: 'Merchant QR', inflow: 640000, outflow: 315000, rate: '99.9%', latency: '0.8s' },
  ],
  '30D': [
    { rail: 'Mobile Money', inflow: 16200000, outflow: 11500000, rate: '99.7%', latency: '1.2s' },
    { rail: 'Card Rails', inflow: 11400000, outflow: 7750000, rate: '98.9%', latency: '1.8s' },
    { rail: 'Instant Bank', inflow: 8800000, outflow: 7150000, rate: '99.5%', latency: '2.4s' },
    { rail: 'Agent POS', inflow: 5040000, outflow: 3580000, rate: '99.3%', latency: '3.9s' },
    { rail: 'Merchant QR', inflow: 2750000, outflow: 1350000, rate: '99.9%', latency: '0.8s' },
  ],
};

const allKpis = [
  { 
    id: 'vol',
    title: 'Total Transaction Volume', 
    value: '$1,294,034', 
    trend: '+14.2%', 
    up: true, 
    icon: Activity,
    subtitle: 'Platform-wide processed value',
    category: 'financial'
  },
  { 
    id: 'rev',
    title: 'Platform Revenue', 
    value: '$12,490', 
    trend: '+5.4%', 
    up: true, 
    icon: DollarSign,
    subtitle: 'From fees and exchange margins',
    category: 'financial'
  },
  { 
    id: 'wal',
    title: 'Active Wallets', 
    value: '45,291', 
    trend: '+1.2%', 
    up: true, 
    icon: Wallet,
    subtitle: 'Wallets with balance > 0',
    category: 'ecosystem'
  },
  { 
    id: 'pay',
    title: 'Daily Payouts', 
    value: '$390,450', 
    trend: '+5.1%', 
    up: true, 
    icon: Upload,
    subtitle: 'Outgoing funds today',
    category: 'financial'
  },
  { 
    id: 'col',
    title: 'Daily Collections', 
    value: '$432,190', 
    trend: '+8.3%', 
    up: true, 
    icon: Download,
    subtitle: 'Incoming funds today',
    category: 'financial'
  },
  { 
    id: 'mer',
    title: 'Active Merchants', 
    value: '1,492', 
    trend: '+4.2%', 
    up: true, 
    icon: Store,
    subtitle: 'Transacted in last 24h',
    category: 'ecosystem'
  },
  { 
    id: 'usr',
    title: 'Total Users', 
    value: '142,394', 
    trend: '+1.8%', 
    up: true, 
    icon: Users,
    subtitle: 'Registered accounts',
    category: 'ecosystem'
  },
  { 
    id: 'pen',
    title: 'Pending Payouts', 
    value: '1,492', 
    trend: '-3.1%', 
    up: false, 
    icon: Clock,
    subtitle: 'Awaiting bank clearance',
    category: 'operations'
  },
  { 
    id: 'fai',
    title: 'Failed Transactions', 
    value: '38', 
    trend: '+2.4%', 
    up: false, 
    icon: XCircle,
    subtitle: 'Network declines & errors',
    alert: true,
    category: 'risk'
  },
  { 
    id: 'fra',
    title: 'Fraud Alerts', 
    value: '24', 
    trend: '-12.5%', 
    up: true, 
    icon: AlertTriangle,
    subtitle: 'Requires immediate review',
    alert: true,
    category: 'risk'
  },
];

const systemHealth = [
  { service: 'Monivexa Core Engine', status: 'operational', latency: '38ms' },
  { service: 'Real-time Ledger DB', status: 'operational', latency: '8ms' },
  { service: 'Card & Bank Rails', status: 'operational', latency: '85ms' },
  { service: 'Webhook Dispatcher', status: 'degraded', latency: '850ms' },
  { service: 'SMS Gateway Provider', status: 'operational', latency: '120ms' },
  { service: 'KYC Verification Gate', status: 'operational', latency: '45ms' },
];

const initialActivity = [
  { id: '1', title: 'Payment Completed', time: '1 min ago', type: 'success', desc: 'Transfer of $450.00 to Wallet U-991.' },
  { id: '2', title: 'Payout Batch Dispatched', time: '2 mins ago', type: 'info', desc: 'Batch #B-9182 sent for settlement.' },
  { id: '3', title: 'Suspicious Velocity Flag', time: '5 mins ago', type: 'alert', desc: 'Rapid transfers on account usr_9fasd2.' },
  { id: '4', title: 'Merchant Onboarded', time: '12 mins ago', type: 'success', desc: 'GlobalTech Ltd completed KYC Tier 3.' },
  { id: '5', title: 'Webhook Resent', time: '15 mins ago', type: 'info', desc: 'Delivered event callback to endpoint.' },
  { id: '6', title: 'Account Frozen', time: '45 mins ago', type: 'error', desc: 'Account flagged by AML compliance engine.' },
];

const liveEvents = [
  { title: 'Payment Completed', type: 'success', desc: 'P2P transfer settled instantly.' },
  { title: 'Payout Settled', type: 'info', desc: 'Batch transfer confirmed by partner bank.' },
  { title: 'Compliance Flag', type: 'alert', desc: 'Velocity threshold rule triggered.' },
  { title: 'New Merchant Live', type: 'success', desc: 'Merchant approved from onboarding queue.' },
  { title: 'Payroll Disbursed', type: 'success', desc: 'Corporate batch disbursed to 84 staff.' },
];

export default function Overview() {
  const { setView } = useAdminStore();
  const [activities, setActivities] = useState(initialActivity);
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H');
  const [metricFilter, setMetricFilter] = useState<'all' | 'financial' | 'risk'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Periodic simulated live events
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        if (Math.random() > 0.4) {
          const randomEvent = liveEvents[Math.floor(Math.random() * liveEvents.length)];
          const newEvent = {
            id: Date.now().toString(),
            title: randomEvent.title,
            time: 'Just now',
            type: randomEvent.type,
            desc: randomEvent.desc
          };
          return [newEvent, ...prev].slice(0, 6).map((item, idx) => {
            if (idx !== 0 && item.time === 'Just now') return { ...item, time: '1 min ago' };
            return item;
          });
        }
        return prev;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const displayedKpis = metricFilter === 'all' 
    ? allKpis 
    : metricFilter === 'financial' 
    ? allKpis.filter(k => k.category === 'financial')
    : allKpis.filter(k => k.category === 'risk' || k.category === 'operations');

  const currentChartData = chartDataSets[timeRange] || chartDataSets['24H'];
  const currentRailData = railDataSets[timeRange] || railDataSets['24H'];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Ecosystem Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Ecosystem Overview
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time financial graph, liquidity flow, system health, and ecosystem velocity.
          </p>
        </div>

        {/* Mobile live badge & Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <Badge variant="outline" className="sm:hidden bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Live
          </Badge>

          <div className="flex items-center gap-1.5">
            {/* Quick KPI category filter */}
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5 text-[11px]">
              <button
                onClick={() => setMetricFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  metricFilter === 'all' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setMetricFilter('financial')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  metricFilter === 'financial' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Financials
              </button>
              <button
                onClick={() => setMetricFilter('risk')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  metricFilter === 'risk' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Risk
              </button>
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards: Responsive Grid (2 columns on mobile, 3 on tablet, 5 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
        {displayedKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.id} 
              className={`overflow-hidden shadow-xs border transition-all hover:shadow-sm ${
                kpi.alert 
                  ? 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/30' 
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <CardContent className="p-3 sm:p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${
                    kpi.alert 
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    kpi.up 
                      ? 'text-emerald-700 bg-emerald-500/10 dark:text-emerald-400' 
                      : (kpi.alert ? 'text-rose-700 bg-rose-500/10 dark:text-rose-400' : 'text-amber-700 bg-amber-500/10 dark:text-amber-400')
                  }`}>
                    {kpi.up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {kpi.trend}
                  </div>
                </div>

                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground font-mono tracking-tight leading-none mb-1 truncate">
                    {kpi.value}
                  </p>
                  <h3 className="text-xs font-semibold text-foreground/85 truncate">
                    {kpi.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {kpi.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Visuals & Monitoring Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Main Charts Column (Spans 2 columns on desktop) */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-4 sm:gap-6">
          {/* Chart 1: Transaction Velocity */}
          <Card className="shadow-xs border-border bg-card">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Transaction Velocity
                </CardTitle>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  Processed payment volume vs outbound payouts
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <div className="flex items-center gap-1.5 text-indigo-500">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" /> Volume
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Payouts
                  </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex items-center bg-muted/50 rounded-lg p-0.5 text-[10px] font-medium">
                  {(['24H', '7D', '30D'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-2 py-0.5 rounded transition-all ${
                        timeRange === range ? 'bg-card text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-3.5 pb-3 px-2 sm:px-5">
              <div className="h-[185px] sm:h-[195px] lg:h-[205px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'currentColor' }} 
                      className="text-muted-foreground"
                      dy={6} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'currentColor' }} 
                      className="text-muted-foreground"
                      tickFormatter={(val) => val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` : `$${Math.round(val/1000)}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--foreground)',
                        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)' 
                      }}
                      itemStyle={{ fontSize: '12px' }}
                      labelStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                    <Area type="monotone" dataKey="payouts" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPayouts)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Rail Liquidity & Channel Settlement */}
          <Card className="shadow-xs border-border bg-card">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-500" />
                  Rail Liquidity & Channel Settlement
                </CardTitle>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                  Inflow collections vs outbound payout settlement across payment rails
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <div className="flex items-center gap-1.5 text-indigo-500">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" /> Inflow
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Outflow
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground">
                  Top Rail: Mobile Money
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-3.5 pb-3 px-2 sm:px-5">
              <div className="h-[185px] sm:h-[195px] lg:h-[205px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentRailData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis 
                      dataKey="rail" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'currentColor' }} 
                      className="text-muted-foreground"
                      dy={6} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'currentColor' }} 
                      className="text-muted-foreground"
                      tickFormatter={(val) => val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` : `$${Math.round(val/1000)}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--card)', 
                        borderColor: 'var(--border)', 
                        color: 'var(--foreground)',
                        boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.1)' 
                      }}
                      itemStyle={{ fontSize: '12px' }}
                      labelStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px' }}
                      formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}`, name === 'inflow' ? 'Inflow Collections' : 'Outbound Settlements']}
                    />
                    <Bar dataKey="inflow" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="outflow" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column: System Health & Live Feed */}
        <div className="col-span-1 flex flex-col gap-4 sm:gap-6">
          {/* System Health */}
          <Card className="shadow-xs border-border bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 p-2.5 sm:p-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                  Subsystem Health
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">Gateway status & response times</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 99.98%
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-xs max-h-[195px] overflow-y-auto">
                {systemHealth.map((sys) => (
                  <div key={sys.service} className="flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors">
                    <span className="font-medium text-foreground text-xs truncate mr-2">{sys.service}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-muted-foreground">{sys.latency}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-[9px] capitalize px-1.5 py-0 border-none ${
                          sys.status === 'operational' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {sys.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Activity Feed */}
          <Card className="shadow-xs border-border bg-card overflow-hidden">
            <CardHeader className="p-2.5 sm:p-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                  Live Event Feed
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">Streaming transaction pulses</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView('events')}
                className="h-6 text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 px-1.5 gap-0.5"
              >
                View all <ChevronRight className="w-3 h-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-3">
              <div className="max-h-[195px] overflow-y-auto pr-1">
                <div className="relative pl-3.5 space-y-3 border-l border-border before:absolute before:inset-y-0 before:left-[-0.5px] before:w-[1px] before:bg-gradient-to-b before:from-border before:to-transparent">
                  <div className="flex flex-col gap-3 overflow-hidden text-xs">
                    {activities.map((activity) => (
                      <div key={activity.id} className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className={`absolute -left-[18px] w-2 h-2 rounded-full ring-4 ring-background ${
                          activity.type === 'alert' ? 'bg-amber-500' :
                          activity.type === 'error' ? 'bg-rose-500' :
                          activity.type === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`} />
                        <div className="text-[10px] text-muted-foreground/80 leading-none mb-0.5">{activity.time}</div>
                        <div className="text-xs font-semibold text-foreground leading-tight">{activity.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{activity.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Ecosystem Interactive Breakdown Cards (2 cols on mobile, 4 on desktop) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            Ecosystem Segments
          </h3>
          <span className="text-[11px] text-muted-foreground">Click card to open module</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[
            { 
              name: 'Wallets', 
              desc: 'P2P & Consumer Accounts', 
              icon: Wallet, 
              color: 'text-blue-500', 
              bg: 'bg-blue-500/10', 
              count: '1.2M', 
              growth: '+2.4%',
              view: 'wallets' 
            },
            { 
              name: 'Merchants', 
              desc: 'Retail POS & Checkout', 
              icon: CreditCard, 
              color: 'text-indigo-500', 
              bg: 'bg-indigo-500/10', 
              count: '84.2K', 
              growth: '+5.1%',
              view: 'merchants' 
            },
            { 
              name: 'NGOs & Grants', 
              desc: 'Aid & Relief Disbursements', 
              icon: HeartHandshake, 
              color: 'text-emerald-500', 
              bg: 'bg-emerald-500/10', 
              count: '12', 
              growth: 'Active',
              view: 'ngos' 
            },
            { 
              name: 'Payroll Engine', 
              desc: 'Corporate Salary Batches', 
              icon: Send, 
              color: 'text-violet-500', 
              bg: 'bg-violet-500/10', 
              count: '450', 
              growth: '+8.3%',
              view: 'payroll' 
            },
          ].map((mod) => {
            const ModIcon = mod.icon;
            return (
              <Card 
                key={mod.name} 
                onClick={() => setView(mod.view)}
                className="shadow-xs border-border bg-card hover:border-emerald-500/40 hover:shadow-sm transition-all cursor-pointer group"
              >
                <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${mod.bg} ${mod.color}`}>
                      <ModIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-foreground text-xs sm:text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {mod.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{mod.desc}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-xs sm:text-sm font-bold text-foreground font-mono">{mod.count}</div>
                    <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 block">{mod.growth}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
