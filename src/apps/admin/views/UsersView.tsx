import React, { useState, useMemo, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal, Search, ShieldBan, Verified, RotateCcw, AlertTriangle, 
  Filter, Download, Bookmark, Plus, Users, UserCheck, ShieldAlert, 
  Ban, CheckCircle2, X, RefreshCw, ChevronLeft, ChevronRight,
  Sparkles, SlidersHorizontal
} from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuGroup, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { AdminUser, UserRole, UserStatus, RiskLevel } from '../types/user';
import { INITIAL_ADMIN_USERS } from '../data/initialUsers';
import { UserProfilePanel } from './UserProfilePanel';

const USERS_STORAGE_KEY = 'monivexa_admin_users_db';

export default function UsersView() {
  // Initialize state with local storage or seed dataset
  const [users, setUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_ADMIN_USERS;
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Dialog & Slide-over states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('CUSTOMER');
  const [newBalance, setNewBalance] = useState('100.00');
  const [newLocation, setNewLocation] = useState('Freetown, Sierra Leone');
  const [newRisk, setNewRisk] = useState<RiskLevel>('low');

  // Persist users on changes
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  // Derived filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search term
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesQuery = 
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phoneNumber.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Role filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;

      // Risk filter
      if (riskFilter !== 'ALL' && u.risk !== riskFilter) return false;

      return true;
    });
  }, [users, search, roleFilter, statusFilter, riskFilter]);

  // Key KPI metrics
  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const pendingReviewCount = users.filter(u => u.status === 'review' || !u.kycVerified).length;
  const frozenCount = users.filter(u => u.status === 'frozen' || u.status === 'suspended').length;
  const highRiskCount = users.filter(u => u.risk === 'high').length;

  // Currently selected user object for UserProfilePanel
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find(u => u.id === selectedUserId) || null;
  }, [users, selectedUserId]);

  // Update user in state
  const handleUpdateUser = (updated: AdminUser) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  // Toggle single user status
  const handleToggleFreeze = (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus: UserStatus = u.status === 'frozen' ? 'active' : 'frozen';
        if (nextStatus === 'frozen') {
          toast.error(`Account ${u.name} (${u.id}) has been frozen`);
        } else {
          toast.success(`Account ${u.name} has been unfrozen and activated`);
        }
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleVerifyKyc = (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        toast.success(`KYC documents approved for ${u.name} (Tier 3)`);
        return { 
          ...u, 
          kycVerified: true, 
          kycTier: 'Tier 3 (Enhanced)',
          status: u.status === 'review' ? 'active' : u.status 
        };
      }
      return u;
    }));
  };

  const handleResetPin = (user: AdminUser, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const tempPin = Math.floor(100000 + Math.random() * 900000);
    toast.success(`Temporary security PIN issued for ${user.name}: ${tempPin}`, {
      description: `Dispatched to ${user.phoneNumber} via encrypted SMS.`
    });
  };

  // Create User Handler
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      toast.error('Please complete all required fields');
      return;
    }

    const startingBalance = parseFloat(newBalance) || 0;
    const newId = `usr_${Math.random().toString(36).substring(2, 8)}`;
    const createdUser: AdminUser = {
      id: newId,
      name: newName.trim(),
      email: newEmail.trim(),
      phoneNumber: newPhone.trim(),
      role: newRole,
      status: 'active',
      balance: startingBalance,
      currency: 'USD',
      risk: newRisk,
      riskScore: newRisk === 'high' ? 82 : newRisk === 'medium' ? 44 : 10,
      kycTier: 'Tier 2 (Standard)',
      kycVerified: true,
      dailyLimit: newRole === 'MERCHANT' ? 50000 : 2500,
      monthlyLimit: newRole === 'MERCHANT' ? 500000 : 25000,
      lastActive: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
      location: newLocation.trim() || 'Freetown, Sierra Leone',
      wallets: [
        { id: `w_${Date.now()}`, name: 'Primary Wallet', balance: startingBalance, currency: 'USD', isPrimary: true }
      ],
      devices: [
        { id: `dev_${Date.now()}`, name: 'Admin Enrolled Web Console', client: 'Web Session', lastActive: 'Just now', isCurrent: true }
      ],
      loginLogs: [
        { id: `log_${Date.now()}`, location: newLocation, ip: '127.0.0.1', timestamp: 'Just now', success: true }
      ],
      transactions: [
        { id: `tx_init_${Date.now()}`, description: 'Account Activation & Initial Funding', date: 'Just now', amount: startingBalance, type: 'credit', status: 'completed' }
      ]
    };

    setUsers(prev => [createdUser, ...prev]);
    setIsCreateModalOpen(false);
    setSelectedUserId(newId);
    toast.success(`Participant ${createdUser.name} registered successfully!`);

    // Reset inputs
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewBalance('100.00');
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error('No users found matching current filters to export');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Balance', 'Risk', 'Risk Score', 'KYC Tier', 'Location', 'Created At'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.phoneNumber,
      u.role,
      u.status,
      u.balance.toFixed(2),
      u.risk,
      u.riskScore,
      `"${u.kycTier}"`,
      `"${u.location}"`,
      u.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `monivexa_users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredUsers.length} user records to CSV`);
  };

  // Saved views selector
  const handleSelectSavedView = (viewType: string) => {
    if (viewType === 'ALL') {
      setRoleFilter('ALL');
      setStatusFilter('ALL');
      setRiskFilter('ALL');
      setSearch('');
      toast.info('Viewing all ecosystem participants');
    } else if (viewType === 'HIGH_RISK') {
      setRiskFilter('high');
      setStatusFilter('ALL');
      setRoleFilter('ALL');
      toast.info('Filtered to high-risk participants');
    } else if (viewType === 'KYC_PENDING') {
      setStatusFilter('review');
      setRiskFilter('ALL');
      setRoleFilter('ALL');
      toast.info('Filtered to participants in compliance review');
    } else if (viewType === 'FROZEN') {
      setStatusFilter('frozen');
      setRiskFilter('ALL');
      setRoleFilter('ALL');
      toast.info('Filtered to frozen accounts');
    } else if (viewType === 'MERCHANTS_NGOS') {
      setRoleFilter('MERCHANT');
      setStatusFilter('ALL');
      setRiskFilter('ALL');
      toast.info('Filtered to merchant participants');
    }
  };

  // Bulk actions
  const handleSelectAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRowIds(new Set(filteredUsers.map(u => u.id)));
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleToggleRowSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkFreeze = () => {
    if (selectedRowIds.size === 0) return;
    setUsers(prev => prev.map(u => {
      if (selectedRowIds.has(u.id)) {
        return { ...u, status: 'frozen' };
      }
      return u;
    }));
    toast.error(`Froze ${selectedRowIds.size} selected accounts`);
    setSelectedRowIds(new Set());
  };

  const handleBulkVerifyKYC = () => {
    if (selectedRowIds.size === 0) return;
    setUsers(prev => prev.map(u => {
      if (selectedRowIds.has(u.id)) {
        return { ...u, kycVerified: true, kycTier: 'Tier 3 (Enhanced)', status: u.status === 'review' ? 'active' : u.status };
      }
      return u;
    }));
    toast.success(`Approved KYC verification for ${selectedRowIds.size} accounts`);
    setSelectedRowIds(new Set());
  };

  // Table column definition
  const columns = [
    {
      id: 'select',
      header: () => (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <input 
            type="checkbox" 
            aria-label="Select all rows"
            checked={filteredUsers.length > 0 && selectedRowIds.size === filteredUsers.length}
            onChange={handleSelectAllRows}
            className="rounded border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer h-3.5 w-3.5"
          />
        </div>
      ),
      cell: ({ row }: any) => {
        const u = row.original;
        const isChecked = selectedRowIds.has(u.id);
        return (
          <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <input 
              type="checkbox" 
              aria-label={`Select ${u.name}`}
              checked={isChecked}
              onClick={(e) => handleToggleRowSelection(u.id, e)}
              onChange={() => {}}
              className="rounded border-border text-emerald-600 focus:ring-emerald-500 cursor-pointer h-3.5 w-3.5"
            />
          </div>
        );
      }
    },
    {
      accessorKey: 'name',
      header: 'Participant & ID',
      cell: ({ row }: any) => {
        const u = row.original;
        const initials = u.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-semibold text-foreground hover:text-emerald-600 transition-colors truncate">
                  {u.name}
                </span>
                {u.kycVerified && (
                  <span title="KYC Verified" className="inline-flex items-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                <span>{u.id}</span>
                <span>•</span>
                <span className="truncate">{u.phoneNumber}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }: any) => (
        <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0.5">
          {getValue()}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const s = getValue();
        return (
          <Badge 
            variant="outline" 
            className={`capitalize border-none text-[10px] font-semibold px-2 py-0.5 ${
              s === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
              s === 'frozen' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
              s === 'suspended' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
              'bg-sky-500/10 text-sky-600 dark:text-sky-400'
            }`}
          >
            {s}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: ({ getValue, row }: any) => {
        const val = getValue();
        const currency = row.original.currency || 'USD';
        return (
          <span className="font-mono font-bold text-xs sm:text-sm text-foreground">
            ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        );
      }
    },
    {
      accessorKey: 'risk',
      header: 'Risk Level',
      cell: ({ row }: any) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              u.risk === 'high' ? 'bg-rose-500' : 
              u.risk === 'medium' ? 'bg-amber-500' : 
              'bg-emerald-500'
            }`} />
            <span className="text-xs text-muted-foreground capitalize font-medium">{u.risk}</span>
            <span className="text-[10px] text-muted-foreground/60 font-mono">({u.riskScore})</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'lastActive',
      header: 'Last Active',
      cell: ({ getValue }: any) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">{getValue()}</span>
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: any) => {
        const u = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Participant Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSelectedUserId(u.id)} className="cursor-pointer">
                    View Full Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleResetPin(u, e)} className="cursor-pointer text-sky-600 dark:text-sky-400">
                    <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset PIN
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {!u.kycVerified && (
                  <DropdownMenuItem onClick={(e) => handleVerifyKyc(u.id, e)} className="cursor-pointer text-emerald-600 dark:text-emerald-400">
                    <Verified className="w-3.5 h-3.5 mr-2" /> Force KYC Verify
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={(e) => handleToggleFreeze(u.id, e)} 
                  className={`cursor-pointer ${u.status === 'frozen' ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  <ShieldBan className="w-3.5 h-3.5 mr-2" />
                  {u.status === 'frozen' ? 'Unfreeze Account' : 'Freeze Account'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    initialState: {
      pagination: { pageSize: 10 }
    }
  });

  const activeFiltersCount = (roleFilter !== 'ALL' ? 1 : 0) + (statusFilter !== 'ALL' ? 1 : 0) + (riskFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            User & Participant Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Centralized registry of Monivexa ecosystem consumers, merchants, NGOs, and educational accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Saved Views Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Bookmark className="w-3.5 h-3.5" /> Saved Views
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-52 text-xs">
              <DropdownMenuGroup>
                <DropdownMenuLabel>View Presets</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleSelectSavedView('ALL')} className="cursor-pointer">
                  All Ecosystem Users ({totalCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelectSavedView('HIGH_RISK')} className="cursor-pointer text-rose-500">
                  High Risk Accounts ({highRiskCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelectSavedView('KYC_PENDING')} className="cursor-pointer text-amber-500">
                  Pending KYC Review ({pendingReviewCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelectSavedView('FROZEN')} className="cursor-pointer text-rose-600">
                  Frozen / Suspended ({frozenCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSelectSavedView('MERCHANTS_NGOS')} className="cursor-pointer text-sky-500">
                  Merchants & Corporates
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export CSV Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV} 
            className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>

          {/* Add New User */}
          <Button 
            size="sm" 
            onClick={() => setIsCreateModalOpen(true)} 
            className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Participant
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="shadow-xs border-border bg-card">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Registry</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground font-mono">{totalCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Enrolled ecosystem identities</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border bg-card">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Active Status</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{activeCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Transacting normally</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border bg-card">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Pending KYC</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{pendingReviewCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Requires document check</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-border bg-card">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Frozen / Locked</span>
              <ShieldBan className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{frozenCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Compliance rail blocks</p>
          </CardContent>
        </Card>

        <Card 
          onClick={() => handleSelectSavedView('HIGH_RISK')} 
          className="shadow-xs border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 transition-colors cursor-pointer"
        >
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">High Risk</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{highRiskCount}</div>
            <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1">Click to filter review queue →</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="shadow-xs border-border bg-card">
        <CardContent className="p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
              <Input 
                placeholder="Search participants by name, email, phone, ID, or country..." 
                className="pl-9 h-9 text-xs bg-muted/30 border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')} 
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Role Select Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
              {(['ALL', 'CUSTOMER', 'MERCHANT', 'NGO', 'SCHOOL'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-[11px] ${
                    roleFilter === role
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {role === 'ALL' ? 'All Roles' : role}
                </button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`h-7.5 px-2.5 text-xs gap-1.5 ${
                  activeFiltersCount > 0 ? 'border-emerald-500 text-emerald-600 bg-emerald-500/5' : 'text-muted-foreground'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-emerald-600 text-white ml-0.5">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Collapsible Advanced Filters Drawer */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-200">
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Account Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-8 text-xs bg-muted/40 border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="frozen">Frozen Only</option>
                  <option value="suspended">Suspended Only</option>
                  <option value="review">Compliance Review</option>
                </select>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Risk Rating</Label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full h-8 text-xs bg-muted/40 border border-border rounded-md px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="low">Low Risk (Score &lt; 30)</option>
                  <option value="medium">Medium Risk (Score 30-70)</option>
                  <option value="high">High Risk (Score &gt; 70)</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setRoleFilter('ALL');
                    setStatusFilter('ALL');
                    setRiskFilter('ALL');
                    setSearch('');
                  }}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Toolbar if rows selected */}
      {selectedRowIds.size > 0 && (
        <div className="p-3 bg-card border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{selectedRowIds.size} participants selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleBulkVerifyKYC} className="h-7 text-xs gap-1 border-emerald-500/30 text-emerald-600">
              <Verified className="w-3 h-3" /> Approve KYC
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkFreeze} className="h-7 text-xs gap-1 border-rose-500/30 text-rose-600">
              <ShieldBan className="w-3 h-3" /> Freeze Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedRowIds(new Set())} className="h-7 text-xs text-muted-foreground">
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Main Users Table */}
      <Card className="shadow-xs border-border bg-card overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-semibold text-muted-foreground bg-muted/40 border-b border-border uppercase tracking-wider">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className={`px-4 py-3 whitespace-nowrap ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-foreground">No participants found</p>
                      <p className="text-xs">No records matched your search query or selected filters.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSearch('');
                          setRoleFilter('ALL');
                          setStatusFilter('ALL');
                          setRiskFilter('ALL');
                        }}
                        className="h-7 text-xs mt-2"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedUserId(row.original.id)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{filteredUsers.length}</span> of <span className="font-semibold text-foreground">{users.length}</span> participants
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <span className="text-xs px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add New User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Register New Participant</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Enroll an ecosystem wallet, merchant, or NGO identity</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <Label className="text-xs">Full Name or Corporate Entity Name *</Label>
                <Input 
                  placeholder="e.g. Sierra Retail Mart or Jane Kamara"
                  className="h-8.5 text-xs mt-1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Email Address *</Label>
                  <Input 
                    type="email"
                    placeholder="user@example.com"
                    className="h-8.5 text-xs mt-1"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Phone Number *</Label>
                  <Input 
                    placeholder="+232 77 123456"
                    className="h-8.5 text-xs mt-1"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Ecosystem Role</Label>
                  <select 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full h-8.5 text-xs bg-muted/40 border border-border rounded-md px-2.5 text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="CUSTOMER">Customer (Consumer)</option>
                    <option value="MERCHANT">Merchant (B2B & Retail)</option>
                    <option value="NGO">NGO (Aid & Relief)</option>
                    <option value="SCHOOL">Educational Institution</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Initial Funding Balance (USD)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    className="h-8.5 text-xs mt-1"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Jurisdiction / Location</Label>
                  <Input 
                    placeholder="Freetown, Sierra Leone"
                    className="h-8.5 text-xs mt-1"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Risk Profile</Label>
                  <select 
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value as RiskLevel)}
                    className="w-full h-8.5 text-xs bg-muted/40 border border-border rounded-md px-2.5 text-foreground mt-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk (Enhanced Monitoring)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Create Participant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Slide-over */}
      {selectedUser && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-in fade-in duration-200" 
            onClick={() => setSelectedUserId(null)} 
          />
          <UserProfilePanel 
            user={selectedUser} 
            onClose={() => setSelectedUserId(null)} 
            onUpdateUser={handleUpdateUser}
          />
        </>
      )}
    </div>
  );
}
