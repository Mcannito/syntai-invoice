import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { documento_id, tipo_destinazione } = await req.json();

    if (!documento_id || !tipo_destinazione) {
      throw new Error('documento_id and tipo_destinazione are required');
    }

    // Fetch original document
    const { data: documento, error: docError } = await supabase
      .from('fatture')
      .select(`
        *,
        fatture_dettagli (*)
      `)
      .eq('id', documento_id)
      .single();

    if (docError || !documento) {
      throw new Error('Documento not found');
    }

    // Validate document can be converted
    if (!['preventivo', 'fattura_proforma'].includes(documento.tipo_documento)) {
      throw new Error('Only preventivo and fattura_proforma can be converted');
    }

    // Check if already converted
    if (documento.convertita_in_id) {
      throw new Error('This document has already been converted');
    }

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid authorization');
    }

    // Generate new invoice number
    const year = new Date().getFullYear();
    const { data: lastFattura } = await supabase
      .from('fatture')
      .select('numero')
      .ilike('numero', `${year}/%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastFattura?.numero) {
      const match = lastFattura.numero.match(/\/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    const numeroFattura = `${year}/${nextNumber.toString().padStart(3, '0')}`;

    // Create new invoice
    const { data: newFattura, error: insertError } = await supabase
      .from('fatture')
      .insert({
        user_id: user.id,
        numero: numeroFattura,
        data: new Date().toISOString().split('T')[0],
        paziente_id: documento.paziente_id,
        tipo_documento: tipo_destinazione,
        importo: documento.importo,
        imponibile: documento.imponibile,
        iva_importo: documento.iva_importo,
        totale: documento.totale,
        stato: 'Da Inviare',
        metodo_pagamento: documento.metodo_pagamento,
        note: documento.note,
        cassa_previdenziale: documento.cassa_previdenziale,
        ritenuta_acconto: documento.ritenuta_acconto,
        contributo_integrativo: documento.contributo_integrativo,
        bollo_virtuale: documento.bollo_virtuale,
        convertita_da_id: documento_id,
      })
      .select()
      .single();

    if (insertError || !newFattura) {
      console.error('Error creating invoice:', insertError);
      throw new Error('Failed to create invoice');
    }

    // Copy details
    const dettagliToCopy = documento.fatture_dettagli.map((d: any) => ({
      fattura_id: newFattura.id,
      prestazione_id: d.prestazione_id,
      descrizione: d.descrizione,
      quantita: d.quantita,
      prezzo_unitario: d.prezzo_unitario,
      sconto: d.sconto,
      iva_percentuale: d.iva_percentuale,
      imponibile: d.imponibile,
      iva_importo: d.iva_importo,
      totale: d.totale,
    }));

    const { error: dettagliError } = await supabase
      .from('fatture_dettagli')
      .insert(dettagliToCopy);

    if (dettagliError) {
      console.error('Error copying details:', dettagliError);
      throw new Error('Failed to copy invoice details');
    }

    // Update original document to mark as converted
    const { error: updateError } = await supabase
      .from('fatture')
      .update({ convertita_in_id: newFattura.id })
      .eq('id', documento_id);

    if (updateError) {
      console.error('Error updating original document:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        fattura_id: newFattura.id,
        numero: numeroFattura,
        message: 'Documento convertito con successo',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fattura-convert:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
