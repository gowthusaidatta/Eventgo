import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import IndexAditya from "./pages/aditya/IndexAditya";
import LoginAditya from "./pages/aditya/LoginAditya";
import SignupAditya from "./pages/aditya/SignupAditya";
import DashboardAditya from "./pages/aditya/DashboardAditya";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import OpportunityDetails from "./pages/OpportunityDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppAditya = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Aditya University Routes - Primary */}
            <Route path="/" element={<IndexAditya />} />
            <Route path="/login" element={<LoginAditya />} />
            <Route path="/signup" element={<SignupAditya />} />
            <Route path="/dashboard" element={<DashboardAditya />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/opportunities/:id" element={<OpportunityDetails />} />
            
            {/* Redirect /aditya/* to /* for backward compatibility */}
            <Route path="/aditya" element={<Navigate to="/" replace />} />
            <Route path="/aditya/login" element={<Navigate to="/login" replace />} />
            <Route path="/aditya/signup" element={<Navigate to="/signup" replace />} />
            <Route path="/aditya/dashboard" element={<Navigate to="/dashboard" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default AppAditya;
