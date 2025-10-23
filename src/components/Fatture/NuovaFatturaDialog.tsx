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
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NuovaFatturaDialogProps {
  onFatturaAdded: () => void;
  appuntamento?: any;
  trigger?: React.ReactNode;
  prestazioniPrecompilate?: any[]; // Array di appuntamenti da fatturare
  open?: boolean; // Controllo esterno del dialog
  onOpenChange?: (open: boolean) => void; // Callback per cambiamenti di stato
  metodiPagamento?: string[]; // Metodi di pagamento accettati dal professionista
  fatturaToEdit?: any; // Fattura da modificare
}

export const NuovaFatturaDialog = ({ 
  onFatturaAdded, 
  appuntamento,
  trigger,
  prestazioniPrecompilate,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  metodiPagamento = ['bonifico', 'contanti', 'carta-credito', 'carta-debito'],
  fatturaToEdit
}: NuovaFatturaDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pazienti, setPazienti] = useState<any[]>([]);
  const [prestazioni, setPrestazioni] = useState<any[]>([]);
  const [userSettings, setUserSettings] = useState<any>(null);
  const { toast } = useToast();

  // Usa lo stato controllato se fornito, altrimenti usa lo stato interno
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const [formData, setFormData] = useState({
    numero: "",
    data: new Date().toISOString().split('T')[0],
    paziente_id: "",
    tipo_documento: "fattura_sanitaria",
    metodo_pagamento: "Bonifico",
    stato: "Da Inviare",
    scadenza_pagamento: "",
    note: "",
    pagata: false,
    data_pagamento: "",
    fattura_originale_id: "",
    fattura_originale_numero: "",
    fattura_originale_data: "",
  });
  
  const [pazienteSelezionato, setPazienteSelezionato] = useState<any>(null);

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

  const [tassazioneModificataManualmente, setTassazioneModificataManualmente] = useState(false);
  
  const [tassazioneAttiva, setTassazioneAttiva] = useState({
    cassa_previdenziale: true,
    ritenuta_acconto: true,
    bollo: true,
  });

  const [percentualeRivalsa, setPercentualeRivalsa] = useState(4);
  const [percentualeRitenuta, setPercentualeRitenuta] = useState(20);

  // Funzione per estrarre la percentuale IVA dalla descrizione
  const getIvaPercentuale = (ivaDescrizione: string): number => {
    if (!ivaDescrizione) return 0;
    
    const desc = ivaDescrizione.trim();
    
    // PRIORITÀ 1: Controlla se è un numero puro (5, 10, 22, 4)
    const pureNumber = parseFloat(desc);
    if (!isNaN(pureNumber) && desc === pureNumber.toString()) {
      return pureNumber;
    }
    
    const descLower = desc.toLowerCase();
    
    // PRIORITÀ 2: Esente = 0%
    if (descLower.includes('esente')) return 0;
    
    // PRIORITÀ 3: Codici natura (tutti i codici N indicano operazioni NON soggette ad IVA)
    if (descLower.match(/n\d/)) return 0;
    
    // PRIORITÀ 4: Pattern con percentuale
    const match = descLower.match(/(\d+(?:[.,]\d+)?)\s*%/) || descLower.match(/iva\s*(\d+(?:[.,]\d+)?)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    
    // DEFAULT SICURO: 0% invece di 22%
    return 0;
  };

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setUserSettings(data);
        // Imposta le percentuali dalle impostazioni
        if (data.rivalsa_percentuale) {
          setPercentualeRivalsa(data.rivalsa_percentuale);
        }
        if (data.ritenuta_aliquota) {
          setPercentualeRitenuta(data.ritenuta_aliquota);
        }
        
        // Inizializza gli switch in base alle impostazioni attive
        setTassazioneAttiva({
          cassa_previdenziale: data.rivalsa_attiva || false,
          ritenuta_acconto: data.ritenuta_attiva || false,
          bollo: data.bollo_attivo || false,
        });
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  const calcolaTassazioneDefault = (imponibile: number, settings: any) => {
    if (!settings) return;
    
    const nuovaTassazione = { ...tassazione };
    
    // Rivalsa/Contributo Integrativo (Cassa Previdenziale)
    // L'attivazione dipende SOLO dallo switch nella dialog, non dalle impostazioni globali
    if (tassazioneAttiva.cassa_previdenziale) {
      nuovaTassazione.cassa_previdenziale = 
        imponibile * (percentualeRivalsa / 100);
    } else {
      nuovaTassazione.cassa_previdenziale = 0;
    }
    
    // Ritenuta d'Acconto (calcolata solo su imponibile)
    // L'attivazione dipende SOLO dallo switch nella dialog, non dalle impostazioni globali
    if (tassazioneAttiva.ritenuta_acconto) {
      nuovaTassazione.ritenuta_acconto = 
        imponibile * (percentualeRitenuta / 100);
    } else {
      nuovaTassazione.ritenuta_acconto = 0;
    }
    
    // Marca da Bollo (applica solo se switch attivo E imponibile > 77.47€)
    // L'attivazione dipende SOLO dallo switch nella dialog, non dalle impostazioni globali
    if (tassazioneAttiva.bollo && imponibile > 77.47) {
      const importoBollo = settings.bollo_importo || 2.00;
      // Il bollo viene conteggiato in fattura SOLO se a carico del paziente (default: paziente)
      if (!settings.bollo_carico || settings.bollo_carico === 'paziente') {
        nuovaTassazione.bollo_virtuale = importoBollo;
      } else {
        // Se a carico del professionista, non viene addebitato al paziente
        nuovaTassazione.bollo_virtuale = 0;
      }
    } else {
      nuovaTassazione.bollo_virtuale = 0;
    }
    
    // Contributo integrativo sempre 0 di default (campo nascosto)
    nuovaTassazione.contributo_integrativo = 0;
    
    setTassazione(nuovaTassazione);
  };

  useEffect(() => {
    if (open) {
      loadPazienti();
      loadPrestazioni();
      generateNumeroFattura();
      loadUserSettings();
    }
  }, [open]);

  // Ricalcola automaticamente la tassazione quando cambiano i dettagli o gli userSettings
  useEffect(() => {
    // Non ricalcolare se l'utente ha modificato manualmente i valori
    if (tassazioneModificataManualmente) return;
    
    if (userSettings && dettagli.length > 0) {
      // Controlla se c'è almeno un dettaglio con prezzo > 0
      const hasValidDetails = dettagli.some(d => d.prezzo_unitario > 0);
      if (hasValidDetails) {
        const totali = calcolaTotali();
        calcolaTassazioneDefault(totali.imponibile, userSettings);
      }
    }
  }, [dettagli, userSettings, tassazioneModificataManualmente, tassazioneAttiva, percentualeRivalsa, percentualeRitenuta]);

  // Gestisce la precompilazione separatamente dopo che pazienti sono caricati
  useEffect(() => {
    if (open && pazienti.length > 0) {
      // Precompila con dati da prestazioni selezionate
      if (prestazioniPrecompilate && prestazioniPrecompilate.length > 0) {
        const primaPrestazione = prestazioniPrecompilate[0];
        const pazienteId = primaPrestazione.paziente_id || "";
        
        // Trova e imposta il paziente completo
        const paziente = pazienti.find(p => p.id === pazienteId);
        if (paziente) {
          setPazienteSelezionato(paziente);
          
          // Imposta tipo documento automaticamente
          let tipoDoc = "fattura_sanitaria";
          if (paziente.tipo_paziente === "persona_fisica") {
            tipoDoc = "fattura_sanitaria";
          } else {
            const length = paziente.codice_destinatario_length;
            if (length === 6) {
              tipoDoc = "fattura_elettronica_pa";
            } else if (length === 7) {
              tipoDoc = "fattura_elettronica_pg";
            } else {
              tipoDoc = "fattura_proforma";
            }
          }
          
          setFormData(prev => ({
            ...prev,
            paziente_id: pazienteId,
            tipo_documento: tipoDoc,
          }));
        }
        
        // Mappa tutte le prestazioni selezionate nei dettagli
        const dettagliPrecompilati = prestazioniPrecompilate.map(app => ({
          descrizione: app.prestazioni?.nome || app.titolo,
          prestazione_id: app.prestazione_id || "",
          quantita: 1,
          prezzo_unitario: parseFloat(app.prestazioni?.prezzo || "0"),
          sconto: 0,
          iva_percentuale: getIvaPercentuale(app.prestazioni?.iva || ""),
          iva_descrizione: app.prestazioni?.iva,
        }));
        setDettagli(dettagliPrecompilati);
        
        // Forza il ricalcolo della tassazione dopo un breve delay
        setTimeout(() => {
          if (userSettings) {
            const totali = calcolaTotali();
            calcolaTassazioneDefault(totali.imponibile, userSettings);
          }
        }, 100);
      }
      // Precompila con dati da appuntamento singolo se presente
      else if (appuntamento) {
        const pazienteId = appuntamento.paziente_id || "";
        const paziente = pazienti.find(p => p.id === pazienteId);
        
        if (paziente) {
          setPazienteSelezionato(paziente);
        }
        
        setFormData(prev => ({
          ...prev,
          paziente_id: pazienteId,
          note: appuntamento.note || "",
        }));
        
        if (appuntamento.prestazione_id) {
          setDettagli([{
            descrizione: appuntamento.prestazioni?.nome || "",
            prestazione_id: appuntamento.prestazione_id,
            quantita: 1,
            prezzo_unitario: parseFloat(appuntamento.prestazioni?.prezzo || "0"),
            sconto: 0,
            iva_percentuale: getIvaPercentuale(appuntamento.prestazioni?.iva || ""),
            iva_descrizione: appuntamento.prestazioni?.iva,
          }]);
          
          // Forza il ricalcolo della tassazione
          setTimeout(() => {
            if (userSettings) {
              const totali = calcolaTotali();
              calcolaTassazioneDefault(totali.imponibile, userSettings);
            }
          }, 100);
        }
      }
    }
  }, [open, appuntamento, prestazioniPrecompilate, pazienti]);

  // Precompila i dati quando si modifica una fattura esistente
  useEffect(() => {
    const precompilaDatiModifica = async () => {
      if (open && fatturaToEdit && pazienti.length > 0) {
        let dettagliData = null;
        
        // Se è una nota di credito con dettagli già caricati (da fattura originale)
        if (fatturaToEdit.tipo_documento === "nota_credito" && fatturaToEdit.fatture_dettagli) {
          dettagliData = fatturaToEdit.fatture_dettagli;
          
          // Per nota di credito nuova, genera un nuovo numero
          if (!fatturaToEdit.id) {
            await generateNumeroFattura();
          }
        } 
        // Se è una modifica di una fattura esistente, carica i dettagli
        else if (fatturaToEdit.id) {
          const { data, error: dettagliError } = await supabase
            .from("fatture_dettagli")
            .select("*")
            .eq("fattura_id", fatturaToEdit.id);

          if (dettagliError) {
            console.error("Error loading fattura dettagli:", dettagliError);
            return;
          }
          dettagliData = data;
        }

        // Imposta i dati del form
        setFormData({
          numero: fatturaToEdit.id ? (fatturaToEdit.numero || "") : "", // Solo se è modifica
          data: fatturaToEdit.data || new Date().toISOString().split('T')[0],
          paziente_id: fatturaToEdit.paziente_id || "",
          tipo_documento: fatturaToEdit.tipo_documento || "fattura_sanitaria",
          metodo_pagamento: fatturaToEdit.metodo_pagamento || "Bonifico",
          stato: fatturaToEdit.stato || "Da Inviare",
          scadenza_pagamento: fatturaToEdit.scadenza_pagamento || "",
          note: fatturaToEdit.note || "",
          pagata: fatturaToEdit.pagata || false,
          data_pagamento: fatturaToEdit.data_pagamento || "",
          fattura_originale_id: fatturaToEdit.fattura_originale_id || "",
          fattura_originale_numero: fatturaToEdit.fattura_originale_numero || "",
          fattura_originale_data: fatturaToEdit.fattura_originale_data || "",
        });

        // Imposta il paziente selezionato
        const paziente = pazienti.find(p => p.id === fatturaToEdit.paziente_id);
        if (paziente) {
          setPazienteSelezionato(paziente);
        }

        // Imposta i dettagli
        if (dettagliData && dettagliData.length > 0) {
          const dettagliMappati = dettagliData.map(d => ({
            descrizione: d.descrizione || "",
            prestazione_id: d.prestazione_id || "",
            quantita: d.quantita || 1,
            prezzo_unitario: d.prezzo_unitario || 0,
            sconto: d.sconto || 0,
            iva_percentuale: d.iva_percentuale || 0,
          }));
          setDettagli(dettagliMappati);
        }

        // Imposta la tassazione solo se è una modifica (ha id)
        if (fatturaToEdit.id) {
          setTassazione({
            cassa_previdenziale: fatturaToEdit.cassa_previdenziale || 0,
            ritenuta_acconto: fatturaToEdit.ritenuta_acconto || 0,
            contributo_integrativo: fatturaToEdit.contributo_integrativo || 0,
            bollo_virtuale: fatturaToEdit.bollo_virtuale || 0,
          });

          // Imposta le percentuali se presenti
          if (fatturaToEdit.percentuale_rivalsa) {
            setPercentualeRivalsa(fatturaToEdit.percentuale_rivalsa);
          }
          if (fatturaToEdit.percentuale_ritenuta) {
            setPercentualeRitenuta(fatturaToEdit.percentuale_ritenuta);
          }

          // Imposta quali tassazioni sono attive
          setTassazioneAttiva({
            cassa_previdenziale: (fatturaToEdit.cassa_previdenziale || 0) > 0,
            ritenuta_acconto: (fatturaToEdit.ritenuta_acconto || 0) > 0,
            bollo: (fatturaToEdit.bollo_virtuale || 0) > 0,
          });

          setTassazioneModificataManualmente(true);
        } else {
          // Per nuove note di credito, usa le impostazioni di default
          setTassazioneModificataManualmente(false);
        }
      }
    };

    precompilaDatiModifica();
  }, [open, fatturaToEdit, pazienti]);

  const loadPazienti = async () => {
    try {
      const { data, error } = await supabase
        .from("pazienti")
        .select("*")
        .order("nome");

      if (error) throw error;
      setPazienti(data || []);
    } catch (error) {
      console.error("Error loading pazienti:", error);
    }
  };
  
  const handlePazienteChange = (pazienteId: string) => {
    setFormData({ ...formData, paziente_id: pazienteId });
    const paziente = pazienti.find(p => p.id === pazienteId);
    setPazienteSelezionato(paziente);
    
    // Set default document type based on patient type
    if (paziente) {
      if (paziente.tipo_paziente === "persona_fisica") {
        setFormData(prev => ({ ...prev, tipo_documento: "fattura_sanitaria", paziente_id: pazienteId }));
      } else {
        const length = paziente.codice_destinatario_length;
        if (length === 6) {
          setFormData(prev => ({ ...prev, tipo_documento: "fattura_elettronica_pa", paziente_id: pazienteId }));
        } else if (length === 7) {
          setFormData(prev => ({ ...prev, tipo_documento: "fattura_elettronica_pg", paziente_id: pazienteId }));
        }
      }
    }
  };
  
  const getTipiDocumentoDisponibili = () => {
    if (!pazienteSelezionato) return [];
    
    const comuni = ["preventivo"];
    
    if (pazienteSelezionato.tipo_paziente === "persona_fisica") {
      return ["fattura_sanitaria", ...comuni];
    } else {
      // nota_credito disponibile solo per persone giuridiche
      return ["fattura_elettronica_pg", "fattura_elettronica_pa", "fattura_proforma", "nota_credito", ...comuni];
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

    // Calcola l'imponibile totale
    dettagli.forEach(d => {
      const imp = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
      imponibile += imp;
    });

    // Base imponibile per IVA = imponibile + rivalsa/cassa previdenziale
    const base_imponibile_iva = imponibile + tassazione.cassa_previdenziale;
    
    // Calcola IVA sulla base imponibile (imponibile + rivalsa)
    let iva_totale = 0;
    dettagli.forEach(d => {
      const imp = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
      // Proporzione di questa riga rispetto all'imponibile totale
      const proporzione = imponibile > 0 ? imp / imponibile : 0;
      // Base IVA per questa riga include la sua quota proporzionale di rivalsa
      const base_iva_riga = imp + (tassazione.cassa_previdenziale * proporzione);
      const iva = base_iva_riga * (d.iva_percentuale / 100);
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
        iva_percentuale: getIvaPercentuale(prestazione.iva),
        iva_descrizione: prestazione.iva,
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

      // Validazione nota di credito
      if (formData.tipo_documento === "nota_credito") {
        if (!formData.fattura_originale_numero || !formData.fattura_originale_data) {
          toast({
            title: "Errore",
            description: "Per una Nota di Credito è obbligatorio indicare il numero e la data della fattura originale",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const totali = calcolaTotali();

      if (fatturaToEdit) {
        // MODIFICA FATTURA ESISTENTE
        const { error: fatturaError } = await supabase
          .from("fatture")
          .update({
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
            pagata: formData.pagata,
            data_pagamento: formData.data_pagamento || null,
            percentuale_rivalsa: tassazioneAttiva.cassa_previdenziale ? percentualeRivalsa : null,
            percentuale_ritenuta: tassazioneAttiva.ritenuta_acconto ? percentualeRitenuta : null,
            fattura_originale_id: formData.fattura_originale_id || null,
            fattura_originale_data: formData.fattura_originale_data || null,
          })
          .eq('id', fatturaToEdit.id);

        if (fatturaError) throw fatturaError;

        // Elimina i vecchi dettagli
        const { error: deleteError } = await supabase
          .from("fatture_dettagli")
          .delete()
          .eq("fattura_id", fatturaToEdit.id);

        if (deleteError) throw deleteError;

        // Inserisci i nuovi dettagli
        const dettagliConCalcoli = dettagli.map(d => {
          const imponibile = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
          const iva_importo = imponibile * (d.iva_percentuale / 100);
          return {
            fattura_id: fatturaToEdit.id,
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
          description: "Fattura modificata con successo",
        });
      } else {
        // CREAZIONE NUOVA FATTURA
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
            pagata: formData.pagata,
            data_pagamento: formData.data_pagamento || null,
            percentuale_rivalsa: tassazioneAttiva.cassa_previdenziale ? percentualeRivalsa : null,
            percentuale_ritenuta: tassazioneAttiva.ritenuta_acconto ? percentualeRitenuta : null,
            fattura_originale_id: formData.fattura_originale_id || null,
            fattura_originale_data: formData.fattura_originale_data || null,
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

        // Se ci sono prestazioni precompilate, marca gli appuntamenti come fatturati
        if (prestazioniPrecompilate && prestazioniPrecompilate.length > 0) {
          const appuntamentiIds = prestazioniPrecompilate.map(app => app.id);
          const { error: updateError } = await supabase
            .from("appuntamenti")
            .update({ fatturato: true })
            .in("id", appuntamentiIds);

          if (updateError) {
            console.error("Error updating appuntamenti fatturato status:", updateError);
          }
        }

        toast({
          title: "Successo",
          description: "Fattura creata con successo",
        });
      }

      setFormData({
        numero: "",
        data: new Date().toISOString().split('T')[0],
        paziente_id: "",
        tipo_documento: "fattura_sanitaria",
        metodo_pagamento: "Bonifico",
        stato: "Da Inviare",
        scadenza_pagamento: "",
        note: "",
        pagata: false,
        data_pagamento: "",
        fattura_originale_id: "",
        fattura_originale_numero: "",
        fattura_originale_data: "",
      });
      setPazienteSelezionato(null);
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
      setTassazioneModificataManualmente(false);
      setTassazioneAttiva({
        cassa_previdenziale: true,
        ritenuta_acconto: true,
        bollo: true,
      });
      setPercentualeRivalsa(4);
      setPercentualeRitenuta(20);
      setOpen(false);
      onFatturaAdded();
    } catch (error) {
      console.error("Error adding fattura:", error);
      toast({
        title: "Errore",
        description: fatturaToEdit ? "Impossibile modificare la fattura" : "Impossibile creare la fattura",
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
          <DialogTitle>{fatturaToEdit ? 'Modifica Fattura' : 'Nuova Fattura'}</DialogTitle>
          <DialogDescription>
            {fatturaToEdit ? 'Modifica i dettagli della fattura' : 'Inserisci i dettagli della nuova fattura'}
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

                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paziente">Paziente *</Label>
                    <Select
                      value={formData.paziente_id}
                      onValueChange={handlePazienteChange}
                      required
                      disabled={prestazioniPrecompilate && prestazioniPrecompilate.length > 0}
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
                    <Label htmlFor="tipo_documento">Tipo Documento *</Label>
                    <Select
                      value={formData.tipo_documento}
                      onValueChange={(value) => setFormData({ ...formData, tipo_documento: value })}
                      disabled={!pazienteSelezionato}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getTipiDocumentoDisponibili().map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo === "fattura_sanitaria" && "Fattura Sanitaria"}
                            {tipo === "fattura_elettronica_pg" && "Fattura Elettronica B2B"}
                            {tipo === "fattura_elettronica_pa" && "Fattura Elettronica PA"}
                            {tipo === "fattura_proforma" && "Fattura Pro Forma"}
                            {tipo === "preventivo" && "Preventivo"}
                            {tipo === "nota_credito" && "Nota di Credito"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sezione Riferimenti Fattura Originale - Solo per Note di Credito */}
                {formData.tipo_documento === "nota_credito" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fattura_originale_numero">
                        Numero Fattura Originale *
                      </Label>
                      <Input
                        id="fattura_originale_numero"
                        value={formData.fattura_originale_numero}
                        onChange={(e) => setFormData({ ...formData, fattura_originale_numero: e.target.value })}
                        placeholder="Es: 2024/001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fattura_originale_data">
                        Data Fattura Originale *
                      </Label>
                      <Input
                        id="fattura_originale_data"
                        type="date"
                        value={formData.fattura_originale_data}
                        onChange={(e) => setFormData({ ...formData, fattura_originale_data: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

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
                        {metodiPagamento.map((metodo) => {
                          const metodiMap: Record<string, string> = {
                            'contanti': 'Contanti',
                            'carta-credito': 'Carta di credito',
                            'carta-debito': 'Carta di debito',
                            'bonifico': 'Bonifico bancario',
                            'assegno': 'Assegno',
                            'paypal': 'PayPal',
                            'altro': 'Altro'
                          };
                          const label = metodiMap[metodo] || metodo;
                          return (
                            <SelectItem key={metodo} value={label}>
                              {label}
                            </SelectItem>
                          );
                        })}
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
                    <Label htmlFor="pagata">Pagamento</Label>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="pagata"
                          checked={formData.pagata}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            pagata: e.target.checked,
                            data_pagamento: e.target.checked ? new Date().toISOString().split('T')[0] : formData.data_pagamento
                          })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="pagata" className="font-normal cursor-pointer">Pagata</Label>
                      </div>
                      {formData.pagata && (
                        <Input
                          type="date"
                          value={formData.data_pagamento}
                          onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                          placeholder="Data pagamento"
                          className="w-40"
                        />
                      )}
                    </div>
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
                        <Label>Aliquota IVA (%)</Label>
                        <Input
                          value={dettaglio.iva_percentuale || '0'}
                          disabled
                          className="bg-muted"
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
                <p className="text-sm text-muted-foreground">
                  I valori sono calcolati automaticamente dalle impostazioni, ma puoi modificarli per questa fattura
                </p>
                {userSettings && (
                  <div className="mt-3 p-3 bg-background rounded-md border space-y-1.5 text-sm">
                    <div className="font-medium text-foreground mb-2">Impostazioni attive:</div>
                    {userSettings.rivalsa_attiva && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Cassa Previdenziale ({userSettings.cassa_previdenziale?.toUpperCase()}):</span>
                        <span className="font-medium text-foreground">{userSettings.aliquota_cassa}%</span>
                      </div>
                    )}
                    {userSettings.ritenuta_attiva && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Ritenuta d'Acconto:</span>
                        <span className="font-medium text-foreground">{userSettings.ritenuta_aliquota}%</span>
                      </div>
                    )}
                    {userSettings.bollo_attivo && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Marca da Bollo:</span>
                        <span className="font-medium text-foreground">
                          €{userSettings.bollo_importo?.toFixed(2)} (a carico {userSettings.bollo_carico})
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Rivalsa/Contributo Integrativo (%)</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tassazioneAttiva.cassa_previdenziale}
                        onCheckedChange={(checked) => {
                          setTassazioneAttiva(prev => ({ ...prev, cassa_previdenziale: checked }));
                          
                          // Calcola l'imponibile direttamente (senza leggere da tassazione)
                          if (userSettings) {
                            let imponibile = 0;
                            dettagli.forEach(d => {
                              const imp = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
                              imponibile += imp;
                            });
                            
                            if (checked && userSettings.rivalsa_attiva) {
                              setTassazione(prev => ({
                                ...prev,
                                cassa_previdenziale: imponibile * (percentualeRivalsa / 100)
                              }));
                            } else {
                              setTassazione(prev => ({
                                ...prev,
                                cassa_previdenziale: 0
                              }));
                            }
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {tassazioneAttiva.cassa_previdenziale ? 'Attiva' : 'Disattiva'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={percentualeRivalsa}
                      onChange={(e) => {
                        const nuovaPercentuale = parseFloat(e.target.value) || 0;
                        setPercentualeRivalsa(nuovaPercentuale);
                        // Calcola l'imponibile direttamente (senza leggere da tassazione)
                        if (userSettings && tassazioneAttiva.cassa_previdenziale) {
                          let imponibile = 0;
                          dettagli.forEach(d => {
                            const imp = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
                            imponibile += imp;
                          });
                          setTassazione(prev => ({
                            ...prev,
                            cassa_previdenziale: imponibile * (nuovaPercentuale / 100)
                          }));
                        }
                      }}
                      disabled={!tassazioneAttiva.cassa_previdenziale}
                      className="flex-1"
                    />
                    <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      = €{tassazione.cassa_previdenziale.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Ritenuta d'Acconto (%)</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tassazioneAttiva.ritenuta_acconto}
                        onCheckedChange={(checked) => {
                          setTassazioneAttiva(prev => ({ ...prev, ritenuta_acconto: checked }));
                          
                          // Calcola l'imponibile direttamente (senza leggere da tassazione)
                          if (userSettings) {
                            let imponibile = 0;
                            dettagli.forEach(d => {
                              const imp = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
                              imponibile += imp;
                            });
                            
                            if (checked && userSettings.ritenuta_attiva) {
                              setTassazione(prev => ({
                                ...prev,
                                ritenuta_acconto: imponibile * (percentualeRitenuta / 100)
                              }));
                            } else {
                              setTassazione(prev => ({
                                ...prev,
                                ritenuta_acconto: 0
                              }));
                            }
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {tassazioneAttiva.ritenuta_acconto ? 'Attiva' : 'Disattiva'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={percentualeRitenuta}
                      onChange={(e) => {
                        const nuovaPercentuale = parseFloat(e.target.value) || 0;
                        setPercentualeRitenuta(nuovaPercentuale);
                        // Calcola l'imponibile direttamente (senza leggere da tassazione)
                        if (userSettings && tassazioneAttiva.ritenuta_acconto) {
                          let imponibile = 0;
                          dettagli.forEach(d => {
                            const imp = d.quantita * d.prezzo_unitario * (1 - d.sconto / 100);
                            imponibile += imp;
                          });
                          setTassazione(prev => ({
                            ...prev,
                            ritenuta_acconto: imponibile * (nuovaPercentuale / 100)
                          }));
                        }
                      }}
                      disabled={!tassazioneAttiva.ritenuta_acconto}
                      className="flex-1"
                    />
                    <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      = €{tassazione.ritenuta_acconto.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Marca da Bollo (€)</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tassazioneAttiva.bollo}
                        onCheckedChange={(checked) => {
                          const nuovoStato = { ...tassazioneAttiva, bollo: checked };
                          setTassazioneAttiva(nuovoStato);
                          
                          // Calcola immediatamente il nuovo valore
                          if (userSettings) {
                            const totali = calcolaTotali();
                            const imponibile = totali.imponibile;
                            
                            if (checked && userSettings.bollo_attivo && imponibile > 77.47) {
                              if (userSettings.bollo_carico === 'paziente') {
                                setTassazione(prev => ({
                                  ...prev,
                                  bollo_virtuale: userSettings.bollo_importo || 2.00
                                }));
                              } else {
                                setTassazione(prev => ({
                                  ...prev,
                                  bollo_virtuale: 0
                                }));
                              }
                            } else {
                              setTassazione(prev => ({
                                ...prev,
                                bollo_virtuale: 0
                              }));
                            }
                          }
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {tassazioneAttiva.bollo ? 'Attiva' : 'Disattiva'}
                      </span>
                    </div>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    value={tassazione.bollo_virtuale}
                    onChange={(e) => {
                      setTassazione({ ...tassazione, bollo_virtuale: parseFloat(e.target.value) || 0 });
                      setTassazioneModificataManualmente(true);
                    }}
                    disabled={!tassazioneAttiva.bollo}
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
                  <span>Rivalsa/Contributo Integrativo:</span>
                  <span className="font-semibold">€{tassazione.cassa_previdenziale.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA:</span>
                  <span className="font-semibold">€{totali.iva_importo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contributo Integrativo:</span>
                  <span className="font-semibold">€{tassazione.contributo_integrativo.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bollo:</span>
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
