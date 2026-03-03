import React, { useState, useEffect } from 'react';
import { IoLogoElectron } from "react-icons/io5";
import { titleBarGlobalStyles } from './TitleBar.styles';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  // Ambil API dari window object (dieksplos via preload)
  const api = (window as any).electron;

  useEffect(() => {
    if (!api) return;

    // 1. Cek status maximized saat komponen pertama kali dimuat
    const syncMaximizedStatus = async () => {
      try {
        // Memanggil handler 'window:isMaximized' yang sudah kita buat di window.ipc.cjs
        const status = await api.invoke('window:isMaximized');
        setIsMaximized(status);
      } catch (err) {
        console.warn("TitleBar: window:isMaximized status check failed", err);
      }
    };

    syncMaximizedStatus();

    // 2. Listener untuk mendeteksi perubahan ukuran jendela secara real-time
    // Catatan: Pastikan di main.js Anda mengirim event 'window-resize-status'
    const unlisten = api.on('window-resize-status', (status: boolean) => {
      setIsMaximized(status);
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [api]);

  const handleControl = (action: 'minimize' | 'maximize' | 'close') => {
    if (!api) return;

    try {
      /**
       * Menggunakan 'window-control' sesuai dengan ipcMain.on('window-control', ...) 
       * yang ada di window.ipc.cjs Anda.
       */
      if (api.sendWindowControl) {
        api.sendWindowControl(action);
      } else {
        // Fallback jika hanya tersedia invoke
        api.invoke('window-control', action);
      }
    } catch (err) {
      console.error("Failed to send window control:", err);
    }
  };

  return (
    <div className="title-bar-container-fixed">
      <style>{titleBarGlobalStyles}</style>

      {/* KIRI: macOS Traffic Lights Style */}
      <div className="macos-controls-section">
        <div className="macos-controls">
          <button 
            onClick={() => handleControl('close')} 
            className="macos-btn close" 
            title="Close"
          />
          <button 
            onClick={() => handleControl('minimize')} 
            className="macos-btn minimize" 
            title="Minimize"
          />
          <button 
            onClick={() => handleControl('maximize')} 
            className="macos-btn maximize" 
            title={isMaximized ? "Restore" : "Maximize"}
          />
        </div>
      </div>

      {/* TENGAH: Drag Area & Status Jendela */}
      <div className="title-drag-area-custom">
        <div className="status-center-industrial">
          <div className="pulse-dot-active" />
          <span className="status-label">
            SYSTEM ACTIVE <span className="sep">//</span> {isMaximized ? 'FULL_VIEW' : 'WINDOWED'}
          </span>
        </div>
      </div>
      
      {/* KANAN: Informasi Brand & Versi */}
      <div className="brand-section-right">
        <div className="brand-text-industrial">
          <span className="version-tag">{import.meta.env.VITE_APP_VERSION || '2.0.0'}</span>
          <span className="main-label">{import.meta.env.VITE_APP_NAME || 'ZenTE'}</span>
          <div className="icon-wrapper-industrial">
            <IoLogoElectron />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;