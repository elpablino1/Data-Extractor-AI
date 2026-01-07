import React, { useEffect, useState } from 'react';
import { ReportBuilder } from '../ReportEngine/ReportBuilder';
import { X } from 'lucide-react';

// Extend window type for Electron API
declare global {
    interface Window {
        electronAPI?: {
            saveHtmlFile: (content: string, defaultFilename: string) => Promise<{
                success: boolean;
                filePath?: string;
                canceled?: boolean;
                error?: string;
            }>;
            setReportData: (data: any) => Promise<{ success: boolean }>;
            getReportData: () => Promise<any>;
        };
    }
}

export const ReportView: React.FC = () => {
    const [reportData, setReportData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load theme preference
        const loadTheme = () => {
            const theme = localStorage.getItem('theme') || 'dark';
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        loadTheme();
        window.addEventListener('storage', loadTheme);

        // Set language to Spanish to prevent Google Translate popup
        document.documentElement.lang = 'es';

        // Load report data
        const loadReportData = async () => {
            console.log('🔄 Cargando datos del reporte...');

            // Try Electron IPC first (more robust for large data)
            if (window.electronAPI && window.electronAPI.getReportData) {
                try {
                    console.log('📡 Intentando obtener datos vía Electron IPC...');
                    const ipcData = await window.electronAPI.getReportData();
                    if (ipcData) {
                        console.log('✅ Datos recibidos vía IPC');
                        setReportData(ipcData);
                        return;
                    }
                    console.log('ℹ️ No hay datos en IPC, probando localStorage...');
                } catch (err) {
                    console.error('❌ Error cargando datos vía IPC:', err);
                }
            }

            // Fallback to localStorage (Web or empty IPC)
            const data = localStorage.getItem('currentReport');
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.infographic && !Array.isArray(parsed.infographic)) {
                        parsed.infographic = [parsed.infographic];
                    }
                    console.log('✅ Datos recibidos vía localStorage');
                    setReportData(parsed);
                } catch (e) {
                    console.error('❌ Error parsing localStorage data:', e);
                    setError('Error al procesar los datos del reporte.');
                }
            } else {
                console.error('❌ No hay datos en localStorage ni IPC');
                setError('No se encontró información del reporte.');
            }
        };

        loadReportData();
        return () => window.removeEventListener('storage', loadTheme);
    }, []);

    const prepareExportContent = async () => {
        const element = document.getElementById('report-container');
        if (!element) return null;

        // Clone the element to manipulate it without affecting the view
        const clone = element.cloneNode(true) as HTMLElement;

        // Convert all canvas elements (charts) to images in the clone
        const originalCanvases = element.querySelectorAll('canvas');
        const cloneCanvases = clone.querySelectorAll('canvas');

        originalCanvases.forEach((canvas, index) => {
            if (cloneCanvases[index]) {
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.style.width = '100%';
                img.style.height = 'auto';
                img.className = canvas.className; // Keep classes
                cloneCanvases[index].parentNode?.replaceChild(img, cloneCanvases[index]);
            }
        });

        return clone;
    };

    const handleExportHTML = async () => {
        console.log('📥 Iniciando exportación HTML...');
        if (!reportData) {
            console.error('❌ No hay datos de reporte');
            return;
        }

        console.log('1️⃣ Preparando contenido...');
        const clone = await prepareExportContent();
        if (!clone) {
            console.error('❌ No se pudo clonar el contenido del reporte');
            alert('Error: No se pudo preparar el contenido para exportar');
            return;
        }

        console.log('2️⃣ Contenido clonado exitosamente');
        const isDark = document.documentElement.classList.contains('dark');
        const bgColor = isDark ? '#0D0D0D' : '#ffffff';
        const textColor = isDark ? '#ffffff' : '#000000';

        const reportTitle = reportData.infographic?.[0]?.title || 'Sin título';

        const htmlContent = `<!DOCTYPE html>
<html lang="es" translate="no" class="${isDark ? 'dark' : ''}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="google" content="notranslate">
    <title>Reporte - ${reportTitle}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        'brand-pres-bg': '#0D0D0D',
                        'brand-pres-card': '#1A1A1A',
                        'brand-pres-teal': '#00F0B5',
                        'brand-pres-pink': '#FF0099',
                        'brand-pres-blue': '#38BDF8',
                    },
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif']
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: ${bgColor};
            color: ${textColor};
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
        }
        #report-container {
            padding: 4rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        .text-white { color: white !important; }
        .font-black { font-weight: 900 !important; }
        .font-bold { font-weight: 700 !important; }
        img { max-width: 100%; height: auto; border-radius: 1.5rem; margin-top: 1rem; }
        .bg-white/5 { background-color: rgba(255, 255, 255, 0.05) !important; }
        .backdrop-blur-xl { backdrop-filter: blur(24px) !important; }
        .rounded-3xl { border-radius: 1.5rem !important; }
        .border-white/10 { border: 1px solid rgba(255, 255, 255, 0.1) !important; }
    </style>
</head>
<body class="${isDark ? 'dark' : ''} bg-white dark:bg-brand-pres-bg text-gray-900 dark:text-white p-8">
    <div class="max-w-7xl mx-auto">
        ${clone.innerHTML}
    </div>
</body>
</html>`;

        console.log('3️⃣ HTML generado, tamaño:', htmlContent.length, 'bytes');

        try {
            // Check if Electron API is available
            if (window.electronAPI && window.electronAPI.saveHtmlFile) {
                console.log('4️⃣ Usando Electron save dialog...');

                const filename = `reporte-${new Date().toISOString().slice(0, 10)}-${Date.now()}.html`;

                const result = await window.electronAPI.saveHtmlFile(htmlContent, filename);

                if (result.success) {
                    console.log('✅ Archivo guardado exitosamente:', result.filePath);
                    alert(`✅ Reporte guardado correctamente en:\n${result.filePath}`);
                } else if (result.canceled) {
                    console.log('ℹ️ Usuario canceló la descarga');
                } else {
                    console.error('❌ Error al guardar:', result.error);
                    alert('Error al guardar el archivo: ' + result.error);
                }
            } else {
                // Fallback to browser download if not in Electron
                console.log('4️⃣ Electron no disponible, usando browser download...');
                const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                const filename = `reporte-${new Date().toISOString().slice(0, 10)}-${Date.now()}.html`;

                link.href = url;
                link.download = filename;
                link.style.display = 'none';

                document.body.appendChild(link);

                setTimeout(() => {
                    link.click();
                    console.log('✅ Descarga iniciada:', filename);

                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        console.log('🧹 Cleanup completado');
                    }, 100);
                }, 10);
            }

        } catch (error) {
            console.error('❌ Error al descargar:', error);
            alert('Error al descargar el archivo HTML: ' + (error as Error).message);
        }
    };

    const handleCloseWindow = () => {
        window.close();
    };

    const renderContent = () => {

        if (error) {
            return (
                <div className="h-screen flex items-center justify-center bg-white dark:bg-brand-pres-bg">
                    <div className="text-center p-8">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={handleCloseWindow}
                            className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-lg text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                        >
                            Cerrar Ventana
                        </button>
                    </div>
                </div>
            );
        }

        if (!reportData) {
            return (
                <div className="h-screen flex items-center justify-center bg-white dark:bg-brand-pres-bg">
                    <div className="text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-brand-pres-teal border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Cargando reporte...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="h-screen flex flex-col bg-brand-pres-bg text-white overflow-hidden font-sans">
                {/* Header with Download Button */}
                <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
                    <h1 className="text-lg font-semibold">Reporte Generado</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportHTML}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-pres-teal hover:bg-brand-pres-teal/80 text-black font-medium rounded-lg transition-colors"
                            title="Descargar como HTML"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Descargar HTML
                        </button>
                    </div>
                </div>

                {/* Report Content - Scrollable Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div id="report-container" className="py-12 px-8 max-w-7xl mx-auto min-h-screen bg-brand-pres-bg">

                        {/* Dynamic Header is now handled by ReportBuilder -> HeaderSection */}
                        <ReportBuilder data={reportData} />

                        {/* Footer */}
                        <footer className="text-center text-gray-500 text-xs mt-16 pb-8 border-t border-white/5 pt-8">
                            <p>© {new Date().getFullYear()} - Reporte generado con AI Data Extractor</p>
                        </footer>
                    </div>
                </div>
            </div>
        );
    };

    return renderContent();
};
