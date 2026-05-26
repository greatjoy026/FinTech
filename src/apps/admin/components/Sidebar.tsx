import React from 'react';
import { 
  LayoutDashboard, Users, Wallet, CreditCard, Send, BookOpen, Store, 
  GraduationCap, CalendarDays, Receipt, HeartHandshake, FileText, 
  BarChart3, ShieldAlert, FileCheck, Bell, Webhook, Activity, 
  Settings, X, ShieldCheck, PiggyBank, Car, Scale, Palette
} from 'lucide-react';
import { useAdminStore } from '../store';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', icon: LayoutDashboard, view: 'overview' },
  { name: 'Fraud Center', icon: ShieldAlert, view: 'fraud' },
  { name: 'System Monitoring', icon: Activity, view: 'monitoring' },
  { type: 'divider', name: 'Operations' },
  { name: 'Users', icon: Users, view: 'users' },
  { name: 'Wallets', icon: Wallet, view: 'wallets' },
  { name: 'Payments', icon: CreditCard, view: 'payments' },
  { name: 'Payouts', icon: Send, view: 'payouts' },
  { name: 'Ledger', icon: BookOpen, view: 'ledger' },
  { type: 'divider', name: 'Ecosystem' },
  { name: 'Merchants', icon: Store, view: 'merchants' },
  { name: 'Schools', icon: GraduationCap, view: 'schools' },
  { name: 'NGOs', icon: HeartHandshake, view: 'ngos' },
  { name: 'Payroll', icon: Receipt, view: 'payroll' },
  { name: 'Events', icon: CalendarDays, view: 'events' },
  { name: 'Invoices', icon: FileText, view: 'invoices' },
  { name: 'Savings', icon: PiggyBank, view: 'savings' },
  { name: 'Mobility', icon: Car, view: 'mobility' },
  { name: 'Escrow', icon: Scale, view: 'escrow' },
  { type: 'divider', name: 'System' },
  { name: 'Analytics', icon: BarChart3, view: 'analytics' },
  { name: 'Compliance', icon: FileCheck, view: 'compliance' },
  { name: 'Audit Logs', icon: ShieldCheck, view: 'audit' },
  { name: 'Notifications', icon: Bell, view: 'notifications' },
  { name: 'Webhooks', icon: Webhook, view: 'webhooks' },
  { name: 'Settings', icon: Settings, view: 'settings' },
  { name: 'Design System', icon: Palette, view: 'design' },
];

export function Sidebar() {
  const { isSidebarOpen, setSidebarOpen, view, setView } = useAdminStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-primary/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-sidebar text-sidebar-foreground transform transition-all duration-300 ease-in-out md:translate-x-0 md:static flex flex-col border-r border-sidebar-border",
        "w-64 md:w-20 lg:w-64",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between md:justify-center lg:justify-between px-6 md:px-0 lg:px-6 border-b border-sidebar-border bg-sidebar">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold tracking-tighter">MX</span>
            </div>
            <span className="text-primary-foreground font-semibold tracking-tight md:hidden lg:block overflow-hidden whitespace-nowrap">Monivexa Ops</span>
          </div>
          <button 
            className="md:hidden text-muted-foreground/70 hover:text-primary-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="space-y-1">
            {navigation.map((item, idx) => {
              if (item.type === 'divider') {
                return (
                  <div key={idx} className="pt-5 pb-2 px-3 flex items-center justify-center lg:justify-start">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground md:hidden lg:block whitespace-nowrap">
                      {item.name}
                    </p>
                    <div className="h-px bg-sidebar-accent w-full hidden md:block lg:hidden" />
                  </div>
                );
              }

              const Icon = item.icon!;
              const isActive = view === item.view;

              return (
                <button
                  key={item.name}
                  title={item.name}
                  onClick={() => {
                    if (item.view === 'notifications') {
                      useAdminStore.getState().setNotificationsOpen(true);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                      return;
                    }
                    setView(item.view!);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 md:justify-center lg:justify-start",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400 font-medium" 
                      : "text-muted-foreground/70 hover:text-slate-200 hover:bg-primary/90"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-emerald-400" : "text-muted-foreground")} />
                  <span className="md:hidden lg:block overflow-hidden whitespace-nowrap">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Bottom Area */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar md:flex md:justify-center lg:block">
          <div className="flex items-center gap-3 rounded-lg bg-primary/50 p-3 md:p-2 lg:p-3 border border-sidebar-border md:justify-center lg:justify-start">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-xs md:hidden lg:block overflow-hidden whitespace-nowrap">
              <p className="text-sidebar-foreground font-medium">Core System</p>
              <p className="text-emerald-500">Operational</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
