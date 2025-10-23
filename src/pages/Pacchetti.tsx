import { useState, useEffect } from "react";
import { Search, Plus, Package, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NuovoPacchettoDialog } from "@/components/Pacchetti/NuovoPacchettoDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Pacchetto {
  id: string;
  nome: string;
  quantita_totale: number;
  quantita_utilizzata: number;
  quantita_rimanente: number;
  prezzo_listino: number;
  sconto_percentuale: number;
  sconto_importo: number;
  prezzo_totale: number;
  prezzo_per_seduta: number;
  stato: string;
  data_acquisto: string;
  data_scadenza: string | null;
  note: string | null;
  paziente: { nome: string; cognome: string; ragione_sociale: string | null };
  prestazione: { nome: string; codice: string };
}

export default function Pacchetti() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statoFilter, setStatoFilter] = useState<string>("tutti");
  const [pacchetti, setPacchetti] = useState<Pacchetto[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPacchetti = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      const { data, error } = await supabase
        .from("pacchetti")
        .select(`
          *,
          paziente:pazienti(nome, cognome, ragione_sociale),
          prestazione:prestazioni(nome, codice)
        `)
        .eq("user_id", user.id)
        .order("data_acquisto", { ascending: false });

      if (error) throw error;
      
      // Assicuriamoci che i campi sconto esistano, altrimenti usiamo valori di default
      const pacchettiWithDefaults = (data || []).map(p => ({
        ...p,
        prezzo_listino: p.prezzo_listino ?? p.prezzo_totale,
        sconto_percentuale: p.sconto_percentuale ?? 0,
        sconto_importo: p.sconto_importo ?? 0
      }));
      
      setPacchetti(pacchettiWithDefaults);
    } catch (error) {
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

  useEffect(() => {
    loadPacchetti();
  }, []);

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from("pacchetti")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;

      toast({
        title: "Pacchetto eliminato",
        description: "Il pacchetto è stato eliminato con successo",
      });

      loadPacchetti();
    } catch (error) {
      console.error("Errore eliminazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il pacchetto",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPacchetti = pacchetti.filter((p) => {
    const matchesSearch = 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paziente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paziente.cognome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.paziente.ragione_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.prestazione.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStato = statoFilter === "tutti" || p.stato === statoFilter;
    
    return matchesSearch && matchesStato;
  });

  const stats = {
    attivi: pacchetti.filter(p => p.stato === 'attivo').length,
    completati: pacchetti.filter(p => p.stato === 'completato').length,
    totaleValore: pacchetti.reduce((sum, p) => sum + Number(p.prezzo_totale), 0),
  };

  const getStatoBadge = (stato: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      attivo: "default",
      completato: "secondary",
      scaduto: "destructive",
      annullato: "outline"
    };
    return <Badge variant={variants[stato] || "outline"}>{stato.toUpperCase()}</Badge>;
  };

  const getPazienteNome = (paziente: Pacchetto["paziente"]) => {
    return paziente.ragione_sociale || `${paziente.nome} ${paziente.cognome}`;
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacchetti Sedute</h1>
          <p className="text-muted-foreground">
            Gestisci i pacchetti prepagati dei pazienti
          </p>
        </div>
        <NuovoPacchettoDialog onPacchettoAdded={loadPacchetti}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuovo Pacchetto
          </Button>
        </NuovoPacchettoDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacchetti Attivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attivi}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacchetti Completati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completati}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valore Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {stats.totaleValore.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca pacchetti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statoFilter} onValueChange={setStatoFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutti">Tutti gli stati</SelectItem>
            <SelectItem value="attivo">Attivi</SelectItem>
            <SelectItem value="completato">Completati</SelectItem>
            <SelectItem value="scaduto">Scaduti</SelectItem>
            <SelectItem value="annullato">Annullati</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pacchetti Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      ) : filteredPacchetti.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statoFilter !== "tutti" 
                ? "Nessun pacchetto trovato con questi filtri" 
                : "Nessun pacchetto creato"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPacchetti.map((pacchetto) => (
            <Card key={pacchetto.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CardTitle className="text-lg">{pacchetto.nome}</CardTitle>
                      {pacchetto.sconto_percentuale > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          -{pacchetto.sconto_percentuale}%
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {getPazienteNome(pacchetto.paziente)}
                    </CardDescription>
                  </div>
                  {getStatoBadge(pacchetto.stato)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Prestazione */}
                <div className="text-sm">
                  <span className="text-muted-foreground">Prestazione: </span>
                  <span className="font-medium">{pacchetto.prestazione.nome}</span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Utilizzo</span>
                    <span className="font-medium">
                      {pacchetto.quantita_utilizzata}/{pacchetto.quantita_totale}
                    </span>
                  </div>
                  <Progress 
                    value={(pacchetto.quantita_utilizzata / pacchetto.quantita_totale) * 100} 
                  />
                  <p className="text-xs text-muted-foreground">
                    {pacchetto.quantita_rimanente} {pacchetto.quantita_rimanente === 1 ? 'seduta rimanente' : 'sedute rimanenti'}
                  </p>
                </div>

                {/* Prezzi */}
                <div className="space-y-2 pt-4 border-t">
                  {pacchetto.sconto_percentuale > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Prezzo Listino:</span>
                      <span className="line-through text-muted-foreground">€ {Number(pacchetto.prezzo_listino).toFixed(2)}</span>
                    </div>
                  )}
                  {pacchetto.sconto_percentuale > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Risparmiato:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">-€ {Number(pacchetto.sconto_importo).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Totale</p>
                      <p className="font-bold text-lg">€ {Number(pacchetto.prezzo_totale).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Per seduta</p>
                      <p className="font-medium">€ {Number(pacchetto.prezzo_per_seduta).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Acquisto: {new Date(pacchetto.data_acquisto).toLocaleDateString('it-IT')}</div>
                  {pacchetto.data_scadenza && (
                    <div>Scadenza: {new Date(pacchetto.data_scadenza).toLocaleDateString('it-IT')}</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeletingId(pacchetto.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Elimina
                  </Button>
                </div>

                {/* Note */}
                {pacchetto.note && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p className="font-medium mb-1">Note:</p>
                    <p>{pacchetto.note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo pacchetto? Gli appuntamenti collegati non verranno eliminati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
