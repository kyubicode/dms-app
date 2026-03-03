import React from 'react';
import { Typography, ConfigProvider } from 'antd';

const { Text } = Typography;

export default function LoadingScreen() {
  // Generate random ID sekali saat render
  const nodeId = React.useMemo(() => Math.random().toString(16).substring(2, 8).toUpperCase(), []);

  return (
    <div style={styles.overlay}>
      {/* Background Mesh Gradient yang sama dengan Login */}
      <div style={styles.meshBackground} />
      
      <div style={styles.glassBox} className="loading-card-appear">
        <div style={styles.wrapper}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.brandBox}>
              <div className="pulse-dot" style={styles.brandDot} />
              <Text style={styles.loadText}>SYSTEM_BOOT</Text>
            </div>
            <Text className="loading-dots" style={styles.statusText}>
              VERIFYING
            </Text>
          </div>

          {/* Progress Bar Container */}
          <div style={styles.barContainer}>
            <div className="shimmer-bar" />
          </div>

          {/* Technical Metadata */}
          <div style={styles.footer}>
            <div style={styles.metaWrapper}>
              <Text style={styles.metaText}>
                NODE_ID: {nodeId} // SECURE_CHANNEL_ESTABLISHED
              </Text>
              <Text style={styles.subMetaText}>
                ZEN-CORE ENGINE V2.0.4 // HYPERVISOR_ACTIVE
              </Text>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .loading-card-appear {
          animation: cardAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardAppear {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes shimmer-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(150%); }
        }

        .shimmer-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 60%; 
          height: 100%;
          background: linear-gradient(
            90deg, 
            transparent, 
            #007AFF, 
            transparent
          );
          animation: shimmer-move 1.2s infinite ease-in-out;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px #007AFF; }
          50% { opacity: 0.4; box-shadow: 0 0 12px #007AFF; }
        }

        .pulse-dot {
          animation: pulse-glow 1.5s infinite ease-in-out;
        }

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    zIndex: 999999,
    overflow: 'hidden',
  },
  meshBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(at 0% 0%, #c2e9fb 0%, transparent 50%), radial-gradient(at 100% 0%, #a1c4fd 0%, transparent 50%), radial-gradient(at 100% 100%, #fbc2eb 0%, transparent 50%), radial-gradient(at 0% 100%, #e6dee9 0%, transparent 50%)',
    zIndex: -1,
  },
  glassBox: {
    width: '400px',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(30px) saturate(180%)',
    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
    borderRadius: '28px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
  },
  wrapper: { 
    padding: '30px',
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '20px',
    alignItems: 'center'
  },
  brandBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  brandDot: {
    width: '8px',
    height: '8px',
    background: '#007AFF',
    borderRadius: '50%',
  },
  loadText: { 
    fontSize: '11px', 
    fontWeight: 700, 
    letterSpacing: '1px', 
    color: '#1d1d1f',
    opacity: 0.8,
  },
  statusText: { 
    fontSize: '10px', 
    fontWeight: 600, 
    color: '#007AFF',
    width: '70px',
    textAlign: 'right'
  },
  barContainer: { 
    height: '3px', 
    width: '100%', 
    background: 'rgba(0, 0, 0, 0.05)', 
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '10px',
  },
  footer: { 
    marginTop: '20px', 
  },
  metaWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  metaText: { 
    fontSize: '9px', 
    fontWeight: 600,
    color: '#1d1d1f',
    opacity: 0.5,
    fontFamily: 'monospace'
  },
  subMetaText: { 
    fontSize: '8px', 
    fontWeight: 500,
    color: '#1d1d1f',
    opacity: 0.3,
    fontFamily: 'monospace'
  }
};