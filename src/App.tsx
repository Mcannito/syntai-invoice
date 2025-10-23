import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Pazienti from "./pages/Pazienti";
import Prestazioni from "./pages/Prestazioni";
import Pacchetti from "./pages/Pacchetti";
import Calendario from "./pages/Calendario";
import Contabilita from "./pages/Contabilita";
import Fatture from "./pages/Fatture";
import SistemaTS from "./pages/SistemaTS";
import Impostazioni from "./pages/Impostazioni";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/pazienti" element={<ProtectedRoute><MainLayout><Pazienti /></MainLayout></ProtectedRoute>} />
          <Route path="/prestazioni" element={<ProtectedRoute><MainLayout><Prestazioni /></MainLayout></ProtectedRoute>} />
          <Route path="/pacchetti" element={<ProtectedRoute><MainLayout><Pacchetti /></MainLayout></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><MainLayout><Calendario /></MainLayout></ProtectedRoute>} />
          <Route path="/contabilita" element={<ProtectedRoute><MainLayout><Contabilita /></MainLayout></ProtectedRoute>} />
          <Route path="/contabilita/fatture" element={<ProtectedRoute><MainLayout><Fatture /></MainLayout></ProtectedRoute>} />
          <Route path="/contabilita/sistema-ts" element={<ProtectedRoute><MainLayout><SistemaTS /></MainLayout></ProtectedRoute>} />
          <Route path="/impostazioni" element={<ProtectedRoute><MainLayout><Impostazioni /></MainLayout></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
