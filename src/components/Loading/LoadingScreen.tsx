import React from 'react';
import { Typography } from 'antd';
import { dmsTheme } from '@/styles/dms.theme';

const { Text } = Typography;

export default function LoadingScreen() {
  // Generate random ID sekali saat render
  const nodeId = React.useMemo(() => Math.random().toString(16).substring(2, 8).toUpperCase(), []);

  return (
    <div style={styles.overlay}>
      {/* Efek Watermark Background - Menggunakan Navy dengan opacity rendah */}
      <div style={styles.backgroundBranding}>ZenTE</div>

      <div style={styles.wrapper}>
        {/* Header dengan Icon & Title */}
        <div style={styles.header}>
          <div style={styles.brandBox}>
            <div style={styles.brandDot} />
            <Text style={styles.loadText}>CORE_BOOT_SEQUENCE</Text>
          </div>
          <Text className="loading-dots" style={styles.statusText}>
            INITIALIZING
          </Text>
        </div>

        {/* Progress Bar Container */}
        <div style={styles.barContainer}>
          {/* Elemen yang bergerak (Shimmer) - Sekarang menggunakan warna Accent (Amber) */}
          <div className="shimmer-bar" />
        </div>

        {/* Technical Metadata */}
        <div style={styles.footer}>
          <div className="status-pulse" style={styles.dot} />
          <div style={styles.metaWrapper}>
            <Text style={styles.metaText}>
              NODE_ID: {nodeId} // ESTABLISHING_ENCRYPTED_LINK
            </Text>
            <Text style={styles.subMetaText}>
              SLDINTEGRATION_INDUSTRIAL_PROTOCOL_V.4.0.1 // SECURE_LAYER_ACTIVE
            </Text>
          </div>
        </div>
      </div>

      <style>{`
        /* Animasi Bar Bergerak dari Kiri ke Kanan */
        @keyframes shimmer-move {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-10%); }
          100% { transform: translateX(100%); }
        }

        .shimmer-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 70%; 
          height: 100%;
          background: linear-gradient(
            90deg, 
            transparent, 
            ${dmsTheme.colors.accent}, 
            transparent
          );
          animation: shimmer-move 1.5s infinite cubic-bezier(0.45, 0.05, 0.55, 0.95);
          box-shadow: 0 0 15px ${dmsTheme.colors.accent}60;
        }

        /* Animasi Titik Status (Glow) - Menggunakan Amber */
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 1; 
            filter: drop-shadow(0 0 2px ${dmsTheme.colors.accent}); 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            filter: drop-shadow(0 0 8px ${dmsTheme.colors.accent}); 
            transform: scale(0.9); 
          }
        }

        .status-pulse {
          animation: pulse-glow 2s infinite ease-in-out;
        }

        /* Animasi Teks Berkedip (...) */
        .loading-dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }

        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: dmsTheme.colors.background, // Slate 50
    zIndex: 99999,
    overflow: 'hidden',
  },
  backgroundBranding: {
    position: 'absolute',
    fontSize: '15vw',
    fontWeight: 900,
    color: dmsTheme.colors.primary, // Navy
    opacity: 0.04,
    letterSpacing: '-10px',
    userSelect: 'none',
    zIndex: -1,
    fontFamily: dmsTheme.fonts.main,
  },
  wrapper: { 
    width: '450px', 
    position: 'relative',
    padding: '40px',
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '14px',
    alignItems: 'center'
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  brandDot: {
    width: '12px',
    height: '12px',
    background: dmsTheme.colors.primary, // Navy Square
    borderRadius: '2px',
  },
  loadText: { 
    fontSize: '12px', 
    fontWeight: 900, 
    letterSpacing: '2px', 
    color: dmsTheme.colors.text.primary, // Navy Text
    fontFamily: dmsTheme.fonts.code,
  },
  statusText: { 
    fontSize: '11px', 
    fontWeight: 800, 
    color: dmsTheme.colors.accent, // Kuning Amber (Warning/Status)
    width: '90px',
    fontFamily: dmsTheme.fonts.code,
  },
  barContainer: { 
    height: '4px', 
    width: '100%', 
    background: dmsTheme.colors.border, // Slate 200
    position: 'relative',
    overflow: 'hidden',
    borderRadius: dmsTheme.radius.sm,
  },
  footer: { 
    marginTop: '24px', 
    display: 'flex', 
    alignItems: 'flex-start',
    gap: '15px',
  },
  dot: {
    marginTop: '6px',
    width: '8px', 
    height: '8px', 
    borderRadius: '50%', 
    background: dmsTheme.colors.accent, // Amber Glow
  },
  metaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metaText: { 
    fontSize: '10px', 
    letterSpacing: '0.5px', 
    fontWeight: 700,
    color: dmsTheme.colors.text.primary,
    fontFamily: dmsTheme.fonts.code,
    opacity: 0.7
  },
  subMetaText: { 
    fontSize: '9px', 
    letterSpacing: '1px', 
    fontWeight: 600,
    color: dmsTheme.colors.text.secondary, // Slate 500
    opacity: 0.5,
    fontFamily: dmsTheme.fonts.code,
  }
};