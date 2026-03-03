const { ipcMain, dialog, app, shell } = require('electron');
const path = require('path');
const fs = require('fs');
// HAPUS REQUIRE DB DI SINI! Kita pakai uploaderPath saja dari service
const { uploaderPath } = require('../services/database.service.cjs'); 
const { addLog } = require('../services/log.service.cjs');
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

const formatIndo = (dateStr) => {
  if (!dateStr || dateStr === "" || dateStr === "null") return "-";
  try {
    const d = new Date(dateStr);
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

// Modifikasi getSettingsMap agar menerima db sebagai parameter
const getSettingsMap = (db) => {
  try {
    const rows = db.prepare("SELECT * FROM settings").all();
    const config = {};
    rows.forEach(row => { config[row.key] = row.value; });
    return config;
  } catch (err) {
    return { headerColor: "#1F4E78", fontColor: "#333333", columns: 3, imgHeight: 45, rowGap: 15 };
  }
};

// --- HANDLERS (SEKARANG MENERIMA PARAMETER db) ---
function registerLaporanHandlers(ipcMain, db) {
  const channels = [
    'laporan:getAll', 'laporan:create', 'laporan:update', 'laporan:delete',
    'laporan:saveDokumentasi', 'laporan:getDokumentasiByLaporan', 
    'laporan:addFotoToDokumentasi', 'laporan:deleteFoto', 
    'laporan:deleteDokumentasi', 'laporan:renameDokumentasi',
    'select-files', 'dashboard:get-stats', 'laporan:exportWord', 'laporan:exportPdf'
  ];
  channels.forEach(ch => ipcMain.removeHandler(ch));

  // --- DASHBOARD & GENERAL ---
// handlers/laporan.ipc.cjs

ipcMain.handle('dashboard:get-stats', async () => {
    try {
        // Mengambil semua hitungan secara paralel (opsional, tapi rapi)
        const totalLaporan = db.prepare("SELECT COUNT(*) as total FROM laporan").get()?.total || 0;
        const totalDokumentasi = db.prepare("SELECT COUNT(*) as total FROM dokumentasi").get()?.total || 0;
        const totalFoto = db.prepare("SELECT COUNT(*) as total FROM table_foto").get()?.total || 0;

        // Ambil log dari tabel audit_logs (sesuai skema di database.service.cjs)
        const logs = db.prepare(`
            SELECT 
                status as action, 
                query as details, 
                timestamp 
            FROM audit_logs 
            ORDER BY id DESC LIMIT 5
        `).all();

        const data = {
            totalLaporan: Number(totalLaporan),
            totalDokumentasi: Number(totalDokumentasi),
            totalAlbum: Number(totalDokumentasi), // Biasanya album = dokumentasi
            totalFoto: Number(totalFoto),
            recentLogs: logs || []
        };

        console.log("📊 DASHBOARD REFRESHED:", data);
        return data;
    } catch (err) {
        console.error("❌ DASHBOARD IPC ERROR:", err.message);
        return { totalLaporan: 0, totalDokumentasi: 0, totalFoto: 0, recentLogs: [] };
    }
});
  ipcMain.handle('laporan:getAll', async () => {
    return db.prepare(`SELECT l.*, (SELECT COUNT(*) FROM dokumentasi d WHERE d.id_laporan = l.id_laporan) as jumlah_dok FROM laporan l ORDER BY l.id_laporan DESC`).all();
  });

  // --- CRUD LAPORAN ---
  ipcMain.handle('laporan:create', async (event, data) => {
    const stmt = db.prepare(`INSERT INTO laporan (nama_laporan, tahap, progress, tgl_laporan, tgl_mulai, tgl_selesai) VALUES (?, ?, ?, ?, ?, ?)`);
    const result = stmt.run(data.nama_laporan, data.tahap, data.progress, data.tgl_laporan, data.tgl_mulai, data.tgl_selesai);
    
    // Trigger refresh ke frontend setelah insert
    event.sender.send('data-refresh-trigger');
    return result;
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
            throw new Error("Folder sedang dibuka aplikasi lain.");
          }
        }

        const updatePathStmt = db.prepare(`
          UPDATE table_foto 
          SET path_foto = REPLACE(path_foto, ?, ?) 
          WHERE id_dokumentasi IN (
            SELECT id_dokumentasi FROM dokumentasi WHERE id_laporan = ?
          )
        `);
        updatePathStmt.run(oldPath, newPath, data.id_laporan);
      }

      db.prepare(`
        UPDATE laporan 
        SET nama_laporan = ?, tahap = ?, progress = ?, tgl_laporan = ?, tgl_mulai = ?, tgl_selesai = ? 
        WHERE id_laporan = ?
      `).run(
        data.nama_laporan, data.tahap, data.progress, 
        data.tgl_laporan, data.tgl_mulai, data.tgl_selesai, 
        data.id_laporan
      );
    });

    try {
      transaction();
      event.sender.send('data-refresh-trigger');
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  });

  ipcMain.handle('laporan:delete', async (event, id) => {
    const laporan = db.prepare('SELECT nama_laporan FROM laporan WHERE id_laporan = ?').get(id);
    if (laporan) {
      const folderPath = path.join(uploaderPath, sanitize(laporan.nama_laporan));
      if (fs.existsSync(folderPath)) fs.rmSync(folderPath, { recursive: true, force: true });
    }
    const result = db.prepare('DELETE FROM laporan WHERE id_laporan = ?').run(id);
    event.sender.send('data-refresh-trigger');
    return result;
  });

  // --- FOTO & ALBUM (DOKUMENTASI) ---
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
      event.sender.send('data-refresh-trigger');
      return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
  });

  ipcMain.handle('laporan:addFotoToDokumentasi', async (event, { id_laporan, id_dokumentasi, files }) => {
    try {
      const info = db.prepare(`
        SELECT l.nama_laporan, d.nama_dokumentasi 
        FROM dokumentasi d 
        JOIN laporan l ON d.id_laporan = l.id_laporan 
        WHERE d.id_dokumentasi = ?
      `).get(id_dokumentasi);

      if (!info) throw new Error("Data album tidak ditemukan");
      const targetDir = path.join(uploaderPath, sanitize(info.nama_laporan), sanitize(info.nama_dokumentasi));
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      const insertFoto = db.prepare('INSERT INTO table_foto (id_dokumentasi, path_foto, filename) VALUES (?, ?, ?)');

      for (const file of files) {
        const fileName = `${Date.now()}_${path.basename(file.path)}`;
        const destPath = path.join(targetDir, fileName);
        fs.copyFileSync(file.path, destPath);
        insertFoto.run(id_dokumentasi, destPath, fileName);
      }
      event.sender.send('data-refresh-trigger');
      return { success: true };
    } catch (e) { return { success: false, message: e.message }; }
  });

  ipcMain.handle('laporan:renameDokumentasi', async (event, { id_dokumentasi, newName }) => {
      try {
          if (!newName || newName.trim() === "") throw new Error("Nama dokumentasi baru kosong");
          const album = db.prepare(`
              SELECT d.nama_dokumentasi, l.nama_laporan 
              FROM dokumentasi d 
              JOIN laporan l ON d.id_laporan = l.id_laporan 
              WHERE d.id_dokumentasi = ?
          `).get(id_dokumentasi);

          if (!album) return { success: false, message: "Album tidak ditemukan" };

          const oldPath = path.join(uploaderPath, sanitize(album.nama_laporan), sanitize(album.nama_dokumentasi));
          const newPath = path.join(uploaderPath, sanitize(album.nama_laporan), sanitize(newName));

          if (fs.existsSync(oldPath)) {
              if (fs.existsSync(newPath) && oldPath !== newPath) throw new Error("Folder sudah ada");
              fs.renameSync(oldPath, newPath);
          }

          db.transaction(() => {
              const fotos = db.prepare('SELECT id_foto, path_foto FROM table_foto WHERE id_dokumentasi = ?').all(id_dokumentasi);
              const updateFotoStmt = db.prepare('UPDATE table_foto SET path_foto = ? WHERE id_foto = ?');
              for (const f of fotos) {
                  const updatedFilePath = f.path_foto.replace(oldPath, newPath);
                  updateFotoStmt.run(updatedFilePath, f.id_foto);
              }
              db.prepare('UPDATE dokumentasi SET nama_dokumentasi = ? WHERE id_dokumentasi = ?').run(newName, id_dokumentasi);
          })();
          event.sender.send('data-refresh-trigger');
          return { success: true };
      } catch (error) { return { success: false, message: error.message }; }
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
    const result = db.prepare('DELETE FROM table_foto WHERE path_foto = ?').run(rawPath);
    event.sender.send('data-refresh-trigger');
    return result;
  });

  ipcMain.handle('laporan:deleteDokumentasi', async (event, id_dokumentasi) => {
      const album = db.prepare('SELECT d.nama_dokumentasi, l.nama_laporan FROM dokumentasi d JOIN laporan l ON d.id_laporan = l.id_laporan WHERE d.id_dokumentasi = ?').get(id_dokumentasi);
      if (album) {
          const folderPath = path.join(uploaderPath, sanitize(album.nama_laporan), sanitize(album.nama_dokumentasi));
          if (fs.existsSync(folderPath)) fs.rmSync(folderPath, { recursive: true, force: true });
      }
      db.prepare('DELETE FROM table_foto WHERE id_dokumentasi = ?').run(id_dokumentasi);
      const result = db.prepare('DELETE FROM dokumentasi WHERE id_dokumentasi = ?').run(id_dokumentasi);
      event.sender.send('data-refresh-trigger');
      return result;
  });

  // --- EXPORT PDF ---
  ipcMain.handle('laporan:exportPdf', async (event, laporan, dokumentasi) => {
    try {
      const config = getSettingsMap(db);
      const pSize = config.pageSize || "a4";
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: pSize });
      const pageWidth = pSize === "legal" ? 215.9 : 210;
      const pageHeight = pSize === "legal" ? 355.6 : 297;
      
      const margin = Math.round(Number(config.marginPage) || 20);
      const cols = Math.max(1, parseInt(config.columns) || 3);
      const fixedH = Math.round(Number(config.imgHeight) || 45);
      const descSize = parseInt(config.descSize) || 8;
      const rowGap = parseInt(config.rowGap) || 15;
      
      const hColor = `#${(config.headerColor || "1F4E78").replace(/#/g, '')}`;
      const fColor = `#${(config.fontColor || "333333").replace(/#/g, '')}`;

      const centerX = pageWidth / 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(parseInt(config.titleSize) || 24);
      doc.setTextColor(fColor);
      doc.text(String(laporan.nama_laporan).toUpperCase(), centerX, 20, { align: "center" });
      doc.setFontSize(14);
      doc.setTextColor(hColor);
      doc.text(config.judulLaporan || "LAPORAN DOKUMENTASI PEKERJAAN", centerX, 28, { align: "center" });

      let currentY = 50;
      const spacing = 5; 
      const cellWidth = (pageWidth - (margin * 2) - (spacing * (cols - 1))) / cols;

      for (const album of dokumentasi) {
        if (currentY > pageHeight - 40) { doc.addPage(); currentY = 20; }
        doc.setFillColor(hColor);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 8, "F");
        doc.setTextColor("#FFFFFF");
        doc.text(` DESKRIPSI: ${String(album.nama_dokumentasi).toUpperCase()}`, margin + 2, currentY + 5.5);
        currentY += 12;

        if (album.files) {
          for (let i = 0; i < album.files.length; i += cols) {
            const rowFiles = album.files.slice(i, i + cols);
            if (currentY + fixedH + 10 > pageHeight - margin) { doc.addPage(); currentY = 20; }
            rowFiles.forEach((file, index) => {
              const xPos = margin + (index * (cellWidth + spacing));
              const finalPath = getSecurePath(file.rawPath, laporan.nama_laporan, album.nama_dokumentasi);
              if (finalPath && fs.existsSync(finalPath)) {
                try {
                  const imgBuffer = fs.readFileSync(finalPath);
                  const dim = sizeOf(new Uint8Array(imgBuffer));
                  const ratio = (dim.width / dim.height) || 1.33;
                  let rW = cellWidth, rH = cellWidth / ratio;
                  if (rH > fixedH) { rH = fixedH; rW = fixedH * ratio; }
                  doc.addImage(imgBuffer.toString('base64'), 'JPEG', xPos + (cellWidth-rW)/2, currentY + (fixedH-rH)/2, rW, rH);
                  doc.setFontSize(descSize);
                  doc.setTextColor(fColor);
                  doc.text(file.name.substring(0,25), xPos + (cellWidth/2), currentY + fixedH + 5, { align: "center" });
                } catch (e) {}
              }
            });
            currentY += fixedH + rowGap;
          }
        }
        currentY += 5;
      }

      const savePath = path.join(app.getPath('desktop'), `PDF_${sanitize(laporan.nama_laporan)}_${Date.now()}.pdf`);
      fs.writeFileSync(savePath, Buffer.from(doc.output("arraybuffer")));
      shell.openPath(savePath);
      return { success: true };
    } catch (err) { throw err; }
  });

  // --- EXPORT WORD ---
  ipcMain.handle('laporan:exportWord', async (event, laporan, dokumentasi) => {
    try {
      const config = getSettingsMap(db);
      const hColor = (config.headerColor || "1F4E78").replace(/#/g, '');
      const fColor = (config.fontColor || "333333").replace(/#/g, '');
      const cols = parseInt(config.columns) || 3;
      const imgH_base = parseInt(config.imgHeight) || 45; 
      const descSize = (parseInt(config.descSize) || 8) * 2; 

      const docContent = [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: laporan.nama_laporan.toUpperCase(), bold: true, size: (parseInt(config.titleSize) || 24) * 2, color: fColor }),
            new TextRun({ text: `\n${config.judulLaporan || "LAPORAN DOKUMENTASI PEKERJAAN"}`, break: 1, size: 28, bold: true, color: hColor }),
            new TextRun({ text: `\nTAHAP: ${(laporan.tahap || "-").toUpperCase()}`, break: 1, size: 20, bold: true }),
          ]
        })
      ];

      for (const album of dokumentasi) {
        docContent.push(new Paragraph({
          shading: { fill: hColor }, 
          spacing: { before: 400, after: 200 },
          children: [ new TextRun({ text: ` DESKRIPSI: ${album.nama_dokumentasi.toUpperCase()} `, color: "FFFFFF", bold: true, size: 22 }) ]
        }));

        const tableRows = [];
        for (let i = 0; i < album.files.length; i += cols) {
          const rowCells = album.files.slice(i, i + cols).map(f => {
            const finalPath = getSecurePath(f.rawPath, laporan.nama_laporan, album.nama_dokumentasi);
            if (finalPath && fs.existsSync(finalPath)) {
              try {
                const imgBuffer = fs.readFileSync(finalPath);
                const maxW = 600 / cols; 
                let rW = imgH_base * 4.5, rH = imgH_base * 3.5;
                return new TableCell({
                  width: { size: 100 / cols, type: WidthType.PERCENTAGE },
                  borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} },
                  children: [
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [ new ImageRun({ data: imgBuffer, transformation: { width: rW, height: rH } }) ] }),
                    new Paragraph({ alignment: AlignmentType.CENTER, children: [ new TextRun({ text: f.name.substring(0,25), size: descSize, color: fColor }) ] })
                  ],
                });
              } catch (e) { return new TableCell({ children: [new Paragraph("Error")] }); }
            }
            return new TableCell({ children: [new Paragraph("Missing")] });
          });
          while (rowCells.length < cols) rowCells.push(new TableCell({ children: [], borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} } }));
          tableRows.push(new TableRow({ children: rowCells }));
        }
        docContent.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows, borders: BorderStyle.NONE }));
      }

      const doc = new Document({ sections: [{ children: docContent }] });
      const buffer = await Packer.toBuffer(doc);
      const savePath = path.join(app.getPath('desktop'), `WORD_${sanitize(laporan.nama_laporan)}_${Date.now()}.docx`);
      fs.writeFileSync(savePath, buffer);
      shell.openPath(savePath);
      return { success: true };
    } catch (error) { throw error; }
  });
}

module.exports = { registerLaporanHandlers };