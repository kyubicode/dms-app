const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app, ipcMain } = require('electron');
const bcrypt = require('bcryptjs');

// 1. Definisikan Path Utama
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'dms.db');
const uploaderPath = path.join(userDataPath, 'arsip');
const avatarPath = path.join(userDataPath, 'avatar');
const defaultAvatarPath = path.join(avatarPath, 'default.png');

// 2. Inisialisasi Database
const db = new Database(dbPath);

// 3. Pastikan Folder Fisik Tersedia
[uploaderPath, avatarPath].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * FUNGSI: Inisialisasi Asset Default
 */
const initDefaultAssets = () => {
    const sourceDefaultPhoto = path.join(app.getAppPath(), 'public', 'default-user.png');
    try {
        if (fs.existsSync(defaultAvatarPath)) {
            const stats = fs.statSync(defaultAvatarPath);
            if (stats.size === 0) fs.unlinkSync(defaultAvatarPath);
        }

        if (!fs.existsSync(defaultAvatarPath) && fs.existsSync(sourceDefaultPhoto)) {
            fs.copyFileSync(sourceDefaultPhoto, defaultAvatarPath);
            console.log("✅ [SYSTEM] Default avatar initialized.");
        }
    } catch (err) {
        console.error("❌ [SYSTEM] Failed to init assets:", err.message);
    }
};

initDefaultAssets();

// 4. Konfigurasi SQLite
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL'); 

// 5. Inisialisasi Skema Tabel (KOLOM folder_path SUDAH DITAMBAHKAN)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foto TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    id_pegawai TEXT UNIQUE NOT NULL,
    fullname TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS laporan (
    id_laporan INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_laporan TEXT NOT NULL,
    tahap TEXT,
    progress TEXT,
    tgl_laporan TEXT,
    tgl_mulai TEXT,
    tgl_selesai TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS dokumentasi (
    id_dokumentasi INTEGER PRIMARY KEY AUTOINCREMENT,
    id_laporan INTEGER NOT NULL,
    nama_dokumentasi TEXT NOT NULL,
    tgl_dokumentasi TEXT,
    folder_path TEXT, -- <--- PERBAIKAN: Kolom ini wajib ada!
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_laporan) REFERENCES laporan (id_laporan) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS table_foto (
    id_foto INTEGER PRIMARY KEY AUTOINCREMENT,
    id_dokumentasi INTEGER NOT NULL,
    path_foto TEXT NOT NULL,
    filename TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_dokumentasi) REFERENCES dokumentasi (id_dokumentasi) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    query TEXT,
    username TEXT DEFAULT 'System',
    error TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

/**
 * -----------------------------------------------------------
 * AUTO-MIGRATION (WAJIB JALAN AGAR TIDAK SQLITE_ERROR)
 * -----------------------------------------------------------
 */
try {
    // Migrasi audit_logs
    const auditInfo = db.prepare("PRAGMA table_info(audit_logs)").all();
    if (!auditInfo.some(col => col.name === 'username')) {
        db.prepare("ALTER TABLE audit_logs ADD COLUMN username TEXT DEFAULT 'System'").run();
    }

    // PERBAIKAN: Migrasi Tabel Dokumentasi untuk kolom folder_path
    const dokInfo = db.prepare("PRAGMA table_info(dokumentasi)").all();
    if (!dokInfo.some(col => col.name === 'folder_path')) {
        console.log("⚠️ [DATABASE] Menambahkan kolom 'folder_path' ke dokumentasi...");
        db.prepare("ALTER TABLE dokumentasi ADD COLUMN folder_path TEXT").run();
        console.log("✅ [DATABASE] Kolom 'folder_path' berhasil ditambahkan!");
    }
} catch (err) {
    console.error("❌ [DATABASE_MIGRATION_ERROR]", err.message);
}

/**
 * -----------------------------------------------------------
 * UNIFIED LOGGING SYSTEM
 * -----------------------------------------------------------
 */
const auditLog = (query, status, username = 'System', error = null) => {
    try {
        const stmt = db.prepare(`
            INSERT INTO audit_logs (status, query, username, error) 
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(status, query, username, error ? String(error) : null);
    } catch (e) { 
        console.error("❌ [DATABASE_LOG_ERROR]", e); 
    }
};

function registerDatabaseHandlers() {
    // --- SEEDER ADMIN ---
    try {
        const adminExist = db.prepare("SELECT id FROM users WHERE username = ?").get('admin');
        if (!adminExist) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync('admin123', salt);
            const insertAdmin = db.prepare(`
                INSERT INTO users (foto, username, id_pegawai, fullname, password_hash, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            insertAdmin.run(defaultAvatarPath, 'admin', 'ADM-01', 'Super Admin', hash, 'admin');
            auditLog('Default admin created', 'SEEDER_SUCCESS', 'System');
        }
    } catch (err) { console.error("❌ Seeder Error:", err.message); }

    // --- SEEDER SETTINGS ---
    try {
        const checkSettings = db.prepare("SELECT COUNT(*) as count FROM settings").get();
        if (checkSettings.count === 0) {
            const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
            const defaults = [
                ['pageSize', JSON.stringify('a4')],
                ['columns', JSON.stringify(3)],
                ['imgHeight', JSON.stringify(45)],
                ['gap', JSON.stringify(10)],
                ['headerColor', JSON.stringify('#1F4E78')],
                ['companyName', JSON.stringify('CV DINAMIKA SINERGI')]
            ];
            db.transaction((data) => {
                for (const [k, v] of data) insertSetting.run(k, v);
            })(defaults);
        }
    } catch (err) { console.error("❌ Settings Seeder Error:", err.message); }

    // --- IPC HANDLERS ---
    ipcMain.handle('db:execute-sql', async (event, sql) => {
        let cleanQuery = sql.trim();
        const queryUpper = cleanQuery.toUpperCase();
        try {
            const stmt = db.prepare(cleanQuery);
            const isRead = /^(SELECT|PRAGMA|SHOW|DESC|EXPLAIN|WITH)/i.test(queryUpper);
            if (isRead) {
                return { success: true, data: stmt.all(), type: 'TABLE' };
            } else {
                const result = stmt.run();
                return { success: true, data: `Affected: ${result.changes}`, type: 'INFO' };
            }
        } catch (err) {
            return { success: false, error: err.message.toUpperCase() };
        }
    });

    // Handler lainnya (audit-logs, check-status, dll) tetap sama...
    ipcMain.handle('db:get-audit-logs', async () => {
        try { return { success: true, data: db.prepare(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100`).all() }; }
        catch (err) { return { success: false, error: err.message }; }
    });

    return db;
}

module.exports = { db, uploaderPath, avatarPath, defaultAvatarPath, registerDatabaseHandlers };