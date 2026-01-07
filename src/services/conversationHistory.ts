// src/services/conversationHistory.ts
// Simple localStorage based conversation history service

export interface ReportEntry {
    id: string;
    timestamp: number;
    data: any;
}

export interface ConversationEntry {
    id: string; // uuid
    timestamp: number; // epoch ms
    files: any[]; // simplified representation of processed files
    messages: any[]; // chat messages
    reports: ReportEntry[]; // stored reports
}

const STORAGE_KEY = 'conversation_history';


function loadHistory(): ConversationEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as ConversationEntry[];
    } catch (e) {
        console.error('Failed to load conversation history', e);
        return [];
    }
}

function saveHistory(history: ConversationEntry[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save conversation history', e);
    }
}

export const conversationHistory = {
    getAll(): ConversationEntry[] {
        return loadHistory();
    },
    add(entry: Omit<ConversationEntry, 'id' | 'timestamp'>) {
        const newEntry: ConversationEntry = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...entry,
        };
        const history = loadHistory();
        history.unshift(newEntry); // most recent first
        saveHistory(history);
        return newEntry;
    },
    addReport(conversationId: string, reportId: string, reportData: any) {
        const history = loadHistory();
        const idx = history.findIndex(c => c.id === conversationId);
        if (idx !== -1) {
            const conv = history[idx];
            conv.reports = conv.reports || [];
            if (!conv.reports.some(r => r.id === reportId)) {
                conv.reports.push({
                    id: reportId,
                    timestamp: Date.now(),
                    data: reportData
                });
                saveHistory(history);
            }
        }
    },
    updateMessages(conversationId: string, messages: any[]) {
        const history = loadHistory();
        const idx = history.findIndex(c => c.id === conversationId);
        if (idx !== -1) {
            history[idx].messages = messages;
            saveHistory(history);
        }
    },
    deleteConversation(conversationId: string) {
        let history = loadHistory();
        history = history.filter(c => c.id !== conversationId);
        saveHistory(history);
    },
    get(conversationId: string): ConversationEntry | undefined {
        const history = loadHistory();
        return history.find(c => c.id === conversationId);
    }
};
