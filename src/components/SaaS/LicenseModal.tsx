import React, { useState } from 'react';
import { useLicense } from '../../contexts/LicenseContext';
import { Lock, CheckCircle, AlertCircle, Key, Loader2 } from 'lucide-react';

export const LicenseModal: React.FC = () => {
    const { license, activateLicense, loading } = useLicense();
    const [keyInput, setKeyInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // If loading or license exists, don't show the blocking modal
    if (loading || license?.active) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyInput.trim()) return;

        setStatus('validating');
        setErrorMsg('');

        try {
            const result = await activateLicense(keyInput);
            if (result.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMsg(result.error || 'Clave inválida');
            }
        } catch {
            setStatus('error');
            setErrorMsg('Error de conexión al validar');
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="max-w-md w-full bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand/20">
                        <Lock className="w-8 h-8 text-brand" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Activación Requerida</h2>
                    <p className="text-gray-400">
                        Para continuar usando AI Data Extractor, introduce tu clave de licencia.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Clave de Producto</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={keyInput}
                                onChange={(e) => setKeyInput(e.target.value)}
                                placeholder="XXXX-XXXX-XXXX-XXXX"
                                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all font-mono tracking-wide"
                            />
                        </div>
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-red-400 text-sm mt-2 animate-in slide-in-from-top-1">
                                <AlertCircle className="w-4 h-4" />
                                <span>{errorMsg}</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'validating' || !keyInput}
                        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand/20"
                    >
                        {status === 'validating' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verificando...
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                ¡Activado!
                            </>
                        ) : (
                            'Activar Licencia'
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500">
                        ¿Aún no tienes licencia?{' '}
                        <a
                            href="https://tutienda.lemonsqueezy.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:text-brand-light transition-colors font-medium hover:underline"
                        >
                            Adquiere una aquí
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};
