import  React from 'react';
import { dmsTheme } from '@/styles/dms.theme';

export const localStyles: Record<string, React.CSSProperties> = {
  idxBadge: { 
    background: '#f1f5f9', 
    padding: '2px 0', 
    borderRadius: '6px', 
    fontWeight: 800, 
    color: '#64748b', 
    fontSize: '11px', 
    fontFamily: 'monospace' 
  },
  container: { 
    paddingBottom: '40px' 
  },
  projectNameContainer: { 
    padding: '4px 0' 
  },
  projectNameMain: { 
    color: '#1e293b', 
    fontSize: '13px', 
    display: 'block' 
  },
  projectNameSub: { 
    fontSize: '9px', 
    color: dmsTheme.colors.primary, 
    fontWeight: 700, 
    letterSpacing: '0.5px' 
  },
  dateText: {
    fontSize: '11px', 
    fontWeight: 600
  },
  searchBar: { 
    width: 280, 
    borderRadius: '10px', 
    background: '#f8fafc', 
    border: '1px solid #e2e8f0', 
    height: 40 
  },
  addButton: { 
    height: 40, 
    borderRadius: '10px', 
    fontWeight: 'bold' 
  }
};

// CSS Injection untuk class-class global/antd override
export const globalComponentStyles = `
  .action-btn-industrial { 
    width: 32px !important; 
    height: 32px !important; 
    display: inline-flex !important; 
    align-items: center !important; 
    justify-content: center !important; 
    border-radius: 8px !important; 
    background: #fff; 
    border: 1px solid #e2e8f0 !important; 
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
  }
  .action-btn-industrial:hover { 
    border-color: ${dmsTheme.colors.primary} !important; 
    transform: translateY(-2px); 
    box-shadow: 0 4px 10px rgba(0,0,0,0.08); 
    z-index: 2; 
  }
  .ant-table-wrapper { 
    background: #fff; 
    border-radius: 12px; 
    padding: 12px; 
    border: 1px solid #f1f5f9; 
  }
`;