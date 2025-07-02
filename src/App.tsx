import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateRoscaPage from "./pages/CreateRoscaPage";
import JoinRoscaPage from "./pages/JoinRoscaPage";
import MyRoscasPage from "./pages/MyRoscasPage";
import RoscaDashboardPage from "./pages/RoscaDashboardPage";
import AppHeader from "@/components/AppHeader";
import React from "react";

function HeaderWithRouteProps() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine header props based on route
  if (location.pathname === "/create") {
    return <AppHeader showBackButton onBack={() => navigate("/")} title="Create New ROSCA" onLogoClick={() => navigate("/")} />;
  }
  if (location.pathname === "/join") {
    return <AppHeader showBackButton onBack={() => navigate("/")} title="Join Existing ROSCA" onLogoClick={() => navigate("/")} />;
  }
  if (location.pathname === "/my-roscas") {
    return <AppHeader showBackButton onBack={() => navigate("/")} title="My ROSCAs" onLogoClick={() => navigate("/")} />;
  }
  if (location.pathname.startsWith("/dashboard/")) {
    return <AppHeader showBackButton onBack={() => navigate("/")} title="ROSCA Dashboard" onLogoClick={() => navigate("/")} />;
  }
  // Default for landing and others
  return <AppHeader onLogoClick={() => navigate("/")} />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen w-full bg-background">
        <BrowserRouter>
          <HeaderWithRouteProps />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreateRoscaPage />} />
            <Route path="/join" element={<JoinRoscaPage />} />
            <Route path="/my-roscas" element={<MyRoscasPage />} />
            <Route path="/dashboard/:contractAddress" element={<RoscaDashboardPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
