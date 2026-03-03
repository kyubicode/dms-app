const { BrowserWindow } = require('electron');
const si = require('systeminformation');

/**
 * 1. INITIAL STATE & CACHE (Hardware)
 */
let cachedHardware = {
  gpuModel: 'Loading...',
  vramTotal: 0,
  cpuBrand: 'Loading...'
};

async function runBackgroundHardwareScan() {
  try {
    const [cpuData, gpuData] = await Promise.all([
      si.cpu().catch(() => ({ brand: 'Generic CPU' })),
      si.graphics().catch(() => ({ controllers: [] }))
    ]);
    cachedHardware = {
      gpuModel: gpuData.controllers[0]?.model || 'Integrated Graphics',
      vramTotal: gpuData.controllers[0]?.vram || 0,
      cpuBrand: cpuData.brand || 'Unknown Processor'
    };
  } catch (err) {
    console.error("Hardware scan failed:", err);
  }
}
runBackgroundHardwareScan();

// --- TAMBAHKAN PARAMETER 'db' DI SINI ---
function registerWindowHandlers(ipcMain, mainWindow, db) {
  
  // --- 1. WINDOW SYNC ---
  if (mainWindow) {
    mainWindow.on('maximize', () => mainWindow.webContents.send('window-resize-status', true));
    mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-resize-status', false));
  }

  // --- 2. WINDOW CONTROL ---
  ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (action === 'minimize') win.minimize();
    if (action === 'maximize') win.isMaximized() ? win.unmaximize() : win.maximize();
    if (action === 'close') win.close();
  });

  ipcMain.handle('window:isMaximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win ? win.isMaximized() : false;
  });

  // --- 3. SYSTEM MONITOR (FAST) ---
  ipcMain.handle('system:get-gpu-usage', async () => {
    try {
      const mem = await si.mem();
      return {
        ...cachedHardware,
        vramUsed: 0, 
        ramUsedPercent: Math.round((mem.active / mem.total) * 100),
        ramUsedGB: (mem.active / (1024 ** 3)).toFixed(2)
      };
    } catch (error) {
      return { ramUsedPercent: 0, ramUsedGB: "0", gpuModel: 'N/A' };
    }
  });

  // --- 4. APP INFO ---
  ipcMain.handle('app:get-sys-info', async () => ({
    platform: process.platform,
    arch: process.arch,
    version: "1.0.0",
    cpu: cachedHardware.cpuBrand
  }));

  // --- KUNCI UTAMA: Handler Dashboard Stats ---
// --- Di dalam registerWindowHandlers ---
ipcMain.handle('dashboard:get-stats', async () => {
  try {
    if (!db) {
      console.error("❌ DB Instance Null di window.ipc");
      return { totalLaporan: 0, totalAlbum: 0, totalFoto: 0 };
    }

    const laporan = db.prepare("SELECT COUNT(*) as count FROM laporan").get();
    const album = db.prepare("SELECT COUNT(*) as count FROM dokumentasi").get();
    const foto = db.prepare("SELECT COUNT(*) as count FROM table_foto").get();

    const data = {
      totalLaporan: laporan?.count || 0,
      totalAlbum: album?.count || 0, 
      totalFoto: foto?.count || 0
    };

    console.log("📊 DATABASE CHECK:", data); // LIAT DI TERMINAL VS CODE
    return data;
  } catch (err) {
    console.error("❌ SQL Error Dashboard:", err.message);
    return { totalLaporan: 0, totalAlbum: 0, totalFoto: 0 };
  }
});

}

module.exports = { registerWindowHandlers };