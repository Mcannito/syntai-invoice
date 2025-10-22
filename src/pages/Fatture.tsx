import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Eye, Download, Send, FileText, Upload, RefreshCw, CheckCircle, CalendarIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Fatture = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [fatture, setFatture] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [fatturaToConvert, setFatturaToConvert] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [fatturaToMarkPaid, setFatturaToMarkPaid] = useState<any>(null);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
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

  const getTipoDocumentoBadge = (tipo: string) => {
    switch (tipo) {
      case "fattura_sanitaria":
        return <Badge className="bg-green-500 text-white">🏥 Sanitaria</Badge>;
      case "fattura_elettronica_pg":
        return <Badge className="bg-blue-500 text-white">📄 B2B</Badge>;
      case "fattura_elettronica_pa":
        return <Badge className="bg-cyan-500 text-white">🏛️ PA</Badge>;
      case "fattura_proforma":
        return <Badge className="bg-yellow-500 text-white">📋 Pro Forma</Badge>;
      case "preventivo":
        return <Badge className="bg-orange-500 text-white">📝 Preventivo</Badge>;
      case "nota_credito":
        return <Badge className="bg-red-500 text-white">↩️ Nota Credito</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  const handleSendTS = async (fatturaId: string) => {
    setSendingId(fatturaId);
    try {
      const { data, error } = await supabase.functions.invoke('acube-send-ts', {
        body: { fattura_id: fatturaId }
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: data.message || "Fattura inviata al Sistema TS",
      });
      loadFatture();
    } catch (error: any) {
      console.error('Error sending to TS:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare la fattura al Sistema TS",
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleSendSDI = async (fatturaId: string) => {
    setSendingId(fatturaId);
    try {
      const { data, error } = await supabase.functions.invoke('acube-send-sdi', {
        body: { fattura_id: fatturaId }
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: data.message || "Fattura inviata al Sistema di Interscambio",
      });
      loadFatture();
    } catch (error: any) {
      console.error('Error sending to SDI:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare la fattura al SDI",
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleConvert = (fattura: any) => {
    setFatturaToConvert(fattura);
    setConvertDialogOpen(true);
  };

  const confirmConvert = async () => {
    if (!fatturaToConvert) return;

    const tipoDestinazione = fatturaToConvert.pazienti?.tipo_paziente === "persona_fisica" 
      ? "fattura_sanitaria" 
      : "fattura_elettronica_pg";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('fattura-convert', {
        body: { 
          documento_id: fatturaToConvert.id,
          tipo_destinazione: tipoDestinazione
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: `Documento convertito in ${data.numero}`,
      });
      loadFatture();
      setConvertDialogOpen(false);
      setFatturaToConvert(null);
    } catch (error: any) {
      console.error('Error converting:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile convertire il documento",
        variant: "destructive",
      });
    }
  };

  const openPaymentDialog = (fattura: any) => {
    setFatturaToMarkPaid(fattura);
    setPaymentDate(new Date());
    setPaymentDialogOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!fatturaToMarkPaid || !paymentDate) return;

    try {
      const { error } = await supabase
        .from('fatture')
        .update({ 
          pagata: true, 
          data_pagamento: format(paymentDate, 'yyyy-MM-dd')
        })
        .eq('id', fatturaToMarkPaid.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Fattura segnata come pagata",
      });
      loadFatture();
      setPaymentDialogOpen(false);
      setFatturaToMarkPaid(null);
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato del pagamento",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Fatture</h1>
          <p className="text-muted-foreground">
            Documenti in uscita e in entrata
          </p>
        </div>
        <NuovaFatturaDialog onFatturaAdded={loadFatture} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="uscita" className="space-y-4">
        <TabsList>
          <TabsTrigger value="uscita">Documenti in Uscita</TabsTrigger>
          <TabsTrigger value="entrata">Documenti in Entrata</TabsTrigger>
        </TabsList>

        <TabsContent value="uscita" className="space-y-4">
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

          {/* Table */}
          <Card className="shadow-medical-sm">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Documenti Emessi</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cerca documento..."
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
                <TableHead>Tipo Documento</TableHead>
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
                    <TableCell>{getTipoDocumentoBadge(fattura.tipo_documento)}</TableCell>
                    <TableCell>
                      {fattura.pagata ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Pagata
                        </Badge>
                      ) : (
                        <Badge variant="outline">Non pagata</Badge>
                      )}
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
                        {!fattura.pagata && fattura.tipo_documento !== 'preventivo' && fattura.tipo_documento !== 'fattura_proforma' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => openPaymentDialog(fattura)}
                            title="Segna come pagata"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {(fattura.tipo_documento === 'preventivo' || fattura.tipo_documento === 'fattura_proforma') && !fattura.convertita_in_id && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-orange-500"
                            onClick={() => handleConvert(fattura)}
                            title="Converti in fattura"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        {fattura.stato === "Da Inviare" && fattura.tipo_documento === "fattura_sanitaria" && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => handleSendTS(fattura.id)}
                            disabled={sendingId === fattura.id}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {fattura.stato === "Da Inviare" && (fattura.tipo_documento === "fattura_elettronica_pg" || fattura.tipo_documento === "fattura_elettronica_pa") && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-primary"
                            onClick={() => handleSendSDI(fattura.id)}
                            disabled={sendingId === fattura.id}
                          >
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
        </TabsContent>

        <TabsContent value="entrata" className="space-y-4">
          <Card className="shadow-medical-sm">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex items-center justify-between gap-4">
                <CardTitle>Documenti Ricevuti</CardTitle>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Carica Fattura
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Nessun documento ricevuto</p>
                <p className="text-sm">Carica le fatture elettroniche ricevute o inserisci manualmente le spese</p>
                <div className="flex gap-2 justify-center mt-6">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Carica XML
                  </Button>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Inserisci Manualmente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Convert Dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converti Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi convertire {fatturaToConvert?.tipo_documento === 'preventivo' ? 'il preventivo' : 'la fattura pro forma'} {fatturaToConvert?.numero} in una fattura definitiva?
              <br /><br />
              Verrà creata una nuova fattura con un nuovo numero progressivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConvert}>Converti</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <AlertDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Segna come Pagata</AlertDialogTitle>
            <AlertDialogDescription>
              Inserisci la data di pagamento per la fattura {fatturaToMarkPaid?.numero}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="payment-date" className="mb-2 block">Data Pagamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: it }) : <span>Seleziona data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMarkAsPaid} disabled={!paymentDate}>
              Conferma Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Fatture;
