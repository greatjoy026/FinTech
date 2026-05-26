import React from 'react';
import { ShieldBan, RotateCcw, X, CreditCard, Activity, ArrowRightLeft, CheckCircle2, Clock, XCircle, FileText, Server, CalendarDays, Zap, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionDetailPanelProps {
  transactionId: string | null;
  onClose: () => void;
}

export function TransactionDetailPanel({ transactionId, onClose }: TransactionDetailPanelProps) {
  if (!transactionId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-muted/30 dark:bg-primary border-l border-border dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-card dark:bg-slate-950 border-b border-border/40 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Transaction Details
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-medium text-muted-foreground">{transactionId}</span>
              <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 h-5 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><RotateCcw className="w-4 h-4 mr-2"/> Retry Payment</DropdownMenuItem>
                <DropdownMenuItem><FileText className="w-4 h-4 mr-2"/> Issue Receipt</DropdownMenuItem>
                <DropdownMenuItem><Zap className="w-4 h-4 mr-2"/> Trigger Webhook</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-amber-600"><RotateCcw className="w-4 h-4 mr-2"/> Issue Refund</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600"><ShieldBan className="w-4 h-4 mr-2"/> Reverse Transaction</DropdownMenuItem>
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
          
          {/* Main Info */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
             <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
               <div>
                  <div className="text-xs text-muted-foreground mb-1">Amount</div>
                  <div className="text-3xl font-bold text-foreground">$1,250.00</div>
               </div>
               <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Date & Time</div>
                  <div className="text-sm font-medium text-foreground">Oct 24, 2023</div>
                  <div className="text-xs text-muted-foreground">14:32:01 UTC</div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <div className="text-xs text-muted-foreground mb-1">Fee Breakdown</div>
                   <div className="text-sm font-medium text-foreground">Total: $12.50</div>
                   <div className="text-xs text-muted-foreground/70">Fixed: $0.30 | Variable: 1%</div>
                </div>
                <div>
                   <div className="text-xs text-muted-foreground mb-1">Net Settlement</div>
                   <div className="text-sm font-medium text-foreground">$1,237.50</div>
                   <div className="text-xs text-muted-foreground/70">To Wallet: wal_09xs12</div>
                </div>
             </div>
          </div>

          {/* Source & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted/30 border border-border rounded-xl p-4 shadow-sm">
               <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Funding Source</div>
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center">
                   <CreditCard className="w-4 h-4" />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-foreground">Visa •••• 4242</div>
                   <div className="text-xs text-muted-foreground">Stripe Integration</div>
                 </div>
               </div>
               <div className="mt-3 text-xs bg-card p-2 rounded border border-border/40 text-muted-foreground break-all font-mono">
                 pi_3Kj4Lw2eZvKYlo2C1D2A3B4C
               </div>
            </div>
            <div className="bg-muted/30 border border-border rounded-xl p-4 shadow-sm">
               <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Destination</div>
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center">
                   <Activity className="w-4 h-4" />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-foreground">Monivexa Wallet</div>
                   <div className="text-xs text-muted-foreground">JD Corp (usr_8sf7sa)</div>
                 </div>
               </div>
               <div className="mt-3 text-xs bg-card p-2 rounded border border-border/40 text-muted-foreground break-all font-mono">
                 wal_8sf7sa_primary
               </div>
            </div>
          </div>

          {/* Webhook Logs */}
          <Card className="shadow-sm border-border">
            <CardHeader className="p-4 border-b border-border/40">
              <CardTitle className="text-sm flex items-center gap-2">
                 <Server className="w-4 h-4 text-indigo-500" /> Webhook Artifacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border/40 text-sm">
                  <div className="p-3 bg-muted/50 flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="text-[10px] bg-emerald-50 border-emerald-200 text-emerald-700 font-mono py-0">200 OK</Badge>
                           <span className="font-semibold text-foreground text-xs">payment.succeeded</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">14:32:05</span>
                     </div>
                     <span className="text-xs text-muted-foreground font-mono truncate">https://api.jdcorp.com/monivexa/webhooks</span>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="text-[10px] bg-emerald-50 border-emerald-200 text-emerald-700 font-mono py-0">200 OK</Badge>
                           <span className="font-semibold text-foreground text-xs">payment.processing</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">14:32:01</span>
                     </div>
                     <span className="text-xs text-muted-foreground font-mono truncate">https://api.jdcorp.com/monivexa/webhooks</span>
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Settlement Tracking */}
          <Card className="shadow-sm border-border">
            <CardHeader className="p-4 border-b border-border/40">
              <CardTitle className="text-sm flex items-center gap-2">
                 <CalendarDays className="w-4 h-4 text-amber-500" /> Settlement Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative pl-4 space-y-6 border-l border-border before:absolute before:inset-y-0 before:left-[-0.5px] before:w-[1px] before:bg-slate-200">
                <div className="relative">
                  <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full ring-4 ring-white bg-emerald-500" />
                  <div className="text-sm font-medium text-foreground">Funds Captured</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Oct 24, 14:32 UTC</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full ring-4 ring-white bg-emerald-500" />
                  <div className="text-sm font-medium text-foreground">Ledger Updated</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Oct 24, 14:32 UTC • Available to Wallet</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full ring-4 ring-white bg-slate-300" />
                  <div className="text-sm font-medium text-foreground">Provider Payout (Expected)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Oct 26, ~00:00 UTC • T+2 Settlement</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </ScrollArea>
    </div>
  );
}
