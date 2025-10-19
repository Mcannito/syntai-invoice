import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Eye, Users, Building2, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NuovoPazienteDialog } from "@/components/Pazienti/NuovoPazienteDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Pazienti = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pazienti, setPazienti] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPazienti = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pazienti")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore caricamento pazienti:", error);
    } else {
      setPazienti(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPazienti();
  }, []);

  // Mock data for initial display
  const mockPazienti = [
    {
      id: 1,
      nome: "Mario Rossi",
      cf: "RSSMRA80A01H501Z",
      email: "mario.rossi@email.it",
      telefono: "+39 333 1234567",
      tipo: "Persona Fisica",
      ultimaVisita: "15/01/2025",
    },
    {
      id: 2,
      nome: "Anna Bianchi",
      cf: "BNCNNA85D45F205X",
      email: "anna.bianchi@email.it",
      telefono: "+39 333 2345678",
      tipo: "Persona Fisica",
      ultimaVisita: "14/01/2025",
    },
    {
      id: 3,
      nome: "Studio Medico Associato",
      piva: "12345678901",
      email: "info@studiomedico.it",
      telefono: "+39 02 12345678",
      tipo: "Persona Giuridica",
      ultimaVisita: "13/01/2025",
    },
    {
      id: 4,
      nome: "Giuseppe Verdi",
      cf: "VRDGPP75T15L219K",
      email: "giuseppe.verdi@email.it",
      telefono: "+39 333 3456789",
      tipo: "Persona Fisica",
      ultimaVisita: "12/01/2025",
    },
    {
      id: 5,
      nome: "Laura Neri",
      cf: "NRELRA90M50D612T",
      email: "laura.neri@email.it",
      telefono: "+39 333 4567890",
      tipo: "Persona Fisica",
      ultimaVisita: "11/01/2025",
    },
  ];

  const displayPazienti = pazienti.length > 0 ? pazienti : mockPazienti;

  const filteredPazienti = displayPazienti.filter(p => {
    const nomeCompleto = p.ragione_sociale || `${p.nome} ${p.cognome || ""}`;
    return (
      nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.codice_fiscale && p.codice_fiscale.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.partita_iva && p.partita_iva.includes(searchTerm))
    );
  });

  const personeFisiche = displayPazienti.filter(p => 
    p.tipo_paziente === "persona_fisica" || p.tipo === "Persona Fisica"
  ).length;
  const personeGiuridiche = displayPazienti.filter(p => 
    p.tipo_paziente === "persona_giuridica" || p.tipo === "Persona Giuridica"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pazienti</h1>
          <p className="text-muted-foreground">
            Gestisci l'anagrafica dei tuoi pazienti
          </p>
        </div>
        <NuovoPazienteDialog onPazienteCreated={fetchPazienti} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-primary-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Pazienti</p>
                <p className="text-2xl font-bold">{pazienti.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Persone Fisiche</p>
                <p className="text-2xl font-bold">{personeFisiche}</p>
              </div>
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Persone Giuridiche</p>
                <p className="text-2xl font-bold">{personeGiuridiche}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Elenco Pazienti</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca paziente..."
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
                <TableHead>Nome / Ragione Sociale</TableHead>
                <TableHead>CF / P.IVA</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead>Ultima Visita</TableHead>
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
              ) : filteredPazienti.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nessun paziente trovato
                  </TableCell>
                </TableRow>
              ) : (
                filteredPazienti.map((paziente) => {
                  const nomeCompleto = paziente.ragione_sociale || `${paziente.nome} ${paziente.cognome || ""}`;
                  const cfPiva = paziente.codice_fiscale || paziente.partita_iva || paziente.cf || paziente.piva;
                  const tipo = paziente.tipo_paziente === "persona_fisica" || paziente.tipo === "Persona Fisica" 
                    ? "Persona Fisica" 
                    : "Persona Giuridica";
                  const ultimaVisita = paziente.ultimaVisita || new Date(paziente.created_at).toLocaleDateString('it-IT');

                  return (
                    <TableRow key={paziente.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{nomeCompleto}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {cfPiva}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={tipo === "Persona Fisica" ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {tipo === "Persona Fisica" ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <Building2 className="h-3 w-3" />
                          )}
                          {tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">{paziente.email}</p>
                          <p className="text-xs text-muted-foreground">{paziente.telefono}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ultimaVisita}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pazienti;
