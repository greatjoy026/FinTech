import React, { useState } from 'react';
import { 
  ShieldBan, Verified, RotateCcw, AlertTriangle, X, Wallet, CreditCard, 
  Smartphone, MapPin, Activity, CalendarDays, MoreVertical, Ban, Edit3, 
  CheckCircle2, DollarSign, ArrowUpRight, ArrowDownLeft, ShieldAlert,
  SmartphoneNfc, Trash2, KeyRound, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AdminUser, UserStatus } from '../types/user';

interface UserProfilePanelProps {
  user: AdminUser | null;
  onClose: () => void;
  onUpdateUser: (updated: AdminUser) => void;
}

export function UserProfilePanel({ user, onClose, onUpdateUser }: UserProfilePanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'security'>('overview');
  const [isEditingLimits, setIsEditingLimits] = useState(false);
  const [dailyLimitInput, setDailyLimitInput] = useState(user?.dailyLimit ? String(user.dailyLimit) : '2500');
  const [monthlyLimitInput, setMonthlyLimitInput] = useState(user?.monthlyLimit ? String(user.monthlyLimit) : '25000');

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleToggleFreeze = () => {
    const newStatus: UserStatus = user.status === 'frozen' ? 'active' : 'frozen';
    const updated: AdminUser = { ...user, status: newStatus };
    onUpdateUser(updated);
    if (newStatus === 'frozen') {
      toast.error(`Account ${user.id} has been FROZEN. Outgoing rails blocked.`);
    } else {
      toast.success(`Account ${user.id} is now ACTIVE. Restrictions lifted.`);
    }
  };

  const handleToggleSuspend = () => {
    const newStatus: UserStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const updated: AdminUser = { ...user, status: newStatus };
    onUpdateUser(updated);
    if (newStatus === 'suspended') {
      toast.error(`User ${user.name} suspended. Portal access revoked.`);
    } else {
      toast.success(`User ${user.name} restored to active status.`);
    }
  };

  const handleVerifyKyc = () => {
    const updated: AdminUser = {
      ...user,
      kycVerified: true,
      kycTier: 'Tier 3 (Enhanced)',
      status: user.status === 'review' ? 'active' : user.status
    };
    onUpdateUser(updated);
    toast.success(`KYC verified for ${user.name}. Upgraded to Tier 3 (Enhanced).`);
  };

  const handleResetPin = () => {
    const tempPin = Math.floor(100000 + Math.random() * 900000);
    toast.success(`Temporary security PIN issued: ${tempPin}`, {
      description: `Dispatched to ${user.phoneNumber} via encrypted SMS gateway.`
    });
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    const daily = parseFloat(dailyLimitInput);
    const monthly = parseFloat(monthlyLimitInput);
    if (isNaN(daily) || isNaN(monthly) || daily <= 0 || monthly <= 0) {
      toast.error('Please enter valid positive limit amounts');
      return;
    }
    const updated: AdminUser = {
      ...user,
      dailyLimit: daily,
      monthlyLimit: monthly
    };
    onUpdateUser(updated);
    setIsEditingLimits(false);
    toast.success(`Limits updated for ${user.name}`);
  };

  const handleRevokeDevice = (deviceId: string) => {
    const updatedDevices = user.devices.filter(d => d.id !== deviceId);
    const updated: AdminUser = { ...user, devices: updatedDevices };
    onUpdateUser(updated);
    toast.success('Device token revoked and session terminated');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[580px] lg:w-[620px] bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-card border-b border-border flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-12 w-12 border border-border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-foreground truncate">{user.name}</h2>
              <Badge 
                variant="outline"
                className={`text-[10px] font-semibold uppercase px-1.5 py-0 border-none ${
                  user.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                  user.status === 'frozen' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                  user.status === 'suspended' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                  'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                }`}
              >
                {user.status}
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono text-[11px]">{user.id}</span>
              <span>•</span>
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Administrative Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResetPin} className="gap-2 text-sky-600 dark:text-sky-400 cursor-pointer">
                  <RotateCcw className="w-4 h-4" /> Reset Security PIN
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleVerifyKyc} className="gap-2 text-emerald-600 dark:text-emerald-400 cursor-pointer">
                  <Verified className="w-4 h-4" /> Verify KYC (Tier 3)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditingLimits(true)} className="gap-2 cursor-pointer">
                  <Edit3 className="w-4 h-4" /> Adjust Spending Limits
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleSuspend} className="gap-2 text-amber-600 dark:text-amber-400 cursor-pointer">
                  <Ban className="w-4 h-4" /> {user.status === 'suspended' ? 'Reactivate User' : 'Suspend Access'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleFreeze} className="gap-2 text-rose-600 dark:text-rose-400 cursor-pointer">
                  <ShieldBan className="w-4 h-4" /> {user.status === 'frozen' ? 'Unfreeze Account' : 'Freeze Account'}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Action Tabs Navigation */}
      <div className="flex items-center px-4 sm:px-6 border-b border-border bg-muted/40 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-emerald-500 text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview & Wallets
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`py-3 border-b-2 transition-all ${
            activeTab === 'transactions'
              ? 'border-emerald-500 text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Transactions ({user.transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-emerald-500 text-foreground font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Security & Logins
        </button>
      </div>

      {/* Main Content Body */}
      <ScrollArea className="flex-1 p-4 sm:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Alert Banner if Frozen or Suspended */}
            {user.status === 'frozen' && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Account is currently frozen by compliance. Outbound transfers are blocked.</span>
                </div>
                <Button size="sm" variant="outline" onClick={handleToggleFreeze} className="h-7 text-xs border-rose-500/30 text-rose-600 hover:bg-rose-500/10 shrink-0">
                  Unfreeze
                </Button>
              </div>
            )}

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="shadow-sm border-border bg-card">
                <CardContent className="p-4">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Risk Assessment
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${
                      user.risk === 'high' ? 'text-rose-500' :
                      user.risk === 'medium' ? 'text-amber-500' :
                      'text-emerald-500'
                    }`}>
                      {user.riskScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100 ({user.risk.toUpperCase()})</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        user.risk === 'high' ? 'bg-rose-500' :
                        user.risk === 'medium' ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(user.riskScore, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border bg-card">
                <CardContent className="p-4">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    KYC Status
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {user.kycVerified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <span className="font-semibold text-sm text-foreground truncate">
                      {user.kycTier}
                    </span>
                  </div>
                  {!user.kycVerified && (
                    <button 
                      onClick={handleVerifyKyc}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      Verify KYC now →
                    </button>
                  )}
                  {user.kycVerified && (
                    <span className="text-[11px] text-muted-foreground mt-2 block">
                      Documents cleared by automated gate
                    </span>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Wallets & Balances */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                  Ecosystem Wallets & Balances
                </h3>
                <span className="text-xs text-muted-foreground font-medium">
                  Total: ${(user.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.wallets.map((wallet) => (
                  <div key={wallet.id} className="p-3.5 bg-card border border-border rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">{wallet.name}</span>
                        {wallet.isPrimary && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{wallet.id}</p>
                    </div>
                    <div className="mt-3">
                      <span className="text-lg font-bold text-foreground font-mono">
                        ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">{wallet.currency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Limits & Velocity */}
            <div className="p-4 bg-card border border-border rounded-xl shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    Transaction Velocity Limits
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Enforced across settlement rails</p>
                </div>
                {!isEditingLimits ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setDailyLimitInput(String(user.dailyLimit));
                      setMonthlyLimitInput(String(user.monthlyLimit));
                      setIsEditingLimits(true);
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingLimits(false)}
                    className="h-7 text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {isEditingLimits ? (
                <form onSubmit={handleSaveLimits} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Daily Limit ($)</Label>
                      <Input 
                        type="number"
                        className="h-8 text-xs mt-1"
                        value={dailyLimitInput}
                        onChange={(e) => setDailyLimitInput(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Monthly Limit ($)</Label>
                      <Input 
                        type="number"
                        className="h-8 text-xs mt-1"
                        value={monthlyLimitInput}
                        onChange={(e) => setMonthlyLimitInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button type="submit" size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                      Save Limits
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="text-xs text-muted-foreground">Daily Limit</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5 font-mono">
                      ${user.dailyLimit.toLocaleString()}
                    </div>
                    <div className="w-full bg-muted h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '28%' }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground/80 mt-1 block">28% utilized today</span>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Monthly Limit</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5 font-mono">
                      ${user.monthlyLimit.toLocaleString()}
                    </div>
                    <div className="w-full bg-muted h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '42%' }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground/80 mt-1 block">42% utilized this cycle</span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Metadata */}
            <div className="p-4 bg-muted/30 border border-border/80 rounded-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Contact Phone
                </span>
                <span className="font-mono text-foreground font-medium">{user.phoneNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Operating Jurisdiction
                </span>
                <span className="text-foreground font-medium">{user.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Registration Date
                </span>
                <span className="text-foreground font-medium">{user.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Last Active
                </span>
                <span className="text-foreground font-medium">{user.lastActive}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Participant Activity Log
              </h4>
              <span className="text-[11px] text-muted-foreground">
                {user.transactions.length} recorded items
              </span>
            </div>

            {user.transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                No recent transactions for this participant.
              </div>
            ) : (
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
                {user.transactions.map((tx) => (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'credit' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{tx.date} • {tx.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-semibold ${
                        tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-[9px] block w-fit ml-auto mt-0.5 px-1 py-0 capitalize">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-5">
            {/* Linked Devices */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <SmartphoneNfc className="w-3.5 h-3.5 text-emerald-500" />
                Linked Devices & Terminals
              </h4>
              <div className="space-y-2.5">
                {user.devices.map((device) => (
                  <div key={device.id} className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{device.name}</span>
                          {device.isCurrent && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-emerald-500/30 text-emerald-600">
                              Active
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{device.client} • {device.lastActive}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRevokeDevice(device.id)}
                      className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2"
                    >
                      Revoke
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Login History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
                Authentication Audit Trail
              </h4>
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card text-xs">
                {user.loginLogs.map((log) => (
                  <div key={log.id} className="p-3 flex items-center justify-between hover:bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{log.location} <span className="font-mono text-[10px] text-muted-foreground">({log.ip})</span></p>
                        <p className="text-[10px] text-muted-foreground">{log.timestamp}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] px-1.5 py-0 ${
                        log.success 
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/5' 
                          : 'border-rose-500/30 text-rose-600 bg-rose-500/5'
                      }`}
                    >
                      {log.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
