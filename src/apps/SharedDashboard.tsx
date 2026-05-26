import React from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export const AppDashboard = ({ title, description }: { title: string, description: string }) => {
  const { auth, logout } = useAuth();

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex overflow-hidden font-sans text-foreground border-x-0 border-y-0 sm:border-2 border-border">
      {/* Global Infrastructure Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-primary-foreground hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center font-bold text-xl tracking-tighter">KM</div>
            <div>
              <h1 className="text-lg font-bold leading-tight">KaekteMoni</h1>
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">Ecosystem Core</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase px-3 py-2">Infrastructure Management</p>
          <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-300">Shared Wallet API</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            </div>
            <p className="text-[10px] text-muted-foreground/70">v1.2.4-stable • Monime Connected</p>
          </div>

          <div className="mt-6 space-y-4 px-3">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-5 h-5 opacity-60">🔒</div>
              <span className="text-sm">Shared Auth (JWT)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-5 h-5 opacity-60">📂</div>
              <span className="text-sm">Unified Ledger</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-5 h-5 opacity-60">⚡</div>
              <span className="text-sm">Notification Engine</span>
            </div>
          </div>
        </nav>

        <div className="p-6 bg-primary border-t border-slate-700/50">
          <div className="flex items-center gap-3 w-full truncate">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs shrink-0 flex-none">{auth?.role?.substring(0,2) || 'KM'}</div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{auth?.role}</p>
              <p className="text-[10px] text-muted-foreground truncate">ID: {auth?.userId?.split('-')[0]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-semibold text-muted-foreground hidden sm:block">Ecosystem Workspace Manager</h2>
            <div className="h-4 w-[1px] bg-slate-300 hidden sm:block"></div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">STATUS:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">PRODUCTION READY</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={logout} className="bg-indigo-600 text-primary-foreground text-xs font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
              Sign out
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 flex-1 overflow-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <button className="text-xs font-semibold text-indigo-600 hover:underline">View Shared Ledger →</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight mb-1">Active Role</p>
              <p className="text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">{auth?.role}</p>
              <div className="mt-2 text-[10px] text-emerald-600 font-medium">Session Authenticated</div>
            </div>
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight mb-1">User Reference</p>
              <p className="text-md sm:text-lg font-mono text-foreground tracking-tight truncate" title={auth?.userId}>{auth?.userId}</p>
              <div className="mt-2 text-[10px] text-indigo-500 font-medium">KaekteMoni ID</div>
            </div>
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
              <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight mb-1">System Connect</p>
              <p className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Healthy
              </p>
              <div className="mt-2 text-[10px] text-muted-foreground">Latency: 24ms</div>
            </div>
          </div>

          {/* Apps Selection Example Area */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-foreground tracking-tight">Available Ecosystem Modules</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card group cursor-pointer hover:border-indigo-400 transition-all border border-border p-6 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-indigo-600 group-hover:text-primary-foreground transition-colors">📱</div>
                <h4 className="font-bold text-foreground text-lg mb-1">Wallet Core</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">Direct personal access to funds, peer transfers, and bills.</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">ACCESS GRANTED</span>
                </div>
              </div>
              <div className="bg-card group cursor-pointer hover:border-emerald-400 transition-all border border-border p-6 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-emerald-600 group-hover:text-primary-foreground transition-colors">🏫</div>
                <h4 className="font-bold text-foreground text-lg mb-1">School Manager</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">Fee collection interface and student invoicing portal.</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">ACCESS GRANTED</span>
                </div>
              </div>
              <div className="bg-card group cursor-pointer hover:border-amber-400 transition-all border border-border p-6 rounded-2xl shadow-sm">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-amber-500 group-hover:text-primary-foreground transition-colors">🤝</div>
                <h4 className="font-bold text-foreground text-lg mb-1">NGO Bridge</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">Control center for massive cash distribution efforts.</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">PROVISIONING...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
