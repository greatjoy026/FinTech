import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [role, setRole] = useState('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      
      setAuth({
        userId: data.userId,
        role: data.role,
        accessToken: data.accessToken
      });
      localStorage.setItem('refreshToken', data.refreshToken);

      // Redirect based on role or to intended location
      let to = '/';
      if (data.role === 'ADMIN') to = '/admin';
      else if (data.role === 'MERCHANT') to = '/merchant';
      else if (data.role === 'CUSTOMER') to = '/wallet';
      else if (data.role === 'SCHOOL') to = '/school';
      else if (data.role === 'NGO') to = '/ngo';
      else if (data.role === 'PAYROLL_MANAGER') to = '/payroll';
      
      const from = (location.state as any)?.from?.pathname;
      // We prioritize the role's primary dashboard over 'from' in this prototyping phase
      // to avoid admins getting stuck in the wallet because of old redirects.
      navigate(to, { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
      <Card className="w-full max-w-md shadow-sm border border-border rounded-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">KaekteMoni</CardTitle>
          <CardDescription>
            {step === 'REQUEST' ? 'Enter your phone number to login' : 'Enter the OTP sent to your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 'REQUEST' ? handleRequestOtp : handleVerifyOtp} className="space-y-4">
            {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+232 77 123 456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={step === 'VERIFY' || isLoading}
                required
              />
            </div>

            {step === 'REQUEST' && (
              <div className="space-y-2">
                <Label htmlFor="role">Sign in as</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer / Wallet</SelectItem>
                    <SelectItem value="MERCHANT">Merchant</SelectItem>
                    <SelectItem value="SCHOOL">School</SelectItem>
                    <SelectItem value="NGO">NGO</SelectItem>
                    <SelectItem value="PAYROLL_MANAGER">Payroll Manager</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground pt-1">
                  * Select a role for this demo prototype. In production, role is fixed.
                </p>
              </div>
            )}

            {step === 'VERIFY' && (
              <div className="space-y-2">
                <Label htmlFor="code">6-digit OTP Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-muted-foreground pt-1">
                  * For this prototype, use the mocked OTP code: 123456
                </p>
              </div>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : (step === 'REQUEST' ? 'Send OTP' : 'Verify & Login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
