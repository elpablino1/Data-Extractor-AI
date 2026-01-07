import React from 'react';
import { LogOut, User, FileSpreadsheet, ChevronDown, ChevronRight, CheckSquare, Square, Trash2 } from 'lucide-react';
import { ConversationHistory } from './ConversationHistory';
import type { ConversationEntry } from '../../services/conversationHistory';
import { type ProcessedFile } from '../../services/fileProcessor';

interface SidebarProps {
    files: ProcessedFile[];
    onFilesProcessed: (files: ProcessedFile[]) => void;
    onRemoveFile: (id: string) => void;
    onToggleSheet: (fileId: string, sheetName: string) => void;
    user: any;
    onLogout: () => void;
    onLoadConversation: (conversation: ConversationEntry) => void;
    onOpenReport: (reportId: string) => void;
    currentConversationId?: string;
    history: ConversationEntry[];
    onDeleteConversation: (id: string) => void;
    onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    files,
    onRemoveFile,
    onToggleSheet,
    user,
    onLogout,
    onLoadConversation,
    onOpenReport,
    currentConversationId,
    history,
    onDeleteConversation,
    onNewChat
}) => {
    const [expandedFiles, setExpandedFiles] = React.useState<Set<string>>(new Set());
    const [isHistoryExpanded, setIsHistoryExpanded] = React.useState(true);

    const toggleFileExpand = (fileId: string) => {
        const newExpanded = new Set(expandedFiles);
        if (newExpanded.has(fileId)) {
            newExpanded.delete(fileId);
        } else {
            newExpanded.add(fileId);
        }
        setExpandedFiles(newExpanded);
    };

    const handleToggleAllSheets = (file: ProcessedFile) => {
        const allSelected = file.sheets.every(s => s.isActive);
        file.sheets.forEach(sheet => {
            if (sheet.isActive === allSelected) {
                onToggleSheet(file.id, sheet.name);
            }
        });
    };

    return (
        <aside className="w-80 bg-dark-bg border-r border-dark-border flex flex-col h-full">
            {/* Branding Section */}
            <div className="p-6 border-b border-dark-border">
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        AI Data
                    </h1>
                    <p className="text-[10px] text-brand tracking-[0.2em] font-bold uppercase">Extractor</p>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-inverse font-bold">
                        {user.email?.[0].toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-primary text-sm">Usuario</h3>
                        <p className="text-xs text-brand-light flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> En línea
                        </p>
                    </div>
                </div>
                <button onClick={onLogout} className="text-secondary hover:text-primary transition-colors">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* New Chat Button */}
            <div className="p-6">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white py-3 rounded-lg transition-colors font-medium shadow-lg shadow-brand/20"
                >
                    <span className="text-xl">+</span> Nuevo Chat
                </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Active Files List */}
                {files.length > 0 && (
                    <div className="px-6 mb-6">
                        <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border border-secondary flex items-center justify-center text-[10px]">A</span>
                            Archivos Activos
                        </h4>
                        <div className="space-y-2">
                            {files.map(file => (
                                <div key={file.id} className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                                    <div className="flex items-center p-2 gap-2 hover:bg-white/5 transition-colors">
                                        <button
                                            onClick={() => toggleFileExpand(file.id)}
                                            className="text-secondary hover:text-brand dark:hover:text-white"
                                        >
                                            {expandedFiles.has(file.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>
                                        <FileSpreadsheet className="w-4 h-4 text-brand" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1" title={file.name}>{file.name}</span>
                                        <button
                                            onClick={() => onRemoveFile(file.id)}
                                            className="text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {expandedFiles.has(file.id) && (
                                        <div className="bg-black/20 p-2 space-y-1 border-t border-white/5">
                                            <div className="flex items-center gap-2 px-2 py-1 text-xs text-secondary hover:text-brand dark:hover:text-white cursor-pointer" onClick={() => handleToggleAllSheets(file)}>
                                                {file.sheets.every(s => s.isActive) ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                                <span>Seleccionar todo</span>
                                            </div>
                                            {file.sheets.map((sheet, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-brand dark:hover:text-white cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded"
                                                    onClick={() => onToggleSheet(file.id, sheet.name)}
                                                >
                                                    {sheet.isActive ?
                                                        <CheckSquare className="w-3 h-3 text-brand" /> :
                                                        <Square className="w-3 h-3" />
                                                    }
                                                    <span className="truncate">{sheet.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conversation History */}
                <div className="px-6 pb-6">
                    <button
                        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                        className="w-full flex items-center justify-between group mb-4"
                    >
                        <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2 group-hover:text-brand dark:group-hover:text-white transition-colors">
                            <span className="w-4 h-4 rounded-full border border-secondary flex items-center justify-center text-[10px]">H</span>
                            Historial
                        </h4>
                        <div className="text-secondary group-hover:text-brand dark:group-hover:text-white transition-colors">
                            {isHistoryExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                    </button>

                    {isHistoryExpanded && (
                        <ConversationHistory
                            onLoadConversation={onLoadConversation}
                            onOpenReport={onOpenReport}
                            currentConversationId={currentConversationId}
                            history={history}
                            onDeleteConversation={onDeleteConversation}
                        />
                    )}
                </div>
            </div>
        </aside>
    );
};
