import { dmsTheme } from '@/styles/dms.theme';

const { colors, fonts } = dmsTheme;

// Helper untuk type safety style (opsional)
const createStyles = <T extends { [key: string]: React.CSSProperties }>(cfg: T): T => cfg;

export const s = createStyles({
  // Jika kamu ingin memindahkan style objek React ke sini di masa depan
});

export const titleBarGlobalStyles = `
  .title-bar-container-fixed {
    height: 38px !important;
    background: ${colors.surface}; 
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1001;
    border-bottom: 1px solid ${colors.border};
    user-select: none;
    padding: 0 16px;
    box-sizing: border-box !important;
  }

  .macos-controls-section {
    width: 80px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .macos-controls {
    display: flex;
    gap: 8px;
    -webkit-app-region: no-drag;
  }

  .macos-btn {
    width: 12px !important;
    height: 12px !important;
    min-width: 12px !important;
    min-height: 12px !important;
    border-radius: 50% !important;
    border: none;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: relative;
  }

  /* Dot Colors */
  .macos-btn.close { background: #ff5f57; border: 0.5px solid #e0443e; }
  .macos-btn.minimize { background: #febc2e; border: 0.5px solid #d8a124; }
  .macos-btn.maximize { background: #28c840; border: 0.5px solid #1aab29; }

  /* Icons inside dots */
  .control-icon {
    font-size: 10px;
    color: rgba(0, 0, 0, 0.6);
    opacity: 0; /* Tersembunyi default */
    transition: opacity 0.15s ease;
    pointer-events: none;
  }

  /* Show icons on hover group */
  .macos-controls:hover .control-icon {
    opacity: 1;
  }

  .macos-btn:active { filter: brightness(0.8); }

  .title-drag-area-custom {
    flex: 1;
    height: 100%;
    -webkit-app-region: drag;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-center-industrial {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 14px;
    background: ${colors.background}99;
    border: 1px solid ${colors.border};
    border-radius: 20px;
    backdrop-filter: blur(8px);
  }

  .status-label {
    font-family: ${fonts.code}; font-size: 8px; 
    color: ${colors.text.secondary}; font-weight: 700;
    letter-spacing: 0.5px;
  }

  .brand-section-right {
    width: auto;
    min-width: 120px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-shrink: 0;
  }

  .brand-text-industrial {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .main-label {
    font-family: ${fonts.main}; font-size: 10px; font-weight: 800;
    color: ${colors.text.primary};
    text-transform: uppercase;
  }

  .version-tag {
    font-family: ${fonts.code}; font-size: 8px; 
    color: ${colors.primary};
    background: ${colors.primary}10;
    padding: 2px 6px; border-radius: 4px;
    border: 1px solid ${colors.primary}30;
  }

  .icon-wrapper-industrial {
    color: ${colors.primary};
    font-size: 20px;
    display: flex; align-items: center;
  }

  .pulse-dot-active {
    width: 6px; height: 6px; background: ${colors.status.success};
    border-radius: 50%; box-shadow: 0 0 8px ${colors.status.success};
    animation: pulse-op 2s infinite;
    flex-shrink: 0;
  }

  .sep { color: ${colors.accent}; }

  @keyframes pulse-op { 
    0%, 100% { opacity: 0.4; } 
    50% { opacity: 1; } 
  }
    /* TAMBAHKAN INI DI titleBarGlobalStyles */

/* Pastikan semua dropdown AntD (DatePicker, Select) 
   tidak mewarisi fitur drag dari TitleBar di bawahnya 
*/
.ant-picker-dropdown, 
.ant-select-dropdown, 
.ant-picker-panel-container {
  -webkit-app-region: no-drag !important;
}

/* Paksa Z-Index panel kalender agar jauh di atas TitleBar (1001) 
*/
.ant-picker-dropdown {
  z-index: 9999 !important;
}
`;