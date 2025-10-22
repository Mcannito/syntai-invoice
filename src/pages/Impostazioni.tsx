import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Upload, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Impostazioni = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings(data);
        if (data.logo_path) {
          const { data: publicUrl } = supabase.storage
            .from("logos")
            .getPublicUrl(data.logo_path);
          setLogo(publicUrl.publicUrl);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Valida tipo file
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Errore",
          description: "Carica un'immagine valida",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Elimina il vecchio logo se esiste
      if (settings?.logo_path) {
        await supabase.storage.from("logos").remove([settings.logo_path]);
      }

      // Upload nuovo logo
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Salva il path nel database
      const { error: dbError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          logo_path: filePath,
        });

      if (dbError) throw dbError;

      // Ricarica le impostazioni
      await loadSettings();

      toast({
        title: "Successo",
        description: "Logo caricato con successo",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare il logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      if (!settings?.logo_path) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Elimina il file
      await supabase.storage.from("logos").remove([settings.logo_path]);

      // Aggiorna il database
      await supabase
        .from("user_settings")
        .update({ logo_path: null })
        .eq("user_id", user.id);

      setLogo(null);
      setSettings({ ...settings, logo_path: null });

      toast({
        title: "Successo",
        description: "Logo rimosso con successo",
      });
    } catch (error) {
      console.error("Error removing logo:", error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere il logo",
        variant: "destructive",
      });
    }
  };

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
          {/* Logo */}
          <div className="space-y-4">
            <div>
              <Label>Logo Studio</Label>
              <p className="text-sm text-muted-foreground">
                Verrà utilizzato per personalizzare fatture e documenti
              </p>
            </div>
            <div className="flex items-center gap-4">
              {logo ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Cambia Logo
                        </span>
                      </Button>
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Rimuovi
                    </Button>
                  </div>
                </div>
              ) : (
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Carica Logo</p>
                    </div>
                  </div>
                </Label>
              )}
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </div>
          </div>

          <Separator />

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

      {/* Azioni */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Annulla</Button>
        <Button>Salva Modifiche</Button>
      </div>
    </div>
  );
};

export default Impostazioni;
