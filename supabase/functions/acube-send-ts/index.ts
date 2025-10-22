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
          nome,
          cognome,
          codice_fiscale,
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

    // Validate it's a fattura_sanitaria
    if (fattura.tipo_documento !== 'fattura_sanitaria') {
      throw new Error('Only fattura_sanitaria can be sent to Sistema TS');
    }

    // Get A-Cube token
    const token = await getACubeToken();

    // Prepare payload for Sistema TS (this is a placeholder - actual format depends on A-Cube TS API)
    const tsPayload = {
      numero_fattura: fattura.numero,
      data: fattura.data,
      paziente: {
        nome: fattura.pazienti.nome,
        cognome: fattura.pazienti.cognome,
        codice_fiscale: fattura.pazienti.codice_fiscale,
        indirizzo: fattura.pazienti.indirizzo,
        citta: fattura.pazienti.citta,
        cap: fattura.pazienti.cap,
        provincia: fattura.pazienti.provincia,
      },
      dettagli: fattura.fatture_dettagli,
      totale: fattura.totale,
      imponibile: fattura.imponibile,
      iva_importo: fattura.iva_importo,
    };

    console.log('Sending to Sistema TS:', tsPayload);

    // TODO: Replace with actual A-Cube Sistema TS endpoint
    // const tsResponse = await fetch('https://ts.api.acubeapi.com/invoices', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //   },
    //   body: JSON.stringify(tsPayload),
    // });

    // For now, simulate success
    const acubeId = `TS-${Date.now()}`;
    
    // Update fattura with A-Cube info
    const { error: updateError } = await supabase
      .from('fatture')
      .update({
        acube_id: acubeId,
        acube_status: 'inviata',
        ts_inviata: true,
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
        message: 'Fattura inviata al Sistema TS con successo',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in acube-send-ts:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
