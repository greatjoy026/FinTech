import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const transactionTrends = [
  { time: '00:00', volume: 12000, payout: 4000, count: 450 },
  { time: '04:00', volume: 8500, payout: 2100, count: 320 },
  { time: '08:00', volume: 24000, payout: 12000, count: 890 },
  { time: '12:00', volume: 45000, payout: 28000, count: 1800 },
  { time: '16:00', volume: 52000, payout: 35000, count: 2100 },
  { time: '20:00', volume: 38000, payout: 18000, count: 1400 },
  { time: '23:59', volume: 18000, payout: 9000, count: 650 },
];

const walletGrowth = [
  { day: 'Mon', new_wallets: 420 },
  { day: 'Tue', new_wallets: 512 },
  { day: 'Wed', new_wallets: 680 },
  { day: 'Thu', new_wallets: 650 },
  { day: 'Fri', new_wallets: 890 },
  { day: 'Sat', new_wallets: 1020 },
  { day: 'Sun', new_wallets: 1100 },
];

const paymentSuccessRates = [
  { name: 'Successful', value: 96.5, color: '#10b981' }, // emerald-500
  { name: 'Failed', value: 2.1, color: '#ef4444' }, // red-500
  { name: 'Pending', value: 1.4, color: '#f59e0b' }, // amber-500
];

const merchantRevenue = [
  { name: 'TechHub', revenue: 125000 },
  { name: 'ShopRite', revenue: 98000 },
  { name: 'Jumia', revenue: 85000 },
  { name: 'Airtime', revenue: 64000 },
  { name: 'PowerCo', revenue: 52000 },
];

const segmentData = [
  { day: 'Mon', events: 12000, schools: 45000, ngos: 8000 },
  { day: 'Tue', events: 15000, schools: 52000, ngos: 12000 },
  { day: 'Wed', events: 18000, schools: 48000, ngos: 9500 },
  { day: 'Thu', events: 21000, schools: 61000, ngos: 15000 },
  { day: 'Fri', events: 35000, schools: 58000, ngos: 18000 },
  { day: 'Sat', events: 58000, schools: 12000, ngos: 22000 },
  { day: 'Sun', events: 45000, schools: 5000, ngos: 14000 },
];

export default function AnalyticsView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground dark:text-slate-100">Realtime Analytics</h1>
        <p className="text-muted-foreground dark:text-muted-foreground/70 mt-1">Platform-wide performance and engagement metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Trends (24h)</CardTitle>
            <CardDescription>Volume processing across all gateways</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transactionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                  <Area type="monotone" dataKey="payout" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPayout)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Segment Collections */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Segment Collections</CardTitle>
            <CardDescription>Events, Schools, and NGO disbursements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="schools" name="School Fees" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="events" name="Event Tickets" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="ngos" name="NGO Disbursals" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wallet Growth</CardTitle>
            <CardDescription>New wallet creation over last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={walletGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="new_wallets" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Success Rates & Top Merchants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Payment Success Rates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Success Rates</CardTitle>
              <CardDescription>Overall transaction health</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentSuccessRates}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentSuccessRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Rate']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-foreground dark:text-slate-200">96.5%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Success</span>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                {paymentSuccessRates.map(rate => (
                  <div key={rate.name} className="flex items-center gap-1.5 text-xs text-muted-foreground dark:text-muted-foreground/70">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rate.color }} />
                    {rate.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Merchants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Merchants</CardTitle>
              <CardDescription>By revenue volume (24h)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {merchantRevenue.slice(0, 4).map((merchant, i) => (
                  <div key={merchant.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-muted dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-muted-foreground dark:text-muted-foreground/70">
                        {i + 1}
                      </div>
                      <span className="font-medium text-foreground dark:text-slate-200 text-sm">{merchant.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground dark:text-primary-foreground">
                      ${merchant.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
