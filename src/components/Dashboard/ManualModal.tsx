import React from 'react';
import { X, BookOpen, Lightbulb, Zap, Palette, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ManualModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const sections = [
        {
            icon: <Zap className="w-6 h-6 text-brand-pres-teal" />,
            title: "Detección de Intención",
            description: "Nuestra IA detecta automáticamente si buscas un reporte formal o una charla analítica. Usa palabras como 'reporte', 'informe' o 'presentación' para activar el motor de storytelling."
        },
        {
            icon: <Palette className="w-6 h-6 text-brand-pres-pink" />,
            title: "Brand Intelligence",
            description: "Sube tu logotipo o manual de marca antes de generar un reporte. La IA extraerá tus colores y los aplicará dinámicamente a los gráficos y encabezados."
        },
        {
            icon: <BarChart3 className="w-6 h-6 text-brand-pres-blue" />,
            title: "Visualización Avanzada",
            description: "Los gráficos son interactivos y reactivos. Si los exportas a HTML, mantendrán su interactividad y el diseño 'Signature Dark' exacto que ves en pantalla."
        },
        {
            icon: <Lightbulb className="w-6 h-6 text-yellow-400" />,
            title: "Tip Pro",
            description: "Puedes subir archivos Excel (.xlsx) y consultarlos en lenguaje natural. No necesitas fórmulas, solo pregunta: '¿Cuál fue la tendencia de ventas en Septiembre?'"
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-brand-pres-card border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-brand-pres-teal/10 to-transparent">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-brand-pres-teal" />
                            <h2 className="text-xl font-bold text-white">Guía de Inicio Rápido</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto max-h-[70vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sections.map((section, idx) => (
                                <div key={idx} className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="mb-4">{section.icon}</div>
                                    <h3 className="text-white font-semibold mb-2 group-hover:text-brand-pres-teal transition-colors">
                                        {section.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {section.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-brand-pres-teal/5 border border-brand-pres-teal/20 rounded-xl">
                            <p className="text-sm text-brand-pres-teal text-center font-medium">
                                "Lleva tus datos al siguiente nivel con el poder del Storytelling Analítico."
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/10 bg-black/20 flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-8 py-2 bg-gradient-to-r from-brand-pres-teal to-brand-pres-blue text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
                        >
                            ¡Entendido!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
