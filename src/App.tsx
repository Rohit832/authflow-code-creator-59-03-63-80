import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClientAuthProvider } from "@/hooks/useClientAuth";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { IndividualAuthProvider } from "@/hooks/useIndividualAuth";
import Index from "./pages/Index";
import BookDemo from "./pages/BookDemo";
import ClientAuth from "./pages/ClientAuth";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./pages/ClientProfile";
import ClientContent from "./pages/ClientContent";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClients from "./pages/AdminClients";
import AdminSessions from "./pages/AdminSessions";
import AdminCredits from "./pages/AdminCredits";
import AdminSettings from "./pages/AdminSettings";
import AdminInquire from "./pages/AdminInquire";
import AdminMessages from "./pages/AdminMessages";
import AdminInsights from "./pages/AdminInsights";
import AdminBilling from "./pages/AdminBilling";
import AdminAvailability from "./pages/AdminAvailability";
import AdminAssignments from "./pages/AdminAssignments";
import AdminClientRegistration from "./pages/AdminClientRegistration";
import AdminCoaches from "./pages/AdminCoaches";
import AdminIndividual from "./pages/AdminIndividual";
import AdminIndividualChat from "./pages/AdminIndividualChat";
import IndividualAuth from "./pages/IndividualAuth";
import IndividualDashboard from "./pages/IndividualDashboard";
import IndividualChat from "./pages/IndividualChat";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/book-demo" element={<BookDemo />} />
          
          {/* Individual routes with IndividualAuthProvider */}
          <Route path="/individual-auth" element={
            <IndividualAuthProvider>
              <IndividualAuth />
            </IndividualAuthProvider>
          } />
          <Route path="/individual-dashboard" element={
            <IndividualAuthProvider>
              <IndividualDashboard />
            </IndividualAuthProvider>
          } />
          <Route path="/individual-chat" element={
            <IndividualAuthProvider>
              <IndividualChat />
            </IndividualAuthProvider>
          } />
          
          {/* Client routes with ClientAuthProvider */}
          <Route path="/client-auth" element={
            <ClientAuthProvider>
              <ClientAuth />
            </ClientAuthProvider>
          } />
          <Route path="/client-dashboard" element={
            <ClientAuthProvider>
              <ClientDashboard />
            </ClientAuthProvider>
          } />
          {/* Alternative client route with slash */}
          <Route path="/client/dashboard" element={
            <ClientAuthProvider>
              <ClientDashboard />
            </ClientAuthProvider>
          } />
          <Route path="/client-profile" element={
            <ClientAuthProvider>
              <ClientProfile />
            </ClientAuthProvider>
          } />
          {/* Alternative client profile route with slash */}
          <Route path="/client/profile" element={
            <ClientAuthProvider>
              <ClientProfile />
            </ClientAuthProvider>
          } />
          <Route path="/client-content" element={
            <ClientAuthProvider>
              <ClientContent />
            </ClientAuthProvider>
          } />
          {/* Alternative client content route with slash */}
          <Route path="/client/content" element={
            <ClientAuthProvider>
              <ClientContent />
            </ClientAuthProvider>
          } />
          
          {/* Admin routes with AdminAuthProvider */}
          <Route path="/admin-auth" element={
            <AdminAuthProvider>
              <AdminAuth />
            </AdminAuthProvider>
          } />
          <Route path="/admin-dashboard" element={
            <AdminAuthProvider>
              <AdminDashboard />
            </AdminAuthProvider>
          } />
          <Route path="/admin-clients" element={
            <AdminAuthProvider>
              <AdminClients />
            </AdminAuthProvider>
          } />
          <Route path="/admin-sessions" element={
            <AdminAuthProvider>
              <AdminSessions />
            </AdminAuthProvider>
          } />
          <Route path="/admin-credits" element={
            <AdminAuthProvider>
              <AdminCredits />
            </AdminAuthProvider>
          } />
          <Route path="/admin-settings" element={
            <AdminAuthProvider>
              <AdminSettings />
            </AdminAuthProvider>
          } />
          <Route path="/admin-inquire" element={
            <AdminAuthProvider>
              <AdminInquire />
            </AdminAuthProvider>
          } />
          <Route path="/admin-messages" element={
            <AdminAuthProvider>
              <AdminMessages />
            </AdminAuthProvider>
          } />
          <Route path="/admin-insights" element={
            <AdminAuthProvider>
              <AdminInsights />
            </AdminAuthProvider>
          } />
          <Route path="/admin-billing" element={
            <AdminAuthProvider>
              <AdminBilling />
            </AdminAuthProvider>
          } />
          <Route path="/admin-availability" element={
            <AdminAuthProvider>
              <AdminAvailability />
            </AdminAuthProvider>
          } />
          <Route path="/admin-assignments" element={
            <AdminAuthProvider>
              <AdminAssignments />
            </AdminAuthProvider>
          } />
          <Route path="/admin-client-registration" element={
            <AdminAuthProvider>
              <AdminClientRegistration />
            </AdminAuthProvider>
          } />
          <Route path="/admin-coaches" element={
            <AdminAuthProvider>
              <AdminCoaches />
            </AdminAuthProvider>
          } />
          <Route path="/admin-individual" element={
            <AdminAuthProvider>
              <AdminIndividual />
            </AdminAuthProvider>
          } />
          <Route path="/admin-individual-chat" element={
            <AdminAuthProvider>
              <AdminIndividualChat />
            </AdminAuthProvider>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;