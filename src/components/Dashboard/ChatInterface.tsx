import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import type { ProcessedFile, BrandAsset } from '../../services/fileProcessor';
import ReactMarkdown from 'react-markdown';
import { callGemini, type ChatMessage } from '../../services/gemini';

interface ChatInterfaceProps {
    files: ProcessedFile[];
    brandAssets?: BrandAsset[];
    onOpenSettings: () => void;
    onShowReport: (data: any) => void;
    messages: ChatMessage[];
    onMessagesChange: (messages: ChatMessage[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    files,
    brandAssets = [],
    onShowReport,
    messages,
    onMessagesChange
}) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (files.length === 0) {
            setSmartSuggestions([]);
            return;
        }

        const newSuggestions: string[] = [];
        files.forEach(f => {
            const activeSheets = f.sheets.filter(s => s.isActive !== false);
            if (activeSheets.length === 0) return;

            activeSheets.forEach(s => {
                const headers = s.headers.map(h => h.toLowerCase());
                if (headers.some(h => h.includes('fecha') || h.includes('date') || h.includes('time') || h.includes('año') || h.includes('mes'))) {
                    newSuggestions.push(`Analiza la tendencia temporal en ${s.name}`);
                }
                if (headers.some(h => h.includes('venta') || h.includes('precio') || h.includes('costo') || h.includes('total') || h.includes('amount') || h.includes('revenue'))) {
                    newSuggestions.push(`Reporte de ingresos para ${s.name}`);
                }
                if (headers.some(h => h.includes('categoria') || h.includes('tipo') || h.includes('estado') || h.includes('status') || h.includes('grupo'))) {
                    newSuggestions.push(`Distribución por categorías en ${s.name}`);
                }
            });
        });

        const unique = [...new Set(newSuggestions)].slice(0, 4);
        if (unique.length > 0) {
            setSmartSuggestions(unique);
        } else {
            setSmartSuggestions([
                "Genera un reporte visual de los datos",
                "Identifica los 3 hallazgos más importantes",
                "Resume la estructura de los archivos cargados"
            ]);
        }
    }, [files]);

    const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
        if (e) e.preventDefault();
        const textToSend = overrideInput || input;
        if (!textToSend.trim()) return;

        const userMsg: ChatMessage = { role: 'user', text: textToSend };
        const newMessagesContext = [...messages, userMsg];
        onMessagesChange(newMessagesContext);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        const reportKeywords = ['reporte', 'informe', 'gráfica', 'infografía', 'visualización', 'grafico', 'graficar', 'crea un reporte'];
        const isReportRequest = reportKeywords.some(k => textToSend.toLowerCase().includes(k));
        const apiKey = localStorage.getItem('geminiApiKey');

        // Construct context from files - DEEP NARRATIVE EXTRACTION WITH SMART PROFILING
        let context = "";


        // 1. FULL ROW CONVERSION (NARRATIVE)
        // We convert EVERY row to text. No truncation/stats relying prompt.
        let fullNarrative = "";

        if (files.length > 0) {
            files.forEach(f => {
                f.sheets.forEach(s => {
                    if (s.isActive === false) return;
                    fullNarrative += `\nFILE: ${f.name} | SHEET: ${s.name}\nHEADERS: ${s.headers.join(', ')}\n`;
                    s.data.forEach((row, idx) => {
                        const line = s.headers.map(h => `${h}:${row[h] || 'N/A'}`).join(' | ');
                        fullNarrative += `Row ${idx + 1}: ${line}\n`;
                    });
                });
            });
        }
        const chunks: string[] = [];
        const TOKEN_LIMIT_CHARS = 300000; // Optimized for ~1500 rows single-shot (Gemini Flash context is large)
        if (fullNarrative.length > TOKEN_LIMIT_CHARS) {
            for (let i = 0; i < fullNarrative.length; i += TOKEN_LIMIT_CHARS) {
                chunks.push(fullNarrative.slice(i, i + TOKEN_LIMIT_CHARS));
            }
        } else {
            chunks.push(fullNarrative);
        }

        // Branding context
        let brandingContext = "";
        if (brandAssets.length > 0) {
            brandingContext = `\n--- BRANDING REFERENCIAL (Assets Cargados) ---\n`;
            brandingContext += `Se han proporcionado ${brandAssets.length} imagen(es) de marca. Analízalas para extraer:\n`;
            brandingContext += `1. Colores corporativos (específicamente el color primario y secundario).\n`;
            brandingContext += `2. Estilo visual sugerido.\n\n`;
        }

        const analystPrompt = `Eres AI Data Extractor, el motor de inteligencia de datos más avanzado. Tu objetivo es conversar sobre los datos de forma clara, técnica y brillante.\n\nREGLAS:\n1. Siempre responde como AI Data Extractor.\n2. No generes JSON.\n3. Proporciona una narrativa profunda, no solo repitas estadísticas.\n4. Usa tablas Markdown para comparativas.\n\nCONTEXTO:\n${context}`;

        const architectPrompt = `Eres un Director de Arte de Información Senior y Analista de Negocios. Tu objetivo es diseñar una infografía visual premium que resuma los datos con un estilo corporativo de alto nivel (Goldman Sachs/Deloitte).

REGLAS DE ORO:
1. BALANCE VISUAL: Prioriza gráficos y KPIs impactantes.
2. PROFUNDIDAD ESTRATÉGICA (NO DESCRIPTIVA): NO repitas los datos que ya se ven en los gráficos/tablas. Tu texto debe explicar el "POR QUÉ" y la "ESTRATEGIA", no describir el gráfico. Sé conciso pero brillante.
3. TABLAS OBLIGATORIAS: Si el usuario pide calendarios, listas, agendas o desgloses fila por fila, DEBES usar el componente "data_table".

RESPONDE EXCLUSIVAMENTE CON UN OBJETO JSON VÁLIDO.
SCHEMA REQUERIDO:
{
  "title": "Título General",
  "summary": "Resumen ejecutivo potente y detallado (3-5 oraciones)",
  "infographic": [
    { "type": "header", "title": "Título", "subtitle": "Conclusión principal" },
    { "type": "kpi_grid", "items": [{ "label": "X", "value": "Y", "trend": "up" }] },
    { "type": "data_table", "title": "Calendario/Lista", "headers": ["Col1", "Col2"], "rows": [["Fila1Col1", "Fila1Col2"], ["Fila2Col1", "Fila2Col2"]] },
    {
      "type": "chart",
      "chartType": "bar",
      "title": "Tendencia",
      "analysisText": "Análisis profundo y perspicaz de los datos mostrados. Extiéndete si es necesario.",
      "chartData": { "labels": [], "datasets": [] }
    }
  ]
}

BRANDING:
- Usa los colores de los assets corporativos (${brandAssets.length} assets).
${brandingContext}

CONTEXTO DE DATOS:
${context}`;

        const chosenPrompt = isReportRequest ? architectPrompt : analystPrompt;

        if (!apiKey) {
            onMessagesChange([...newMessagesContext, { role: 'model', text: 'Configura tu API Key en ajustes.' }]);
            return;
        }

        setLoading(true);
        try {
            const systemPrompt = `You are AI Data Extractor. PRECISE ANALYST.
            Your job is to read data chunks and extract insights with EXACTITUDE.
            Answer based ONLY on the provided data chunks.`;

            let finalResponse = "";

            if (chunks.length > 1) {
                // SEQUENTIAL BATCH PROCESSING
                const { processBatches } = await import('../../services/gemini');
                onMessagesChange([...newMessagesContext, {
                    role: 'model',
                    text: `Detectado archivo grande (${fullNarrative.length} caracteres). Procesando en ${chunks.length} bloques secuenciales para máxima precisión...`
                }]);

                const accumulatedAnalysis = await processBatches(
                    chunks,
                    systemPrompt,
                    apiKey,
                    (current, total) => {
                        // Progress update could go here
                    }
                );

                finalResponse = await callGemini(
                    [{ role: 'user', text: `Here is the accumulated analysis of all file chunks:\n${accumulatedAnalysis}\n\nUSER QUESTION: ${textToSend}\n\nProvide a final comprehensive answer.` }],
                    systemPrompt,
                    apiKey
                ) || "";

            } else {
                // SINGLE SHOT
                const contextMsg = `DATA CONTEXT:\n${chunks[0]}\n\nUSER QUESTION: ${textToSend}`;
                const attachments = brandAssets.map(asset => ({ mimeType: asset.type, data: asset.base64 || '' }));
                finalResponse = await callGemini(
                    [...messages.slice(-5), { role: 'user', text: contextMsg }],
                    systemPrompt,
                    apiKey,
                    false,
                    attachments
                ) || "";
            }

            if (finalResponse) {
                const cleanResponse = finalResponse.replace(/```json/g, '').replace(/```/g, '').trim();

                if (cleanResponse.startsWith('{') && cleanResponse.includes('infographic')) {
                    try {
                        const json = JSON.parse(cleanResponse);
                        if (json.infographic) {
                            const { validateReport, fixReportData } = await import('../../services/reportValidator');
                            let finalReport = json;
                            const validation = validateReport(json);
                            if (!validation.isValid) finalReport = fixReportData(json);

                            const reportId = crypto.randomUUID();
                            localStorage.setItem('currentReport', JSON.stringify({ ...finalReport, id: reportId }));
                            if (window.electronAPI && window.electronAPI.setReportData) {
                                await window.electronAPI.setReportData({ ...finalReport, id: reportId });
                            }
                            onShowReport(finalReport);
                            onMessagesChange([...newMessagesContext, { role: 'model', text: '¡Reporte generado!', reportId }]);
                            const reportUrl = `${window.location.origin}${window.location.pathname}#/report-view`;
                            window.open(reportUrl, '_blank', 'width=1280,height=800');
                            return;
                        }
                    } catch (e) { }
                }
                onMessagesChange([...newMessagesContext, { role: 'model', text: finalResponse }]);
            }

        } catch (error: any) {
            onMessagesChange([...newMessagesContext, { role: 'model', text: `Error: ${error.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => handleSend(undefined, suggestion);
    const handleCreateReport = () => handleSend(undefined, "Genera un reporte visual de los datos");

    const MarkdownComponents = {
        h1: ({ ...props }) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
        h2: ({ ...props }) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
        p: ({ ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
        table: ({ ...props }) => (
            <div className="overflow-x-auto mb-4 rounded-lg border border-white/10">
                <table className="min-w-full divide-y divide-white/10" {...props} />
            </div>
        ),
        th: ({ ...props }) => <th className="px-4 py-3 text-left text-xs font-medium opacity-70 uppercase tracking-wider" {...props} />,
        td: ({ ...props }) => <td className="px-4 py-3 text-sm whitespace-normal" {...props} />,
    };

    return (
        <div className="flex flex-col h-full bg-dark-bg border-l border-dark-border flex-1">
            <div className="p-4 border-b border-dark-border flex justify-between items-center bg-bg-secondary">
                <h3 className="font-bold text-primary flex items-center gap-2">
                    <Bot className="w-5 h-5 text-brand" /> Asistente IA
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center text-secondary mt-10">
                        <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm mb-6">Analicemos tus datos con Power Prompting.</p>
                        <div className="max-w-md mx-auto grid grid-cols-1 gap-2">
                            {smartSuggestions.map((s, i) => (
                                <button key={i} onClick={() => handleSuggestionClick(s)} className="text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm text-gray-300 hover:text-white">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg: ChatMessage, idx: number) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-chat-user-bg' : 'bg-bg-secondary'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-chat-user-bg text-white rounded-tr-none' : 'bg-chat-bot-bg text-white rounded-tl-none'}`}>
                            <ReactMarkdown components={MarkdownComponents as any}>{msg.text}</ReactMarkdown>
                            {msg.reportId && (
                                <button onClick={() => {
                                    const reportUrl = `${window.location.origin}${window.location.pathname}#/report-view`;
                                    window.open(reportUrl, '_blank');
                                }} className="mt-3 w-full py-2 bg-brand rounded-lg text-white text-xs font-bold shadow-lg">
                                    Ver Reporte Completo
                                </button>
                            )}
                            {msg.role === 'model' && !msg.reportId && (
                                <button onClick={handleCreateReport} className="mt-2 text-[10px] text-brand-light flex items-center gap-1 opacity-70 hover:opacity-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> Crear Reporte
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-chat-bot-bg p-3 rounded-2xl rounded-tl-none">
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-dark-border bg-bg-secondary">
                <div className="relative flex items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Escribe tu pregunta..."
                        className="w-full bg-dark-bg border border-dark-border rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder:text-gray-500 focus:ring-1 focus:ring-brand outline-none resize-none min-h-[44px]"
                        disabled={loading}
                        rows={1}
                    />
                    <button type="submit" title="Enviar" disabled={!input.trim() || loading} className="absolute right-2 bottom-2 p-1.5 text-brand disabled:opacity-50">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};
