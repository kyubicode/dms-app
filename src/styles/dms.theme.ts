/**
 * DMS INDUSTRIAL SYSTEM - THEME ENGINE V3
 * Arsitektur: Token-based System
 * Palet: Navy Blue, Industrial Amber, & Slate Grey
 */

// 1. BASE PALETTE (Warna mentah)
const palette = {
  navy: {
    950: '#00162E', // Ultra Dark untuk Sidebar
    900: '#001B3D', // Deep Navy untuk Text Utama
    800: '#002147',
    700: '#003366', // PRIMARY (Biru Navy)
    600: '#0052A3',
  },
  amber: {
    400: '#FFC107',
    500: '#F59E0B', // ACCENT (Kuning Industrial)
    600: '#D97706',
  },
  slate: {
    50: '#F8FAFC',  // BACKGROUND Utama
    100: '#F1F5F9', // Table Header
    200: '#E2E8F0', // Border & Scrollbar
    300: '#CBD5E1',
    400: '#94A3B8', 
    500: '#64748B', // Secondary Text
    800: '#1E293B', // Alternative Dark Text
  },
  status: {
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
  }
} as const;

// 2. THEME DEFINITION
export const dmsTheme = {
  colors: {
    // Brand Colors
    primary: palette.navy[700],
    secondary: palette.slate[100], 
    accent: palette.amber[500],
    
    // UI Colors
    background: palette.slate[50],
    surface: '#FFFFFF',
    border: palette.slate[200],
    tableHeader: palette.slate[100],
    
    // Text Semantic
    text: {
      primary: palette.navy[900],   // Biru Navy sangat gelap
      secondary: palette.slate[500], // Abu-abu
      disabled: palette.slate[400],
      inverse: '#FFFFFF',
      onAccent: palette.navy[950],  // Teks gelap untuk di atas tombol kuning
    },

    // Status Semantic
    status: palette.status,

    // Gradients
    gradient: {
      auth: `linear-gradient(135deg, ${palette.navy[700]} 0%, ${palette.navy[950]} 100%)`,
      primary: `linear-gradient(90deg, ${palette.navy[700]} 0%, ${palette.navy[600]} 100%)`,
      accent: `linear-gradient(135deg, ${palette.amber[400]} 0%, ${palette.amber[500]} 100%)`,
      glass: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
    },
  },

  fonts: {
    main: "'Inter', -apple-system, system-ui, sans-serif",
    code: "'JetBrains Mono', 'Fira Code', monospace",
  },

  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px',
  },

  shadow: {
    card: '0 4px 12px rgba(0, 22, 46, 0.06)',
    hover: '0 12px 24px rgba(0, 22, 46, 0.12)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  }
} as const;

// Typescript types dari tema
export type DmsTheme = typeof dmsTheme;

// 3. NAMED EXPORTS
export const { colors, fonts, shadow, radius } = dmsTheme;

// 4. GLOBAL INJECTOR (Optimized)
export const injectGlobalTheme = () => `
  :root {
    /* Semantic Tokens */
    --primary: ${colors.primary};
    --secondary: ${colors.secondary};
    --accent: ${colors.accent};
    --bg-main: ${colors.background};
    --surface: ${colors.surface};
    --border: ${colors.border};
    --text-main: ${colors.text.primary};
    --text-sub: ${colors.text.secondary};
    --text-inv: ${colors.text.inverse};
    
    /* Layout Tokens */
    --radius-md: ${radius.md};
    --shadow-card: ${shadow.card};
    --font-main: ${fonts.main};
    --font-code: ${fonts.code};
    
    color-scheme: light !important;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: var(--font-main);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* --- ANT DESIGN OVERRIDES --- */
  .ant-layout { background: var(--bg-main) !important; }
  
  /* Sidebar Navy */
  .ant-layout-sider {
    background: ${palette.navy[950]} !important;
  }

  /* Tombol Utama pakai Kuning Amber agar Kontras */
  .ant-btn-primary {
    background: var(--accent) !important;
    border-color: var(--accent) !important;
    color: ${colors.text.onAccent} !important;
    font-weight: 600 !important;
  }

  .ant-btn-primary:hover {
    background: ${palette.amber[400]} !important;
    border-color: ${palette.amber[400]} !important;
    color: ${colors.text.onAccent} !important;
  }

  .ant-card {
    background: var(--surface) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius-md) !important;
    box-shadow: var(--shadow-card);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .ant-card:hover { box-shadow: ${shadow.hover}; }

  .ant-table-thead > tr > th {
    background: ${colors.tableHeader} !important;
    color: var(--text-main) !important;
    font-weight: 600 !important;
    border-bottom: 1px solid var(--border) !important;
  }

  /* --- MODERN SCROLLBAR (Slate Grey) --- */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: ${palette.slate[300]};
    border-radius: 10px;
    border: 2px solid var(--bg-main);
  }
  ::-webkit-scrollbar-thumb:hover { background: ${palette.slate[400]}; }

  /* --- SELECTION COLOR --- */
  ::selection {
    background: ${colors.primary};
    color: white;
  }
`;