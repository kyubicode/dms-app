import { ILaporan } from '@/types/laporan';

export {}; 

declare global {
  
  interface IDokumentasiFile {
    path: string;
    name: string;
  }

  interface IDokumentasi {
    nama_dokumentasi: string;
    files: IDokumentasiFile[];
  }
interface ISystemInfo {
  cpu: string;
  totalMemory: string;
  version: string;
  platform: string;
  arch: string;
  gpu?: string;     // Tambahkan opsional
  storage?: string; // Tambahkan opsional
}
  interface Window {
    
    api: {
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
      sendWindowControl: (action: 'minimize' | 'maximize' | 'close') => void;
      // TAMBAHKAN BARIS INI:
      isMaximized: () => Promise<boolean>;
      getSystemInfo: () => Promise<ISystemInfo>;
      getDashboardStats: () => Promise<{ totalLaporan: number; totalFoto: number; totalAlbum: number }>;
      // System & Progress
      onSplashProgress: (callback: (event: any, ...args: any[]) => void) => void;
      getAppName: () => Promise<string>;
      
      // Auth
      login: (username: string, password: string) => Promise<any>;

      // Laporan
      createLaporan: (data: any) => Promise<any>;
      updateLaporan: (data: any) => Promise<any>;
      getLaporan: () => Promise<ILaporan[]>;
      deleteLaporan: (id: number) => Promise<any>;
      
      // Dokumentasi
      saveDokumentasi: (payload: any) => Promise<any>;
      getDokumentasiByLaporan: (id_laporan: number) => Promise<IDokumentasi[]>;
      addFotoToDokumentasi: (payload: any) => Promise<any>;
      deleteFoto: (filePath: string) => Promise<any>;
      deleteDokumentasi: (id_laporan: number, nama_dokumentasi: string) => Promise<any>;
      renameDokumentasi: (id_laporan: number, oldName: string, newName: string) => Promise<any>;
      selectFiles: () => Promise<{ path: string; name: string }[]>;
      
      // Export
      exportWord: (laporan: ILaporan, dokumentasi: IDokumentasi[]) => Promise<string>;
      // pdf
      exportPdf: (laporan: ILaporan, dokumentasi: IDokumentasi[]) => Promise<string>;
    };
  }
}