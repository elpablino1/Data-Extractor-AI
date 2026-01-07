import React, { useCallback, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { processFile, type ProcessedItem } from '../../services/fileProcessor';

interface FileUploaderProps {
    onFilesProcessed: (items: ProcessedItem[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesProcessed }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFiles = async (files: File[]) => {
        setProcessing(true);
        setError(null);
        const results: ProcessedItem[] = [];

        try {
            for (const file of files) {
                // Accept images and spreadsheets
                const isImage = file.type.startsWith('image/');
                const isSpreadsheet = file.name.match(/\.(xls|xlsx|csv)$/i);

                if (!isImage && !isSpreadsheet) {
                    continue;
                }

                const result = await processFile(file);
                results.push(result);
            }

            if (results.length > 0) {
                onFilesProcessed(results);
            } else if (files.length > 0) {
                setError("No se pudieron procesar los archivos. Asegúrate de que sean Excel, CSV o Imágenes de marca.");
            }
        } catch (err) {
            setError("Error inesperado al procesar archivos.");
        } finally {
            setProcessing(false);
            setIsDragging(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            processFiles(files);
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${isDragging
                        ? 'border-brand bg-brand/10'
                        : 'border-dark-border hover:border-brand/50 hover:bg-white/5'
                    }
        `}
            >
                <input
                    type="file"
                    multiple
                    accept=".xls,.xlsx,.csv,image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={processing}
                />

                <div className="flex flex-col items-center gap-3">
                    {processing ? (
                        <Loader2 className="w-10 h-10 text-brand animate-spin" />
                    ) : (
                        <Upload className={`w-10 h-10 ${isDragging ? 'text-brand' : 'text-gray-400'}`} />
                    )}

                    <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">
                            {processing ? 'Procesando...' : 'Arrastra archivos aquí'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            o haz clic para seleccionar (Excel, CSV, Logos)
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
                    {error}
                </div>
            )}
        </div>
    );
};
