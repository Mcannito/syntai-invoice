import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Fattura {
  id: string;
  numero: string;
  data: string;
  tipo_documento: string;
  importo: number;
  totale: number;
  stato: string;
  pagata: boolean;
  pdf_path: string | null;
}

interface FattureDrawerProps {
  pazienteId: string | null;
  pazienteNome: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FattureDrawer({ 
  pazienteId, 
  pazienteNome, 
  open, 
  onOpenChange 
}: FattureDrawerProps) {
  const [fatture, setFatture] = useState<Fattura[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (open && pazienteId) {
      loadFatture();
    }
  }, [open, pazienteId]);

  const loadFatture = async () => {
    if (!pazienteId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fatture")
        .select("id, numero, data, tipo_documento, importo, totale, stato, pagata, pdf_path")
        .eq("paziente_id", pazienteId)
        .order("data", { ascending: false });

      if (error) throw error;
      setFatture(data || []);
    } catch (error: any) {
      console.error("Errore caricamento fatture:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le fatture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTipoDocumentoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      fattura: "Fattura",
      fattura_sanitaria: "Fattura Sanitaria",
      fattura_elettronica_pg: "Fattura Elettronica PG",
      nota_credito: "Nota di Credito",
      preventivo: "Preventivo"
    };
    return labels[tipo] || tipo;
  };

  const getStatoBadge = (stato: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      "Da Inviare": { variant: "outline", label: "Da Inviare" },
      "Inviata": { variant: "default", label: "Inviata" },
      "Pagata": { variant: "secondary", label: "Pagata" },
      "Annullata": { variant: "destructive", label: "Annullata" }
    };
    const config = variants[stato] || { variant: "outline", label: stato };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleViewFattura = (fatturaId: string) => {
    onOpenChange(false);
    navigate(`/fatture?id=${fatturaId}`);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">Documenti Fiscali di {pazienteNome}</DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Elenco completo delle fatture e documenti fiscali
              </p>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Caricamento...
            </div>
          ) : fatture.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nessuna fattura trovata</p>
              <p className="text-sm text-muted-foreground mt-2">
                Non ci sono documenti fiscali per questo paziente
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {fatture.map((fattura) => (
                <Card key={fattura.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{fattura.numero}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {getTipoDocumentoBadge(fattura.tipo_documento)}
                        </Badge>
                        {getStatoBadge(fattura.stato)}
                        {fattura.pagata && (
                          <Badge variant="default" className="bg-green-600">
                            Pagata
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Data emissione</p>
                          <p className="font-medium">
                            {new Date(fattura.data).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Importo totale</p>
                          <p className="font-semibold text-lg">
                            € {Number(fattura.totale).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFattura(fattura.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizza
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
