import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Download, Send, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NuovaFatturaDialog } from "@/components/Fatture/NuovaFatturaDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Fatture = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fatture, setFatture] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFatture = async () => {
    try {
      const { data, error } = await supabase
        .from("fatture")
        .select(`
          *,
          pazienti (nome, cognome, ragione_sociale, tipo_paziente),
          fatture_dettagli (*)
        `)
        .order("data", { ascending: false });

      if (error) throw error;
      setFatture(data || []);
    } catch (error) {
      console.error("Error loading fatture:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le fatture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFatture();
  }, []);

  const getPazienteDisplayName = (fattura: any) => {
    if (!fattura.pazienti) return "N/A";
    if (fattura.pazienti.tipo_paziente === "persona_fisica") {
      return `${fattura.pazienti.nome} ${fattura.pazienti.cognome || ""}`.trim();
    }
    return fattura.pazienti.ragione_sociale || fattura.pazienti.nome;
  };

  const filteredFatture = fatture.filter(f => {
    const searchLower = searchTerm.toLowerCase();
    const pazienteNome = getPazienteDisplayName(f).toLowerCase();
    return f.numero.toLowerCase().includes(searchLower) || pazienteNome.includes(searchLower);
  });

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case "Inviata TS":
        return <Badge className="bg-secondary text-secondary-foreground">Inviata TS</Badge>;
      case "Inviata SDI":
        return <Badge className="bg-primary text-primary-foreground">Inviata SDI</Badge>;
      case "Da Inviare":
        return <Badge variant="outline" className="border-destructive text-destructive">Da Inviare</Badge>;
      case "Pagata":
        return <Badge variant="outline" className="border-secondary text-secondary">Pagata</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fatture</h1>
          <p className="text-muted-foreground">
            Gestisci le fatture e i documenti fiscali
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            Invio Massivo TS
          </Button>
          <NuovaFatturaDialog onFatturaAdded={loadFatture} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-primary-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Fatturato</p>
                <p className="text-2xl font-bold">€{fatture.reduce((sum, f) => sum + (f.totale || f.importo), 0).toFixed(2)}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fatture Emesse</p>
              <p className="text-2xl font-bold">{fatture.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Da Inviare</p>
              <p className="text-2xl font-bold text-destructive">
                {fatture.filter(f => f.stato === "Da Inviare").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inviate</p>
              <p className="text-2xl font-bold text-secondary">
                {fatture.filter(f => f.stato.includes("Inviata")).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Elenco Fatture</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca fattura..."
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
                <TableHead>Numero</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Paziente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Caricamento...
                  </TableCell>
                </TableRow>
              ) : filteredFatture.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nessuna fattura trovata
                  </TableCell>
                </TableRow>
              ) : (
                filteredFatture.map((fattura) => (
                  <TableRow key={fattura.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-medium">{fattura.numero}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(fattura.data).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell className="font-medium">{getPazienteDisplayName(fattura)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {fattura.pazienti?.tipo_paziente === "persona_fisica" 
                          ? "Persona Fisica" 
                          : "Persona Giuridica"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fattura.metodo_pagamento}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      €{Number(fattura.totale || fattura.importo).toFixed(2)}
                    </TableCell>
                  <TableCell>{getStatoBadge(fattura.stato)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      {fattura.stato === "Da Inviare" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fatture;
