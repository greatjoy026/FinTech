import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Globe, Bell, Key, Percent, Save, Building, Users, CreditCard, ToggleRight, CalendarClock, Briefcase, Lock, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-foreground/90" />
            System Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure platform defaults, global limits, roles, integrations, and feature flags.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm">
             <Save className="w-4 h-4" /> Save All Changes
           </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* We use horizontal tabs in single view but styled differently or vertical */}
        <Tabs defaultValue="general" className="w-full flex flex-col md:flex-row gap-6">
          <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent space-y-1 items-stretch p-0">
            <TabsTrigger value="general" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground"><Globe className="w-4 h-4 mr-3" /> General</TabsTrigger>
            <TabsTrigger value="fees" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground"><Percent className="w-4 h-4 mr-3" /> Fees & Limits</TabsTrigger>
            <TabsTrigger value="payouts" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground"><CalendarClock className="w-4 h-4 mr-3" /> Payouts & Settlement</TabsTrigger>
            <TabsTrigger value="roles" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground"><Users className="w-4 h-4 mr-3" /> Roles & Permissions</TabsTrigger>
            <TabsTrigger value="providers" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground"><CreditCard className="w-4 h-4 mr-3" /> Provider Config</TabsTrigger>
            <TabsTrigger value="features" className="justify-start px-4 py-2.5 data-[state=active]:bg-muted data-[state=active]:shadow-none data-[state=active]:text-foreground text-muted-foreground"><ToggleRight className="w-4 h-4 mr-3" /> Feature Flags</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-w-0">
            <TabsContent value="general" className="space-y-6 mt-0">
              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/50">
                  <CardTitle className="text-base">Platform Information</CardTitle>
                  <CardDescription>Basic configuration for the financial platform.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input id="platformName" defaultValue="NextGen FinTech" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input id="supportEmail" defaultValue="support@nextgenfin.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseCurrency">Base Currency</Label>
                      <Input id="baseCurrency" defaultValue="USD" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">System Timezone</Label>
                      <Input id="timezone" defaultValue="UTC" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/50">
                  <CardTitle className="text-base">Operating Entities</CardTitle>
                  <CardDescription>Toggle specific system modules and environments.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Disable all external APIs and show maintenance page.</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Merchant Onboarding</Label>
                      <p className="text-sm text-muted-foreground">Allow new merchants to register via public portal.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">NGO Module</Label>
                      <p className="text-sm text-muted-foreground">Enable aid disbursement and token processing.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-6 mt-0">
               <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/50">
                  <CardTitle className="text-base">Global Core Fees</CardTitle>
                  <CardDescription>Default transaction structure across the platform.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>P2P Transfer Fee (%)</Label>
                      <Input defaultValue="0.0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Standard Merchant Fee (%)</Label>
                      <Input defaultValue="2.9" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fixed Merchant Fee (USD)</Label>
                      <Input defaultValue="0.30" />
                    </div>
                    <div className="space-y-2">
                      <Label>ACH Withdrawal Fee (Flat)</Label>
                      <Input defaultValue="1.50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Same-Day Payout Premium (%)</Label>
                      <Input defaultValue="1.0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cross-Border FX Markup (%)</Label>
                      <Input defaultValue="1.5" />
                    </div>
                  </div>
                </CardContent>
               </Card>

               <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/50">
                  <CardTitle className="text-base">System Limits</CardTitle>
                  <CardDescription>Maximum thresholds for transactions.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Max Single Transaction (Tier 1)</Label>
                      <Input defaultValue="5,000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Daily Volume (Tier 1)</Label>
                      <Input defaultValue="20,000" />
                    </div>
                  </div>
                </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6 mt-0">
               <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/50">
                  <CardTitle className="text-base">Settlement Schedules</CardTitle>
                  <CardDescription>Configure global timelines for merchant and user clearing.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Standard Merchant Settlement</Label>
                        <select className="w-full h-10 px-3 py-2 rounded-md border border-border text-sm bg-card">
                          <option>T+1 (Next Business Day)</option>
                          <option>T+2 (Two Business Days)</option>
                          <option>T+3 (Three Business Days)</option>
                          <option>Weekly (Mondays)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>High-Risk Industry Settlement</Label>
                        <select className="w-full h-10 px-3 py-2 rounded-md border border-border text-sm bg-card">
                          <option>T+3 (Three Business Days)</option>
                          <option>T+5 (Five Business Days)</option>
                          <option>T+7 (Seven Business Days)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Batch Cutoff Time (UTC)</Label>
                        <Input type="time" defaultValue="23:59" />
                      </div>
                      <div className="space-y-2">
                        <Label>Minimum Payout Threshold</Label>
                        <Input defaultValue="$50.00" />
                      </div>
                   </div>
                </CardContent>
               </Card>

               <Card className="shadow-sm border-border/60">
                <CardHeader className="border-b border-border/40 bg-muted/50">
                  <CardTitle className="text-base">Payout Rails & Constraints</CardTitle>
                  <CardDescription>Enable or restrict specific clearing rails.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">ACH Payouts (US)</Label>
                      <p className="text-sm text-muted-foreground">Standard NACHA batch clearing.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Real-Time Payments (RTP)</Label>
                      <p className="text-sm text-muted-foreground">Instant clearing via The Clearing House.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Crypto Payouts (USDC)</Label>
                      <p className="text-sm text-muted-foreground">Allow treasury settlement via stablecoins.</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6 mt-0">
               <Card className="shadow-sm border-border/60">
                  <CardHeader className="border-b border-border/40 bg-muted/50 flex flex-row items-center justify-between py-4">
                     <div>
                       <CardTitle className="text-base">Role & Permission Management</CardTitle>
                       <CardDescription>Define system access controls for internal staff.</CardDescription>
                     </div>
                     <Button size="sm" className="bg-primary text-primary-foreground">New Role</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/80 border-b border-border/40 uppercase">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Role Name</th>
                            <th className="px-6 py-4 font-semibold">Staff Count</th>
                            <th className="px-6 py-4 font-semibold">Core Permissions</th>
                            <th className="px-6 py-4 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 bg-card">
                          {[
                            { name: 'Super Admin', count: 3, perms: ['All Systems', 'Destructive Actions', 'Billing'] },
                            { name: 'Compliance Officer', count: 8, perms: ['Read-All', 'KYC Review', 'Suspend Account', 'Override Risk'] },
                            { name: 'Financial Analyst', count: 5, perms: ['Read-All', 'Reporting', 'View Balances', 'Export Data'] },
                            { name: 'Support Agent L1', count: 12, perms: ['Read-User', 'Reset Password', 'Refunds (Limit $100)'] },
                          ].map(role => (
                            <tr key={role.name} className="hover:bg-muted/30">
                               <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-muted-foreground/70" /> {role.name}
                               </td>
                               <td className="px-6 py-4 text-muted-foreground">{role.count} Members</td>
                               <td className="px-6 py-4">
                                  <div className="flex gap-1 flex-wrap">
                                      {role.perms.map(p => <Badge key={p} variant="secondary" className="text-[10px] font-normal">{p}</Badge>)}
                                  </div>
                               </td>
                               <td className="px-6 py-4">
                                  <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 h-8">Edit Perms</Button>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                  </CardContent>
               </Card>

               <Card className="shadow-sm border-border/60">
                 <CardHeader className="border-b border-border/40 bg-muted/50">
                   <CardTitle className="text-base">MFA & Authentication Rules</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Require Enforcement of MFA</Label>
                        <p className="text-sm text-muted-foreground">Require MFA for all staff logins.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Session Timeout</Label>
                        <p className="text-sm text-muted-foreground">Auto-logout duration.</p>
                      </div>
                      <select className="h-9 px-3 rounded-md border border-border text-sm">
                         <option>15 Minutes</option>
                         <option>30 Minutes</option>
                         <option>1 Hour</option>
                         <option>4 Hours</option>
                      </select>
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="providers" className="space-y-6 mt-0">
               <Card className="shadow-sm border-border/60">
                  <CardHeader className="border-b border-border/40 bg-muted/50">
                    <CardTitle className="text-base">Processor Configuration</CardTitle>
                    <CardDescription>Manage active payment processors and their route routing.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                      <div className="divide-y divide-border/40">
                         <div className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">Stripe</h3>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 uppercase text-[10px]">Primary</Badge>
                               </div>
                               <p className="text-sm text-muted-foreground">Cards, Apple Pay, Google Pay</p>
                            </div>
                            <Button variant="outline" size="sm">Manage Keys</Button>
                         </div>
                         <div className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">Plaid</h3>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 uppercase text-[10px]">Active</Badge>
                               </div>
                               <p className="text-sm text-muted-foreground">Bank Auth, Identity, Transactions</p>
                            </div>
                            <Button variant="outline" size="sm">Manage Keys</Button>
                         </div>
                         <div className="p-6 flex items-center justify-between bg-muted/50">
                            <div className="space-y-1">
                               <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">Adyen</h3>
                                  <Badge variant="outline" className="text-muted-foreground border-border uppercase text-[10px]">Standby</Badge>
                               </div>
                               <p className="text-sm text-muted-foreground">International Redundancy</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                         </div>
                      </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6 mt-0">
               <Card className="shadow-sm border-border/60">
                 <CardHeader className="border-b border-border/40 bg-muted/50">
                    <CardTitle className="text-base text-foreground">Feature Flags</CardTitle>
                    <CardDescription>Granular toggle for pre-release modules and beta systems.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="space-y-0.5 pr-8">
                        <Label className="text-base font-medium flex items-center gap-2">Gemini AI Risk Scoring <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-[10px] ml-2">Beta</Badge></Label>
                        <p className="text-sm text-muted-foreground">Enable advanced transaction heuristics using AI. Overrides standard static risk threshold rules when score is above 85.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="space-y-0.5 pr-8">
                        <Label className="text-base font-medium">Virtual Cards Issuance</Label>
                        <p className="text-sm text-muted-foreground">Allow users to spawn ephemeral credit cards linked to their wallet balance.</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="space-y-0.5 pr-8">
                        <Label className="text-base font-medium">Payroll Module</Label>
                        <p className="text-sm text-muted-foreground">Early access for businesses to distribute gig-worker and employee payments.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 pr-8">
                        <Label className="text-base font-medium flex items-center gap-2">Crypto Off-Ramping <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-[10px] ml-2">Experimental</Badge></Label>
                        <p className="text-sm text-muted-foreground">Enable real-time conversion from USDC to local fiat in supported markets.</p>
                      </div>
                      <Switch />
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

