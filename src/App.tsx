import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppDashboard } from './apps/SharedDashboard';
import { AdminLayout } from './apps/admin/AdminLayout';

function RootRedirect() {
  const { auth, isLoading } = useAuth();
  
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!auth) return <Navigate to="/login" replace />;
  
  switch (auth.role) {
    case 'ADMIN': return <Navigate to="/admin" replace />;
    case 'MERCHANT': return <Navigate to="/merchant" replace />;
    case 'SCHOOL': return <Navigate to="/school" replace />;
    case 'NGO': return <Navigate to="/ngo" replace />;
    case 'PAYROLL_MANAGER': return <Navigate to="/payroll" replace />;
    case 'CUSTOMER': 
    default: 
      return <Navigate to="/wallet" replace />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          
          <Route path="/wallet" element={
            <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
              <AppDashboard 
                title="Wallet App" 
                description="Manage your personal funds, send money, and pay bills." 
              />
            </ProtectedRoute>
          } />

          <Route path="/merchant" element={
            <ProtectedRoute allowedRoles={['MERCHANT', 'ADMIN']}>
              <AppDashboard 
                title="Merchant Dashboard" 
                description="Accept payments, view transactions, and manage business tools." 
              />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          } />

          <Route path="/school" element={
            <ProtectedRoute allowedRoles={['SCHOOL', 'ADMIN']}>
              <AppDashboard 
                title="School Manager" 
                description="Specialized portal for school fee collection, student invoicing, and payroll for teachers." 
              />
            </ProtectedRoute>
          } />

          <Route path="/ngo" element={
            <ProtectedRoute allowedRoles={['NGO', 'ADMIN']}>
              <AppDashboard 
                title="NGO Bridge" 
                description="Large-scale disbursement engine for NGO aid programs and conditional cash transfers." 
              />
            </ProtectedRoute>
          } />

          <Route path="/payroll" element={
            <ProtectedRoute allowedRoles={['PAYROLL_MANAGER', 'ADMIN']}>
              <AppDashboard 
                title="Payroll Manager" 
                description="Mass payout system for employee salaries." 
              />
            </ProtectedRoute>
          } />

          <Route path="/" element={<RootRedirect />} />
          
          <Route path="/unauthorized" element={
            <div className="flex flex-col gap-4 h-screen items-center justify-center bg-background">
              <h1 className="font-bold text-2xl text-foreground">Unauthorized</h1>
              <p className="text-muted-foreground">You do not have access to this module.</p>
              <button 
                onClick={() => {
                  localStorage.removeItem('refreshToken');
                  localStorage.removeItem('auth');
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium mt-4 shadow-sm"
              >
                Sign out & Return Home
              </button>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
