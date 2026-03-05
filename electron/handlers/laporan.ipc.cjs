const { ipcMain, dialog, app, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { db, uploaderPath } = require('../services/database.service.cjs');
const { 
  Document, Packer, Paragraph, TextRun, 
  ImageRun, Table, TableRow, TableCell,
  VerticalAlign, WidthType, AlignmentType,
  BorderStyle
} = require('docx');
const imageSize = require('image-size');
const sizeOf = imageSize.default || imageSize;
const { jsPDF } = require("jspdf");
require("jspdf-autotable");

// --- UTILS ---

const sanitize = (name) => {
  if (!name) return 'unnamed';
  return name.replace(/[\\/:*?"<>|]/g, '_').trim();
};
// INI YANG TADI HILANG: Fungsi untuk format tanggal Indonesia
const formatIndo = (dateStr) => {
  if (!dateStr || dateStr === "" || dateStr === "null") return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch (e) { return dateStr; }
};
const getSecurePath = (rawPath, laporanNama, albumNama) => {
  if (fs.existsSync(rawPath)) return rawPath;
  const fileName = path.basename(rawPath);
  const fallbackPath = path.join(uploaderPath, sanitize(laporanNama), sanitize(albumNama), fileName);
  if (fs.existsSync(fallbackPath)) return fallbackPath;
  return null;
};

const getSettingsMap = () => {
  try {
    const rows = db.prepare("SELECT * FROM settings").all();
    const config = {};
    rows.forEach(row => {
      try {
        config[row.key] = JSON.parse(row.value);
      } catch {
        config[row.key] = row.value;
      }
    });
    return config;
  } catch (err) {
    return { headerColor: "#1F4E78", fontColor: "#333333", columns: 3, imgHeight: 45, rowGap: 15 };
  }
};

// --- HANDLERS ---

function registerLaporanHandlers() {
  const channels = [
    'laporan:getAll', 'laporan:create', 'laporan:update', 'laporan:delete',
    'laporan:saveDokumentasi', 'laporan:getDokumentasiByLaporan', 
    'laporan:addFotoToDokumentasi', 'laporan:deleteFoto', 
    'laporan:deleteDokumentasi', 'laporan:renameDokumentasi',
    'select-files', 'dashboard:get-stats', 'laporan:exportWord', 'laporan:exportPdf'
  ];
  channels.forEach(ch => ipcMain.removeHandler(ch));

  // --- DASHBOARD (FIX DATA 0) ---
  ipcMain.handle('dashboard:get-stats', async () => {
    try {
      const totalLaporan = db.prepare('SELECT COUNT(*) as count FROM laporan').get()?.count || 0;
      const totalDokumentasi = db.prepare('SELECT COUNT(*) as count FROM dokumentasi').get()?.count || 0;
      const totalFoto = db.prepare('SELECT COUNT(*) as count FROM table_foto').get()?.count || 0;
      
      // Menggunakan tabel logs atau audit_logs sesuai database lu
      let recentLogs = [];
      try {
        recentLogs = db.prepare('SELECT status as action, query as details, timestamp FROM audit_logs ORDER BY id DESC LIMIT 5').all();
      } catch (e) {
        recentLogs = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 5').all();
      }

      return { totalLaporan, totalDokumentasi, totalFoto, recentLogs };
    } catch (error) { 
      console.error("Stats Error:", error);
      return { totalLaporan: 0, totalDokumentasi: 0, totalFoto: 0, recentLogs: [] }; 
    }
  });

  ipcMain.handle('laporan:getAll', async () => {
    return db.prepare(`SELECT l.*, (SELECT COUNT(*) FROM dokumentasi d WHERE d.id_laporan = l.id_laporan) as jumlah_dok FROM laporan l ORDER BY l.id_laporan DESC`).all();
  });

  // --- CRUD LAPORAN (WITH FOLDER SYNC) ---
  ipcMain.handle('laporan:create', async (event, data) => {
    const stmt = db.prepare(`INSERT INTO laporan (nama_laporan, tahap, progress, tgl_laporan, tgl_mulai, tgl_selesai) VALUES (?, ?, ?, ?, ?, ?)`);
    return stmt.run(data.nama_laporan, data.tahap, data.progress, data.tgl_laporan, data.tgl_mulai, data.tgl_selesai);
  });

  ipcMain.handle('laporan:update', async (event, data) => {
    const transaction = db.transaction(() => {
      const oldData = db.prepare('SELECT nama_laporan FROM laporan WHERE id_laporan = ?').get(data.id_laporan);
      
      if (oldData && oldData.nama_laporan !== data.nama_laporan) {
        const oldFolderName = sanitize(oldData.nama_laporan);
        const newFolderName = sanitize(data.nama_laporan);
        const oldPath = path.resolve(uploaderPath, oldFolderName);
        const newPath = path.resolve(uploaderPath, newFolderName);

        if (fs.existsSync(oldPath)) {
          try { 
            fs.renameSync(oldPath, newPath); 
          } catch (e) { 
            throw new Error("Folder sedang digunakan aplikasi lain."); 
          }
        }

        db.prepare(`UPDATE table_foto SET path_foto = REPLACE(path_foto, ?, ?) WHERE id_dokumentasi IN (SELECT id_dokumentasi FROM dokumentasi WHERE id_laporan = ?)`).run(oldPath, newPath, data.id_laporan);
      }

      db.prepare(`UPDATE laporan SET nama_laporan = ?, tahap = ?, progress = ?, tgl_laporan = ?, tgl_mulai = ?, tgl_selesai = ? WHERE id_laporan = ?`)
        .run(data.nama_laporan, data.tahap, data.progress, data.tgl_laporan, data.tgl_mulai, data.tgl_selesai, data.id_laporan);
    });

    try { transaction(); return { success: true }; } catch (err) { return { success: false, message: err.message }; }
  });

  ipcMain.handle('laporan:delete', async (event, id) => {
    const laporan = db.prepare('SELECT nama_laporan FROM laporan WHERE id_laporan = ?').get(id);
    if (laporan) {
      const folderPath = path.join(uploaderPath, sanitize(laporan.nama_laporan));
      if (fs.existsSync(folderPath)) fs.rmSync(folderPath, { recursive: true, force: true });
    }
    return db.prepare('DELETE FROM laporan WHERE id_laporan = ?').run(id);
  });

  // --- DOKUMENTASI & FOTO ---
  ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }] });
    return result.canceled ? [] : result.filePaths.map(p => ({ path: p, name: path.basename(p) }));
  });

  ipcMain.handle('laporan:saveDokumentasi', async (event, { id_laporan, nama_dokumentasi, files }) => {
    try {
      const laporan = db.prepare('SELECT nama_laporan FROM laporan WHERE id_laporan = ?').get(id_laporan);
      const targetDir = path.join(uploaderPath, sanitize(laporan.nama_laporan), sanitize(nama_dokumentasi));
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const resDok = db.prepare('INSERT INTO dokumentasi (id_laporan, nama_dokumentasi) VALUES (?, ?)').run(id_laporan, nama_dokumentasi);
      const id_dok = resDok.lastInsertRowid;
      const insertFoto = db.prepare('INSERT INTO table_foto (id_dokumentasi, path_foto, filename) VALUES (?, ?, ?)');

      for (const file of files) {
        const fileName = `${Date.now()}_${path.basename(file.path)}`;
        const destPath = path.join(targetDir, fileName);
        fs.copyFileSync(file.path, destPath);
        insertFoto.run(id_dok, destPath, fileName);
      }
      return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
  });

  ipcMain.handle('laporan:addFotoToDokumentasi', async (event, { id_dokumentasi, files }) => {
    try {
      const info = db.prepare(`SELECT l.nama_laporan, d.nama_dokumentasi FROM dokumentasi d JOIN laporan l ON d.id_laporan = l.id_laporan WHERE d.id_dokumentasi = ?`).get(id_dokumentasi);
      if (!info) throw new Error("Album tidak ditemukan");

      const targetDir = path.join(uploaderPath, sanitize(info.nama_laporan), sanitize(info.nama_dokumentasi));
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const insertFoto = db.prepare('INSERT INTO table_foto (id_dokumentasi, path_foto, filename) VALUES (?, ?, ?)');
      for (const file of files) {
        const fileName = `${Date.now()}_${path.basename(file.path)}`;
        const destPath = path.join(targetDir, fileName);
        fs.copyFileSync(file.path, destPath);
        insertFoto.run(id_dokumentasi, destPath, fileName);
      }
      return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
  });

  ipcMain.handle('laporan:renameDokumentasi', async (event, { id_dokumentasi, newName }) => {
    try {
      const album = db.prepare(`SELECT d.nama_dokumentasi, l.nama_laporan FROM dokumentasi d JOIN laporan l ON d.id_laporan = l.id_laporan WHERE d.id_dokumentasi = ?`).get(id_dokumentasi);
      if (!album) throw new Error("Album tidak ditemukan");

      const oldPath = path.join(uploaderPath, sanitize(album.nama_laporan), sanitize(album.nama_dokumentasi));
      const newPath = path.join(uploaderPath, sanitize(album.nama_laporan), sanitize(newName));

      if (fs.existsSync(oldPath)) {
        if (fs.existsSync(newPath) && oldPath !== newPath) throw new Error("Nama folder sudah ada");
        fs.renameSync(oldPath, newPath);
      }

      db.transaction(() => {
        const fotos = db.prepare('SELECT id_foto, path_foto FROM table_foto WHERE id_dokumentasi = ?').all(id_dokumentasi);
        for (const f of fotos) {
          const updatedPath = f.path_foto.replace(oldPath, newPath);
          db.prepare('UPDATE table_foto SET path_foto = ? WHERE id_foto = ?').run(updatedPath, f.id_foto);
        }
        db.prepare('UPDATE dokumentasi SET nama_dokumentasi = ? WHERE id_dokumentasi = ?').run(newName, id_dokumentasi);
      })();
      return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
  });

  ipcMain.handle('laporan:getDokumentasiByLaporan', async (event, id_laporan) => {
    const albums = db.prepare('SELECT id_dokumentasi, nama_dokumentasi FROM dokumentasi WHERE id_laporan = ?').all(id_laporan);
    const result = [];
    for (const album of albums) {
      const fotosDb = db.prepare('SELECT path_foto, filename FROM table_foto WHERE id_dokumentasi = ?').all(album.id_dokumentasi);
      const files = fotosDb.map(f => ({
        name: f.filename,
        rawPath: f.path_foto,
        path: `file:///${f.path_foto.replace(/\\/g, '/')}`
      }));
      result.push({ id_dokumentasi: album.id_dokumentasi, nama_dokumentasi: album.nama_dokumentasi, files });
    }
    return result;
  });

  ipcMain.handle('laporan:deleteFoto', async (event, rawPath) => {
    if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
    return db.prepare('DELETE FROM table_foto WHERE path_foto = ?').run(rawPath);
  });

ipcMain.handle('laporan:deleteDokumentasi', async (event, id_dokumentasi) => {
  try {
    // 1. Ambil info album & folder
    const album = db.prepare(`
      SELECT d.nama_dokumentasi, l.nama_laporan 
      FROM dokumentasi d 
      JOIN laporan l ON d.id_laporan = l.id_laporan 
      WHERE d.id_dokumentasi = ?
    `).get(id_dokumentasi);

    if (!album) return { success: false, message: "Album tidak ditemukan" };

    const folderPath = path.join(uploaderPath, sanitize(album.nama_laporan), sanitize(album.nama_dokumentasi));

    // 2. Gunakan Transaction untuk Database
    const deleteTx = db.transaction(() => {
      // Hapus foto-fotonya dulu (Foreign Key friendly)
      db.prepare('DELETE FROM table_foto WHERE id_dokumentasi = ?').run(id_dokumentasi);
      // Hapus albumnya
      db.prepare('DELETE FROM dokumentasi WHERE id_dokumentasi = ?').run(id_dokumentasi);
    });

    deleteTx(); // Jalankan hapus database

    // 3. Hapus folder fisik (Try-catch terpisah agar tidak membatalkan status database)
    try {
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
      }
    } catch (fsErr) {
      console.error("Folder fisik gagal dihapus (mungkin terkunci), tapi data DB sudah terhapus:", fsErr);
      // Kita tetap return true karena yang terpenting datanya hilang dari UI/Tabel
    }

    return { success: true };
  } catch (e) {
    console.error("Backend Error:", e);
    return { success: false, message: e.message };
  }
});

  // --- EXPORT PDF (FIXED GRID TABLE SYSTEM) ---
ipcMain.handle('laporan:exportPdf', async (event, laporan, dokumentasi) => {
  try {
    const config = getSettingsMap();
    
    // 1. Inisialisasi Doc (Sinkronisasi Ukuran Kertas)
    const pSize = config.pageSize || "a4";
    const doc = new jsPDF({ 
      orientation: "p", 
      unit: "mm", 
      format: pSize 
    });

    // Kalkulasi Dimensi Halaman Dinamis
    const pageWidth = pSize === "legal" ? 215.9 : 210;
    const pageHeight = pSize === "legal" ? 355.6 : 297;
    
    // 2. Sanitasi Config & Warna
    const margin = Math.round(Number(config.marginPage) || 20);
    const cols = Math.max(1, parseInt(config.columns) || 3);
    const fixedH = Math.round(Number(config.imgHeight) || 45);
    const descSize = parseInt(config.descSize) || 8;
    const rowGap = parseInt(config.rowGap) || 15; // Jarak baris dari UI
    
    const hColorClean = (config.headerColor || "1F4E78").replace(/[^0-9A-Fa-f]/g, '');
    const fColorClean = (config.fontColor || "333333").replace(/[^0-9A-Fa-f]/g, '');
    const hColor = `#${hColorClean.substring(0, 6)}`;
    const fColor = `#${fColorClean.substring(0, 6)}`;

    // --- DRAW HEADER ---
    const centerX = pageWidth / 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(parseInt(config.titleSize) || 24);
    doc.setTextColor(fColor);
    doc.text(String(laporan.nama_laporan).toUpperCase(), centerX, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(hColor);
    // SINKRONISASI: Menggunakan config.judulLaporan dari UI
    doc.text(config.judulLaporan || "LAPORAN DOKUMENTASI PEKERJAAN", centerX, 28, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.text(`TAHAP: ${(laporan.tahap || "-").toUpperCase()}`, centerX, 34, { align: "center" });
    
    const tglAwal = laporan.tgl_mulai || laporan.tgl_laporan;
    const tglAkhir = laporan.tgl_selesai || laporan.tgl_laporan;
    doc.text(`PERIODE: ${tglAwal} s/d ${tglAkhir}`, centerX, 39, { align: "center" });

    // --- GRID SETUP ---
    let currentY = 50;
    const spacing = 5; 
    const cellWidth = (pageWidth - (margin * 2) - (spacing * (cols - 1))) / cols;

    for (const album of dokumentasi) {
      if (currentY > pageHeight - 40) { doc.addPage(); currentY = 20; }

      // --- BAR DESKRIPSI ---
      doc.setFillColor(hColor);
      doc.rect(margin, currentY, pageWidth - (margin * 2), 8, "F");
      doc.setTextColor("#FFFFFF");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(` DESKRIPSI: ${String(album.nama_dokumentasi).toUpperCase()}`, margin + 2, currentY + 5.5);
      
      currentY += 12;

      if (album.files && album.files.length > 0) {
        for (let i = 0; i < album.files.length; i += cols) {
          const rowFiles = album.files.slice(i, i + cols);
          
          const requiredSpace = fixedH + 12; 
          if (currentY + requiredSpace > pageHeight - margin) {
            doc.addPage();
            currentY = 20;
          }

          rowFiles.forEach((file, index) => {
            const xPos = margin + (index * (cellWidth + spacing));
            const finalPath = getSecurePath(file.rawPath, laporan.nama_laporan, album.nama_dokumentasi);
            
            if (finalPath && fs.existsSync(finalPath)) {
              try {
                const imgBuffer = fs.readFileSync(finalPath);
                const imgData = imgBuffer.toString('base64');
                const dim = sizeOf(new Uint8Array(imgBuffer));
                const ratio = (dim.width / dim.height) || 1.33;

                let renderW = cellWidth;
                let renderH = cellWidth / ratio;

                if (renderH > fixedH) {
                  renderH = fixedH;
                  renderW = fixedH * ratio;
                }

                const offsetX = (cellWidth - renderW) / 2;
                const offsetY = (fixedH - renderH) / 2;

                doc.addImage(imgData, 'JPEG', xPos + offsetX, currentY + offsetY, renderW, renderH, undefined, 'FAST');

                doc.setFont("helvetica", "normal");
                doc.setFontSize(descSize);
                doc.setTextColor(fColor);
                const shortName = file.name.length > 25 ? file.name.substring(0, 22) + "..." : file.name;
                doc.text(shortName, xPos + (cellWidth / 2), currentY + fixedH + 5, { align: "center" });

              } catch (e) { console.error("Img Error:", e); }
            }
          });

          // SINKRONISASI: Menggunakan rowGap dari UI
          currentY += fixedH + rowGap; 
        }
      }
      currentY += 5;
    }

    const saveName = `PDF_${laporan.nama_laporan.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const savePath = path.join(app.getPath('desktop'), saveName);
    fs.writeFileSync(savePath, Buffer.from(doc.output("arraybuffer")));
    shell.openPath(savePath);
    
    return { success: true };
  } catch (err) { 
    console.error("PDF Export Error:", err); 
    throw err; 
  }
});

// --- EXPORT WORD ---
ipcMain.handle('laporan:exportWord', async (event, laporan, dokumentasi) => {
  try {
    const config = getSettingsMap();

    const hColor = (config.headerColor || "1F4E78").replace(/[^0-9A-Fa-f]/g, '');
    const fColor = (config.fontColor || "333333").replace(/[^0-9A-Fa-f]/g, '');
    
    const cols = parseInt(config.columns) || 3;
    const imgH_base = parseInt(config.imgHeight) || 45; 
    const descSize = (parseInt(config.descSize) || 8) * 2; 

    const docContent = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({ 
            text: laporan.nama_laporan.toUpperCase(), 
            bold: true, 
            size: (parseInt(config.titleSize) || 24) * 2, 
            color: fColor 
          }),
          new TextRun({ 
            // SINKRONISASI: Menggunakan judulLaporan dari UI
            text: `\n${config.judulLaporan || "LAPORAN DOKUMENTASI PEKERJAAN"}`, 
            break: 1, size: 28, bold: true, color: hColor 
          }),
          new TextRun({ 
            text: `\nTAHAP: ${(laporan.tahap || "-").toUpperCase()}`, 
            break: 1, size: 20, bold: true 
          }),
          new TextRun({ 
            text: `\nPERIODE: ${formatIndo(laporan.tgl_mulai || laporan.tgl_laporan)} s/d ${formatIndo(laporan.tgl_selesai || laporan.tgl_laporan)}`, 
            break: 1, size: 20, bold: true 
          }),
        ]
      })
    ];

    // ... (Sisa kode album.files dan tableRows tetap sama seperti kode lama Anda)
    // ... (Pastikan tableRows menggunakan variabel cols, imgH_base, dan descSize yang sudah diambil dari config di atas)

    for (const album of dokumentasi) {
      docContent.push(new Paragraph({
        shading: { fill: hColor }, 
        spacing: { before: 400, after: 200 },
        indent: { left: 100 },
        children: [
          new TextRun({ 
            text: ` DESKRIPSI: ${album.nama_dokumentasi.toUpperCase()} `, 
            color: "FFFFFF", bold: true, size: 22 
          })
        ]
      }));

      const tableRows = [];
      for (let i = 0; i < album.files.length; i += cols) {
        const rowCells = album.files.slice(i, i + cols).map(f => {
          const finalPath = getSecurePath(f.rawPath, laporan.nama_laporan, album.nama_dokumentasi);
          
          if (finalPath && fs.existsSync(finalPath)) {
            try {
              const imgBuffer = fs.readFileSync(finalPath);
              let ratio = 1.33; 
              try {
                const dim = sizeOf(new Uint8Array(imgBuffer)); 
                if (dim?.width && dim?.height) ratio = dim.width / dim.height;
              } catch (e) {}

              const maxW = 600 / cols; 
              let renderW = imgH_base * ratio * 3.5;
              let renderH = imgH_base * 3.5;

              if (renderW > maxW * 3.5) {
                renderW = maxW * 3.5;
                renderH = renderW / ratio;
              }

              const shortName = f.name.length > 25 ? f.name.substring(0, 22) + "..." : f.name;

              return new TableCell({
                width: { size: 100 / cols, type: WidthType.PERCENTAGE },
                borders: { 
                  top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, 
                  left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} 
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 100 },
                    children: [
                      new ImageRun({
                        data: imgBuffer,
                        transformation: { width: renderW, height: renderH }
                      })
                    ]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [
                      new TextRun({ text: shortName, size: descSize, color: fColor })
                    ]
                  })
                ],
              });
            } catch (e) { 
              return new TableCell({ children: [new Paragraph("Gagal Load Gambar")] }); 
            }
          }
          return new TableCell({ children: [new Paragraph("File Hilang")] });
        });

        while (rowCells.length < cols) {
          rowCells.push(new TableCell({ 
            children: [], 
            borders: { 
              top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, 
              left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} 
            } 
          }));
        }
        tableRows.push(new TableRow({ children: rowCells }));
      }

      docContent.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
        borders: BorderStyle.NONE
      }));
    }

    const doc = new Document({ sections: [{ children: docContent }] });
    const buffer = await Packer.toBuffer(doc);
    const savePath = path.join(app.getPath('desktop'), `WORD_${sanitize(laporan.nama_laporan)}_${Date.now()}.docx`);
    
    fs.writeFileSync(savePath, buffer);
    shell.openPath(savePath);
    return { success: true };
  } catch (error) {
    console.error("Export Error:", error);
    throw error;
  }
});


}

module.exports = { registerLaporanHandlers };