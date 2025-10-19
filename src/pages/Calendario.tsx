import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Calendario = () => {
  const [currentDate] = useState(new Date(2025, 0, 19)); // 19 Gennaio 2025

  // Mock appointments for the week
  const appointments = [
    { id: 1, day: 19, time: "09:00", patient: "Mario Rossi", service: "Visita di controllo", duration: 30 },
    { id: 2, day: 19, time: "10:30", patient: "Anna Bianchi", service: "Prima visita", duration: 45 },
    { id: 3, day: 19, time: "14:00", patient: "Giuseppe Verdi", service: "Consulto", duration: 30 },
    { id: 4, day: 19, time: "15:30", patient: "Laura Neri", service: "Visita di controllo", duration: 30 },
    { id: 5, day: 20, time: "09:30", patient: "Franco Blu", service: "ECG", duration: 30 },
    { id: 6, day: 20, time: "11:00", patient: "Maria Gialli", service: "Prima visita", duration: 45 },
    { id: 7, day: 21, time: "10:00", patient: "Paolo Grigi", service: "Visita specialistica", duration: 60 },
    { id: 8, day: 22, time: "09:00", patient: "Lucia Rosa", service: "Controllo", duration: 30 },
    { id: 9, day: 23, time: "14:30", patient: "Marco Verde", service: "Consulto online", duration: 30 },
  ];

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Appuntamento
        </Button>
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
                      const dayAppointments = appointments.filter(
                        (apt) => apt.day === day && apt.time === time
                      );
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
                                  <p className="font-semibold text-primary">{apt.patient}</p>
                                  <p className="text-muted-foreground">{apt.service}</p>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{apt.duration} min</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {dayAppointments.length === 0 && (
                            <div className="flex h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <Button variant="ghost" size="sm" className="h-6 text-xs">
                                <Plus className="h-3 w-3" />
                              </Button>
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
                <p className="text-2xl font-bold">{appointments.length}</p>
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
                  {appointments.filter(a => a.day === 19).length}
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
