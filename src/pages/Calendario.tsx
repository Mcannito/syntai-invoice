import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NuovoAppuntamentoDialog } from "@/components/Calendario/NuovoAppuntamentoDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Calendario = () => {
  const [currentDate] = useState(new Date(2025, 0, 19)); // 19 Gennaio 2025
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appuntamenti")
        .select(`
          *,
          pazienti (nome, cognome, ragione_sociale, tipo_paziente),
          prestazioni (nome, codice)
        `)
        .order("data", { ascending: true })
        .order("ora_inizio", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli appuntamenti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const weekDays = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  // Generate week view (starting from Monday 19)
  const weekStart = 19;
  const daysInWeek = [19, 20, 21, 22, 23, 24, 25];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground">
            Gestisci gli appuntamenti del tuo studio
          </p>
        </div>
        <NuovoAppuntamentoDialog onAppuntamentoAdded={loadAppointments} />
      </div>

      {/* Calendar Navigation */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Settimana del 19 - 25 Gennaio 2025
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline">Oggi</Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Week View */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Days Header */}
              <div className="grid grid-cols-8 border-b bg-muted/30">
                <div className="border-r p-4 text-center text-sm font-medium text-muted-foreground">
                  Orario
                </div>
                {daysInWeek.map((day, index) => {
                  const isToday = day === 19;
                  return (
                    <div
                      key={day}
                      className={`border-r p-4 text-center ${isToday ? 'bg-primary-light' : ''}`}
                    >
                      <div className="text-xs text-muted-foreground">{weekDays[index]}</div>
                      <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div className="divide-y">
                {timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-8">
                    <div className="border-r bg-muted/30 p-3 text-center text-sm font-medium text-muted-foreground">
                      {time}
                    </div>
                    {daysInWeek.map((day) => {
                      const dayAppointments = appointments.filter((apt) => {
                        if (!apt.data || !apt.ora_inizio) return false;
                        const aptDate = new Date(apt.data);
                        const aptDay = aptDate.getDate();
                        const aptTime = apt.ora_inizio.substring(0, 5);
                        return aptDay === day && aptTime === time;
                      });
                      
                      const getPazienteDisplayName = (apt: any) => {
                        if (!apt.pazienti) return apt.titolo;
                        if (apt.pazienti.tipo_paziente === "persona_fisica") {
                          return `${apt.pazienti.nome} ${apt.pazienti.cognome || ""}`.trim();
                        }
                        return apt.pazienti.ragione_sociale || apt.pazienti.nome;
                      };

                      return (
                        <div
                          key={`${day}-${time}`}
                          className="group relative min-h-[80px] border-r p-2 transition-colors hover:bg-accent/50"
                        >
                          {dayAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              className="mb-1 rounded-md border-l-4 border-primary bg-primary-light p-2 text-xs shadow-sm transition-shadow hover:shadow-medical-md"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 space-y-0.5">
                                  <p className="font-semibold text-primary">
                                    {getPazienteDisplayName(apt)}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {apt.prestazioni?.nome || apt.titolo}
                                  </p>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{apt.ora_inizio} - {apt.ora_fine}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {dayAppointments.length === 0 && !loading && (
                            <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="text-xs text-muted-foreground">Slot libero</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appuntamenti Settimana</p>
                <p className="text-2xl font-bold">{loading ? "..." : appointments.length}</p>
              </div>
              <Badge className="bg-primary text-primary-foreground">Questa settimana</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appuntamenti Oggi</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : appointments.filter(a => {
                    if (!a.data) return false;
                    const aptDate = new Date(a.data);
                    return aptDate.getDate() === 19;
                  }).length}
                </p>
              </div>
              <Badge className="bg-secondary text-secondary-foreground">Oggi</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ore Prenotate</p>
                <p className="text-2xl font-bold">12.5h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendario;
