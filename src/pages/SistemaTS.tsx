import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle, Clock, XCircle, AlertCircle, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
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

  const [fattureTS, setFattureTS] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [filtroStatoTS, setFiltroStatoTS] = useState<string | null>(null);

  const credentialsComplete = credentials.pincode && credentials.password && credentials.codiceFiscale;

  useEffect(() => {
    fetchFattureSanitarie();
  }, []);

  const fetchFattureSanitarie = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fatture')
        .select(`
          *,
          pazienti:paziente_id (
            nome,
            cognome,
            tipo_paziente
          )
        `)
        .eq('pagata', true)
        .order('data', { ascending: false });

      if (error) throw error;

      // Filtra solo fatture verso persone fisiche
      const fattureFiltrate = data?.filter(
        (fattura: any) => fattura.pazienti?.tipo_paziente === 'persona_fisica'
      ) || [];

      setFattureTS(fattureFiltrate);
    } catch (error) {
      console.error('Errore nel caricamento delle fatture:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="grid gap-4 md:grid-cols-5">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md border-primary/20 bg-primary-light",
            filtroStatoTS === null && "ring-2 ring-primary"
          )}
          onClick={() => setFiltroStatoTS(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tutte le Fatture</p>
                <p className="text-2xl font-bold">
                  {fattureTS.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filtroStatoTS === 'da_inviare' && "ring-2 ring-primary"
          )}
          onClick={() => setFiltroStatoTS(filtroStatoTS === 'da_inviare' ? null : 'da_inviare')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Da Inviare</p>
                <p className="text-2xl font-bold text-warning">
                  {fattureTS.filter(f => {
                    const statoTS = f.ts_inviata 
                      ? (f.acube_status === 'accepted' ? 'accettata' : 'inviata')
                      : 'da_inviare';
                    return statoTS === 'da_inviare';
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filtroStatoTS === 'inviata' && "ring-2 ring-primary"
          )}
          onClick={() => setFiltroStatoTS(filtroStatoTS === 'inviata' ? null : 'inviata')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inviate</p>
                <p className="text-2xl font-bold text-blue-500">
                  {fattureTS.filter(f => {
                    const statoTS = f.ts_inviata 
                      ? (f.acube_status === 'accepted' ? 'accettata' : 'inviata')
                      : 'da_inviare';
                    return statoTS === 'inviata';
                  }).length}
                </p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filtroStatoTS === 'accettata' && "ring-2 ring-primary"
          )}
          onClick={() => setFiltroStatoTS(filtroStatoTS === 'accettata' ? null : 'accettata')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accettate</p>
                <p className="text-2xl font-bold text-secondary">
                  {fattureTS.filter(f => {
                    const statoTS = f.ts_inviata 
                      ? (f.acube_status === 'accepted' ? 'accettata' : 'inviata')
                      : 'da_inviare';
                    return statoTS === 'accettata';
                  }).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filtroStatoTS === 'errore' && "ring-2 ring-primary"
          )}
          onClick={() => setFiltroStatoTS(filtroStatoTS === 'errore' ? null : 'errore')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errori</p>
                <p className="text-2xl font-bold text-destructive">
                  {fattureTS.filter(f => f.acube_error).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert per credenziali */}
      {!credentialsComplete && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Credenziali mancanti</AlertTitle>
          <AlertDescription>
            Configura le credenziali del Sistema TS per poter inviare le fatture sanitarie.
            <Button
              variant="link"
              size="sm"
              className="px-1 h-auto text-destructive underline"
              onClick={() => setShowCredentials(true)}
            >
              Configura ora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Configurazione credenziali */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Credenziali Sistema TS</CardTitle>
              {credentialsComplete ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configurate
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Da Configurare
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCredentials(!showCredentials)}
            >
              {showCredentials ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Nascondi
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Mostra
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {showCredentials && (
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
        )}
      </Card>

      {/* Tabella fatture */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle>Stato Invii Fatture Sanitarie</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : fattureTS.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessuna fattura sanitaria pagata trovata</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Paziente</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                  <TableHead>Stato TS</TableHead>
                  <TableHead>Data Invio</TableHead>
                  <TableHead>Protocollo TS</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fattureTS
                  .filter(f => {
                    if (!filtroStatoTS) return true;
                    const statoTS = f.ts_inviata 
                      ? (f.acube_status === 'accepted' ? 'accettata' : 'inviata')
                      : 'da_inviare';
                    if (filtroStatoTS === 'errore') return f.acube_error;
                    return statoTS === filtroStatoTS;
                  })
                  .map((fattura) => {
                  const statoTS = fattura.ts_inviata 
                    ? (fattura.acube_status === 'accepted' ? 'accettata' : 'inviata')
                    : 'da_inviare';
                  
                  return (
                    <TableRow key={fattura.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-medium">{fattura.numero}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(fattura.data).toLocaleDateString('it-IT')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {fattura.pazienti?.nome} {fattura.pazienti?.cognome}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        €{fattura.totale?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>{getStatoBadge(statoTS)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fattura.invio_data ? new Date(fattura.invio_data).toLocaleDateString('it-IT') : '-'}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {fattura.acube_id || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!fattura.ts_inviata && (
                            <Button variant="ghost" size="sm" className="text-primary">
                              <Send className="h-4 w-4 mr-1" />
                              Invia
                            </Button>
                          )}
                          {fattura.acube_error && (
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Dettagli
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SistemaTS;
