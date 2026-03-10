import React from 'react';

export const localStyles: Record<string, React.CSSProperties> = {
  mainCard: { 
    background: '#fff', 
    border: '1px solid #e2e8f0', 
    borderRadius: '20px', 
    //minHeight: '88vh', 
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)' 
  },
  pageHeader: { 
    padding: '24px 32px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    background: '#fff'
  },
  tabLabel: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    fontWeight: 600,
    fontSize: '14px'
  },
  tabContent: { 
    padding: '32px',
    animation: 'fadeIn 0.4s ease-out',
  },
  actionBox: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '24px', 
    padding: '40px', 
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
    borderRadius: '20px', 
    border: '1px solidrgb(0, 0, 0)',
    marginTop: '10px',
    
  },
  dividerText: {
    letterSpacing: '0.05em',
    color: '#64748b',
    fontSize: '11px'
  }
};

export const globalSettingsCss = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .settings-tabs .ant-tabs-nav {
    margin-bottom: 0 !important;
    padding: 0 32px !important;
    background: #f8fafc !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }

  .settings-tabs .ant-tabs-tab {
    padding: 16px 4px !important;
    transition: all 0.3s ease !important;
  }

  .settings-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
    color:rgb(0, 69, 99) !important;
  }

  .settings-tabs .ant-tabs-ink-bar {
    background:rgb(248, 56, 75) !important;
    height: 3px !important;
    border-radius: 3px 3px 0 0;
  }

  /* Menargetkan container modal AntD v5 secara spesifik */
  .dark-terminal-modal .ant-modal-container {
    background-color: transparent !important;
    padding: 0 !important;
  }

  /* Reset total untuk content yang ada di dalam container */
  .dark-terminal-modal .ant-modal-content {
    background-color: #0d1117 !important;
    background-clip: border-box !important;
    border: 0px solid #30363d !important;
    border-radius: 0px !important;
    box-shadow: 0 12px 48px rgba(255, 0, 0, 0.7) !important;
    padding: 0 !important; /* Menghilangkan padding putih di sekitar terminal */
    overflow: hidden;
  }

  /* Header Terminal */
  .dark-terminal-modal .ant-modal-header {
    background-color: #161b22 !important;
    border-bottom: 1px solid #30363d !important;
    padding: 12px 24px !important;
    margin: 0 !important;
  }

  /* Warna Teks Judul */
  .dark-terminal-modal .ant-modal-title {
    color: #8b949e !important;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }

  /* Tombol Close (X) */
  .dark-terminal-modal .ant-modal-close {
    color: #8b949e !important;
    top: 12px !important;
  }

  .dark-terminal-modal .ant-modal-close:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    color: #fff !important;
  }

  /* Menghilangkan sisa padding pada body */
  .dark-terminal-modal .ant-modal-body {
    background-color: #0d1117 !important;
    padding: 0 !important;
  }
`;