import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { ChatInterface } from './ChatInterface';
import { SettingsModal } from './SettingsModal';
import { FileUploader } from './FileUploader';
import { type ProcessedFile, type BrandAsset, type ProcessedItem } from '../../services/fileProcessor';
import type { ConversationEntry } from '../../services/conversationHistory';
import { conversationHistory } from '../../services/conversationHistory';

import { ManualModal } from './ManualModal';
import { HelpCircle, Settings } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(() => !localStorage.getItem('hasSeenManual'));
    const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);
    const [messages, setMessages] = useState<any[]>([]);
    const [history, setHistory] = useState<ConversationEntry[]>(() => conversationHistory.getAll());

    useEffect(() => {
        const loadTheme = () => {
            const theme = localStorage.getItem('theme') || 'dark';
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        loadTheme();
        window.addEventListener('storage', loadTheme);

        if (isManualOpen) {
            localStorage.setItem('hasSeenManual', 'true');
        }

        return () => window.removeEventListener('storage', loadTheme);
    }, []);

    useEffect(() => {
        // Load initial history is now handled by lazy initialization
    }, []);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const handleFilesProcessed = (processedItems: ProcessedItem[]) => {
        // Auto-open manual on first file upload to help user understand the process
        const hasSeenManual = localStorage.getItem('hasSeenManual');
        if (!hasSeenManual) {
            setIsManualOpen(true);
            localStorage.setItem('hasSeenManual', 'true');
        }
        const newFiles = processedItems.filter(item => !('isBrandAsset' in item)) as ProcessedFile[];
        const newAssets = processedItems.filter(item => 'isBrandAsset' in item) as BrandAsset[];

        if (newFiles.length > 0) {
            const uniqueFiles = newFiles.filter(
                newFile => !files.some(existing => existing.name === newFile.name)
            );
            if (uniqueFiles.length > 0) {
                const updatedFiles = [...files, ...uniqueFiles];
                setFiles(updatedFiles);

                const newConv = conversationHistory.add({
                    files: updatedFiles.map(f => ({ name: f.name, id: f.id })),
                    messages: [],
                    reports: []
                });
                setCurrentConversationId(newConv.id);
            }
        }

        if (newAssets.length > 0) {
            setBrandAssets(prev => [...prev, ...newAssets]);
        }

        setHistory(conversationHistory.getAll());
    };

    const handleRemoveFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleNewChat = () => {
        setFiles([]);
        setMessages([]);
        setCurrentConversationId(undefined);
    };

    const handleToggleSheet = (fileId: string, sheetName: string) => {
        setFiles(prev => prev.map(f => {
            if (f.id === fileId) {
                return {
                    ...f,
                    sheets: f.sheets.map(s => {
                        if (s.name === sheetName) {
                            return { ...s, isActive: !s.isActive };
                        }
                        return s;
                    })
                };
            }
            return f;
        }));
    };

    const handleMessagesChange = (newMessages: any[]) => {
        setMessages(newMessages);

        if (currentConversationId) {
            conversationHistory.updateMessages(currentConversationId, newMessages);
        } else {
            // Start new conversation immediately
            const newConv = conversationHistory.add({
                files: files.map(f => ({ name: f.name, id: f.id })), // Store simplified file info
                messages: newMessages,
                reports: []
            });
            setCurrentConversationId(newConv.id);
        }
        // Update history state
        setHistory(conversationHistory.getAll());
    };

    const handleShowReport = (data: any) => {
        const reportId = crypto.randomUUID();
        const reportWithId = { ...data, id: reportId };

        if (currentConversationId) {
            conversationHistory.addReport(currentConversationId, reportId, reportWithId);
        } else {
            // If no conversation yet (unlikely if we have a report), create one
            const newConv = conversationHistory.add({
                files: files.map(f => ({ name: f.name, id: f.id })),
                messages: messages,
                reports: [{ id: reportId, timestamp: Date.now(), data: reportWithId }]
            });
            setCurrentConversationId(newConv.id);
        }

        // Update history state
        setHistory(conversationHistory.getAll());

        localStorage.setItem('currentReport', JSON.stringify(reportWithId));
        // window.open('/#/report-view', '_blank', 'width=1280,height=800'); // Removed auto-open as per user preference for link
    };

    const handleOpenReport = async (reportId: string) => {
        console.log('Opening report:', reportId);
        let data = null;

        // Try to find in history
        if (currentConversationId) {
            const conv = conversationHistory.get(currentConversationId);
            const report = conv?.reports.find(r => r.id === reportId);
            if (report) data = report.data;
        }

        if (data) {
            // Backup to localStorage
            localStorage.setItem('currentReport', JSON.stringify(data));

            // Primary transfer via Electron IPC if available
            if (window.electronAPI && window.electronAPI.setReportData) {
                await window.electronAPI.setReportData(data);
            }

            const reportUrl = `${window.location.origin}${window.location.pathname}#/report-view`;
            window.open(reportUrl, '_blank', 'width=1280,height=800');
        } else {
            console.error('Report data not found for ID:', reportId);
        }
    };

    const handleLoadConversation = (conversation: ConversationEntry) => {
        console.log('Loading conversation:', conversation);
        setCurrentConversationId(conversation.id);
        setMessages(conversation.messages || []);
        setFiles([]); // Clear files explicitly - they are not persisted
        // Note: File data is not persisted in conversation history for storage efficiency.
        // User must re-upload files to continue analysis with data context.
    };

    const handleDeleteConversation = (id: string) => {
        conversationHistory.deleteConversation(id);
        setHistory(conversationHistory.getAll());
        if (currentConversationId === id) {
            setCurrentConversationId(undefined);
            setMessages([]);
        }
    };

    if (!user) return null;

    const showChat = files.length > 0 || messages.length > 0;

    return (
        <div className="flex h-screen bg-dark-bg text-primary overflow-hidden font-sans">
            <Sidebar
                files={files}
                onFilesProcessed={handleFilesProcessed}
                onRemoveFile={handleRemoveFile}
                onToggleSheet={handleToggleSheet}
                user={user}
                onLogout={() => setIsSettingsOpen(true)}
                onLoadConversation={handleLoadConversation}
                onOpenReport={handleOpenReport}
                currentConversationId={currentConversationId}
                history={history}
                onDeleteConversation={handleDeleteConversation}
                onNewChat={handleNewChat}
            />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {!showChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                        <div className="max-w-2xl w-full space-y-8 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Bienvenido a <span className="text-brand">AI Data Extractor</span>
                                </h1>
                                <p className="text-gray-600 dark:text-secondary text-lg">
                                    Sube tus archivos Excel o CSV para comenzar el análisis
                                </p>
                            </div>

                            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
                                <FileUploader onFilesProcessed={handleFilesProcessed} />
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-left">
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-brand/20 flex items-center justify-center mb-3">
                                        <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Análisis de Datos</h3>
                                    <p className="text-xs text-gray-500 dark:text-secondary">Identifica tendencias y patrones automáticamente.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                                        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Reportes Visuales</h3>
                                    <p className="text-xs text-gray-500 dark:text-secondary">Genera dashboards e infografías al instante.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3">
                                        <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Chat Inteligente</h3>
                                    <p className="text-xs text-gray-500 dark:text-secondary">Conversa con tus datos en lenguaje natural.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ChatInterface
                        files={files}
                        brandAssets={brandAssets}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        onShowReport={handleShowReport}
                        user={user}
                        messages={messages}
                        onMessagesChange={handleMessagesChange}
                    >
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsManualOpen(true)}
                                className="p-2 text-gray-400 hover:text-brand-pres-teal bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                                title="Guía de uso"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </ChatInterface>
                )}
            </main>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onLogout={handleLogout}
                userEmail={user?.email}
            />

            <ManualModal
                isOpen={isManualOpen}
                onClose={() => setIsManualOpen(false)}
            />
        </div>
    );
};
