import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
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
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/medicines" element={
          <Layout>
            <MedicineList />
          </Layout>
        } />
        <Route path="/schedule" element={
          <Layout>
            <Schedule />
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <Settings />
          </Layout>
        } />
        <Route path="/add" element={
          <Layout>
            <AddMedicine />
          </Layout>
        } />
        <Route path="/history" element={
          <Layout>
            <HistoryPage />
          </Layout>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AlarmModal alarm={alarm} onTaken={handleTaken} onSnooze={snoozeAlarm} />
    </>
  );
}

import { MedicinesProvider } from "@/context/MedicinesContext";

import { AuthProvider } from "@/context/AuthContext";

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
