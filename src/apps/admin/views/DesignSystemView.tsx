import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Palette, Grid, CheckCircle2, XCircle, AlertTriangle, Info, Bell, 
  ArrowUpRight, ArrowDownRight, Clock, BoxIcon, RefreshCw, Activity,
  MoreHorizontal, ChevronDown, Check, Loader2, Sparkles, Server, Layers, Settings2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { FormBuilder } from './FormBuilder';

export default function DesignSystemView() {
  const [activeTab, setActiveTab] = useState('foundation');
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
             <Palette className="w-6 h-6 text-emerald-600" />
             Design System
           </h1>
           <p className="text-sm text-muted-foreground mt-1">Component library and standard styling patterns for Monivexa platform.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 mb-8">
          <TabsTrigger value="foundation" className="px-4 py-2 text-sm"><Grid className="w-4 h-4 mr-2"/> Grids & Foundations</TabsTrigger>
          <TabsTrigger value="cards" className="px-4 py-2 text-sm"><Activity className="w-4 h-4 mr-2"/> Data Cards</TabsTrigger>
          <TabsTrigger value="tables" className="px-4 py-2 text-sm"><BoxIcon className="w-4 h-4 mr-2"/> Tables & Lists</TabsTrigger>
          <TabsTrigger value="overlays" className="px-4 py-2 text-sm"><Layers className="w-4 h-4 mr-2"/> Overlays & Menus</TabsTrigger>
          <TabsTrigger value="states" className="px-4 py-2 text-sm"><RefreshCw className="w-4 h-4 mr-2"/> States & Feedback</TabsTrigger>
          <TabsTrigger value="formbuilder" className="px-4 py-2 text-sm"><Settings2 className="w-4 h-4 mr-2"/> Form Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="foundation" className="space-y-8 mt-0">
           {/* Responsive Grid System */}
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Responsive Grid System</h2>
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                       <div key={i} className="bg-muted border border-border rounded-lg p-4 text-center text-sm font-mono text-muted-foreground">
                          col-span-1
                       </div>
                    ))}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted border border-border rounded-lg p-4 text-center text-sm font-mono text-muted-foreground md:col-span-2">
                       col-span-2
                    </div>
                    <div className="bg-muted border border-border rounded-lg p-4 text-center text-sm font-mono text-muted-foreground">
                       col-span-1
                    </div>
                 </div>
              </div>
           </section>

           {/* Typography & Colors */}
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Colors & Typography</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card className="shadow-sm border-border/60">
                    <CardHeader>
                       <CardTitle className="text-base">Semantic Colors</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-lg bg-emerald-500 shadow-sm border border-emerald-600"></div>
                          <div><div className="font-medium text-sm">Success / Brand</div><div className="text-xs font-mono text-muted-foreground">emerald-500</div></div>
                       </div>
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-lg bg-rose-500 shadow-sm border border-rose-600"></div>
                          <div><div className="font-medium text-sm">Destructive / Error</div><div className="text-xs font-mono text-muted-foreground">rose-500</div></div>
                       </div>
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-lg bg-amber-500 shadow-sm border border-amber-600"></div>
                          <div><div className="font-medium text-sm">Warning / Pending</div><div className="text-xs font-mono text-muted-foreground">amber-500</div></div>
                       </div>
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 rounded-lg bg-indigo-500 shadow-sm border border-indigo-600"></div>
                          <div><div className="font-medium text-sm">Action / Highlight</div><div className="text-xs font-mono text-muted-foreground">indigo-500</div></div>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="shadow-sm border-border/60">
                    <CardHeader>
                       <CardTitle className="text-base">Typography Scale</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-foreground">
                       <div><h1 className="text-3xl font-bold tracking-tight">Display Large</h1><p className="text-xs text-muted-foreground">text-3xl font-bold tracking-tight</p></div>
                       <div><h2 className="text-xl font-semibold tracking-tight">Heading Strong</h2><p className="text-xs text-muted-foreground">text-xl font-semibold tracking-tight</p></div>
                       <div><h3 className="text-base font-medium">Standard Section</h3><p className="text-xs text-muted-foreground">text-base font-medium</p></div>
                       <div><p className="text-sm text-muted-foreground">Body paragraph text used for descriptions and general content.</p><p className="text-xs text-muted-foreground">text-sm text-muted-foreground</p></div>
                       <div><span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Eyebrow / Label</span><p className="text-xs text-muted-foreground">text-[10px] font-bold uppercase tracking-wider</p></div>
                    </CardContent>
                 </Card>
              </div>
           </section>
        </TabsContent>

        <TabsContent value="cards" className="space-y-8 mt-0">
           {/* FinTech KPI Cards */}
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">KPI Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="shadow-sm border-border/60 bg-card">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Volume</p>
                    <h2 className="text-2xl font-bold text-foreground mt-1">$45.2M</h2>
                    <p className="text-xs text-emerald-600 mt-1 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/>+12%</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-border/60 bg-card">
                  <CardContent className="p-5">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Users</p>
                         <h2 className="text-2xl font-bold text-foreground mt-1">12,450</h2>
                       </div>
                       <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-4 h-4"/></div>
                     </div>
                     <p className="text-xs text-muted-foreground/70 mt-2 font-medium">Verified accounts</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border/60 bg-primary text-primary-foreground">
                  <CardContent className="p-5">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Platform Revenue</p>
                         <h2 className="text-2xl font-bold text-primary-foreground mt-1">$1.2M</h2>
                       </div>
                       <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-emerald-400"><Activity className="w-4 h-4"/></div>
                     </div>
                     <p className="text-xs text-emerald-400 mt-2 font-medium">YTD 2026</p>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-rose-200 bg-rose-50/50">
                  <CardContent className="p-5">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Fraud Alerts</p>
                         <h2 className="text-2xl font-bold text-rose-900 mt-1">24 Active</h2>
                       </div>
                       <div className="w-8 h-8 rounded bg-rose-100 flex items-center justify-center text-rose-600 animate-pulse"><AlertTriangle className="w-4 h-4"/></div>
                     </div>
                     <p className="text-xs text-rose-600 mt-2 font-medium">Requires immediate action</p>
                  </CardContent>
                </Card>
              </div>
           </section>

           {/* Analytics Cards */}
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Analytics Modules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card className="border-border shadow-sm">
                   <CardHeader>
                     <CardTitle className="text-base text-foreground">Volume Over Time</CardTitle>
                     <CardDescription>Mock chart layout representing standard rendering.</CardDescription>
                   </CardHeader>
                   <CardContent className="h-48 flex items-center justify-center bg-muted/30 rounded-md mx-6 mb-6">
                      <div className="text-muted-foreground/70 text-sm flex flex-col items-center">
                         <Activity className="w-8 h-8 mb-2 opacity-50"/>
                         [Recharts Bar/Area Rendering Area]
                      </div>
                   </CardContent>
                 </Card>

                 <Card className="border-border shadow-sm">
                   <CardHeader>
                     <CardTitle className="text-base text-foreground">Demographic Split</CardTitle>
                     <CardDescription>Categorical distribution widget.</CardDescription>
                   </CardHeader>
                   <CardContent>
                       <div className="space-y-4">
                          {[
                            { name: 'Tier 1 Accounts', percent: '45%' },
                            { name: 'Tier 2 Accounts', percent: '30%' },
                            { name: 'Enterprise', percent: '25%' },
                          ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500" style={{ opacity: 1 - (i * 0.3) }}></div>
                                  <span className="text-sm font-medium text-foreground/90">{m.name}</span>
                               </div>
                               <span className="text-sm font-bold text-foreground">{m.percent}</span>
                            </div>
                          ))}
                       </div>
                   </CardContent>
                 </Card>
              </div>
           </section>
        </TabsContent>

        <TabsContent value="tables" className="space-y-8 mt-0">
           {/* Transaction Tables */}
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Standard Data Tables</h2>
              <Card className="shadow-sm border-border/60">
                 <CardHeader className="border-b border-border/40 bg-muted/50 py-4">
                    <div className="flex justify-between items-center">
                       <CardTitle className="text-base">Transactions List</CardTitle>
                       <Button variant="outline" size="sm">Export CSV</Button>
                    </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                              <tr>
                                 <th className="px-6 py-4 font-semibold">ID</th>
                                 <th className="px-6 py-4 font-semibold">Customer</th>
                                 <th className="px-6 py-4 font-semibold">Amount</th>
                                 <th className="px-6 py-4 font-semibold">Status</th>
                                 <th className="px-6 py-4 font-semibold">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-border/40 bg-card">
                              {[
                                 { id: 'txn_102', name: 'Alice Smith', amount: '$450.00', status: 'completed' },
                                 { id: 'txn_103', name: 'Bob Johnson', amount: '$1,200.50', status: 'pending' },
                                 { id: 'txn_104', name: 'Charlie Day', amount: '$45.00', status: 'failed' },
                              ].map((item, i) => (
                                  <tr key={i} className="hover:bg-muted/30 group">
                                     <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground group-hover:text-indigo-600 transition-colors">{item.id}</td>
                                     <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                                     <td className="px-6 py-4 font-bold text-foreground">{item.amount}</td>
                                     <td className="px-6 py-4">
                                        <Badge variant="outline" className={
                                           item.status === 'completed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
                                           item.status === 'failed' ? 'border-rose-200 text-rose-700 bg-rose-50' :
                                           'border-amber-200 text-amber-700 bg-amber-50'
                                        }>
                                           {item.status}
                                        </Badge>
                                     </td>
                                     <td className="px-6 py-4">
                                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="w-4 h-4"/></Button>
                                     </td>
                                  </tr>
                              ))}
                           </tbody>
                        </table>
                    </div>
                 </CardContent>
              </Card>
           </section>

           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Status Badges</h2>
              <div className="flex flex-wrap gap-4">
                 <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Completed / Active</Badge>
                 <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">Pending / Review</Badge>
                 <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50">Failed / Suspended</Badge>
                 <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">Processing / New</Badge>
                 <Badge variant="outline" className="border-border text-foreground/90 bg-muted/30">Draft / Inactive</Badge>
              </div>
           </section>
        </TabsContent>

        <TabsContent value="overlays" className="space-y-8 mt-0">
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Modals & Drawers</h2>
              <div className="flex flex-wrap gap-6 bg-card p-6 border border-border rounded-lg">
                 <div>
                   <p className="text-sm font-medium mb-3 text-foreground/90">Dialog Modal</p>
                   <Dialog>
                     <DialogTrigger render={<Button variant="outline" />}>Open Dialog</DialogTrigger>
                     <DialogContent className="sm:max-w-[425px]">
                       <DialogHeader>
                         <DialogTitle>Deactivate Account</DialogTitle>
                         <DialogDescription>
                           This action will suspend the merchant account. They will not be able to process new transactions.
                         </DialogDescription>
                       </DialogHeader>
                       <div className="py-4">
                         <Label className="mb-2 block text-sm">Reason for deactivation</Label>
                         <Input placeholder="E.g. Suspicious activity..." />
                       </div>
                       <DialogFooter>
                         <Button variant="outline">Cancel</Button>
                         <Button variant="destructive">Deactivate</Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                 </div>

                 <div>
                   <p className="text-sm font-medium mb-3 text-foreground/90">Side Drawer (Sheet)</p>
                   <Sheet>
                     <SheetTrigger render={<Button variant="outline" />}>Open Drawer</SheetTrigger>
                     <SheetContent className="w-[400px] sm:w-[540px]">
                       <SheetHeader>
                         <SheetTitle>Transaction Details</SheetTitle>
                         <SheetDescription>
                           Detailed view of the payment authorization request.
                         </SheetDescription>
                       </SheetHeader>
                       <div className="py-6 space-y-4">
                         <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs text-muted-foreground">
                           {`{
  "id": "txn_892348",
  "amount": 25000,
  "currency": "USD",
  "status": "pending"
}`}
                         </div>
                       </div>
                     </SheetContent>
                   </Sheet>
                 </div>

                 <div>
                   <p className="text-sm font-medium mb-3 text-foreground/90">Dropdown Menu</p>
                   <DropdownMenu>
                     <DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
                       Actions <ChevronDown className="w-4 h-4 ml-2 text-muted-foreground/70" />
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="start" className="w-48">
                       <DropdownMenuGroup>
                         <DropdownMenuLabel>Merchant Actions</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem>View Profile</DropdownMenuItem>
                         <DropdownMenuItem>Reset Password</DropdownMenuItem>
                         <DropdownMenuItem>Issue Refund</DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem className="text-rose-600">Suspend Account</DropdownMenuItem>
                       </DropdownMenuGroup>
                     </DropdownMenuContent>
                   </DropdownMenu>
                 </div>
              </div>
           </section>
        </TabsContent>

        <TabsContent value="states" className="space-y-8 mt-0">
           {/* Alerts & Feedback */}
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Alerts & Messages</h2>
              <div className="space-y-4">
                 <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                       <h4 className="font-semibold text-sm">Operation Successful</h4>
                       <p className="text-sm mt-1 text-emerald-700">The payout has been initiated and batch processed successfully.</p>
                    </div>
                 </div>
                 
                 <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex gap-3 text-rose-800">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                       <h4 className="font-semibold text-sm">Action Required</h4>
                       <p className="text-sm mt-1 text-rose-700">Your configuration changes cannot be saved due to invalid parameter constraints.</p>
                    </div>
                 </div>

                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                       <h4 className="font-semibold text-sm">Warning</h4>
                       <p className="text-sm mt-1 text-amber-700">You are about to perform a destructive schema change. Proceed with caution.</p>
                    </div>
                 </div>

                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
                    <Info className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                       <h4 className="font-semibold text-sm">System Update</h4>
                       <p className="text-sm mt-1 text-blue-700">A new version of the compliance rules engine is available for deployment.</p>
                    </div>
                 </div>
              </div>
           </section>

           {/* Empty / Loading States */}
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Loading & Empty States</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Skeleton */}
                 <Card className="border-border shadow-sm">
                   <CardHeader>
                     <CardTitle className="text-base text-foreground">Skeleton Loaders</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full rounded-md" />
                   </CardContent>
                 </Card>

                 {/* Empty State */}
                 <Card className="border-border shadow-sm">
                   <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground/70">
                         <Server className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">No Webhooks Found</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">You haven't configured any endpoints to receive events yet.</p>
                      <Button variant="outline" size="sm" className="mt-4">Add Endpoint</Button>
                   </CardContent>
                 </Card>
              </div>
           </section>

           {/* Buttons & Interactions */}
           <section>
              <h2 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">Buttons & Forms</h2>
              <div className="flex flex-wrap items-center gap-4 bg-card p-6 border border-border rounded-lg">
                 <Button>Primary</Button>
                 <Button variant="secondary">Secondary</Button>
                 <Button variant="outline">Outline</Button>
                 <Button variant="ghost">Ghost</Button>
                 <Button variant="destructive">Destructive</Button>
                 
                 <div className="w-px h-8 bg-slate-200 mx-2"></div>
                 
                 <Button onClick={simulateLoading} disabled={isLoading}>
                    {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Loading...</> : 'Loading State'}
                 </Button>

                 <Button className="bg-indigo-600 hover:bg-indigo-700 text-primary-foreground shadow-sm">
                    <Sparkles className="w-4 h-4 mr-2"/>
                    Action Highlight
                 </Button>
              </div>
           </section>
        </TabsContent>

        <TabsContent value="formbuilder" className="mt-0">
          <FormBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
