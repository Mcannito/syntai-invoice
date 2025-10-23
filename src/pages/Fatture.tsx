import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Eye, Download, Send, FileText, Upload, RefreshCw, CheckCircle, CalendarIcon, X, CreditCard, Settings, Pencil, Trash2, Heart, Zap, FileQuestion, FileClock, TrendingUp, FileCode, PenTool, MoreVertical, Printer, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NuovaFatturaDialog } from "@/components/Fatture/NuovaFatturaDialog";
import { InserisciFatturaInEntrataDialog } from "@/components/Fatture/InserisciFatturaInEntrataDialog";
import { CaricaFatturaXMLDialog } from "@/components/Fatture/CaricaFatturaXMLDialog";
import { InvoiceViewer } from "@/components/Fatture/InvoiceViewer";
import TemplateEditor from "@/components/Impostazioni/TemplateEditor";
import TemplatePreview from "@/components/Impostazioni/TemplatePreview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Fatture = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  const [fatture, setFatture] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [fatturaToConvert, setFatturaToConvert] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [fatturaToMarkPaid, setFatturaToMarkPaid] = useState<any>(null);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [prestazioniDaFatturare, setPrestazioniDaFatturare] = useState<any[]>([]);
  const [selectedPrestazioni, setSelectedPrestazioni] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "grouped">("grouped");
  const [prestazioniPerFattura, setPrestazioniPerFattura] = useState<any[]>([]);
  const [showNuovaFatturaDialog, setShowNuovaFatturaDialog] = useState(false);
  const [filtroStato, setFiltroStato] = useState<string>("tutti");
  const [filtroPaziente, setFiltroPaziente] = useState<string>("tutti");
  const [impostazioniDialogOpen, setImpostazioniDialogOpen] = useState(false);
  const [rivalsaAttiva, setRivalsaAttiva] = useState(true);
  const [ritenutaAttiva, setRitenutaAttiva] = useState(false);
  const [bolloAttivo, setBolloAttivo] = useState(false);
  const [bolloVirtuale, setBolloVirtuale] = useState(false);
  const [metodiPagamento, setMetodiPagamento] = useState<Set<string>>(new Set(['bonifico']));
  const [userSettingsId, setUserSettingsId] = useState<string | null>(null);
  
  // Nuovi stati per i campi controllati delle impostazioni
  const [rivalsaPercentuale, setRivalsaPercentuale] = useState(4);
  const [rivalsaApplicazione, setRivalsaApplicazione] = useState('separata');
  const [ritenutaAliquota, setRitenutaAliquota] = useState(20);
  const [ritenutaTipo, setRitenutaTipo] = useState('persone-fisiche');
  const [ritenutaCausale, setRitenutaCausale] = useState('A');
  const [bolloImporto, setBolloImporto] = useState(2.00);
  const [bolloCarico, setBolloCarico] = useState('paziente');
  const [regimeFiscale, setRegimeFiscale] = useState('forfettario');
  const [cassaPrevidenziale, setCassaPrevidenziale] = useState('enpam');
  const [nomeBanca, setNomeBanca] = useState('');
  const [intestatarioCc, setIntestatarioCc] = useState('');
  const [iban, setIban] = useState('');
  const [bicSwift, setBicSwift] = useState('');
  const [altroMetodo, setAltroMetodo] = useState('');
  const [fattureInEntrata, setFattureInEntrata] = useState<any[]>([]);
  const [inserisciFatturaInEntrataOpen, setInserisciFatturaInEntrataOpen] = useState(false);
  const [caricaXMLDialogOpen, setCaricaXMLDialogOpen] = useState(false);
  const [fatturaInEntrataToEdit, setFatturaInEntrataToEdit] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fatturaToDelete, setFatturaToDelete] = useState<any>(null);
  const [filtroTipoDocumento, setFiltroTipoDocumento] = useState<string | null>(null);
  const [filtroFattureEntrata, setFiltroFattureEntrata] = useState<string | null>(null);
  const [searchTermEntrata, setSearchTermEntrata] = useState("");
  const [filtroCategoriaEntrata, setFiltroCategoriaEntrata] = useState<string>("tutte");
  const [filtroStatoPagamento, setFiltroStatoPagamento] = useState<string>("tutti");
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [fatturaToEdit, setFatturaToEdit] = useState<any>(null);
  const [editAlertOpen, setEditAlertOpen] = useState(false);
  const [pendingEditFattura, setPendingEditFattura] = useState<any>(null);
  
  // Invoice Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentInvoiceUrl, setCurrentInvoiceUrl] = useState<string | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  
  // Stato per ordinamento
  const [sortField, setSortField] = useState<'numero' | 'data'>('numero');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Stati per nota di credito
  const [notaCreditoFattura, setNotaCreditoFattura] = useState<any>(null);
  const [showNotaCreditoDialog, setShowNotaCreditoDialog] = useState(false);
  
  // Stati per template
  const [templateSettings, setTemplateSettings] = useState({
    pdf_template_colore_primario: '#2563eb',
    pdf_template_colore_secondario: '#64748b',
    pdf_template_font_size: 'medium',
    pdf_template_mostra_logo: true,
    pdf_template_posizione_logo: 'left',
    pdf_template_footer_text: '',
    pdf_template_layout: 'classic',
    pdf_template_testo_centrale: '',
  });
  const [logo, setLogo] = useState<string | null>(null);
  
  const { toast } = useToast();

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setUserSettingsId(data.id);
        setRivalsaAttiva(data.rivalsa_attiva ?? true);
        setRivalsaPercentuale(data.rivalsa_percentuale ?? 4);
        setRivalsaApplicazione(data.rivalsa_applicazione ?? 'separata');
        setRitenutaAttiva(data.ritenuta_attiva ?? false);
        setRitenutaAliquota(data.ritenuta_aliquota ?? 20);
        setRitenutaTipo(data.ritenuta_tipo ?? 'persone-fisiche');
        setRitenutaCausale(data.ritenuta_causale ?? 'A');
        setBolloAttivo(data.bollo_attivo ?? false);
        setBolloImporto(data.bollo_importo ?? 2.00);
        setBolloCarico(data.bollo_carico ?? 'paziente');
        setBolloVirtuale(data.bollo_virtuale ?? false);
        setRegimeFiscale(data.regime_fiscale ?? 'forfettario');
        setCassaPrevidenziale(data.cassa_previdenziale ?? 'enpam');
        setNomeBanca(data.nome_banca ?? '');
        setIntestatarioCc(data.intestatario_cc ?? '');
        setIban(data.iban ?? '');
        setBicSwift(data.bic_swift ?? '');
        setAltroMetodo(data.altro_metodo_pagamento ?? '');
        if (data.metodi_pagamento) {
          setMetodiPagamento(new Set(data.metodi_pagamento));
        }
        
        // Carica anche impostazioni template
        setTemplateSettings({
          pdf_template_colore_primario: data.pdf_template_colore_primario || '#2563eb',
          pdf_template_colore_secondario: data.pdf_template_colore_secondario || '#64748b',
          pdf_template_font_size: data.pdf_template_font_size || 'medium',
          pdf_template_mostra_logo: data.pdf_template_mostra_logo ?? true,
          pdf_template_posizione_logo: data.pdf_template_posizione_logo || 'left',
          pdf_template_footer_text: data.pdf_template_footer_text || '',
          pdf_template_layout: data.pdf_template_layout || 'classic',
          pdf_template_testo_centrale: data.pdf_template_testo_centrale || '',
        });
        
        // Carica logo
        if (data.logo_path) {
          const { data: logoData } = supabase.storage
            .from('logos')
            .getPublicUrl(data.logo_path);
          setLogo(logoData.publicUrl);
        }
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  const saveUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const settings = {
        regime_fiscale: regimeFiscale,
        cassa_previdenziale: cassaPrevidenziale,
        metodi_pagamento: Array.from(metodiPagamento),
        altro_metodo_pagamento: altroMetodo,
        nome_banca: nomeBanca,
        intestatario_cc: intestatarioCc,
        iban: iban,
        bic_swift: bicSwift,
        rivalsa_attiva: rivalsaAttiva,
        rivalsa_percentuale: rivalsaPercentuale,
        rivalsa_applicazione: rivalsaApplicazione,
        ritenuta_attiva: ritenutaAttiva,
        ritenuta_aliquota: ritenutaAliquota,
        ritenuta_tipo: ritenutaTipo,
        ritenuta_causale: ritenutaCausale,
        bollo_attivo: bolloAttivo,
        bollo_importo: bolloImporto,
        bollo_carico: bolloCarico,
        bollo_virtuale: bolloVirtuale,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          ...settings,
          user_id: user.id,
          id: userSettingsId || undefined
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Impostazioni salvate",
        description: "Le modifiche sono state salvate con successo",
      });
      setImpostazioniDialogOpen(false);
      loadUserSettings(); // Ricarica per aggiornare l'ID se era nuovo
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni",
        variant: "destructive",
      });
    }
  };

  const loadFatture = async () => {
    try {
      const { data, error } = await supabase
        .from("fatture")
        .select(`
          *,
          pazienti (nome, cognome, ragione_sociale, tipo_paziente),
          fatture_dettagli (*)
        `)
        .order("numero", { ascending: false });

      if (error) throw error;
      setFatture(data || []);
    } catch (error) {
      console.error("Error loading fatture:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le fatture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPrestazioniDaFatturare = async () => {
    try {
      console.log("🔍 Caricamento prestazioni da fatturare...");
      
      const { data, error } = await supabase
        .from("appuntamenti")
        .select(`
          id,
          data,
          ora_inizio,
          ora_fine,
          note,
          paziente_id,
          prestazione_id,
          stato,
          pazienti (id, nome, cognome, ragione_sociale, tipo_paziente),
          prestazioni (id, nome, prezzo, iva)
        `)
        .or("fatturato.eq.false,fatturato.is.null")
        .order("data", { ascending: false });

      console.log("📊 Prestazioni trovate:", data?.length || 0);
      if (data && data.length > 0) {
        console.log("📋 Stati appuntamenti:", data.map(p => ({ stato: p.stato, fatturato: (p as any).fatturato, data: p.data })));
      }

      if (error) throw error;
      setPrestazioniDaFatturare(data || []);
    } catch (error) {
      console.error("Error loading prestazioni da fatturare:", error);
    }
  };

  const loadFattureInEntrata = async () => {
    try {
      const { data, error } = await supabase
        .from("fatture_in_entrata")
        .select("*")
        .order("data", { ascending: false });

      if (error) throw error;
      setFattureInEntrata(data || []);
    } catch (error) {
      console.error("Error loading fatture in entrata:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le fatture in entrata",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFatture();
    loadPrestazioniDaFatturare();
    loadUserSettings();
    loadFattureInEntrata();
  }, []);

  // Gestione parametro highlight dall'URL
  useEffect(() => {
    const highlightParam = searchParams.get('highlight');
    if (highlightParam) {
      setHighlightedId(highlightParam);
      
      // Scroll alla fattura evidenziata dopo un breve delay per permettere il rendering
      setTimeout(() => {
        highlightedRowRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);

      // Rimuovi highlight e parametro dopo 3 secondi
      setTimeout(() => {
        setHighlightedId(null);
        searchParams.delete('highlight');
        setSearchParams(searchParams);
      }, 3000);
    }
  }, [searchParams, setSearchParams]);

  // Gestione parametro view dall'URL per aprire direttamente il viewer della fattura
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam && fatture.length > 0) {
      const fatturaToView = fatture.find(f => f.id === viewParam);
      if (fatturaToView) {
        handleViewPDF(fatturaToView);
        // Rimuovi il parametro dalla URL
        searchParams.delete('view');
        setSearchParams(searchParams);
      }
    }
  }, [searchParams, setSearchParams, fatture]);

  const getPazienteDisplayName = (fattura: any) => {
    if (!fattura.pazienti) return "N/A";
    if (fattura.pazienti.tipo_paziente === "persona_fisica") {
      return `${fattura.pazienti.cognome || ""} ${fattura.pazienti.nome}`.trim();
    }
    return fattura.pazienti.ragione_sociale || fattura.pazienti.nome;
  };

  const toggleSort = (field: 'numero' | 'data') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleCreaNotaCredito = async (fattura: any) => {
    try {
      // Carica i dettagli della fattura originale
      const { data: dettagliData, error: dettagliError } = await supabase
        .from("fatture_dettagli")
        .select("*")
        .eq("fattura_id", fattura.id);

      if (dettagliError) throw dettagliError;

      // Crea l'oggetto fattura senza l'id (per evitare che venga considerata una modifica)
      const { id, ...fatturaDataSenzaId } = fattura;
      const fatturaCompleta = {
        ...fatturaDataSenzaId,
        fatture_dettagli: dettagliData || []
      };

      setNotaCreditoFattura(fatturaCompleta);
      setShowNotaCreditoDialog(true);
    } catch (error) {
      console.error("Error loading fattura dettagli:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dettagli della fattura",
        variant: "destructive",
      });
    }
  };

  const filteredFatture = fatture
    .filter(f => {
      const searchLower = searchTerm.toLowerCase();
      const pazienteNome = getPazienteDisplayName(f).toLowerCase();
      const matchesSearch = f.numero.toLowerCase().includes(searchLower) || pazienteNome.includes(searchLower);
      
      let matchesTipo = true;
      if (filtroTipoDocumento) {
        matchesTipo = f.tipo_documento === filtroTipoDocumento;
      }
      
      // Filtro stato
      const matchesStato = filtroStato === 'tutti' || f.stato === filtroStato;
      
      // Filtro pagamento
      const matchesPagamento = filtroPaziente === 'tutti' ||
        (filtroPaziente === 'pagata' && f.pagata) ||
        (filtroPaziente === 'non_pagata' && !f.pagata);
      
      return matchesSearch && matchesTipo && matchesStato && matchesPagamento;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'numero') {
        // Confronto numerico se possibile, altrimenti alfabetico
        const numA = parseInt(a.numero);
        const numB = parseInt(b.numero);
        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB;
        } else {
          comparison = a.numero.localeCompare(b.numero);
        }
      } else if (sortField === 'data') {
        comparison = new Date(a.data).getTime() - new Date(b.data).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case "Inviata TS":
        return <Badge className="bg-secondary text-secondary-foreground">Inviata TS</Badge>;
      case "Inviata SDI":
        return <Badge className="bg-primary text-primary-foreground">Inviata SDI</Badge>;
      case "Da Inviare":
        return <Badge variant="outline" className="border-destructive text-destructive">Da Inviare</Badge>;
      case "Pagata":
        return <Badge variant="outline" className="border-secondary text-secondary">Pagata</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  const getTipoDocumentoBadge = (tipo: string) => {
    switch (tipo) {
      case "fattura_sanitaria":
        return <Badge className="bg-green-500 text-white">🏥 Sanitaria</Badge>;
      case "fattura_elettronica_pg":
        return <Badge className="bg-blue-500 text-white">📄 B2B</Badge>;
      case "fattura_elettronica_pa":
        return <Badge className="bg-cyan-500 text-white">🏛️ PA</Badge>;
      case "fattura_proforma":
        return <Badge className="bg-yellow-500 text-white">📋 Pro Forma</Badge>;
      case "preventivo":
        return <Badge className="bg-orange-500 text-white">📝 Preventivo</Badge>;
      case "nota_credito":
        return <Badge className="bg-red-500 text-white">↩️ Nota Credito</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  const handleSendTS = async (fatturaId: string) => {
    setSendingId(fatturaId);
    try {
      const { data, error } = await supabase.functions.invoke('acube-send-ts', {
        body: { fattura_id: fatturaId }
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: data.message || "Fattura inviata al Sistema TS",
      });
      loadFatture();
    } catch (error: any) {
      console.error('Error sending to TS:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare la fattura al Sistema TS",
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleSendSDI = async (fatturaId: string) => {
    setSendingId(fatturaId);
    try {
      const { data, error } = await supabase.functions.invoke('acube-send-sdi', {
        body: { fattura_id: fatturaId }
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: data.message || "Fattura inviata al Sistema di Interscambio",
      });
      loadFatture();
    } catch (error: any) {
      console.error('Error sending to SDI:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare la fattura al SDI",
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  };

  const handleConvert = (fattura: any) => {
    setFatturaToConvert(fattura);
    setConvertDialogOpen(true);
  };

  const confirmConvert = async () => {
    if (!fatturaToConvert) return;

    const tipoDestinazione = fatturaToConvert.pazienti?.tipo_paziente === "persona_fisica" 
      ? "fattura_sanitaria" 
      : "fattura_elettronica_pg";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('fattura-convert', {
        body: { 
          documento_id: fatturaToConvert.id,
          tipo_destinazione: tipoDestinazione
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: `Documento convertito in ${data.numero}`,
      });
      loadFatture();
      setConvertDialogOpen(false);
      setFatturaToConvert(null);
    } catch (error: any) {
      console.error('Error converting:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile convertire il documento",
      variant: "destructive",
      });
    }
  };

  const handleEditClick = (fattura: any) => {
    // Controlla se la fattura è pagata o inviata (al Sistema TS o al SDI)
    const isInviataSistemaTS = fattura.stato === "Inviata al Sistema TS" || fattura.stato === "Inviata";
    const isInviataSDI = fattura.sdi_stato && fattura.sdi_stato !== "Da Inviare";
    const isPreventivoAccettato = fattura.tipo_documento === 'preventivo' && fattura.pagata;
    const isProformaAccettata = fattura.tipo_documento === 'fattura_proforma' && fattura.pagata;
    const isProformaConvertita = fattura.tipo_documento === 'fattura_proforma' && fattura.convertita_in_id;
    
    if (fattura.pagata || isInviataSistemaTS || isInviataSDI || isPreventivoAccettato || isProformaAccettata || isProformaConvertita) {
      setPendingEditFattura(fattura);
      setEditAlertOpen(true);
    } else {
      setFatturaToEdit(fattura);
      setShowNuovaFatturaDialog(true);
    }
  };

  const handleAccettaPreventivo = async (fattura: any) => {
    try {
      const { error } = await supabase
        .from('fatture')
        .update({ 
          pagata: true,
          data_pagamento: format(new Date(), 'yyyy-MM-dd')
        })
        .eq('id', fattura.id);

      if (error) throw error;

      toast({
        title: "Preventivo accettato",
        description: "Il preventivo è stato segnato come accettato",
      });
      loadFatture();
    } catch (error) {
      console.error('Error accepting preventivo:', error);
      toast({
        title: "Errore",
        description: "Impossibile accettare il preventivo",
        variant: "destructive",
      });
    }
  };

  const handleConvertiPreventivoInFattura = async (preventivo: any) => {
    try {
      // 0. Ottieni l'utente corrente
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Utente non autenticato");
      }

      // 1. Carica i dettagli del preventivo
      const { data: dettagliData, error: dettagliError } = await supabase
        .from("fatture_dettagli")
        .select("*")
        .eq("fattura_id", preventivo.id);

      if (dettagliError) throw dettagliError;

      // 2. Genera nuovo numero fattura (con prefisso FT)
      const year = new Date().getFullYear();
      const { data: fattureData, error: fattureError } = await supabase
        .from("fatture")
        .select("numero")
        .like("numero", `FT %/${year}`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fattureError) throw fattureError;

      let nextNumber = 1;
      if (fattureData && fattureData.length > 0) {
        const match = fattureData[0].numero.match(/(\d+)\/\d{4}$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      const numeroFattura = `FT ${nextNumber}/${year}`;

      // 3. Determina il tipo di documento in base al tipo di paziente
      let tipoDocumento = 'fattura_sanitaria';
      if (preventivo.pazienti) {
        if (preventivo.pazienti.tipo_paziente === 'persona_giuridica') {
          tipoDocumento = 'fattura_elettronica_pg';
        } else if (preventivo.pazienti.tipo_paziente === 'pubblica_amministrazione') {
          tipoDocumento = 'fattura_elettronica_pa';
        }
      }

      // 4. Crea la nuova fattura
      const { data: nuovaFattura, error: insertError } = await supabase
        .from("fatture")
        .insert([{
          user_id: user.id,
          numero: numeroFattura,
          data: new Date().toISOString().split('T')[0],
          paziente_id: preventivo.paziente_id,
          tipo_documento: tipoDocumento,
          metodo_pagamento: preventivo.metodo_pagamento,
          stato: "Da Inviare",
          importo: preventivo.importo,
          imponibile: preventivo.imponibile,
          iva_importo: preventivo.iva_importo,
          cassa_previdenziale: preventivo.cassa_previdenziale,
          ritenuta_acconto: preventivo.ritenuta_acconto,
          contributo_integrativo: preventivo.contributo_integrativo,
          bollo_virtuale: preventivo.bollo_virtuale,
          totale: preventivo.totale,
          percentuale_rivalsa: preventivo.percentuale_rivalsa,
          percentuale_ritenuta: preventivo.percentuale_ritenuta,
          note: preventivo.note,
          convertita_da_id: preventivo.id,
          fattura_originale_id: preventivo.id,
          fattura_originale_data: preventivo.data,
          scadenza_pagamento: preventivo.scadenza_pagamento,
        } as any])
        .select()
        .single();

      if (insertError) throw insertError;

      // 5. Copia i dettagli
      if (dettagliData && dettagliData.length > 0) {
        const dettagliCopy = dettagliData.map(d => ({
          fattura_id: nuovaFattura.id,
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

        const { error: dettagliInsertError } = await supabase
          .from("fatture_dettagli")
          .insert(dettagliCopy);

        if (dettagliInsertError) throw dettagliInsertError;
      }

      // 6. Aggiorna il preventivo con il link alla fattura
      const { error: updateError } = await supabase
        .from("fatture")
        .update({ convertita_in_id: nuovaFattura.id })
        .eq("id", preventivo.id);

      if (updateError) throw updateError;

      toast({
        title: "Fattura creata",
        description: `Il preventivo ${preventivo.numero} è stato convertito in fattura ${numeroFattura}`,
      });

      loadFatture();
    } catch (error) {
      console.error('Error converting preventivo:', error);
      toast({
        title: "Errore",
        description: "Impossibile convertire il preventivo in fattura",
        variant: "destructive",
      });
    }
  };

  const handleAccettaProforma = async (fattura: any) => {
    try {
      const { error } = await supabase
        .from('fatture')
        .update({ 
          pagata: true,
          data_pagamento: format(new Date(), 'yyyy-MM-dd')
        })
        .eq('id', fattura.id);

      if (error) throw error;

      toast({
        title: "Fattura pro forma accettata",
        description: "La fattura pro forma è stata segnata come pagata",
      });

      loadFatture();
    } catch (error) {
      console.error('Error accepting proforma:', error);
      toast({
        title: "Errore",
        description: "Impossibile accettare la fattura pro forma",
        variant: "destructive",
      });
    }
  };

  const handleConvertiProformaInFattura = async (proforma: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      // Carica dettagli
      const { data: dettagliData, error: dettagliError } = await supabase
        .from("fatture_dettagli")
        .select("*")
        .eq("fattura_id", proforma.id);

      if (dettagliError) throw dettagliError;

      // Genera numero fattura
      const year = new Date().getFullYear();
      const { data: fattureData, error: fattureError } = await supabase
        .from("fatture")
        .select("numero")
        .like("numero", `FT %/${year}`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (fattureError) throw fattureError;

      let nextNumber = 1;
      if (fattureData && fattureData.length > 0) {
        const match = fattureData[0].numero.match(/(\d+)\/\d{4}$/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      const numeroFattura = `FT ${nextNumber}/${year}`;

      // Determina tipo documento
      let tipoDocumento = 'fattura_sanitaria';
      if (proforma.pazienti) {
        if (proforma.pazienti.tipo_paziente === 'persona_giuridica') {
          tipoDocumento = 'fattura_elettronica_pg';
        } else if (proforma.pazienti.tipo_paziente === 'pubblica_amministrazione') {
          tipoDocumento = 'fattura_elettronica_pa';
        }
      }

      // Crea fattura
      const { data: nuovaFattura, error: insertError } = await supabase
        .from("fatture")
        .insert([{
          user_id: user.id,
          numero: numeroFattura,
          data: new Date().toISOString().split('T')[0],
          paziente_id: proforma.paziente_id,
          tipo_documento: tipoDocumento,
          metodo_pagamento: proforma.metodo_pagamento,
          stato: "Da Inviare",
          importo: proforma.importo,
          imponibile: proforma.imponibile,
          iva_importo: proforma.iva_importo,
          cassa_previdenziale: proforma.cassa_previdenziale,
          ritenuta_acconto: proforma.ritenuta_acconto,
          contributo_integrativo: proforma.contributo_integrativo,
          bollo_virtuale: proforma.bollo_virtuale,
          totale: proforma.totale,
          percentuale_rivalsa: proforma.percentuale_rivalsa,
          percentuale_ritenuta: proforma.percentuale_ritenuta,
          note: proforma.note,
          convertita_da_id: proforma.id,
          fattura_originale_id: proforma.id,
          fattura_originale_data: proforma.data,
          scadenza_pagamento: proforma.scadenza_pagamento,
        } as any])
        .select()
        .single();

      if (insertError) throw insertError;

      // Copia dettagli
      if (dettagliData && dettagliData.length > 0) {
        const dettagliCopy = dettagliData.map(d => ({
          fattura_id: nuovaFattura.id,
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

        const { error: dettagliInsertError } = await supabase
          .from("fatture_dettagli")
          .insert(dettagliCopy);

        if (dettagliInsertError) throw dettagliInsertError;
      }

      // Aggiorna pro forma
      const { error: updateError } = await supabase
        .from("fatture")
        .update({ convertita_in_id: nuovaFattura.id })
        .eq("id", proforma.id);

      if (updateError) throw updateError;

      toast({
        title: "Fattura creata",
        description: `La fattura pro forma ${proforma.numero} è stata convertita in fattura ${numeroFattura}`,
      });

      loadFatture();
    } catch (error) {
      console.error('Error converting proforma:', error);
      toast({
        title: "Errore",
        description: "Impossibile convertire la fattura pro forma",
        variant: "destructive",
      });
    }
  };

  const confirmEdit = () => {
    if (pendingEditFattura) {
      setFatturaToEdit(pendingEditFattura);
      setShowNuovaFatturaDialog(true);
      setEditAlertOpen(false);
      setPendingEditFattura(null);
    }
  };

  const handleTogglePrestazione = (id: string, pazienteId: string) => {
    const newSelected = new Set(selectedPrestazioni);
    
    // Se stiamo aggiungendo e ci sono già prestazioni selezionate
    if (!newSelected.has(id) && newSelected.size > 0) {
      // Verifica che sia dello stesso paziente
      const firstSelected = prestazioniDaFatturare.find(p => newSelected.has(p.id));
      if (firstSelected && firstSelected.paziente_id !== pazienteId) {
        toast({
          title: "Attenzione",
          description: "Non puoi selezionare prestazioni di pazienti diversi",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPrestazioni(newSelected);
  };

  const handleToggleAllPaziente = (pazienteId: string) => {
    const prestazioniPaziente = prestazioniDaFatturare.filter(p => p.paziente_id === pazienteId);
    const allSelected = prestazioniPaziente.every(p => selectedPrestazioni.has(p.id));
    
    const newSelected = new Set(selectedPrestazioni);
    
    if (allSelected) {
      // Deseleziona tutte
      prestazioniPaziente.forEach(p => newSelected.delete(p.id));
    } else {
      // Seleziona tutte (ma prima controlla che non ci siano già altre selezioni)
      if (newSelected.size > 0) {
        const firstSelected = prestazioniDaFatturare.find(p => newSelected.has(p.id));
        if (firstSelected && firstSelected.paziente_id !== pazienteId) {
          toast({
            title: "Attenzione",
            description: "Devi prima deselezionare le prestazioni dell'altro paziente",
            variant: "destructive",
          });
          return;
        }
      }
      prestazioniPaziente.forEach(p => newSelected.add(p.id));
    }
    
    setSelectedPrestazioni(newSelected);
  };

  const handleCreaFatturaDaPrestazioni = () => {
    if (selectedPrestazioni.size === 0) {
      toast({
        title: "Attenzione",
        description: "Seleziona almeno una prestazione da fatturare",
        variant: "destructive",
      });
      return;
    }
    
    // Recupera i dettagli completi delle prestazioni selezionate
    const prestazioniSelezionate = prestazioniDaFatturare.filter(p => 
      selectedPrestazioni.has(p.id)
    );
    
    // Imposta le prestazioni e apri il dialog
    setPrestazioniPerFattura(prestazioniSelezionate);
    setShowNuovaFatturaDialog(true);
  };

  const getStatoAppuntamentoBadge = (stato: string) => {
    switch (stato) {
      case "completato":
        return <Badge className="bg-green-500 text-white">Completato</Badge>;
      case "confermato":
        return <Badge className="bg-emerald-500 text-white">Confermato</Badge>;
      case "programmato":
        return <Badge className="bg-blue-500 text-white">Programmato</Badge>;
      case "annullato":
        return <Badge variant="outline" className="border-muted text-muted-foreground">Annullato</Badge>;
      case "in_corso":
        return <Badge className="bg-yellow-500 text-white">In corso</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  const getFilteredPrestazioni = () => {
    return prestazioniDaFatturare.filter(prestazione => {
      const matchStato = filtroStato === "tutti" || prestazione.stato === filtroStato;
      const matchPaziente = filtroPaziente === "tutti" || prestazione.paziente_id === filtroPaziente;
      return matchStato && matchPaziente;
    });
  };

  const getPazientiUnici = () => {
    const pazientiMap = new Map();
    prestazioniDaFatturare.forEach(prestazione => {
      if (prestazione.pazienti && !pazientiMap.has(prestazione.paziente_id)) {
        pazientiMap.set(prestazione.paziente_id, prestazione.pazienti);
      }
    });
    return Array.from(pazientiMap.entries());
  };

  const getPrestazioniGroupedByPaziente = () => {
    const filtered = getFilteredPrestazioni();
    const grouped = new Map<string, any[]>();
    
    filtered.forEach(prestazione => {
      const pazienteId = prestazione.paziente_id;
      if (!grouped.has(pazienteId)) {
        grouped.set(pazienteId, []);
      }
      grouped.get(pazienteId)!.push(prestazione);
    });
    
    return Array.from(grouped.entries());
  };

  const resetFiltri = () => {
    setFiltroStato("tutti");
    setFiltroPaziente("tutti");
  };

  const openPaymentDialog = (fattura: any) => {
    setFatturaToMarkPaid(fattura);
    setPaymentDate(new Date());
    setPaymentDialogOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!fatturaToMarkPaid || !paymentDate) return;

    try {
      const { error } = await supabase
        .from('fatture')
        .update({ 
          pagata: true, 
          data_pagamento: format(paymentDate, 'yyyy-MM-dd')
        })
        .eq('id', fatturaToMarkPaid.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Fattura segnata come pagata",
      });
      loadFatture();
      setPaymentDialogOpen(false);
      setFatturaToMarkPaid(null);
    } catch (error) {
      console.error('Error marking as paid:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato del pagamento",
        variant: "destructive",
      });
    }
  };

  const handleViewPDF = async (fattura: any) => {
    try {
      if (fattura.pdf_path) {
        const { data } = supabase.storage.from('fatture-pdf').getPublicUrl(fattura.pdf_path);
        setCurrentInvoiceUrl(data.publicUrl);
        setCurrentInvoice(fattura);
        setAutoPrint(false);
        setViewerOpen(true);
        return;
      }
      
      setGeneratingPdf(fattura.id);
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { fatturaId: fattura.id }
      });
      
      if (error) throw error;
      
      setCurrentInvoiceUrl(data.pdfUrl);
      setCurrentInvoice(fattura);
      setAutoPrint(false);
      setViewerOpen(true);
      await loadFatture();
      
      toast({ title: "PDF Generato", description: "Il PDF è stato generato con successo" });
    } catch (error) {
      console.error('Error viewing PDF:', error);
      toast({ title: "Errore", description: "Impossibile visualizzare il PDF", variant: "destructive" });
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleRegeneratePDF = async (fattura: any) => {
    try {
      setGeneratingPdf(fattura.id);
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { fatturaId: fattura.id }
      });
      
      if (error) throw error;
      
      await loadFatture();
      toast({
        title: "PDF Rigenerato",
        description: "Il PDF è stato rigenerato con successo",
      });
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      toast({
        title: "Errore",
        description: "Impossibile rigenerare il PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handlePrintPDF = async (fattura: any) => {
    try {
      if (!fattura.pdf_path) {
        setGeneratingPdf(fattura.id);
        const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
          body: { fatturaId: fattura.id }
        });
        
        if (error) throw error;
        
        setCurrentInvoiceUrl(data.pdfUrl);
        setCurrentInvoice(fattura);
        setAutoPrint(true);
        setViewerOpen(true);
        await loadFatture();
        setGeneratingPdf(null);
        return;
      }
      
      const { data } = supabase.storage.from('fatture-pdf').getPublicUrl(fattura.pdf_path);
      setCurrentInvoiceUrl(data.publicUrl);
      setCurrentInvoice(fattura);
      setAutoPrint(true);
      setViewerOpen(true);
      
      toast({ title: "Stampa Avviata", description: "La finestra di stampa si aprirà a breve" });
    } catch (error) {
      console.error('Error printing PDF:', error);
      toast({ title: "Errore", description: "Impossibile stampare il PDF", variant: "destructive" });
    }
  };

  const handleDeleteFatturaInEntrata = (fattura: any) => {
    setFatturaToDelete({ ...fattura, isFatturaInEntrata: true });
    setDeleteDialogOpen(true);
  };

  const handleDeleteFattura = (fattura: any) => {
    setFatturaToDelete({ ...fattura, isFatturaInEntrata: false });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!fatturaToDelete) return;

    try {
      const tableName = fatturaToDelete.isFatturaInEntrata ? 'fatture_in_entrata' : 'fatture';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', fatturaToDelete.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Fattura eliminata correttamente",
      });
      
      if (fatturaToDelete.isFatturaInEntrata) {
        loadFattureInEntrata();
      } else {
        loadFatture();
      }
      
      setDeleteDialogOpen(false);
      setFatturaToDelete(null);
    } catch (error) {
      console.error('Error deleting fattura:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la fattura",
        variant: "destructive",
      });
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_settings")
        .update(templateSettings)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Template salvato con successo",
      });
      
      await loadUserSettings();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestione Fatture</h1>
          <p className="text-muted-foreground">
            Documenti in uscita e in entrata
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImpostazioniDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Impostazioni
          </Button>
          <NuovaFatturaDialog 
            onFatturaAdded={() => {
              loadFatture();
              loadPrestazioniDaFatturare();
            }}
            metodiPagamento={Array.from(metodiPagamento)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="da-fatturare" className="space-y-4">
        <TabsList>
          <TabsTrigger value="da-fatturare">Prestazioni da Fatturare</TabsTrigger>
          <TabsTrigger value="uscita">Documenti in Uscita</TabsTrigger>
          <TabsTrigger value="entrata">Documenti in Entrata</TabsTrigger>
          <TabsTrigger value="template">Template Fatture</TabsTrigger>
        </TabsList>

        <TabsContent value="da-fatturare" className="space-y-4">
          <Card className="shadow-medical-sm">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Prestazioni da Fatturare</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      Elenco
                    </Button>
                    <Button
                      variant={viewMode === "grouped" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grouped")}
                    >
                      Per Paziente
                    </Button>
                  </div>
                </div>
                
                {/* Filtri */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">Stato:</Label>
                    <Select value={filtroStato} onValueChange={setFiltroStato}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tutti">Tutti gli stati</SelectItem>
                        <SelectItem value="programmato">Programmato</SelectItem>
                        <SelectItem value="confermato">Confermato</SelectItem>
                        <SelectItem value="completato">Completato</SelectItem>
                        <SelectItem value="in_corso">In corso</SelectItem>
                        <SelectItem value="annullato">Annullato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium whitespace-nowrap">Paziente:</Label>
                    <Select value={filtroPaziente} onValueChange={setFiltroPaziente}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tutti">Tutti i pazienti</SelectItem>
                        {getPazientiUnici().map(([id, paziente]) => (
                          <SelectItem key={id} value={id}>
                            {paziente.tipo_paziente === "persona_fisica"
                              ? `${paziente.nome} ${paziente.cognome || ""}`
                              : paziente.ragione_sociale || paziente.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(filtroStato !== "tutti" || filtroPaziente !== "tutti") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFiltri}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Resetta filtri
                    </Button>
                  )}
                  
                  <div className="ml-auto text-sm text-muted-foreground">
                    {getFilteredPrestazioni().length} prestazioni • 
                    Totale: €{getFilteredPrestazioni().reduce((sum, p) => sum + Number(p.prestazioni?.prezzo || 0), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selectedPrestazioni.size > 0 && (
                <div className="mb-4 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">
                      {selectedPrestazioni.size} prestazioni selezionate
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPrestazioni(new Set())}
                    >
                      Deseleziona tutto
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreaFatturaDaPrestazioni}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crea Fattura
                    </Button>
                  </div>
                </div>
              )}

              {viewMode === "list" ? (
                <div className="space-y-2">
                  {getFilteredPrestazioni().length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Nessuna prestazione da fatturare</p>
                      <p className="text-sm">
                        {prestazioniDaFatturare.length === 0 
                          ? "Tutte le prestazioni sono state fatturate"
                          : "Nessuna prestazione corrisponde ai filtri selezionati"}
                      </p>
                    </div>
                  ) : (
                    getFilteredPrestazioni().map((prestazione) => (
                      <div
                        key={prestazione.id}
                        className={cn(
                          "flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors",
                          selectedPrestazioni.has(prestazione.id) && "bg-primary/5 border-primary"
                        )}
                        onClick={() => handleTogglePrestazione(prestazione.id, prestazione.paziente_id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPrestazioni.has(prestazione.id)}
                          onChange={() => {}}
                          className="h-4 w-4"
                        />
                        <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Data</p>
                            <p className="font-medium">
                              {new Date(prestazione.data).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Paziente</p>
                            <p className="font-medium">
                              {prestazione.pazienti?.tipo_paziente === "persona_fisica"
                                ? `${prestazione.pazienti.nome} ${prestazione.pazienti.cognome || ""}`
                                : prestazione.pazienti?.ragione_sociale || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Prestazione</p>
                            <p className="font-medium">{prestazione.prestazioni?.nome || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Stato</p>
                            {getStatoAppuntamentoBadge(prestazione.stato)}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Importo</p>
                            <p className="font-semibold text-primary">
                              €{Number(prestazione.prestazioni?.prezzo || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {getPrestazioniGroupedByPaziente().length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Nessuna prestazione da fatturare</p>
                      <p className="text-sm">Tutte le prestazioni sono state fatturate</p>
                    </div>
                  ) : (
                    getPrestazioniGroupedByPaziente().map(([pazienteId, prestazioni]) => {
                      const paziente = prestazioni[0].pazienti;
                      const totale = prestazioni.reduce((sum, p) => sum + Number(p.prestazioni?.prezzo || 0), 0);
                      const allSelected = prestazioni.every(p => selectedPrestazioni.has(p.id));
                      
                      return (
                        <Card key={pazienteId} className={cn(
                          "border-2",
                          allSelected && "border-primary"
                        )}>
                          <CardHeader className="cursor-pointer" onClick={() => handleToggleAllPaziente(pazienteId)}>
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => {}}
                                className="h-5 w-5"
                              />
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {paziente?.tipo_paziente === "persona_fisica"
                                    ? `${paziente.nome} ${paziente.cognome || ""}`
                                    : paziente?.ragione_sociale || "N/A"}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {prestazioni.length} prestazioni • Totale: €{totale.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {prestazioni.map((prestazione) => (
                                <div
                                  key={prestazione.id}
                                  className={cn(
                                    "flex items-center gap-4 p-3 border rounded hover:bg-muted/30 cursor-pointer transition-colors",
                                    selectedPrestazioni.has(prestazione.id) && "bg-primary/5 border-primary"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTogglePrestazione(prestazione.id, pazienteId);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPrestazioni.has(prestazione.id)}
                                    onChange={() => {}}
                                    className="h-4 w-4"
                                  />
                                  <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Data</p>
                                      <p className="font-medium">
                                        {new Date(prestazione.data).toLocaleDateString('it-IT')}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Prestazione</p>
                                      <p className="font-medium">{prestazione.prestazioni?.nome || "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Stato</p>
                                      {getStatoAppuntamentoBadge(prestazione.stato)}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">Importo</p>
                                      <p className="font-semibold text-primary">
                                        €{Number(prestazione.prestazioni?.prezzo || 0).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uscita" className="space-y-4">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card 
              className={cn(
                "border-primary/20 bg-primary-light cursor-pointer transition-all hover:shadow-md",
                filtroTipoDocumento === null && "ring-2 ring-primary"
              )}
              onClick={() => setFiltroTipoDocumento(null)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Fatturato {format(new Date(), 'MMMM yyyy', { locale: it })}
                    </p>
                    <p className="text-xl font-bold">
                      €{fatture
                        .filter(f => {
                          const fatturaDate = new Date(f.data);
                          const now = new Date();
                          return fatturaDate.getMonth() === now.getMonth() && 
                                 fatturaDate.getFullYear() === now.getFullYear();
                        })
                        .reduce((sum, f) => sum + (f.totale || f.importo), 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fatture.filter(f => {
                        const fatturaDate = new Date(f.data);
                        const now = new Date();
                        return fatturaDate.getMonth() === now.getMonth() && 
                               fatturaDate.getFullYear() === now.getFullYear();
                      }).length} {fatture.filter(f => {
                        const fatturaDate = new Date(f.data);
                        const now = new Date();
                        return fatturaDate.getMonth() === now.getMonth() && 
                               fatturaDate.getFullYear() === now.getFullYear();
                      }).length === 1 ? 'documento' : 'documenti'}
                    </p>
                  </div>
                  <FileText className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                filtroTipoDocumento === 'fattura_sanitaria' && "ring-2 ring-primary"
              )}
              onClick={() => setFiltroTipoDocumento(filtroTipoDocumento === 'fattura_sanitaria' ? null : 'fattura_sanitaria')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fatture Sanitarie</p>
                    <p className="text-2xl font-bold">
                      {fatture.filter(f => f.tipo_documento === 'fattura_sanitaria').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      €{fatture.filter(f => f.tipo_documento === 'fattura_sanitaria').reduce((sum, f) => sum + (f.totale || f.importo), 0).toFixed(2)}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                filtroTipoDocumento === 'fattura_elettronica_pg' && "ring-2 ring-primary"
              )}
              onClick={() => setFiltroTipoDocumento(filtroTipoDocumento === 'fattura_elettronica_pg' ? null : 'fattura_elettronica_pg')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fatture Elettroniche</p>
                    <p className="text-2xl font-bold">
                      {fatture.filter(f => f.tipo_documento === 'fattura_elettronica_pg').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      €{fatture.filter(f => f.tipo_documento === 'fattura_elettronica_pg').reduce((sum, f) => sum + (f.totale || f.importo), 0).toFixed(2)}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                filtroTipoDocumento === 'preventivo' && "ring-2 ring-primary"
              )}
              onClick={() => setFiltroTipoDocumento(filtroTipoDocumento === 'preventivo' ? null : 'preventivo')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preventivi</p>
                    <p className="text-2xl font-bold">
                      {fatture.filter(f => f.tipo_documento === 'preventivo').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      €{fatture.filter(f => f.tipo_documento === 'preventivo').reduce((sum, f) => sum + (f.totale || f.importo), 0).toFixed(2)}
                    </p>
                  </div>
                  <FileQuestion className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                filtroTipoDocumento === 'fattura_proforma' && "ring-2 ring-primary"
              )}
              onClick={() => setFiltroTipoDocumento(filtroTipoDocumento === 'fattura_proforma' ? null : 'fattura_proforma')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fatture Proforma</p>
                    <p className="text-2xl font-bold">
                      {fatture.filter(f => f.tipo_documento === 'fattura_proforma').length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      €{fatture.filter(f => f.tipo_documento === 'fattura_proforma').reduce((sum, f) => sum + (f.totale || f.importo), 0).toFixed(2)}
                    </p>
                  </div>
                  <FileClock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="shadow-medical-sm">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex flex-col gap-4">
                <CardTitle>Documenti Emessi</CardTitle>
                
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cerca documento o paziente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select value={filtroStato} onValueChange={setFiltroStato}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutti">Tutti gli stati</SelectItem>
                      <SelectItem value="Da Inviare">Da Inviare</SelectItem>
                      <SelectItem value="Inviata TS">Inviata TS</SelectItem>
                      <SelectItem value="Inviata SDI">Inviata SDI</SelectItem>
                      <SelectItem value="Accettata">Accettata</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filtroPaziente} onValueChange={setFiltroPaziente}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutti">Tutti i pagamenti</SelectItem>
                      <SelectItem value="pagata">Pagate</SelectItem>
                      <SelectItem value="non_pagata">Non Pagate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort('numero')}
                    className="h-8 px-2 -ml-2 hover:bg-muted"
                  >
                    Numero
                    {sortField === 'numero' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSort('data')}
                    className="h-8 px-2 -ml-2 hover:bg-muted"
                  >
                    Data
                    {sortField === 'data' ? (
                      sortDirection === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Paziente</TableHead>
                <TableHead>Tipo Documento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Importo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Caricamento...
                  </TableCell>
                </TableRow>
              ) : filteredFatture.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nessuna fattura trovata
                  </TableCell>
                </TableRow>
              ) : (
                filteredFatture.map((fattura) => (
                  <TableRow 
                    key={fattura.id} 
                    ref={highlightedId === fattura.id ? highlightedRowRef : null}
                    className={cn(
                      "hover:bg-muted/30 transition-colors",
                      highlightedId === fattura.id && "bg-primary/10 animate-pulse"
                    )}
                  >
                    <TableCell className="font-mono font-medium">
                      {fattura.numero}
                      {/* Badge per documento convertito da un altro */}
                      {fattura.convertita_da_id && (() => {
                        const documentoOriginale = fatture.find(f => f.id === fattura.convertita_da_id);
                        if (documentoOriginale) {
                          const isFromProforma = documentoOriginale.tipo_documento === 'fattura_proforma';
                          const isFromPreventivo = documentoOriginale.tipo_documento === 'preventivo';
                          const isFromFattura = !isFromProforma && !isFromPreventivo;
                          
                          let bgColor = "bg-orange-100 text-orange-700 border-orange-300";
                          if (isFromProforma) bgColor = "bg-purple-100 text-purple-700 border-purple-300";
                          if (isFromFattura) bgColor = "bg-red-100 text-red-700 border-red-300";
                          
                          return (
                            <Badge variant="outline" className={cn("ml-2 text-xs", bgColor)}>
                              Da {documentoOriginale?.numero}
                            </Badge>
                          );
                        }
                      })()}
                      
                      {/* Badge per documento che è stato convertito in altro */}
                      {fattura.convertita_in_id && fattura.tipo_documento !== 'nota_credito' && (() => {
                        const documentoGenerato = fatture.find(f => f.id === fattura.convertita_in_id);
                        if (documentoGenerato) {
                          const isNotaCredito = documentoGenerato.tipo_documento === 'nota_credito';
                          
                          return (
                            <Badge variant="outline" className={cn(
                              "ml-2 text-xs",
                              isNotaCredito 
                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                : "bg-blue-100 text-blue-700 border-blue-300"
                            )}>
                              {isNotaCredito ? 'NC' : 'A'} {documentoGenerato?.numero}
                            </Badge>
                          );
                        }
                      })()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(fattura.data).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell className="font-medium">{getPazienteDisplayName(fattura)}</TableCell>
                    <TableCell>{getTipoDocumentoBadge(fattura.tipo_documento)}</TableCell>
                    <TableCell>
                      {fattura.tipo_documento === 'preventivo' ? (
                        fattura.pagata ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accettato
                          </Badge>
                        ) : (
                          <Badge variant="outline">Non accettato</Badge>
                        )
                      ) : (
                        fattura.pagata ? (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pagata
                          </Badge>
                        ) : (
                          <Badge variant="outline">Non pagata</Badge>
                        )
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      €{Number(fattura.totale || fattura.importo).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatoBadge(fattura.stato)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-background">
                          <DropdownMenuItem 
                            onClick={() => handleViewPDF(fattura)}
                            disabled={generatingPdf === fattura.id}
                          >
                            {generatingPdf === fattura.id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4 mr-2" />
                            )}
                            Visualizza PDF
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => handlePrintPDF(fattura)}
                            disabled={generatingPdf === fattura.id}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Stampa
                          </DropdownMenuItem>

                          <DropdownMenuItem 
                            onClick={() => handleRegeneratePDF(fattura)}
                            disabled={generatingPdf === fattura.id}
                          >
                            {generatingPdf === fattura.id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Rigenera PDF
                          </DropdownMenuItem>

                          {!fattura.pagata && fattura.tipo_documento !== 'preventivo' && fattura.tipo_documento !== 'fattura_proforma' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openPaymentDialog(fattura)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Segna come pagata
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.tipo_documento === 'preventivo' && !fattura.pagata && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAccettaPreventivo(fattura)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accetta preventivo
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.tipo_documento === 'preventivo' && fattura.pagata && !fattura.convertita_in_id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleConvertiPreventivoInFattura(fattura)}
                                className="text-primary"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Converti in fattura
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.tipo_documento === 'preventivo' && fattura.convertita_in_id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  // Reset filtri per assicurarsi che la fattura sia visibile
                                  setFiltroTipoDocumento("");
                                  setFiltroStato("tutti");
                                  setFiltroPaziente("tutti");
                                  setSearchTerm("");
                                  
                                  // Aggiorna URL con parametro highlight
                                  const newSearchParams = new URLSearchParams(searchParams);
                                  newSearchParams.set('highlight', fattura.convertita_in_id);
                                  setSearchParams(newSearchParams);
                                }}
                                className="text-primary"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Vai alla fattura
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.tipo_documento === 'fattura_proforma' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditClick(fattura)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifica pro forma
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.tipo_documento === 'fattura_proforma' && !fattura.pagata && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAccettaProforma(fattura)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Segna come pagata
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.tipo_documento === 'fattura_proforma' && fattura.pagata && !fattura.convertita_in_id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleConvertiProformaInFattura(fattura)}
                                className="text-primary"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Converti in fattura
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.tipo_documento === 'fattura_proforma' && fattura.convertita_in_id && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setFiltroTipoDocumento("");
                                  setFiltroStato("tutti");
                                  setFiltroPaziente("tutti");
                                  setSearchTerm("");
                                  
                                  const newSearchParams = new URLSearchParams(searchParams);
                                  newSearchParams.set('highlight', fattura.convertita_in_id);
                                  setSearchParams(newSearchParams);
                                }}
                                className="text-primary"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Vai alla fattura
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.tipo_documento === 'preventivo' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditClick(fattura)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifica preventivo
                              </DropdownMenuItem>
                            </>
                          )}

          {/* Modifica e Crea Nota di Credito - Solo per Fatture Elettroniche */}
          {(fattura.tipo_documento === "fattura_elettronica_pg" || 
            fattura.tipo_documento === "fattura_elettronica_pa") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleEditClick(fattura)}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifica fattura
              </DropdownMenuItem>
              
              {!fattura.convertita_in_id && (
                <DropdownMenuItem 
                  onClick={() => handleCreaNotaCredito(fattura)}
                  className="text-blue-600"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Crea Nota di Credito
                </DropdownMenuItem>
              )}
            </>
          )}

          {/* Bottone per navigare alla nota di credito */}
          {fattura.tipo_documento !== 'nota_credito' && fattura.convertita_in_id && (() => {
            const notaCredito = fatture.find(f => f.id === fattura.convertita_in_id && f.tipo_documento === 'nota_credito');
            if (notaCredito) {
              return (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      setFiltroTipoDocumento("");
                      setFiltroStato("tutti");
                      setFiltroPaziente("tutti");
                      setSearchTerm("");
                      
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('highlight', fattura.convertita_in_id);
                      setSearchParams(newSearchParams);
                    }}
                    className="text-primary"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Vai alla Nota di Credito
                  </DropdownMenuItem>
                </>
              );
            }
          })()}

          {/* Bottone per navigare alla fattura originale dalla nota di credito */}
          {fattura.tipo_documento === 'nota_credito' && fattura.convertita_da_id && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  setFiltroTipoDocumento("");
                  setFiltroStato("tutti");
                  setFiltroPaziente("tutti");
                  setSearchTerm("");
                  
                  const newSearchParams = new URLSearchParams(searchParams);
                  newSearchParams.set('highlight', fattura.convertita_da_id);
                  setSearchParams(newSearchParams);
                }}
                className="text-primary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Vai alla Fattura Originale
              </DropdownMenuItem>
            </>
          )}

                          {fattura.tipo_documento === "fattura_sanitaria" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditClick(fattura)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Modifica fattura
                              </DropdownMenuItem>
                              
                              {!fattura.pagata && (
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteFattura(fattura)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Elimina fattura
                                </DropdownMenuItem>
                              )}
                            </>
                          )}

                          {fattura.pagata && fattura.tipo_documento === "fattura_sanitaria" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => navigate('/contabilita/sistema-ts')}
                                className="text-primary"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Apri Sistema TS
                              </DropdownMenuItem>
                            </>
                          )}

                          {fattura.stato === "Da Inviare" && (fattura.tipo_documento === "fattura_elettronica_pg" || fattura.tipo_documento === "fattura_elettronica_pa") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleSendSDI(fattura.id)}
                                disabled={sendingId === fattura.id}
                                className="text-primary"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Invia a SDI
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="entrata" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card 
              className={cn(
                "border-primary/20 bg-primary-light cursor-pointer transition-all hover:shadow-md",
                filtroFattureEntrata === null && "ring-2 ring-primary"
              )}
              onClick={() => setFiltroFattureEntrata(null)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Spese {format(new Date(), 'MMMM yyyy', { locale: it })}
                    </p>
                    <p className="text-2xl font-bold">
                      €{fattureInEntrata
                        .filter(f => {
                          const fatturaDate = new Date(f.data);
                          const now = new Date();
                          return fatturaDate.getMonth() === now.getMonth() && 
                                 fatturaDate.getFullYear() === now.getFullYear();
                        })
                        .reduce((sum, f) => sum + (f.importo || 0), 0)
                        .toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {fattureInEntrata.filter(f => {
                        const fatturaDate = new Date(f.data);
                        const now = new Date();
                        return fatturaDate.getMonth() === now.getMonth() && 
                               fatturaDate.getFullYear() === now.getFullYear();
                      }).length} {fattureInEntrata.filter(f => {
                        const fatturaDate = new Date(f.data);
                        const now = new Date();
                        return fatturaDate.getMonth() === now.getMonth() && 
                               fatturaDate.getFullYear() === now.getFullYear();
                      }).length === 1 ? 'documento' : 'documenti'}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                filtroFattureEntrata === 'xml' && "ring-2 ring-primary"
              )}
              onClick={() => setFiltroFattureEntrata(filtroFattureEntrata === 'xml' ? null : 'xml')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fatture XML</p>
                    <p className="text-2xl font-bold">
                      {fattureInEntrata.filter(f => f.xml_path).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      €{fattureInEntrata.filter(f => f.xml_path).reduce((sum, f) => sum + (f.importo || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <FileCode className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card 
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                filtroFattureEntrata === 'manuale' && "ring-2 ring-primary"
              )}
              onClick={() => setFiltroFattureEntrata(filtroFattureEntrata === 'manuale' ? null : 'manuale')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inserite Manualmente</p>
                    <p className="text-2xl font-bold">
                      {fattureInEntrata.filter(f => !f.xml_path).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      €{fattureInEntrata.filter(f => !f.xml_path).reduce((sum, f) => sum + (f.importo || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <PenTool className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-medical-sm">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Documenti Ricevuti</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setCaricaXMLDialogOpen(true)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Carica XML
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setInserisciFatturaInEntrataOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Inserisci Manualmente
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Cerca fornitore o numero..."
                      value={searchTermEntrata}
                      onChange={(e) => setSearchTermEntrata(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select value={filtroCategoriaEntrata} onValueChange={setFiltroCategoriaEntrata}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutte">Tutte le categorie</SelectItem>
                      <SelectItem value="materiali">Materiali</SelectItem>
                      <SelectItem value="servizi">Servizi</SelectItem>
                      <SelectItem value="affitto">Affitto</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filtroStatoPagamento} onValueChange={setFiltroStatoPagamento}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutti">Tutti</SelectItem>
                      <SelectItem value="pagata">Pagata</SelectItem>
                      <SelectItem value="da_pagare">Da Pagare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {fattureInEntrata.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Nessun documento ricevuto</p>
                  <p className="text-sm">Carica le fatture elettroniche ricevute o inserisci manualmente le spese</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Fornitore</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Importo</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fattureInEntrata
                      .filter(f => {
                        // Filtro tipo (xml/manuale)
                        if (filtroFattureEntrata === 'xml' && !f.xml_path) return false;
                        if (filtroFattureEntrata === 'manuale' && f.xml_path) return false;
                        
                        // Filtro ricerca
                        const searchLower = searchTermEntrata.toLowerCase();
                        const matchesSearch = !searchTermEntrata || 
                          f.numero.toLowerCase().includes(searchLower) || 
                          f.fornitore.toLowerCase().includes(searchLower);
                        
                        // Filtro categoria
                        const matchesCategoria = filtroCategoriaEntrata === 'tutte' || 
                          f.categoria === filtroCategoriaEntrata;
                        
                        // Filtro stato pagamento
                        const matchesStato = filtroStatoPagamento === 'tutti' ||
                          (filtroStatoPagamento === 'pagata' && f.pagata) ||
                          (filtroStatoPagamento === 'da_pagare' && !f.pagata);
                        
                        return matchesSearch && matchesCategoria && matchesStato;
                      })
                      .map((fattura) => (
                      <TableRow key={fattura.id}>
                        <TableCell className="font-medium">{fattura.numero}</TableCell>
                        <TableCell>{new Date(fattura.data).toLocaleDateString("it-IT")}</TableCell>
                        <TableCell>{fattura.fornitore}</TableCell>
                        <TableCell>
                          {fattura.categoria ? (
                            <Badge variant="outline" className="capitalize">
                              {fattura.categoria.replace('-', ' ')}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>€ {fattura.importo?.toFixed(2)}</TableCell>
                        <TableCell>
                          {fattura.pagata ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pagata
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                              Da Pagare
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setFatturaInEntrataToEdit(fattura);
                                setInserisciFatturaInEntrataOpen(true);
                              }}
                              title="Modifica fattura"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={async () => {
                                if (fattura.pdf_path) {
                                  const { data } = supabase.storage
                                    .from('fatture-in-entrata')
                                    .getPublicUrl(fattura.pdf_path);
                                  setCurrentInvoiceUrl(data.publicUrl);
                                  setCurrentInvoice(fattura);
                                  setAutoPrint(false);
                                  setIsPdfMode(true);
                                  setViewerOpen(true);
                                } else {
                                  toast({
                                    title: "Nessun PDF",
                                    description: "Non è stato caricato alcun PDF per questa fattura",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              title="Visualizza PDF"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!fattura.pagata && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteFatturaInEntrata(fattura)}
                              title="Elimina fattura"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Editor */}
            <Card className="shadow-medical-sm">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Personalizza Template</CardTitle>
                    <CardDescription>Modifica l'aspetto delle tue fatture</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TemplateEditor
                  settings={templateSettings}
                  onSettingsChange={setTemplateSettings}
                />
                <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                  <Button variant="outline" onClick={loadUserSettings}>
                    Annulla
                  </Button>
                  <Button onClick={handleSaveTemplate}>
                    Salva Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="shadow-medical-sm">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Anteprima</CardTitle>
                    <CardDescription>Come apparirà la tua fattura</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TemplatePreview settings={templateSettings} logoUrl={logo || undefined} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Impostazioni Dialog */}
      <Dialog open={impostazioniDialogOpen} onOpenChange={setImpostazioniDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Impostazioni Fatturazione</DialogTitle>
            <DialogDescription>
              Configura le impostazioni fiscali e i metodi di pagamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Impostazioni Fiscali */}
            <Card className="shadow-medical-sm">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Impostazioni Fiscali</CardTitle>
                    <CardDescription>Regime fiscale e cassa previdenziale</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="regime">Regime Fiscale *</Label>
                    <Select value={regimeFiscale} onValueChange={setRegimeFiscale}>
                      <SelectTrigger id="regime">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ordinario">Regime ordinario</SelectItem>
                        <SelectItem value="contribuenti_minimi">Regime dei contribuenti minimi (art. 1,c.96-117, L. 244/2007)</SelectItem>
                        <SelectItem value="agricoltura_pesca">Agricoltura e attività connesse e pesca (artt. 34 e 34-bis, D.P.R. 633/1972)</SelectItem>
                        <SelectItem value="sali_tabacchi">Vendita sali e tabacchi (art. 74, c.1, D.P.R. 633/1972) Commercio dei fiammiferi (art. 74, c.1, D.P.R. 633/1972)</SelectItem>
                        <SelectItem value="editoria">Editoria (art. 74, c.1, D.P.R. 633/1972)</SelectItem>
                        <SelectItem value="telefonia">Gestione di servizi di telefonia pubblica (art. 74, c.1, D.P.R. 633/1972)</SelectItem>
                        <SelectItem value="trasporto_sosta">Rivendita di documenti di trasporto pubblico e di sosta (art. 74, c.1, D.P.R. 633/1972)</SelectItem>
                        <SelectItem value="intrattenimenti">Intrattenimenti, giochi e altre attività di cui alla tariffa allegata al D.P.R. 640/72 (art. 74, c.6, D.P.R. 633/1972)</SelectItem>
                        <SelectItem value="viaggi_turismo">Agenzie di viaggi e turismo (art. 74-ter, D.P.R. 633/1972)</SelectItem>
                        <SelectItem value="agriturismo">Agriturismo (art. 5, c.2, L. 413/1991)</SelectItem>
                        <SelectItem value="vendite_domicilio">Vendite a domicilio (art. 25-bis, c.6, D.P.R. 600/1973)</SelectItem>
                        <SelectItem value="beni_usati">Rivendita di beni usati, di oggetti d'arte, d'antiquariato o da collezione (art. 36, D.L. 41/1995)</SelectItem>
                        <SelectItem value="aste_arte">Agenzie di vendite all'asta di oggetti d'arte, antiquariato o da collezione (art. 40-bis, D.L. 41/1995)</SelectItem>
                        <SelectItem value="iva_cassa_pa">IVA per cassa P.A. (art. 6, c.5, D.P.R. 633/1972)</SelectItem>
                        <SelectItem value="iva_cassa">IVA per cassa (art. 32-bis, D.L. 83/2012)</SelectItem>
                        <SelectItem value="altro">Altro</SelectItem>
                        <SelectItem value="forfettario">Regime forfettario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cassa">Cassa Previdenziale *</Label>
                    <Select value={cassaPrevidenziale} onValueChange={setCassaPrevidenziale}>
                      <SelectTrigger id="cassa">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enpam">ENPAM - Ente Nazionale di Previdenza ed Assistenza dei Medici e degli Odontoiatri</SelectItem>
                        <SelectItem value="enpap">ENPAP - Ente Nazionale di Previdenza e Assistenza per gli Psicologi</SelectItem>
                        <SelectItem value="enpab">ENPAB - Ente Nazionale di Previdenza e Assistenza dei Biologi</SelectItem>
                        <SelectItem value="enpav">ENPAV - Ente Nazionale di Previdenza ed Assistenza dei Veterinari</SelectItem>
                        <SelectItem value="enpaf">ENPAF - Ente Nazionale di Previdenza e Assistenza dei Farmacisti</SelectItem>
                        <SelectItem value="enpapi">ENPAPI - Ente Nazionale di Previdenza e Assistenza della Professione Infermieristica</SelectItem>
                        <SelectItem value="epap">EPAP - Ente di Previdenza e Assistenza Pluricategoriale</SelectItem>
                        <SelectItem value="inps_gestione_separata">Gestione Separata INPS</SelectItem>
                        <SelectItem value="inps_commercianti">INPS COMMERCIANTI - INPS Artigiani/Commercianti</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Rivalsa/Contributo integrativo */}
                {/* Rivalsa/Contributo integrativo */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="rivalsa-switch" className="text-base">Rivalsa/Contributo integrativo</Label>
                      <p className="text-sm text-muted-foreground">Attiva e configura la rivalsa previdenziale</p>
                    </div>
                    <Switch 
                      id="rivalsa-switch" 
                      checked={rivalsaAttiva} 
                      onCheckedChange={setRivalsaAttiva}
                    />
                  </div>
                  
                  {rivalsaAttiva && (
                    <div className="space-y-4 pl-6 border-l-2 border-muted">
                      <div className="space-y-2">
                        <Label htmlFor="aliquota-rivalsa">Percentuale Rivalsa (%)</Label>
                        <Input 
                          id="aliquota-rivalsa" 
                          type="number" 
                          placeholder="4" 
                          value={rivalsaPercentuale}
                          onChange={(e) => setRivalsaPercentuale(parseFloat(e.target.value) || 4)}
                          step="0.01" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Applicazione</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="rivalsa-separata" 
                              name="rivalsa-applicazione" 
                              value="separata"
                              checked={rivalsaApplicazione === 'separata'}
                              onChange={(e) => setRivalsaApplicazione(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="rivalsa-separata" className="font-normal cursor-pointer">
                              Aggiunta al prezzo prestazione
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="rivalsa-inclusa" 
                              name="rivalsa-applicazione" 
                              value="inclusa"
                              checked={rivalsaApplicazione === 'inclusa'}
                              onChange={(e) => setRivalsaApplicazione(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="rivalsa-inclusa" className="font-normal cursor-pointer">
                              Inclusa nel prezzo prestazione
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Ritenuta d'Acconto */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ritenuta-switch" className="text-base">Ritenuta d'Acconto</Label>
                      <p className="text-sm text-muted-foreground">Applica ritenuta d'acconto</p>
                    </div>
                    <Switch 
                      id="ritenuta-switch" 
                      checked={ritenutaAttiva} 
                      onCheckedChange={setRitenutaAttiva}
                    />
                  </div>
                  
                  {/* Mostra questi campi solo se la ritenuta è attivata */}
                  {ritenutaAttiva && (
                    <div className="space-y-4 pl-6 border-l-2 border-muted">
                      <div className="space-y-2">
                        <Label htmlFor="aliquota-ritenuta">Aliquota (%)</Label>
                        <Input 
                          id="aliquota-ritenuta" 
                          type="number" 
                          placeholder="20" 
                          value={ritenutaAliquota}
                          onChange={(e) => setRitenutaAliquota(parseFloat(e.target.value) || 20)}
                          step="0.01" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tipo-ritenuta">Tipo di Ritenuta</Label>
                        <Select value={ritenutaTipo} onValueChange={setRitenutaTipo}>
                          <SelectTrigger id="tipo-ritenuta">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="persone-fisiche">Ritenuta di acconto persone fisiche</SelectItem>
                            <SelectItem value="persone-giuridiche">Ritenuta di acconto persone giuridiche</SelectItem>
                            <SelectItem value="inps">Contributo INPS</SelectItem>
                            <SelectItem value="enasarco">Contributo ENASARCO</SelectItem>
                            <SelectItem value="enpam">Contributo ENPAM</SelectItem>
                            <SelectItem value="altro">Altro contributo previdenziale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="causale-pagamento">Causale di Pagamento</Label>
                        <Select value={ritenutaCausale} onValueChange={setRitenutaCausale}>
                          <SelectTrigger id="causale-pagamento">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            <SelectItem value="A">A - Prestazioni di lavoro autonomo</SelectItem>
                            <SelectItem value="B">B - Utilizzazione economica opere dell'ingegno</SelectItem>
                            <SelectItem value="C">C - Utili da contratti di associazione in partecipazione</SelectItem>
                            <SelectItem value="D">D - Utili spettanti ai soci promotori e fondatori</SelectItem>
                            <SelectItem value="E">E - Levata di protesti cambiari</SelectItem>
                            <SelectItem value="G">G - Indennità cessazione attività sportiva professionale</SelectItem>
                            <SelectItem value="H">H - Indennità cessazione rapporti di agenzia</SelectItem>
                            <SelectItem value="I">I - Indennità cessazione da funzioni notarili</SelectItem>
                            <SelectItem value="L">L - Utilizzazione economica opere (soggetto diverso)</SelectItem>
                            <SelectItem value="M">M - Prestazioni di lavoro autonomo non abituali</SelectItem>
                            <SelectItem value="N">N - Indennità trasferta e premi sportivi dilettantistici</SelectItem>
                            <SelectItem value="O">O - Prestazioni autonome non abituali senza obbligo gestione separata</SelectItem>
                            <SelectItem value="P">P - Compensi per uso attrezzature a non residenti</SelectItem>
                            <SelectItem value="Q">Q - Provvigioni ad agente monomandatario</SelectItem>
                            <SelectItem value="R">R - Provvigioni ad agente plurimandatario</SelectItem>
                            <SelectItem value="S">S - Provvigioni a commissionario</SelectItem>
                            <SelectItem value="T">T - Provvigioni a mediatore</SelectItem>
                            <SelectItem value="U">U - Provvigioni a procacciatore d'affari</SelectItem>
                            <SelectItem value="V">V - Provvigioni vendite a domicilio e ambulanti</SelectItem>
                            <SelectItem value="W">W - Corrispettivi contratti d'appalto (2013)</SelectItem>
                            <SelectItem value="X">X - Canoni corrisposti 2004</SelectItem>
                            <SelectItem value="Y">Y - Canoni corrisposti 2005</SelectItem>
                            <SelectItem value="Z">Z - Titolo diverso dai precedenti</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Bollo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="bollo-switch" className="text-base">Marca da Bollo</Label>
                      <p className="text-sm text-muted-foreground">Applica marca da bollo alle fatture</p>
                    </div>
                    <Switch 
                      id="bollo-switch" 
                      checked={bolloAttivo} 
                      onCheckedChange={setBolloAttivo}
                    />
                  </div>
                  
                  {bolloAttivo && (
                    <div className="space-y-4 pl-6 border-l-2 border-muted">
                      <div className="space-y-2">
                        <Label htmlFor="importo-bollo">Importo Marca da Bollo (€)</Label>
                        <Input 
                          id="importo-bollo" 
                          type="number" 
                          placeholder="2.00" 
                          value={bolloImporto}
                          onChange={(e) => setBolloImporto(parseFloat(e.target.value) || 2.00)}
                          step="0.01" 
                        />
                        <p className="text-xs text-muted-foreground">
                          Il bollo verrà applicato automaticamente se la prestazione supera i 77,47 €
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Bollo a carico di</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="bollo-paziente" 
                              name="bollo-carico" 
                              value="paziente"
                              checked={bolloCarico === 'paziente'}
                              onChange={(e) => setBolloCarico(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="bollo-paziente" className="font-normal cursor-pointer">
                              Paziente
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              id="bollo-professionista" 
                              name="bollo-carico" 
                              value="professionista"
                              checked={bolloCarico === 'professionista'}
                              onChange={(e) => setBolloCarico(e.target.value)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor="bollo-professionista" className="font-normal cursor-pointer">
                              Professionista
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="bollo-virtuale" 
                            checked={bolloVirtuale}
                            onChange={(e) => setBolloVirtuale(e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <Label htmlFor="bollo-virtuale" className="font-normal cursor-pointer">
                            Bollo assolto in maniera virtuale
                          </Label>
                        </div>
                        {bolloVirtuale && (
                          <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-xs text-muted-foreground">
                              Attivando questa opzione comparirà nel PDF la dicitura 'marca da bollo assolta in maniera virtuale'. 
                              Non serve acquistarla fisicamente, ma dovrai versarla trimestralmente con F24. Consulta il tuo commercialista.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Metodi di Pagamento */}
            <Card className="shadow-medical-sm">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Metodi di Pagamento</CardTitle>
                    <CardDescription>Configura i metodi di pagamento predefiniti</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <Label className="text-base">Metodi di Pagamento Accettati</Label>
                  <div className="space-y-3">
                    {[
                      { id: 'contanti', label: 'Contanti' },
                      { id: 'carta-credito', label: 'Carta di credito' },
                      { id: 'carta-debito', label: 'Carta di debito' },
                      { id: 'bonifico', label: 'Bonifico bancario' },
                      { id: 'assegno', label: 'Assegno' },
                      { id: 'paypal', label: 'PayPal' },
                      { id: 'altro', label: 'Altro' },
                    ].map((metodo) => (
                      <div key={metodo.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`metodo-${metodo.id}`}
                          checked={metodiPagamento.has(metodo.id)}
                          onChange={(e) => {
                            const newMetodi = new Set(metodiPagamento);
                            if (e.target.checked) {
                              newMetodi.add(metodo.id);
                            } else {
                              newMetodi.delete(metodo.id);
                            }
                            setMetodiPagamento(newMetodi);
                          }}
                          className="h-4 w-4 rounded border-input"
                        />
                        <Label htmlFor={`metodo-${metodo.id}`} className="font-normal cursor-pointer">
                          {metodo.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {metodiPagamento.has('altro') && (
                  <div className="space-y-2">
                    <Label htmlFor="altro-metodo">Specifica altro metodo di pagamento</Label>
                    <Input 
                      id="altro-metodo" 
                      placeholder="Es: Satispay, Revolut, ecc." 
                      value={altroMetodo}
                      onChange={(e) => setAltroMetodo(e.target.value)}
                    />
                  </div>
                )}
                
                {metodiPagamento.has('bonifico') && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-medium text-sm">Informazioni Bonifico Bancario</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nome-banca">Nome Banca</Label>
                        <Input 
                          id="nome-banca" 
                          placeholder="Es: Banca Intesa" 
                          value={nomeBanca}
                          onChange={(e) => setNomeBanca(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="intestatario">Intestatario Conto Corrente</Label>
                        <Input 
                          id="intestatario" 
                          placeholder="Nome e Cognome" 
                          value={intestatarioCc}
                          onChange={(e) => setIntestatarioCc(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="iban">IBAN</Label>
                        <Input 
                          id="iban" 
                          placeholder="IT00X0000000000000000000000" 
                          value={iban}
                          onChange={(e) => setIban(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bic-swift">BIC/SWIFT</Label>
                        <Input 
                          id="bic-swift" 
                          placeholder="BCITITMM" 
                          value={bicSwift}
                          onChange={(e) => setBicSwift(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Azioni */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setImpostazioniDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={saveUserSettings}>
                Salva Modifiche
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Convert Dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converti Documento</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi convertire {fatturaToConvert?.tipo_documento === 'preventivo' ? 'il preventivo' : 'la fattura pro forma'} {fatturaToConvert?.numero} in una fattura definitiva?
              <br /><br />
              Verrà creata una nuova fattura con un nuovo numero progressivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConvert}>Converti</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Dialog */}
      <AlertDialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Segna come Pagata</AlertDialogTitle>
            <AlertDialogDescription>
              Inserisci la data di pagamento per la fattura {fatturaToMarkPaid?.numero}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="payment-date" className="mb-2 block">Data Pagamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: it }) : <span>Seleziona data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMarkAsPaid} disabled={!paymentDate}>
              Conferma Pagamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Alert Dialog */}
      <AlertDialog open={editAlertOpen} onOpenChange={setEditAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Attenzione: Modifica Documento</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingEditFattura?.tipo_documento === 'preventivo' && pendingEditFattura?.pagata && (
                <>
                  Questo preventivo è stato <strong>accettato dal cliente</strong>.
                  <br />
                  Modificarlo potrebbe causare discrepanze con quanto concordato.
                  <br /><br />
                </>
              )}
              {pendingEditFattura?.tipo_documento === 'fattura_proforma' && pendingEditFattura?.pagata && (
                <>
                  Questa fattura pro forma è stata <strong>pagata</strong>.
                  <br />
                  Modificarla potrebbe causare discrepanze con quanto concordato.
                  <br /><br />
                </>
              )}
              {pendingEditFattura?.tipo_documento === 'fattura_proforma' && pendingEditFattura?.convertita_in_id && (
                <>
                  Questa fattura pro forma è stata <strong>convertita in fattura definitiva</strong>.
                  <br />
                  Modificarla potrebbe causare discrepanze con la fattura generata.
                  <br /><br />
                </>
              )}
              {pendingEditFattura?.pagata && pendingEditFattura?.tipo_documento !== 'preventivo' && pendingEditFattura?.tipo_documento !== 'fattura_proforma' && (
                <>
                  Questa fattura risulta <strong>già pagata</strong>.
                  <br />
                </>
              )}
              {(pendingEditFattura?.stato === "Inviata al Sistema TS" || pendingEditFattura?.stato === "Inviata") && (
                <>
                  Questa fattura è stata <strong>inviata al Sistema TS</strong>.
                  <br />
                </>
              )}
              {pendingEditFattura?.sdi_stato && pendingEditFattura?.sdi_stato !== "Da Inviare" && (
                <>
                  Questa fattura è stata <strong>inviata al SDI</strong> (Stato: {pendingEditFattura.sdi_stato}).
                  <br />
                </>
              )}
              {pendingEditFattura?.tipo_documento !== 'preventivo' && pendingEditFattura?.tipo_documento !== 'fattura_proforma' && (
                <>
                  <br />
                  Modificando la fattura potresti creare incongruenze nei dati contabili.
                  <br />
                </>
              )}
              Sei sicuro di voler procedere con la modifica?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingEditFattura(null)}>
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmEdit}>
              Procedi con la Modifica
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Fattura da Prestazioni */}
      <NuovaFatturaDialog
        open={showNuovaFatturaDialog}
        onOpenChange={(open) => {
          setShowNuovaFatturaDialog(open);
          if (!open) {
            setPrestazioniPerFattura([]);
            setFatturaToEdit(null);
          }
        }}
        onFatturaAdded={() => {
          loadFatture();
          loadPrestazioniDaFatturare();
          setSelectedPrestazioni(new Set());
          setPrestazioniPerFattura([]);
          setShowNuovaFatturaDialog(false);
          setFatturaToEdit(null);
        }}
        prestazioniPrecompilate={prestazioniPerFattura}
        metodiPagamento={Array.from(metodiPagamento)}
        fatturaToEdit={fatturaToEdit}
        trigger={<span style={{ display: 'none' }} />}
      />

      <InserisciFatturaInEntrataDialog
        open={inserisciFatturaInEntrataOpen}
        onOpenChange={(open) => {
          setInserisciFatturaInEntrataOpen(open);
          if (!open) {
            setFatturaInEntrataToEdit(null);
          }
        }}
        onSuccess={() => {
          loadFattureInEntrata();
          setFatturaInEntrataToEdit(null);
        }}
        fatturaToEdit={fatturaInEntrataToEdit}
      />

      <CaricaFatturaXMLDialog
        open={caricaXMLDialogOpen}
        onOpenChange={setCaricaXMLDialogOpen}
        onSuccess={() => {
          loadFattureInEntrata();
        }}
      />

      {/* Dialog Nota di Credito */}
      {showNotaCreditoDialog && notaCreditoFattura && (
        <NuovaFatturaDialog
          onFatturaAdded={() => {
            loadFatture();
            setShowNotaCreditoDialog(false);
            setNotaCreditoFattura(null);
          }}
          open={showNotaCreditoDialog}
          onOpenChange={setShowNotaCreditoDialog}
          metodiPagamento={Array.from(metodiPagamento)}
          fatturaToEdit={{
            paziente_id: notaCreditoFattura.paziente_id,
            tipo_documento: "nota_credito",
            metodo_pagamento: notaCreditoFattura.metodo_pagamento,
            fattura_originale_id: notaCreditoFattura.id,
            fattura_originale_numero: notaCreditoFattura.numero,
            fattura_originale_data: notaCreditoFattura.data,
            stato: "Da Inviare",
            fatture_dettagli: notaCreditoFattura.fatture_dettagli || [],
            convertita_da_id: notaCreditoFattura.id,
          }}
          trigger={<span style={{ display: 'none' }} />}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la fattura {fatturaToDelete?.numero}?
              <br /><br />
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InvoiceViewer
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setCurrentInvoiceUrl(null);
          setCurrentInvoice(null);
          setAutoPrint(false);
          setIsPdfMode(false);
        }}
        htmlUrl={currentInvoiceUrl}
        invoice={currentInvoice}
        autoPrint={autoPrint}
        isPdf={isPdfMode}
      />
    </div>
  );
};

export default Fatture;
