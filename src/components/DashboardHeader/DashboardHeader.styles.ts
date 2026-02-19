import React from 'react';

const createStyles = <T extends { [key: string]: React.CSSProperties }>(cfg: T): T => cfg;

// Konstanta warna Biru Navy & Slate
const navyDark = '#0f172a';
const navyLight = '#1e293b';
const slateText = '#64748b';

export const s = createStyles({
  headerContainer: {
    // Putih Glossy dengan transparansi tipis
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(15px) contrast(100%)',
    WebkitBackdropFilter: 'blur(15px) contrast(100%)',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Border bawah menggunakan Navy sangat tipis agar glossy
    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
    width: '100%',
    lineHeight: 'normal',
    position: 'sticky',
    top: 0,
    zIndex: 999,
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
  },
  leftSection: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  rightSection: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  
  // Logo: Biru Navy Solid
  logoPill: { 
    width: 34, height: 34, 
    background: navyDark, 
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(15, 23, 42, 0.15)'
  },
  logoDot: { 
    width: 10, height: 10, 
    background: '#ffffff', 
    borderRadius: '2.5px',
    transform: 'rotate(45deg)' 
  },
  
  brandTitle: { 
    fontSize: '18px', 
    fontWeight: 800, 
    color: navyDark, // Teks Navy Utama
    letterSpacing: '-0.5px' 
  },
  vTag: { 
    fontSize: '9px', 
    background: 'rgba(15, 23, 42, 0.06)', 
    color: navyDark,
    padding: '2px 6px', 
    borderRadius: '6px', 
    verticalAlign: 'middle',
    fontWeight: 700,
    marginLeft: '4px',
    border: '1px solid rgba(15, 23, 42, 0.1)'
  },
  brandSubtitle: { 
    fontSize: '10px', 
    color: slateText, // Teks Navy Muda/Slate
    fontWeight: 600, 
    letterSpacing: '0.5px', 
    display: 'block' 
  },

  // Profile Capsule: Putih Glossy
  userProfileCapsule: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 6px 4px 12px',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '24px',
    cursor: 'pointer',
    border: '1px solid rgba(15, 23, 42, 0.08)',
    maxWidth: '220px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    lineHeight: '1.2',
    overflow: 'hidden',
  },
  userName: { 
    fontSize: '13px', 
    color: navyDark, 
    fontWeight: 600,
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis',
    maxWidth: '120px'
  },
  userRole: { 
    fontSize: '9px', 
    color: slateText, 
    fontWeight: 700,
    letterSpacing: '0.3px',
    textTransform: 'uppercase'
  },
  avatarMain: { 
    background: '#fff', 
    flexShrink: 0, 
    border: '2px solid #fff',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.1)'
  }
});

export const headerGlobalStyles = `
  .profile-capsule:hover {
    border-color: rgba(15, 23, 42, 0.2) !important;
    background: #FFFFFF !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important;
  }
  .ant-dropdown { padding-top: 8px; }
  .ant-dropdown-menu {
    border-radius: 12px !important;
    padding: 6px !important;
    border: 1px solid rgba(15, 23, 42, 0.08) !important;
  }
`;