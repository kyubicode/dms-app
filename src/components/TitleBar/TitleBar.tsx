import React, { useState, useEffect } from 'react';
import { IoLogoElectron, IoCloseOutline, IoRemoveOutline, IoAddOutline } from "react-icons/io5";
import { titleBarGlobalStyles, s } from './TitleBar.styles';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const api = (window as any).electron;

  useEffect(() => {
    if (!api) return;

    const syncMaximizedStatus = async () => {
      try {
        const status = await api.invoke('window:isMaximized');
        setIsMaximized(status);
      } catch (err) {
        console.warn("TitleBar: Status check failed", err);
      }
    };

    syncMaximizedStatus();

    const unlisten = api.on('window-resize-status', (status: boolean) => {
      setIsMaximized(status);
    });

    return () => { if (unlisten) unlisten(); };
  }, [api]);

  const handleControl = (action: 'minimize' | 'maximize' | 'close') => {
    if (!api) return;
    try {
      if (api.sendWindowControl) {
        api.sendWindowControl(action);
      } else {
        api.invoke('window-control', action);
      }
    } catch (err) {
      console.error("Failed to send window control:", err);
    }
  };

  return (
    <div className="title-bar-container-fixed">
      <style>{titleBarGlobalStyles}</style>

      {/* KIRI: macOS Traffic Lights */}
      <div className="macos-controls-section">
        <div className="macos-controls">
          <button onClick={() => handleControl('close')} className="macos-btn close" title="Close">
            <IoCloseOutline className="control-icon" />
          </button>
          <button onClick={() => handleControl('minimize')} className="macos-btn minimize" title="Minimize">
            <IoRemoveOutline className="control-icon" />
          </button>
          <button onClick={() => handleControl('maximize')} className="macos-btn maximize" title={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? <IoRemoveOutline style={{ transform: 'rotate(90deg)' }} className="control-icon" /> : <IoAddOutline className="control-icon" />}
          </button>
        </div>
      </div>

      {/* TENGAH: Drag Area */}
      <div className="title-drag-area-custom">
        <div className="status-center-industrial">
          <div className="pulse-dot-active" />
          <span className="status-label">
            SYSTEM ACTIVE <span className="sep">//</span> {isMaximized ? 'FULL_VIEW' : 'WINDOWED'}
          </span>
        </div>
      </div>
      
      {/* KANAN: Branding */}
      <div className="brand-section-right">
        <div className="brand-text-industrial">
          <span className="version-tag">{import.meta.env.VITE_APP_VERSION || '2.0.0'}</span>
          <span className="main-label">{import.meta.env.VITE_APP_NAME || 'DStheme engine'}</span>
          <div className="icon-wrapper-industrial">
            <IoLogoElectron />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;