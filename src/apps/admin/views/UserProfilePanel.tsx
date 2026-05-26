import React from 'react';
import { ShieldBan, Verified, RotateCcw, AlertTriangle, X, Wallet, CreditCard, Laptop, Smartphone, MapPin, Activity, CalendarDays, MoreVertical, Ban, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserProfilePanelProps {
  userId: string | null;
  onClose: () => void;
}

export function UserProfilePanel({ userId, onClose }: UserProfilePanelProps) {
  if (!userId) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-muted/30 dark:bg-primary border-l border-border dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-card dark:bg-slate-950 border-b border-border/40 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 bg-indigo-100 text-indigo-700">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-bold text-foreground dark:text-primary-foreground">John Doe</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-muted-foreground">{userId}</span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Active</Badge>
              <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">CUSTOMER</Badge>
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
                <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-amber-600"><RotateCcw className="w-4 h-4 mr-2"/> Reset PIN</DropdownMenuItem>
                <DropdownMenuItem className="text-amber-600"><Ban className="w-4 h-4 mr-2"/> Suspend User</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600"><ShieldBan className="w-4 h-4 mr-2"/> Freeze Account</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-emerald-600"><Verified className="w-4 h-4 mr-2"/> Verify KYC</DropdownMenuItem>
                <DropdownMenuItem><Edit3 className="w-4 h-4 mr-2"/> Adjust Limits</DropdownMenuItem>
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
          
          {/* Top Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm border-border">
              <CardContent className="p-4">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Risk Score</div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-emerald-600">12</span>
                  <span className="text-xs text-muted-foreground/70 mb-1">/ 100 (Low)</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border bg-muted/50">
              <CardContent className="p-4">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">KYC Status</div>
                <div className="flex items-center gap-1.5 mt-1 text-emerald-600">
                  <Verified className="w-5 h-5" />
                  <span className="font-semibold text-sm">Tier 3 Verified</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallets & Balances */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Wallet className="w-4 h-4 text-indigo-500"/> Wallet Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Primary Balance (USD)</div>
                <div className="text-xl font-bold text-foreground">$2,450.00</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Savings Vault</div>
                <div className="text-xl font-bold text-foreground">$12,000.00</div>
              </div>
            </div>
            <div className="mt-3 bg-card border border-border rounded-xl p-3 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded flex items-center justify-center text-indigo-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Visa Debit •••• 4242</div>
                  <div className="text-xs text-muted-foreground">Exp 12/26</div>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">Primary</Badge>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500"/> Recent Transactions</h3>
            <Card className="shadow-sm border-border">
              <div className="divide-y divide-border/40">
                {[
                  { id: 'tx_123', desc: 'Transfer to Jane Smith', date: 'Today, 2:45 PM', amount: '-$50.00' },
                  { id: 'tx_124', desc: 'Salary Deposit', date: 'Yesterday, 9:00 AM', amount: '+$3,200.00' },
                  { id: 'tx_125', desc: 'Netflix Subscription', date: 'Oct 24, 11:30 PM', amount: '-$15.99' },
                ].map((tx) => (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-foreground">{tx.desc}</div>
                      <div className="text-xs text-muted-foreground">{tx.date}</div>
                    </div>
                    <div className={cn("text-sm font-semibold", tx.amount.startsWith('+') ? "text-emerald-600" : "text-foreground")}>
                      {tx.amount}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-muted/30 border-t border-border/40">
                <Button variant="ghost" className="w-full text-xs text-indigo-600 h-8">View full history</Button>
              </div>
            </Card>
          </div>

          {/* Linked Devices & Login History */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Smartphone className="w-4 h-4 text-muted-foreground"/> Linked Devices</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-sm">
                  <Smartphone className="w-5 h-5 text-muted-foreground/70" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">iPhone 14 Pro</div>
                    <div className="text-xs text-muted-foreground">Monivexa iOS App v2.4</div>
                  </div>
                  <Badge variant="secondary" className="bg-muted text-[10px]">Current</Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-sm">
                  <Laptop className="w-5 h-5 text-muted-foreground/70" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">MacBook Air (M2)</div>
                    <div className="text-xs text-muted-foreground">Chrome on macOS</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-muted-foreground"/> Login History</h3>
              <Card className="shadow-sm border-border">
                <div className="divide-y divide-border/40">
                  {[
                    { loc: 'Lagos, NG', ip: '197.210.8.44', date: 'Today, 2:40 PM', success: true },
                    { loc: 'Lagos, NG', ip: '197.210.8.44', date: 'Yesterday, 8:50 AM', success: true },
                    { loc: 'London, UK', ip: '82.13.4.99', date: 'Oct 20, 3:15 AM', success: false },
                  ].map((log, i) => (
                    <div key={i} className="p-3 flex items-center justify-between">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 mt-0.5" />
                        <div>
                          <div className="text-xs font-medium text-foreground">{log.loc} <span className="text-muted-foreground/70 font-normal">({log.ip})</span></div>
                          <div className="text-[10px] text-muted-foreground">{log.date}</div>
                        </div>
                      </div>
                      {!log.success && <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50">Failed</Badge>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          
        </div>
      </ScrollArea>
    </div>
  );
}
