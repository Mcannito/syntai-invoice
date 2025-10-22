import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Send, Euro, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { InvioCommercialistaDialog } from "@/components/Contabilita/InvioCommercialistaDialog";

const Contabilita = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contabilità</h1>
          <p className="text-muted-foreground">
            Panoramica generale della contabilità e gestione documenti fiscali
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/contabilita/sistema-ts">
              <Send className="h-4 w-4 mr-2" />
              Sistema TS
            </Link>
          </Button>
          <Button asChild>
            <Link to="/contabilita/fatture">
              <FileText className="h-4 w-4 mr-2" />
              Gestione Fatture
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistiche principali */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fatturato Totale</p>
                <p className="text-2xl font-bold">€24.580,00</p>
                <p className="text-xs text-muted-foreground mt-1">Anno corrente</p>
              </div>
              <Euro className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documenti Emessi</p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-success mt-1">+12 questo mese</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Da Inviare TS</p>
                <p className="text-2xl font-bold text-destructive">8</p>
                <p className="text-xs text-muted-foreground mt-1">Fatture sanitarie</p>
              </div>
              <Send className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incassato</p>
                <p className="text-2xl font-bold text-secondary">€18.230,00</p>
                <p className="text-xs text-muted-foreground mt-1">74% del totale</p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiche mensili */}
      <Card className="shadow-medical-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Andamento Mensile</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gennaio</span>
                <span className="font-semibold">€2.450,00</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Febbraio</span>
                <span className="font-semibold">€3.120,00</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Marzo</span>
                <span className="font-semibold">€2.890,00</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Azioni rapide */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-medical-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documenti in Uscita
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Fatture elettroniche</span>
                <span className="font-semibold">45</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Fatture sanitarie</span>
                <span className="font-semibold">98</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">Note di credito</span>
                <span className="font-semibold">13</span>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline" asChild>
              <Link to="/contabilita/fatture">Gestisci Documenti</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-medical-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Scadenze Prossime
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Invio TS Gennaio</p>
                  <p className="text-xs text-muted-foreground">Entro 31/01</p>
                </div>
                <span className="text-xs text-destructive font-medium">5 giorni</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Fattura #2024/045</p>
                  <p className="text-xs text-muted-foreground">Scadenza pagamento</p>
                </div>
                <span className="text-xs text-warning font-medium">10 giorni</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">IVA Trimestrale</p>
                  <p className="text-xs text-muted-foreground">Dichiarazione</p>
                </div>
                <span className="text-xs text-muted-foreground font-medium">45 giorni</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invio Commercialista */}
      <Card className="shadow-medical-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Invio Contabilità al Commercialista
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configura l'invio automatico dei documenti contabili
              </p>
            </div>
            <InvioCommercialistaDialog />
          </div>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs text-muted-foreground">Email Configurata</p>
              <p className="text-sm font-medium">Nessuna</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs text-muted-foreground">Frequenza Invio</p>
              <p className="text-sm font-medium">Non impostata</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs text-muted-foreground">Ultimo Invio</p>
              <p className="text-sm font-medium">Mai</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-1">
              <p className="text-xs text-muted-foreground">Prossimo Invio</p>
              <p className="text-sm font-medium">-</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contabilita;
