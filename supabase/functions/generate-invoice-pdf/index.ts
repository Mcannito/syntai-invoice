import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceData {
  id: string;
  numero: string;
  data: string;
  importo: number;
  imponibile: number;
  iva_importo: number;
  cassa_previdenziale: number;
  ritenuta_acconto: number;
  bollo_virtuale: number;
  totale: number;
  note: string;
  metodo_pagamento: string;
  tipo_documento: string;
  paziente_id: string;
  user_id: string;
}

interface InvoiceDetail {
  descrizione: string;
  quantita: number;
  prezzo_unitario: number;
  sconto: number;
  iva_percentuale: number;
  imponibile: number;
  iva_importo: number;
  totale: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { fatturaId } = await req.json();

    if (!fatturaId) {
      throw new Error('fatturaId is required');
    }

    console.log('Generating PDF for invoice:', fatturaId);

    // Fetch invoice data
    const { data: fattura, error: fatturaError } = await supabase
      .from('fatture')
      .select('*')
      .eq('id', fatturaId)
      .single();

    if (fatturaError) throw fatturaError;

    // Fetch invoice details
    const { data: dettagli, error: dettagliError } = await supabase
      .from('fatture_dettagli')
      .select('*')
      .eq('fattura_id', fatturaId);

    if (dettagliError) throw dettagliError;

    // Fetch patient data (if paziente_id exists)
    let paziente = null;
    if (fattura.paziente_id) {
      const { data: pazienteData, error: pazienteError } = await supabase
        .from('pazienti')
        .select('*')
        .eq('id', fattura.paziente_id)
        .single();

      if (pazienteError) throw pazienteError;
      paziente = pazienteData;
    }

    // Fetch user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', fattura.user_id)
      .single();

    if (settingsError) throw settingsError;

    // Fetch logo if exists
    let logoBase64 = null;
    if (settings.logo_path && settings.pdf_template_mostra_logo) {
      try {
        const { data: logoData } = await supabase.storage
          .from('logos')
          .download(settings.logo_path);
        
        if (logoData) {
          const arrayBuffer = await logoData.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const mimeType = logoData.type || 'image/png';
          logoBase64 = `data:${mimeType};base64,${base64}`;
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    }

    // Generate HTML for PDF
    const html = generateInvoiceHTML(fattura, dettagli, paziente, settings, logoBase64);

    // Convert HTML to PDF using a simple approach
    const encoder = new TextEncoder();
    const pdfContent = encoder.encode(html);

    // Upload PDF to storage
    const fileName = `${fattura.user_id}/fattura_${fattura.numero}_${Date.now()}.html`;
    const { error: uploadError } = await supabase.storage
      .from('fatture-pdf')
      .upload(fileName, pdfContent, {
        contentType: 'text/html',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Update invoice with PDF path
    const { error: updateError } = await supabase
      .from('fatture')
      .update({ pdf_path: fileName })
      .eq('id', fatturaId);

    if (updateError) throw updateError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('fatture-pdf')
      .getPublicUrl(fileName);

    console.log('PDF generated successfully:', urlData.publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        pdfUrl: urlData.publicUrl,
        pdfPath: fileName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateInvoiceHTML(
  fattura: InvoiceData,
  dettagli: InvoiceDetail[],
  paziente: any,
  settings: any,
  logoBase64: string | null
): string {
  const primaryColor = settings.pdf_template_colore_primario || '#2563eb';
  const secondaryColor = settings.pdf_template_colore_secondario || '#64748b';
  const fontSize = settings.pdf_template_font_size === 'small' ? '12px' : 
                   settings.pdf_template_font_size === 'large' ? '16px' : '14px';
  const logoPosition = settings.pdf_template_posizione_logo || 'left';
  const layout = settings.pdf_template_layout || 'classic';

  const getLayoutStyles = () => {
    switch(layout) {
      case 'modern':
        return `
          .header {
            background: linear-gradient(135deg, ${primaryColor}15, ${primaryColor}05);
            border-bottom: none;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
          }
          .party {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .items-table th {
            background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
            border-radius: 4px 4px 0 0;
          }
          .payment-info {
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
        `;
      case 'minimal':
        return `
          .header {
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 20px;
          }
          .party {
            background: transparent;
            border-left: 2px solid ${primaryColor};
            padding-left: 15px;
          }
          .party-title {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .items-table th {
            background: transparent;
            color: ${primaryColor};
            border-bottom: 2px solid ${primaryColor};
            font-weight: 600;
          }
          .payment-info {
            background: transparent;
            border-left: 2px solid ${primaryColor};
            padding-left: 15px;
          }
        `;
      case 'elegant':
        return `
          .header {
            background: linear-gradient(to right, ${primaryColor}08, transparent);
            border-radius: 8px;
            padding: 30px;
            border: 1px solid ${primaryColor}30;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          }
          .party {
            background: ${secondaryColor}03;
            border-radius: 6px;
            padding: 20px;
            border: 1px solid ${secondaryColor}15;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          }
          .items-table th {
            background: ${primaryColor}12;
            color: ${primaryColor};
            border-radius: 4px 4px 0 0;
            border-bottom: 2px solid ${primaryColor}40;
          }
          .payment-info {
            background: ${primaryColor}05;
            border-radius: 6px;
            padding: 20px;
            border: 1px solid ${primaryColor}20;
            box-shadow: 0 1px 4px rgba(0,0,0,0.02);
          }
        `;
      case 'bold':
        return `
          .header {
            background: ${primaryColor};
            border-radius: 0;
            padding: 32px;
            border: 4px solid ${secondaryColor};
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            color: white;
          }
          .document-title, .document-number {
            color: white !important;
          }
          .party {
            background: ${secondaryColor};
            border-radius: 0;
            padding: 20px;
            border: 3px solid ${primaryColor};
            color: white;
          }
          .party-title {
            color: white !important;
          }
          .items-table th {
            background: ${secondaryColor};
            color: white;
            border-radius: 0;
            border: 3px solid ${primaryColor};
          }
          .payment-info {
            background: ${primaryColor};
            border-radius: 0;
            padding: 20px;
            border: 4px solid ${secondaryColor};
            color: white;
          }
          .payment-info h3 {
            color: white !important;
          }
        `;
      default: // classic
        return `
          .header {
            border-bottom: 3px solid ${primaryColor};
          }
          .party {
            background: #f8f9fa;
            border-left: 4px solid ${primaryColor};
          }
          .items-table th {
            background: ${primaryColor};
          }
          .payment-info {
            background: #f8f9fa;
            border-radius: 5px;
          }
        `;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const tipoDocumentoLabel = fattura.tipo_documento === 'fattura' ? 'FATTURA' :
                             fattura.tipo_documento === 'proforma' ? 'FATTURA PROFORMA' :
                             'PREVENTIVO';

  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tipoDocumentoLabel} ${fattura.numero}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      font-size: ${fontSize};
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
    }
    .logo-container {
      text-align: ${logoPosition};
      flex: 1;
    }
    .logo {
      max-width: 150px;
      max-height: 100px;
    }
    .document-info {
      text-align: right;
    }
    .document-title {
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
      margin-bottom: 5px;
    }
    .document-number {
      font-size: 18px;
      color: ${secondaryColor};
    }
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .party {
      padding: 15px;
    }
    .party-title {
      font-weight: bold;
      color: ${primaryColor};
      margin-bottom: 10px;
      font-size: 16px;
    }
    .party-info p {
      margin: 5px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    .items-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .items-table tr:hover {
      background: #f8f9fa;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .total-row.final {
      font-size: 18px;
      font-weight: bold;
      color: ${primaryColor};
      border-top: 3px solid ${primaryColor};
      border-bottom: 3px solid ${primaryColor};
      padding: 15px 0;
      margin-top: 10px;
    }
    .payment-info {
      padding: 20px;
      margin-bottom: 20px;
    }
    .payment-info h3 {
      color: ${primaryColor};
      margin-bottom: 10px;
    }
    .footer {
      text-align: center;
      color: ${secondaryColor};
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      margin-top: 40px;
      font-size: 12px;
    }
    ${getLayoutStyles()}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo">` : ''}
    </div>
    <div class="document-info">
      <div class="document-title">${tipoDocumentoLabel}</div>
      <div class="document-number">N. ${fattura.numero}</div>
      <p>Data: ${formatDate(fattura.data)}</p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-title">Professionista</div>
      <div class="party-info">
        <p><strong>${settings.qualifica || ''} ${settings.nome || ''} ${settings.cognome || ''}</strong></p>
        ${settings.codice_fiscale ? `<p>C.F.: ${settings.codice_fiscale}</p>` : ''}
        ${settings.partita_iva ? `<p>P.IVA: ${settings.partita_iva}</p>` : ''}
        ${settings.albo_nome ? `<p>${settings.albo_nome} N. ${settings.albo_numero || ''}</p>` : ''}
        ${settings.indirizzo ? `<p>${settings.indirizzo}</p>` : ''}
        ${settings.citta ? `<p>${settings.citta}</p>` : ''}
        ${settings.email ? `<p>Email: ${settings.email}</p>` : ''}
        ${settings.pec ? `<p>PEC: ${settings.pec}</p>` : ''}
      </div>
    </div>

    <div class="party">
      <div class="party-title">Cliente</div>
      <div class="party-info">
        ${paziente ? `
          <p><strong>${paziente.tipo_paziente === 'privato' ? `${paziente.nome} ${paziente.cognome || ''}` : paziente.ragione_sociale}</strong></p>
          ${paziente.codice_fiscale ? `<p>C.F.: ${paziente.codice_fiscale}</p>` : ''}
          ${paziente.partita_iva ? `<p>P.IVA: ${paziente.partita_iva}</p>` : ''}
          ${paziente.indirizzo ? `<p>${paziente.indirizzo}</p>` : ''}
          ${paziente.cap || paziente.citta ? `<p>${paziente.cap || ''} ${paziente.citta || ''}</p>` : ''}
          ${paziente.email ? `<p>Email: ${paziente.email}</p>` : ''}
          ${paziente.pec ? `<p>PEC: ${paziente.pec}</p>` : ''}
        ` : '<p><em>Nessun cliente specificato</em></p>'}
      </div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Descrizione</th>
        <th class="text-right">Qtà</th>
        <th class="text-right">Prezzo</th>
        <th class="text-right">Sconto</th>
        <th class="text-right">IVA</th>
        <th class="text-right">Totale</th>
      </tr>
    </thead>
    <tbody>
      ${dettagli.map(item => `
        <tr>
          <td>${item.descrizione}</td>
          <td class="text-right">${item.quantita}</td>
          <td class="text-right">${formatCurrency(item.prezzo_unitario)}</td>
          <td class="text-right">${item.sconto}%</td>
          <td class="text-right">${item.iva_percentuale}%</td>
          <td class="text-right">${formatCurrency(item.totale)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row">
      <span>Imponibile:</span>
      <span>${formatCurrency(fattura.imponibile)}</span>
    </div>
    ${fattura.iva_importo > 0 ? `
    <div class="total-row">
      <span>IVA:</span>
      <span>${formatCurrency(fattura.iva_importo)}</span>
    </div>
    ` : ''}
    ${fattura.cassa_previdenziale > 0 ? `
    <div class="total-row">
      <span>Cassa Previdenziale:</span>
      <span>${formatCurrency(fattura.cassa_previdenziale)}</span>
    </div>
    ` : ''}
    ${fattura.ritenuta_acconto > 0 ? `
    <div class="total-row">
      <span>Ritenuta d'Acconto:</span>
      <span>-${formatCurrency(fattura.ritenuta_acconto)}</span>
    </div>
    ` : ''}
    ${fattura.bollo_virtuale > 0 ? `
    <div class="total-row">
      <span>Bollo Virtuale:</span>
      <span>${formatCurrency(fattura.bollo_virtuale)}</span>
    </div>
    ` : ''}
    <div class="total-row final">
      <span>TOTALE:</span>
      <span>${formatCurrency(fattura.totale)}</span>
    </div>
  </div>

  <div class="payment-info">
    <h3>Modalità di Pagamento</h3>
    <p><strong>${fattura.metodo_pagamento}</strong></p>
    ${settings.iban ? `<p>IBAN: ${settings.iban}</p>` : ''}
    ${settings.intestatario_cc ? `<p>Intestatario: ${settings.intestatario_cc}</p>` : ''}
  </div>

  ${fattura.note ? `
  <div class="payment-info">
    <h3>Note</h3>
    <p>${fattura.note}</p>
  </div>
  ` : ''}

  ${settings.pdf_template_testo_centrale ? `
  <div class="central-text" style="text-align: center; padding: 20px; margin: 20px 0; background: ${secondaryColor}08; border-left: 3px solid ${primaryColor}; color: ${secondaryColor};">
    ${settings.pdf_template_testo_centrale}
  </div>
  ` : ''}

  ${settings.pdf_template_footer_text ? `
  <div class="footer">
    ${settings.pdf_template_footer_text}
  </div>
  ` : ''}
</body>
</html>
  `;
}
