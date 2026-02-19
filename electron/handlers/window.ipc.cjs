const { ipcMain, BrowserWindow, app } = require('electron');
const os = require('os'); 
const si = require('systeminformation');
// 1. IMPORT HELPER LOG NYA
const { addLog } = require('../services/log.service.cjs');

function registerWindowHandlers() {
  // --- 1. KONTROL JENDELA ---
  ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    switch (action) {
      case 'minimize':
        win.minimize();
        break;
      case 'maximize':
        const isMax = win.isMaximized();
        if (isMax) {
          win.unmaximize();
        } else {
          win.maximize();
        }
        // Opsional: Catat log saat user mengubah ukuran jendela
        addLog('SYSTEM_UI', `Window ${isMax ? 'Restored' : 'Maximized'}`);
        break;
      case 'close':
        // Catat log sebelum aplikasi benar-benar tertutup
        addLog('SYSTEM_POWER', 'Application initiated shutdown');
        win.close();
        break;
    }
  });

  // --- 2. CEK STATUS MAXIMIZED ---
  ipcMain.handle('is-window-maximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.isMaximized() : false;
  });

  // --- 3. HANDLER INFORMASI SISTEM ---
  ipcMain.handle('get-system-info', async () => {
    try {
      const cpus = os.cpus();
      const cpuModel = cpus.length > 0 ? cpus[0].model : "Unknown CPU";
      const totalMemGB = Math.round(os.totalmem() / (1024 ** 3)); 
      
      const systemData = {
        cpu: cpuModel,
        totalMemory: `${totalMemGB} GB`,
        version: `v${app.getVersion()}`,
        platform: os.platform(),
        arch: os.arch()
      };

      // 2. CATAT KE DATABASE AUDIT_LOGS
      // Ini yang bikin data muncul di UI Gahar V3 lu!
      addLog('HARDWARE_CHECK', `Audit: ${systemData.cpu} | RAM: ${systemData.totalMemory}`);

      return systemData;
    } catch (error) {
      // 3. CATAT ERROR JIKA GAGAL
      addLog('HARDWARE_ERROR', 'Failed to fetch system information', error.message);
      
      console.error("Gagal mengambil info sistem:", error);
      return { cpu: "N/A", totalMemory: "N/A", version: "v0.0.0" };
    }
  });

  // --- 4. REAL-TIME GPU & MEMORY USAGE (DINAMIS) ---
  ipcMain.handle('get-gpu-usage', async () => {
    try {
      const graphics = await si.graphics();
      const memory = await si.mem();
      
      // Ambil GPU pertama yang aktif
      const gpu = graphics.controllers[0]; 

      return {
        gpuModel: gpu.model || 'Generic GPU',
        vramTotal: gpu.vram || 0, // Dalam MB
        vramUsed: gpu.vramUsed || 0, // Dalam MB (Hanya support beberapa driver)
        ramUsedPercent: Math.round((memory.active / memory.total) * 100),
        ramUsedGB: (memory.active / (1024 ** 3)).toFixed(2)
      };
    } catch (error) {
      console.error("GPU Stats Error:", error);
      return null;
    }
  });

  
}

module.exports = { registerWindowHandlers };