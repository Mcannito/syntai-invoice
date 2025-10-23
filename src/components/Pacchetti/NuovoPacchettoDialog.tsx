import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NuovoPacchettoDialogProps {
  children: React.ReactNode;
  onPacchettoAdded: () => void;
}

interface Paziente {
  id: string;
  nome: string;
  cognome: string;
  ragione_sociale: string | null;
}

interface Prestazione {
  id: string;
  nome: string;
  codice: string;
  prezzo: number;
}

export function NuovoPacchettoDialog({ children, onPacchettoAdded }: NuovoPacchettoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pazienti, setPazienti] = useState<Paziente[]>([]);
  const [prestazioni, setPrestazioni] = useState<Prestazione[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    paziente_id: "",
    prestazione_id: "",
    quantita_totale: 10,
    prezzo_totale: 0,
    prezzo_per_seduta: 0,
    data_acquisto: new Date().toISOString().split('T')[0],
    data_scadenza: "",
    note: "",
    crea_fattura: true,
  });

  const loadPazienti = async () => {
    try {
      const { data, error } = await supabase
        .from("pazienti")
        .select("id, nome, cognome, ragione_sociale")
        .order("nome");

      if (error) throw error;
      setPazienti(data || []);
    } catch (error) {
      console.error("Errore caricamento pazienti:", error);
    }
  };

  const loadPrestazioni = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("prestazioni")
        .select("id, nome, codice, prezzo")
        .eq("user_id", user.id)
        .order("nome");

      if (error) throw error;
      setPrestazioni(data || []);
    } catch (error) {
      console.error("Errore caricamento prestazioni:", error);
    }
  };

  useEffect(() => {
    if (open) {
      loadPazienti();
      loadPrestazioni();
    }
  }, [open]);

  // Calcolo automatico prezzo per seduta
  useEffect(() => {
    if (formData.quantita_totale > 0) {
      setFormData(prev => ({
        ...prev,
        prezzo_per_seduta: prev.prezzo_totale / prev.quantita_totale
      }));
    }
  }, [formData.prezzo_totale, formData.quantita_totale]);

  // Auto-genera nome pacchetto
  useEffect(() => {
    if (formData.prestazione_id && formData.quantita_totale) {
      const prestazione = prestazioni.find(p => p.id === formData.prestazione_id);
      if (prestazione) {
        setFormData(prev => ({
          ...prev,
          nome: `Pacchetto ${prev.quantita_totale} ${prestazione.nome}`
        }));
      }
    }
  }, [formData.prestazione_id, formData.quantita_totale, prestazioni]);

  // Suggerisci prezzo quando cambia prestazione
  useEffect(() => {
    if (formData.prestazione_id) {
      const prestazione = prestazioni.find(p => p.id === formData.prestazione_id);
      if (prestazione && formData.prezzo_totale === 0) {
        setFormData(prev => ({
          ...prev,
          prezzo_totale: Number(prestazione.prezzo) * prev.quantita_totale,
          prezzo_per_seduta: Number(prestazione.prezzo)
        }));
      }
    }
  }, [formData.prestazione_id, prestazioni]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      // Crea il pacchetto
      const { data: pacchetto, error: pacchettoError } = await supabase
        .from("pacchetti")
        .insert({
          user_id: user.id,
          nome: formData.nome,
          paziente_id: formData.paziente_id,
          prestazione_id: formData.prestazione_id,
          quantita_totale: formData.quantita_totale,
          prezzo_totale: formData.prezzo_totale,
          prezzo_per_seduta: formData.prezzo_per_seduta,
          data_acquisto: formData.data_acquisto,
          data_scadenza: formData.data_scadenza || null,
          note: formData.note || null,
          stato: 'attivo'
        })
        .select()
        .single();

      if (pacchettoError) throw pacchettoError;

      // Crea fattura se richiesto
      if (formData.crea_fattura && pacchetto) {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("metodo_pagamento_default")
          .eq("user_id", user.id)
          .single();

        // Genera numero fattura
        const year = new Date().getFullYear();
        const { count } = await supabase
          .from("fatture")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .like("numero", `${year}/%`);

        const numeroFattura = `${year}/${(count || 0) + 1}`;

        // Crea fattura
        const { data: fattura, error: fatturaError } = await supabase
          .from("fatture")
          .insert({
            user_id: user.id,
            paziente_id: formData.paziente_id,
            numero: numeroFattura,
            data: formData.data_acquisto,
            importo: formData.prezzo_totale,
            imponibile: formData.prezzo_totale,
            totale: formData.prezzo_totale,
            metodo_pagamento: settings?.metodo_pagamento_default || "bonifico",
            stato: "Da Inviare",
            tipo_documento: "fattura"
          })
          .select()
          .single();

        if (fatturaError) throw fatturaError;

        // Crea dettaglio fattura
        await supabase
          .from("fatture_dettagli")
          .insert({
            fattura_id: fattura.id,
            prestazione_id: formData.prestazione_id,
            descrizione: formData.nome,
            quantita: formData.quantita_totale,
            prezzo_unitario: formData.prezzo_per_seduta,
            imponibile: formData.prezzo_totale,
            iva_percentuale: 0,
            iva_importo: 0,
            totale: formData.prezzo_totale
          });

        // Collega fattura al pacchetto
        await supabase
          .from("pacchetti")
          .update({ fattura_id: fattura.id })
          .eq("id", pacchetto.id);
      }

      toast({
        title: "Pacchetto creato",
        description: formData.crea_fattura 
          ? "Il pacchetto e la fattura sono stati creati con successo"
          : "Il pacchetto è stato creato con successo",
      });

      setOpen(false);
      onPacchettoAdded();
      
      // Reset form
      setFormData({
        nome: "",
        paziente_id: "",
        prestazione_id: "",
        quantita_totale: 10,
        prezzo_totale: 0,
        prezzo_per_seduta: 0,
        data_acquisto: new Date().toISOString().split('T')[0],
        data_scadenza: "",
        note: "",
        crea_fattura: true,
      });
    } catch (error) {
      console.error("Errore creazione pacchetto:", error);
      toast({
        title: "Errore",
        description: "Impossibile creare il pacchetto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPazienteNome = (paziente: Paziente) => {
    return paziente.ragione_sociale || `${paziente.nome} ${paziente.cognome}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo Pacchetto Sedute</DialogTitle>
          <DialogDescription>
            Crea un pacchetto prepagato di sedute per un paziente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Paziente */}
            <div className="space-y-2 col-span-2">
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
                      {getPazienteNome(paziente)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prestazione */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="prestazione">Prestazione *</Label>
              <Select
                value={formData.prestazione_id}
                onValueChange={(value) => setFormData({ ...formData, prestazione_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona prestazione" />
                </SelectTrigger>
                <SelectContent>
                  {prestazioni.map((prestazione) => (
                    <SelectItem key={prestazione.id} value={prestazione.id}>
                      {prestazione.nome} - € {Number(prestazione.prezzo).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nome Pacchetto */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nome">Nome Pacchetto *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="es. Pacchetto 10 Fisioterapie"
                required
              />
            </div>

            {/* Quantità */}
            <div className="space-y-2">
              <Label htmlFor="quantita">Numero Sedute *</Label>
              <Input
                id="quantita"
                type="number"
                min="1"
                value={formData.quantita_totale}
                onChange={(e) => setFormData({ ...formData, quantita_totale: parseInt(e.target.value) })}
                required
              />
            </div>

            {/* Prezzo Totale */}
            <div className="space-y-2">
              <Label htmlFor="prezzo_totale">Prezzo Totale *</Label>
              <Input
                id="prezzo_totale"
                type="number"
                step="0.01"
                min="0"
                value={formData.prezzo_totale}
                onChange={(e) => setFormData({ ...formData, prezzo_totale: parseFloat(e.target.value) })}
                required
              />
            </div>

            {/* Prezzo Per Seduta (readonly) */}
            <div className="space-y-2 col-span-2">
              <Label>Prezzo per Seduta</Label>
              <Input
                value={`€ ${formData.prezzo_per_seduta.toFixed(2)}`}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Data Acquisto */}
            <div className="space-y-2">
              <Label htmlFor="data_acquisto">Data Acquisto *</Label>
              <Input
                id="data_acquisto"
                type="date"
                value={formData.data_acquisto}
                onChange={(e) => setFormData({ ...formData, data_acquisto: e.target.value })}
                required
              />
            </div>

            {/* Data Scadenza */}
            <div className="space-y-2">
              <Label htmlFor="data_scadenza">Data Scadenza (opzionale)</Label>
              <Input
                id="data_scadenza"
                type="date"
                value={formData.data_scadenza}
                onChange={(e) => setFormData({ ...formData, data_scadenza: e.target.value })}
              />
            </div>

            {/* Note */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Note aggiuntive sul pacchetto..."
                rows={3}
              />
            </div>

            {/* Crea Fattura */}
            <div className="flex items-center space-x-2 col-span-2">
              <Checkbox
                id="crea_fattura"
                checked={formData.crea_fattura}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, crea_fattura: checked as boolean })
                }
              />
              <Label htmlFor="crea_fattura" className="cursor-pointer">
                Crea fattura immediata per il pacchetto
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creazione..." : "Crea Pacchetto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
