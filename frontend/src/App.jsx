import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing.tsx';
import Dashboard from './pages/Dashboard';
import OnboardingWizard from './pages/OnboardingWizard';
import CommandCenter from './pages/CommandCenter';
import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useUser();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07143B]">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <CommandCenter />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wizard" 
        element={
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        } 
      />
      <Route path="/command-center" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" closeButton />
    </UserProvider>
  );
}
