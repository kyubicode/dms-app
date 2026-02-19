const { ipcMain, dialog, app,BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { db, uploaderPath } = require('../services/database.service.cjs');
const { addLog,getCurrentUser } = require('../services/log.service.cjs');
const { 
  Document, Packer, Paragraph, TextRun, 
  ImageRun, Table, TableRow, TableCell,
  VerticalAlign, 
  WidthType, AlignmentType, BorderStyle 
} = require('docx');
const sizeOf = require('image-size');
const { jsPDF } = require("jspdf");
require("jspdf-autotable");
const { default: autoTable } = require("jspdf-autotable");
const { progress } = require('framer-motion');



function registerLaporanHandlers() {

 
        // 1. AMBIL SEMUA LAPORAN
        ipcMain.handle('laporan:getAll', async () => {
          try {
            const sql = `
              SELECT l.*, 
              (SELECT COUNT(*) FROM dokumentasi d WHERE d.id_laporan = l.id_laporan) as jumlah_dok 
              FROM laporan l 
              ORDER BY l.id_laporan DESC
            `;
            return db.prepare(sql).all();
          } catch (error) {
            console.error("Error getAll:", error);
            return [];
          }
        });

        // 2. SIMPAN LAPORAN BARU
        ipcMain.handle('laporan:create', async (event, data) => {
          try {
            const stmt = db.prepare(`
              INSERT INTO laporan (nama_laporan, tahap,progress, tgl_laporan, tgl_mulai, tgl_selesai)
              VALUES (?, ?, ?, ?, ?,?)
            `);
            // TRACING LOG
            addLog('CREATE_LAPORAN', `Proyek baru: ${data.nama_laporan}`);
            return stmt.run(data.nama_laporan, data.tahap,data.progress, data.tgl_laporan, data.tgl_mulai, data.tgl_selesai);
          } catch (error) {
            console.error("Error create:", error);
            throw error;
          }
        });

        // 3. UPDATE LAPORAN
        ipcMain.handle('laporan:update', async (event, data) => {
          try {
            const stmt = db.prepare(`
              UPDATE laporan
              SET nama_laporan = ?, tahap = ?, progress = ?, tgl_laporan = ?, tgl_mulai = ?, tgl_selesai = ?
              WHERE id_laporan = ?
            `);

            // --- PERBAIKAN DI SINI ---
            // Cukup kirim status dan pesan. 
            // Fungsi addLog kamu sudah cerdas: dia akan otomatis ambil currentUserSession.username
            addLog(
              'UPDATE_LAPORAN', 
              `Memperbarui Proyek: ${data.nama_laporan} (ID: ${data.id_laporan}) ke tahap ${data.tahap} (${data.progress}%)`
            );

            return stmt.run(
              data.nama_laporan, 
              data.tahap, 
              data.progress, 
              data.tgl_laporan, 
              data.tgl_mulai, 
              data.tgl_selesai, 
              data.id_laporan
            );
          } catch (error) {
            console.error("Error update:", error);
            // Mencatat log error jika terjadi kegagalan
            addLog('UPDATE_ERROR', `Gagal update ID: ${data.id_laporan}`, null, error.message);
            throw error;
          }
        });

        // 4. HAPUS LAPORAN
        ipcMain.handle('laporan:delete', async (event, id) => {
          try {
            // 1. AMBIL data laporan dulu supaya kita tahu namanya untuk dicatat di LOG
            const info = db.prepare('SELECT nama_laporan FROM laporan WHERE id_laporan = ?').get(id);
            
            // 2. AMBIL user yang sedang login
            const user = getCurrentUser();

            // 3. CATAT ke log
            const deskripsiLog = info ? info.nama_laporan : `ID: ${id}`;

            // Tidak perlu kirim user?.username lagi karena log.service sudah tahu siapa yang login
            addLog('DELETE_LAPORAN', `Menghapus laporan: ${deskripsiLog}`);

            // 4. BARU JALANKAN perintah hapus dari database
            return db.prepare('DELETE FROM laporan WHERE id_laporan = ?').run(id);
            
          } catch (error) {
            console.error("Error delete:", error);
            throw error;
          }
        });

        // 5. SIMPAN DOKUMENTASI BARU (PROSES COPY FILE)
        ipcMain.handle('laporan:saveDokumentasi', async (event, { id_laporan, nama_dokumentasi, files }) => {
          try {
            const laporan = db.prepare('SELECT nama_laporan FROM laporan WHERE id_laporan = ?').get(id_laporan);
            if (!laporan) throw new Error("Laporan tidak ditemukan");

            const safeProjectName = laporan.nama_laporan.replace(/[^a-z0-9]/gi, '_');
            const safeDocName = nama_dokumentasi.replace(/[^a-z0-9]/gi, '_');
            const targetDir = path.join(uploaderPath, safeProjectName, safeDocName);

            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            const resDok = db.prepare('INSERT INTO dokumentasi (id_laporan, nama_dokumentasi) VALUES (?, ?)')
                            .run(id_laporan, nama_dokumentasi);
            const id_dokumentasi = resDok.lastInsertRowid;

            const insertFoto = db.prepare('INSERT INTO table_foto (id_dokumentasi, path_foto, filename) VALUES (?, ?, ?)');
            for (const file of files) {
              const fileName = `${Date.now()}_${path.basename(file.path)}`;
              const destPath = path.join(targetDir, fileName);
              fs.copyFileSync(file.path, destPath);
              insertFoto.run(id_dokumentasi, destPath, fileName);
            }
            // TRACING LOG (Taruh di akhir fungsi)
            const user = getCurrentUser();
            addLog('UPLOAD_FOTO', `Menambah album "${nama_dokumentasi}" (${files.length} foto) ke laporan ID: ${id_laporan}`, user?.username);
            return { success: true };
          } catch (error) {
            console.error("Error saveDokumentasi:", error);
            throw error;
          }
        });

        // 6. GET DOKUMENTASI BY LAPORAN (UNTUK VIEWER & EXPORT)
        ipcMain.handle('laporan:getDokumentasiByLaporan', async (event, id_laporan) => {
          try {
            const sql = `
              SELECT d.id_dokumentasi, d.nama_dokumentasi, f.path_foto, f.filename
              FROM dokumentasi d
              LEFT JOIN table_foto f ON f.id_dokumentasi = d.id_dokumentasi
              WHERE d.id_laporan = ?
              ORDER BY d.id_dokumentasi ASC
            `;
            const rows = db.prepare(sql).all(id_laporan);
            const grouped = {};
            rows.forEach(row => {
              if (!grouped[row.nama_dokumentasi]) grouped[row.nama_dokumentasi] = [];
              if (row.path_foto) grouped[row.nama_dokumentasi].push({ path: row.path_foto, name: row.filename });
            });
            return Object.entries(grouped).map(([nama_dokumentasi, files]) => ({ nama_dokumentasi, files }));
          } catch (err) {
            console.error('Error getDokumentasiByLaporan:', err);
            return [];
          }
        });

        // 7. TAMBAH FOTO KE ALBUM YANG SUDAH ADA
        ipcMain.handle('laporan:addFotoToDokumentasi', async (event, { id_laporan, nama_dokumentasi, files }) => {
          try {
            const dok = db.prepare('SELECT id_dokumentasi FROM dokumentasi WHERE id_laporan = ? AND nama_dokumentasi = ?').get(id_laporan, nama_dokumentasi);
            const laporan = db.prepare('SELECT nama_laporan FROM laporan WHERE id_laporan = ?').get(id_laporan);
            
            const targetDir = path.join(uploaderPath, laporan.nama_laporan.replace(/[^a-z0-9]/gi, '_'), nama_dokumentasi.replace(/[^a-z0-9]/gi, '_'));
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            const insertFoto = db.prepare('INSERT INTO table_foto (id_dokumentasi, path_foto, filename) VALUES (?, ?, ?)');
            files.forEach(file => {
              const fileName = `${Date.now()}_${path.basename(file.path)}`;
              const destPath = path.join(targetDir, fileName);
              fs.copyFileSync(file.path, destPath);
              insertFoto.run(dok.id_dokumentasi, destPath, fileName);
            });
           // --- TRACKING LOG ---
              // Kita tidak perlu panggil getCurrentUser di sini karena addLog 
              // di log.service.cjs sudah mengambil dari session secara otomatis.
              addLog(
                'UPLOAD_FOTO', 
                `Menambah ${files.length} foto ke album "${nama_dokumentasi}" pada proyek: ${laporan.nama_laporan}`
              );
            return { success: true };
          } catch (err) { throw err; }
        });

        // 8. HAPUS SATU FOTO
      ipcMain.handle('laporan:deleteFoto', async (event, filePath) => {
        try {
          // Definisi variabel fileName dari filePath agar tidak ReferenceError
          // path.basename akan mengubah "C:/data/foto.jpg" menjadi "foto.jpg"
          const fileName = path.basename(filePath); 

          // Hapus dari database
          db.prepare('DELETE FROM table_foto WHERE path_foto = ?').run(filePath);

          // Hapus file fisik jika ada
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          // --- TRACKING LOG ---
          // Sekarang variabel fileName sudah terdefinisi dan aman digunakan
          addLog(
            'DELETE_FOTO', 
            `Menghapus file foto: ${fileName}`
          );

          return { success: true };
        } catch (err) { 
          console.error("Error saat menghapus foto:", err);
          throw err; 
        }
      });

        // 9. HAPUS SATU GRUP DOKUMENTASI (ALBUM)
        ipcMain.handle('laporan:deleteDokumentasi', async (event, id_laporan, nama_dokumentasi) => {
          try {
            const dok = db.prepare('SELECT id_dokumentasi FROM dokumentasi WHERE id_laporan = ? AND nama_dokumentasi = ?').get(id_laporan, nama_dokumentasi);
            if (!dok) return { success: false };

            const fotos = db.prepare('SELECT path_foto FROM table_foto WHERE id_dokumentasi = ?').all(dok.id_dokumentasi);
            fotos.forEach(f => { if (fs.existsSync(f.path_foto)) fs.unlinkSync(f.path_foto); });

            db.prepare('DELETE FROM table_foto WHERE id_dokumentasi = ?').run(dok.id_dokumentasi);
            db.prepare('DELETE FROM dokumentasi WHERE id_dokumentasi = ?').run(dok.id_dokumentasi);
         // --- TRACKING LOG ---
          const namaProyek = laporan ? laporan.nama_laporan : `ID Laporan: ${id_laporan}`;
          addLog(
            'DELETE_ALBUM', 
            `Menghapus album "${nama_dokumentasi}" (${jumlahFoto} foto terhapus) pada proyek: ${namaProyek}`
          );
            return { success: true };
          } catch (err) { return { success: false }; }
        });

        // 10. RENAME GRUP DOKUMENTASI
      ipcMain.handle('laporan:renameDokumentasi', async (event, id_laporan, oldName, newName) => {
        try {
          // 1. Ambil data laporan untuk folder utama
          const laporan = db.prepare('SELECT nama_laporan FROM laporan WHERE id_laporan = ?').get(id_laporan);
          if (!laporan) throw new Error("Laporan tidak ditemukan");

          // 2. Mapping folder (Sanitasi)
          const folderProyek = laporan.nama_laporan.replace(/[^a-z0-9]/gi, '_');
          const folderLama = oldName.replace(/[^a-z0-9]/gi, '_');
          const folderBaru = newName.replace(/[^a-z0-9]/gi, '_');

          const oldDir = path.join(uploaderPath, folderProyek, folderLama);
          const newDir = path.join(uploaderPath, folderProyek, folderBaru);

          // 3. Jalankan Transaksi Database
          const runUpdate = db.transaction(() => {
            // A. Ambil id_dokumentasi dulu
            const dok = db.prepare('SELECT id_dokumentasi FROM dokumentasi WHERE id_laporan = ? AND nama_dokumentasi = ?')
                          .get(id_laporan, oldName);

            if (dok) {
              // B. Update nama di tabel dokumentasi
              db.prepare('UPDATE dokumentasi SET nama_dokumentasi = ? WHERE id_dokumentasi = ?')
                .run(newName, dok.id_dokumentasi);

              // C. Update path_foto di table_foto (Inilah kuncinya!)
              // Kita ganti tulisan folder lama ke folder baru di dalam kolom path_foto
              db.prepare(`
                UPDATE table_foto 
                SET path_foto = REPLACE(path_foto, ?, ?) 
                WHERE id_dokumentasi = ?
              `).run(folderLama, folderBaru, dok.id_dokumentasi);
            }
          });

          runUpdate();

          // 4. Rename folder fisiknya di Windows
          if (fs.existsSync(oldDir)) {
            fs.renameSync(oldDir, newDir);
          }

          return { success: true };
        } catch (err) {
          console.error("Gagal Rename:", err);
          throw err;
        }
      });

      // 11. EXPORT KE WORD (VERSI PROFESIONAL & STABIL)
      ipcMain.handle('laporan:exportWord', async (event, laporan, dokumentasi) => {
          try {
            const sizeOf = require('image-size');
            const fs = require('fs');
            const path = require('path');
            const { 
              Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
              WidthType, BorderStyle, AlignmentType, ImageRun, VerticalAlign, 
              Header, Footer, PageNumber, ShadingType 
            } = require('docx');

            // Helper: Kalkulasi dimensi gambar agar proporsional dan tidak melewati batas halaman
            const getSafeDimensions = (imgPath, targetWidth) => {
              try {
                if (!fs.existsSync(imgPath)) throw new Error("File missing");
                const dim = sizeOf(imgPath);
                const ratio = dim.width / dim.height;
                
                // Batasi tinggi maksimal agar tidak memakan terlalu banyak ruang (maks 250px)
                let finalWidth = targetWidth;
                let finalHeight = targetWidth / ratio;

                if (finalHeight > 250) {
                  finalHeight = 250;
                  finalWidth = 250 * ratio;
                }

                return { width: finalWidth, height: finalHeight };
              } catch (e) {
                return { width: targetWidth, height: targetWidth * 0.75 };
              }
            };

            const docContent = [];

            // --- 1. HEADER / JUDUL UTAMA ---
            docContent.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 600 },
                children: [
                  new TextRun({ 
                    text: "LAPORAN DOKUMENTASI PEKERJAAN", 
                    bold: true, size: 36, font: "Arial", color: "000000" 
                  }),
                  new TextRun({ 
                    text: `\n${(laporan.nama_laporan || "NAMA PROYEK").toUpperCase()}`, 
                    bold: true, size: 28, font: "Arial", break: 1, color: "1F4E78"
                  }),
                ],
              })
            );

            // --- 2. TABEL INFORMASI PROYEK (Struktur Premium) ---
            docContent.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: "1F4E78" },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F4E78" },
                  left: { style: BorderStyle.NIL },
                  right: { style: BorderStyle.NIL },
                  insideHorizontal: { style: BorderStyle.NIL },
                  insideVertical: { style: BorderStyle.NIL }
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ 
                        shading: { fill: "F1F5F9" },
                        children: [new Paragraph({ 
                          spacing: { before: 120, after: 120 },
                          children: [new TextRun({ text: "DETAIL PEKERJAAN", bold: true, size: 18, color: "1F4E78" })] 
                        })] 
                      }),
                      new TableCell({ 
                        shading: { fill: "F1F5F9" },
                        children: [new Paragraph({ 
                          spacing: { before: 120, after: 120 },
                          children: [new TextRun({ text: "WAKTU PELAKSANAAN", bold: true, size: 18, color: "1F4E78" })] 
                        })] 
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ 
                        children: [
                        new Paragraph({ 
                            spacing: { before: 100, line: 300 }, 
                            children: [
                              new TextRun({ text: `TAHAP`, bold: true, size: 16 }), 
                              new TextRun({ 
                                // String(...) adalah pengaman agar tidak error jika data bukan teks
                                text: `: ${String(laporan.tahap || '-').toUpperCase()}` 
                              })
                            ] 
                          }),
                          new Paragraph({ spacing: { after: 100, line: 300 }, children: [new TextRun({ text: `TGL LAPORAN`, bold: true, size: 16 }), new TextRun({ text: `: ${laporan.tgl_laporan || '-'}` })] }),
                        ] 
                      }),
                      new TableCell({ 
                        children: [
                          new Paragraph({ spacing: { before: 100, line: 300 }, children: [new TextRun({ text: `TGL MULAI`, bold: true, size: 16 }), new TextRun({ text: `: ${laporan.tgl_mulai || '-'}` })] }),
                          new Paragraph({ spacing: { after: 100, line: 300 }, children: [new TextRun({ text: `TGL SELESAI`, bold: true, size: 16 }), new TextRun({ text: `: ${laporan.tgl_selesai || '-'}` })] }),
                        ] 
                      }),
                    ],
                  }),
                ],
              })
            );

            // Spacer
            docContent.push(new Paragraph({ text: "", spacing: { after: 400 } }));

            // --- 3. LOOP DOKUMENTASI (Gallery Grid) ---
            if (Array.isArray(dokumentasi)) {
              dokumentasi.forEach((docu) => {
                // Section Header (High Contrast)
                docContent.push(
                  new Paragraph({
                    shading: { fill: "1F4E78" },
                    spacing: { before: 400, after: 200, line: 400 },
                    border: { bottom: { style: BorderStyle.SINGLE, size: 20, color: "000000" } },
                    children: [
                      new TextRun({ 
                        text: ` DESKRIPSI: ${docu.nama_dokumentasi.toUpperCase()} `, 
                        bold: true, color: "FFFFFF", size: 20, font: "Arial" 
                      }),
                      new TextRun({ 
                        text: ` [${docu.files ? docu.files.length : 0} FOTO]`, 
                        color: "FFFFFF", size: 20, font: "Arial" 
                      })
                    ],
                  })
                );

                if (docu.files && docu.files.length > 0) {
                  const tableRows = [];
                  const fotoPerBaris = 3;

                  for (let i = 0; i < docu.files.length; i += fotoPerBaris) {
                    const cells = docu.files.slice(i, i + fotoPerBaris).map((f) => {
                      const dims = getSafeDimensions(f.path, 170);
                      return new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        borders: {
                            top: {style: BorderStyle.NIL}, bottom: {style: BorderStyle.NIL},
                            left: {style: BorderStyle.NIL}, right: {style: BorderStyle.NIL}
                        },
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 150, after: 100 },
                            children: [
                              new ImageRun({
                                data: fs.readFileSync(f.path),
                                transformation: { width: dims.width, height: dims.height },
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 },
                            children: [
                              new TextRun({ 
                                text: f.name || "IMG_DATA", 
                                size: 14, font: "Consolas", color: "475569" 
                              })
                            ],
                          }),
                        ],
                      });
                    });

                    // Fill empty cells to maintain 3-column layout
                    while (cells.length < fotoPerBaris) {
                      cells.push(new TableCell({ 
                        borders: { 
                            top: {style: BorderStyle.NIL}, bottom: {style: BorderStyle.NIL}, 
                            left: {style: BorderStyle.NIL}, right: {style: BorderStyle.NIL} 
                        }, 
                        children: [] 
                      }));
                    }
                    tableRows.push(new TableRow({ children: cells }));
                  }

                  docContent.push(new Table({ 
                    width: { size: 100, type: WidthType.PERCENTAGE }, 
                    borders: BorderStyle.NIL,
                    rows: tableRows 
                  }));
                }
              });
            }

            // --- 4. GENERATE DOCUMENT DENGAN SETTING LEGAL & FOOTER ---
            const doc = new Document({
              sections: [{
                properties: {
                  page: {
                    size: { width: 12240, height: 20160 }, // Ukuran Legal
                    margin: { top: 720, right: 720, bottom: 720, left: 720 },
                  }
                },
                footers: {
                  default: new Footer({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        border: { top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" } },
                        spacing: { before: 100 },
                        children: [
                          new TextRun({ text: "Halaman ", size: 18, color: "64748B" }),
                          new TextRun({ children: [PageNumber.CURRENT], size: 18, bold: true, color: "1F4E78" }),
                          new TextRun({ text: " dari ", size: 18, color: "64748B" }),
                          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, bold: true, color: "1F4E78" }),
                        ],
                      }),
                    ],
                  }),
                },
                children: docContent,
              }],
            });

            const buffer = await Packer.toBuffer(doc);
            const safeName = (laporan.nama_laporan || "Export").replace(/[<>:"/\\|?*]/g, '_');
            const filePath = path.join(require('electron').app.getPath('desktop'), `LAPORAN_FINAL_${safeName}.docx`);

            fs.writeFileSync(filePath, buffer);
            return filePath;
          } catch (err) {
            console.error('Export Error:', err);
            throw err;
          }
      });


      // 12. EXPORT KE PDF (DESIGN PREMIUM) - FIXED VERSION
      ipcMain.handle('laporan:exportPdf', async (event, laporan, dokumentasi) => {
        try {
          const doc = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: "legal" 
          });

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 20;
          
          // --- KONFIGURASI BATAS (CRITICAL) ---
          const SAFE_BOTTOM = pageHeight - 30; 
          const RESET_TOP = 25;               
          let currentY = 0;

          const getBase64Image = (filePath) => {
            if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
            const bitmap = fs.readFileSync(filePath);
            const extension = path.extname(filePath).replace('.', '').toLowerCase();
            return `data:image/${extension === 'png' ? 'png' : 'jpeg'};base64,${bitmap.toString('base64')}`;
          };

          // --- A. HEADER DESIGN (PREMIUM LOOK) ---
          const headerHeight = 65;
          doc.setFillColor(24, 45, 75); 
          doc.rect(0, 0, pageWidth, headerHeight, "F");
          doc.setFillColor(255, 193, 7);
          doc.rect(0, headerHeight, pageWidth, 1.2, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text("DOKUMENTASI LAPANGAN : CV DINAMIKA SINERGI", margin, 18);
          
          doc.setFontSize(22);
          doc.text("LAPORAN DOKUMENTASI PEKERJAAN", margin, 28);

          doc.setFontSize(14);
          doc.setTextColor(255, 193, 7); 
          doc.text((laporan.nama_laporan || "PROYEK TANPA NAMA").toUpperCase(), margin, 38);

          // Grid Info di Header
          const col1_Label = margin;
          const col1_Val = margin + 32; 
          const col2_Label = 110;
          const col2_Val = 110 + 32;
          
          const drawHeaderInfo = (label, value, xL, xV, y) => {
              doc.setFont("helvetica", "normal");
              doc.setTextColor(200, 200, 200);
              doc.setFontSize(9);
              doc.text(label, xL, y);
              doc.setFont("helvetica", "bold");
              doc.setTextColor(255, 255, 255);
              doc.text(`:  ${value}`, xV, y);
          };

          drawHeaderInfo("Tahap Pekerjaan", String(laporan.tahap || '-').toUpperCase(), col1_Label, col1_Val, 48);
          drawHeaderInfo("Tanggal Laporan", laporan.tgl_laporan || '-', col1_Label, col1_Val, 55);
          drawHeaderInfo("Tanggal Mulai", laporan.tgl_mulai || '-', col2_Label, col2_Val, 48);
          drawHeaderInfo("Tanggal Selesai", laporan.tgl_selesai || '-', col2_Label, col2_Val, 55);

          currentY = 82; 

          // --- B. CONTENT (STRICT GRID SYSTEM) ---
      // --- B. CONTENT (DYNAMIC RESPONSIVE GRID) ---
      if (Array.isArray(dokumentasi)) {
        for (const [index, docu] of dokumentasi.entries()) {
          
          // 1. HITUNG GAP ANTAR ALBUM SECARA DINAMIS
          // Jika bukan album pertama, beri jarak 20mm dari posisi terakhir
          if (index > 0) {
            currentY += 20; 
          }

          // 2. CEK APAKAH JUDUL MASIH MUAT DI HALAMAN INI
          if (currentY > SAFE_BOTTOM - 25) {
            doc.addPage();
            currentY = RESET_TOP;
          }

          // 3. CETAK JUDUL SEKSI
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(24, 45, 75);
          doc.text(`${String(index + 1).padStart(2, '0')}. ${String(docu.nama_dokumentasi).toUpperCase()}`, margin, currentY);
          
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
          
          currentY += 12; // Jarak tetap dari judul ke baris foto pertama

          if (docu.files && docu.files.length > 0) {
            const imgWidth = 57; 
            const imgHeight = 43; 
            const colSpacing = 7; 
            const rowGap = 18; // Jarak vertikal antar baris foto
            
            let xPos = margin;
            let startY = currentY; // Simpan titik awal baris

            for (let fIndex = 0; fIndex < docu.files.length; fIndex++) {
              const file = docu.files[fIndex];

              // 4. CEK PINDAH HALAMAN (Strict Check)
              if (currentY + imgHeight + 10 > SAFE_BOTTOM) {
                doc.addPage();
                currentY = RESET_TOP;
                startY = currentY; // Reset startY di halaman baru
                xPos = margin;
              }

              try {
                const base64Img = getBase64Image(file.path);
                
                doc.addImage(base64Img, 'JPEG', xPos, currentY, imgWidth, imgHeight);
                doc.setDrawColor(220, 220, 220);
                doc.rect(xPos, currentY, imgWidth, imgHeight, "S");

                doc.setFontSize(6.5);
                doc.setTextColor(80, 80, 80);
                const shortName = file.name.length > 35 ? file.name.substring(0, 32) + "..." : file.name;
                doc.text(shortName, xPos + (imgWidth / 2), currentY + imgHeight + 5, { align: 'center' });

                // 5. LOGIKA PERPINDAHAN KOLOM & BARIS
                if ((fIndex + 1) % 3 !== 0 && (fIndex + 1) !== docu.files.length) {
                  // Geser ke kolom kanan
                  xPos += imgWidth + colSpacing;
                } else {
                  // Pindah ke baris bawah
                  xPos = margin;
                  currentY += imgHeight + rowGap; 
                }
              } catch (err) {
                console.error("Error image:", err);
              }
            }
            
            // 6. KUNCI POSISI AKHIR ALBUM
            // Jika loop berakhir tapi baris terakhir tidak penuh (modulus bukan 0),
            // maka currentY belum ditambah rowGap. Kita paksa tambah di sini.
            const isLastRowIncomplete = (docu.files.length % 3 !== 0);
            if (isLastRowIncomplete) {
              currentY += imgHeight + 5; 
            }
            
          } else {
            // Jika album kosong
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text("Tidak ada foto dokumentasi.", margin, currentY + 5);
            currentY += 15;
          }
        }
      }

          // --- C. FOOTER ---
          const totalPages = doc.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Digital Archive CV Dinamika Sinergi - ${new Date().getFullYear()}`, margin, pageHeight - 10);
            doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin - 25, pageHeight - 10);
          }

          const safeName = (laporan.nama_laporan || "Export").replace(/[<>:"/\\|?*]/g, '_');
          const filePath = path.join(require('electron').app.getPath('desktop'), `LAPORAN_${safeName}.pdf`);

          fs.writeFileSync(filePath, Buffer.from(doc.output("arraybuffer")));
          return filePath;

        } catch (err) {
          console.error('PDF Export Error:', err);
          throw err;
        }
      });

      // 13. DIALOG PILIH FILE
        ipcMain.handle('select-files', async () => {
          const result = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }]
          });
          if (result.canceled) return [];
          return result.filePaths.map(filePath => ({
            path: filePath,
            name: path.basename(filePath)
          }));
        });
        
      // 14. HANDLER DASHBOARD STATS (KHUSUS UNTUK HOME/DASHBOARD)
        ipcMain.handle('dashboard:get-stats', async () => {
          try {
            // Menghitung total laporan
            const totalLaporan = db.prepare('SELECT COUNT(*) as count FROM laporan').get().count;
            
            // Menghitung total seluruh foto yang ada di sistem
            const totalFoto = db.prepare('SELECT COUNT(*) as count FROM table_foto').get().count;
            
            // Menghitung jumlah album/dokumentasi
            const totalAlbum = db.prepare('SELECT COUNT(*) as count FROM dokumentasi').get().count;

            return {
              totalLaporan,
              totalFoto,
              totalAlbum
            };
          } catch (error) {
            console.error("Gagal mengambil statistik dashboard:", error);
            return { totalLaporan: 0, totalFoto: 0, totalAlbum: 0 };
          }
        });
}

module.exports = { registerLaporanHandlers };