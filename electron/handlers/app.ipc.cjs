const { ipcMain, app } = require('electron');

function registerAppHandlers() {
  ipcMain.handle('get-app-name', () => {
    return app.getName();
  });
}

module.exports = {
  registerAppHandlers
};
