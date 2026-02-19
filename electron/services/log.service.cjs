const { db } = require('./database.service.cjs');

// Variabel lokal untuk menyimpan session user di tingkat Main Process
let currentUserSession = null;

/**
 * Menyimpan data user yang sedang login ke dalam session log
 * Dipanggil saat proses LOGIN berhasil
 */
function setCurrentUser(user) {
    currentUserSession = user;
    console.log(`✅ [LOG_SERVICE] Session diatur untuk: ${user?.username}`);
}

/**
 * Mengambil data user yang sedang aktif
 */
function getCurrentUser() {
    return currentUserSession;
}

/**
 * Mencatat aktivitas ke database secara global
 */
function addLog(status, query, username = null, error = null) {
    try {
        // Jika username tidak dikirim, coba ambil dari session aktif
        const activeUsername = username || currentUserSession?.username || 'System';

        const stmt = db.prepare(`
            INSERT INTO audit_logs (status, query, username, error) 
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(
            status, 
            query, 
            activeUsername, 
            error ? String(error) : null
        );
    } catch (err) {
        if (err.message.includes("has no column named username")) {
            console.error("❌ [LOG_SERVICE] ERROR: Kolom 'username' tidak ditemukan.");
            console.info("💡 Jalankan: ALTER TABLE audit_logs ADD COLUMN username TEXT DEFAULT 'System';");
        } else {
            console.error("❌ [LOG_SERVICE] Gagal mencatat log:", err);
        }
    }
}

function getAuditLogs(limit = 100) {
    try {
        return db.prepare(`
            SELECT id, timestamp, status, query, username, error 
            FROM audit_logs 
            ORDER BY id DESC 
            LIMIT ?
        `).all(limit);
    } catch (error) {
        console.error("❌ [LOG_SERVICE] Gagal fetch logs:", error);
        return [];
    }
}

function clearAllLogs() {
    try {
        db.prepare(`DELETE FROM audit_logs`).run();
        db.prepare(`DELETE FROM sqlite_sequence WHERE name='audit_logs'`).run();
        addLog('SYSTEM', 'Semua log telah dibersihkan oleh admin', 'System');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// EKSPOR SEMUA FUNGSI (PENTING!)
module.exports = {
    addLog,
    getAuditLogs,
    clearAllLogs,
    setCurrentUser, // Tambahkan ini
    getCurrentUser  // Tambahkan ini
};