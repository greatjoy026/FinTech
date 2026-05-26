import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Wallet, Users, Activity, AlertTriangle, ArrowRight, ShieldCheck, CreditCard, Send, HeartHandshake, DollarSign, Clock, XCircle, Download, Upload, Store } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid } from 'recharts';

const kpis = [
  { 
    title: 'Total Transaction Volume', 
    value: '$1,294,034', 
    trend: '+14.2%', 
    up: true, 
    icon: Activity,
    subtitle: 'Platform-wide processed value'
  },
  { 
    title: 'Platform Revenue', 
    value: '$12,490', 
    trend: '+5.4%', 
    up: true, 
    icon: DollarSign,
    subtitle: 'From fees and exchange margins'
  },
  { 
    title: 'Active Wallets', 
    value: '45,291', 
    trend: '+1.2%', 
    up: true, 
    icon: Wallet,
    subtitle: 'Wallets with balance > 0'
  },
  { 
    title: 'Pending Payouts', 
    value: '1,492', 
    trend: '-3.1%', 
    up: false, 
    icon: Clock,
    subtitle: 'Awaiting bank clearance',
  },
  { 
    title: 'Failed Transactions', 
    value: '38', 
    trend: '+2.4%', 
    up: false, 
    icon: XCircle,
    subtitle: 'Network errors & declines',
    alert: true
  },
  { 
    title: 'Fraud Alerts', 
    value: '24', 
    trend: '-12.5%', 
    up: true, 
    icon: AlertTriangle,
    subtitle: 'Requires immediate review',
    alert: true
  },
  { 
    title: 'Daily Collections', 
    value: '$432,190', 
    trend: '+8.3%', 
    up: true, 
    icon: Download,
    subtitle: 'Incoming funds today'
  },
  { 
    title: 'Daily Payouts', 
    value: '$390,450', 
    trend: '+5.1%', 
    up: true, 
    icon: Upload,
    subtitle: 'Outgoing funds today'
  },
  { 
    title: 'Active Merchants', 
    value: '1,492', 
    trend: '+4.2%', 
    up: true, 
    icon: Store,
    subtitle: 'Transacted in last 24h'
  },
  { 
    title: 'Total Users', 
    value: '142,394', 
    trend: '+1.8%', 
    up: true, 
    icon: Users,
    subtitle: 'Registered accounts'
  },
];

const transactionData = [
  { time: '00:00', volume: 12000, payouts: 8000 },
  { time: '04:00', volume: 8000, payouts: 5000 },
  { time: '08:00', volume: 45000, payouts: 25000 },
  { time: '12:00', volume: 89000, payouts: 42000 },
  { time: '16:00', volume: 65000, payouts: 55000 },
  { time: '20:00', volume: 32000, payouts: 18000 },
  { time: '24:00', volume: 15000, payouts: 10000 },
];

const systemHealth = [
  { service: 'Monime API', status: 'operational', latency: '45ms' },
  { service: 'Redis Cache', status: 'operational', latency: '2ms' },
  { service: 'Queue Workers', status: 'operational', latency: '12ms' },
  { service: 'Webhook Delivery', status: 'degraded', latency: '850ms' },
  { service: 'PostgreSQL DB', status: 'operational', latency: '8ms' },
  { service: 'SMS Provider', status: 'operational', latency: '120ms' },
  { service: 'Global API Latency', status: 'operational', latency: '65ms' },
];

const initialActivity = [
  { id: '1', title: 'Payment Completed', time: '1 min ago', type: 'success', desc: 'Transfer of $450 to Wallet U-991.' },
  { id: '2', title: 'Payout Initiated', time: '2 mins ago', type: 'info', desc: 'Batch #B-9182 sent for processing.' },
  { id: '3', title: 'Suspicious Activity Detected', time: '5 mins ago', type: 'alert', desc: 'Multiple failed logins for admin@...' },
  { id: '4', title: 'Merchant Onboarded', time: '12 mins ago', type: 'success', desc: 'GlobalTech Ltd completed KYC.' },
  { id: '5', title: 'Webhook Failed', time: '15 mins ago', type: 'error', desc: 'Failed delivery to endpoint XYZ.' },
  { id: '6', title: 'Account Frozen', time: '45 mins ago', type: 'error', desc: 'Wallet U-991 temporarily suspended.' },
  { id: '7', title: 'Payroll Completed', time: '1 hr ago', type: 'success', desc: 'Disbursed salaries for 45 employees.' },
];

const liveEvents = [
  { title: 'Payment Completed', type: 'success', desc: 'Transfer settled successfully.' },
  { title: 'Payout Initiated', type: 'info', desc: 'Batch transfer sent to partner bank.' },
  { title: 'Suspicious Activity Detected', type: 'alert', desc: 'Velocity rule triggered.' },
  { title: 'Merchant Onboarded', type: 'success', desc: 'New merchant approved from queue.' },
  { title: 'Webhook Failed', type: 'error', desc: 'Timeout on notification callback.' },
  { title: 'Account Frozen', type: 'error', desc: 'Automated lock due to AML flag.' },
  { title: 'Payroll Completed', type: 'success', desc: 'Batch 142a completed.' }
];

export default function Overview() {
  const [activities, setActivities] = React.useState(initialActivity);

  React.useEffect(() => {
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
          return [newEvent, ...prev].slice(0, 7).map((item, idx) => {
            if (idx !== 0 && item.time === 'Just now') return { ...item, time: '1 min ago' };
            return item;
          });
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Ecosystem Overview</h1>
          <p className="text-sm text-muted-foreground">Real-time pulse of the Monivexa financial graph.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Live Data
          </Badge>
          <span className="text-xs text-muted-foreground/70">Last updated: Just now</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className={`overflow-hidden shadow-sm border-border/60 ${kpi.alert ? 'border-red-200 bg-red-50/30' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${kpi.alert ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                  kpi.up ? "text-emerald-700 bg-emerald-100" : (kpi.alert ? "text-red-700 bg-red-100" : "text-amber-700 bg-amber-100")
                )}>
                  {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend}
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight mb-1">{kpi.value}</p>
              <h3 className="text-sm font-semibold text-muted-foreground">{kpi.title}</h3>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Transaction Velocity</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Volume vs Payouts today</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-indigo-600">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> Volume
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Payouts
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transactionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '13px' }}
                    labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                  <Area type="monotone" dataKey="payouts" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPayouts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Modular Panels column constraints */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* System Health */}
          <Card className="shadow-sm border-border/60 overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">System Health</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Global Subsystems</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {systemHealth.map((sys) => (
                  <div key={sys.service} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <span className="text-sm font-medium text-foreground/90">{sys.service}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-muted-foreground/70">{sys.latency}</span>
                      <Badge variant="outline" className={cn(
                        "text-[10px] capitalize px-1.5 py-0",
                        sys.status === 'operational' ? "border-emerald-200 text-emerald-600 bg-emerald-50" : "border-amber-200 text-amber-600 bg-amber-50"
                      )}>
                        {sys.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="shadow-sm border-border/60 flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
                Live Feed
                <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
                  View all <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-4 space-y-6 border-l border-border/40 before:absolute before:inset-y-0 before:left-[-0.5px] before:w-[1px] before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
                <div className="flex flex-col gap-6 overflow-hidden">
                  {activities.map((activity) => (
                    <div key={activity.id} className="relative animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className={cn(
                        "absolute -left-[21px] w-2.5 h-2.5 rounded-full ring-4 ring-white",
                        activity.type === 'alert' ? "bg-amber-500" :
                        activity.type === 'error' ? "bg-red-500" :
                        activity.type === 'success' ? "bg-emerald-500" : "bg-blue-500"
                      )} />
                      <div className="text-xs text-muted-foreground/70 mb-0.5">{activity.time}</div>
                      <div className="text-sm font-medium text-foreground leading-tight">{activity.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{activity.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Ecosystem Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'Wallets', desc: 'P2P & Consumer', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50', count: '1.2M' },
          { name: 'Merchants', desc: 'B2B & Retail', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50', count: '84.2K' },
          { name: 'NGOs', desc: 'Aid Disbursements', icon: HeartHandshake, color: 'text-emerald-600', bg: 'bg-emerald-50', count: '12' },
          { name: 'Payroll', desc: 'Corporate Salaries', icon: Send, color: 'text-violet-600', bg: 'bg-violet-50', count: '450' },
        ].map(mod => (
          <Card key={mod.name} className="shadow-sm border-border/60 hover:border-slate-300 transition-colors cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", mod.bg, mod.color)}>
                  <mod.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm group-hover:text-indigo-600 transition-colors">{mod.name}</h4>
                  <p className="text-[10px] text-muted-foreground">{mod.desc}</p>
                </div>
              </div>
              <div className="text-sm font-bold text-foreground/90">{mod.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper utility
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
