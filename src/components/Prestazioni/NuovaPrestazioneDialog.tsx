import { useState } from "react";
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
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NuovaPrestazioneDialogProps {
  onPrestazioneAdded: () => void;
}

export const NuovaPrestazioneDialog = ({ onPrestazioneAdded }: NuovaPrestazioneDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: "",
    codice: "",
    prezzo: "",
    iva: "N4",
    categoria: "",
  });

  // Funzione per estrarre la percentuale IVA dal valore selezionato
  const getIvaPercentuale = (ivaValue: string): string => {
    if (!ivaValue) return "0";
    
    // Se il valore è direttamente una percentuale (22, 10, 5, 4)
    if (['22', '10', '5', '4'].includes(ivaValue)) {
      return ivaValue;
    }
    
    // Se inizia con "0% -", ritorna 0
    if (ivaValue.startsWith('0%') || ivaValue.startsWith('N')) {
      return "0";
    }
    
    return "0";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per aggiungere una prestazione",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("prestazioni").insert({
        user_id: user.id,
        nome: formData.nome,
        codice: formData.codice,
        prezzo: parseFloat(formData.prezzo),
        iva: formData.iva,
        categoria: formData.categoria,
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Prestazione aggiunta con successo",
      });

      setFormData({
        nome: "",
        codice: "",
        prezzo: "",
        iva: "N4",
        categoria: "",
      });
      setOpen(false);
      onPrestazioneAdded();
    } catch (error) {
      console.error("Error adding prestazione:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la prestazione",
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
          Nuova Prestazione
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuova Prestazione</DialogTitle>
          <DialogDescription>
            Inserisci i dati della nuova prestazione sanitaria
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Prestazione *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codice">Codice *</Label>
                <Input
                  id="codice"
                  value={formData.codice}
                  onChange={(e) => setFormData({ ...formData, codice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visite">Visite</SelectItem>
                    <SelectItem value="Diagnostica">Diagnostica</SelectItem>
                    <SelectItem value="Telemedicina">Telemedicina</SelectItem>
                    <SelectItem value="Terapie">Terapie</SelectItem>
                    <SelectItem value="Altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prezzo">Prezzo (€) *</Label>
                <Input
                  id="prezzo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prezzo}
                  onChange={(e) => setFormData({ ...formData, prezzo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="iva">IVA *</Label>
                <Select
                  value={formData.iva}
                  onValueChange={(value) => setFormData({ ...formData, iva: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N1">0% - N1 - Escluse ex. art. 15</SelectItem>
                    <SelectItem value="N2">0% - N2 - Non soggette</SelectItem>
                    <SelectItem value="N2.1">0% - N2.1 - Non soggette ad IVA ai sensi degli artt da 7 a 7-septies del DPR 633/72</SelectItem>
                    <SelectItem value="N2.2">0% - N2.2 - Non soggette - altri casi</SelectItem>
                    <SelectItem value="N3">0% - N3 - Non imponibili</SelectItem>
                    <SelectItem value="N3.1">0% - N3.1 - Non imponibili - esportazioni</SelectItem>
                    <SelectItem value="N3.2">0% - N3.2 - Non imponibili - cessioni intracomunitarie</SelectItem>
                    <SelectItem value="N3.3">0% - N3.3 - Non imponibili - cessioni verso San Marino</SelectItem>
                    <SelectItem value="N3.4">0% - N3.4 - Non imponibili - operazioni assimilate alle cessioni all'esportazione</SelectItem>
                    <SelectItem value="N3.5">0% - N3.5 - Non imponibili - a seguito di dichiarazioni d'intento</SelectItem>
                    <SelectItem value="N3.6">0% - N3.6 - Non imponibili - altre operazioni che non concorrono alla formazione del plafond</SelectItem>
                    <SelectItem value="N4">0% - N4 - Esenti</SelectItem>
                    <SelectItem value="N5">0% - N5 - Regime del margine / IVA non esposta in fattura</SelectItem>
                    <SelectItem value="N6">0% - N6 - Inversione contabile</SelectItem>
                    <SelectItem value="N6.1">0% - N6.1 - Inversione contabile - cessione di rottami e altri materiali di recupero</SelectItem>
                    <SelectItem value="N6.2">0% - N6.2 - Inversione contabile - cessione di oro e argento puro</SelectItem>
                    <SelectItem value="N6.3">0% - N6.3 - Inversione contabile - subappalto nel settore edile</SelectItem>
                    <SelectItem value="N6.4">0% - N6.4 - Inversione contabile - cessione di fabbricati</SelectItem>
                    <SelectItem value="N6.5">0% - N6.5 - Inversione contabile - cessione di telefoni cellulari</SelectItem>
                    <SelectItem value="N6.6">0% - N6.6 - Inversione contabile - cessione di prodotti elettronici</SelectItem>
                    <SelectItem value="N6.7">0% - N6.7 - Inversione contabile - prestazioni comparto edile e settori connessi</SelectItem>
                    <SelectItem value="N6.8">0% - N6.8 - Inversione contabile - operazioni settore energetico</SelectItem>
                    <SelectItem value="N6.9">0% - N6.9 - Inversione contabile - altri casi</SelectItem>
                    <SelectItem value="N7">0% - N7 - IVA assolta in altro stato UE</SelectItem>
                    <SelectItem value="22">22%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="4">4%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="iva_percentuale">Aliquota IVA (%)</Label>
                <Input
                  id="iva_percentuale"
                  value={getIvaPercentuale(formData.iva)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva Prestazione"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
