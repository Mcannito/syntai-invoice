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
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [prestazioni, setPrestazioni] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    numero: "",
    data: new Date().toISOString().split('T')[0],
    paziente_id: "",
    tipo_documento: "fattura",
    metodo_pagamento: "Bonifico",
    stato: "Da Inviare",
    scadenza_pagamento: "",
    note: "",
  });

  const [dettagli, setDettagli] = useState<any[]>([
    {
      descrizione: "",
      prestazione_id: "",
      quantita: 1,
      prezzo_unitario: 0,
      sconto: 0,
      iva_percentuale: 0,
    }
  ]);

  const [tassazione, setTassazione] = useState({
    cassa_previdenziale: 0,
    ritenuta_acconto: 0,
    contributo_integrativo: 0,
    bollo_virtuale: 0,
  });

  useEffect(() => {
    if (open) {
      loadPazienti();
      loadPrestazioni();
      generateNumeroFattura();
      
      // Precompila con dati da appuntamento se presente
      if (appuntamento) {
        setFormData(prev => ({
          ...prev,
          paziente_id: appuntamento.paziente_id || "",
          note: appuntamento.note || "",
        }));
        
        if (appuntamento.prestazione_id) {
          setDettagli([{
            descrizione: appuntamento.prestazioni?.nome || "",
            prestazione_id: appuntamento.prestazione_id,
            quantita: 1,
            prezzo_unitario: parseFloat(appuntamento.prestazioni?.prezzo || "0"),
            sconto: 0,
            iva_percentuale: appuntamento.prestazioni?.iva === "Esente IVA Art.10" ? 0 : 22,
          }]);
        }
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

  const loadPrestazioni = async () => {
    try {
      const { data, error } = await supabase
        .from("prestazioni")
        .select("*")
        .order("nome");

      if (error) throw error;
      setPrestazioni(data || []);
    } catch (error) {
      console.error("Error loading prestazioni:", error);
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

  const calcolaTotali = () => {
    let imponibile = 0;
    let iva_totale = 0;

    dettagli.forEach(d => {
      const imp = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
      const iva = imp * (d.iva_percentuale / 100);
      imponibile += imp;
      iva_totale += iva;
    });

    const totale = imponibile + iva_totale + tassazione.cassa_previdenziale + 
                   tassazione.contributo_integrativo + tassazione.bollo_virtuale - 
                   tassazione.ritenuta_acconto;

    return { imponibile, iva_importo: iva_totale, totale };
  };

  const aggiungiDettaglio = () => {
    setDettagli([...dettagli, {
      descrizione: "",
      prestazione_id: "",
      quantita: 1,
      prezzo_unitario: 0,
      sconto: 0,
      iva_percentuale: 0,
    }]);
  };

  const rimuoviDettaglio = (index: number) => {
    if (dettagli.length > 1) {
      setDettagli(dettagli.filter((_, i) => i !== index));
    }
  };

  const aggiornaDettaglio = (index: number, field: string, value: any) => {
    const nuoviDettagli = [...dettagli];
    nuoviDettagli[index] = { ...nuoviDettagli[index], [field]: value };
    setDettagli(nuoviDettagli);
  };

  const aggiornaPrestazione = (index: number, prestazioneId: string) => {
    if (!prestazioneId) return;

    const prestazione = prestazioni.find(p => p.id === prestazioneId);
    if (prestazione) {
      const nuoviDettagli = [...dettagli];
      nuoviDettagli[index] = {
        ...nuoviDettagli[index],
        prestazione_id: prestazioneId,
        descrizione: prestazione.nome,
        prezzo_unitario: parseFloat(prestazione.prezzo?.toString() || "0"),
        iva_percentuale: prestazione.iva === "Esente IVA Art.10" ? 0 : 22,
      };
      setDettagli(nuoviDettagli);
    }
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

      const totali = calcolaTotali();

      // Inserisci la fattura
      const { data: fatturaData, error: fatturaError } = await supabase
        .from("fatture")
        .insert({
          user_id: user.id,
          numero: formData.numero,
          data: formData.data,
          paziente_id: formData.paziente_id || null,
          tipo_documento: formData.tipo_documento,
          stato: formData.stato,
          metodo_pagamento: formData.metodo_pagamento,
          scadenza_pagamento: formData.scadenza_pagamento || null,
          imponibile: totali.imponibile,
          iva_importo: totali.iva_importo,
          cassa_previdenziale: tassazione.cassa_previdenziale,
          ritenuta_acconto: tassazione.ritenuta_acconto,
          contributo_integrativo: tassazione.contributo_integrativo,
          bollo_virtuale: tassazione.bollo_virtuale,
          totale: totali.totale,
          importo: totali.totale,
          note: formData.note,
        })
        .select()
        .single();

      if (fatturaError) throw fatturaError;

      // Inserisci i dettagli
      const dettagliConCalcoli = dettagli.map(d => {
        const imponibile = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
        const iva_importo = imponibile * (d.iva_percentuale / 100);
        return {
          fattura_id: fatturaData.id,
          prestazione_id: d.prestazione_id || null,
          descrizione: d.descrizione,
          quantita: d.quantita,
          prezzo_unitario: d.prezzo_unitario,
          sconto: d.sconto,
          iva_percentuale: d.iva_percentuale,
          imponibile,
          iva_importo,
          totale: imponibile + iva_importo,
        };
      });

      const { error: dettagliError } = await supabase
        .from("fatture_dettagli")
        .insert(dettagliConCalcoli);

      if (dettagliError) throw dettagliError;

      toast({
        title: "Successo",
        description: "Fattura creata con successo",
      });

      setFormData({
        numero: "",
        data: new Date().toISOString().split('T')[0],
        paziente_id: "",
        tipo_documento: "fattura",
        metodo_pagamento: "Bonifico",
        stato: "Da Inviare",
        scadenza_pagamento: "",
        note: "",
      });
      setDettagli([{
        descrizione: "",
        prestazione_id: "",
        quantita: 1,
        prezzo_unitario: 0,
        sconto: 0,
        iva_percentuale: 0,
      }]);
      setTassazione({
        cassa_previdenziale: 0,
        ritenuta_acconto: 0,
        contributo_integrativo: 0,
        bollo_virtuale: 0,
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

  const totali = calcolaTotali();

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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuova Fattura</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli della nuova fattura
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Dati Principali */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dati Principali</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Numero *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="tipo_documento">Tipo Documento *</Label>
                    <Select
                      value={formData.tipo_documento}
                      onValueChange={(value) => setFormData({ ...formData, tipo_documento: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fattura">Fattura</SelectItem>
                        <SelectItem value="fattura_proforma">Fattura Pro Forma</SelectItem>
                        <SelectItem value="preventivo">Preventivo</SelectItem>
                        <SelectItem value="nota_credito">Nota di Credito</SelectItem>
                      </SelectContent>
                    </Select>
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="metodo_pagamento">Metodo Pagamento *</Label>
                    <Select
                      value={formData.metodo_pagamento}
                      onValueChange={(value) => setFormData({ ...formData, metodo_pagamento: value })}
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

                  <div className="space-y-2">
                    <Label htmlFor="scadenza">Scadenza Pagamento</Label>
                    <Input
                      id="scadenza"
                      type="date"
                      value={formData.scadenza_pagamento}
                      onChange={(e) => setFormData({ ...formData, scadenza_pagamento: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stato">Stato *</Label>
                    <Select
                      value={formData.stato}
                      onValueChange={(value) => setFormData({ ...formData, stato: value })}
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
                </div>
              </CardContent>
            </Card>

            {/* Dettagli Prestazioni */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Prestazioni</CardTitle>
                <Button type="button" size="sm" variant="outline" onClick={aggiungiDettaglio}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Riga
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {dettagli.map((dettaglio, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prestazione</Label>
                        <Select
                          value={dettaglio.prestazione_id}
                          onValueChange={(value) => aggiornaPrestazione(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona prestazione" />
                          </SelectTrigger>
                          <SelectContent>
                            {prestazioni.map((prest) => (
                              <SelectItem key={prest.id} value={prest.id}>
                                {prest.nome} - €{prest.prezzo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Descrizione *</Label>
                        <Input
                          value={dettaglio.descrizione}
                          onChange={(e) => aggiornaDettaglio(index, "descrizione", e.target.value)}
                          placeholder="Descrizione prestazione"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label>Quantità *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={dettaglio.quantita}
                          onChange={(e) => aggiornaDettaglio(index, "quantita", parseFloat(e.target.value))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Prezzo Unitario *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={dettaglio.prezzo_unitario}
                          onChange={(e) => aggiornaDettaglio(index, "prezzo_unitario", parseFloat(e.target.value))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sconto %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={dettaglio.sconto}
                          onChange={(e) => aggiornaDettaglio(index, "sconto", parseFloat(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>IVA %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={dettaglio.iva_percentuale}
                          onChange={(e) => aggiornaDettaglio(index, "iva_percentuale", parseFloat(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2 flex items-end">
                        {dettagli.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => rimuoviDettaglio(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tassazione */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tassazione e Oneri</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cassa Previdenziale (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tassazione.cassa_previdenziale}
                    onChange={(e) => setTassazione({ ...tassazione, cassa_previdenziale: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ritenuta d'Acconto (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tassazione.ritenuta_acconto}
                    onChange={(e) => setTassazione({ ...tassazione, ritenuta_acconto: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contributo Integrativo (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tassazione.contributo_integrativo}
                    onChange={(e) => setTassazione({ ...tassazione, contributo_integrativo: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bollo Virtuale (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tassazione.bollo_virtuale}
                    onChange={(e) => setTassazione({ ...tassazione, bollo_virtuale: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Riepilogo Totali */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Riepilogo Totali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Imponibile:</span>
                  <span className="font-semibold">€{totali.imponibile.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA:</span>
                  <span className="font-semibold">€{totali.iva_importo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cassa Previdenziale:</span>
                  <span className="font-semibold">€{tassazione.cassa_previdenziale.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contributo Integrativo:</span>
                  <span className="font-semibold">€{tassazione.contributo_integrativo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bollo Virtuale:</span>
                  <span className="font-semibold">€{tassazione.bollo_virtuale.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>Ritenuta d'Acconto:</span>
                  <span className="font-semibold">-€{tassazione.ritenuta_acconto.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>TOTALE:</span>
                  <span className="text-primary">€{totali.totale.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Note */}
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
