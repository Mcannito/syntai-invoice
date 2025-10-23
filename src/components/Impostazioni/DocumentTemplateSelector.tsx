import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileCheck, FileSignature, FileClock, FileX, FileHeart } from "lucide-react";

export const DOCUMENT_TYPES = {
  'fattura_sanitaria': {
    label: 'Fattura Sanitaria',
    icon: FileHeart,
    color: 'text-red-600'
  },
  'fattura_elettronica_pg': {
    label: 'Fattura PG',
    icon: FileText,
    color: 'text-blue-600'
  },
  'fattura_elettronica_pa': {
    label: 'Fattura PA',
    icon: FileCheck,
    color: 'text-green-600'
  },
  'preventivo': {
    label: 'Preventivo',
    icon: FileSignature,
    color: 'text-purple-600'
  },
  'fattura_proforma': {
    label: 'Pro Forma',
    icon: FileClock,
    color: 'text-orange-600'
  },
  'nota_credito': {
    label: 'Nota Credito',
    icon: FileX,
    color: 'text-rose-600'
  }
} as const;

export type DocumentType = keyof typeof DOCUMENT_TYPES;

interface DocumentTemplateSelectorProps {
  selectedType: DocumentType;
  onTypeChange: (type: DocumentType) => void;
}

export default function DocumentTemplateSelector({ 
  selectedType, 
  onTypeChange 
}: DocumentTemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Tipo Documento</Label>
      <Tabs value={selectedType} onValueChange={(value) => onTypeChange(value as DocumentType)}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-2">
          {Object.entries(DOCUMENT_TYPES).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger 
                key={type}
                value={type}
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className={`h-5 w-5 ${selectedType === type ? '' : config.color}`} />
                <span className="text-xs font-medium leading-tight text-center">
                  {config.label}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}