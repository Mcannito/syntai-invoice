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
  iva: string;
}

export function NuovoPacchettoDialog({ children, onPacchettoAdded }: NuovoPacchettoDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pazienti, setPazienti] = useState<Paziente[]>([]);
  const [prestazioni, setPrestazioni] = useState<Prestazione[]>([]);
  const [metodiPagamento, setMetodiPagamento] = useState<string[]>([
    'bonifico', 'contanti', 'carta', 'pos'
  ]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    paziente_id: "",
    prestazione_id: "",
    quantita_totale: 10,
    prezzo_listino: 0,
    sconto_percentuale: 0,
    sconto_importo: 0,
    prezzo_totale: 0,
    prezzo_per_seduta: 0,
    data_acquisto: new Date().toISOString().split('T')[0],
    data_scadenza: "",
    note: "",
    crea_fattura: true,
    metodo_pagamento: "bonifico",
    fattura_pagata: false,
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
        .select("id, nome, codice, prezzo, iva")
        .eq("user_id", user.id)
        .order("nome");

      if (error) throw error;
      setPrestazioni(data || []);
    } catch (error) {
      console.error("Errore caricamento prestazioni:", error);
    }
  };

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_settings")
        .select("metodo_pagamento_default, metodi_pagamento")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData(prev => ({
          ...prev,
          metodo_pagamento: data.metodo_pagamento_default || 'bonifico'
        }));
        
        if (data.metodi_pagamento && data.metodi_pagamento.length > 0) {
          setMetodiPagamento(data.metodi_pagamento);
        }
      }
    } catch (error) {
      console.error("Errore caricamento impostazioni:", error);
    }
  };

  useEffect(() => {
    if (open) {
      loadPazienti();
      loadPrestazioni();
      loadUserSettings();
    }
  }, [open]);

  // Calcolo automatico prezzo con sconto
  useEffect(() => {
    if (formData.quantita_totale > 0 && formData.prezzo_listino > 0) {
      const scontoImporto = (formData.prezzo_listino * formData.sconto_percentuale) / 100;
      const prezzoFinale = formData.prezzo_listino - scontoImporto;
      const prezzoPerSeduta = prezzoFinale / formData.quantita_totale;
      
      setFormData(prev => ({
        ...prev,
        sconto_importo: scontoImporto,
        prezzo_totale: prezzoFinale,
        prezzo_per_seduta: prezzoPerSeduta
      }));
    }
  }, [formData.prezzo_listino, formData.sconto_percentuale, formData.quantita_totale]);

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

  // Suggerisci prezzo listino quando cambia prestazione o quantità
  useEffect(() => {
    if (formData.prestazione_id) {
      const prestazione = prestazioni.find(p => p.id === formData.prestazione_id);
      if (prestazione) {
        const nuovoPrezzoListino = Number(prestazione.prezzo) * formData.quantita_totale;
        setFormData(prev => ({
          ...prev,
          prezzo_listino: nuovoPrezzoListino
        }));
      }
    }
  }, [formData.prestazione_id, formData.quantita_totale, prestazioni]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazioni
    if (!formData.paziente_id) {
      toast({
        title: "Errore",
        description: "Seleziona un paziente",
        variant: "destructive",
      });
      return;
    }

    if (!formData.prestazione_id) {
      toast({
        title: "Errore",
        description: "Seleziona una prestazione",
        variant: "destructive",
      });
      return;
    }

    if (formData.crea_fattura && !formData.metodo_pagamento) {
      toast({
        title: "Errore",
        description: "Seleziona un metodo di pagamento per la fattura",
        variant: "destructive",
      });
      return;
    }

    if (formData.quantita_totale <= 0) {
      toast({
        title: "Errore",
        description: "La quantità deve essere maggiore di 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.prezzo_totale <= 0) {
      toast({
        title: "Errore",
        description: "Il prezzo deve essere maggiore di 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");

      console.log("📦 Creazione pacchetto con dati:", formData);

      // Crea il pacchetto
      const { data: pacchetto, error: pacchettoError } = await supabase
        .from("pacchetti")
        .insert({
          user_id: user.id,
          nome: formData.nome,
          paziente_id: formData.paziente_id,
          prestazione_id: formData.prestazione_id,
          quantita_totale: formData.quantita_totale,
          prezzo_listino: formData.prezzo_listino,
          sconto_percentuale: formData.sconto_percentuale,
          sconto_importo: formData.sconto_importo,
          prezzo_totale: formData.prezzo_totale,
          prezzo_per_seduta: formData.prezzo_per_seduta,
          data_acquisto: formData.data_acquisto,
          data_scadenza: formData.data_scadenza || null,
          note: formData.note || null,
          stato: 'attivo'
        })
        .select()
        .single();

      if (pacchettoError) {
        console.error("❌ Errore DB pacchetto:", pacchettoError);
        
        let errorMessage = "Impossibile creare il pacchetto";
        if (pacchettoError.message.includes('foreign key')) {
          errorMessage = "Paziente o prestazione non validi";
        } else if (pacchettoError.message.includes('violates')) {
          errorMessage = "Dati non validi. Controlla i campi inseriti";
        }
        
        toast({
          title: "Errore",
          description: errorMessage,
          variant: "destructive",
        });
        throw pacchettoError;
      }

      console.log("✅ Pacchetto creato:", pacchetto.id);

      // Crea fattura se richiesto
      if (formData.crea_fattura && pacchetto) {
        try {
          console.log("💰 Inizio creazione fattura...");
          
          // Recupera tipo paziente per determinare tipo documento
          const { data: pazienteData, error: pazienteError } = await supabase
            .from("pazienti")
            .select("tipo_paziente")
            .eq("id", formData.paziente_id)
            .single();

          if (pazienteError) {
            console.error("❌ Errore recupero paziente:", pazienteError);
            throw new Error(`Impossibile recuperare dati paziente: ${pazienteError.message}`);
          }

          // Determina tipo documento in base al tipo paziente
          const tipoDocumento = pazienteData?.tipo_paziente === 'persona_giuridica' 
            ? 'fattura_elettronica_pg' 
            : 'fattura_sanitaria';

          console.log("📋 Tipo paziente:", pazienteData?.tipo_paziente, "→ Tipo documento:", tipoDocumento);

          // Recupera IVA dalla prestazione
          const prestazioneSelezionata = prestazioni.find(p => p.id === formData.prestazione_id);
          const codiceIva = prestazioneSelezionata?.iva || "0";

          // Parsare il codice IVA (può essere "22", "10", "N2.2", ecc.)
          let ivaPercentuale = 0;
          if (codiceIva && !codiceIva.startsWith('N')) {
            // Estrae il numero dal codice IVA
            const match = codiceIva.match(/(\d+\.?\d*)/);
            if (match) {
              ivaPercentuale = parseFloat(match[1]);
            }
          }
          console.log("🏷️ Codice IVA:", codiceIva, "→ Percentuale:", ivaPercentuale + "%");

          // Recuperare impostazioni fiscali
          const { data: settings } = await supabase
            .from("user_settings")
            .select(`
              metodo_pagamento_default,
              bollo_attivo,
              bollo_virtuale,
              bollo_importo,
              bollo_carico,
              ritenuta_attiva,
              ritenuta_aliquota,
              ritenuta_tipo,
              ritenuta_causale,
              rivalsa_attiva,
              rivalsa_percentuale,
              rivalsa_applicazione,
              regime_fiscale
            `)
            .eq("user_id", user.id)
            .single();

          // Calcoli corretti per fattura
          const imponibile = Number(formData.prezzo_totale);
          const ivaImporto = (imponibile * ivaPercentuale) / 100;

          // Calcolare importi fiscali aggiuntivi
          let cassaPrevidenzialeImporto = 0;
          let percentualeRivalsa: number | null = null;
          if (settings?.rivalsa_attiva) {
            percentualeRivalsa = Number(settings.rivalsa_percentuale || 4);
            cassaPrevidenzialeImporto = (imponibile * percentualeRivalsa) / 100;
          }

          let contributoIntegrativo = 0;
          if (settings?.regime_fiscale === 'forfettario' && settings?.rivalsa_attiva) {
            contributoIntegrativo = cassaPrevidenzialeImporto;
            cassaPrevidenzialeImporto = 0;
          }

          const baseImponibileRitenuta = imponibile + cassaPrevidenzialeImporto + contributoIntegrativo;

          let ritenutaAccontoImporto = 0;
          let percentualeRitenuta: number | null = null;
          if (settings?.ritenuta_attiva) {
            percentualeRitenuta = Number(settings.ritenuta_aliquota || 20);
            ritenutaAccontoImporto = (baseImponibileRitenuta * percentualeRitenuta) / 100;
          }

          let bolloVirtualeImporto = 0;
          if (settings?.bollo_attivo && settings?.bollo_carico === 'paziente') {
            bolloVirtualeImporto = Number(settings.bollo_importo || 2);
          }

          const totale = imponibile 
            + ivaImporto 
            + cassaPrevidenzialeImporto 
            + contributoIntegrativo
            + bolloVirtualeImporto
            - ritenutaAccontoImporto;

          console.log("📊 Calcoli fattura completi:", {
            prezzo_totale: formData.prezzo_totale,
            iva_codice: codiceIva,
            iva_percentuale: ivaPercentuale,
            imponibile: imponibile.toFixed(2),
            iva_importo: ivaImporto.toFixed(2),
            cassa_previdenziale: cassaPrevidenzialeImporto.toFixed(2),
            contributo_integrativo: contributoIntegrativo.toFixed(2),
            ritenuta_acconto: ritenutaAccontoImporto.toFixed(2),
            bollo_attivo: settings?.bollo_attivo,
            bollo_virtuale: settings?.bollo_virtuale,
            bollo_carico: settings?.bollo_carico,
            bollo_importo: bolloVirtualeImporto.toFixed(2),
            totale: totale.toFixed(2),
            tipo_documento: tipoDocumento
          });

          // Genera numero fattura
          const year = new Date(formData.data_acquisto).getFullYear();
          const { count } = await supabase
            .from("fatture")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .like("numero", `${year}/%`);

          const numeroFattura = `${year}/${(count || 0) + 1}`;
          console.log("📄 Numero fattura:", numeroFattura);

          // Crea fattura con dati corretti
      const fatturaData = {
        user_id: user.id,
        paziente_id: formData.paziente_id,
        numero: numeroFattura,
        data: formData.data_acquisto,
        importo: Number(totale.toFixed(2)),
        imponibile: Number(imponibile.toFixed(2)),
        iva_importo: Number(ivaImporto.toFixed(2)),
        cassa_previdenziale: Number(cassaPrevidenzialeImporto.toFixed(2)),
        contributo_integrativo: Number(contributoIntegrativo.toFixed(2)),
        ritenuta_acconto: Number(ritenutaAccontoImporto.toFixed(2)),
        bollo_virtuale: settings?.bollo_attivo ? Number(settings.bollo_importo || 2) : 0,
        percentuale_ritenuta: percentualeRitenuta,
        percentuale_rivalsa: percentualeRivalsa,
        totale: Number(totale.toFixed(2)),
        metodo_pagamento: formData.metodo_pagamento,
        stato: "Da Inviare",
        tipo_documento: tipoDocumento,
        pagata: formData.fattura_pagata,
        data_pagamento: formData.fattura_pagata ? formData.data_acquisto : null
      };

          console.log("📄 Dati fattura:", fatturaData);

          const { data: fattura, error: fatturaError } = await supabase
            .from("fatture")
            .insert(fatturaData)
            .select()
            .single();

          if (fatturaError) {
            console.error("❌ Errore creazione fattura:", fatturaError);
            throw new Error(`Errore creazione fattura: ${fatturaError.message}`);
          }

          console.log("✅ Fattura creata:", fattura.id);

          // Crea dettaglio fattura con IVA corretta
          const dettaglioData = {
            fattura_id: fattura.id,
            prestazione_id: formData.prestazione_id,
            descrizione: formData.nome,
            quantita: Number(formData.quantita_totale),
            prezzo_unitario: Number(formData.prezzo_per_seduta),
            imponibile: Number(imponibile.toFixed(2)),
            iva_percentuale: ivaPercentuale,
            iva_importo: Number(ivaImporto.toFixed(2)),
            totale: Number(totale.toFixed(2))
          };

          console.log("📋 Dati dettaglio:", dettaglioData);

          const { error: dettaglioError } = await supabase
            .from("fatture_dettagli")
            .insert(dettaglioData);

          if (dettaglioError) {
            console.error("❌ Errore dettaglio fattura:", dettaglioError);
            throw new Error(`Errore creazione dettaglio: ${dettaglioError.message}`);
          }

          console.log("✅ Dettaglio fattura creato");

          // Collega fattura al pacchetto
          const { error: updateError } = await supabase
            .from("pacchetti")
            .update({ fattura_id: fattura.id })
            .eq("id", pacchetto.id);

          if (updateError) {
            console.error("❌ Errore collegamento:", updateError);
            throw new Error(`Errore collegamento: ${updateError.message}`);
          }

          console.log("✅ Fattura collegata al pacchetto");

          // Messaggio di successo dettagliato
          const dettagliMsg = [];
          if (ivaPercentuale > 0) dettagliMsg.push(`IVA ${ivaPercentuale}%`);
          if (settings?.bollo_attivo) dettagliMsg.push(`Bollo €${bolloVirtualeImporto.toFixed(2)}`);
          if (settings?.ritenuta_attiva) dettagliMsg.push(`Ritenuta ${percentualeRitenuta}%`);
          if (settings?.rivalsa_attiva) dettagliMsg.push(`Rivalsa ${percentualeRivalsa}%`);
          
          toast({
            title: "Successo",
            description: `Pacchetto e fattura n. ${numeroFattura} creati${dettagliMsg.length > 0 ? ' (' + dettagliMsg.join(', ') + ')' : ''}`,
          });
        } catch (fatturaError: any) {
          console.error("❌ Errore nella fatturazione:", fatturaError);
          toast({
            title: "Pacchetto creato, errore fattura",
            description: `Il pacchetto è stato creato ma: ${fatturaError.message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Pacchetto creato",
          description: "Il pacchetto è stato creato con successo",
        });
      }

      setOpen(false);
      onPacchettoAdded();
      
      // Reset form
      setFormData({
        nome: "",
        paziente_id: "",
        prestazione_id: "",
        quantita_totale: 10,
        prezzo_listino: 0,
        sconto_percentuale: 0,
        sconto_importo: 0,
        prezzo_totale: 0,
        prezzo_per_seduta: 0,
        data_acquisto: new Date().toISOString().split('T')[0],
        data_scadenza: "",
        note: "",
        crea_fattura: true,
        metodo_pagamento: "bonifico",
        fattura_pagata: false,
      });
    } catch (error: any) {
      console.error("❌ Errore creazione pacchetto:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile creare il pacchetto",
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
                onChange={(e) => setFormData({ ...formData, quantita_totale: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Prezzo Listino */}
            <div className="space-y-2">
              <Label htmlFor="prezzo_listino">Prezzo Listino *</Label>
              <Input
                id="prezzo_listino"
                type="number"
                step="0.01"
                min="0"
                value={formData.prezzo_listino}
                onChange={(e) => setFormData({ ...formData, prezzo_listino: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            {/* Sconto Percentuale */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="sconto">Sconto %</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="sconto"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.sconto_percentuale}
                  onChange={(e) => setFormData({ ...formData, sconto_percentuale: parseFloat(e.target.value) || 0 })}
                  className="flex-1"
                />
                {formData.sconto_percentuale > 0 && (
                  <div className="text-sm font-medium text-green-600">
                    Risparmi € {formData.sconto_importo.toFixed(2)}! 🎉
                  </div>
                )}
              </div>
            </div>

            {/* Prezzo Finale */}
            <div className="space-y-2">
              <Label>Prezzo Finale</Label>
              <Input
                value={`€ ${formData.prezzo_totale.toFixed(2)}`}
                disabled
                className="bg-muted font-bold"
              />
            </div>

            {/* Prezzo Per Seduta (readonly) */}
            <div className="space-y-2">
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

            {/* Crea Fattura con campi aggiuntivi */}
            <div className="space-y-4 col-span-2 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="crea_fattura"
                  checked={formData.crea_fattura}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, crea_fattura: checked as boolean })
                  }
                />
                <Label htmlFor="crea_fattura" className="cursor-pointer font-semibold">
                  Crea fattura immediata per il pacchetto
                </Label>
              </div>

              {/* Campi aggiuntivi visibili solo se crea_fattura è true */}
              {formData.crea_fattura && (
                <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20 ml-6">
                  {/* Metodo di Pagamento */}
                  <div className="space-y-2">
                    <Label htmlFor="metodo_pagamento">
                      Metodo di Pagamento <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.metodo_pagamento}
                      onValueChange={(value) => 
                        setFormData({ ...formData, metodo_pagamento: value })
                      }
                    >
                      <SelectTrigger id="metodo_pagamento">
                        <SelectValue placeholder="Seleziona metodo" />
                      </SelectTrigger>
                      <SelectContent>
                        {metodiPagamento.map((metodo) => (
                          <SelectItem key={metodo} value={metodo}>
                            {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkbox Pagata */}
                  <div className="space-y-2 flex items-end pb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fattura_pagata"
                        checked={formData.fattura_pagata}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, fattura_pagata: checked as boolean })
                        }
                      />
                      <Label htmlFor="fattura_pagata" className="cursor-pointer">
                        Fattura già pagata
                      </Label>
                    </div>
                  </div>
                </div>
              )}
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
