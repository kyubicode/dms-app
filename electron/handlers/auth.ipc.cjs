const { ipcMain, dialog } = require('electron'); 
const { 
  validateLogin, 
  getAllUsers, 
  registerUser, 
  deleteUser,
  updateUser, 
  getAuditLogs
} = require('../services/auth.service.cjs');

let currentUser = null;

function registerAuthHandlers() {
  
  // LOGIN & SESSION
  ipcMain.handle('auth:login', async (_, { username, password }) => {
    const result = await validateLogin(username, password); 
    if (result.success) currentUser = result.user; 
    return result;
  });

  ipcMain.handle('auth:get-profile', async () => currentUser);

  ipcMain.handle('auth:logout', async () => {
    currentUser = null;
    return { success: true };
  });

  // CRUD MANAJEMEN USER
  ipcMain.handle('auth:get-all-users', async () => {
    try { return getAllUsers(); } catch (error) { return []; }
  });

  ipcMain.handle('auth:register', async (_, userData) => {
    try {
      const actor = currentUser ? currentUser.username : 'System';
      return registerUser(userData, actor); 
    } catch (error) { throw error; }
  });

  ipcMain.handle('update-user', async (_, userData) => {
    try {
      const actor = currentUser ? currentUser.username : 'System';
      return updateUser(userData, actor); 
    } catch (error) { throw error; }
  });

  ipcMain.handle('auth:delete-user', async (_, id) => {
    try {
      const actor = currentUser ? currentUser.username : 'System';
      return deleteUser(id, actor); 
    } catch (error) { throw error; }
  });

  ipcMain.handle('auth:get-audit-logs', async (_, limit = 100) => {
    try { return getAuditLogs(limit); } catch (error) { return []; }
  });

  // SELECT AVATAR (Simplified)
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

      // Kembalikan path asli file. 
      // File akan di-copy secara permanen ke folder app oleh service saat Save/Update
      return result.canceled ? [] : result.filePaths; 
      
    } catch (err) {
      console.error("Error saat memilih avatar:", err);
      throw err;
    }
  });
}

module.exports = { registerAuthHandlers };