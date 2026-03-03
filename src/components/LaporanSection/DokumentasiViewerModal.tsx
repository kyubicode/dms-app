import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal, Card, Row, Col, Image, Empty, Spin, Typography,
  Input, Button, Space, message, Tag, Popconfirm
} from 'antd';
import { 
  HiOutlineTrash, HiOutlinePencilSquare,
} from 'react-icons/hi2';
import { TbLoaderQuarter, TbCameraPlus } from "react-icons/tb";
import { dmsTheme } from '@/styles/dms.theme';

interface FileDetail {
  path: string;    // URL file:/// untuk display
  rawPath: string; // Path asli untuk FS operation
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

export const DokumentasiViewerModal: React.FC<Props> = ({ open, laporan, onClose, onRefresh,zIndex = 900 }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DokumentasiGroup[]>([]);
  const [editingDok, setEditingDok] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const electronAPI = (window as any).electron;
  const loadingIcon = <TbLoaderQuarter className="spin-icon" style={{ fontSize: 38, color: dmsTheme.colors.primary }} />;

  // 1. FETCH DATA - Mengambil album dan foto berdasarkan ID Laporan
  const fetchDokumentasi = useCallback(async () => {
    if (!laporan || !electronAPI) return;
    setLoading(true);
    try {
      const res = await electronAPI.invoke('laporan:getDokumentasiByLaporan', laporan.id_laporan);
      setData(res || []);
    } catch (err) {
      console.error(err);
      message.error('Gagal memuat data dokumentasi');
    } finally {
      setLoading(false);
    }
  }, [laporan, electronAPI]);

  useEffect(() => {
    if (open) fetchDokumentasi();
  }, [open, fetchDokumentasi]);

  // 2. TAMBAH FOTO - Sekarang menggunakan id_dokumentasi agar sinkron dengan backend
  const handleAddFoto = async (id_dokumentasi: number | string) => {
    if (!laporan || !electronAPI) return;
    try {
      const files = await electronAPI.invoke('select-files');
      if (!files || files.length === 0) return;

      setLoading(true); // Indikator proses upload/copy sedang berjalan
      const res = await electronAPI.invoke('laporan:addFotoToDokumentasi', {
        id_laporan: laporan.id_laporan,
        id_dokumentasi: id_dokumentasi, // Diperbaiki: kirim ID bukan Nama
        files,
      });

      if (res.success) {
        message.success('Foto berhasil ditambahkan');
        fetchDokumentasi(); // Refresh view
      } else {
        message.error(res.message || 'Gagal menyimpan foto');
      }
    } catch (err) {
      console.error(err);
      message.error('Gagal menambah foto');
    } finally {
      setLoading(false);
    }
  };

  // 3. HAPUS FOTO
  const handleDeleteFoto = async (rawPath: string) => {
    if (!electronAPI) return;
    try {
      await electronAPI.invoke('laporan:deleteFoto', rawPath);
      message.success('Foto dihapus');
      fetchDokumentasi();
    } catch (err) {
      message.error('Gagal menghapus foto');
    }
  };


  // 4. RENAME ALBUM
  const handleRename = async (id_dokumentasi: number | string) => {
    if (!newName.trim() || !electronAPI) {
        message.warning("Nama tidak boleh kosong");
        return;
    }
    
    setLoading(true);
    try {
      const res = await electronAPI.invoke('laporan:renameDokumentasi', { 
        id_dokumentasi, 
        newName: newName // Properti harus 'newName' sesuai IPC
      });

      if (res.success) {
        message.success('Nama album berhasil diubah');
        setEditingDok(null);
        await fetchDokumentasi();
        onRefresh?.();
      } else {
        message.error(res.message || 'Gagal mengubah nama');
      }
    } catch (err) {
      message.error('Terjadi kesalahan sistem saat rename');
    } finally {
      setLoading(false);
    }
  };

  // 5. HAPUS ALBUM TOTAL
  const handleDeleteGroup = (id_dokumentasi: number | string, nama: string) => {
    if (!electronAPI) return;
    Modal.confirm({
      title: 'Hapus Album?',
      content: `Seluruh foto di "${nama}" akan dihapus permanen dari sistem.`,
      okText: 'Hapus',
      okType: 'danger',
      centered: true,
      onOk: async () => {
        try {
          const res = await electronAPI.invoke('laporan:deleteDokumentasi', id_dokumentasi);
          if (res.success) {
            message.success('Album dihapus');
            fetchDokumentasi();
            onRefresh?.();
          }
        } catch (err) {
          message.error('Gagal menghapus album');
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
      zIndex={zIndex}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 30 }}>
          <Space>
            <Typography.Title level={4} style={{ margin: 0 }}>{laporan?.nama_laporan}</Typography.Title>
            <Tag color="blue">ID PROYEK: {laporan?.id_laporan}</Tag>
          </Space>
        </div>
      }
    >
      <div style={{ minHeight: '60vh', padding: '10px 0' }}>
        {loading && data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Spin indicator={loadingIcon} /></div>
        ) : data.length === 0 ? (
          <Empty description="Belum ada dokumentasi untuk laporan ini" style={{ marginTop: 50 }} />
        ) : (
          data.map((group) => (
            <Card 
              key={group.id_dokumentasi} 
              size="small"
              title={
                editingDok === String(group.id_dokumentasi) ? (
                  <Space>
                    <Input 
                      size="small" 
                      value={newName} 
                      onChange={e => setNewName(e.target.value)} 
                      autoFocus
                    />
                    <Button size="small" type="primary" onClick={() => handleRename(group.id_dokumentasi)}>Simpan</Button>
                    <Button size="small" onClick={() => setEditingDok(null)}>Batal</Button>
                  </Space>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography.Text strong>
                      {group.nama_dokumentasi}{' '}
                      <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>
                        ({group.files.length} Foto)
                      </Typography.Text>
                    </Typography.Text>
                    <Space>
                       <Button 
                         size="small" 
                         icon={<HiOutlinePencilSquare />} 
                         onClick={() => { setEditingDok(String(group.id_dokumentasi)); setNewName(group.nama_dokumentasi); }} 
                       />
                       <Button 
                         size="small" 
                         icon={<TbCameraPlus />} 
                         loading={loading}
                         onClick={() => handleAddFoto(group.id_dokumentasi)}
                       >
                         Tambah Foto
                       </Button>
                       <Button 
                         size="small" 
                         danger 
                         icon={<HiOutlineTrash />} 
                         onClick={() => handleDeleteGroup(group.id_dokumentasi, group.nama_dokumentasi)} 
                       />
                    </Space>
                  </div>
                )
              }
              style={{ marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <Row gutter={[12, 12]}>
                {group.files.length === 0 ? (
                   <Col span={24}><Typography.Text type="secondary">Album kosong. Tambahkan foto untuk memulai.</Typography.Text></Col>
                ) : (
                  group.files.map((file, i) => (
                    <Col key={i} xs={12} sm={8} md={6} lg={4}>
                      <div style={{ position: 'relative', border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fafafa' }}>
                        <Image 
                          src={file.path} 
                          height={120} 
                          width="100%" 
                          style={{ objectFit: 'cover' }} 
                          placeholder={<div style={{ height: 120, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="small"/></div>}
                        />
                        <Popconfirm 
                          title="Hapus foto ini?" 
                          onConfirm={() => handleDeleteFoto(file.rawPath)} 
                          okText="Ya" 
                          cancelText="Tidak"
                          placement="bottomRight"
                        >
                          <Button 
                            danger 
                            type="primary"
                            size="small" 
                            icon={<HiOutlineTrash />} 
                            style={{ position: 'absolute', top: 5, right: 5, padding: '0 4px', height: 24, minWidth: 24 }} 
                          />
                        </Popconfirm>
                      </div>
                    </Col>
                  ))
                )}
              </Row>
            </Card>
          ))
        )}
      </div>
    </Modal>
  );
};