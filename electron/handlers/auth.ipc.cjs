const { ipcMain, dialog } = require('electron'); 
const { 
  validateLogin, 
  getAllUsers, 
  registerUser, 
  deleteUser,
  updateUser, 
  getAuditLogs
} = require('../services/auth.service.cjs');

// Variabel lokal untuk menyimpan session user yang sedang login
let currentUser = null;

function registerAuthHandlers() {
  
  // --- HANDLER LOGIN & SESSION ---
  
  ipcMain.handle('auth:login', async (_, { username, password }) => {
    // WAJIB: Gunakan await agar proses penulisan log di service selesai sebelum merespon UI
    const result = await validateLogin(username, password); 
    
    if (result.success) {
      currentUser = result.user; // Simpan data user ke memory main process
    }
    return result;
  });

  ipcMain.handle('auth:get-profile', async () => {
    return currentUser;
  });

  ipcMain.handle('auth:logout', async () => {
    currentUser = null;
    return { success: true };
  });

  // --- HANDLER MANAJEMEN USER (CRUD) ---
  
  // 1. Ambil Semua User
  ipcMain.handle('auth:get-all-users', async () => {
    try {
      return getAllUsers(); 
    } catch (error) {
      console.error("[IPC ERROR] auth:get-all-users:", error);
      return [];
    }
  });

  // 2. Register User Baru
  ipcMain.handle('auth:register', async (_, userData) => {
    try {
      // Ambil nama pelaku dari session
      const actor = currentUser ? currentUser.username : 'System';
      return registerUser(userData, actor); // Kirim data dan pelaku
    } catch (error) {
      console.error("[IPC ERROR] auth:register:", error);
      throw error; 
    }
  });

  // 3. Update User 
  ipcMain.handle('update-user', async (_, userData) => {
    try {
      // Ambil nama pelaku dari session
      const actor = currentUser ? currentUser.username : 'System';
      console.log(`[IPC] User "${actor}" sedang mengupdate user ID: ${userData.id}`);
      
      // Kirim actor sebagai argumen kedua sesuai auth.service.cjs
      return updateUser(userData, actor); 
    } catch (error) {
      console.error("[IPC ERROR] update-user:", error);
      throw error;
    }
  });

  // 4. Hapus User
  ipcMain.handle('auth:delete-user', async (_, id) => {
    try {
      // Ambil nama pelaku dari session
      const actor = currentUser ? currentUser.username : 'System';
      return deleteUser(id, actor); 
    } catch (error) {
      console.error("[IPC ERROR] auth:delete-user:", error);
      throw error;
    }
  });

  // 5. Ambil Audit Logs (untuk ditampilkan di halaman Riwayat/Admin)
  ipcMain.handle('auth:get-audit-logs', async (_, limit = 100) => {
    try {
      return getAuditLogs(limit);
    } catch (error) {
      console.error("[IPC ERROR] auth:get-audit-logs:", error);
      return [];
    }
  });

  // --- HANDLER KHUSUS AVATAR USER ---
  ipcMain.handle('auth:select-avatar', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Pilih Foto Profile Operator',
        buttonLabel: 'Gunakan Foto',
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'webp'] }
        ]
      });

      if (result.canceled) {
        return [];
      } else {
        return result.filePaths; 
      }
    } catch (err) {
      console.error("Error saat memilih avatar:", err);
      throw err;
    }
  });
}

module.exports = {
  registerAuthHandlers
};