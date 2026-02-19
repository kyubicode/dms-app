import { dmsTheme } from '@/styles/dms.theme';
import React from 'react';

export const s: Record<string, React.CSSProperties> = {
  floatingContainer: {
    position: 'fixed',
    top: '8px', 
    left: 0,
    right: 0,
    zIndex: 999,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  navBar: {
    pointerEvents: 'auto',
    // Gunakan Putih yang lebih solid (0.8) agar teks Navy di dalamnya terlihat tegas
    background: 'rgba(255, 255, 255, 0.8)', 
    padding: '5px',
    borderRadius: '40px',
    display: 'flex',
    gap: '4px',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    // Border menggunakan warna Navy sangat tipis agar terlihat premium
    
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 22px',
    borderRadius: '35px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
  },
  icon: {
    fontSize: '19px',
    display: 'flex',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.3px',
    fontFamily: dmsTheme.fonts.code,
    textTransform: 'uppercase',
  }
};