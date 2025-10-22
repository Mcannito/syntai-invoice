import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

interface InserisciFatturaInEntrataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  fatturaToEdit?: any;
}

export function InserisciFatturaInEntrataDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  fatturaToEdit
}: InserisciFatturaInEntrataDialogProps) {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfPath, setExistingPdfPath] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    numero: "",
    data: new Date().toISOString().split('T')[0],
    fornitore: "",
    partita_iva: "",
    codice_fiscale: "",
    imponibile: "",
    iva_importo: "",
    descrizione: "",
    categoria: "",
    metodo_pagamento: "bonifico",
    pagata: false,
    data_pagamento: "",
    note: ""
  });

  useEffect(() => {
    if (fatturaToEdit && open) {
      setFormData({
        numero: fatturaToEdit.numero || "",
        data: fatturaToEdit.data || new Date().toISOString().split('T')[0],
        fornitore: fatturaToEdit.fornitore || "",
        partita_iva: fatturaToEdit.partita_iva || "",
        codice_fiscale: fatturaToEdit.codice_fiscale || "",
        imponibile: fatturaToEdit.imponibile?.toString() || "",
        iva_importo: fatturaToEdit.iva_importo?.toString() || "",
        descrizione: fatturaToEdit.descrizione || "",
        categoria: fatturaToEdit.categoria || "",
        metodo_pagamento: fatturaToEdit.metodo_pagamento || "bonifico",
        pagata: fatturaToEdit.pagata || false,
        data_pagamento: fatturaToEdit.data_pagamento || "",
        note: fatturaToEdit.note || ""
      });
      setExistingPdfPath(fatturaToEdit.pdf_path || null);
      setPdfFile(null);
    } else if (!open) {
      resetForm();
    }
  }, [fatturaToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const imponibile = parseFloat(formData.imponibile) || 0;
      const iva = parseFloat(formData.iva_importo) || 0;
      const totale = imponibile + iva;

      let pdfPath = existingPdfPath;

      // Upload PDF if new file selected
      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('fatture-in-entrata')
          .upload(fileName, pdfFile);

        if (uploadError) throw uploadError;
        pdfPath = fileName;
      }

      const dataToSave = {
        numero: formData.numero,
        data: formData.data,
        fornitore: formData.fornitore,
        partita_iva: formData.partita_iva || null,
        codice_fiscale: formData.codice_fiscale || null,
        imponibile,
        iva_importo: iva,
        importo: totale,
        descrizione: formData.descrizione || null,
        categoria: formData.categoria || null,
        metodo_pagamento: formData.metodo_pagamento || null,
        pagata: formData.pagata,
        data_pagamento: formData.pagata && formData.data_pagamento ? formData.data_pagamento : null,
        note: formData.note || null,
        pdf_path: pdfPath
      };

      if (fatturaToEdit) {
        const { error } = await supabase
          .from('fatture_in_entrata')
          .update(dataToSave)
          .eq('id', fatturaToEdit.id);

        if (error) throw error;
        toast.success("Fattura modificata con successo");
      } else {
        const { error } = await supabase
          .from('fatture_in_entrata')
          .insert({
            ...dataToSave,
            user_id: user.id
          });

        if (error) throw error;
        toast.success("Fattura in entrata inserita con successo");
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Errore salvataggio fattura in entrata:", error);
      toast.error("Errore durante il salvataggio della fattura");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      data: new Date().toISOString().split('T')[0],
      fornitore: "",
      partita_iva: "",
      codice_fiscale: "",
      imponibile: "",
      iva_importo: "",
      descrizione: "",
      categoria: "",
      metodo_pagamento: "bonifico",
      pagata: false,
      data_pagamento: "",
      note: ""
    });
    setPdfFile(null);
    setExistingPdfPath(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fatturaToEdit ? "Modifica Fattura" : "Inserisci Fattura Ricevuta"}</DialogTitle>
          <DialogDescription>
            {fatturaToEdit ? "Modifica i dati della fattura ricevuta" : "Inserisci manualmente i dati di una fattura ricevuta da un fornitore"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="numero">Numero Fattura *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="es. 2025/001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data Fattura *</Label>
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
            <Label htmlFor="fornitore">Fornitore *</Label>
            <Input
              id="fornitore"
              value={formData.fornitore}
              onChange={(e) => setFormData({ ...formData, fornitore: e.target.value })}
              placeholder="Nome del fornitore"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partita_iva">Partita IVA</Label>
              <Input
                id="partita_iva"
                value={formData.partita_iva}
                onChange={(e) => setFormData({ ...formData, partita_iva: e.target.value })}
                placeholder="es. 12345678901"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
              <Input
                id="codice_fiscale"
                value={formData.codice_fiscale}
                onChange={(e) => setFormData({ ...formData, codice_fiscale: e.target.value })}
                placeholder="es. RSSMRA80A01H501U"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="imponibile">Imponibile *</Label>
              <Input
                id="imponibile"
                type="number"
                step="0.01"
                value={formData.imponibile}
                onChange={(e) => setFormData({ ...formData, imponibile: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iva_importo">IVA</Label>
              <Input
                id="iva_importo"
                type="number"
                step="0.01"
                value={formData.iva_importo}
                onChange={(e) => setFormData({ ...formData, iva_importo: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descrizione">Descrizione</Label>
            <Textarea
              id="descrizione"
              value={formData.descrizione}
              onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
              placeholder="Descrizione della spesa"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materiali">Materiali sanitari</SelectItem>
                  <SelectItem value="strumenti">Strumenti e attrezzature</SelectItem>
                  <SelectItem value="affitto">Affitto</SelectItem>
                  <SelectItem value="utenze">Utenze</SelectItem>
                  <SelectItem value="consulenze">Consulenze professionali</SelectItem>
                  <SelectItem value="formazione">Formazione</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="software">Software e abbonamenti</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo_pagamento">Metodo di Pagamento</Label>
              <Select
                value={formData.metodo_pagamento}
                onValueChange={(value) => setFormData({ ...formData, metodo_pagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonifico">Bonifico</SelectItem>
                  <SelectItem value="carta-credito">Carta di Credito</SelectItem>
                  <SelectItem value="carta-debito">Carta di Debito</SelectItem>
                  <SelectItem value="contanti">Contanti</SelectItem>
                  <SelectItem value="assegno">Assegno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="pagata"
              checked={formData.pagata}
              onCheckedChange={(checked) => setFormData({ ...formData, pagata: checked })}
            />
            <Label htmlFor="pagata" className="cursor-pointer">Fattura già pagata</Label>
          </div>

          {formData.pagata && (
            <div className="space-y-2">
              <Label htmlFor="data_pagamento">Data Pagamento</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={formData.data_pagamento}
                onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Note aggiuntive"
              rows={2}
            />
          </div>

          {/* PDF Upload */}
          <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
            <Label htmlFor="pdf">Fattura PDF</Label>
            {existingPdfPath && !pdfFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                <span>PDF già caricato</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.type !== 'application/pdf') {
                      toast.error('Puoi caricare solo file PDF');
                      e.target.value = '';
                      return;
                    }
                    if (file.size > 20 * 1024 * 1024) {
                      toast.error('Il file non può superare i 20MB');
                      e.target.value = '';
                      return;
                    }
                    setPdfFile(file);
                  }
                }}
                className="flex-1"
              />
              {pdfFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPdfFile(null);
                    const input = document.getElementById('pdf') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                >
                  Rimuovi
                </Button>
              )}
            </div>
            {pdfFile && (
              <p className="text-xs text-muted-foreground">
                File selezionato: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {fatturaToEdit ? "Salva Modifiche" : "Salva Fattura"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
