import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface KPIItem {
    label: string;
    value: string | number;
    sublabel?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

interface KPIGridProps {
    items: KPIItem[];
    columns?: number;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ items, columns = 4 }) => {
    if (!items || !Array.isArray(items)) {
        console.warn('KPIGrid: No valid items provided', items);
        return null;
    }

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-8 my-16`}>
            {items.map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group h-full"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-center items-center text-center h-full">
                        <p
                            className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-xl"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                            {item.value}
                        </p>
                        <p className="text-sm md:text-base font-medium text-gray-400 uppercase tracking-[0.2em] leading-tight">
                            {item.label}
                        </p>
                        {item.trend && (
                            <div className={`mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${item.trend === 'up' ? 'bg-green-500/10 text-green-400' :
                                item.trend === 'down' ? 'bg-red-500/10 text-red-400' :
                                    'bg-gray-500/10 text-gray-400'
                                }`}>
                                {item.trend === 'up' ? <TrendingUp size={14} /> :
                                    item.trend === 'down' ? <TrendingDown size={14} /> : null}
                                {item.trendValue}
                            </div>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
