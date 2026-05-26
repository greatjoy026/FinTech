import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAdminStore } from '../store';
import { Search, User, Wallet, Activity, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CommandPalette() {
  const { isCommandPaletteOpen, toggleCommandPalette, setView } = useAdminStore();
  const [query, setQuery] = React.useState('');

  const executeCommand = (view: string) => {
    setView(view);
    toggleCommandPalette();
    setQuery('');
  };

  return (
    <Dialog open={isCommandPaletteOpen} onOpenChange={toggleCommandPalette}>
      <DialogContent className="p-0 max-w-2xl bg-card border-border overflow-hidden shadow-2xl rounded-xl gap-0">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <div className="flex items-center px-4 py-3 border-b border-border/40 relative">
          <Search className="w-5 h-5 text-muted-foreground/70 absolute left-4" />
          <Input 
            autoFocus
            placeholder="Go to module, search user, or find transaction..."
            className="border-none shadow-none focus-visible:ring-0 pl-10 text-base py-6 placeholder:text-muted-foreground/70"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="text-[10px] text-muted-foreground/70 font-mono bg-muted px-2 py-1 rounded">ESC</div>
        </div>
        
        <ScrollArea className="h-[300px] sm:h-[400px]">
          <div className="p-4 space-y-4">
            
            {/* Quick Navigation Commands */}
            {(query === '' || 'users wallets overview fraud compliance'.includes(query.toLowerCase())) && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-tight">Navigation</p>
                <div className="space-y-1">
                  <CommandItem icon={Activity} label="Go to Overview" action={() => executeCommand('overview')} />
                  <CommandItem icon={User} label="Go to Users" action={() => executeCommand('users')} />
                  <CommandItem icon={ShieldCheck} label="Go to Fraud Center" action={() => executeCommand('fraud')} />
                  <CommandItem icon={Wallet} label="Go to Wallets" action={() => executeCommand('wallets')} />
                </div>
              </div>
            )}

            {/* Simulated Search Results */}
            {query.length > 2 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-tight">Search Results: '{query}'</p>
                <div className="space-y-1">
                  <CommandItem 
                    icon={User} 
                    label="Search Users" 
                    sublabel={`Find users matching "${query}"`} 
                    action={() => executeCommand('users')} 
                  />
                  <CommandItem 
                    icon={CreditCard} 
                    label="Search Payments" 
                    sublabel={`Find transactions matching "${query}"`} 
                    action={() => executeCommand('payments')} 
                  />
                </div>
              </div>
            )}
            
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function CommandItem({ icon: Icon, label, sublabel, action }: { icon: any, label: string, sublabel?: string, action: () => void }) {
  return (
    <button 
      onClick={action}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 group transition-colors text-left focus:outline-none focus:bg-muted/30"
    >
      <div className="flex items-center gap-3">
        <div className="bg-muted p-2 rounded-md group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
    </button>
  );
}
