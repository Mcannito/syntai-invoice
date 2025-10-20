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
    iva: "Esente IVA Art.10",
    categoria: "",
  });

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
        iva: "Esente IVA Art.10",
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
                  <SelectItem value="Esente IVA Art.10">Esente IVA Art.10</SelectItem>
                  <SelectItem value="IVA 22%">IVA 22%</SelectItem>
                  <SelectItem value="IVA 10%">IVA 10%</SelectItem>
                  <SelectItem value="IVA 4%">IVA 4%</SelectItem>
                </SelectContent>
              </Select>
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
