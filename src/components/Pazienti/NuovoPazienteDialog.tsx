import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface NuovoPazienteDialogProps {
  onPazienteCreated: () => void;
}

export const NuovoPazienteDialog = ({ onPazienteCreated }: NuovoPazienteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipoPaziente, setTipoPaziente] = useState<"persona_fisica" | "persona_giuridica">("persona_fisica");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      tipo_paziente: tipoPaziente,
      email: formData.get("email") as string || null,
      telefono: formData.get("telefono") as string || null,
      indirizzo: formData.get("indirizzo") as string || null,
      citta: formData.get("citta") as string || null,
      cap: formData.get("cap") as string || null,
      provincia: formData.get("provincia") as string || null,
    };

    if (tipoPaziente === "persona_fisica") {
      data.nome = formData.get("nome") as string;
      data.cognome = formData.get("cognome") as string;
      data.codice_fiscale = formData.get("codice_fiscale") as string;
    } else {
      data.nome = formData.get("ragione_sociale") as string;
      data.ragione_sociale = formData.get("ragione_sociale") as string;
      data.partita_iva = formData.get("partita_iva") as string;
      data.pec = formData.get("pec") as string || null;
      data.codice_destinatario = formData.get("codice_destinatario") as string || null;
    }

    const { error } = await supabase.from("pazienti").insert([data]);

    if (error) {
      toast.error("Errore durante la creazione del paziente");
      console.error(error);
    } else {
      toast.success("Paziente creato con successo");
      setOpen(false);
      e.currentTarget.reset();
      onPazienteCreated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuovo Paziente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo Paziente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo Paziente */}
          <div className="space-y-3">
            <Label>Tipo Paziente *</Label>
            <RadioGroup
              value={tipoPaziente}
              onValueChange={(value: any) => setTipoPaziente(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="persona_fisica" id="persona_fisica" />
                <Label htmlFor="persona_fisica" className="cursor-pointer">
                  Persona Fisica
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="persona_giuridica" id="persona_giuridica" />
                <Label htmlFor="persona_giuridica" className="cursor-pointer">
                  Persona Giuridica
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Campi Persona Fisica */}
          {tipoPaziente === "persona_fisica" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" name="nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognome">Cognome *</Label>
                  <Input id="cognome" name="cognome" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="codice_fiscale">Codice Fiscale *</Label>
                <Input 
                  id="codice_fiscale" 
                  name="codice_fiscale" 
                  maxLength={16}
                  className="uppercase"
                  required 
                />
              </div>
            </div>
          )}

          {/* Campi Persona Giuridica */}
          {tipoPaziente === "persona_giuridica" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ragione_sociale">Ragione Sociale *</Label>
                <Input id="ragione_sociale" name="ragione_sociale" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partita_iva">Partita IVA *</Label>
                <Input 
                  id="partita_iva" 
                  name="partita_iva" 
                  maxLength={11}
                  required 
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pec">PEC</Label>
                  <Input id="pec" name="pec" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codice_destinatario">Codice Destinatario</Label>
                  <Input 
                    id="codice_destinatario" 
                    name="codice_destinatario" 
                    maxLength={7}
                    className="uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Campi Comuni */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Contatti</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" name="telefono" />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Indirizzo</h4>
            <div className="space-y-2">
              <Label htmlFor="indirizzo">Via e Numero</Label>
              <Input id="indirizzo" name="indirizzo" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="citta">Città</Label>
                <Input id="citta" name="citta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cap">CAP</Label>
                <Input id="cap" name="cap" maxLength={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provincia">Provincia</Label>
                <Input 
                  id="provincia" 
                  name="provincia" 
                  maxLength={2}
                  className="uppercase"
                />
              </div>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex justify-end gap-4 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creazione..." : "Crea Paziente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
