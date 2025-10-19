import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  Settings,
  CreditCard,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pazienti", href: "/pazienti", icon: Users },
  { name: "Prestazioni", href: "/prestazioni", icon: Stethoscope },
  { name: "Calendario", href: "/calendario", icon: Calendar },
  { name: "Fatture", href: "/fatture", icon: FileText },
  { name: "Statistiche", href: "/statistiche", icon: TrendingUp },
  { name: "Pagamenti", href: "/pagamenti", icon: CreditCard },
  { name: "Impostazioni", href: "/impostazioni", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Stethoscope className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">MedicoGest</h1>
          <p className="text-xs text-muted-foreground">Gestionale Sanitario</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-medical-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            DR
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              Dr. Rossi
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Medico Chirurgo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
