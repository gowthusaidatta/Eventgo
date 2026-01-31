import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Hackathons from "./pages/Hackathons";
import Jobs from "./pages/Jobs";
import Internships from "./pages/Internships";
import OpportunityDetails from "./pages/OpportunityDetails";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Connections from "./pages/Connections";
import CollegeDashboard from "./pages/CollegeDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<OpportunityDetails />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/internships/:id" element={<OpportunityDetails />} />
            <Route path="/opportunities/:id" element={<OpportunityDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/college/dashboard" element={<CollegeDashboard />} />
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
