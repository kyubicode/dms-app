const { ipcMain } = require('electron');
const { db } = require('./database.service.cjs'); // Mengambil koneksi db yang sudah ada

/**
 * Nilai default jika database kosong
 */
const defaultSettings = {
  pageSize: 'legal',
  columns: 3,
  imgHeight: 45,
  gap: 10,
  headerColor: '#1F4E78',
  accentColor: '#FFC107',
  companyName: 'CV DINAMIKA SINERGI'
};

const settingsManager = {
  /**
   * Mengambil data dari tabel 'settings'
   */
  get: () => {
    try {
      const rows = db.prepare("SELECT key, value FROM settings").all();
      
      // Jika tabel kosong, kembalikan default
      if (rows.length === 0) return defaultSettings;

      // Konversi array [ {key: '...', value: '...'} ] menjadi object { key: value }
      const settings = {};
      rows.forEach(row => {
        try {
          settings[row.key] = JSON.parse(row.value);
        } catch {
          settings[row.key] = row.value;
        }
      });

      // Gabungkan dengan default untuk memastikan property baru (jika ada) tetap ada
      return { ...defaultSettings, ...settings };
    } catch (e) {
      console.error("❌ [SETTINGS_MANAGER] Gagal membaca database:", e.message);
      return defaultSettings;
    }
  },

  /**
   * Inisialisasi IPC Handler
   * Dipanggil di main.js melalui settingsManager.init(ipcMain)
   */
  init: () => {
    // 1. Handler untuk mengambil settings (Invoke/Handle)
    ipcMain.handle('settings:get', () => {
      return settingsManager.get();
    });

    // 2. Handler untuk menyimpan settings
    // Menggunakan handle agar Frontend bisa menunggu (await) proses simpan selesai
    ipcMain.handle('settings:save', (event, newSettings) => {
      try {
        // Gunakan Transaction agar proses insert banyak key sekaligus sangat cepat
        const insert = db.prepare(`
          INSERT INTO settings (key, value) 
          VALUES (@key, @value)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `);

        const updateMany = db.transaction((data) => {
          for (const [key, value] of Object.entries(data)) {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            insert.run({ key, value: stringValue });
          }
        });

        updateMany(newSettings);
        console.log("✅ [SETTINGS_MANAGER] Settings autosaved to database");
        return { success: true };
      } catch (e) {
        console.error("❌ [SETTINGS_MANAGER] Gagal menyimpan ke database:", e.message);
        throw e; // Kirim error kembali ke frontend
      }
    });
    
    console.log("🚀 [SETTINGS_MANAGER] Handlers registered successfully");
  }
};

module.exports = settingsManager;