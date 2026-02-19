const { ipcMain, app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// 1. KONFIGURASI PATH
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'dms.db');
const logFile = path.join(userDataPath, 'database_audit.log');
const backupDir = path.join(userDataPath, 'arsip');

// 2. INISIALISASI DB (Singleton)
let db;
try {
    db = new Database(dbPath, { timeout: 5000 });
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
} catch (err) {
    console.error("[DATABASE] ❌ Critical Failure:", err);
}

/**
 * LOGIKA AUDIT DENGAN AUTO-PURGE
 * Jika file log > 5MB, otomatis direset agar aplikasi tidak berat.
 */
const auditLog = (query, status, error = null) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    try {
        if (fs.existsSync(logFile) && fs.statSync(logFile).size > MAX_SIZE) {
            fs.writeFileSync(logFile, `[SYSTEM] Log auto-cleared at ${new Date().toISOString()} (Limit 5MB reached)\n`);
        }
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] [${status}] QUERY: ${query}${error ? ` | ERR: ${error}` : ''}\n`;
        fs.appendFileSync(logFile, entry);
    } catch (e) {
        console.error("Audit log failed:", e);
    }
};

function registerDatabaseHandlers() {

    // --- A. EXECUTE SQL (WITH SECURITY & DIALECT) ---
    ipcMain.handle('db:execute-sql', async (event, sqlQuery) => {
        let cleanQuery = sqlQuery.trim();
        const queryUpper = cleanQuery.toUpperCase();

        try {
            if (!cleanQuery) throw new Error('EMPTY_QUERY');

            // 1. Dialect Translation (MySQL Style)
            if (queryUpper === 'SHOW TABLES') {
                cleanQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
            } else if (queryUpper.startsWith('DESC ')) {
                const tableName = cleanQuery.split(' ')[1]?.replace(';', '');
                cleanQuery = `PRAGMA table_info(${tableName});`;
            }

            // 2. Security Check
            const forbidden = ['ATTACH', 'DETACH', 'SHUTDOWN', 'VACUUM'];
            if (forbidden.some(cmd => queryUpper.includes(cmd))) {
                throw new Error('SECURITY_VIOLATION: FORBIDDEN_COMMAND');
            }

            // 3. Execution
            const stmt = db.prepare(cleanQuery);
            const isRead = /^(SELECT|PRAGMA|SHOW|DESC|EXPLAIN|WITH)/i.test(queryUpper);

            if (isRead) {
                let rows = stmt.all();
                if (rows.length > 1000) rows = rows.slice(0, 1000); // UI Safety
                
                auditLog(sqlQuery, 'READ_SUCCESS');
                return { success: true, data: rows, type: 'TABLE' };
            } else {
                const info = stmt.run();
                auditLog(sqlQuery, 'WRITE_SUCCESS');
                return { success: true, data: `AFFECTED_ROWS: ${info.changes}`, type: 'INFO' };
            }
        } catch (err) {
            auditLog(sqlQuery, 'FAILED', err.message);
            return { success: false, error: err.message.toUpperCase() };
        }
    });

    // --- B. CLEAR LOGS (MANUAL DARI UI) ---
    ipcMain.handle('db:clear-logs', async () => {
        try {
            fs.writeFileSync(logFile, `[SYSTEM] Logs cleared manually at ${new Date().toISOString()}\n`);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // --- C. GET AUDIT LOGS (UNTUK VIEWER) ---
    ipcMain.handle('db:get-audit-logs', async () => {
        try {
            if (!fs.existsSync(logFile)) return { success: true, data: [] };
            const data = fs.readFileSync(logFile, 'utf8');
            const logs = data.split('\n').filter(Boolean).reverse().slice(0, 100).map(line => {
                const match = line.match(/\[(.*?)\] \[(.*?)\] QUERY: (.*?)(?: \| ERR: (.*))?$/);
                return match ? { timestamp: match[1], status: match[2], query: match[3], error: match[4] } : { raw: line };
            });
            return { success: true, data: logs };
        } catch (err) { return { success: false, error: err.message }; }
    });

    // --- D. CHECK STATUS ---
    ipcMain.handle('db:check-status', async () => {
        try {
            const stats = fs.statSync(dbPath);
            const logStats = fs.existsSync(logFile) ? fs.statSync(logFile) : { size: 0 };
            const tableCount = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table'").get();

            return {
                success: true,
                type: 'TABLE',
                data: [
                    { PARAMETER: 'DATABASE_STATUS', VALUE: 'HEALTHY' },
                    { PARAMETER: 'TABLE_COUNT', VALUE: tableCount.count },
                    { PARAMETER: 'DB_SIZE', VALUE: (stats.size / 1024 / 1024).toFixed(2) + ' MB' },
                    { PARAMETER: 'LOG_SIZE', VALUE: (logStats.size / 1024).toFixed(2) + ' KB' }
                ]
            };
        } catch (err) { return { success: false, error: err.message }; }
    });
}

module.exports = { registerDatabaseHandlers };