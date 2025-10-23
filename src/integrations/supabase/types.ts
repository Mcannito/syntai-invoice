export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appuntamenti: {
        Row: {
          created_at: string
          data: string
          fatturato: boolean
          id: string
          note: string | null
          ora_fine: string
          ora_inizio: string
          pacchetto_id: string | null
          paziente_id: string | null
          prestazione_id: string | null
          stato: string
          titolo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          fatturato?: boolean
          id?: string
          note?: string | null
          ora_fine: string
          ora_inizio: string
          pacchetto_id?: string | null
          paziente_id?: string | null
          prestazione_id?: string | null
          stato?: string
          titolo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          fatturato?: boolean
          id?: string
          note?: string | null
          ora_fine?: string
          ora_inizio?: string
          pacchetto_id?: string | null
          paziente_id?: string | null
          prestazione_id?: string | null
          stato?: string
          titolo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appuntamenti_pacchetto_id_fkey"
            columns: ["pacchetto_id"]
            isOneToOne: false
            referencedRelation: "pacchetti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appuntamenti_paziente_id_fkey"
            columns: ["paziente_id"]
            isOneToOne: false
            referencedRelation: "pazienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appuntamenti_prestazione_id_fkey"
            columns: ["prestazione_id"]
            isOneToOne: false
            referencedRelation: "prestazioni"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          colore_primario: string
          colore_secondario: string
          created_at: string
          document_type: string
          font_size: string
          footer_text: string | null
          id: string
          layout: string
          mostra_logo: boolean
          posizione_logo: string
          testo_centrale: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          colore_primario?: string
          colore_secondario?: string
          created_at?: string
          document_type: string
          font_size?: string
          footer_text?: string | null
          id?: string
          layout?: string
          mostra_logo?: boolean
          posizione_logo?: string
          testo_centrale?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          colore_primario?: string
          colore_secondario?: string
          created_at?: string
          document_type?: string
          font_size?: string
          footer_text?: string | null
          id?: string
          layout?: string
          mostra_logo?: boolean
          posizione_logo?: string
          testo_centrale?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fatture: {
        Row: {
          acube_error: string | null
          acube_id: string | null
          acube_status: string | null
          bollo_virtuale: number | null
          cassa_previdenziale: number | null
          contributo_integrativo: number | null
          convertita_da_id: string | null
          convertita_in_id: string | null
          created_at: string
          data: string
          data_pagamento: string | null
          email_inviata: boolean | null
          fattura_originale_data: string | null
          fattura_originale_id: string | null
          id: string
          imponibile: number | null
          importo: number
          invio_data: string | null
          iva_importo: number | null
          metodo_pagamento: string
          note: string | null
          numero: string
          pagata: boolean | null
          paziente_id: string | null
          pdf_path: string | null
          percentuale_ritenuta: number | null
          percentuale_rivalsa: number | null
          ritenuta_acconto: number | null
          scadenza_pagamento: string | null
          sdi_id: string | null
          sdi_stato: string | null
          stato: string
          tipo_documento: string
          totale: number | null
          ts_inviata: boolean | null
          updated_at: string
          user_id: string
          xml_path: string | null
        }
        Insert: {
          acube_error?: string | null
          acube_id?: string | null
          acube_status?: string | null
          bollo_virtuale?: number | null
          cassa_previdenziale?: number | null
          contributo_integrativo?: number | null
          convertita_da_id?: string | null
          convertita_in_id?: string | null
          created_at?: string
          data: string
          data_pagamento?: string | null
          email_inviata?: boolean | null
          fattura_originale_data?: string | null
          fattura_originale_id?: string | null
          id?: string
          imponibile?: number | null
          importo: number
          invio_data?: string | null
          iva_importo?: number | null
          metodo_pagamento: string
          note?: string | null
          numero: string
          pagata?: boolean | null
          paziente_id?: string | null
          pdf_path?: string | null
          percentuale_ritenuta?: number | null
          percentuale_rivalsa?: number | null
          ritenuta_acconto?: number | null
          scadenza_pagamento?: string | null
          sdi_id?: string | null
          sdi_stato?: string | null
          stato?: string
          tipo_documento?: string
          totale?: number | null
          ts_inviata?: boolean | null
          updated_at?: string
          user_id: string
          xml_path?: string | null
        }
        Update: {
          acube_error?: string | null
          acube_id?: string | null
          acube_status?: string | null
          bollo_virtuale?: number | null
          cassa_previdenziale?: number | null
          contributo_integrativo?: number | null
          convertita_da_id?: string | null
          convertita_in_id?: string | null
          created_at?: string
          data?: string
          data_pagamento?: string | null
          email_inviata?: boolean | null
          fattura_originale_data?: string | null
          fattura_originale_id?: string | null
          id?: string
          imponibile?: number | null
          importo?: number
          invio_data?: string | null
          iva_importo?: number | null
          metodo_pagamento?: string
          note?: string | null
          numero?: string
          pagata?: boolean | null
          paziente_id?: string | null
          pdf_path?: string | null
          percentuale_ritenuta?: number | null
          percentuale_rivalsa?: number | null
          ritenuta_acconto?: number | null
          scadenza_pagamento?: string | null
          sdi_id?: string | null
          sdi_stato?: string | null
          stato?: string
          tipo_documento?: string
          totale?: number | null
          ts_inviata?: boolean | null
          updated_at?: string
          user_id?: string
          xml_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fatture_convertita_da_fkey"
            columns: ["convertita_da_id"]
            isOneToOne: false
            referencedRelation: "fatture"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fatture_convertita_in_fkey"
            columns: ["convertita_in_id"]
            isOneToOne: false
            referencedRelation: "fatture"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fatture_paziente_id_fkey"
            columns: ["paziente_id"]
            isOneToOne: false
            referencedRelation: "pazienti"
            referencedColumns: ["id"]
          },
        ]
      }
      fatture_dettagli: {
        Row: {
          created_at: string
          descrizione: string
          fattura_id: string
          id: string
          imponibile: number
          iva_importo: number
          iva_percentuale: number | null
          prestazione_id: string | null
          prezzo_unitario: number
          quantita: number
          sconto: number | null
          totale: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          descrizione: string
          fattura_id: string
          id?: string
          imponibile: number
          iva_importo: number
          iva_percentuale?: number | null
          prestazione_id?: string | null
          prezzo_unitario: number
          quantita?: number
          sconto?: number | null
          totale: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          descrizione?: string
          fattura_id?: string
          id?: string
          imponibile?: number
          iva_importo?: number
          iva_percentuale?: number | null
          prestazione_id?: string | null
          prezzo_unitario?: number
          quantita?: number
          sconto?: number | null
          totale?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fatture_dettagli_fattura_id_fkey"
            columns: ["fattura_id"]
            isOneToOne: false
            referencedRelation: "fatture"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fatture_dettagli_prestazione_id_fkey"
            columns: ["prestazione_id"]
            isOneToOne: false
            referencedRelation: "prestazioni"
            referencedColumns: ["id"]
          },
        ]
      }
      fatture_in_entrata: {
        Row: {
          categoria: string | null
          codice_fiscale: string | null
          created_at: string
          data: string
          data_pagamento: string | null
          descrizione: string | null
          fornitore: string
          id: string
          imponibile: number
          importo: number
          iva_importo: number | null
          metodo_pagamento: string | null
          note: string | null
          numero: string
          pagata: boolean | null
          partita_iva: string | null
          pdf_path: string | null
          updated_at: string
          user_id: string
          xml_path: string | null
        }
        Insert: {
          categoria?: string | null
          codice_fiscale?: string | null
          created_at?: string
          data: string
          data_pagamento?: string | null
          descrizione?: string | null
          fornitore: string
          id?: string
          imponibile: number
          importo: number
          iva_importo?: number | null
          metodo_pagamento?: string | null
          note?: string | null
          numero: string
          pagata?: boolean | null
          partita_iva?: string | null
          pdf_path?: string | null
          updated_at?: string
          user_id: string
          xml_path?: string | null
        }
        Update: {
          categoria?: string | null
          codice_fiscale?: string | null
          created_at?: string
          data?: string
          data_pagamento?: string | null
          descrizione?: string | null
          fornitore?: string
          id?: string
          imponibile?: number
          importo?: number
          iva_importo?: number | null
          metodo_pagamento?: string | null
          note?: string | null
          numero?: string
          pagata?: boolean | null
          partita_iva?: string | null
          pdf_path?: string | null
          updated_at?: string
          user_id?: string
          xml_path?: string | null
        }
        Relationships: []
      }
      pacchetti: {
        Row: {
          created_at: string
          data_acquisto: string
          data_scadenza: string | null
          fattura_id: string | null
          id: string
          nome: string
          note: string | null
          paziente_id: string
          prestazione_id: string
          prezzo_listino: number
          prezzo_per_seduta: number
          prezzo_totale: number
          quantita_rimanente: number | null
          quantita_totale: number
          quantita_utilizzata: number
          sconto_importo: number | null
          sconto_percentuale: number | null
          stato: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_acquisto: string
          data_scadenza?: string | null
          fattura_id?: string | null
          id?: string
          nome: string
          note?: string | null
          paziente_id: string
          prestazione_id: string
          prezzo_listino: number
          prezzo_per_seduta: number
          prezzo_totale: number
          quantita_rimanente?: number | null
          quantita_totale: number
          quantita_utilizzata?: number
          sconto_importo?: number | null
          sconto_percentuale?: number | null
          stato?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_acquisto?: string
          data_scadenza?: string | null
          fattura_id?: string | null
          id?: string
          nome?: string
          note?: string | null
          paziente_id?: string
          prestazione_id?: string
          prezzo_listino?: number
          prezzo_per_seduta?: number
          prezzo_totale?: number
          quantita_rimanente?: number | null
          quantita_totale?: number
          quantita_utilizzata?: number
          sconto_importo?: number | null
          sconto_percentuale?: number | null
          stato?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacchetti_fattura_id_fkey"
            columns: ["fattura_id"]
            isOneToOne: false
            referencedRelation: "fatture"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacchetti_paziente_id_fkey"
            columns: ["paziente_id"]
            isOneToOne: false
            referencedRelation: "pazienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacchetti_prestazione_id_fkey"
            columns: ["prestazione_id"]
            isOneToOne: false
            referencedRelation: "prestazioni"
            referencedColumns: ["id"]
          },
        ]
      }
      pazienti: {
        Row: {
          cap: string | null
          citta: string | null
          codice_destinatario: string | null
          codice_destinatario_length: number | null
          codice_fiscale: string | null
          cognome: string | null
          created_at: string | null
          email: string | null
          id: string
          indirizzo: string | null
          nome: string
          partita_iva: string | null
          pec: string | null
          provincia: string | null
          ragione_sociale: string | null
          telefono: string | null
          tipo_paziente: string
          updated_at: string | null
        }
        Insert: {
          cap?: string | null
          citta?: string | null
          codice_destinatario?: string | null
          codice_destinatario_length?: number | null
          codice_fiscale?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome: string
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          ragione_sociale?: string | null
          telefono?: string | null
          tipo_paziente: string
          updated_at?: string | null
        }
        Update: {
          cap?: string | null
          citta?: string | null
          codice_destinatario?: string | null
          codice_destinatario_length?: number | null
          codice_fiscale?: string | null
          cognome?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome?: string
          partita_iva?: string | null
          pec?: string | null
          provincia?: string | null
          ragione_sociale?: string | null
          telefono?: string | null
          tipo_paziente?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prestazioni: {
        Row: {
          categoria: string
          codice: string
          created_at: string
          id: string
          iva: string
          nome: string
          prezzo: number
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          codice: string
          created_at?: string
          id?: string
          iva?: string
          nome: string
          prezzo: number
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          codice?: string
          created_at?: string
          id?: string
          iva?: string
          nome?: string
          prezzo?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spese: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          descrizione: string | null
          file_path: string | null
          fornitore: string
          id: string
          importo: number
          iva_importo: number | null
          note: string | null
          numero: string
          totale: number
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data: string
          descrizione?: string | null
          file_path?: string | null
          fornitore: string
          id?: string
          importo: number
          iva_importo?: number | null
          note?: string | null
          numero: string
          totale: number
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          descrizione?: string | null
          file_path?: string | null
          fornitore?: string
          id?: string
          importo?: number
          iva_importo?: number | null
          note?: string | null
          numero?: string
          totale?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          albo_nome: string | null
          albo_numero: string | null
          aliquota_cassa: number | null
          altro_metodo_pagamento: string | null
          bic_swift: string | null
          bollo_attivo: boolean | null
          bollo_carico: string | null
          bollo_importo: number | null
          bollo_virtuale: boolean | null
          cassa_previdenziale: string | null
          citta: string | null
          codice_fiscale: string | null
          cognome: string | null
          created_at: string
          email: string | null
          iban: string | null
          id: string
          indirizzo: string | null
          intestatario_cc: string | null
          logo_path: string | null
          metodi_pagamento: string[] | null
          metodo_pagamento_default: string | null
          nome: string | null
          nome_banca: string | null
          partita_iva: string | null
          pdf_template_colore_primario: string | null
          pdf_template_colore_secondario: string | null
          pdf_template_font_size: string | null
          pdf_template_footer_text: string | null
          pdf_template_layout: string | null
          pdf_template_mostra_logo: boolean | null
          pdf_template_posizione_logo: string | null
          pdf_template_testo_centrale: string | null
          pec: string | null
          qualifica: string | null
          regime_fiscale: string | null
          ritenuta_acconto: number | null
          ritenuta_aliquota: number | null
          ritenuta_attiva: boolean | null
          ritenuta_causale: string | null
          ritenuta_tipo: string | null
          rivalsa_applicazione: string | null
          rivalsa_attiva: boolean | null
          rivalsa_percentuale: number | null
          sesso: string | null
          specializzazione: string | null
          telefono: string | null
          tipo_persona: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          albo_nome?: string | null
          albo_numero?: string | null
          aliquota_cassa?: number | null
          altro_metodo_pagamento?: string | null
          bic_swift?: string | null
          bollo_attivo?: boolean | null
          bollo_carico?: string | null
          bollo_importo?: number | null
          bollo_virtuale?: boolean | null
          cassa_previdenziale?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          cognome?: string | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          intestatario_cc?: string | null
          logo_path?: string | null
          metodi_pagamento?: string[] | null
          metodo_pagamento_default?: string | null
          nome?: string | null
          nome_banca?: string | null
          partita_iva?: string | null
          pdf_template_colore_primario?: string | null
          pdf_template_colore_secondario?: string | null
          pdf_template_font_size?: string | null
          pdf_template_footer_text?: string | null
          pdf_template_layout?: string | null
          pdf_template_mostra_logo?: boolean | null
          pdf_template_posizione_logo?: string | null
          pdf_template_testo_centrale?: string | null
          pec?: string | null
          qualifica?: string | null
          regime_fiscale?: string | null
          ritenuta_acconto?: number | null
          ritenuta_aliquota?: number | null
          ritenuta_attiva?: boolean | null
          ritenuta_causale?: string | null
          ritenuta_tipo?: string | null
          rivalsa_applicazione?: string | null
          rivalsa_attiva?: boolean | null
          rivalsa_percentuale?: number | null
          sesso?: string | null
          specializzazione?: string | null
          telefono?: string | null
          tipo_persona?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          albo_nome?: string | null
          albo_numero?: string | null
          aliquota_cassa?: number | null
          altro_metodo_pagamento?: string | null
          bic_swift?: string | null
          bollo_attivo?: boolean | null
          bollo_carico?: string | null
          bollo_importo?: number | null
          bollo_virtuale?: boolean | null
          cassa_previdenziale?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          cognome?: string | null
          created_at?: string
          email?: string | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          intestatario_cc?: string | null
          logo_path?: string | null
          metodi_pagamento?: string[] | null
          metodo_pagamento_default?: string | null
          nome?: string | null
          nome_banca?: string | null
          partita_iva?: string | null
          pdf_template_colore_primario?: string | null
          pdf_template_colore_secondario?: string | null
          pdf_template_font_size?: string | null
          pdf_template_footer_text?: string | null
          pdf_template_layout?: string | null
          pdf_template_mostra_logo?: boolean | null
          pdf_template_posizione_logo?: string | null
          pdf_template_testo_centrale?: string | null
          pec?: string | null
          qualifica?: string | null
          regime_fiscale?: string | null
          ritenuta_acconto?: number | null
          ritenuta_aliquota?: number | null
          ritenuta_attiva?: boolean | null
          ritenuta_causale?: string | null
          ritenuta_tipo?: string | null
          rivalsa_applicazione?: string | null
          rivalsa_attiva?: boolean | null
          rivalsa_percentuale?: number | null
          sesso?: string | null
          specializzazione?: string | null
          telefono?: string | null
          tipo_persona?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
