import React from 'react';
import { motion } from 'framer-motion';

interface DataTableProps {
    title: string;
    headers: string[];
    rows: string[][];
}

export const DataTable: React.FC<DataTableProps> = ({ title, headers, rows }) => {
    const safeHeaders = Array.isArray(headers) ? headers : [];
    const safeRows = Array.isArray(rows) ? rows : [];

    if (safeRows.length === 0 && safeHeaders.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8 shadow-xl overflow-hidden"
        >
            <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-brand-accent pl-3 font-sans">{title}</h3>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse table-auto">
                    <thead>
                        <tr className="border-b border-white/10">
                            {safeHeaders.map((header, idx) => (
                                <th key={idx} className="p-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {safeRows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-white/5 transition-colors">
                                {Array.isArray(row) ? row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="p-3 text-sm text-gray-300 font-mono">
                                        {cell}
                                    </td>
                                )) : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
