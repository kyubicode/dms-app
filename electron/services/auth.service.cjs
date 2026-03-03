const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Impor dari service database & log
const { db, avatarPath, defaultAvatarPath } = require('./database.service.cjs');
const { addLog, getAuditLogs, setCurrentUser } = require('./log.service.cjs');

/**
 * Helper: Normalisasi Path & Copy File
 * Memusatkan logika pemrosesan foto agar konsisten
 */
const processUserPhoto = (id, sourcePath, existingPhotoPath = null) => {
    if (!sourcePath) return existingPhotoPath || defaultAvatarPath;

    const normalizePath = (p) => {
        if (!p) return null;
        return p.replace(/^(file:\/\/|app-file:\/\/)/, "")
                .replace(/^\//, "")
                .replace(/\\/g, '/');
    };

    const cleanSourcePath = normalizePath(sourcePath);
    
    // Jika path sudah berada di folder avatars kita, jangan copy ulang
    if (cleanSourcePath && cleanSourcePath.includes('avatars/avatar_')) {
        return sourcePath;
    }

    try {
        const absoluteSource = decodeURIComponent(cleanSourcePath);
        if (fs.existsSync(absoluteSource)) {
            // Pastikan direktori tujuan ada
            if (!fs.existsSync(avatarPath)) {
                fs.mkdirSync(avatarPath, { recursive: true });
            }

            const ext = path.extname(absoluteSource) || '.png';
            const fileName = `avatar_${id}_${Date.now()}${ext}`;
            const destinationPath = path.join(avatarPath, fileName);
            
            fs.copyFileSync(absoluteSource, destinationPath);

            // Hapus foto lama jika bukan default
            if (existingPhotoPath && !existingPhotoPath.includes('default.png')) {
                try {
                    if (fs.existsSync(existingPhotoPath)) {
                        fs.unlinkSync(existingPhotoPath);
                    }
                } catch (e) {
                    console.error("Gagal hapus file lama:", e);
                }
            }
            return destinationPath;
        }
    } catch (err) {
        console.error("Error processing photo:", err);
    }
    return existingPhotoPath || defaultAvatarPath;
};

/**
 * 1. AMBIL SEMUA USER
 */
function getAllUsers() {
    try {
        return db.prepare(`
            SELECT id, foto, username, id_pegawai, fullname, role, created_at 
            FROM users 
            ORDER BY id DESC
        `).all();
    } catch (error) {
        addLog('FETCH_ERROR', 'Gagal mengambil daftar pengguna', 'System', error.message);
        return [];
    }
}

/**
 * 2. UPDATE USER
 */
function updateUser(userData, actor = 'System') {
    try {
        const { id, fullname, username, id_pegawai, role, foto, password } = userData;

        const existingUser = db.prepare('SELECT foto, username FROM users WHERE id = ?').get(id);
        if (!existingUser) throw new Error('User tidak ditemukan');

        // Proses foto menggunakan helper
        const finalFotoPath = processUserPhoto(id, foto, existingUser.foto);

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
 * 3. REGISTER USER (FIXED: Sekarang mendukung input foto)
 */
function registerUser(userData, actor = 'System') {
    try {
        const { fullname, username, id_pegawai, password, role, foto } = userData;
        
        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
        if (existing) throw new Error('Username sudah digunakan');

        const hash = bcrypt.hashSync(password, 10);
        
        // Simpan data awal dengan default atau path sementara
        const result = db.prepare(`
            INSERT INTO users (foto, username, id_pegawai, fullname, password_hash, role)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(defaultAvatarPath, username, id_pegawai, fullname, hash, role || 'user');

        const newId = result.lastInsertRowid;

        // Jika ada foto yang diupload, proses sekarang setelah kita punya ID
        if (foto && foto !== defaultAvatarPath) {
            const finalFotoPath = processUserPhoto(newId, foto, defaultAvatarPath);
            db.prepare('UPDATE users SET foto = ? WHERE id = ?').run(finalFotoPath, newId);
        }

        addLog('REGISTER_SUCCESS', `User baru terdaftar: ${username}`, actor);
        return { success: true, id: newId };
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
        const user = db.prepare('SELECT username, foto FROM users WHERE id = ?').get(id);
        if (user && user.foto && !user.foto.includes('default.png')) {
            try { if (fs.existsSync(user.foto)) fs.unlinkSync(user.foto); } catch (e) {}
        }

        const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
        if (result.changes > 0) {
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