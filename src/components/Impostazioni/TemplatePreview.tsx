import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TemplateSettings {
  pdf_template_colore_primario: string;
  pdf_template_colore_secondario: string;
  pdf_template_font_size: string;
  pdf_template_mostra_logo: boolean;
  pdf_template_posizione_logo: string;
  pdf_template_footer_text: string;
  pdf_template_layout: string;
}

interface TemplatePreviewProps {
  settings: TemplateSettings;
  logoUrl?: string;
}

export default function TemplatePreview({ settings, logoUrl }: TemplatePreviewProps) {
  const primaryColor = settings.pdf_template_colore_primario || '#2563eb';
  const secondaryColor = settings.pdf_template_colore_secondario || '#64748b';
  const fontSize = settings.pdf_template_font_size === 'small' ? '0.75rem' : 
                   settings.pdf_template_font_size === 'large' ? '0.95rem' : '0.875rem';
  const logoPosition = settings.pdf_template_posizione_logo || 'left';

  const justifyContent = logoPosition === 'center' ? 'center' : 
                         logoPosition === 'right' ? 'flex-end' : 'flex-start';

  return (
    <Card className="p-6 bg-white shadow-lg">
      <div className="space-y-4" style={{ fontSize }}>
        {/* Header */}
        <div 
          className="flex justify-between items-start pb-4"
          style={{ borderBottom: `3px solid ${primaryColor}` }}
        >
          {settings.pdf_template_mostra_logo && (
            <div style={{ display: 'flex', justifyContent, width: '100%' }}>
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="max-w-[100px] max-h-[60px] object-contain"
                />
              ) : (
                <div 
                  className="w-[100px] h-[60px] flex items-center justify-center rounded"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <FileText style={{ color: primaryColor }} size={32} />
                </div>
              )}
            </div>
          )}
          <div className="text-right">
            <div 
              className="text-lg font-bold"
              style={{ color: primaryColor }}
            >
              FATTURA
            </div>
            <div style={{ color: secondaryColor }}>N. 2024/001</div>
            <div className="text-xs">Data: 01/01/2024</div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="p-3 rounded"
            style={{ 
              backgroundColor: '#f8f9fa',
              borderLeft: `4px solid ${primaryColor}`
            }}
          >
            <div 
              className="font-bold mb-2"
              style={{ color: primaryColor }}
            >
              Professionista
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold">Dr. Mario Rossi</p>
              <p>P.IVA: 12345678901</p>
              <p>Via Roma, 123</p>
              <p>00100 Roma</p>
            </div>
          </div>

          <div 
            className="p-3 rounded"
            style={{ 
              backgroundColor: '#f8f9fa',
              borderLeft: `4px solid ${primaryColor}`
            }}
          >
            <div 
              className="font-bold mb-2"
              style={{ color: primaryColor }}
            >
              Cliente
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold">Cliente Esempio</p>
              <p>C.F.: RSSMRA80A01H501Z</p>
              <p>Via Milano, 456</p>
              <p>20100 Milano</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr style={{ backgroundColor: primaryColor, color: 'white' }}>
              <th className="p-2 text-left">Descrizione</th>
              <th className="p-2 text-right">Qtà</th>
              <th className="p-2 text-right">Prezzo</th>
              <th className="p-2 text-right">Totale</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Prestazione esempio</td>
              <td className="p-2 text-right">1</td>
              <td className="p-2 text-right">€100,00</td>
              <td className="p-2 text-right">€100,00</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-48 space-y-2">
          <div className="flex justify-between text-xs py-1 border-b">
            <span>Imponibile:</span>
            <span>€100,00</span>
          </div>
          <div 
            className="flex justify-between font-bold py-2 border-t-2"
            style={{ 
              color: primaryColor,
              borderColor: primaryColor
            }}
          >
            <span>TOTALE:</span>
            <span>€100,00</span>
          </div>
        </div>

        {/* Payment Info */}
        <div 
          className="p-3 rounded text-xs"
          style={{ backgroundColor: '#f8f9fa' }}
        >
          <div 
            className="font-bold mb-1"
            style={{ color: primaryColor }}
          >
            Modalità di Pagamento
          </div>
          <p>Bonifico Bancario</p>
        </div>

        {/* Footer */}
        {settings.pdf_template_footer_text && (
          <div 
            className="text-center text-xs pt-3 border-t"
            style={{ color: secondaryColor }}
          >
            {settings.pdf_template_footer_text}
          </div>
        )}
      </div>
    </Card>
  );
}
