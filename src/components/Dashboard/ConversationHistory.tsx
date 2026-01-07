import React from 'react';
import { type ConversationEntry } from '../../services/conversationHistory';

interface ConversationHistoryProps {
    onLoadConversation: (conversation: ConversationEntry) => void;
    onOpenReport: (reportId: string) => void;
    currentConversationId?: string;
    history: ConversationEntry[];
    onDeleteConversation: (id: string) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
    onLoadConversation,
    onOpenReport,
    currentConversationId,
    history,
    onDeleteConversation
}) => {

    const handleLoad = (entry: ConversationEntry) => {
        onLoadConversation(entry);
    };

    const handleOpenReport = (reportId: string) => {
        onOpenReport(reportId);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onDeleteConversation(id);
    };

    return (
        <div className="space-y-3">
            {history.length === 0 && (
                <p className="text-xs text-secondary italic text-center py-4">Sin conversaciones previas.</p>
            )}
            {history.map(entry => (
                <div
                    key={entry.id}
                    className={`group p-3 rounded-lg border transition-all duration-200 ${currentConversationId === entry.id
                        ? 'bg-brand/10 border-brand/30 shadow-sm'
                        : 'bg-white dark:bg-dark-bg border-gray-200 dark:border-white/5 hover:border-brand/30 dark:hover:border-white/10'
                        }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-primary truncate">
                                {new Date(entry.timestamp).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-secondary mt-0.5">
                                {entry.messages?.length || 0} mensajes • {entry.reports?.length || 0} reportes
                            </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => handleDelete(e, entry.id)}
                                className="p-1 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded text-gray-400 dark:text-secondary hover:text-red-500 dark:hover:text-red-400"
                                title="Eliminar"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => handleLoad(entry)}
                        className={`w-full text-xs py-1.5 rounded mt-1 transition-colors ${currentConversationId === entry.id
                            ? 'bg-brand text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-secondary hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-primary'
                            }`}
                    >
                        {currentConversationId === entry.id ? 'Activa' : 'Cargar Conversación'}
                    </button>

                    {entry.reports && entry.reports.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-white/5 space-y-1.5">
                            <p className="text-[10px] font-semibold text-gray-500 dark:text-secondary uppercase tracking-wider">Reportes</p>
                            {entry.reports.map((report, idx) => {
                                const title = report.data?.infographic?.[0]?.title || `Reporte ${report.id.slice(0, 8)}...`;
                                return (
                                    <button
                                        key={`${entry.id}-report-${idx}`}
                                        onClick={() => handleOpenReport(report.id)}
                                        className="flex items-center gap-2 w-full text-xs text-gray-600 dark:text-secondary hover:text-brand transition-colors group/report text-left"
                                    >
                                        <svg className="w-3 h-3 opacity-50 group-hover/report:opacity-100 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <span className="truncate">{title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
