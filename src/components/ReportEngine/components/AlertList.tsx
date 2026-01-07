import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface AlertItem {
    type: 'info' | 'success' | 'warning' | 'error';
    message?: string;
    text?: string;
}

interface AlertListProps {
    title?: string;
    items: AlertItem[];
}

export const AlertList: React.FC<AlertListProps> = ({ title = "Hallazgos Críticos", items }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'error': return <AlertCircle className="w-6 h-6 text-brand-pres-pink" />;
            case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
            case 'success': return <CheckCircle className="w-6 h-6 text-brand-pres-teal" />;
            default: return <Lightbulb className="w-6 h-6 text-brand-pres-blue" />;
        }
    };

    const getBorderColor = (type: string) => {
        switch (type) {
            case 'error': return 'border-brand-pres-pink/30';
            case 'warning': return 'border-yellow-400/30';
            case 'success': return 'border-brand-pres-teal/30';
            default: return 'border-brand-pres-blue/30';
        }
    };

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-brand-pres-teal rounded-full"></div>
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">{title}</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`bg-brand-pres-card/50 backdrop-blur-sm border ${getBorderColor(item.type)} rounded-xl p-5 flex items-start gap-4 hover:bg-white/5 transition-all group`}
                    >
                        <div className="mt-1 flex-shrink-0 group-hover:scale-110 transition-transform">
                            {getIcon(item.type)}
                        </div>
                        <div className="flex-1">
                            <p className="text-base font-medium text-gray-100 leading-relaxed tracking-wide">
                                {item.text || item.message}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
