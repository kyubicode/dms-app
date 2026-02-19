import React, { useState } from 'react';
import { Typography, Divider, Space, Row, Col, ConfigProvider, message, Tabs, Button, Modal } from 'antd';
import { 
  AiOutlineBell, AiOutlineAlert, AiOutlineDatabase, 
  AiOutlineCloudSync, AiOutlineDesktop, AiOutlineSecurityScan, 
  AiOutlineSave, AiOutlineReload, AiOutlineConsoleSql,
  AiOutlineHistory, AiOutlineExpand
} from 'react-icons/ai';
import { FcDataConfiguration } from "react-icons/fc";
import { AuditLogViewer } from '../AuditLogViewer/AuditLogViewer';
import { RoleGuard } from '../Guards/RoleGuard';
import { SettingItem } from '../SettingItem/SettingItem';
import { SQLiteTerminal } from '../SQLiteTerminal/SQLiteTerminal';
import { ContentHeader } from '../ContentHeader/ContentHeader';

const { Title, Text } = Typography;

export const SettingsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [fullLogVisible, setFullLogVisible] = useState(false);

  const dividerPos = "left" as React.ComponentProps<typeof Divider>['orientation'];

  const tabItems = [
    {
      key: '1',
      label: <div className="tab-label-custom"><AiOutlineDesktop size={18} /> <span>Interface</span></div>,
      children: (
        <div style={localStyles.contentArea}>
          <div style={localStyles.sectionHeader}>
            <Title level={3} style={{ marginBottom: 4 }}>User Interface</Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>Atur preferensi tampilan dan kenyamanan visual aplikasi.</Text>
          </div>
          <Divider />
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <SettingItem icon={<AiOutlineDesktop size={20}/>} label="COMPACT_MODE" desc="Optimasi padding untuk kepadatan data tinggi." onChange={() => {}} />
            <SettingItem icon={<AiOutlineSave size={20}/>} label="AUTO_SAVE" desc="Sinkronisasi perubahan secara instan ke sistem." checked onChange={() => {}} />
            <SettingItem icon={<AiOutlineReload size={20}/>} label="ANIMATION" desc="Gunakan transisi halus pada navigasi antar menu." checked onChange={() => {}} />
          </Space>
        </div>
      )
    },
    {
      key: '2',
      label: <div className="tab-label-custom"><AiOutlineDatabase size={18} /> <span>Database</span></div>,
      children: (
        <div style={localStyles.contentArea}>
          <div style={localStyles.sectionHeader}>
            <Title level={3} style={{ marginBottom: 4 }}>Database System</Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>Manajemen engine SQLite dan sinkronisasi data cloud.</Text>
          </div>
          <Divider />
          <SettingItem icon={<AiOutlineCloudSync size={20}/>} label="REALTIME_SYNC" desc="Aktifkan sinkronisasi database secara otomatis." checked onChange={() => {}} />
          
          <Divider orientation={dividerPos} style={{ margin: '32px 0 20px', borderColor: '#f1f5f9' }}>
            <Text style={localStyles.dividerText}>ADMINISTRATIVE TOOLS</Text>
          </Divider>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="tool-card-pro" onClick={() => setIsTerminalOpen(true)}>
                <div className="tool-icon-circle sql"><AiOutlineConsoleSql size={22} /></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ fontSize: '14px' }}>SQL_TERMINAL</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Akses query database langsung</Text>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="tool-card-pro" onClick={() => message.loading("Backing up...")}>
                <div className="tool-icon-circle backup"><AiOutlineSave size={22} /></div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong style={{ fontSize: '14px' }}>BACKUP_DB</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Ekspor data ke format .sqlite</Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: '3',
      label: <div className="tab-label-custom"><AiOutlineSecurityScan size={18} /> <span>Security</span></div>,
      children: (
        <div style={localStyles.contentArea}>
          <div style={localStyles.sectionHeader}>
            <Title level={3} style={{ marginBottom: 4 }}>Security Protocol</Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>Konfigurasi perlindungan data dan enkripsi akses.</Text>
          </div>
          <Divider />
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <SettingItem icon={<AiOutlineBell size={20}/>} label="EMAIL_ALERT" desc="Notifikasi akses mencurigakan." checked onChange={() => {}} />
            <SettingItem icon={<AiOutlineAlert size={20}/>} label="MAINTENANCE" color="#f59e0b" desc="Kunci seluruh akses write ke database." onChange={() => {}} />
          </Space>
        </div>
      )
    },
    {
      key: '4',
      label: <div className="tab-label-custom"><AiOutlineHistory size={18} /> <span>Audit Log</span></div>,
      children: (
        <div style={localStyles.contentArea}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={localStyles.sectionHeader}>
              <Title level={3} style={{ marginBottom: 4 }}>System Audit</Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>Log kronologis seluruh operasi database.</Text>
            </div>
            <Button type="text" icon={<AiOutlineExpand />} onClick={() => setFullLogVisible(true)} style={{ color: '#64748b' }}>
              Fullscreen
            </Button>
          </div>
          <Divider style={{ margin: '16px 0 24px 0' }} />
          <div className="audit-viewer-container">
            {!fullLogVisible ? (
              <AuditLogViewer />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Text type="secondary">Viewer active in fullscreen mode...</Text>
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <RoleGuard allowedRole="admin">
      <ConfigProvider theme={{ token: { colorPrimary: '#38bdf8', borderRadius: 12 } }}>
        <div style={{ padding: '0px', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="settings-container-pro">
            <Tabs 
              tabPosition="top" // DIUBAH KE ATAS
              activeKey={activeTab} 
              onChange={setActiveTab} 
              items={tabItems} 
              className="settings-tabs-pro"
            />
          </div>

          {/* MODAL AUDIT LOG */}
          <Modal
            title={<Space><AiOutlineHistory /> SYSTEM AUDIT TRAIL</Space>}
            open={fullLogVisible}
            onCancel={() => setFullLogVisible(false)}
            width="95vw"
            zIndex={100000}
            footer={null}
            centered
            destroyOnClose
            bodyStyle={{ height: '85vh', padding: '16px', overflow: 'hidden', background: '#f8fafc' }}
          >
            <div style={{ height: '100%' }}>
               <AuditLogViewer />
            </div>
          </Modal>

          {/* MODAL TERMINAL */}
          <Modal
            open={isTerminalOpen}
            onCancel={() => { setIsTerminalOpen(false); setIsMaximized(false); }}
            footer={null}
            zIndex={100000}
            closable={false}
            width={isMaximized ? '100vw' : 1000}
            centered
            destroyOnClose
            className="terminal-modal-seamless"
            bodyStyle={{ padding: 0, backgroundColor: 'transparent' }} 
            maskStyle={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'none' }}
          >
            <div className="terminal-window-wrapper" style={{ 
              borderRadius: isMaximized ? 0 : '12px', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              background: '#0d1117'
            }}>
              <div className="terminal-custom-header">
                <Space size="middle">
                  <Space size={8} className="terminal-dots-group">
                    <div onClick={() => setIsTerminalOpen(false)} className="control-dot dot-close" />
                    <div onClick={() => setIsMaximized(false)} className="control-dot dot-min" />
                    <div onClick={() => setIsMaximized(!isMaximized)} className="control-dot dot-max" />
                  </Space>
                  <span style={localStyles.terminalHeaderText}>CORE CONSOLE TERMINAL - V1.0.4</span>
                </Space>
              </div>
              <SQLiteTerminal isMaximized={isMaximized} />
            </div>
          </Modal>
        </div>

        <style>{`
          /* 1. SEAMLESS TERMINAL FIX */
          .terminal-modal-seamless .ant-modal-container { background-color: transparent !important; }
          .terminal-modal-seamless .ant-modal-content {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .terminal-modal-seamless .ant-modal-body { padding: 0 !important; background: transparent !important; }

          /* 2. SETTINGS CONTAINER (HORIZONTAL TAB STYLE) */
          .settings-container-pro {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            min-height: 620px;
          }

          /* Styling untuk Navigasi Tab di Atas */
          .settings-tabs-pro .ant-tabs-nav {
            background: #f8fafc !important;
            margin: 0 !important;
            padding: 10px 24px 0 24px !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }

          .settings-tabs-pro .ant-tabs-nav::before {
            border-bottom: none !important;
          }

          .settings-tabs-pro .ant-tabs-tab {
            margin: 0 4px 0 0 !important;
            padding: 12px 20px !important;
            border-radius: 10px 10px 0 0 !important; /* Rounded hanya atas */
            transition: all 0.2s ease;
            background: transparent;
            border: 1px solid transparent !important;
            border-bottom: none !important;
          }

          .settings-tabs-pro .ant-tabs-tab-active {
            background: #fff !important;
            border-color: #e2e8f0 !important;
            position: relative;
            z-index: 2;
          }

          /* Hilangkan garis biru bawaan antd agar lebih clean */
          .settings-tabs-pro .ant-tabs-ink-bar {
            height: 3px !important;
            border-radius: 3px 3px 0 0;
          }

          .tab-label-custom { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; }

          /* 3. TOOLS CARD */
          .tool-card-pro {
            display: flex; align-items: center; gap: 16px; padding: 20px;
            background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
            cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .tool-card-pro:hover {
            border-color: #38bdf8; 
            background: #f0f9ff;
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(56, 189, 248, 0.1);
          }

          .tool-icon-circle { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .tool-icon-circle.sql { background: #eff6ff; color: #3b82f6; }
          .tool-icon-circle.backup { background: #f0fdf4; color: #22c55e; }

          /* 4. AUDIT VIEW CONTAINER */
          .audit-viewer-container {
            height: 450px; 
            background: #f8fafc; 
            border-radius: 12px;
            border: 1px solid #e2e8f0; 
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }

          /* 5. TERMINAL INTERNAL */
          .terminal-window-wrapper { background: #0d1117; border: 1px solid #30363d; }
          .terminal-custom-header { 
            display: flex; 
            align-items: center; 
            width: 100%; 
            background: #161b22; 
            padding: 12px 16px; 
            border-bottom: 1px solid #30363d;
          }
          .control-dot { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; transition: opacity 0.2s; }
          .control-dot:hover { opacity: 0.8; }
          .dot-close { background: #ff5f56; border: none !important; }
          .dot-min { background: #ffbd2e; border: none !important; }
          .dot-max { background: #27c93f; border: none !important; }
        `}</style>
      </ConfigProvider>
    </RoleGuard>
  );
};

const localStyles: Record<string, React.CSSProperties> = {
  contentArea: { padding: '32px 40px', flex: 1 },
  sectionHeader: { marginBottom: '12px' },
  dividerText: { fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase' },
  terminalHeaderText: { fontSize: '11px', color: '#8b949e', fontWeight: 600, fontFamily: "JetBrains Mono, monospace", marginLeft: '8px' },
};