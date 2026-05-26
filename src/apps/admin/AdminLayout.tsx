import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter';
import { RealtimeAlerts } from './components/RealtimeAlerts';
import { QuickActionsFAB } from './components/QuickActions';
import { useAdminStore } from './store';

// Standard imports instead of lazy loading to prevent chunk errors
import Overview from './views/Overview';
import UsersView from './views/UsersView';
import FraudCenter from './views/FraudCenter';
import PaymentsView from './views/PaymentsView';
import PayoutsView from './views/PayoutsView';
import WalletsView from './views/WalletsView';
import SystemMonitoringView from './views/SystemMonitoringView';
import LedgerView from './views/LedgerView';
import MerchantsView from './views/MerchantsView';
import SchoolsView from './views/SchoolsView';
import NGOsView from './views/NGOsView';
import PayrollView from './views/PayrollView';
import EventsView from './views/EventsView';
import InvoicesView from './views/InvoicesView';
import SavingsView from './views/SavingsView';
import MobilityView from './views/MobilityView';
import EscrowView from './views/EscrowView';
import ComplianceView from './views/ComplianceView';
import SettingsView from './views/SettingsView';
import AnalyticsView from './views/AnalyticsView';
import WebhooksView from './views/WebhooksView';
import AuditLogsView from './views/AuditLogsView';
import DesignSystemView from './views/DesignSystemView';

function ViewRenderer() {
  const { view } = useAdminStore();
  
  switch(view) {
    case 'overview':
      return <Overview />;
    case 'analytics':
      return <AnalyticsView />;
    case 'users':
      return <UsersView />;
    case 'fraud':
      return <FraudCenter />;
    case 'payments':
      return <PaymentsView />;
    case 'payouts':
      return <PayoutsView />;
    case 'ledger':
      return <LedgerView />;
    case 'merchants':
      return <MerchantsView />;
    case 'schools':
      return <SchoolsView />;
    case 'ngos':
      return <NGOsView />;
    case 'payroll':
      return <PayrollView />;
    case 'events':
      return <EventsView />;
    case 'invoices':
      return <InvoicesView />;
    case 'savings':
      return <SavingsView />;
    case 'mobility':
      return <MobilityView />;
    case 'escrow':
      return <EscrowView />;
    case 'compliance':
      return <ComplianceView />;
    case 'settings':
      return <SettingsView />;
    case 'wallets':
      return <WalletsView />;
    case 'monitoring':
      return <SystemMonitoringView />;
    case 'webhooks':
      return <WebhooksView />;
    case 'audit':
      return <AuditLogsView />;
    case 'design':
      return <DesignSystemView />;
    // Other cases...
    default:
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🚧</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground dark:text-slate-200">Module Under Construction</h2>
          <p className="text-muted-foreground dark:text-muted-foreground/70 mt-2 text-sm max-w-sm">The {view} module is currently being built out for the Monivexa platform.</p>
        </div>
      );
  }
}

export function AdminLayout() {
  const { toggleCommandPalette } = useAdminStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  return (
    <div className="flex h-screen w-full bg-background font-sans text-foreground overflow-hidden selection:bg-emerald-500/30 relative">
      <CommandPalette />
      <NotificationCenter />
      <RealtimeAlerts />
      <QuickActionsFAB />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 relative">
          <ViewRenderer />
        </main>
      </div>

      {/* Mobile Bottom Quick Actions */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card dark:bg-primary border-t border-border dark:border-sidebar-border px-6 py-3 flex items-center justify-between z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[calc(12px+env(safe-area-inset-bottom))]">
        <button 
          onClick={() => useAdminStore.getState().setView('overview')}
          className="flex flex-col items-center gap-1 text-muted-foreground dark:text-muted-foreground/70 hover:text-emerald-600 dark:hover:text-emerald-400 focus:text-emerald-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button 
          onClick={() => useAdminStore.getState().setView('users')}
          className="flex flex-col items-center gap-1 text-muted-foreground dark:text-muted-foreground/70 hover:text-emerald-600 dark:hover:text-emerald-400 focus:text-emerald-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span className="text-[10px] font-medium">Users</span>
        </button>
        <button 
          onClick={() => toggleCommandPalette()}
          className="flex flex-col items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg transform -translate-y-4 hover:bg-primary/90 active:scale-95 transition-all relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <button
          onClick={() => useAdminStore.getState().setView('payments')}
          className="flex flex-col items-center gap-1 text-muted-foreground dark:text-muted-foreground/70 hover:text-emerald-600 dark:hover:text-emerald-400 focus:text-emerald-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span className="text-[10px] font-medium">Pay</span>
        </button>
        <button 
          onClick={() => useAdminStore.getState().setSidebarOpen(true)}
          className="flex flex-col items-center gap-1 text-muted-foreground dark:text-muted-foreground/70 hover:text-emerald-600 dark:hover:text-emerald-400 focus:text-emerald-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </div>
  );
}
