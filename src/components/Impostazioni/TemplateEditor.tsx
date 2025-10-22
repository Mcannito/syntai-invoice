import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TemplateSettings {
  pdf_template_colore_primario: string;
  pdf_template_colore_secondario: string;
  pdf_template_font_size: string;
  pdf_template_mostra_logo: boolean;
  pdf_template_posizione_logo: string;
  pdf_template_footer_text: string;
  pdf_template_layout: string;
}

interface TemplateEditorProps {
  settings: TemplateSettings;
  onSettingsChange: (settings: TemplateSettings) => void;
}

export default function TemplateEditor({ settings, onSettingsChange }: TemplateEditorProps) {
  const updateSetting = (key: keyof TemplateSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Colore Primario</Label>
          <div className="flex gap-2">
            <Input
              id="primaryColor"
              type="color"
              value={settings.pdf_template_colore_primario || '#2563eb'}
              onChange={(e) => updateSetting('pdf_template_colore_primario', e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={settings.pdf_template_colore_primario || '#2563eb'}
              onChange={(e) => updateSetting('pdf_template_colore_primario', e.target.value)}
              className="flex-1"
              placeholder="#2563eb"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Colore usato per titoli e accenti
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryColor">Colore Secondario</Label>
          <div className="flex gap-2">
            <Input
              id="secondaryColor"
              type="color"
              value={settings.pdf_template_colore_secondario || '#64748b'}
              onChange={(e) => updateSetting('pdf_template_colore_secondario', e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={settings.pdf_template_colore_secondario || '#64748b'}
              onChange={(e) => updateSetting('pdf_template_colore_secondario', e.target.value)}
              className="flex-1"
              placeholder="#64748b"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Colore usato per testi secondari
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Dimensione Font</Label>
        <RadioGroup
          value={settings.pdf_template_font_size || 'medium'}
          onValueChange={(value) => updateSetting('pdf_template_font_size', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="small" id="font-small" />
            <Label htmlFor="font-small" className="font-normal cursor-pointer">
              Piccolo (12px)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="font-medium" />
            <Label htmlFor="font-medium" className="font-normal cursor-pointer">
              Medio (14px)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="large" id="font-large" />
            <Label htmlFor="font-large" className="font-normal cursor-pointer">
              Grande (16px)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-logo">Mostra Logo</Label>
            <p className="text-sm text-muted-foreground">
              Visualizza il logo nell'intestazione della fattura
            </p>
          </div>
          <Switch
            id="show-logo"
            checked={settings.pdf_template_mostra_logo ?? true}
            onCheckedChange={(checked) => updateSetting('pdf_template_mostra_logo', checked)}
          />
        </div>

        {settings.pdf_template_mostra_logo && (
          <div className="space-y-2">
            <Label>Posizione Logo</Label>
            <RadioGroup
              value={settings.pdf_template_posizione_logo || 'left'}
              onValueChange={(value) => updateSetting('pdf_template_posizione_logo', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="logo-left" />
                <Label htmlFor="logo-left" className="font-normal cursor-pointer">
                  Sinistra
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="center" id="logo-center" />
                <Label htmlFor="logo-center" className="font-normal cursor-pointer">
                  Centro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="logo-right" />
                <Label htmlFor="logo-right" className="font-normal cursor-pointer">
                  Destra
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="layout">Stile Layout</Label>
        <Select
          value={settings.pdf_template_layout || 'classic'}
          onValueChange={(value) => updateSetting('pdf_template_layout', value)}
        >
          <SelectTrigger id="layout">
            <SelectValue placeholder="Seleziona stile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classic">Classico</SelectItem>
            <SelectItem value="modern">Moderno</SelectItem>
            <SelectItem value="minimal">Minimale</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="footer">Testo Footer Personalizzato</Label>
        <Textarea
          id="footer"
          value={settings.pdf_template_footer_text || ''}
          onChange={(e) => updateSetting('pdf_template_footer_text', e.target.value)}
          placeholder="Es: Grazie per aver scelto i nostri servizi"
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Questo testo apparirà in fondo alla fattura
        </p>
      </div>
    </div>
  );
}
