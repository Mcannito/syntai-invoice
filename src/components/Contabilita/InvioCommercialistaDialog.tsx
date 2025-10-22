import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Send } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface InvioCommercialistaDialogProps {
  trigger?: React.ReactNode;
}

export const InvioCommercialistaDialog = ({ trigger }: InvioCommercialistaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [frequenza, setFrequenza] = useState<string>("");
  const [dataInizio, setDataInizio] = useState<Date>();
  const [dataFine, setDataFine] = useState<Date>();
  const [tipiDocumento, setTipiDocumento] = useState<string[]>([]);
  const { toast } = useToast();

  const documentiDisponibili = [
    { id: "fatture", label: "Fatture" },
    { id: "note_credito", label: "Note di Credito" },
    { id: "spese", label: "Spese" },
    { id: "corrispettivi", label: "Corrispettivi" },
  ];

  const handleTipoDocumentoChange = (tipo: string, checked: boolean) => {
    if (checked) {
      setTipiDocumento([...tipiDocumento, tipo]);
    } else {
      setTipiDocumento(tipiDocumento.filter((t) => t !== tipo));
    }
  };

  const handleSubmit = () => {
    if (!email) {
      toast({
        title: "Errore",
        description: "Inserisci l'email del commercialista",
        variant: "destructive",
      });
      return;
    }

    if (tipiDocumento.length === 0) {
      toast({
        title: "Errore",
        description: "Seleziona almeno un tipo di documento",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implementare logica di invio/programmazione
    toast({
      title: "Invio Programmato",
      description: `Documenti verranno inviati a ${email}`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Invia al Commercialista
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invio Contabilità al Commercialista</DialogTitle>
          <DialogDescription>
            Configura l'invio periodico dei documenti contabili al tuo commercialista
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Commercialista *</Label>
            <Input
              id="email"
              type="email"
              placeholder="commercialista@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Frequenza invio */}
          <div className="space-y-2">
            <Label htmlFor="frequenza">Frequenza Invio</Label>
            <Select value={frequenza} onValueChange={setFrequenza}>
              <SelectTrigger id="frequenza">
                <SelectValue placeholder="Seleziona frequenza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manuale">Invio Manuale (Solo Ora)</SelectItem>
                <SelectItem value="settimanale">Settimanale</SelectItem>
                <SelectItem value="mensile">Mensile</SelectItem>
                <SelectItem value="trimestrale">Trimestrale</SelectItem>
              </SelectContent>
            </Select>
            {frequenza && frequenza !== "manuale" && (
              <p className="text-xs text-muted-foreground">
                I documenti verranno inviati automaticamente ogni {frequenza === "settimanale" ? "lunedì" : "primo del mese"}
              </p>
            )}
          </div>

          {/* Filtro date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inizio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInizio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInizio ? format(dataInizio, "PPP", { locale: it }) : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataInizio}
                    onSelect={setDataInizio}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Fine</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFine && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFine ? format(dataFine, "PPP", { locale: it }) : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataFine}
                    onSelect={setDataFine}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tipi documento */}
          <div className="space-y-3">
            <Label>Tipi di Documento da Inviare *</Label>
            <div className="space-y-2">
              {documentiDisponibili.map((doc) => (
                <div key={doc.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={doc.id}
                    checked={tipiDocumento.includes(doc.id)}
                    onCheckedChange={(checked) =>
                      handleTipoDocumentoChange(doc.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={doc.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {doc.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Riepilogo */}
          {tipiDocumento.length > 0 && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Riepilogo Invio:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {tipiDocumento.length} tipo/i di documento selezionati</li>
                {dataInizio && dataFine && (
                  <li>
                    • Periodo: {format(dataInizio, "dd/MM/yyyy")} - {format(dataFine, "dd/MM/yyyy")}
                  </li>
                )}
                {frequenza && frequenza !== "manuale" && (
                  <li>• Invio automatico: {frequenza}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            {frequenza === "manuale" ? "Invia Ora" : "Programma Invio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
