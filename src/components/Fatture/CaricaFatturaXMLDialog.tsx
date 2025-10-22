import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CaricaFatturaXMLDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CaricaFatturaXMLDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CaricaFatturaXMLDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseXMLFattura = async (xmlText: string): Promise<any> => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Verifica errori di parsing
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("File XML non valido");
    }

    // Estrai dati dalla fattura elettronica (formato FatturaPA)
    const getTextContent = (selector: string) => {
      const element = xmlDoc.querySelector(selector);
      return element?.textContent?.trim() || "";
    };

    const getNumericContent = (selector: string) => {
      const text = getTextContent(selector);
      return text ? parseFloat(text.replace(",", ".")) : 0;
    };

    // Dati del cedente/prestatore (chi ha emesso la fattura)
    const denominazione = getTextContent("CedentePrestatore DenominazionePrestatoreImpresa") || 
                         getTextContent("CedentePrestatore Denominazione") ||
                         `${getTextContent("CedentePrestatore Nome")} ${getTextContent("CedentePrestatore Cognome")}`;
    
    const partitaIva = getTextContent("CedentePrestatore IdFiscaleIVA Numero") ||
                      getTextContent("CedentePrestatore IdFiscaleIVA IdPaese") + getTextContent("CedentePrestatore IdFiscaleIVA IdCodice");
    
    const codiceFiscale = getTextContent("CedentePrestatore CodiceFiscale");

    // Dati generali documento
    const numero = getTextContent("DatiGeneraliDocumento Numero");
    const data = getTextContent("DatiGeneraliDocumento Data");
    
    // Importi
    const imponibile = getNumericContent("DatiRiepilogo ImponibileImporto") ||
                       getNumericContent("DatiBeniServizi DettaglioLinee PrezzoTotale");
    
    const iva = getNumericContent("DatiRiepilogo Imposta") ||
                getNumericContent("DatiBeniServizi DettaglioLinee AliquotaIVA");
    
    const importoTotale = getNumericContent("DatiGeneraliDocumento ImportoTotaleDocumento") ||
                         (imponibile + iva);

    // Descrizione (prendi la prima riga di dettaglio)
    const descrizione = getTextContent("DatiBeniServizi DettaglioLinee Descrizione");

    return {
      numero,
      data,
      fornitore: denominazione,
      partita_iva: partitaIva,
      codice_fiscale: codiceFiscale,
      imponibile,
      iva_importo: iva,
      importo: importoTotale,
      descrizione
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.xml')) {
        toast.error("Seleziona un file XML valido");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Seleziona un file XML");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      // Leggi il file XML
      const xmlText = await selectedFile.text();
      
      // Parsa i dati dalla fattura
      const fatturaData = await parseXMLFattura(xmlText);

      if (!fatturaData.numero || !fatturaData.fornitore) {
        throw new Error("File XML non contiene i dati necessari (numero fattura o fornitore mancanti)");
      }

      // Carica il file XML su Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, selectedFile, {
          contentType: 'application/xml',
          upsert: false
        });

      if (uploadError) {
        console.error("Errore upload XML:", uploadError);
        // Continua comunque anche se l'upload fallisce
      }

      const xmlPath = uploadData?.path || null;

      // Inserisci i dati nel database
      const { error: insertError } = await supabase
        .from('fatture_in_entrata')
        .insert({
          user_id: user.id,
          numero: fatturaData.numero,
          data: fatturaData.data,
          fornitore: fatturaData.fornitore,
          partita_iva: fatturaData.partita_iva || null,
          codice_fiscale: fatturaData.codice_fiscale || null,
          imponibile: fatturaData.imponibile,
          iva_importo: fatturaData.iva_importo,
          importo: fatturaData.importo,
          descrizione: fatturaData.descrizione || null,
          xml_path: xmlPath,
          pagata: false
        });

      if (insertError) throw insertError;

      toast.success("Fattura XML caricata con successo");
      onSuccess();
      onOpenChange(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Errore caricamento fattura XML:", error);
      toast.error(error.message || "Errore durante il caricamento del file XML");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Carica Fattura Elettronica XML</DialogTitle>
          <DialogDescription>
            Carica un file XML di una fattura elettronica ricevuta (formato FatturaPA)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Il file XML verrà analizzato automaticamente per estrarre i dati della fattura
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="xml-file">File XML</Label>
            <div className="flex gap-2">
              <Input
                id="xml-file"
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileSelect}
                disabled={loading}
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                File selezionato: {selectedFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={loading || !selectedFile}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              Carica e Importa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
