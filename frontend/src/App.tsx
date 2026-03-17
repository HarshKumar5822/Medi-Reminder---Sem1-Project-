import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Loader2 } from "lucide-react";
import AlarmModal from "@/components/AlarmModal";
import { useMedicines } from "@/hooks/useMedicines";
import { useAlarm } from "@/hooks/useAlarm";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MedicineList from "./pages/MedicineList";
import AddMedicine from "./pages/AddMedicine";
import HistoryPage from "./pages/HistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { medicines, todayMedicines, markAsTaken } = useMedicines();
  const { alarm, dismissAlarm, snoozeAlarm, requestNotificationPermission } =
    useAlarm(todayMedicines);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const handleTaken = () => {
    if (alarm.medicine) {
      markAsTaken(alarm.medicine.id, alarm.time);
    }
    dismissAlarm();
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes wrapped in Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/medicines" element={
          <ProtectedRoute>
            <Layout>
              <MedicineList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute>
            <Layout>
              <Schedule />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <Layout>
              <AddMedicine />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <Layout>
              <HistoryPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AlarmModal alarm={alarm} onTaken={handleTaken} onSnooze={snoozeAlarm} />
    </>
  );
}

import { MedicinesProvider } from "@/context/MedicinesContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <MedicinesProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </MedicinesProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
