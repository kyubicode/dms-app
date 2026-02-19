import { dmsTheme } from '@/styles/dms.theme';
import React from 'react';

export const localStyles: Record<string, React.CSSProperties> = {
  container: {
    paddingBottom: '32px'
  },
  idxBadge: { 
    background: '#f1f5f9', 
    padding: '4px 8px', 
    borderRadius: '4px', 
    fontWeight: 800, 
    color: '#64748b', 
    fontSize: '10px' 
  },
  avatarWrapper: { 
    border: `1px solid ${dmsTheme.colors.border}`, 
    padding: '2px', 
    borderRadius: '6px', 
    background: '#fff',
    display: 'inline-flex'
  },
  nameText: { 
    color: dmsTheme.colors.text.primary, 
    fontSize: '13px', 
    display: 'block', 
    textTransform: 'uppercase' 
  },
  idText: { 
    fontSize: '10px', 
    color: dmsTheme.colors.primary, 
    fontWeight: 700, 
    fontFamily: dmsTheme.fonts.code 
  },
  photoLabel: { 
    fontSize: '10px', 
    color: '#64748b', 
    display: 'block', 
    marginBottom: '8px', 
    fontFamily: dmsTheme.fonts.code 
  },
  inputField: { 
    height: 42 
  },
  idInputField: { 
    height: 42, 
    fontFamily: dmsTheme.fonts.code, 
    fontWeight: 'bold' 
  }
};

export const globalCss = `
  .action-btn-industrial { 
    width: 36px !important; 
    height: 36px !important; 
    border-radius: 4px !important; 
    background: #fff; 
    border: 1px solid ${dmsTheme.colors.border} !important; 
    transition: all 0.2s; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
  }
  .action-btn-industrial:hover { 
    border-color: ${dmsTheme.colors.primary} !important; 
    color: ${dmsTheme.colors.primary} !important; 
    transform: translateY(-2px); 
    box-shadow: 0 4px 10px rgba(0,0,0,0.05); 
  }
  .photo-box-container { 
    width: 100%; 
    height: 240px; 
    border: 2px dashed ${dmsTheme.colors.border}; 
    border-radius: 8px; 
    background: #f8fafc; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    overflow: hidden; 
    position: relative; 
  }
  .photo-upload-overlay { 
    position: absolute; 
    inset: 0; 
    background: rgba(15, 23, 42, 0.6); 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    opacity: 0; 
    transition: 0.3s; 
    color: white; 
  }
  .photo-box-container:hover .photo-upload-overlay { opacity: 1; }
  
  /* Skeleton Loading Animation */
  @keyframes skeleton-glow {
    0% { background-color: #f1f5f9; }
    50% { background-color: #e2e8f0; }
    100% { background-color: #f1f5f9; }
  }
  .skeleton-row {
    height: 20px;
    width: 100%;
    border-radius: 4px;
    animation: skeleton-glow 1.5s infinite ease-in-out;
  }
`;