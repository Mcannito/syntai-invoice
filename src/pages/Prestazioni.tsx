import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Stethoscope } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NuovaPrestazioneDialog } from "@/components/Prestazioni/NuovaPrestazioneDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Prestazioni = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [prestazioni, setPrestazioni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPrestazioni = async () => {
    try {
      const { data, error } = await supabase
        .from("prestazioni")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrestazioni(data || []);
    } catch (error) {
      console.error("Error loading prestazioni:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le prestazioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrestazioni();
  }, []);

  const filteredPrestazioni = prestazioni.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codice.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const prezzoMedio = prestazioni.length > 0 
    ? Math.round(prestazioni.reduce((acc, p) => acc + parseFloat(p.prezzo), 0) / prestazioni.length)
    : 0;

  const categorie = [...new Set(prestazioni.map(p => p.categoria))].length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prestazioni</h1>
          <p className="text-muted-foreground">
            Gestisci le prestazioni sanitarie del tuo studio
          </p>
        </div>
        <NuovaPrestazioneDialog onPrestazioneAdded={loadPrestazioni} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-primary-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Prestazioni</p>
                <p className="text-2xl font-bold">{prestazioni.length}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prezzo Medio</p>
                <p className="text-2xl font-bold">€{prezzoMedio}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categorie</p>
                <p className="text-2xl font-bold">{categorie}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Elenco Prestazioni</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca prestazione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>IVA</TableHead>
                <TableHead className="text-right">Prezzo</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Caricamento...
                  </TableCell>
                </TableRow>
              ) : filteredPrestazioni.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nessuna prestazione trovata
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrestazioni.map((prestazione) => (
                <TableRow key={prestazione.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{prestazione.codice}</TableCell>
                  <TableCell className="font-medium">{prestazione.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{prestazione.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{prestazione.iva}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    €{prestazione.prezzo}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prestazioni;
