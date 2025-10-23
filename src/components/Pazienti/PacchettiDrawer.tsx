import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { NuovoPacchettoDialog } from "@/components/Pacchetti/NuovoPacchettoDialog";

interface Pacchetto {
  id: string;
  nome: string;
  quantita_totale: number;
  quantita_utilizzata: number;
  prezzo_totale: number;
  prezzo_per_seduta: number;
  stato: string;
  data_acquisto: string;
  data_scadenza: string | null;
  sconto_percentuale: number;
  prestazione: {
    nome: string;
    codice: string;
  };
}

interface PacchettiDrawerProps {
  pazienteId: string | null;
  pazienteNome: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPacchettoAdded?: () => void;
}

export function PacchettiDrawer({ 
  pazienteId, 
  pazienteNome, 
  open, 
  onOpenChange,
  onPacchettoAdded 
}: PacchettiDrawerProps) {
  const [pacchetti, setPacchetti] = useState<Pacchetto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && pazienteId) {
      loadPacchetti();
    }
  }, [open, pazienteId]);

  const loadPacchetti = async () => {
    if (!pazienteId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pacchetti")
        .select(`
          *,
          prestazione:prestazioni(nome, codice)
        `)
        .eq("paziente_id", pazienteId)
        .order("data_acquisto", { ascending: false });

      if (error) throw error;
      setPacchetti(data || []);
    } catch (error: any) {
      console.error("Errore caricamento pacchetti:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i pacchetti",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatoBadge = (stato: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      attivo: { variant: "default", label: "Attivo" },
      completato: { variant: "secondary", label: "Completato" },
      scaduto: { variant: "destructive", label: "Scaduto" },
      annullato: { variant: "outline", label: "Annullato" }
    };
    const config = variants[stato] || variants.attivo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handlePacchettoAdded = () => {
    loadPacchetti();
    onPacchettoAdded?.();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">Pacchetti di {pazienteNome}</DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gestisci i pacchetti sedute del paziente
              </p>
            </div>
            <NuovoPacchettoDialog onPacchettoAdded={handlePacchettoAdded}>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Nuovo Pacchetto
              </Button>
            </NuovoPacchettoDialog>
          </div>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Caricamento...
            </div>
          ) : pacchetti.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nessun pacchetto trovato</p>
              <p className="text-sm text-muted-foreground mt-2">
                Crea il primo pacchetto per questo paziente
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pacchetti.map((pacchetto) => {
                const progresso = (pacchetto.quantita_utilizzata / pacchetto.quantita_totale) * 100;
                const rimanenti = pacchetto.quantita_totale - pacchetto.quantita_utilizzata;

                return (
                  <Card key={pacchetto.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{pacchetto.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {pacchetto.prestazione?.nome}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {pacchetto.sconto_percentuale > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            -{pacchetto.sconto_percentuale}%
                          </Badge>
                        )}
                        {getStatoBadge(pacchetto.stato)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            Progresso: {pacchetto.quantita_utilizzata} / {pacchetto.quantita_totale} sedute
                          </span>
                          <span className="font-medium">
                            {rimanenti} rimanenti
                          </span>
                        </div>
                        <Progress value={progresso} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Prezzo totale</p>
                          <p className="font-semibold">€ {Number(pacchetto.prezzo_totale).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Per seduta</p>
                          <p className="font-semibold">€ {Number(pacchetto.prezzo_per_seduta).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Acquisto: {new Date(pacchetto.data_acquisto).toLocaleDateString()}
                        </div>
                        {pacchetto.data_scadenza && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Scadenza: {new Date(pacchetto.data_scadenza).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
