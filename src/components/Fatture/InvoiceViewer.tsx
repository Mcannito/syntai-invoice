import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InvoiceViewerProps {
  open: boolean;
  onClose: () => void;
  htmlUrl: string | null;
  invoice: any;
  autoPrint?: boolean;
}

export function InvoiceViewer({ open, onClose, htmlUrl, invoice, autoPrint = false }: InvoiceViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    if (open && htmlUrl) {
      setLoading(true);
      fetch(htmlUrl)
        .then(response => response.text())
        .then(html => {
          setHtmlContent(html);
          setLoading(false);
          
          // Auto-print dopo il caricamento se richiesto
          if (autoPrint) {
            setTimeout(() => {
              handlePrint();
            }, 1000);
          }
        })
        .catch(error => {
          console.error('Error loading invoice HTML:', error);
          setLoading(false);
        });
    }
  }, [open, htmlUrl, autoPrint]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  if (!htmlUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 gap-0" hideCloseButton>
        <DialogHeader className="px-6 py-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl">
                {invoice?.tipo_documento === 'preventivo' ? 'Preventivo' : 'Fattura'} N. {invoice?.numero}
              </DialogTitle>
              {invoice && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{new Date(invoice.data).toLocaleDateString('it-IT')}</span>
                  <Badge variant="outline">
                    € {invoice.totale?.toFixed(2) || '0.00'}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={loading}
              >
                <Printer className="h-4 w-4 mr-2" />
                Stampa
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-1 bg-muted/30">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Caricamento fattura...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="Invoice Preview"
            onLoad={handleIframeLoad}
            sandbox="allow-same-origin allow-scripts allow-popups allow-modals"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
