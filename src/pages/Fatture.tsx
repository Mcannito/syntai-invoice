import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Download, Send, FileText } from "lucide-react";
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

  // Mock data
  const fatture = [
    {
      id: 1,
      numero: "2025/001",
      data: "15/01/2025",
      paziente: "Mario Rossi",
      tipo: "Persona Fisica",
      importo: 120,
      stato: "Inviata TS",
      metodoPagamento: "Bonifico",
    },
    {
      id: 2,
      numero: "2025/002",
      data: "14/01/2025",
      paziente: "Studio Medico Associato",
      tipo: "Persona Giuridica",
      importo: 350,
      stato: "Inviata SDI",
      metodoPagamento: "Bonifico",
    },
    {
      id: 3,
      numero: "2025/003",
      data: "14/01/2025",
      paziente: "Anna Bianchi",
      tipo: "Persona Fisica",
      importo: 150,
      stato: "Da Inviare",
      metodoPagamento: "Contanti",
    },
    {
      id: 4,
      numero: "2025/004",
      data: "13/01/2025",
      paziente: "Giuseppe Verdi",
      tipo: "Persona Fisica",
      importo: 200,
      stato: "Da Inviare",
      metodoPagamento: "POS",
    },
    {
      id: 5,
      numero: "2025/005",
      data: "12/01/2025",
      paziente: "Laura Neri",
      tipo: "Persona Fisica",
      importo: 80,
      stato: "Pagata",
      metodoPagamento: "Bonifico",
    },
  ];

  const filteredFatture = fatture.filter(f =>
    f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.paziente.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuova Fattura
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-primary-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totale Fatturato</p>
                <p className="text-2xl font-bold">€{fatture.reduce((sum, f) => sum + f.importo, 0)}</p>
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
              {filteredFatture.map((fattura) => (
                <TableRow key={fattura.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-medium">{fattura.numero}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fattura.data}</TableCell>
                  <TableCell className="font-medium">{fattura.paziente}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {fattura.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fattura.metodoPagamento}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    €{fattura.importo}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fatture;
