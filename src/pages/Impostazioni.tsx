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

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          tipo_persona: formData.get("tipo_persona") as string,
          sesso: formData.get("sesso") as string,
          nome: formData.get("nome") as string,
          cognome: formData.get("cognome") as string,
          qualifica: formData.get("qualifica") as string,
          codice_fiscale: formData.get("codice_fiscale") as string,
          partita_iva: formData.get("partita_iva") as string,
          albo_nome: formData.get("albo_nome") as string,
          albo_numero: formData.get("albo_numero") as string,
          indirizzo: formData.get("indirizzo") as string,
          citta: formData.get("citta") as string,
          telefono: formData.get("telefono") as string,
          email: formData.get("email") as string,
          pec: formData.get("pec") as string,
        });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Impostazioni salvate con successo",
      });

      await loadSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni",
        variant: "destructive",
      });
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
              <CardDescription>I tuoi dati professionali</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <form onSubmit={handleSaveSettings}>
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
                        type="button"
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

            {/* Dati Anagrafici */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dati Anagrafici</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo_persona">Tipo Persona *</Label>
                  <Select name="tipo_persona" defaultValue={settings?.tipo_persona || "fisica"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisica">Persona Fisica</SelectItem>
                      <SelectItem value="giuridica">Persona Giuridica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sesso">Sesso</Label>
                  <Select name="sesso" defaultValue={settings?.sesso || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona sesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Maschio</SelectItem>
                      <SelectItem value="F">Femmina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input 
                    name="nome" 
                    placeholder="Mario" 
                    defaultValue={settings?.nome || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognome">Cognome *</Label>
                  <Input 
                    name="cognome" 
                    placeholder="Rossi" 
                    defaultValue={settings?.cognome || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifica">Qualifica *</Label>
                  <Select name="qualifica" defaultValue={settings?.qualifica || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona qualifica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medico Chirurgo">Medico Chirurgo</SelectItem>
                      <SelectItem value="Odontoiatra">Odontoiatra</SelectItem>
                      <SelectItem value="Veterinario">Veterinario</SelectItem>
                      <SelectItem value="Farmacista">Farmacista</SelectItem>
                      <SelectItem value="Biologo">Biologo</SelectItem>
                      <SelectItem value="Psicologo">Psicologo</SelectItem>
                      <SelectItem value="Infermiere">Infermiere</SelectItem>
                      <SelectItem value="Ostetrica/o">Ostetrica/o</SelectItem>
                      <SelectItem value="Fisioterapista">Fisioterapista</SelectItem>
                      <SelectItem value="Logopedista">Logopedista</SelectItem>
                      <SelectItem value="Podologo">Podologo</SelectItem>
                      <SelectItem value="Ortottista - Assistente di Oftalmologia">Ortottista - Assistente di Oftalmologia</SelectItem>
                      <SelectItem value="Tecnico Sanitario di Radiologia Medica">Tecnico Sanitario di Radiologia Medica</SelectItem>
                      <SelectItem value="Tecnico di Laboratorio Biomedico">Tecnico di Laboratorio Biomedico</SelectItem>
                      <SelectItem value="Dietista">Dietista</SelectItem>
                      <SelectItem value="Igienista Dentale">Igienista Dentale</SelectItem>
                      <SelectItem value="Tecnico Ortopedico">Tecnico Ortopedico</SelectItem>
                      <SelectItem value="Tecnico Audioprotesista">Tecnico Audioprotesista</SelectItem>
                      <SelectItem value="Tecnico della Fisiopatologia Cardiocircolatoria e Perfusione Cardiovascolare">Tecnico della Fisiopatologia Cardiocircolatoria</SelectItem>
                      <SelectItem value="Terapista Occupazionale">Terapista Occupazionale</SelectItem>
                      <SelectItem value="Educatore Professionale">Educatore Professionale</SelectItem>
                      <SelectItem value="Tecnico della Prevenzione nell'Ambiente e nei Luoghi di Lavoro">Tecnico della Prevenzione</SelectItem>
                      <SelectItem value="Assistente Sanitario">Assistente Sanitario</SelectItem>
                      <SelectItem value="Tecnico della Riabilitazione Psichiatrica">Tecnico della Riabilitazione Psichiatrica</SelectItem>
                      <SelectItem value="Terapista della Neuro e Psicomotricità dell'Età Evolutiva">Terapista della Neuro e Psicomotricità</SelectItem>
                      <SelectItem value="Tecnico di Neurofisiopatologia">Tecnico di Neurofisiopatologia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dati Fiscali */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dati Fiscali</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codice_fiscale">Codice Fiscale *</Label>
                  <Input 
                    name="codice_fiscale" 
                    placeholder="RSSMRA80A01H501Z" 
                    defaultValue={settings?.codice_fiscale || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partita_iva">Partita IVA *</Label>
                  <Input 
                    name="partita_iva" 
                    placeholder="12345678901" 
                    defaultValue={settings?.partita_iva || ""} 
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Iscrizione Albo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Iscrizione Albo</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="albo_nome">Nome Albo</Label>
                  <Input 
                    name="albo_nome" 
                    placeholder="Ordine dei Medici" 
                    defaultValue={settings?.albo_nome || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="albo_numero">Numero Iscrizione</Label>
                  <Input 
                    name="albo_numero" 
                    placeholder="12345" 
                    defaultValue={settings?.albo_numero || ""} 
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contatti e Sede */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contatti e Sede</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="indirizzo">Indirizzo Studio</Label>
                  <Input 
                    name="indirizzo" 
                    placeholder="Via Roma, 123" 
                    defaultValue={settings?.indirizzo || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="citta">Città e CAP</Label>
                  <Input 
                    name="citta" 
                    placeholder="Milano, 20121" 
                    defaultValue={settings?.citta || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input 
                    name="telefono" 
                    placeholder="+39 02 12345678" 
                    defaultValue={settings?.telefono || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    name="email" 
                    type="email" 
                    placeholder="studio@email.it" 
                    defaultValue={settings?.email || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pec">PEC</Label>
                  <Input 
                    name="pec" 
                    type="email" 
                    placeholder="pec@studio.it" 
                    defaultValue={settings?.pec || ""} 
                  />
                </div>
              </div>
            </div>

            {/* Azioni */}
            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline">Annulla</Button>
              <Button type="submit">Salva Modifiche</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Impostazioni;
