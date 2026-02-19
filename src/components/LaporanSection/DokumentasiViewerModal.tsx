import React, { useEffect, useState } from 'react';
import {
  Modal, Card, Row, Col, Image, Empty, Spin, Typography,
  Input, Button, Space, message, Tooltip, Divider, Tag, Popconfirm
} from 'antd';
import { 
  HiOutlineTrash, 
  HiOutlinePencilSquare,
  HiOutlineFolder,
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineCheck,
} from 'react-icons/hi2';
import { TbLoaderQuarter, TbCameraPlus, TbFolderX } from "react-icons/tb";
import { MdStorage } from "react-icons/md";
import { dmsTheme } from '@/styles/dms.theme'; // Import dmsTheme utuh

const { Title, Text } = Typography;

// --- INTERFACES ---
interface FileDetail {
  path: string;
  name?: string;
}

interface DokumentasiGroup {
  nama_dokumentasi: string;
  files: FileDetail[];
}

interface LaporanData {
  id_laporan: string | number;
  nama_laporan: string;
}

interface Props {
  open: boolean;
  laporan: LaporanData | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export const DokumentasiViewerModal: React.FC<Props> = ({ open, laporan, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DokumentasiGroup[]>([]);
  const [editingDok, setEditingDok] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const loadingIcon = <TbLoaderQuarter className="spin-icon" style={{ fontSize: 38, color: dmsTheme.colors.primary }} />;

  const fetchDokumentasi = async () => {
    if (!laporan) return;
    setLoading(true);
    try {
      const res = await (window as any).api.getDokumentasiByLaporan(laporan.id_laporan);
      setData(res || []);
    } catch (err) {
      message.error('DATABASE_SYNC_FAILED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchDokumentasi();
  }, [open, laporan]);

  const handleAddFoto = async (nama_dokumentasi: string) => {
    if (!laporan) return;
    try {
      const files = await (window as any).api.selectFiles();
      if (!files || files.length === 0) return;

      await (window as any).api.addFotoToDokumentasi({
        id_laporan: laporan.id_laporan,
        nama_dokumentasi,
        files,
      });
      message.success('ASSET_INJECTED_SUCCESSFULLY');
      fetchDokumentasi();
      onRefresh?.(); 
    } catch (err) {
      message.error('INJECTION_FAILED');
    }
  };

  const handleDeleteFoto = async (path: string) => {
    try {
      await (window as any).api.deleteFoto(path);
      message.success('FILE_DELETED_FROM_STORAGE');
      fetchDokumentasi();
      onRefresh?.();
    } catch (err) {
      message.error('DELETION_FAILED');
    }
  };

  const handleRename = async (oldName: string) => {
    if (!laporan || !newName.trim()) return message.warning('INPUT_REQUIRED');
    try {
      await (window as any).api.renameDokumentasi(laporan.id_laporan, oldName, newName);
      message.success('METADATA_UPDATED');
      setEditingDok(null);
      fetchDokumentasi();
    } catch (err) {
      message.error('RENAME_OPERATION_FAILED');
    }
  };

  const handleDeleteGroup = (nama_dokumentasi: string) => {
    if (!laporan) return;
    Modal.confirm({
      title: 'TERMINATE DOCUMENTATION UNIT?',
      icon: <TbFolderX size={32} style={{ color: dmsTheme.colors.status.danger }} />,
      content: `Aksi ini akan menghapus seluruh folder "${nama_dokumentasi}" dan isinya secara permanen.`,
      okText: 'CONFIRM TERMINATION',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          const res = await (window as any).api.deleteDokumentasi(laporan.id_laporan, nama_dokumentasi);
          if (res.success) {
            message.success('UNIT_CLEARED_SUCCESSFULLY');
            fetchDokumentasi();
            onRefresh?.();
          }
        } catch (err) {
          message.error('TERMINATION_FAILED');
        }
      }
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      zIndex={1100}
      style={{ top: 20 }}
      bodyStyle={{ padding: 0, background: '#f8fafc' }}
      closeIcon={<HiOutlineXMark size={22} />}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ borderLeft: `5px solid ${dmsTheme.colors.accent}`, paddingLeft: 18 }}>
            <Space size={6}>
              <MdStorage style={{ color: dmsTheme.colors.primary, marginBottom: -4 }} size={20} />
              <Text strong style={{ color: dmsTheme.colors.primary, fontSize: '10px', letterSpacing: '2px', fontFamily: dmsTheme.fonts.code }}>
                ARSIP_STORAGE // VIEWER_MODE
              </Text>
            </Space>
            <Title level={3} style={{ margin: 0, fontWeight: 800, color: dmsTheme.colors.text.primary, letterSpacing: '-0.5px' }}>
              {laporan?.nama_laporan?.toUpperCase() || 'UNIDENTIFIED_REPORT'}
            </Title>
          </div>
          <div style={{ paddingRight: 32 }}>
            <Tag color="blue" style={{ borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: dmsTheme.fonts.code }}>
              NODE_ID: {laporan?.id_laporan || '---'}
            </Tag>
          </div>
        </div>
      }
    >
      <div style={{ minHeight: '60vh', maxHeight: '78vh', overflowY: 'auto', padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px 0' }}>
            <Spin indicator={loadingIcon} />
            <Text strong style={{ display: 'block', marginTop: 20, color: dmsTheme.colors.primary, letterSpacing: '1px', fontFamily: dmsTheme.fonts.code }}>SYNCHRONIZING_RESOURCES...</Text>
          </div>
        ) : data.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="NO_DOCUMENTATION_RECORDS_AVAILABLE" />
        ) : (
          data.map((group, idx) => (
            <Card
              key={idx}
              size="small"
              bordered={false}
              className="industrial-card"
              style={{ marginBottom: 28, borderRadius: '8px', overflow: 'hidden' }}
              headStyle={{ background: dmsTheme.colors.primary, color: '#fff', border: 'none', minHeight: 48 }}
              title={
                editingDok === group.nama_dokumentasi ? (
                  <Space>
                    <Input 
                      size="small" 
                      value={newName} 
                      autoFocus
                      onChange={(e) => setNewName(e.target.value)} 
                      style={{ width: 220, borderRadius: 4, border: 'none', fontWeight: 700 }} 
                      onPressEnter={() => handleRename(group.nama_dokumentasi)}
                    />
                    <Button type="primary" size="small" icon={<HiOutlineCheck />} onClick={() => handleRename(group.nama_dokumentasi)} style={{ background: dmsTheme.colors.status.success, border: 'none' }} />
                    <Button size="small" ghost icon={<HiOutlineXMark />} onClick={() => setEditingDok(null)} />
                  </Space>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="middle">
                      <HiOutlineFolder style={{ color: dmsTheme.colors.accent }} size={20} />
                      <Text style={{ color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: dmsTheme.fonts.main }}>
                        {group.nama_dokumentasi.toUpperCase()}
                      </Text>
                      <Tag style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontSize: '10px', fontFamily: dmsTheme.fonts.code }}>{group.files.length} ITEMS</Tag>
                    </Space>
                    <Space size={12}>
                      <Tooltip title="Rename Folder">
                        <Button className="action-btn-ghost" icon={<HiOutlinePencilSquare size={18} />} onClick={() => { setEditingDok(group.nama_dokumentasi); setNewName(group.nama_dokumentasi); }} />
                      </Tooltip>
                      <Tooltip title="Upload Asset">
                        <Button className="action-btn-ghost" icon={<TbCameraPlus size={20} style={{ color: dmsTheme.colors.accent }} />} onClick={() => handleAddFoto(group.nama_dokumentasi)} />
                      </Tooltip>
                      <Divider type="vertical" style={{ background: 'rgba(255,255,255,0.15)', height: 20 }} />
                      <Button type="text" danger size="small" className="terminate-btn" onClick={() => handleDeleteGroup(group.nama_dokumentasi)}>
                        <Space size={4}><TbFolderX size={16} /> <Text style={{ color: '#fca5a5', fontSize: '11px', fontWeight: 900 }}>TERMINATE</Text></Space>
                      </Button>
                    </Space>
                  </div>
                )
              }
            >
              <Row gutter={[14, 14]} style={{ padding: '16px 8px' }}>
                {group.files.map((file, i) => (
                  <Col key={i} xs={12} sm={8} md={6} lg={4}>
                    <div className="asset-frame">
                      <Image
                        src={`file://${file.path}`}
                        preview={{ mask: <div className="img-mask"><HiOutlinePhoto size={24} /> <Text style={{color:'#fff', fontSize:'10px', fontFamily: dmsTheme.fonts.code}}>PREVIEW</Text></div> }}
                        style={{ width: '100%', height: 130, objectFit: 'cover' }}
                      />
                      <div className="asset-ops">
                        <Popconfirm 
                          title="Remove asset?" 
                          okText="Delete" 
                          onConfirm={() => handleDeleteFoto(file.path)}
                          okButtonProps={{ danger: true }}
                        >
                          <Button 
                            danger 
                            size="small" 
                            className="delete-btn-hover"
                            icon={<HiOutlineTrash size={16} />} 
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          ))
        )}
      </div>

      <style>{`
        .ant-modal-content { border-radius: 12px !important; border-top: 6px solid ${dmsTheme.colors.primary}; padding: 0 !important; overflow: hidden; }
        .ant-modal-header { padding: 16px 24px; border-bottom: 1px solid ${dmsTheme.colors.border} !important; margin-bottom: 0 !important; }
        .industrial-card { border: 1px solid ${dmsTheme.colors.border}; transition: 0.3s; }
        .action-btn-ghost { background: transparent; border: none; color: rgba(255,255,255,0.6); transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .action-btn-ghost:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .terminate-btn { border: 1px solid rgba(248, 113, 113, 0.2); transition: 0.3s; }
        .terminate-btn:hover { background: rgba(248, 113, 113, 0.1) !important; border-color: ${dmsTheme.colors.status.danger}; }
        .asset-frame { position: relative; border: 1px solid ${dmsTheme.colors.border}; padding: 4px; background: #fff; transition: 0.3s; border-radius: 4px; }
        .asset-frame:hover { border-color: ${dmsTheme.colors.primary}; transform: translateY(-2px); box-shadow: ${dmsTheme.shadow.card}; }
        .img-mask { display: flex; flex-direction: column; align-items: center; gap: 8px; font-weight: 800; }
        .asset-ops { position: absolute; top: 8px; right: 8px; opacity: 0; transition: 0.2s; z-index: 10; }
        .asset-frame:hover .asset-ops { opacity: 1; }
        .delete-btn-hover { border-radius: 4px; border: none; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .spin-icon { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${dmsTheme.colors.primary}; }
      `}</style>
    </Modal>
  );
};