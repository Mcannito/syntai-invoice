import { StatsCard } from "@/components/Dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Euro, 
  Users, 
  Calendar, 
  FileText,
  Plus,
  AlertCircle,
  Clock
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  // Mock data - da sostituire con dati reali
  const stats = [
    {
      title: "Fatturato Mensile",
      value: "€12.450",
      icon: Euro,
      trend: { value: "8.2%", isPositive: true },
      variant: "primary" as const,
    },
    {
      title: "Pazienti Attivi",
      value: "247",
      icon: Users,
      trend: { value: "12", isPositive: true },
      variant: "secondary" as const,
    },
    {
      title: "Appuntamenti Oggi",
      value: "8",
      icon: Calendar,
      trend: { value: "2", isPositive: true },
      variant: "default" as const,
    },
    {
      title: "Fatture da Inviare",
      value: "5",
      icon: FileText,
      variant: "default" as const,
    },
  ];

  const recentAppointments = [
    { time: "09:00", patient: "Mario Rossi", service: "Visita di controllo" },
    { time: "10:30", patient: "Anna Bianchi", service: "Prima visita" },
    { time: "14:00", patient: "Giuseppe Verdi", service: "Consulto specialistico" },
    { time: "15:30", patient: "Laura Neri", service: "Visita di controllo" },
  ];

  const pendingInvoices = [
    { patient: "Mario Rossi", amount: "€120", date: "15/01/2025", status: "Da inviare" },
    { patient: "Anna Bianchi", amount: "€150", date: "14/01/2025", status: "In attesa" },
    { patient: "Giuseppe Verdi", amount: "€200", date: "13/01/2025", status: "Da inviare" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Panoramica del tuo studio medico
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Appuntamento
        </Button>
      </div>

      {/* Alert */}
      <Alert className="border-secondary/50 bg-secondary-light">
        <AlertCircle className="h-4 w-4 text-secondary" />
        <AlertDescription className="text-sm">
          Hai <strong>5 fatture</strong> pronte per l'invio al Sistema Tessera Sanitaria.
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card className="shadow-medical-sm">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Appuntamenti di Oggi</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center gap-4 p-4 transition-smooth hover:bg-muted/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-sm font-semibold text-primary">
                    {appointment.time}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card className="shadow-medical-sm">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Fatture in Sospeso</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {pendingInvoices.map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-4 transition-smooth hover:bg-muted/30">
                  <div>
                    <p className="font-medium">{invoice.patient}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{invoice.amount}</p>
                    <p className="text-xs text-muted-foreground">{invoice.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
