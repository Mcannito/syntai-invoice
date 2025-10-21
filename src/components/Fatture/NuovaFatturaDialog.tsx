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

interface NuovaFatturaDialogProps {
  onFatturaAdded: () => void;
  appuntamento?: any;
  trigger?: React.ReactNode;
}

export const NuovaFatturaDialog = ({ 
  onFatturaAdded, 
  appuntamento,
  trigger 
}: NuovaFatturaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pazienti, setPazienti] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    numero: "",
    data: new Date().toISOString().split('T')[0],
    paziente_id: "",
    importo: "",
    stato: "Da Inviare",
    metodo_pagamento: "Bonifico",
    note: "",
  });

  useEffect(() => {
    if (open) {
      loadPazienti();
      generateNumeroFattura();
      
      // Precompila con dati da appuntamento se presente
      if (appuntamento) {
        setFormData(prev => ({
          ...prev,
          paziente_id: appuntamento.paziente_id || "",
          importo: appuntamento.prestazioni?.prezzo?.toString() || "",
          note: appuntamento.note || "",
        }));
      }
    }
  }, [open, appuntamento]);

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

  const generateNumeroFattura = async () => {
    try {
      const year = new Date().getFullYear();
      const { data, error } = await supabase
        .from("fatture")
        .select("numero")
        .like("numero", `${year}/%`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastNumber = parseInt(data[0].numero.split('/')[1]);
        nextNumber = lastNumber + 1;
      }

      const numeroFattura = `${year}/${nextNumber.toString().padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, numero: numeroFattura }));
    } catch (error) {
      console.error("Error generating numero fattura:", error);
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
          description: "Devi essere autenticato per aggiungere una fattura",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("fatture").insert({
        user_id: user.id,
        numero: formData.numero,
        data: formData.data,
        paziente_id: formData.paziente_id || null,
        importo: parseFloat(formData.importo),
        stato: formData.stato,
        metodo_pagamento: formData.metodo_pagamento,
        note: formData.note,
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Fattura creata con successo",
      });

      setFormData({
        numero: "",
        data: new Date().toISOString().split('T')[0],
        paziente_id: "",
        importo: "",
        stato: "Da Inviare",
        metodo_pagamento: "Bonifico",
        note: "",
      });
      setOpen(false);
      onFatturaAdded();
    } catch (error) {
      console.error("Error adding fattura:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare la fattura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuova Fattura
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuova Fattura</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli della nuova fattura
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Numero Fattura *</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  placeholder="2025/001"
                  required
                />
              </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="paziente">Paziente *</Label>
              <Select
                value={formData.paziente_id}
                onValueChange={(value) => setFormData({ ...formData, paziente_id: value })}
                required
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="importo">Importo (€) *</Label>
                <Input
                  id="importo"
                  type="number"
                  step="0.01"
                  value={formData.importo}
                  onChange={(e) => setFormData({ ...formData, importo: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodo_pagamento">Metodo Pagamento *</Label>
                <Select
                  value={formData.metodo_pagamento}
                  onValueChange={(value) => setFormData({ ...formData, metodo_pagamento: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bonifico">Bonifico</SelectItem>
                    <SelectItem value="Contanti">Contanti</SelectItem>
                    <SelectItem value="POS">POS</SelectItem>
                    <SelectItem value="Assegno">Assegno</SelectItem>
                  </SelectContent>
                </Select>
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
                  <SelectItem value="Da Inviare">Da Inviare</SelectItem>
                  <SelectItem value="Inviata TS">Inviata TS</SelectItem>
                  <SelectItem value="Inviata SDI">Inviata SDI</SelectItem>
                  <SelectItem value="Pagata">Pagata</SelectItem>
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
              {loading ? "Salvataggio..." : "Crea Fattura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};