import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SistemaTS = () => {
  const [credentials, setCredentials] = useState({
    pincode: "",
    password: "",
    codiceFiscale: "",
    codiceProprietario: "",
  });

  // Mock data per le fatture inviate al TS
  const fattureTS = [
    {
      id: 1,
      numero: "2024/001",
      data: "2024-01-15",
      paziente: "Mario Rossi",
      importo: 150.00,
      stato: "inviata",
      dataInvio: "2024-01-16",
      protocollo: "TS2024001234"
    },
    {
      id: 2,
      numero: "2024/002",
      data: "2024-01-18",
      paziente: "Laura Bianchi",
      importo: 200.00,
      stato: "accettata",
      dataInvio: "2024-01-19",
      protocollo: "TS2024001235"
    },
    {
      id: 3,
      numero: "2024/003",
      data: "2024-01-20",
      paziente: "Giuseppe Verdi",
      importo: 120.00,
      stato: "da_inviare",
      dataInvio: null,
      protocollo: null
    },
    {
      id: 4,
      numero: "2024/004",
      data: "2024-01-22",
      paziente: "Anna Neri",
      importo: 180.00,
      stato: "errore",
      dataInvio: "2024-01-23",
      protocollo: null
    },
  ];

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case "inviata":
        return (
          <Badge className="bg-blue-500 text-white">
            <Send className="h-3 w-3 mr-1" />
            Inviata
          </Badge>
        );
      case "accettata":
        return (
          <Badge className="bg-secondary text-secondary-foreground">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accettata
          </Badge>
        );
      case "da_inviare":
        return (
          <Badge variant="outline" className="border-warning text-warning">
            <Clock className="h-3 w-3 mr-1" />
            Da Inviare
          </Badge>
        );
      case "errore":
        return (
          <Badge variant="outline" className="border-destructive text-destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Errore
          </Badge>
        );
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  const handleSave = () => {
    console.log("Salvataggio credenziali TS:", credentials);
  };

  const handleInvioMassivo = () => {
    console.log("Invio massivo al Sistema TS");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistema Tessera Sanitaria</h1>
          <p className="text-muted-foreground">
            Configurazione e gestione invii al Sistema TS
          </p>
        </div>
        <Button className="gap-2" onClick={handleInvioMassivo}>
          <Send className="h-4 w-4" />
          Invio Massivo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Da Inviare</p>
                <p className="text-2xl font-bold text-warning">
                  {fattureTS.filter(f => f.stato === "da_inviare").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inviate</p>
                <p className="text-2xl font-bold text-blue-500">
                  {fattureTS.filter(f => f.stato === "inviata").length}
                </p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accettate</p>
                <p className="text-2xl font-bold text-secondary">
                  {fattureTS.filter(f => f.stato === "accettata").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errori</p>
                <p className="text-2xl font-bold text-destructive">
                  {fattureTS.filter(f => f.stato === "errore").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurazione credenziali */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>Credenziali Sistema TS</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Informazioni importanti</p>
                <p>Le credenziali sono necessarie per l'invio automatico delle fatture sanitarie al Sistema TS. Assicurati di inserire i dati corretti forniti dal Sistema Tessera Sanitaria.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  type="password"
                  placeholder="Inserisci il pincode"
                  value={credentials.pincode}
                  onChange={(e) => setCredentials({ ...credentials, pincode: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Inserisci la password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codiceFiscale">Codice Fiscale Professionista</Label>
                <Input
                  id="codiceFiscale"
                  placeholder="Inserisci il codice fiscale"
                  value={credentials.codiceFiscale}
                  onChange={(e) => setCredentials({ ...credentials, codiceFiscale: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codiceProprietario">
                  Codice Proprietario <span className="text-muted-foreground text-xs">(opzionale)</span>
                </Label>
                <Input
                  id="codiceProprietario"
                  placeholder="XXX-YYY-ZZZZZZ"
                  value={credentials.codiceProprietario}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    // Permette solo caratteri alfanumerici e trattini
                    if (value === "" || /^[A-Z0-9-]*$/.test(value)) {
                      setCredentials({ ...credentials, codiceProprietario: value });
                    }
                  }}
                  maxLength={14}
                />
                {credentials.codiceProprietario && !/^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{6}$/.test(credentials.codiceProprietario) && (
                  <p className="text-xs text-destructive">Formato richiesto: XXX-YYY-ZZZZZZ</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Annulla</Button>
              <Button onClick={handleSave}>Salva Credenziali</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabella fatture */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>Stato Invii Fatture Sanitarie</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Paziente</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Data Invio</TableHead>
                <TableHead>Protocollo TS</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fattureTS.map((fattura) => (
                <TableRow key={fattura.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-medium">{fattura.numero}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(fattura.data).toLocaleDateString('it-IT')}
                  </TableCell>
                  <TableCell className="font-medium">{fattura.paziente}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    €{fattura.importo.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatoBadge(fattura.stato)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fattura.dataInvio ? new Date(fattura.dataInvio).toLocaleDateString('it-IT') : '-'}
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {fattura.protocollo || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {fattura.stato === "da_inviare" && (
                        <Button variant="ghost" size="sm" className="text-primary">
                          <Send className="h-4 w-4 mr-1" />
                          Invia
                        </Button>
                      )}
                      {fattura.stato === "errore" && (
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Dettagli
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

export default SistemaTS;
