import React from 'react';
import { ShieldBan, Verified, RotateCcw, AlertTriangle, X, Wallet, CreditCard, Laptop, Smartphone, MapPin, Activity, CalendarDays, MoreVertical, Lock, Unlock, DownloadCloud, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WalletDetailPanelProps {
  walletId: string | null;
  onClose: () => void;
}

export function WalletDetailPanel({ walletId, onClose }: WalletDetailPanelProps) {
  if (!walletId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-muted/30 dark:bg-primary border-l border-border dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-card dark:bg-slate-950 border-b border-border/40 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Wallet <span className="font-mono text-sm font-normal text-muted-foreground">{walletId}</span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 border-none">Active</Badge>
              <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 border-none">CUSTOMER TYPE</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="h-9 w-9" />}>
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Wallet Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><ArrowRightLeft className="w-4 h-4 mr-2"/> Force Transfer</DropdownMenuItem>
                <DropdownMenuItem><DownloadCloud className="w-4 h-4 mr-2"/> Export Ledger</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-amber-600"><Lock className="w-4 h-4 mr-2"/> Freeze Wallet</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600"><ShieldBan className="w-4 h-4 mr-2"/> Close Wallet</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-muted rounded-full" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-6">
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-primary border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
              <div className="text-xs text-muted-foreground/70 font-medium tracking-wide uppercase mb-1">Available Balance</div>
              <div className="text-3xl font-light text-primary-foreground tracking-tight">$240.50</div>
              <div className="mt-4 text-xs font-mono text-emerald-400 flex items-center justify-between">
                <span>+ $1,204.00 (30d)</span>
                <span>Ledger synced</span>
              </div>
            </div>
            
            <div className="grid grid-rows-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <div className="text-xs text-muted-foreground mb-1">Owner Entity</div>
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Avatar className="h-5 w-5 bg-indigo-100 text-indigo-700 text-[9px]"><AvatarFallback>JD</AvatarFallback></Avatar>
                  John Doe <span className="font-normal text-muted-foreground/70">(usr_8sf7sa)</span>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
                 <div>
                    <div className="text-xs text-muted-foreground mb-1">Limits / Velocity</div>
                    <div className="text-sm font-semibold text-foreground">$5,000 / day</div>
                 </div>
                 <div className="w-10 h-10 rounded-full border-4 border-border/40 relative">
                   <div className="absolute inset-[-4px] rounded-full border-4 border-indigo-500 border-r-transparent border-b-transparent transform rotate-45"></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Holdings Breakdown */}
          <Card className="shadow-sm border-border">
            <CardHeader className="p-4 border-b border-border/40">
              <CardTitle className="text-sm">Balance Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border/40">
                  <div className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-foreground">Available Funds</span>
                     </div>
                     <span className="text-sm font-semibold text-foreground">$240.50</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-sm font-medium text-foreground">Pending Holds (Escrow)</span>
                     </div>
                     <span className="text-sm font-semibold text-amber-600">$45.00</span>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-muted/50">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <span className="text-sm font-medium text-muted-foreground">Reserved for Fees</span>
                     </div>
                     <span className="text-sm font-semibold text-muted-foreground">$2.50</span>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Ledger History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-500"/> Ledger & Transfers
              </h3>
              <Button variant="outline" size="sm" className="h-7 text-xs bg-card">View Full Ledger</Button>
            </div>
            
            <Card className="shadow-sm border-border">
              <div className="divide-y divide-border/40">
                {[
                  { id: 'lx_1234', desc: 'Transfer Receipt: Jane Smith', date: 'Today, 14:45:12', amount: '+$150.00', type: 'credit', balance: '$240.50' },
                  { id: 'lx_1235', desc: 'System Fee deduction', date: 'Today, 10:00:00', amount: '-$1.50', type: 'debit', balance: '$90.50' },
                  { id: 'lx_1236', desc: 'Payment: Cafe Local', date: 'Yesterday, 08:30:00', amount: '-$8.00', type: 'debit', balance: '$92.00' },
                  { id: 'lx_1237', desc: 'External Deposit (Stripe)', date: 'Oct 23, 11:15:00', amount: '+$100.00', type: 'credit', balance: '$100.00' }
                ].map((entry) => (
                  <div key={entry.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-foreground flex items-center gap-2">
                         {entry.desc}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">{entry.id} • {entry.date}</div>
                    </div>
                    <div className="text-right">
                       <div className={cn("text-sm font-bold", entry.type === 'credit' ? "text-emerald-600" : "text-foreground")}>
                         {entry.amount}
                       </div>
                       <div className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">Bal: {entry.balance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
        </div>
      </ScrollArea>
    </div>
  );
}
