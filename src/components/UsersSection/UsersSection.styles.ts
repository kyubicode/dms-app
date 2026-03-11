import React from 'react';

const TECH_COLORS = {
  primary: '#007AFF',
  textMain: '#121214',
  textSub: '#6C757D',
  borderSubtle: 'rgba(0, 0, 0, 0.1)',
  bgSurface: '#FFFFFF',
  bgZinc: '#F8F9FA'
};

export const localStyles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0px',
    animation: 'appleFadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
    minHeight: '100vh',
  },
  idxBadge: { 
    background: '#fff', 
    padding: '4px 10px', 
    borderRadius: '8px', 
    fontWeight: 700, 
    color: TECH_COLORS.textMain, 
    fontSize: '11px',
    fontFamily: '"JetBrains Mono", monospace',
    boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
    border: `1px solid ${TECH_COLORS.borderSubtle}`
  },
  photoLabel: { 
    fontSize: '11px', 
    color: TECH_COLORS.textMain, 
    display: 'block', 
    marginBottom: '8px',
    letterSpacing: '0.05em',
    fontWeight: 700,
    opacity: 0.8
  }
};

export const globalCss = `
  @keyframes appleFadeIn {
    from { opacity: 0; transform: scale(0.99) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

 /* Action Buttons Sync */
  .action-btn-industrial { 
    width: 36px !important; 
    height: 36px !important; 
    border-radius: 50px !important; 
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
.action-btn-industrial-danger{
    width: 36px !important; 
    height: 36px !important; 
    border-radius: 50px !important; 
    background:rgb(255, 77, 77) !important; 
    border: 1px solid rgba(0,0,0,0.08) !important; 
    display: flex; 
    align-items: center; 
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    color:rgb(255, 255, 255) !important;
}
  /* --- FIX SEARCH & INPUT (No Overlap) --- */
  
  /* Wrapper Luar (Tempat Icon & Input) */
  .ant-input-affix-wrapper {
    height: 38px !important;
    padding: 0 12px !important;
    border-radius: 10px !important;
    border: 1px solid ${TECH_COLORS.borderSubtle} !important;
    background: #ffffff !important;
    box-shadow: none !important;
    display: flex !important;
    align-items: center !important;
  }

  /* Input Internal (Supaya tidak bikin border dobel) */
  .ant-input-affix-wrapper > input.ant-input {
    border: none !important;
    height: 100% !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 8px !important;
  }

  /* Input Biasa (Tanpa Prefix) */
  input.ant-input:not(.ant-input-affix-wrapper > input) {
    height: 38px !important;
    border-radius: 10px !important;
    border: 1px solid ${TECH_COLORS.borderSubtle} !important;
    padding: 0 12px !important;
  }

  /* Focus State */
  .ant-input-affix-wrapper-focused, 
  .ant-input:focus {
    border-color: ${TECH_COLORS.primary} !important;
    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1) !important;
    outline: none !important;
  }

  /* --- BUTTON TAMBAH PENGGUNA --- */
  .ant-btn-primary {
    height: 38px !important;
    border-radius: 10px !important;
    background: ${TECH_COLORS.primary} !important;
    border: none !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    box-shadow: 0 4px 10px rgba(0, 122, 255, 0.2) !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 20px !important;
  }

  .ant-btn-primary:active {
    transform: scale(0.97);
  }

  /* --- TABLE & ACTION BUTTONS --- */
  .action-btn-apple { 
    width: 38px !important; 
    height: 38px !important; 
    border-radius: 10px !important; 
    background: #fff !important; 
    border: 1px solid ${TECH_COLORS.borderSubtle} !important; 
    display: flex !important; 
    align-items: center !important; 
    justify-content: center !important;
  }

  .action-btn-apple:hover {
    border-color: ${TECH_COLORS.primary} !important;
    color: ${TECH_COLORS.primary} !important;
  }

  /* --- PHOTO BOX --- */
  .photo-box-apple { 
    width: 100%; 
    height: 200px; 
    border-radius: 14px; 
    background: ${TECH_COLORS.bgZinc}; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    cursor: pointer; 
    border: 1px dashed ${TECH_COLORS.borderSubtle};
    position: relative;
    overflow: hidden;
  }

  .photo-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: 0.3s ease;
  }

  .photo-box-apple:hover .photo-overlay {
    opacity: 1;
  }
`;