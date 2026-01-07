import { app, BrowserWindow, ipcMain, dialog, session } from 'electron';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

app.commandLine.appendSwitch('enable-speech-input');
app.commandLine.appendSwitch('use-fake-ui-for-media-stream'); // Helpful for permissions in some environments

// Set up permissions for microphone
app.whenReady().then(() => {
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        const p = permission as any;
        if (['media', 'audioCapture', 'microphone', 'audio'].includes(p)) return true;
        return false;
    });

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const p = permission as any;
        if (['media', 'audioCapture', 'microphone', 'audio'].includes(p)) {
            callback(true);
        } else {
            callback(false);
        }
    });
});

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        title: "AI Data Extractor",
        width: 1280,
        height: 800,
        backgroundColor: '#1a0033',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // In production, load the index.html of the app.
    if (app.isPackaged) {
        // Use a more robust path resolution starting from app root
        const indexPath = path.join(app.getAppPath(), 'dist/index.html');
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Failed to load index.html:', err);
            dialog.showErrorBox('Error de Inicio', `No se encontró el archivo de la interfaz: ${indexPath}\nError: ${err.message}`);
        });
    } else {
        // In development, load the URL of the dev server.
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }

    // Capture loading errors
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Page failed to load:', errorCode, errorDescription, validatedURL);
        dialog.showErrorBox(
            'Error de Carga',
            `La aplicación no pudo cargar correctamente.\n\nURL: ${validatedURL}\nError: ${errorDescription} (${errorCode})\n\nPresiona F12 para más detalles.`
        );
    });

    // Add F12 to open devtools in production for debugging
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key.toLowerCase() === 'f12') {
            mainWindow.webContents.openDevTools();
            event.preventDefault();
        }
    });

    // Handle new window creation (e.g. for reports)
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.includes('#/report-view')) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: {
                    width: 1280,
                    height: 800,
                    backgroundColor: '#1a0033',
                    autoHideMenuBar: true,
                    webPreferences: {
                        preload: path.join(__dirname, 'preload.js'),
                        contextIsolation: true,
                        nodeIntegration: false,
                    },
                },
            };
        }
        return { action: 'deny' };
    });
};

// Global state for report data to share between windows safely
let currentReportData: any = null;

// IPC Handler for saving HTML files
ipcMain.handle('save-html-file', async (event, { content, defaultFilename }) => {
    try {
        const { filePath, canceled } = await dialog.showSaveDialog({
            title: 'Guardar Reporte HTML',
            defaultPath: defaultFilename,
            filters: [
                { name: 'HTML Files', extensions: ['html'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (canceled || !filePath) {
            return { success: false, canceled: true };
        }

        const fs = await import('fs/promises');
        await fs.writeFile(filePath, content, 'utf-8');

        return { success: true, filePath };
    } catch (error) {
        console.error('Error saving HTML file:', error);
        return { success: false, error: (error as Error).message };
    }
});

// IPC Handlers for Report Data sharing
ipcMain.handle('set-report-data', (event, data) => {
    console.log('📦 Report data received in Main Process');
    currentReportData = data;
    return { success: true };
});

ipcMain.handle('get-report-data', () => {
    console.log('📤 Report data requested from Main Process');
    return currentReportData;
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
