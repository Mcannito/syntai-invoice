import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NuovoAppuntamentoDialogProps {
  onAppuntamentoAdded: () => void;
}

interface PacchettoDisponibile {
  id: string;
  nome: string;
  quantita_rimanente: number;
  prezzo_per_seduta: number;
}

export const NuovoAppuntamentoDialog = ({ onAppuntamentoAdded }: NuovoAppuntamentoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pazienti, setPazienti] = useState<any[]>([]);
  const [prestazioni, setPrestazioni] = useState<any[]>([]);
  const [pacchettiDisponibili, setPacchettiDisponibili] = useState<PacchettoDisponibile[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    paziente_id: "",
    titolo: "",
    data: "",
    ora_inizio: "",
    ora_fine: "",
    prestazione_id: "",
    note: "",
    stato: "programmato",
    utilizza_pacchetto: false,
    pacchetto_id: "",
  });

  useEffect(() => {
    if (open) {
      loadPazienti();
      loadPrestazioni();
    }
  }, [open]);

  // Carica pacchetti disponibili
  useEffect(() => {
    const loadPacchettiDisponibili = async () => {
      if (!formData.paziente_id || !formData.prestazione_id) {
        setPacchettiDisponibili([]);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("pacchetti")
          .select("id, nome, quantita_rimanente, prezzo_per_seduta")
          .eq("user_id", user.id)
          .eq("paziente_id", formData.paziente_id)
          .eq("prestazione_id", formData.prestazione_id)
          .eq("stato", "attivo")
          .gt("quantita_rimanente", 0);

        if (error) throw error;
        setPacchettiDisponibili(data || []);
      } catch (error) {
        console.error("Errore caricamento pacchetti:", error);
      }
    };

    loadPacchettiDisponibili();
  }, [formData.paziente_id, formData.prestazione_id]);

  // Auto-seleziona pacchetto
  useEffect(() => {
    if (pacchettiDisponibili.length === 1) {
      setFormData(prev => ({
        ...prev,
        utilizza_pacchetto: true,
        pacchetto_id: pacchettiDisponibili[0].id
      }));
    } else if (pacchettiDisponibili.length === 0) {
      setFormData(prev => ({
        ...prev,
        utilizza_pacchetto: false,
        pacchetto_id: ""
      }));
    }
  }, [pacchettiDisponibili]);

  const loadPazienti = async () => {
    try {
      const { data, error } = await supabase
        .from("pazienti")
        .select("id, nome, cognome, ragione_sociale, tipo_paziente")
        .order("nome");

      if (error) throw error;
      setPazienti(data || []);
    } catch (error) {
      console.error("Error loading pazienti:", error);
    }
  };

  const loadPrestazioni = async () => {
    try {
      const { data, error } = await supabase
        .from("prestazioni")
        .select("id, nome, codice")
        .order("nome");

      if (error) throw error;
      setPrestazioni(data || []);
    } catch (error) {
      console.error("Error loading prestazioni:", error);
    }
  };

  const getPazienteDisplayName = (paziente: any) => {
    if (paziente.tipo_paziente === "persona_fisica") {
      return `${paziente.nome} ${paziente.cognome || ""}`.trim();
    }
    return paziente.ragione_sociale || paziente.nome;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per aggiungere un appuntamento",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("appuntamenti").insert({
        user_id: user.id,
        paziente_id: formData.paziente_id || null,
        titolo: formData.titolo,
        data: formData.data,
        ora_inizio: formData.ora_inizio,
        ora_fine: formData.ora_fine,
        prestazione_id: formData.prestazione_id || null,
        note: formData.note,
        stato: formData.stato,
        pacchetto_id: formData.utilizza_pacchetto && formData.pacchetto_id ? formData.pacchetto_id : null,
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Appuntamento aggiunto con successo",
      });

      setFormData({
        paziente_id: "",
        titolo: "",
        data: "",
        ora_inizio: "",
        ora_fine: "",
        prestazione_id: "",
        note: "",
        stato: "programmato",
        utilizza_pacchetto: false,
        pacchetto_id: "",
      });
      setOpen(false);
      onAppuntamentoAdded();
    } catch (error) {
      console.error("Error adding appuntamento:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'appuntamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Appuntamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuovo Appuntamento</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del nuovo appuntamento
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titolo">Titolo *</Label>
              <Input
                id="titolo"
                value={formData.titolo}
                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                placeholder="es. Visita di controllo"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paziente">Paziente</Label>
                <Select
                  value={formData.paziente_id}
                  onValueChange={(value) => setFormData({ ...formData, paziente_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona paziente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pazienti.map((paziente) => (
                      <SelectItem key={paziente.id} value={paziente.id}>
                        {getPazienteDisplayName(paziente)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prestazione">Prestazione</Label>
                <Select
                  value={formData.prestazione_id}
                  onValueChange={(value) => setFormData({ ...formData, prestazione_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona prestazione" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestazioni.map((prestazione) => (
                      <SelectItem key={prestazione.id} value={prestazione.id}>
                        {prestazione.nome} ({prestazione.codice})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pacchetti Disponibili */}
            {pacchettiDisponibili.length > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="utilizza_pacchetto"
                    checked={formData.utilizza_pacchetto}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      utilizza_pacchetto: e.target.checked,
                      pacchetto_id: e.target.checked && pacchettiDisponibili.length === 1 
                        ? pacchettiDisponibili[0].id 
                        : ""
                    })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="utilizza_pacchetto" className="cursor-pointer text-sm">
                    ✓ Utilizza pacchetto ({pacchettiDisponibili[0].quantita_rimanente} rimanenti)
                  </Label>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ora_inizio">Ora Inizio *</Label>
                <Input
                  id="ora_inizio"
                  type="time"
                  value={formData.ora_inizio}
                  onChange={(e) => setFormData({ ...formData, ora_inizio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ora_fine">Ora Fine *</Label>
                <Input
                  id="ora_fine"
                  type="time"
                  value={formData.ora_fine}
                  onChange={(e) => setFormData({ ...formData, ora_fine: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stato">Stato *</Label>
              <Select
                value={formData.stato}
                onValueChange={(value) => setFormData({ ...formData, stato: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programmato">Programmato</SelectItem>
                  <SelectItem value="confermato">Confermato</SelectItem>
                  <SelectItem value="completato">Completato</SelectItem>
                  <SelectItem value="annullato">Annullato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Note aggiuntive..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva Appuntamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
