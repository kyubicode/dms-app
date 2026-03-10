import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Space, Input, message, Form, ConfigProvider, 
  Typography, Button, Popconfirm, Tooltip, Modal
} from 'antd';
import { BsFileEarmarkPdf, BsFileEarmarkWord, BsEye } from "react-icons/bs";
import { 
  AiOutlinePlusSquare, AiOutlineSearch, 
  AiOutlineDelete, AiOutlineEdit, AiOutlineCloudUpload,
  AiOutlineFileText, AiOutlineCalendar,
  AiOutlineClockCircle, AiOutlineLoading3Quarters,
  AiOutlinePlus
} from 'react-icons/ai';
import { FcAcceptDatabase } from "react-icons/fc";
import { CiViewTimeline } from "react-icons/ci";
import dayjs from 'dayjs';
import type { TableProps } from 'antd';

// Imports internal
import { dmsTheme } from '@/styles/dms.theme'; 
import { ILaporan, IFile } from '@/types/laporan';
import { FormInput } from '../FormInput/FormInput'; 
import { DataTable } from '../DataTable/DataTable'; 
import { DokumentasiModal } from './DokumentasiModal';
import { DokumentasiViewerModal } from './DokumentasiViewerModal';
import { localStyles, globalComponentStyles } from './LaporanSection.style';

const { Text } = Typography;

message.config({ top: 45, duration: 3, maxCount: 3 });

export const LaporanSection: React.FC = () => {
  const [form] = Form.useForm();
  const [dokForm] = Form.useForm();

  // --- STATES ---
  const [laporanList, setLaporanList] = useState<ILaporan[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [searchText, setSearchText] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInputModalVisible, setIsInputModalVisible] = useState(false);
  const [selectedLaporan, setSelectedLaporan] = useState<ILaporan | null>(null);
  const [rawFiles, setRawFiles] = useState<IFile[]>([]);
  const [editingLaporan, setEditingLaporan] = useState<ILaporan | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerLaporan, setViewerLaporan] = useState<ILaporan | null>(null);
  const [exporting, setExporting] = useState(false);

  const electronAPI = (window as any).electron;

  // --- CORE FUNCTIONS ---
const fetchLaporan = useCallback(async () => {
  if (!electronAPI) return;
  setTableLoading(true);
  try {
    const data = await electronAPI.invoke('laporan:getAll');
    if (data) {
      // Gunakan spread operator [...data] untuk memastikan referensi array baru
      setLaporanList([...data]); 
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    message.error('SYSTEM_ERROR: Gagal memuat database');
  } finally {
    setTableLoading(false);
  }
}, [electronAPI]);


  useEffect(() => { fetchLaporan(); }, [fetchLaporan]);

  const handleAdd = () => {
    setEditingLaporan(null);
    form.resetFields();
    setIsInputModalVisible(true);
  };

  const handleEdit = (record: ILaporan) => {
    setEditingLaporan(record);
    form.setFieldsValue({ 
      ...record, 
      tgl_laporan: record.tgl_laporan ? dayjs(record.tgl_laporan) : null,
      tgl_mulai: record.tgl_mulai ? dayjs(record.tgl_mulai) : null,
      tgl_selesai: record.tgl_selesai ? dayjs(record.tgl_selesai) : null,
    });
    setIsInputModalVisible(true);
  };

  const onFinishLaporan = async (values: any) => {
    if (!electronAPI) return;
    setLoading(true);
    try {
      const payload = {
        ...values,
        tgl_laporan: values.tgl_laporan ? dayjs(values.tgl_laporan).format('YYYY-MM-DD') : null,
        tgl_mulai: values.tgl_mulai ? dayjs(values.tgl_mulai).format('YYYY-MM-DD') : null,
        tgl_selesai: values.tgl_selesai ? dayjs(values.tgl_selesai).format('YYYY-MM-DD') : null,
      };

      if (editingLaporan) {
        await electronAPI.invoke('laporan:update', { id_laporan: editingLaporan.id_laporan, ...payload });
        message.success('SYSTEM_UPDATE: Data diperbarui');
      } else {
        await electronAPI.invoke('laporan:create', payload);
        message.success('SYSTEM_REGISTRY: Laporan terdaftar');
      }
      
      setIsInputModalVisible(false);
      form.resetFields();
      setEditingLaporan(null);
      fetchLaporan();
    } catch (err) { message.error('EXECUTION_FAILED'); } finally { setLoading(false); }
  };

  const onFinishDokumentasi = async (values: any) => {
    if (!selectedLaporan || !electronAPI) return;
    if (rawFiles.length === 0) {
      message.warning('Pilih minimal satu file asset');
      return;
    }
    setLoading(true);
    try {
      const response = await electronAPI.invoke('laporan:saveDokumentasi', {
        id_laporan: selectedLaporan.id_laporan,
        nama_dokumentasi: values.nama_dokumentasi,
        files: rawFiles.map(f => ({ path: f.path, name: f.name }))
      });
      if (response.success) {
        message.success('ASSETS_DEPLOYED: Dokumentasi disimpan');
        setIsModalOpen(false);
        setRawFiles([]);
        dokForm.resetFields();
        fetchLaporan();
      }
    } catch (err: any) { message.error(`UPLOAD_FAILED: ${err.message}`); } finally { setLoading(false); }
  };

  const handleExportWord = async (laporan: ILaporan) => {
    if (!laporan || exporting || !electronAPI) return;
    setExporting(true);
    const statusKey = 'export_status';
    message.loading({ content: `GENERATING_WORD: ${laporan.nama_laporan}...`, key: statusKey });
    try {
      const dokumentasi = await electronAPI.invoke('laporan:getDokumentasiByLaporan', laporan.id_laporan);
      if (!dokumentasi || dokumentasi.length === 0) {
        message.warning({ content: 'Tidak ada foto untuk di-export', key: statusKey });
        setExporting(false);
        return;
      }
      const filePath = await electronAPI.invoke('laporan:exportWord', laporan, dokumentasi);
      if (filePath) message.success({ content: 'Word Berhasil Disimpan', key: statusKey, duration: 3 });
    } catch (err) { message.error({ content: 'Gagal Export Word', key: statusKey }); } finally { setExporting(false); }
  };

  const handleExportPDF = async (laporan: ILaporan) => {
    if (!laporan || exporting || !electronAPI) return;
    setExporting(true);
    const statusKey = 'export_status';
    message.loading({ content: `GENERATING_PDF: ${laporan.nama_laporan}...`, key: statusKey });
    try {
      const dokumentasi = await electronAPI.invoke('laporan:getDokumentasiByLaporan', laporan.id_laporan);
      if (!dokumentasi || dokumentasi.length === 0) {
        message.warning({ content: 'Tidak ada foto untuk di-export', key: statusKey });
        setExporting(false);
        return;
      }
      const filePath = await electronAPI.invoke('laporan:exportPdf', laporan, dokumentasi);
      if (filePath) message.success({ content: `PDF Berhasil Disimpan`, key: statusKey, duration: 3 });
    } catch (err) { message.error({ content: 'Gagal Export PDF', key: statusKey }); } finally { setExporting(false); }
  };

  // --- LOGIKA WARNA DINAMIS ---
  const renderStatus = (val: string, type: 'progress' | 'tahap' = 'progress') => {
    const s = val?.toLowerCase();
    let config = { bg: '#F8FAFC', dot: '#94A3B8', text: '#475569' }; // Default (Grey)

    if (type === 'progress') {
      if (s === 'selesai') config = { bg: '#F0FDF4', dot: '#22C55E', text: '#166534' }; // Green
      else if (s === 'pengerjaan') config = { bg: '#EFF6FF', dot: '#3B82F6', text: '#1E40AF' }; // Blue
      else if (s === 'persiapan') config = { bg: '#FFF7ED', dot: '#F97316', text: '#9A3412' }; // Orange
    } else {
      // Warna berbeda untuk kolom TAHAP jika ingin dibedakan
      config = { bg: '#F1F5F9', dot: '#64748B', text: '#334155' };
    }

    return (
      <div style={{
        background: config.bg, color: config.text, padding: '4px 12px', borderRadius: '6px',
        fontSize: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px',
        border: `1px solid ${config.dot}20`
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dot }} />
        {val?.toUpperCase() || 'N/A'}
      </div>
    );
  }

  const filteredData = useMemo(() => {
    if (!searchText) return laporanList;
    return laporanList.filter(item => 
      item.nama_laporan?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.tahap?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [laporanList, searchText]);

const columns: TableProps<ILaporan>['columns'] = [
  { 
    title: 'DOC ID', 
    render: (_, __, i) => (
      <div style={{
        ...localStyles.idxBadge as any,
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '10px',
        fontWeight: 700,
        fontFamily: dmsTheme.fonts.code
      }}>
        {(i + 1).toString().padStart(3, '0')}
      </div>
    ), 
    width: 70, align: 'center' 
  },
  { 
    title: 'Nama Laporan', 
    dataIndex: 'nama_laporan', 
    render: (text) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Text strong style={{ fontSize: '14px', color: '#1e293b', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
          {text}
        </Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
          <span style={{ width: '8px', height: '2px', background: dmsTheme.colors.primary, borderRadius: '2px' }} />
          <Text style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px' }}>
            DMS-LAPORAN DOKUMENTASI
          </Text>
        </div>
      </div>
    )
  },
  // --- TANGGAL LAPORAN (KEMBALI DENGAN DESAIN PRO) ---
  { 
    title: 'Tgl Laporan', 
    dataIndex: 'tgl_laporan', 
    width: 140,
    render: (date) => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '4px 8px', 
        background: '#ffffff', 
        border: '1px dashed #cbd5e1', 
        borderRadius: '6px' 
      }}>
        <AiOutlineCalendar style={{ color: dmsTheme.colors.primary, fontSize: '16px' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: '11px', fontWeight: 700, color: '#475569', lineHeight: 1 }}>
            {date ? dayjs(date).format('DD MMM YYYY') : 'N/A'}
          </Text>
          <Text style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 600 }}>REPORT DATE</Text>
        </div>
      </div>
    )
  },
  { 
    title: 'Timeline Dokumentasi', 
    key: 'timeline',
    width: 190,
    render: (_, record) => (
      <div style={{ 
        background: '#f8fafc', 
        padding: '6px 10px', 
        borderRadius: '8px', 
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }} />
            <Text style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 800 }}>MULAI</Text>
          </div>
          <Text style={{ fontSize: '10px', fontFamily: dmsTheme.fonts.code, color: '#475569', fontWeight: 700 }}>
            {record.tgl_mulai ? dayjs(record.tgl_mulai).format('DD/MM/YY') : '---'}
          </Text>
        </div>
        <div style={{ height: '1px', background: '#e2e8f0', width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }} />
            <Text style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 800 }}>SELESAI</Text>
          </div>
          <Text style={{ fontSize: '10px', fontFamily: dmsTheme.fonts.code, color: '#475569', fontWeight: 700 }}>
            {record.tgl_selesai ? dayjs(record.tgl_selesai).format('DD/MM/YY') : '---'}
          </Text>
        </div>
      </div>
    )
  },
  { 
    title: 'Status & Tahap', 
    key: 'status_phase',
    width: 150,
    render: (_, record) => (
      <Space direction="vertical" size={4}>
        {renderStatus(record.progress, 'progress')}
        <div style={{ fontSize: '9px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '4px' }}>
          <AiOutlineClockCircle />
          <span>TAHAP: {record.tahap?.toUpperCase() || 'UNDEFINED'}</span>
        </div>
      </Space>
    ) 
  },
  { 
    title: 'DOKUMENTASI', 
    dataIndex: 'jumlah_dok', 
    align: 'center', 
    width: 85,
    render: (val) => (
      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: val > 0 ? '#ecfdf5' : '#f8fafc', padding: '4px', borderRadius: '6px',
        border: `1px solid ${val > 0 ? '#10b98120' : '#e2e8f0'}`
      }}>
        <Text style={{ fontWeight: 900, fontFamily: dmsTheme.fonts.code, color: val > 0 ? '#059669' : '#cbd5e1', fontSize: '14px', lineHeight: 1 }}>
          {val || 0}
        </Text>
        <Text style={{ fontSize: '8px', color: val > 0 ? '#059669' : '#cbd5e1', fontWeight: 700 }}>FILES</Text>
      </div>
    )
  },
  { 
    title: 'Control Interface', 
    key: 'action', 
    width: 240, 
    align: 'right',
    render: (_, record) => (
      <Space size={2}>
        <Tooltip title="View Document"><Button className="action-btn-industrial" icon={<BsEye />} onClick={() => { setViewerLaporan(record); setViewerOpen(true); }} /></Tooltip>
        <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px' }} />
        <Tooltip title="DOCX"><Button className="action-btn-industrial" icon={exporting ? <AiOutlineLoading3Quarters className="anticon-spin" /> : <BsFileEarmarkWord />} onClick={() => handleExportWord(record)} style={{ color: '#2b579a' }} disabled={exporting} /></Tooltip>
        <Tooltip title="PDF"><Button className="action-btn-industrial" icon={exporting ? <AiOutlineLoading3Quarters className="anticon-spin" /> : <BsFileEarmarkPdf />} onClick={() => handleExportPDF(record)} style={{ color: dmsTheme.colors.status.danger }} disabled={exporting} /></Tooltip>
        <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px' }} />
        <Tooltip title="Upload"><Button className="action-btn-industrial" icon={<AiOutlineCloudUpload />} onClick={() => { setSelectedLaporan(record); setIsModalOpen(true); }} style={{ color: '#059669' }} /></Tooltip>
        <Tooltip title="Edit"><Button className="action-btn-industrial" icon={<AiOutlineEdit />} onClick={() => handleEdit(record)} style={{ color: dmsTheme.colors.accent }} /></Tooltip>
        <Popconfirm title="Delete record?" onConfirm={async () => { if (!electronAPI) return; const result = await electronAPI.invoke('laporan:delete', record.id_laporan); if (result) { message.success('DATA_DELETED'); fetchLaporan(); } }} okText="Delete" cancelText="Cancel" okButtonProps={{ danger: true, size: 'small' }}><Button className="action-btn-industrial-danger" icon={<AiOutlineDelete />} /></Popconfirm>
      </Space>
    ) 
  }
];

  return (
    <ConfigProvider 
      theme={{ 
        token: { 
          borderRadius: 12,
          colorPrimary: '#007aff', 
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
        },
        components: {
          Button: { controlHeight: 34, fontWeight: 500, borderRadius: 6 },
          Input: { controlHeight: 34, colorBgContainer: 'rgba(0, 0, 0, 0.04)' },
          Table: { borderRadius: 0, headerBg: '#fafafa', headerColor: '#86868b' }
        }
      }}
    >
      <div style={localStyles.container as any}>
        <style>{globalComponentStyles}</style>

        <Modal
          open={isInputModalVisible}
          onCancel={() => { setIsInputModalVisible(false); setEditingLaporan(null); form.resetFields(); }}
          footer={null}
          width={900}
          destroyOnClose
          centered
          className="mac-modal" 
        >
          <FormInput 
            form={form} 
            loading={loading} 
            onFinish={onFinishLaporan} 
            isEdit={!!editingLaporan} 
            title={editingLaporan ? 'MODIFY ENTRY' : 'NEW REGISTRY'}
            icon={editingLaporan ? <AiOutlineEdit /> : <AiOutlinePlusSquare />}
            fields={[
                { name: 'nama_laporan', label: 'NAMA LAPORAN', type: 'text', span: 12, icon: <AiOutlineFileText />, rules: [{ required: true }] },
                { 
                  name: 'progress', label: 'PROGRESS', type: 'select', span: 12, icon: <AiOutlineLoading3Quarters />, 
                  options: [
                    { value: 'persiapan', label: 'Persiapan' },
                    { value: 'pengerjaan', label: 'Pengerjaan' },
                    { value: 'selesai', label: 'Selesai' },
                  ],
                  rules: [{ required: true }]
                },
                { name: 'tahap', label: 'TAHAP', type: 'text', span: 12, icon: <CiViewTimeline /> },
                { name: 'tgl_laporan', label: 'TANGGAL LAPORAN', type: 'date', span: 12, icon: <AiOutlineCalendar /> },
                { name: 'tgl_mulai', label: 'TANGGAL MULAI', type: 'date', span: 12, icon: <AiOutlineClockCircle /> },
                { name: 'tgl_selesai', label: 'TANGGAL SELESAI', type: 'date', span: 12, icon: <AiOutlineClockCircle /> },
            ]}
            onReset={() => { setIsInputModalVisible(false); form.resetFields(); setEditingLaporan(null); }}
          />
        </Modal>

        <DataTable<ILaporan>
          tableTitle="DATA LAPORAN"
          tableIcon={<FcAcceptDatabase size={40} />}
          dataSource={filteredData}
          columns={columns}
          loading={tableLoading}
          rowKey="id_laporan"
          extra={
            <Space size={12}>
              <Input 
                prefix={<AiOutlineSearch style={{ color: '#86868b' }} />} 
                placeholder="Search records..." 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={localStyles.searchBar as any}
                allowClear
              />
              <Button 
                type="primary" 
                icon={<AiOutlinePlus />} 
                onClick={handleAdd}
                style={localStyles.addButton as any}
              >
                TAMBAH LAPORAN
              </Button>
            </Space>
          }
        />

      <DokumentasiViewerModal
            // TAMBAHKAN KEY: Ini memastikan modal me-reset state internalnya 
            // setiap kali laporan yang dipilih berubah.
            key={viewerLaporan?.id_laporan ? `viewer-${viewerLaporan.id_laporan}` : 'viewer-empty'}
            open={viewerOpen} 
            laporan={viewerLaporan} 
            onClose={() => setViewerOpen(false)} 
            onRefresh={fetchLaporan} // fetchLaporan akan dipanggil saat album dihapus/ditambah
            zIndex={1900} 
          />

        <DokumentasiModal 
          visible={isModalOpen} 
          laporan={selectedLaporan} 
          rawFiles={rawFiles} 
          setRawFiles={setRawFiles} 
          loading={loading} 
          onCancel={() => { setIsModalOpen(false); setRawFiles([]); dokForm.resetFields(); }} 
          onSubmit={onFinishDokumentasi} 
          form={dokForm} 
          zIndex={1900} 
        />
      </div>
    </ConfigProvider>
  );
};