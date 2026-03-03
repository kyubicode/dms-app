import React from 'react';

const MAC_COLORS = {
  primary: '#007aff',
  border: 'rgba(0, 0, 0, 0.1)',
  textMain: '#1d1d1f',
  textSecondary: '#86868b',
};

export const localStyles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh'},
  idxBadge: { 
    background: 'rgba(0, 0, 0, 0.05)', padding: '2px 8px', borderRadius: '4px', 
    fontWeight: 600, color: MAC_COLORS.textSecondary, fontSize: '10px' 
  },
  projectNameContainer: { padding: '4px 0' },
  projectNameMain: { color: MAC_COLORS.textMain, fontSize: '13px', fontWeight: 600, display: 'block' },
  projectNameSub: { fontSize: '9px', color: MAC_COLORS.primary, fontWeight: 500, textTransform: 'uppercase' },
  dateText: { fontSize: '11px', fontWeight: 500, color: MAC_COLORS.textMain },
  searchBar: { width: 240, borderRadius: '8px', background: 'rgba(0, 0, 0, 0.05)', border: 'none', height: '32px' },
  addButton: { 
    height: '32px', borderRadius: '8px', fontWeight: 500, background: MAC_COLORS.primary, 
    border: 'none', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' 
  }
};

export const globalComponentStyles = `
  .ant-table-wrapper { 
    background: #fff !important; 
    border-radius: 0px !important; 
    border: 1px solid ${MAC_COLORS.border} !important;
    box-shadow: 0 4px 24px rgba(0,0,0,0.04) !important;
    overflow: hidden !important; 
  }

  .ant-table, .ant-table-container, .ant-table-thead > tr > th {
    border-radius: 0 !important;
  }

  .ant-table-thead > tr > th {
    background: #fafafa !important;
    color: ${MAC_COLORS.textSecondary} !important;
    font-size: 11px !important;
    text-transform: uppercase !important;
    border-bottom: 1px solid ${MAC_COLORS.border} !important;
  }

  .action-btn-industrial { 
    width: 32px !important; height: 32px !important; display: inline-flex !important; 
    align-items: center !important; justify-content: center !important; 
    border-radius: 8px !important; background: #fff !important; border: 1px solid rgba(0,0,0,0.1) !important; 
  }

  .mac-modal .ant-modal-content { border-radius: 14px !important; overflow: hidden !important; }
`;