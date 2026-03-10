import React from 'react';

export const localStyles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0px',
    animation: 'appleFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
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
  projectNameContainer: { display: 'flex', flexDirection: 'column', gap: '2px' },
  projectNameMain: { 
    color: '#1d1d1f', 
    fontSize: '14px', 
    fontWeight: 600,
    letterSpacing: '-0.02em'
  },
  projectNameSub: { 
    fontSize: '10px', 
    color: '#007AFF', 
    fontWeight: 700, 
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  dateText: { 
    fontSize: '12px', 
    color: '#86868b', 
    fontWeight: 500 
  },
  searchBar: { 
    width: 220, 
    borderRadius: '10px', 
    background: '#ffffff',
    border: '1px solid rgba(0,0,0,0.1)',
    height: '38px' 
  },
  addButton: { 
    height: '38px', 
    borderRadius: '10px', 
    fontWeight: 600, 
    fontSize: '13px',
    background: '#007AFF', 
    boxShadow: '0 4px 12px rgba(0, 122, 255, 0.2)',
    border: 'none'
  }
};

export const globalComponentStyles = `
  @keyframes appleFadeIn {
    from { opacity: 0; transform: scale(0.98) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* Table Glassmorphism Sync */
  .ant-table { background: transparent !important; }
  
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
    padding: 12px 16px !important;
  }

  .ant-table-tbody > tr:hover > td {
    background: rgba(0, 122, 255, 0.02) !important;
  }

  /* Action Buttons Sync */
  .action-btn-industrial { 
    width: 36px !important; 
    height: 36px !important; 
    border-radius: 10px !important; 
    background: #ffffff !important; 
    border: 1px solid rgba(0,0,0,0.08) !important; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    color: #424245 !important;
  }
  
  .action-btn-industrial:hover { 
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.06);
    border-color: #007AFF !important;
    color: #007AFF !important;
  }

  /* Modal Sync */
  .mac-modal .ant-modal-content {
    border-radius: 24px !important;
    padding: 24px !important;
    backdrop-filter: blur(20px);
    background: rgba(255, 255, 255, 0.9) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
  }
`;