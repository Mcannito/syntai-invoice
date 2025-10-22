import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ACubeAuthResponse {
  token: string;
}

async function getACubeToken(): Promise<string> {
  const email = Deno.env.get('ACUBE_USERNAME');
  const password = Deno.env.get('ACUBE_PASSWORD');
  
  if (!email || !password) {
    throw new Error('A-Cube credentials not configured');
  }

  const response = await fetch('https://common.api.acubeapi.com/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('A-Cube auth failed:', error);
    throw new Error('Failed to authenticate with A-Cube');
  }

  const data: ACubeAuthResponse = await response.json();
  return data.token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { fattura_id } = await req.json();

    if (!fattura_id) {
      throw new Error('fattura_id is required');
    }

    // Fetch invoice with details
    const { data: fattura, error: fatturaError } = await supabase
      .from('fatture')
      .select(`
        *,
        pazienti (
          ragione_sociale,
          partita_iva,
          codice_fiscale,
          codice_destinatario,
          codice_destinatario_length,
          pec,
          indirizzo,
          citta,
          cap,
          provincia
        ),
        fatture_dettagli (
          descrizione,
          quantita,
          prezzo_unitario,
          iva_percentuale,
          imponibile,
          iva_importo,
          totale
        )
      `)
      .eq('id', fattura_id)
      .single();

    if (fatturaError || !fattura) {
      throw new Error('Fattura not found');
    }

    // Validate it's a fattura elettronica
    if (!['fattura_elettronica_pg', 'fattura_elettronica_pa'].includes(fattura.tipo_documento)) {
      throw new Error('Only fattura_elettronica_pg and fattura_elettronica_pa can be sent to SDI');
    }

    // Get A-Cube token
    const token = await getACubeToken();

    // Prepare payload for SDI (this is a placeholder - actual format depends on A-Cube SDI API)
    const sdiPayload = {
      numero_fattura: fattura.numero,
      data: fattura.data,
      tipo: fattura.tipo_documento === 'fattura_elettronica_pa' ? 'PA' : 'B2B',
      cedente: {
        // These should come from user settings
        denominazione: 'Studio Medico',
        partita_iva: 'IT00000000000',
        codice_fiscale: '00000000000',
        indirizzo: 'Via esempio 1',
        cap: '00000',
        comune: 'Roma',
        provincia: 'RM',
      },
      cessionario: {
        denominazione: fattura.pazienti.ragione_sociale,
        partita_iva: fattura.pazienti.partita_iva,
        codice_fiscale: fattura.pazienti.codice_fiscale,
        codice_destinatario: fattura.pazienti.codice_destinatario,
        pec: fattura.pazienti.pec,
        indirizzo: fattura.pazienti.indirizzo,
        cap: fattura.pazienti.cap,
        comune: fattura.pazienti.citta,
        provincia: fattura.pazienti.provincia,
      },
      dettagli: fattura.fatture_dettagli.map((d: any) => ({
        descrizione: d.descrizione,
        quantita: d.quantita,
        prezzo_unitario: d.prezzo_unitario,
        aliquota_iva: d.iva_percentuale,
      })),
      importo_totale: fattura.totale,
      imponibile: fattura.imponibile,
      iva: fattura.iva_importo,
    };

    console.log('Sending to SDI:', sdiPayload);

    // TODO: Replace with actual A-Cube SDI endpoint
    // const sdiResponse = await fetch('https://it.api.acubeapi.com/invoices', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //   },
    //   body: JSON.stringify(sdiPayload),
    // });

    // For now, simulate success
    const acubeId = `SDI-${Date.now()}`;
    
    // Update fattura with A-Cube info
    const { error: updateError } = await supabase
      .from('fatture')
      .update({
        acube_id: acubeId,
        acube_status: 'inviata',
        sdi_stato: 'Inviata',
        invio_data: new Date().toISOString(),
      })
      .eq('id', fattura_id);

    if (updateError) {
      console.error('Error updating fattura:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        acube_id: acubeId,
        status: 'inviata',
        message: 'Fattura inviata al Sistema di Interscambio con successo',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in acube-send-sdi:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
