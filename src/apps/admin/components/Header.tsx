import React from 'react';
import { Menu, Search, Bell, Plus, Command, Building2, Moon, Sun, ShieldAlert, ChevronDown } from 'lucide-react';
import { useAdminStore } from '../store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { toggleSidebar, toggleCommandPalette, setView } = useAdminStore();
  const [theme, setTheme] = React.useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    // Implement standard dark mode (tailwind 'dark' class)
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 flex-none border-b border-border dark:border-slate-800 bg-card/50 dark:bg-primary/50 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground dark:hover:text-slate-100 rounded-md hover:bg-muted dark:hover:bg-primary/90"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search / Command Palette Trigger */}
        <button 
          onClick={toggleCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 dark:bg-slate-800/50 hover:bg-muted dark:hover:bg-primary/90 border border-border dark:border-slate-700 rounded-lg text-sm text-muted-foreground dark:text-muted-foreground/70 transition-colors w-64"
        >
          <Search className="w-4 h-4 opacity-50" />
          <span className="flex-1 text-left">Search Monivexa...</span>
          <kbd className="hidden lg:inline-flex items-center gap-1 font-sans text-xs bg-card dark:bg-primary px-1.5 rounded border border-border dark:border-slate-700 shadow-sm text-muted-foreground/70 dark:text-muted-foreground">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>

        {/* Organization Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger className="hidden md:flex items-center gap-2 px-2 py-1.5 border border-transparent hover:border-border dark:hover:border-slate-700 rounded-md transition-all focus:outline-none">
            <div className="w-6 h-6 rounded bg-slate-800 text-primary-foreground flex items-center justify-center">
              <Building2 className="w-3 h-3" />
            </div>
            <span className="text-sm font-medium text-foreground/90 dark:text-slate-300">Monivexa Global</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground/70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center justify-between">
                Monivexa Global <Badge variant="secondary" className="text-[10px]">Active</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem>Monivexa Regional HQ</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Plus className="w-3 h-3 mr-2" /> Add Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        {/* Quick Actions */}
        <div className="hidden lg:flex items-center mr-2">
          <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-primary-foreground h-8 gap-1.5 shadow-sm">
            <Plus className="w-3.5 h-3.5" />
            <span className="text-xs">Quick Action</span>
          </Button>
        </div>

        {/* Dark/Light Mode Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-muted-foreground/70 dark:hover:text-slate-100">
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>

        {/* Fraud Alerts */}
        <Button variant="ghost" size="icon" onClick={() => setView('fraud')} className="h-8 w-8 text-muted-foreground hover:text-foreground dark:text-muted-foreground/70 dark:hover:text-slate-100 relative group">
          <ShieldAlert className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 border border-white dark:border-slate-900" />
        </Button>

        {/* Notifications */}
        <Button onClick={() => useAdminStore.getState().toggleNotifications()} variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground dark:text-muted-foreground/70 dark:hover:text-slate-100 overflow-visible">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </Button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
              <Avatar className="h-8 w-8 border border-border dark:border-slate-700 shadow-sm">
                <AvatarFallback className="bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-300 text-xs font-medium">SA</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground/90 dark:text-slate-200 leading-none">System Admin</p>
                <p className="text-[10px] text-muted-foreground dark:text-muted-foreground/70 mt-1">Superuser</p>
              </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setView('settings')}>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('settings')}>API Keys</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView('audit')}>Security Log</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 cursor-pointer" onClick={() => {
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('auth');
              window.location.href = '/login';
            }}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
