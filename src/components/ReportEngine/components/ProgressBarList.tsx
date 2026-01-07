import React from 'react';
import { motion } from 'framer-motion';

interface ProgressItem {
    label: string;
    value: number; // 0-100
    color?: string;
    displayValue?: string;
}

interface ProgressBarListProps {
    title?: string;
    items: ProgressItem[];
}

export const ProgressBarList: React.FC<ProgressBarListProps> = ({ title, items }) => {
    if (!items || !Array.isArray(items)) {
        console.warn('ProgressBarList: No valid items provided', items);
        return null;
    }

    return (
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-6 mb-8 shadow-sm dark:shadow-none">
            {title && <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h3>}
            <div className="space-y-6">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
                            <span className="text-gray-900 dark:text-white font-bold">{item.displayValue || `${item.value}%`}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${Math.min(100, Math.max(0, item.value))}%`,
                                    backgroundColor: item.color || '#4f46e5'
                                }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
