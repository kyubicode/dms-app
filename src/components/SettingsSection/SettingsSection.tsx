import React, { useState, useEffect } from 'react';
import { 
  Typography, Divider, Row, Col, ConfigProvider, 
  Button, ColorPicker, Select, Input, InputNumber, Modal, Space, Tabs, App 
} from 'antd';
import { 
  AiOutlineConsoleSql, AiOutlineFileText, AiOutlineBgColors, 
  AiOutlineLayout, AiOutlineHistory, AiOutlineReload,
  AiOutlineExpand, AiOutlineFontSize,
  AiOutlineFontColors,
  AiOutlineLineHeight
} from 'react-icons/ai';
import { FcSettings  } from "react-icons/fc";
import { GrDocumentText,} from "react-icons/gr";

import { FcExport,FcCommandLine,FcClock,FcRules  } from "react-icons/fc";
import { AuditLogViewer } from '../AuditLogViewer/AuditLogViewer';
import { RoleGuard } from '../Guards/RoleGuard';
import { SQLiteTerminal } from '../SQLiteTerminal/SQLiteTerminal';
import { SettingItem } from './SettingItem';
import { localStyles, globalSettingsCss } from './Settings.styles';

const { Title, Text } = Typography;

export const SettingsSection: React.FC = () => {
  const { message: msgApi } = App.useApp();
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  
  // Semua key di sini harus sama dengan yang dipanggil di ipcMain (config.nama_key)
  const [layout, setLayout] = useState({
    pageSize: 'a4', 
    columns: 3, 
    imgHeight: 45, 
    imgHeightUnit: 'mm',
    gap: 10, 
    gapUnit: 'mm', 
    rowGap: 15, 
    textGap: 5,
    marginPage: 20, 
    marginPageUnit: 'mm',
    headerColor: '#1F4E78', 
    fontColor: '#333333', 
    titleSize: 24,         
    descSize: 8, 
    objectFit: 'contain', 
    judulLaporan: 'LAPORAN DOKUMENTASI PEKERJAAN' 
  });

  const electronAPI = (window as any).electron;

  useEffect(() => {
    const loadSettings = async () => {
      if (!electronAPI) return;
      try {
        const savedSettings = await electronAPI.invoke('settings:get');
        // Merge saved settings ke default layout
        if (savedSettings) setLayout(prev => ({ ...prev, ...savedSettings }));
      } catch (err) { 
        console.error("Sync Error:", err); 
      }
    };
    loadSettings();
  }, [electronAPI]);

  const updateLayout = async (newData: Partial<typeof layout>) => {
    const updated = { ...layout, ...newData };
    setLayout(updated);
    if (electronAPI) {
      try { 
        await electronAPI.invoke('settings:save', updated); 
      } catch (err) { 
        msgApi.error("Gagal simpan konfigurasi ke sistem"); 
      }
    }
  };

  const renderDocumentTab = () => (
    <div style={localStyles.tabContent}>
      <Row gutter={[64, 0]}>
        <Col span={12}>
          <Divider orientation={"left" as any} plain>
            <Text strong style={localStyles.dividerText}>TATA LETAK DOKUMEN LAPORAN</Text>
          </Divider>
          <SettingItem 
            icon={<GrDocumentText />} label="Ukuran Kertas" desc="Format standar PDF ekspor."
            extra={<Select value={layout.pageSize} onChange={(v) => updateLayout({ pageSize: v })} style={{ width: 160 }} options={[{value:'a4', label:'A4 Standard'}, {value:'legal', label:'Legal'}]} />}
          />
          <SettingItem 
            icon={<AiOutlineLayout />} label="Kolom Foto" desc="Jumlah grid foto per baris."
            extra={<InputNumber min={1} max={6} value={layout.columns} onChange={(v) => updateLayout({ columns: v ?? 3 })} addonAfter="Col" />}
          />
          <SettingItem 
            icon={<AiOutlineExpand />} label="Tinggi Frame" desc="Dimensi vertikal bingkai foto."
            extra={<Space.Compact><InputNumber min={0} value={layout.imgHeight} onChange={(v) => updateLayout({ imgHeight: v ?? 45 })} style={{ width: 80 }} /><Select value={layout.imgHeightUnit} onChange={(v) => updateLayout({ imgHeightUnit: v })} options={[{value:'mm',label:'mm'}]} /></Space.Compact>}
          />
          <Divider orientation={"left" as any} plain>
            <Text strong style={localStyles.dividerText}>SPASI & PROPORSI</Text>
          </Divider>
          <SettingItem 
            icon={<AiOutlineLayout />} label="Jarak Baris" desc="Spasi vertikal antar baris foto."
            extra={<InputNumber min={0} value={layout.rowGap} onChange={(v) => updateLayout({ rowGap: v ?? 15 })} addonAfter="mm" />}
          />
          <SettingItem 
            icon={<AiOutlineExpand />} label="Margin Halaman" desc="Jarak tepi kertas (kiri/kanan/atas)."
            extra={<InputNumber min={5} value={layout.marginPage} onChange={(v) => updateLayout({ marginPage: v ?? 20 })} addonAfter="mm" />}
          />
        </Col>

        <Col span={12}>
          <Divider orientation={"left" as any} plain>
            <Text strong style={localStyles.dividerText}>BRANDING & TIPOGRAFI</Text>
          </Divider>
          <SettingItem 
            icon={<AiOutlineFileText />} label="Sub-Judul Laporan" desc="Teks di bawah nama laporan utama." 
            extra={<Input value={layout.judulLaporan} onChange={(e) => updateLayout({ judulLaporan: e.target.value })} style={{ width: 220 }} />} 
          />
          <SettingItem 
            icon={<AiOutlineFontSize />} label="Font Judul" desc="Ukuran teks header utama (pt)." 
            extra={<InputNumber min={8} value={layout.titleSize} onChange={(v) => updateLayout({ titleSize: v ?? 24 })} addonAfter="pt" />} 
          />
          <SettingItem 
            icon={<AiOutlineFontSize />} label="Font Deskripsi" desc="Ukuran teks di bawah gambar." 
            extra={<InputNumber min={6} value={layout.descSize} onChange={(v) => updateLayout({ descSize: v ?? 8 })} addonAfter="pt" />} 
          />
          <SettingItem 
            icon={<AiOutlineBgColors />} label="Warna Header" desc="Warna aksen bar deskripsi." 
            extra={<ColorPicker value={layout.headerColor} onChange={(c) => updateLayout({ headerColor: c.toHexString() })} showText />} 
          />
          <SettingItem 
            icon={<AiOutlineLineHeight />} label="Jarak Teks" desc="Jarak antara foto dengan deskripsi."
            extra={<InputNumber min={0} max={20} value={layout.textGap} onChange={(v) => updateLayout({ textGap: v ?? 5 })} addonAfter="mm" />}
          />
          <SettingItem 
            icon={<AiOutlineFontColors />} label="Warna Font" desc="Warna teks utama & nama file." 
            extra={<ColorPicker value={layout.fontColor} onChange={(c) => updateLayout({ fontColor: c.toHexString() })} showText />} 
          />
        </Col>
      </Row>
    </div>
  );

  const tabItems = [
    { key: 'document', label: <span style={localStyles.tabLabel}><FcRules  size={20} /> Dokumen</span>, children: renderDocumentTab() },
    { key: 'database', label: <span style={localStyles.tabLabel}><FcCommandLine  size={20} /> Data Access</span>, children: (
        <div style={localStyles.tabContent}>
          <div style={localStyles.actionBox}>
            <div style={{ background: '#e0f2fe', padding: '15px', borderRadius: '12px' }}><AiOutlineConsoleSql size={32} style={{ color: '#0ea5e9' }} /></div>
            <div style={{ flex: 1 }}><Title level={4} style={{ margin: 0 }}>Advanced SQL Engine</Title><Text type="secondary">Akses langsung database core sistem untuk pemeliharaan.</Text></div>
            <Button type="primary" size="large" onClick={() => setIsTerminalOpen(true)}>Buka Terminal</Button>
          </div>
        </div>
    )},
    { key: 'activity', label: <span style={localStyles.tabLabel}><FcClock size={20} /> Aktivitas</span>, children: (
        <div style={localStyles.tabContent}>
          <div style={localStyles.actionBox}>
            <div style={{ background: '#ffe4e6', padding: '15px', borderRadius: '12px' }}><AiOutlineHistory size={32} style={{ color: '#f43f5e' }} /></div>
            <div style={{ flex: 1 }}><Title level={4} style={{ margin: 0 }}>Audit Trail Viewer</Title><Text type="secondary">Rekaman log aktivitas krusial sistem.</Text></div>
            <Button size="large" onClick={() => setIsAuditLogOpen(true)}>Buka Audit Log</Button>
          </div>
        </div>
    )}
  ];

  return (
    <RoleGuard allowedRole="admin">
      <ConfigProvider theme={{ token: { colorPrimary: '#38bdf8', borderRadius: 12 } }}>
        <style>{`
          ${globalSettingsCss}
          .dark-terminal-modal .ant-modal-content { background-color: #0d1117 !important; padding: 0 !important; border: 1px solid #30363d; overflow: hidden; }
          .dark-terminal-modal .ant-modal-header { background-color: #161b22 !important; border-bottom: 1px solid #30363d; padding: 12px 20px !important; margin: 0 !important; }
          .dark-terminal-modal .ant-modal-title { color: #8b949e !important; }
          .dark-terminal-modal .ant-modal-close { color: #8b949e !important; }
        `}</style>
        <div style={localStyles.mainCard}>
          <div style={localStyles.pageHeader}>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}><FcSettings size={40} />System Settings</Title>
            <Button danger ghost icon={<AiOutlineReload />} onClick={() => updateLayout({ judulLaporan: 'LAPORAN DOKUMENTASI PEKERJAAN', headerColor: '#1F4E78', fontColor: '#333333', titleSize: 24, descSize: 8, columns: 3, rowGap: 15, marginPage: 20, objectFit: 'contain', pageSize: 'a4' })}>Reset Default</Button>
          </div>
          <Tabs className="settings-tabs" defaultActiveKey="document" items={tabItems} />
        </div>

        <Modal 
          title="SQL MASTER CONSOLE" 
          open={isTerminalOpen} 
          onCancel={() => setIsTerminalOpen(false)} 
          width="96vw" footer={null} centered destroyOnClose zIndex={9999}
          className="dark-terminal-modal"
          styles={{ body: { padding: 0, backgroundColor: '#0d1117' } }}
        >
          <div style={{ height: '85vh' }}>
            <SQLiteTerminal isMaximized={true} />
          </div>
        </Modal>

        <Modal
          title="SYSTEM AUDIT TRAIL" 
           className="dark-terminal-modal"
          open={isAuditLogOpen} onCancel={() => setIsAuditLogOpen(false)}
          width="92vw" footer={null} centered destroyOnClose zIndex={9999}
          styles={{ body: { padding: 0, height: '80vh', backgroundColor: '#ffffff' } }}>
          <AuditLogViewer />
        </Modal>
      </ConfigProvider>
    </RoleGuard>
  );
};