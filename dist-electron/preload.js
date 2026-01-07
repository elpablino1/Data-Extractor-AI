import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    saveHtmlFile: (content, defaultFilename) => ipcRenderer.invoke('save-html-file', { content, defaultFilename }),
    setReportData: (data) => ipcRenderer.invoke('set-report-data', data),
    getReportData: () => ipcRenderer.invoke('get-report-data'),
});
//# sourceMappingURL=preload.js.map