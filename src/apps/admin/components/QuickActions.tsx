import React, { useState } from 'react';
import { Plus, Send, Download, Upload, Users, ShieldAlert, ArrowRightLeft } from 'lucide-react';
import { useAdminStore } from '../store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const { setView } = useAdminStore();

  const actions = [
    { label: 'Disburse Funds', icon: Send, view: 'payouts', color: 'bg-emerald-500', text: 'text-primary-foreground' },
    { label: 'Issue Invoice', icon: Download, view: 'invoices', color: 'bg-indigo-500', text: 'text-primary-foreground' },
    { label: 'Flag Transaction', icon: ShieldAlert, view: 'fraud', color: 'bg-amber-500', text: 'text-primary-foreground' },
    { label: 'Manual Adjustment', icon: ArrowRightLeft, view: 'ledger', color: 'bg-slate-800', text: 'text-primary-foreground' }
  ];

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end">
      
      {/* Action Menu */}
      <div 
        className={cn(
          "flex flex-col gap-2 mb-4 transition-all duration-200 transform origin-bottom relative z-10",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {actions.map((action, i) => (
          <div key={i} className="flex items-center gap-3 justify-end group">
            <span className="text-xs font-medium text-foreground/90 dark:text-slate-200 bg-card dark:bg-slate-800 px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {action.label}
            </span>
            <button
              onClick={() => {
                setView(action.view);
                setIsOpen(false);
              }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110",
                action.color,
                action.text
              )}
            >
              <action.icon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 bg-emerald-600 text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 z-50",
          isOpen && "rotate-45"
        )}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-primary/10 backdrop-blur-sm -z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
