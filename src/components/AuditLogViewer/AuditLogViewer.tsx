import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Tag, Empty, Button, Space, Tooltip, Badge } from 'antd';
import { 
  AiOutlineSync, 
  AiOutlineCloudDownload, 
  AiOutlineDelete, 
  AiOutlineInfoCircle 
} from 'react-icons/ai';
import { VscTerminal, VscPulse } from "react-icons/vsc";

const { Text } = Typography;

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await (window as any).api.execute('db:get-audit-logs');
      if (response.success) {
        setLogs(response.data);
      }
    } catch (err) {
      console.error("IPC Connection Error:", err);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  }, []);

  const clearLogs = async () => {
    // Menggunakan alert yang lebih cantik jika memungkinkan, namun tetap menggunakan logic asli anda
    if (confirm("Hapus semua riwayat aktivitas? Tindakan ini tidak bisa dibatalkan.")) {
      const res = await (window as any).api.execute('db:clear-logs');
      if (res.success) fetchLogs();
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes pulse-soft {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .log-container-v4::-webkit-scrollbar { width: 6px; }
        .log-container-v4::-webkit-scrollbar-track { background: transparent; }
        .log-container-v4::-webkit-scrollbar-thumb { 
          background: #334155; 
          border-radius: 10px; 
        }
        .log-row-v4 {
          position: relative;
          border-left: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .log-row-v4:hover {
          background: rgba(56, 189, 248, 0.04) !important;
          border-left: 2px solid #38bdf8;
          padding-left: 12px !important;
        }
        .loading-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={iconBadgeStyle}>
            <VscTerminal style={{ color: '#38bdf8', fontSize: '20px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text style={headerTitleStyle}>SYSTEM_AUDIT_TRAIL</Text>
              <Badge status="processing" color="#10b981" />
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', letterSpacing: '1px' }}>
              SECURE_ENCRYPTED_LOG_STREAM
            </div>
          </div>
        </div>
        
        <Space size="small" style={toolbarStyle}>
          <Tooltip title="Refresh Stream">
            <Button 
              className="btn-pro"
              icon={<AiOutlineSync className={loading ? 'loading-spin' : ''} />} 
              onClick={fetchLogs}
              style={ghostButtonStyle}
            />
          </Tooltip>
          <Tooltip title="Export Data">
            <Button 
              icon={<AiOutlineCloudDownload />} 
              style={ghostButtonStyle}
            />
          </Tooltip>
          <div style={dividerStyle} />
          <Button 
            danger 
            type="text"
            icon={<AiOutlineDelete />} 
            onClick={clearLogs}
            style={{ fontWeight: 600, fontSize: '12px' }}
          >
            PURGE
          </Button>
        </Space>
      </div>

      {/* LOG TERMINAL SECTION */}
      <div className="log-container-v4" style={logScrollStyle}>
        {/* Subtle Scanline Overlay */}
        <div style={scanOverlayStyle} />

        {logs.length === 0 && !loading ? (
          <div style={emptyStateStyle}>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<span style={{ color: '#475569', fontFamily: 'monospace' }}>[ NO_SESSION_DATA_AVAILABLE ]</span>} 
            />
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="log-row-v4" style={logLineStyle}>
              {/* STATUS INDICATOR */}
              <div style={{ ...statusDotStyle, background: log.status?.includes('SUCCESS') ? '#10b981' : '#ef4444' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={timestampStyle}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString('en-GB') : '00:00:00'}
                  </span>
                  
                  <div style={actorTagStyle}>
                    <span style={{ color: '#38bdf8', opacity: 0.7 }}>USR::</span>
                    {log.username || 'root'}
                  </div>

                  <Tag color={log.status?.includes('SUCCESS') ? 'cyan' : 'red'} style={compactTagStyle}>
                    {log.status?.replace('_SUCCESS', '')}
                  </Tag>
                </div>

                <div style={queryContentStyle}>
                  <Text style={queryTextStyle}>
                    {log.query}
                  </Text>
                </div>

                {log.error && (
                  <div style={errorBoxStyle}>
                    <AiOutlineInfoCircle style={{ marginTop: '3px' }} />
                    <span>{log.error}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER STATS */}
      <div style={footerStatusStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <VscPulse style={{ animation: 'pulse-soft 2s infinite', color: '#10b981' }} />
          <span>LIVE_MONITOR_ACTIVE</span>
        </div>
        <span>TOTAL_ENTRIES: {logs.length}</span>
      </div>
    </div>
  );
};

// --- ENHANCED STYLES ---

const containerStyle: React.CSSProperties = {
  display: 'flex', 
  flexDirection: 'column', 
  height: '100%',
  padding: '16px',
  background: '#0f172a', // Slate 900
};

const headerStyle: React.CSSProperties = {
  display: 'flex', 
  justifyContent: 'space-between', 
  marginBottom: '20px', 
  alignItems: 'center',
  padding: '0 8px'
};

const iconBadgeStyle: React.CSSProperties = {
  background: 'rgba(56, 189, 248, 0.1)',
  padding: '10px',
  borderRadius: '12px',
  border: '1px solid rgba(56, 189, 248, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const headerTitleStyle: React.CSSProperties = {
  fontSize: '14px', 
  fontWeight: 800, 
  color: '#f1f5f9', 
  letterSpacing: '2px', 
  fontFamily: 'monospace'
};

const toolbarStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  padding: '4px 12px',
  borderRadius: '10px',
  border: '1px solid #1e293b'
};

const ghostButtonStyle: React.CSSProperties = {
  color: '#94a3b8',
  background: 'transparent',
  border: 'none',
  fontSize: '16px',
  display: 'flex',
  alignItems: 'center'
};

const dividerStyle: React.CSSProperties = {
  width: '1px',
  height: '20px',
  background: '#334155',
  margin: '0 8px'
};

const logScrollStyle: React.CSSProperties = {
  background: '#020617', // Deepest Black
  padding: '20px',
  borderRadius: '14px',
  flex: 1,
  overflowY: 'auto',
  border: '1px solid #1e293b',
  position: 'relative',
  boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)'
};

const scanOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'linear-gradient(to bottom, transparent, rgba(56, 189, 248, 0.02) 50%, transparent)',
  backgroundSize: '100% 4px',
  zIndex: 10,
  pointerEvents: 'none'
};

const logLineStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  padding: '12px 16px',
  marginBottom: '4px',
  borderRadius: '8px',
  background: 'rgba(15, 23, 42, 0.4)',
  alignItems: 'flex-start',
};

const statusDotStyle: React.CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  marginTop: '8px',
  boxShadow: '0 0 10px rgba(0,0,0,0.5)'
};

const timestampStyle: React.CSSProperties = {
  color: '#475569', 
  fontSize: '11px', 
  fontFamily: 'monospace',
  fontWeight: 600
};

const actorTagStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#f8fafc',
  fontFamily: 'monospace',
  background: '#1e293b',
  padding: '2px 8px',
  borderRadius: '4px',
  border: '1px solid #334155'
};

const compactTagStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: 800,
  border: 'none',
  borderRadius: '4px',
  lineHeight: '16px',
  margin: 0
};

const queryContentStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.2)',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.03)',
  width: '100%'
};

const queryTextStyle: React.CSSProperties = {
  color: '#e2e8f0', 
  fontSize: '13px', 
  fontFamily: "'JetBrains Mono', monospace",
  wordBreak: 'break-all'
};

const errorBoxStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  color: '#f87171', 
  fontSize: '11px', 
  marginTop: '4px', 
  fontFamily: 'monospace',
  background: 'rgba(239, 68, 68, 0.08)',
  padding: '6px 12px',
  borderRadius: '6px',
  borderLeft: '2px solid #ef4444'
};

const emptyStateStyle: React.CSSProperties = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.5
};

const footerStatusStyle: React.CSSProperties = {
  marginTop: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '10px',
  color: '#475569',
  fontFamily: 'monospace',
  padding: '0 8px'
};