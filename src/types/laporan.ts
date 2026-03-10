// ===== Interface Laporan =====
export interface ILaporan {
  id_laporan: number;
  nama_laporan: string;
  progress: string;
  tahap?: string;
  progres?:string;
  tgl_laporan?: string;
  tgl_mulai?: string;
  tgl_selesai?: string;
  jumlah_dok?: number;
}

// ===== Interface File =====
export interface IFile {
  path: string;
  name: string;
  uid?: string;
}
