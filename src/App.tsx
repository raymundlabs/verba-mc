import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthenticatedRoutes } from "@/routes/AuthenticatedRoutes";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";

// QueryClient is provided as a singleton from src/lib/queryClient

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <LoginPage />
          </div>
        }
      />
      <Route
        path="/signup"
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <SignupPage />
          </div>
        }
      />
      
      <Route path="/*" element={<AuthenticatedRoutes />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
