import React from 'react';
import { dmsTheme } from '@/styles/dms.theme';

export const globalCSS = `
  body { 
    margin: 0; 
    /* Background sedikit abu-abu sangat muda khas macOS agar card putih di dalamnya menonjol */
    background-color: #f5f5f7; 
    overflow: hidden; 
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { 
    background: rgba(15, 23, 42, 0.1); 
    border-radius: 10px; 
  }
`;

const createStyles = <T extends { [key: string]: React.CSSProperties }>(cfg: T): T => cfg;

export const s = createStyles({
  layoutBase: { 
    background: 'transparent', 
    height: '100vh', 
    display: 'flex', 
    overflowY: 'auto',
    flexDirection: 'column' 
  },
  headerWrapper: {
    position: 'fixed',
    top: '32px',
    left: 0,
    width: '100%',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderBottom: '1px solid rgba(15, 23, 42, 0.05)'
  },
  navContainer: { 
    marginTop: '-12px', 
    display: 'flex', 
    justifyContent: 'center', 
    width: '100%' 
  },
  mainContent: { 
    marginTop: '150px', // Jarak aman agar tidak tertutup header
    flex: 1, 
    paddingBottom: '60px',
    width: '100%',
    maxWidth: '1400px', // Lebar ideal untuk dashboard agar tidak terlalu melar
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  breadcrumbArea: { 
    padding: '0 40px 24px 40px' 
  },
  iconBox: {
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    background: '#ffffff',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    color: '#0f172a'
  },
  contentContainer: {
    padding: '0 40px',
    animation: 'fadeInUp 0.4s ease-out'
  },
  metaTextAccent: {
    fontSize: '10px', 
    fontWeight: 700, 
    color: '#64748b',
    fontFamily: dmsTheme.fonts.code,
    letterSpacing: '0.5px'
  }
});

// Tambahkan animasi fade agar transisi tab terasa smooth
export const dashboardAnimations = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;