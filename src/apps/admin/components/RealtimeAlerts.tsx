import React, { useState, useEffect } from 'react';
import { ShieldAlert, X, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore } from '../store';

const initialAlerts: any[] = [];

export function RealtimeAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [isVisible, setIsVisible] = useState(true);
  const { setView } = useAdminStore();

  useEffect(() => {
    // Mock incoming alerts
    const interval = setInterval(() => {
      setAlerts(prev => {
        if (Math.random() > 0.5 && prev.length < 3) {
          const newId = Date.now().toString();
          
          setTimeout(() => {
            setAlerts(current => current.filter(a => a.id !== newId));
          }, 8000);

          return [
            {
              id: newId,
              title: 'Velocity Rule Triggered',
              message: 'User U-8812 attempted 5 identical payouts.',
              time: 'Just now'
            },
            ...prev
          ];
        }
        return prev;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || alerts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 w-[calc(100vw-32px)] md:w-80 flex flex-col gap-2">
      {alerts.map((alert, index) => (
        <div 
          key={alert.id}
          className="bg-primary border border-slate-700 shadow-2xl rounded-xl p-3 flex gap-3 animate-in fade-in slide-in-from-right-8 duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-semibold text-primary-foreground">{alert.title}</h4>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setAlerts(prev => prev.filter(a => a.id !== alert.id));
                }}
                className="text-muted-foreground/70 hover:text-primary-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{alert.message}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[10px] text-muted-foreground/70 font-mono flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-500" /> LIVE</span>
              <button 
                onClick={() => setView('fraud')}
                className="text-xs text-emerald-400 font-medium hover:text-emerald-300 transition-colors bg-emerald-400/10 px-2 py-0.5 rounded"
              >
                Investigate
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
