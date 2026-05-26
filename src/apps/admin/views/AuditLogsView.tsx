import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShieldCheck, Download, History, UserCog, Activity, FileJson, ArrowRight, ArrowDownToLine, Clock } from 'lucide-react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';

const mockLogs = [
  { id: 'al_0921', admin: 'Sarah Connor', role: 'Super Admin', action: 'Update System Setting', target: 'Risk Thresholds', time: '10 mins ago', status: 'success', ip: '192.168.1.4' },
  { id: 'al_0920', admin: 'John Doe', role: 'Compliance Officer', action: 'KYC Override', target: 'User cus_892', time: '25 mins ago', status: 'success', ip: '10.0.0.52' },
  { id: 'al_0919', admin: 'Jane Smith', role: 'Support Agent', action: 'Password Reset', target: 'User cus_110', time: '1 hour ago', status: 'success', ip: '192.168.1.15' },
  { id: 'al_0918', admin: 'System API', role: 'System', action: 'Batch Cleanup', target: 'Expired Sessions', time: '2 hours ago', status: 'success', ip: '127.0.0.1' },
  { id: 'al_0917', admin: 'Alice Johnson', role: 'System Admin', action: 'Delete Webhook', target: 'wh_908', time: '3 hours ago', status: 'failed', ip: '192.168.1.8' },
];

export default function AuditLogsView() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'changes' | 'admins'>('timeline');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
             <ShieldCheck className="w-6 h-6 text-foreground/90" />
             Audit Logs & Security
           </h1>
           <p className="text-sm text-muted-foreground mt-1">Immutable ledger of platform configuration changes and staff actions.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm">
             <Download className="w-4 h-4" /> Export CSV
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Events Today</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">1,405</h2>
               </div>
               <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground"><Activity className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">Standard volume</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card border-l-4 border-l-rose-500">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Failed Attempts</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">12</h2>
               </div>
               <div className="w-8 h-8 rounded bg-rose-50 flex items-center justify-center text-rose-600"><ShieldCheck className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-rose-600 mt-2 font-medium">Requires review</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Staff</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">24</h2>
               </div>
               <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600"><UserCog className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-muted-foreground mt-2 font-medium">Currently logged in</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/60 bg-card">
          <CardContent className="p-5">
             <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Log Retention</p>
                 <h2 className="text-2xl font-bold text-foreground mt-1">7 Years</h2>
               </div>
               <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground"><History className="w-4 h-4"/></div>
             </div>
             <p className="text-xs text-emerald-600 mt-2 font-medium">Compliant with SOC2</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-6 border-b border-border">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-slate-900 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Audit Timeline
        </button>
        <button 
          onClick={() => setActiveTab('changes')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'changes' ? 'border-slate-900 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Before/After Diff
        </button>
        <button 
          onClick={() => setActiveTab('admins')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'admins' ? 'border-slate-900 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Admin Activity 
        </button>
      </div>

      {activeTab === 'timeline' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-[400px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  placeholder="Search by action, user, or IP address..." 
                  className="pl-10 h-10 bg-card text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-10 gap-1.5 bg-card"><Filter className="w-4 h-4"/> Filter Events</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Event ID</th>
                      <th className="px-6 py-4 font-semibold">Actor</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                      <th className="px-6 py-4 font-semibold">Target Resource</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 bg-card">
                    {mockLogs.map((log, i) => (
                       <tr key={i} className="hover:bg-muted/30">
                          <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground">{log.id}</td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                                <span className="font-medium text-foreground">{log.admin}</span>
                                <span className="text-[10px] text-muted-foreground">{log.role} &middot; {log.ip}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-foreground/90">{log.action}</td>
                          <td className="px-6 py-4 text-muted-foreground">{log.target}</td>
                          <td className="px-6 py-4">
                             <Badge variant="outline" className={
                                log.status === 'success' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                                'border-rose-200 text-rose-700 bg-rose-50'
                             }>
                                {log.status}
                             </Badge>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{log.time}</td>
                       </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'changes' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
           <CardHeader className="border-b border-border/40 py-4">
              <CardTitle className="text-base text-foreground">Resource Diff Inspector</CardTitle>
              <CardDescription>View JSON diffs for system configuration and policy updates.</CardDescription>
           </CardHeader>
           <CardContent className="p-6">
              <div className="bg-[#0A0A0A] rounded-lg border border-slate-800 text-slate-300 flex overflow-hidden max-h-[500px]">
                 <div className="w-1/2 border-r border-slate-800 p-4 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Before</span>
                       <Badge variant="secondary" className="bg-slate-800 text-muted-foreground/70 border-none text-[10px]">v1.4.2</Badge>
                    </div>
                    <pre className="text-[11px] font-mono leading-relaxed text-muted-foreground/70">
{`{
  "module": "fraud_engine",
  "config": {
    "risk_score_threshold": 85,
    "block_on_high_risk": false,
    "require_3ds_above": 500,
    "allowed_countries": ["US", "CA", "GB"]
  },
  "updated_at": "2026-05-10T14:20:00Z"
}`}
                    </pre>
                 </div>
                 <div className="w-1/2 p-4 overflow-y-auto bg-primary/50">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">After</span>
                       <Badge variant="secondary" className="bg-emerald-900/30 text-emerald-400 border-emerald-800 text-[10px]">v1.4.3</Badge>
                    </div>
                    <pre className="text-[11px] font-mono leading-relaxed">
{`{
  "module": "fraud_engine",
  "config": {
`}
<span className="bg-rose-500/20 text-rose-300 block px-2 -mx-2 line-through">{`    "risk_score_threshold": 85,`}</span>
<span className="bg-emerald-500/20 text-emerald-300 block px-2 -mx-2">{`    "risk_score_threshold": 75,`}</span>
<span className="bg-rose-500/20 text-rose-300 block px-2 -mx-2 line-through">{`    "block_on_high_risk": false,`}</span>
<span className="bg-emerald-500/20 text-emerald-300 block px-2 -mx-2">{`    "block_on_high_risk": true,`}</span>
{`    "require_3ds_above": 500,
`}
<span className="bg-emerald-500/20 text-emerald-300 block px-2 -mx-2">{`    "allowed_countries": ["US", "CA", "GB", "AU", "DE"]`}</span>
{`  },
  "updated_at": "2026-05-25T01:10:00Z"
}`}
                    </pre>
                 </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                 <div>Changed by <strong>Sarah Connor</strong> (Super Admin)</div>
                 <div><Clock className="w-3.5 h-3.5 inline mr-1"/> May 25, 2026 01:10 UTC</div>
              </div>
           </CardContent>
        </Card>
      )}

      {activeTab === 'admins' && (
        <Card className="shadow-sm border-border/60 animate-in fade-in duration-300">
          <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
             <CardTitle className="text-base text-foreground">Admin Activity Tracking</CardTitle>
             <CardDescription>Monitor staff login sessions, privilege usage, and action volume.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Staff Member</th>
                          <th className="px-6 py-4 font-semibold">Role</th>
                          <th className="px-6 py-4 font-semibold">Actions (30d)</th>
                          <th className="px-6 py-4 font-semibold">Last Login</th>
                          <th className="px-6 py-4 font-semibold">Risk Rating</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 bg-card">
                       {[
                         { name: 'Sarah Connor', role: 'Super Admin', actions: 1405, login: 'Today, 08:30 AM', risk: 'Low', status: 'Active' },
                         { name: 'John Doe', role: 'Compliance Officer', actions: 842, login: 'Today, 09:15 AM', risk: 'Low', status: 'Active' },
                         { name: 'Alice Johnson', role: 'System Admin', actions: 42, login: 'Yesterday', risk: 'Medium', status: 'Suspended' },
                         { name: 'Security Bot', role: 'Automation API', actions: 45020, login: 'System', risk: 'Low', status: 'Active' },
                       ].map((item, i) => (
                           <tr key={i} className="hover:bg-muted/30">
                              <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                              <td className="px-6 py-4 text-muted-foreground">{item.role}</td>
                              <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{item.actions.toLocaleString()}</td>
                              <td className="px-6 py-4 text-muted-foreground">{item.login}</td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className={
                                   item.risk === 'Low' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                                   'border-amber-200 text-amber-700 bg-amber-50'
                                }>
                                  {item.risk}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="secondary" className={item.status === 'Active' ? 'bg-muted text-foreground/90' : 'bg-rose-100 text-rose-700'}>
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

    </div>
  );
}
