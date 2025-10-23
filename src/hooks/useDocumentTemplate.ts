import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { DocumentType } from '@/components/Impostazioni/DocumentTemplateSelector';

export interface DocumentTemplateSettings {
  colore_primario: string;
  colore_secondario: string;
  font_size: string;
  mostra_logo: boolean;
  posizione_logo: string;
  footer_text: string;
  layout: string;
  testo_centrale: string;
}

const DEFAULT_SETTINGS: DocumentTemplateSettings = {
  colore_primario: '#2563eb',
  colore_secondario: '#64748b',
  font_size: 'medium',
  mostra_logo: true,
  posizione_logo: 'left',
  footer_text: '',
  layout: 'classic',
  testo_centrale: ''
};

export function useDocumentTemplate(documentType: DocumentType) {
  const [settings, setSettings] = useState<DocumentTemplateSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUserId();
  }, []);

  // Load template for selected document type
  useEffect(() => {
    if (!userId || !documentType) return;

    const loadTemplate = async () => {
      setLoading(true);
      try {
        // Try to load from document_templates first
        const { data: template, error } = await supabase
          .from('document_templates')
          .select('*')
          .eq('user_id', userId)
          .eq('document_type', documentType)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (template) {
          // Template exists, use it
          setSettings({
            colore_primario: template.colore_primario,
            colore_secondario: template.colore_secondario,
            font_size: template.font_size,
            mostra_logo: template.mostra_logo,
            posizione_logo: template.posizione_logo,
            footer_text: template.footer_text || '',
            layout: template.layout,
            testo_centrale: template.testo_centrale || ''
          });
        } else {
          // Template doesn't exist, try to load from user_settings as fallback
          const { data: userSettings, error: settingsError } = await supabase
            .from('user_settings')
            .select('pdf_template_colore_primario, pdf_template_colore_secondario, pdf_template_font_size, pdf_template_mostra_logo, pdf_template_posizione_logo, pdf_template_footer_text, pdf_template_layout, pdf_template_testo_centrale')
            .eq('user_id', userId)
            .maybeSingle();

          if (settingsError) {
            console.error('Error loading user_settings:', settingsError);
          }

          if (userSettings) {
            setSettings({
              colore_primario: userSettings.pdf_template_colore_primario || DEFAULT_SETTINGS.colore_primario,
              colore_secondario: userSettings.pdf_template_colore_secondario || DEFAULT_SETTINGS.colore_secondario,
              font_size: userSettings.pdf_template_font_size || DEFAULT_SETTINGS.font_size,
              mostra_logo: userSettings.pdf_template_mostra_logo ?? DEFAULT_SETTINGS.mostra_logo,
              posizione_logo: userSettings.pdf_template_posizione_logo || DEFAULT_SETTINGS.posizione_logo,
              footer_text: userSettings.pdf_template_footer_text || '',
              layout: userSettings.pdf_template_layout || DEFAULT_SETTINGS.layout,
              testo_centrale: userSettings.pdf_template_testo_centrale || ''
            });
          } else {
            setSettings(DEFAULT_SETTINGS);
          }
        }
      } catch (error) {
        console.error('Error loading template:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare il template',
          variant: 'destructive'
        });
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [userId, documentType]);

  const saveTemplate = async (newSettings: DocumentTemplateSettings) => {
    if (!userId) {
      toast({
        title: 'Errore',
        description: 'Utente non autenticato',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('document_templates')
        .upsert({
          user_id: userId,
          document_type: documentType,
          colore_primario: newSettings.colore_primario,
          colore_secondario: newSettings.colore_secondario,
          font_size: newSettings.font_size,
          mostra_logo: newSettings.mostra_logo,
          posizione_logo: newSettings.posizione_logo,
          footer_text: newSettings.footer_text,
          layout: newSettings.layout,
          testo_centrale: newSettings.testo_centrale,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,document_type'
        });

      if (error) throw error;

      setSettings(newSettings);
      toast({
        title: 'Template salvato',
        description: 'Le impostazioni del template sono state salvate con successo'
      });
      return true;
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare il template',
        variant: 'destructive'
      });
      return false;
    }
  };

  const duplicateTemplate = async (fromType: DocumentType) => {
    if (!userId) return false;

    try {
      // Load template from source document type
      const { data: sourceTemplate, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('user_id', userId)
        .eq('document_type', fromType)
        .maybeSingle();

      if (error) throw error;

      if (sourceTemplate) {
        const newSettings: DocumentTemplateSettings = {
          colore_primario: sourceTemplate.colore_primario,
          colore_secondario: sourceTemplate.colore_secondario,
          font_size: sourceTemplate.font_size,
          mostra_logo: sourceTemplate.mostra_logo,
          posizione_logo: sourceTemplate.posizione_logo,
          footer_text: sourceTemplate.footer_text || '',
          layout: sourceTemplate.layout,
          testo_centrale: sourceTemplate.testo_centrale || ''
        };
        
        await saveTemplate(newSettings);
        return true;
      } else {
        toast({
          title: 'Template non trovato',
          description: 'Il template sorgente non esiste',
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile duplicare il template',
        variant: 'destructive'
      });
      return false;
    }
  };

  const applyToAll = async () => {
    if (!userId) return false;

    try {
      const allTypes: DocumentType[] = [
        'fattura_sanitaria',
        'fattura_elettronica_pg',
        'fattura_elettronica_pa',
        'preventivo',
        'fattura_proforma',
        'nota_credito'
      ];

      const promises = allTypes.map(type => 
        supabase.from('document_templates').upsert({
          user_id: userId,
          document_type: type,
          colore_primario: settings.colore_primario,
          colore_secondario: settings.colore_secondario,
          font_size: settings.font_size,
          mostra_logo: settings.mostra_logo,
          posizione_logo: settings.posizione_logo,
          footer_text: settings.footer_text,
          layout: settings.layout,
          testo_centrale: settings.testo_centrale,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,document_type'
        })
      );

      await Promise.all(promises);

      toast({
        title: 'Template applicato',
        description: 'Le impostazioni sono state applicate a tutti i tipi di documento'
      });
      return true;
    } catch (error) {
      console.error('Error applying to all:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile applicare il template a tutti i documenti',
        variant: 'destructive'
      });
      return false;
    }
  };

  const resetTemplate = async () => {
    await saveTemplate(DEFAULT_SETTINGS);
  };

  return {
    settings,
    setSettings,
    loading,
    saveTemplate,
    duplicateTemplate,
    applyToAll,
    resetTemplate
  };
}