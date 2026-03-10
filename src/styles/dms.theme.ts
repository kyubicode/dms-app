/**
 * DMS INDUSTRIAL SYSTEM - THEME ENGINE V3.5 (2026 REFINED)
 * Arsitektur: Token-based System (macOS & Industrial Hybrid)
 * Palet: Graphite Steel, Electric Cobalt, & Muted Slate
 */

// 1. BASE PALETTE (Warna yang dikalibrasi ulang untuk kenyamanan mata)
const palette = {
  graphite: {
    950: '#0F1115', // Sidebar - Deep Graphite
    900: '#1A1D23', // Surface / Card Dark
    800: '#252932', // UI Element Background
    700: '#3A3F4B', // PRIMARY (Muted Steel Blue)
  },
  cobalt: {
    500: '#007AFF', // ACCENT (Electric Cobalt - Apple Standard)
    600: '#0063D1',
    400: '#47A1FF',
  },
  slate: {
    50: '#F8F9FA',  // BACKGROUND Utama (Sangat bersih)
    100: '#F1F3F5', // Table Header
    200: '#E9ECEF', // Border
    500: '#6C757D', // Secondary Text
    900: '#212529', // Main Dark Text
  },
  status: {
    success: '#28C76F',
    danger: '#EA5455',
    warning: '#FF9F43',
    info: '#00CFE8',
  }
} as const;

// 2. THEME DEFINITION
export const dmsTheme = {
  colors: {
    primary: palette.cobalt[500],   // Biru tajam untuk aksi utama
    secondary: palette.graphite[700], // Baja untuk elemen struktur
    accent: palette.cobalt[400],
    
    background: palette.slate[50],
    surface: '#FFFFFF',
    border: palette.slate[200],
    tableHeader: 'rgba(241, 243, 245, 0.7)',
    
    text: {
      primary: palette.slate[900],   
      secondary: palette.slate[500], 
      disabled: '#ADB5BD',
      inverse: '#FFFFFF',
      onAccent: '#FFFFFF',
    },

    status: palette.status,

    gradient: {
      // Lebih subtle, tidak berlebihan
      auth: `linear-gradient(135deg, ${palette.graphite[900]} 0%, ${palette.graphite[950]} 100%)`,
      primary: `linear-gradient(180deg, ${palette.cobalt[500]} 0%, ${palette.cobalt[600]} 100%)`,
      glass: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
    },
  },

  fonts: {
    main: "'Inter', -apple-system, system-ui, sans-serif",
    code: "'JetBrains Mono', monospace",
  },

  radius: {
    sm: '4px',
    md: '10px', // Lebih rounded untuk kesan modern
    lg: '16px',
    xl: '24px',
  },

  shadow: {
    card: '0 2px 12px rgba(0, 0, 0, 0.03)',
    hover: '0 15px 35px rgba(0, 0, 0, 0.08)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
  }
} as const;

export type DmsTheme = typeof dmsTheme;
export const { colors, fonts, shadow, radius } = dmsTheme;

// 4. GLOBAL INJECTOR (Optimized & Clean)
export const injectGlobalTheme = () => `
  :root {
    --primary: ${colors.primary};
    --bg-main: ${colors.background};
    --surface: ${colors.surface};
    --border: ${colors.border};
    --text-main: ${colors.text.primary};
    --text-sub: ${colors.text.secondary};
    --radius-md: ${radius.md};
    
    color-scheme: light;
  }

  body {
    margin: 0;
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: var(--font-main);
    -webkit-font-smoothing: antialiased;
    letter-spacing: -0.01em;
  }

  /* --- ANT DESIGN MODERNIZATION --- */
  
  /* Sidebar: Graphite pekat memberikan kesan profesional */
  .ant-layout-sider {
    background: ${palette.graphite[950]} !important;
    border-right: 1px solid rgba(255,255,255,0.05) !important;
  }

  .ant-menu.ant-menu-dark {
    background: transparent !important;
  }

  /* Tombol Utama: Electric Cobalt (Lebih Segar) */
  .ant-btn-primary {
    background: var(--primary) !important;
    border: none !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
    box-shadow: 0 4px 10px rgba(0, 122, 255, 0.2) !important;
    transition: all 0.2s ease !important;
  }

  .ant-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(0, 122, 255, 0.3) !important;
    filter: brightness(1.1);
  }

  /* Card bergaya Glass-Soft */
  .ant-card {
    background: var(--surface) !important;
    border: 1px solid rgba(0,0,0,0.04) !important;
    border-radius: var(--radius-md) !important;
    box-shadow: ${shadow.card} !important;
  }

  .ant-card:hover { 
    box-shadow: ${shadow.hover} !important; 
  }

  /* Header Tabel: Muted & Minimalis */
  .ant-table-thead > tr > th {
    background: ${colors.tableHeader} !important;
    backdrop-filter: blur(8px);
    color: var(--text-sub) !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    font-weight: 600 !important;
    border-bottom: 1px solid var(--border) !important;
  }

  /* Scrollbar Minimalis (Mac Style) */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: #D1D5DB;
    border-radius: 10px;
  }
  ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }

  ::selection {
    background: rgba(0, 122, 255, 0.15);
    color: var(--primary);
  }
`;