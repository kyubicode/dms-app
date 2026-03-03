const { app, BrowserWindow, Menu, ipcMain, dialog, protocol, session } = require('electron');
const path = require('path');
const fs = require('fs');

// 1. PRIVILEGE REGISTRATION
protocol.registerSchemesAsPrivileged([
    { 
        scheme: 'file', 
        privileges: { 
            secure: true, 
            standard: true, 
            supportFetchAPI: true, 
            corsEnabled: true, 
            bypassCSP: true 
        } 
    }
]);

const baseDir = __dirname;

function safeRequire(relativeFsPath) {
    const fullPath = path.join(baseDir, relativeFsPath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Module missing: ${relativeFsPath}`);
    }
    return require(fullPath);
}

// 2. IMPORT SERVICES & HANDLERS
const { registerDatabaseHandlers } = safeRequire('services/database.service.cjs');
const { registerAppHandlers } = safeRequire('handlers/app.ipc.cjs');
const { registerAuthHandlers } = safeRequire('handlers/auth.ipc.cjs');
const { registerLaporanHandlers } = safeRequire('handlers/laporan.ipc.cjs');
const { registerWindowHandlers } = safeRequire('handlers/window.ipc.cjs');
const settingsManager = safeRequire('services/settingsManager.cjs');
// exportManager SUDAH DIHAPUS KARENA LOGIKANYA PINDAH KE LAPORAN.IPC.CJS

let mainWindow;
let splashWindow;

function createWindows() {
    const preloadPath = path.join(baseDir, 'preload.cjs');

    splashWindow = new BrowserWindow({
        width: 500, height: 350, frame: false, transparent: true, 
        alwaysOnTop: true, center: true,
        webPreferences: { 
            preload: preloadPath, 
            contextIsolation: true, 
            nodeIntegration: false 
        }
    });
    splashWindow.loadFile(path.join(baseDir, 'splash.html'));

    mainWindow = new BrowserWindow({
        width: 1200, height: 750, show: false, frame: false, 
        backgroundColor: '#001529',
        webPreferences: { 
            preload: preloadPath, 
            contextIsolation: true, 
            nodeIntegration: false,
            webSecurity: false // Untuk merender file:// dari folder AppData
        }
    });

    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(baseDir, '../dist/index.html'));
    }

    initializeApp();
}

async function initializeApp() {
    try {
         //const db = registerDatabaseHandlers(ipcMain); 
        sendSplashProgress(20, 'Initializing Database...');
        // 1. Ambil instance DB dari service
        const dbInstance = registerDatabaseHandlers(ipcMain);
        registerWindowHandlers(ipcMain, mainWindow, dbInstance);
        sendSplashProgress(40, 'Configuring Services...');
        // Inisialisasi Settings Manager
        if (settingsManager && settingsManager.init) {
            settingsManager.init(ipcMain); 
        }
        // --- PERBAIKAN: exportManager.init DIHAPUS DARI SINI ---
        // Karena logikanya sudah menyatu di registerLaporanHandlers
        sendSplashProgress(70, 'Mounting System Handlers...');
        registerAppHandlers(ipcMain);
        registerAuthHandlers(ipcMain); 
        // Memanggil handler laporan yang berisi logika Export Word/PDF utuh
        registerLaporanHandlers(); 
        
        sendSplashProgress(90, 'Preparing Interface...');
        await new Promise(r => setTimeout(r, 800)); 

        sendSplashProgress(100, 'Ready');

        setTimeout(() => {
            if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.show();
                if (!app.isPackaged) {
                    mainWindow.webContents.openDevTools({ mode: 'detach' });
                }
            }
        }, 400);

    } catch (err) {
        console.error("BOOTSTRAP_ERROR:", err);
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.show();
        dialog.showErrorBox('Startup Failed', `Modul Error: ${err.message}`);
    }
}

function sendSplashProgress(percent, message) {
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.webContents.send('splash-progress', { percent, message });
    }
}

app.whenReady().then(() => {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' data: file:; img-src 'self' data: file: blob:;"]
            }
        });
    });

    Menu.setApplicationMenu(null); 
    createWindows();
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});