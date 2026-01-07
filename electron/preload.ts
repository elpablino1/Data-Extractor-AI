import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    saveHtmlFile: (content: string, defaultFilename: string) =>
        ipcRenderer.invoke('save-html-file', { content, defaultFilename }),
    setReportData: (data: any) => ipcRenderer.invoke('set-report-data', data),
    getReportData: () => ipcRenderer.invoke('get-report-data'),
});
