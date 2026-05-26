import React from 'react';
import { X, Bell, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { useAdminStore } from '../store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const mockNotifications = [
  {
    id: '1',
    type: 'fraud',
    title: 'High Risk Transaction Blocked',
    message: 'A transaction of $5,000 to flagged wallet W-8912 was automatically frozen.',
    time: '2 mins ago',
    read: false,
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10'
  },
  {
    id: '2',
    type: 'system',
    title: 'Settlement Batch Complete',
    message: 'Batch #B-9921 settled $1.2M across 4 providers with 0 variances.',
    time: '15 mins ago',
    read: false,
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10'
  },
  {
    id: '3',
    type: 'approval',
    title: 'Pending Manual Review',
    message: 'Merchant onboarding for "TechHub Africa" requires compliance officer sign-off.',
    time: '1 hour ago',
    read: true,
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/10'
  }
];

export function NotificationCenter() {
  const { isNotificationsOpen, setNotificationsOpen } = useAdminStore();

  return (
    <>
      {/* Backdrop */}
      {isNotificationsOpen && (
        <div 
          className="fixed inset-0 z-40 bg-primary/20 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
          onClick={() => setNotificationsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-card dark:bg-primary border-l border-border dark:border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col",
          isNotificationsOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-foreground/90 dark:text-slate-300" />
            <h2 className="font-semibold text-foreground dark:text-slate-200">Notifications</h2>
            <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400">2 New</Badge>
          </div>
          <button 
            onClick={() => setNotificationsOpen(false)}
            className="p-2 text-muted-foreground/70 hover:text-muted-foreground dark:hover:text-slate-200 rounded-lg hover:bg-muted dark:hover:bg-primary/90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {mockNotifications.map(notification => {
              const Icon = notification.icon;
              return (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 rounded-xl border transition-colors cursor-pointer group",
                    notification.read 
                      ? "bg-muted/30 border-border/40 dark:bg-slate-800/50 dark:border-slate-800" 
                      : "bg-card border-border shadow-sm dark:bg-slate-800 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="flex gap-4">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", notification.bg)}>
                      <Icon className={cn("w-5 h-5", notification.color)} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "text-sm font-semibold",
                          notification.read ? "text-muted-foreground dark:text-muted-foreground/70" : "text-foreground dark:text-slate-100"
                        )}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">{notification.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground/70 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border/40 dark:border-slate-800">
           <button className="w-full py-2 text-sm font-medium text-muted-foreground dark:text-slate-300 bg-muted dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              Mark all as read
           </button>
        </div>
      </div>
    </>
  );
}
