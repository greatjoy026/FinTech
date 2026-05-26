import React from 'react';
import { RotateCcw, X, Activity, ArrowUpRight, CheckCircle2, Clock, XCircle, FileText, Server, CalendarDays, MoreVertical, Building2, Send, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PayoutDetailPanelProps {
  payoutId: string | null;
  onClose: () => void;
}

export function PayoutDetailPanel({ payoutId, onClose }: PayoutDetailPanelProps) {
  if (!payoutId) return null;

  const isPendingApproval = payoutId === 'po_32ns81'; // Mock ID based on my mock data
  const isFailed = payoutId === 'po_12mx90';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[650px] bg-muted/30 dark:bg-primary border-l border-border dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-card dark:bg-slate-950 border-b border-border/40 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              Payout Details
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-medium text-muted-foreground">{payoutId}</span>
              {isFailed ? (
                 <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50 h-5 text-[10px]"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>
              ) : isPendingApproval ? (
                 <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 h-5 text-[10px]"><Clock className="w-3 h-3 mr-1"/> Pending Approval</Badge>
              ) : (
                 <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 h-5 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPendingApproval && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9 mr-2 text-xs shadow-sm">
              <ShieldCheck className="w-4 h-4 mr-1.5" /> Approve Payout
            </Button>
          )}
          {isFailed && (
            <Button size="sm" variant="outline" className="border-border hover:bg-muted/30 h-9 mr-2 text-xs shadow-sm">
              <RotateCcw className="w-4 h-4 mr-1.5" /> Retry Payout
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="h-9 w-9 bg-card" />}>
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Payout Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Download className="w-4 h-4 mr-2"/> Download Receipt</DropdownMenuItem>
                <DropdownMenuItem><FileText className="w-4 h-4 mr-2"/> View Settlement Report</DropdownMenuItem>
                {isFailed && <DropdownMenuItem><RotateCcw className="w-4 h-4 mr-2"/> Force Retry</DropdownMenuItem>}
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
                  <div className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Total Disbursed</div>
                  <div className="flex items-baseline gap-2">
                     <span className="text-3xl font-bold text-foreground">$45,000.00</span>
                     <span className="text-sm font-medium text-muted-foreground">USD</span>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Initiated</div>
                  <div className="text-sm font-medium text-foreground">Today, 10:15 UTC</div>
                  <div className="text-xs text-muted-foreground">Batch-091</div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                   <div className="text-xs text-muted-foreground mb-1">Route / Method</div>
                   <div className="text-sm font-medium text-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-indigo-500"/> Wire Transfer</div>
                   <div className="text-xs text-muted-foreground/70 mt-0.5">Clearing: CHAPS</div>
                </div>
                <div>
                   <div className="text-xs text-muted-foreground mb-1">Details / Purpose</div>
                   <div className="text-sm font-medium text-foreground">NGO Relief Funds</div>
                   <div className="text-xs text-muted-foreground/70 mt-0.5">Reference: RELIEF-2023-Q4</div>
                </div>
             </div>
          </div>

          {/* Source & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-muted/30 border border-border rounded-xl p-4 shadow-sm">
               <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Funding Source</div>
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 bg-slate-200 text-foreground/90 rounded flex items-center justify-center">
                   <Server className="w-4 h-4" />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-foreground">Master Settlement Pool</div>
                   <div className="text-xs text-muted-foreground">internal_pool_usd</div>
                 </div>
               </div>
            </div>
            <div className="bg-muted/30 border border-border rounded-xl p-4 shadow-sm">
               <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Destination</div>
               <div className="flex items-center gap-3">
                 <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center">
                   <Building2 className="w-4 h-4" />
                 </div>
                 <div>
                   <div className="text-sm font-medium text-foreground">Global Relief Org Ltd</div>
                   <div className="text-xs text-muted-foreground">Barclays Bank PLC</div>
                 </div>
               </div>
               <div className="mt-3 text-xs bg-card p-2 rounded border border-border/40 text-muted-foreground break-all font-mono">
                 IBAN: GB82BARC20............
               </div>
            </div>
          </div>

          {/* Workflow & Approvals */}
          <Card className="shadow-sm border-border">
             <CardHeader className="p-4 border-b border-border/40">
                <CardTitle className="text-sm flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500"/> Approval Workflow
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-border/40 bg-muted/30">
                   <div className="p-4 flex items-center justify-between">
                      <div>
                         <div className="text-sm font-medium text-foreground">Level 1: System Risk Check</div>
                         <div className="text-xs text-muted-foreground mt-0.5">Automated velocity and AML screening</div>
                      </div>
                      <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 font-mono text-[10px]">Passed</Badge>
                   </div>
                   <div className="p-4 flex items-center justify-between bg-card text-muted-foreground/70">
                      <div>
                         <div className="text-sm font-medium">Level 2: Maker</div>
                         <div className="text-xs mt-0.5">Initiated by admin@monivexa.com</div>
                      </div>
                      <span className="text-xs font-mono">10:15 UTC</span>
                   </div>
                   <div className="p-4 flex items-center justify-between">
                      <div>
                         <div className="text-sm font-medium text-foreground">Level 3: Checker (Finance Officer)</div>
                         <div className="text-xs text-muted-foreground mt-0.5">Manual review required for {'>'}$10k outputs</div>
                      </div>
                      {isPendingApproval ? (
                         <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 font-mono text-[10px]">Awaiting</Badge>
                      ) : (
                         <div className="text-xs font-medium text-foreground">Approved by sarah@...</div>
                      )}
                   </div>
                </div>
             </CardContent>
          </Card>

          {/* Tracking / Logs */}
          <Card className="shadow-sm border-border">
            <CardHeader className="p-4 border-b border-border/40">
              <CardTitle className="text-sm flex items-center gap-2">
                 <Activity className="w-4 h-4 text-muted-foreground" /> Lifecycle Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="relative pl-4 space-y-6 border-l border-border before:absolute before:inset-y-0 before:left-[-0.5px] before:w-[1px] before:bg-slate-200">
                <div className="relative">
                  <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full ring-4 ring-white bg-slate-300" />
                  <div className="text-sm font-medium text-foreground">Payout Initiated</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Today, 10:15 UTC</div>
                </div>
                {!isPendingApproval && (
                   <div className="relative">
                     <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full ring-4 ring-white bg-indigo-400" />
                     <div className="text-sm font-medium text-foreground">Approved</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Today, 10:20 UTC</div>
                   </div>
                )}
                {!isPendingApproval && !isFailed && (
                   <div className="relative">
                     <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full ring-4 ring-white bg-emerald-500" />
                     <div className="text-sm font-medium text-foreground">Sent to Clearing Partner</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Today, 10:21 UTC</div>
                   </div>
                )}
                {isFailed && (
                   <div className="relative">
                     <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full ring-4 ring-white bg-red-500" />
                     <div className="text-sm font-medium text-red-600">Failed: Network Timeout</div>
                     <div className="text-xs text-muted-foreground mt-0.5">Partner API did not respond. Funds not deducted.</div>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
          
        </div>
      </ScrollArea>
    </div>
  );
}
