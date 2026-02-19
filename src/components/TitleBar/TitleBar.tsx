import React, { useState, useEffect } from 'react';
import { IoLogoElectron } from "react-icons/io5";
import { titleBarGlobalStyles } from './TitleBar.styles';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.api?.isMaximized) {
        const status = await window.api.isMaximized();
        setIsMaximized(status);
      }
    };
    checkMaximized();
  }, []);

  const handleControl = (action: 'minimize' | 'maximize' | 'close') => {
    if (window.api?.sendWindowControl) {
      window.api.sendWindowControl(action);
    }
  };

  return (
    <div className="title-bar-container-fixed">
      <style>{titleBarGlobalStyles}</style>

      {/* KIRI: macOS Traffic Lights */}
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

      {/* TENGAH: Drag Area & Status */}
      <div className="title-drag-area-custom">
        <div className="status-center-industrial">
          <div className="pulse-dot-active" />
          <span className="status-label">
            SYSTEM ACTIVE <span className="sep">//</span> {isMaximized ? 'FULL_VIEW' : 'WINDOWED'}
          </span>
        </div>
      </div>
      
      {/* KANAN: Brand Info */}
      <div className="brand-section-right">
        <div className="brand-text-industrial">
          <span className="version-tag">{import.meta.env.VITE_APP_VERSION}</span>
          <span className="main-label">{import.meta.env.VITE_APP_NAME}</span>
          <div className="icon-wrapper-industrial">
            <IoLogoElectron />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;