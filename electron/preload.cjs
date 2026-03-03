// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  send: (channel, data) => ipcRenderer.send(channel, data),
  // --- KUNCI REAL-TIME: Tambahkan ini agar React bisa dengerin sinyal ---
  on: (channel, callback) => {
    const subscription = (event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);
    // Kita return fungsi buat unsubscribe biar gak memory leak
    return () => ipcRenderer.removeListener(channel, subscription);
  },

  // Helper manual jika ingin remove listener spesifik
  removeListener: (channel, callback) => {
    ipcRenderer.removeAllListeners(channel);
  },
  //
 // 1. Sesuaikan dengan Backend: ipcMain.on('window-control')
  sendWindowControl: (action) => ipcRenderer.send('window-control', action),

  // 2. Sesuaikan dengan Backend: ipcMain.handle('window:isMaximized') 
  // atau 'is-window-maximized' (Pastikan di backend namanya sama)
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // 3. Sesuaikan dengan SystemMonitor.tsx yang memanggil 'system:get-gpu-usage'
  getGpuUsage: () => ipcRenderer.invoke('system:get-gpu-usage'),

  // 4. Sesuaikan dengan HomeSection.tsx yang memanggil 'dashboard:get-stats'
  getDashboardStats: () => ipcRenderer.invoke('dashboard:get-stats'),

  // 5. Sesuaikan dengan handler 'get-system-info' di backend
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // 6. Jika React memanggil 'app:get-sys-info', pastikan di sini ada:
  getAppSysInfo: () => ipcRenderer.invoke('app:get-sys-info'),

  getAppName: () => ipcRenderer.invoke('get-app-name'),
  //progresss open app
  onSplashProgress: (callback) => {
    // Kita bungkus agar callback menerima data (value) langsung dari event
    ipcRenderer.on('splash-progress', (event, value) => callback(value));
  },
 
  
// AUTH & USER MANAGEMENT API
  login: (u, p) => ipcRenderer.invoke('auth:login', { username: u, password: p }),
  getProfile: () => ipcRenderer.invoke('auth:get-profile'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  // === DATABASE TERMINAL & OPS API ===
  // Fungsi untuk eksekusi SQL mentah dari terminal
  dbExecute: (sql) => ipcRenderer.invoke('db:execute-sql', sql),
  // Fungsi untuk backup database ke folder /arsip
  dbBackup: () => ipcRenderer.invoke('db:backup'),
  // Fungsi untuk cek kesehatan, jumlah tabel, dan ukuran file dms.db
  dbCheckStatus: () => ipcRenderer.invoke('db:check-status'),
// Update juga fungsi execute (gate security) untuk mengizinkan execute-sql
  execute: (channel, data) => {
    const validChannels = [
      'auth:get-audit-logs',
      'db:get-audit-logs', 
      'db:execute-sql', // Ganti dari db:execute jika ada
      'db:backup', 
      'db:check-status',
      'db:clear-logs',
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`));
  },
  // Fungsi CRUD User yang dipanggil di UsersSection
  // Ambil User
  getUsers: () => ipcRenderer.invoke('auth:get-all-users'),
  // Register (Tambah)
  registerUser: (userData) => ipcRenderer.invoke('auth:register', userData),
  // Update (HATI-HATI: Backend kamu menggunakan 'update-user' tanpa prefix 'auth:')
  updateUser: (data) => ipcRenderer.invoke('update-user', data),
  // Delete
  deleteUser: (id) => ipcRenderer.invoke('auth:delete-user', id),
  // Avatar
  selectAvatar: () => ipcRenderer.invoke('auth:select-avatar'),
  // Laporan API
  createLaporan: (data) => ipcRenderer.invoke('laporan:create', data),
  updateLaporan: (data) => ipcRenderer.invoke('laporan:update', data),
  getLaporan: () => ipcRenderer.invoke('laporan:getAll'),
  deleteLaporan: (id) => ipcRenderer.invoke('laporan:delete', id),
  saveDokumentasi: (payload) => ipcRenderer.invoke('laporan:saveDokumentasi', payload),
  createGrupDokumentasi: (payload) => ipcRenderer.invoke('laporan:create-grup', payload),
  uploadFoto: (payload) => ipcRenderer.invoke('laporan:upload-foto', payload),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  getDokumentasiByLaporan: (id) =>ipcRenderer.invoke('laporan:getDokumentasiByLaporan', id),
   // ===== Tambahan untuk Dokumentasi Viewer =====
  addFotoToDokumentasi: (payload) => ipcRenderer.invoke('laporan:addFotoToDokumentasi', payload),
  deleteFoto: (filePath) => ipcRenderer.invoke('laporan:deleteFoto', filePath),
    deleteDokumentasi: (id_laporan, nama_dokumentasi) =>
    ipcRenderer.invoke('laporan:deleteDokumentasi', id_laporan, nama_dokumentasi),
  renameDokumentasi: (id_laporan, oldName, newName) => ipcRenderer.invoke('laporan:renameDokumentasi', id_laporan, oldName, newName),

// Export API (Pastikan handler-nya ada di exportManager.cjs)
  exportWord: (laporan, dokumentasi) => ipcRenderer.invoke('laporan:exportWord', laporan, dokumentasi),
  exportPdf: (laporan, dokumentasi) => ipcRenderer.invoke('laporan:exportPdf', laporan, dokumentasi),
});


/*
  // Tambahkan di object exposeInMainWorld 'api'
  exportWord: (laporan, dokumentasi) =>ipcRenderer.invoke('laporan:exportWord', laporan, dokumentasi),
// 2. TAMBAHKAN INI UNTUK PDF
  exportPdf: (laporan, dokumentasi) => 
    ipcRenderer.invoke('laporan:exportPdf', laporan, dokumentasi),
*/