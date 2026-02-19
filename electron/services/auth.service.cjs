const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Impor dari service database & log
const { db, avatarPath, defaultAvatarPath } = require('./database.service.cjs');
// TAMBAHKAN setCurrentUser di sini
const { addLog, getAuditLogs, setCurrentUser } = require('./log.service.cjs');
/**
 * 1. AMBIL SEMUA USER
 */
function getAllUsers() {
    try {
        const users = db.prepare(`
            SELECT id, foto, username, id_pegawai, fullname, role, created_at 
            FROM users 
            ORDER BY id DESC
        `).all();
        return users;
    } catch (error) {
        // Log sistem tidak butuh username spesifik
        addLog('FETCH_ERROR', 'Gagal mengambil daftar pengguna', 'System', error.message);
        return [];
    }
}

/**
 * 2. UPDATE USER (DENGAN LOGIC COPY FOTO)
 * Ditambahkan parameter 'actor' untuk mencatat siapa yang melakukan update
 */
function updateUser(userData, actor = 'System') {
    try {
        const { id, fullname, username, id_pegawai, role, foto, password } = userData;

        const existingUser = db.prepare('SELECT foto, username FROM users WHERE id = ?').get(id);
        if (!existingUser) throw new Error('User tidak ditemukan');

        let finalFotoPath = existingUser.foto;

        // Fungsi normalisasi yang lebih tangguh
        const normalizePath = (p) => {
            if (!p) return null;
            return p.replace(/^(file:\/\/|app-file:\/\/)/, "") // Hapus protocol
                    .replace(/^\//, "")                        // Hapus slash depan (Windows fix)
                    .replace(/\\/g, '/');                      // Ubah backslash ke forward slash
        };

        const cleanSourcePath = normalizePath(foto);
        const cleanExistingPath = normalizePath(existingUser.foto);

        // LOGIKA PERBAIKAN: 
        // Cek apakah source path ada, dan apakah itu file baru (bukan di folder avatars kita)
        if (cleanSourcePath && !cleanSourcePath.includes('avatars/avatar_')) {
            
            // Cek apakah file fisik-nya memang ada di komputer
            // Note: Kita gunakan path asli (cleanSourcePath mungkin perlu didecode jika ada spasi/%20)
            const absoluteSource = decodeURIComponent(cleanSourcePath);

            if (fs.existsSync(absoluteSource)) {
                const ext = path.extname(absoluteSource) || '.png';
                const fileName = `avatar_${id}_${Date.now()}${ext}`;
                const destinationPath = path.join(avatarPath, fileName);
                
                // Copy file fisik
                fs.copyFileSync(absoluteSource, destinationPath);
                finalFotoPath = destinationPath; // Simpan path baru ke database

                // Hapus foto lama agar tidak memenuhi storage (kecuali default)
                if (existingUser.foto && !existingUser.foto.includes('default.png')) {
                    try { 
                        if (fs.existsSync(existingUser.foto)) { fs.unlinkSync(existingUser.foto); }
                    } catch (e) { console.error("Gagal hapus file lama:", e); }
                }
            }
        }

        // Eksekusi UPDATE ke Database
        if (password && password.trim() !== "") {
            const hash = bcrypt.hashSync(password, 10);
            db.prepare(`
                UPDATE users SET fullname=?, username=?, id_pegawai=?, role=?, foto=?, password_hash=? WHERE id=?
            `).run(fullname, username, id_pegawai, role, finalFotoPath, hash, id);
        } else {
            db.prepare(`
                UPDATE users SET fullname=?, username=?, id_pegawai=?, role=?, foto=? WHERE id=?
            `).run(fullname, username, id_pegawai, role, finalFotoPath, id);
        }

        addLog('UPDATE_SUCCESS', `Update profil user: ${username}`, actor);
        
        return { success: true, photoPath: finalFotoPath };
    } catch (error) {
        addLog('UPDATE_ERROR', `Gagal update user: ${userData.username}`, actor, error.message);
        throw error;
    }
}
/**
 * 3. REGISTER USER
 */
function registerUser(userData, actor = 'System') {
    try {
        const { fullname, username, id_pegawai, password, role } = userData;
        
        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (existing) throw new Error('Username sudah digunakan');

        const hash = bcrypt.hashSync(password, 10);
        
        const result = db.prepare(`
            INSERT INTO users (foto, username, id_pegawai, fullname, password_hash, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(defaultAvatarPath, username, id_pegawai, fullname, hash, role || 'user');

        // PERUBAHAN DI SINI: Mengirimkan 'actor'
        addLog('REGISTER_SUCCESS', `User baru terdaftar: ${username}`, actor);
        
        return { success: true, id: result.lastInsertRowid };
    } catch (error) {
        addLog('REGISTER_ERROR', `Gagal register user: ${userData.username}`, actor, error.message);
        throw error;
    }
}

/**
 * 4. DELETE USER
 */
function deleteUser(id, actor = 'System') {
    try {
        const user = db.prepare('SELECT username FROM users WHERE id = ?').get(id);
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
        
        if (result.changes > 0) {
            // PERUBAHAN DI SINI: Mengirimkan 'actor'
            addLog('DELETE_SUCCESS', `Menghapus user: ${user ? user.username : id}`, actor);
        }
        return { success: result.changes > 0 };
    } catch (error) {
        addLog('DELETE_ERROR', `Gagal hapus user ID: ${id}`, actor, error.message);
        throw error;
    }
}

/**
 * 5. VALIDASI LOGIN
 */
function validateLogin(username, password) {
    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            addLog('LOGIN_FAILED', `Username tidak dikenal: ${username}`, username);
            return { success: false, message: 'Username tidak ditemukan' };
        }

        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) {
            addLog('LOGIN_FAILED', `Password salah untuk user: ${username}`, username);
            return { success: false, message: 'Password salah' };
        }

        // --- PERUBAHAN KRUSIAL DI SINI ---
        // Simpan data user ke dalam session Log Service agar 
        // handler lain (seperti hapus laporan) tahu siapa yang sedang aktif.
        setCurrentUser({ username: user.username, role: user.role });

        addLog('LOGIN_SUCCESS', `User masuk ke sistem`, username);
        
        const { password_hash, ...userSafeData } = user;
        return { success: true, user: userSafeData };
    } catch (error) {
        addLog('AUTH_ERROR', `System error pada login: ${username}`, 'System', error.message);
        return { success: false, message: 'Database Error' };
    }
}
/**
 * 6. ENSURE ADMIN
 */
function ensureAdminUser() {
    try {
        const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
        if (admin) return false;

        const hash = bcrypt.hashSync('admin123', 10);
        
        db.prepare(`
            INSERT INTO users (foto, username, id_pegawai, fullname, password_hash, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(defaultAvatarPath, 'admin', 'B001IT', 'Sigit Santoso', hash, 'admin');
        
        addLog('SYSTEM', 'Default Admin "admin" otomatis dibuat', 'System');
        return true;
    } catch (error) {
        console.error('❌ [AUTH] Seeder Error:', error.message);
        return false;
    }
}

module.exports = {
    ensureAdminUser,
    validateLogin,
    getAllUsers,
    registerUser,
    deleteUser,
    updateUser,
    getAuditLogs
};