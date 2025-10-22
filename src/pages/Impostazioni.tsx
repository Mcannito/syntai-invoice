import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, User, FileText, CreditCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Impostazioni = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground">
          Configura il tuo profilo e le preferenze di fatturazione
        </p>
      </div>

      {/* Anagrafica Professionista */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Anagrafica Professionista</CardTitle>
              <CardDescription>I tuoi dati professionali e fiscali</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome e Cognome *</Label>
              <Input id="nome" placeholder="Dr. Mario Rossi" defaultValue="Dr. Mario Rossi" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifica">Qualifica</Label>
              <Input id="qualifica" placeholder="Medico Chirurgo" defaultValue="Medico Chirurgo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cf">Codice Fiscale *</Label>
              <Input id="cf" placeholder="RSSMRA80A01H501Z" defaultValue="RSSMRA80A01H501Z" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piva">Partita IVA *</Label>
              <Input id="piva" placeholder="12345678901" defaultValue="12345678901" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="indirizzo">Indirizzo Studio</Label>
              <Input id="indirizzo" placeholder="Via Roma, 123" defaultValue="Via Roma, 123" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="citta">Città e CAP</Label>
              <Input id="citta" placeholder="Milano, 20121" defaultValue="Milano, 20121" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input id="telefono" placeholder="+39 02 12345678" defaultValue="+39 02 12345678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="studio@email.it" defaultValue="studio@email.it" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impostazioni Fiscali */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Impostazioni Fiscali</CardTitle>
              <CardDescription>Regime fiscale e cassa previdenziale</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="regime">Regime Fiscale *</Label>
              <Select defaultValue="forfettario">
                <SelectTrigger id="regime">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forfettario">Regime Forfettario</SelectItem>
                  <SelectItem value="ordinario">Regime Ordinario</SelectItem>
                  <SelectItem value="semplificato">Regime Semplificato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cassa">Cassa Previdenziale *</Label>
              <Select defaultValue="enpam">
                <SelectTrigger id="cassa">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enpam">ENPAM</SelectItem>
                  <SelectItem value="enpapi">ENPAPI</SelectItem>
                  <SelectItem value="inps">INPS</SelectItem>
                  <SelectItem value="cassa-forense">Cassa Forense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aliquota-cassa">Aliquota Cassa (%)</Label>
              <Input id="aliquota-cassa" type="number" placeholder="4" defaultValue="4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ritenuta">Ritenuta d'Acconto (%)</Label>
              <Input id="ritenuta" type="number" placeholder="20" defaultValue="20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metodi di Pagamento */}
      <Card className="shadow-medical-sm">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Metodi di Pagamento</CardTitle>
              <CardDescription>Configura i metodi di pagamento predefiniti</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="metodo-default">Metodo Predefinito</Label>
              <Select defaultValue="bonifico">
                <SelectTrigger id="metodo-default">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bonifico">Bonifico Bancario</SelectItem>
                  <SelectItem value="contanti">Contanti</SelectItem>
                  <SelectItem value="pos">POS/Carta</SelectItem>
                  <SelectItem value="assegno">Assegno</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" placeholder="IT00X0000000000000000000000" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Azioni */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Annulla</Button>
        <Button>Salva Modifiche</Button>
      </div>
    </div>
  );
};

export default Impostazioni;
