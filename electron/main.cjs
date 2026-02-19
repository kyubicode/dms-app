const { app, BrowserWindow, Menu, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * 1. PRIVILEGE REGISTRATION
 * Ini WAJIB agar Electron mengizinkan React menampilkan file dari local drive (C:/...)
 * Harus dipanggil sebelum app.whenReady()
 */
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
        console.error(`\n[ERROR] File Tidak Ditemukan: ${fullPath}`);
        throw new Error(`Module missing: ${relativeFsPath}`);
    }
    return require(fullPath);
}

// --- Import Handlers & Services ---
const { registerDatabaseHandlers } = safeRequire('services/database.service.cjs');
const { registerAppHandlers } = safeRequire('handlers/app.ipc.cjs');
const { registerAuthHandlers } = safeRequire('handlers/auth.ipc.cjs');
const { registerLaporanHandlers } = safeRequire('handlers/laporan.ipc.cjs');
const { registerWindowHandlers } = safeRequire('handlers/window.ipc.cjs');

let mainWindow;
let splashWindow;

function createWindows() {
    const preloadPath = path.join(baseDir, 'preload.cjs');

    // 1. Splash Window
    splashWindow = new BrowserWindow({
        width: 500, 
        height: 350, 
        frame: false, 
        transparent: true, 
        alwaysOnTop: true, 
        center: true,
        webPreferences: { 
            preload: preloadPath, 
            contextIsolation: true,
            nodeIntegration: false,
            devTools:true,
        }
        
    });
    splashWindow.loadFile(path.join(baseDir, 'splash.html'));

    // 2. Main Window
    mainWindow = new BrowserWindow({
        width: 1200, 
        height: 750, 
        show: false, 
        frame: false, 
        backgroundColor: '#001529',
        webPreferences: { 
            preload: preloadPath, 
            contextIsolation: true,
            nodeIntegration: false,
            // Izinkan webSecurity tetap true tapi protocol sudah kita whitelist di atas
            webSecurity: false, 
            devTools: true,
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
    // Di dalam function initializeApp() bagian paling bawah
setTimeout(() => {
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();

        // TAMBAHKAN INI: Buka devtools otomatis jika bukan versi packaged (production)
        if (!app.isPackaged) {
            mainWindow.webContents.openDevTools({ mode: 'detach' }); 
        }
    }
}, 500);
    try {
        sendSplashProgress(30, 'Initializing Database & Security...');
        // registerDatabaseHandlers sekarang juga menjalankan ensureAdminUser()
        registerDatabaseHandlers(); 

        sendSplashProgress(70, 'Mounting System Handlers...');
        registerAppHandlers();
        registerAuthHandlers();
        registerLaporanHandlers();
        registerWindowHandlers();
        
        sendSplashProgress(90, 'System Authorized. Opening Dashboard...');
        await new Promise(r => setTimeout(r, 1000)); 
        sendSplashProgress(100, 'Ready');

        setTimeout(() => {
            if (splashWindow && !splashWindow.isDestroyed()) {
                splashWindow.close();
            }
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.show();
                mainWindow.focus();
            }
        }, 500);

    } catch (err) {
        console.error("BOOTSTRAP_ERROR:", err.message);
        sendSplashProgress(0, 'Critical Error: ' + err.message);
        dialog.showErrorBox('Startup Failed', err.message);
    }
}

function sendSplashProgress(percent, message) {
    if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.webContents.send('splash-progress', { percent, message });
    }
}

app.whenReady().then(() => {
    // Tambahan: Double check session agar file protocol diizinkan tanpa batasan CORS tambahan
    const { session } = require('electron');
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' data: file:; img-src 'self' data: file:;"]
            }
        });
    });

    Menu.setApplicationMenu(null); 
    createWindows();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindows();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});