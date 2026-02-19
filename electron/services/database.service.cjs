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

// 2. Definisikan Path Absolut untuk Default Avatar
const defaultAvatarPath = path.join(avatarPath, 'default.png');

// 3. Inisialisasi Database
const db = new Database(dbPath);

// 4. Pastikan Folder Fisik Tersedia
[uploaderPath, avatarPath].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 5. Konfigurasi SQLite
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL'); 

// 6. Inisialisasi Skema Tabel (DIPERBARUI DENGAN KOLOM USERNAME)
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
`);

/**
 * -----------------------------------------------------------
 * AUTO-MIGRATION (PENTING: Menambahkan kolom jika belum ada)
 * -----------------------------------------------------------
 */
try {
    const tableInfo = db.prepare("PRAGMA table_info(audit_logs)").all();
    const hasUsername = tableInfo.some(col => col.name === 'username');
    
    if (!hasUsername) {
        console.log("⚠️  [DATABASE] Menambahkan kolom 'username' ke audit_logs...");
        db.prepare("ALTER TABLE audit_logs ADD COLUMN username TEXT DEFAULT 'System'").run();
        console.log("✅ [DATABASE] Kolom 'username' berhasil ditambahkan!");
    }
} catch (err) {
    console.error("❌ [DATABASE_MIGRATION_ERROR]", err.message);
}

/**
 * -----------------------------------------------------------
 * UNIFIED LOGGING SYSTEM (DIPERBARUI)
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
    /**
     * 1. SEEDER ADMIN
     */
    try {
        const adminExist = db.prepare("SELECT id FROM users WHERE username = ?").get('admin');
        if (!adminExist) {
            console.log("[DATABASE] Admin not found, generating default admin...");
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync('admin123', salt);
            
            if (!fs.existsSync(defaultAvatarPath)) {
                fs.writeFileSync(defaultAvatarPath, ""); 
            }

            const insertAdmin = db.prepare(`
                INSERT INTO users (foto, username, id_pegawai, fullname, password_hash, role)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            insertAdmin.run(defaultAvatarPath, 'admin', 'ADM-01', 'Super Admin', hash, 'admin');
            auditLog('Default admin created', 'SEEDER_SUCCESS', 'System');
        }
    } catch (err) {
        console.error("❌ Seeder Error:", err.message);
    }

    /**
     * 2. IPC HANDLERS
     */
    
    ipcMain.handle('db:execute-sql', async (event, sql) => {
        let cleanQuery = sql.trim();
        const queryUpper = cleanQuery.toUpperCase();

        try {
            if (queryUpper === 'SHOW TABLES') {
                cleanQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
            } else if (queryUpper.startsWith('DESC ')) {
                const tableName = cleanQuery.split(' ')[1]?.replace(';', '');
                cleanQuery = `PRAGMA table_info(${tableName});`;
            }

            const stmt = db.prepare(cleanQuery);
            const isRead = /^(SELECT|PRAGMA|SHOW|DESC|EXPLAIN|WITH)/i.test(queryUpper);

            if (isRead) {
                const rows = stmt.all();
                auditLog(sql, 'READ_SUCCESS', 'Terminal');
                return { success: true, data: rows, type: 'TABLE' };
            } else {
                const result = stmt.run();
                auditLog(sql, 'WRITE_SUCCESS', 'Terminal');
                return { success: true, data: `Affected: ${result.changes}`, type: 'INFO' };
            }
        } catch (err) {
            auditLog(sql, 'FAILED', 'Terminal', err.message);
            return { success: false, error: err.message.toUpperCase() };
        }
    });

    ipcMain.handle('db:get-audit-logs', async () => {
        try {
            const logs = db.prepare(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100`).all();
            return { success: true, data: logs };
        } catch (err) { 
            return { success: false, error: err.message }; 
        }
    });

    ipcMain.handle('db:clear-logs', async () => {
        try {
            db.prepare(`DELETE FROM audit_logs`).run();
            db.prepare(`DELETE FROM sqlite_sequence WHERE name='audit_logs'`).run();
            auditLog('All activity logs have been purged', 'SYSTEM_PURGE', 'Admin');
            return { success: true };
        } catch (e) { 
            return { success: false, error: e.message }; 
        }
    });

    ipcMain.handle('db:check-status', async () => {
        try {
            const stats = fs.statSync(dbPath);
            return { 
                success: true, 
                type: 'TABLE', 
                data: [
                    { PROPERTY: 'DB_SIZE', VALUE: (stats.size / 1024 / 1024).toFixed(2) + ' MB' },
                    { PROPERTY: 'DB_PATH', VALUE: dbPath },
                    { PROPERTY: 'ENGINE', VALUE: 'better-sqlite3 (WAL Mode)' }
                ]
            };
        } catch (e) { return { success: false, error: e.message }; }
    });
}

module.exports = {
    db,
    uploaderPath,
    avatarPath,
    defaultAvatarPath,
    registerDatabaseHandlers 
};