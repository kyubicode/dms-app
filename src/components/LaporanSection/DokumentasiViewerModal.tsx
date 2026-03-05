import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal, Card, Row, Col, Image, Empty, Spin, Typography,
  Input, Button, Space, message, Tag, Popconfirm
} from 'antd';
import { 
  HiOutlineTrash, HiOutlinePencilSquare,
} from 'react-icons/hi2';
import { TbLoaderQuarter, TbCameraPlus } from "react-icons/tb";

// --- Gunakan dmsTheme Anda ---
const THEME_ACCENT = '#3b82f6'; 

interface FileDetail {
  path: string;    
  rawPath: string; 
  name?: string;
}

interface DokumentasiGroup {
  id_dokumentasi: number | string;
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
  zIndex?: number;
}

export const DokumentasiViewerModal: React.FC<Props> = ({ open, laporan, onClose, onRefresh, zIndex = 900 }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DokumentasiGroup[]>([]);
  const [editingDok, setEditingDok] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const electronAPI = (window as any).electron;
  const loadingIcon = <TbLoaderQuarter className="spin-icon" style={{ fontSize: 38, color: THEME_ACCENT }} />;

  // 1. FETCH DATA
  const fetchDokumentasi = useCallback(async () => {
    if (!laporan || !electronAPI) return;
    setLoading(true);
    try {
      const res = await electronAPI.invoke('laporan:getDokumentasiByLaporan', laporan.id_laporan);
      setData(res || []);
    } catch (err) {
      message.error('Gagal sinkronisasi data');
    } finally {
      setLoading(false);
    }
  }, [laporan, electronAPI]);

  useEffect(() => {
    if (open) fetchDokumentasi();
  }, [open, fetchDokumentasi]);

  // 2. TAMBAH FOTO
  const handleAddFoto = async (id_dokumentasi: number | string) => {
    try {
      const files = await electronAPI.invoke('select-files');
      if (!files || files.length === 0) return;

      setLoading(true);
      const res = await electronAPI.invoke('laporan:addFotoToDokumentasi', {
        id_dokumentasi,
        files,
      });

      if (res.success) {
        message.success('Foto ditambahkan');
        await fetchDokumentasi();
        onRefresh?.(); // Update jumlah_dok di tabel utama
      }
    } catch (err) {
      message.error('Gagal mengunggah foto');
    } finally {
      setLoading(false);
    }
  };

  // 3. HAPUS FOTO (Satuan)
  const handleDeleteFoto = async (rawPath: string) => {
    try {
      const res = await electronAPI.invoke('laporan:deleteFoto', rawPath);
      if (res) {
        message.success('Foto dihapus');
        fetchDokumentasi();
      }
    } catch (err) {
      message.error('Gagal menghapus file');
    }
  };

  // 4. HAPUS ALBUM (Total)
  const handleDeleteGroup = (id_dokumentasi: number | string, nama: string) => {
    Modal.confirm({
      title: 'HAPUS SELURUH ALBUM?',
      content: `Album "${nama}" dan semua foto di dalamnya akan dihapus permanen.`,
      okText: 'Hapus Permanen',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        const backupData = [...data];
        // Optimistic: Hapus dari UI dulu agar terasa cepat
        setData(prev => prev.filter(g => g.id_dokumentasi !== id_dokumentasi));

        try {
          const res = await electronAPI.invoke('laporan:deleteDokumentasi', id_dokumentasi);
          if (res.success) {
            message.success('Album berhasil dihapus');
            // Jeda 100ms agar DB selesai menulis sebelum tabel utama ditarik ulang
            setTimeout(() => {
              onRefresh?.(); 
            }, 100);
          } else {
            throw new Error(res.message);
          }
        } catch (err: any) {
          setData(backupData); // Kembalikan data jika gagal
          message.error(`Gagal: ${err.message || 'Error Database'}`);
        }
      }
    });
  };

  // 5. RENAME ALBUM
  const handleRename = async (id_dokumentasi: number | string) => {
    if (!newName.trim()) return;
    try {
      const res = await electronAPI.invoke('laporan:renameDokumentasi', { id_dokumentasi, newName });
      if (res.success) {
        message.success('Nama diperbarui');
        setEditingDok(null);
        fetchDokumentasi();
      }
    } catch (err) {
      message.error('Gagal rename');
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      centered
      zIndex={zIndex}
      title={
        <Space>
          <Typography.Title level={4} style={{ margin: 0 }}>{laporan?.nama_laporan}</Typography.Title>
          <Tag color="blue">ID: {laporan?.id_laporan}</Tag>
        </Space>
      }
    >
      <div style={{ minHeight: '60vh', padding: '20px 0' }}>
        {loading && data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Spin indicator={loadingIcon} tip="Memuat Dokumentasi..." /></div>
        ) : data.length === 0 ? (
          <Empty description="Tidak ada album ditemukan" style={{ marginTop: 50 }} />
        ) : (
          data.map((group) => (
            <Card 
              key={group.id_dokumentasi} 
              size="small"
              style={{ marginBottom: 20, borderRadius: 12 }}
              title={
                editingDok === String(group.id_dokumentasi) ? (
                  <Space>
                    <Input size="small" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
                    <Button size="small" type="primary" onClick={() => handleRename(group.id_dokumentasi)}>OK</Button>
                    <Button size="small" onClick={() => setEditingDok(null)}>Batal</Button>
                  </Space>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text strong>{group.nama_dokumentasi} <Tag style={{ marginLeft: 8 }}>{group.files.length} Foto</Tag></Typography.Text>
                    <Space>
                       <Button size="small" icon={<HiOutlinePencilSquare />} onClick={() => { setEditingDok(String(group.id_dokumentasi)); setNewName(group.nama_dokumentasi); }} />
                       <Button size="small" icon={<TbCameraPlus />} onClick={() => handleAddFoto(group.id_dokumentasi)}>Foto</Button>
                       <Button size="small" danger icon={<HiOutlineTrash />} onClick={() => handleDeleteGroup(group.id_dokumentasi, group.nama_dokumentasi)} />
                    </Space>
                  </div>
                )
              }
            >
              <Row gutter={[12, 12]}>
                {group.files.map((file, i) => (
                  <Col key={file.rawPath || i} xs={12} sm={8} md={6} lg={4}>
                    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                      <Image src={file.path} height={120} width="100%" style={{ objectFit: 'cover' }} />
                      <Popconfirm title="Hapus foto?" onConfirm={() => handleDeleteFoto(file.rawPath)}>
                        <Button 
                          danger type="primary" size="small" icon={<HiOutlineTrash />} 
                          style={{ position: 'absolute', top: 5, right: 5, zIndex: 10, height: 24, width: 24 }} 
                        />
                      </Popconfirm>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          ))
        )}
      </div>
      <style>{`
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Modal>
  );
};