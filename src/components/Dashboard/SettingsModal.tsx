import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    userEmail?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onLogout, userEmail }) => {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('gemini-2.5-flash');
    const theme = 'dark'; // Force dark mode

    useEffect(() => {
        if (isOpen) {
            setApiKey(localStorage.getItem('geminiApiKey') || '');
            setModel(localStorage.getItem('geminiModel') || 'gemini-2.5-flash');
            localStorage.setItem('theme', 'dark'); // Ensure it's dark
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('geminiApiKey', apiKey);
        localStorage.setItem('geminiModel', model);
        localStorage.setItem('theme', theme);
        window.dispatchEvent(new Event('storage')); // Trigger update
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-dark-bg border border-dark-border rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Configuración</h2>
                        {userEmail && (
                            <p className="text-xs text-gray-400 mt-1">
                                Sesión: <span className="text-brand-pres-teal">{userEmail}</span>
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Modelo de IA</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full bg-black/20 border border-dark-border rounded-lg p-3 text-white focus:ring-2 focus:ring-brand outline-none appearance-none"
                        >
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado - Rápido)</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Más Potente)</option>
                            <option value="gemini-3.0-pro">Gemini 3.0 Pro (El Más Avanzado)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2">
                            Gemini 2.5 Flash es rápido y confiable. 3.0 Pro ofrece el mejor rendimiento.
                        </p>
                    </div>

                    {/* Theme option removed for Signature Dark branding */}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Gemini API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-black/20 border border-dark-border rounded-lg p-3 text-white focus:ring-2 focus:ring-brand outline-none"
                            placeholder="AIzaSy..."
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Tu clave se guarda localmente en tu dispositivo.
                        </p>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-dark-border">
                        <button onClick={onLogout} className="text-red-400 hover:text-red-300 text-sm font-medium">
                            Cerrar Sesión
                        </button>
                        <button onClick={handleSave} className="btn btn-primary">
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
