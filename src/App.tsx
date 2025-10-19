import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Pazienti from "./pages/Pazienti";
import Prestazioni from "./pages/Prestazioni";
import Calendario from "./pages/Calendario";
import Fatture from "./pages/Fatture";
import Impostazioni from "./pages/Impostazioni";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/pazienti" element={<MainLayout><Pazienti /></MainLayout>} />
          <Route path="/prestazioni" element={<MainLayout><Prestazioni /></MainLayout>} />
          <Route path="/calendario" element={<MainLayout><Calendario /></MainLayout>} />
          <Route path="/fatture" element={<MainLayout><Fatture /></MainLayout>} />
          <Route path="/impostazioni" element={<MainLayout><Impostazioni /></MainLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
