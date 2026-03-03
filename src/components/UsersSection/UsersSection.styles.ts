import React from 'react';

export const localStyles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0px',
    animation: 'appleFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
    minHeight: '100vh'
  },
  idxBadge: { 
    background: '#ffffff', 
    padding: '4px 10px', 
    borderRadius: '8px', 
    fontWeight: 700, 
    color: '#1d1d1f', 
    fontSize: '11px',
    fontFamily: '"SF Mono", "Fira Code", monospace',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.03)'
  },
  avatarWrapper: { 
    padding: '3px', 
    borderRadius: '50%', 
    background: 'linear-gradient(135deg, #fff 0%, #f5f5f7 100%)',
    display: 'inline-flex',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.05)'
  },
  nameText: { 
    color: '#1d1d1f', 
    fontSize: '14px', 
    fontWeight: 600,
    display: 'block',
    letterSpacing: '-0.02em',
    lineHeight: '1.4'
  },
  idText: { 
    fontSize: '12px', 
    color: '#86868b', 
    fontWeight: 400,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text"',
  },
  roleTag: {
    borderRadius: '20px', // Capsule style
    border: 'none',
    fontWeight: 600,
    fontSize: '10px',
    padding: '2px 12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  },
  photoLabel: { 
    fontSize: '10px', 
    color: '#1d1d1f', 
    display: 'block', 
    marginBottom: '12px',
    letterSpacing: '0.1em',
    fontWeight: 700,
    opacity: 0.6
  },
  inputField: { 
    height: 44,
    borderRadius: '12px',
    background: '#ffffff',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  }
};

export const globalCss = `
  @keyframes appleFadeIn {
    from { opacity: 0; transform: scale(0.98) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* Glassmorphism Card untuk Table & Modal */
  .ant-table {
    background: transparent !important;
  }
  
  .ant-table-thead > tr > th {
    background: rgba(255, 255, 255, 0.4) !important;
    backdrop-filter: blur(10px);
    color: #86868b !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(0,0,0,0.05) !important;
  }

  .ant-table-tbody > tr > td {
    border-bottom: 1px solid rgba(0,0,0,0.03) !important;
    transition: all 0.2s ease;
  }

  .ant-table-tbody > tr:hover > td {
    background: rgba(0, 122, 255, 0.02) !important;
  }

  /* Apple Style Modal High-End */
  .apple-modal .ant-modal-content {
    border-radius: 28px !important;
    padding: 32px !important;
    backdrop-filter: blur(30px) saturate(180%);
    background: rgba(255, 255, 255, 0.85) !important;
    box-shadow: 0 30px 60px rgba(0,0,0,0.12) !important;
    border: 1px solid rgba(255,255,255,0.4);
  }

  .apple-modal .ant-modal-header {
    background: transparent !important;
    border-bottom: none !important;
    margin-bottom: 24px;
  }

  /* Action Buttons (Smooth & Tactile) */
  .action-btn-apple { 
    width: 38px !important; 
    height: 38px !important; 
    border-radius: 12px !important; 
    background: rgba(255, 255, 255, 0.8) !important; 
    border: 1px solid rgba(0,0,0,0.08) !important; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  }
  
  .action-btn-apple:hover { 
    background: #ffffff !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
    border-color: #007AFF !important;
    color: #007AFF !important;
  }
  
  .action-btn-apple:active {
    transform: translateY(0) scale(0.95);
  }

  /* Photo Box Apple (Soft Depth) */
  .photo-box-apple { 
    width: 100%; 
    height: 220px; 
    border-radius: 20px; 
    background: #ffffff; 
    display: flex; 
    flex-direction: column;
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    overflow: hidden; 
    position: relative; 
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .photo-box-apple:hover {
    border-color: #007AFF;
    box-shadow: 0 12px 24px rgba(0, 122, 255, 0.1);
  }

  .photo-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 122, 255, 0.05);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: 0.3s ease;
    color: #007AFF;
  }
  
  .photo-box-apple:hover .photo-overlay { opacity: 1; }

  /* Input & Select Refinement */
  .ant-input, .ant-input-password, .ant-select-selector {
    border: 1px solid rgba(0,0,0,0.1) !important;
    box-shadow: none !important;
    padding: 0 16px !important;
  }
  
  .ant-input:focus, .ant-input-focused, .ant-select-focused .ant-select-selector {
    background: #fff !important;
    border-color: #007AFF !important;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1) !important;
  }

  /* Animasi Pulse untuk Loading State */
  .loading-pulse {
    animation: pulse 1.5s infinite ease-in-out;
  }
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;