// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
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
  sendWindowControl: (action) => ipcRenderer.send('window-control', action),
  isMaximized: () => ipcRenderer.invoke('is-window-maximized'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getDashboardStats: () => ipcRenderer.invoke('dashboard:get-stats'),
  getGpuUsage: () => ipcRenderer.invoke('get-gpu-usage'),
  //progresss open app
  onSplashProgress: (callback) => {
    // Kita bungkus agar callback menerima data (value) langsung dari event
    ipcRenderer.on('splash-progress', (event, value) => callback(value));
  },
  // Sistem Info
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
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
  execute: (channel, data) => {
    // Daftar channel yang diizinkan (Security Gate)
    const validChannels = [
      'auth:get-audit-logs',
      'db:get-audit-logs', 
      'db:execute-sql', 
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
  getUsers: () => ipcRenderer.invoke('auth:get-all-users'),
  registerUser: (userData) => ipcRenderer.invoke('auth:register', userData),
  deleteUser: (id) => ipcRenderer.invoke('auth:delete-user', id),
  updateUser: (data) => ipcRenderer.invoke('update-user', data),
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
  // Tambahkan di object exposeInMainWorld 'api'
  exportWord: (laporan, dokumentasi) =>ipcRenderer.invoke('laporan:exportWord', laporan, dokumentasi),
// 2. TAMBAHKAN INI UNTUK PDF
  exportPdf: (laporan, dokumentasi) => 
    ipcRenderer.invoke('laporan:exportPdf', laporan, dokumentasi),
});