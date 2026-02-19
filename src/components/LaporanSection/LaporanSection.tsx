import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Space, Input, message, Form, ConfigProvider, 
  Typography, Button, Tag, Popconfirm, Tooltip, Modal
} from 'antd';
import { BsFileEarmarkPdf, BsFileEarmarkWord, BsEye } from "react-icons/bs";
import { 
  AiOutlinePlusSquare, AiOutlineSearch, 
  AiOutlineDelete, AiOutlineEdit, AiOutlineCloudUpload,
  AiOutlineFileText, AiOutlineCalendar, AiOutlineDatabase,
  AiOutlineClockCircle, AiOutlineLoading3Quarters,
  AiOutlinePlus
} from 'react-icons/ai';
import { CiViewTimeline } from "react-icons/ci";
import dayjs from 'dayjs';
import type { TableProps } from 'antd';

// Imports
import { dmsTheme } from '@/styles/dms.theme'; 
import { ILaporan, IFile } from '@/types/laporan';
import { FormInput } from '../FormInput/FormInput'; 
import { DataTable } from '../DataTable/DataTable'; 
import { DokumentasiModal } from './DokumentasiModal';
import { DokumentasiViewerModal } from './DokumentasiViewerModal';
import { localStyles, globalComponentStyles } from './LaporanSection.style';

const { Text } = Typography;

// Notifikasi Config
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

  // --- CORE FUNCTIONS (API) ---
  const fetchLaporan = useCallback(async () => {
    setTableLoading(true);
    try {
      const data = await (window as any).api.getLaporan();
      if (data) setLaporanList(data);
    } catch (err) {
      message.error('SYSTEM_ERROR: Gagal memuat database');
    } finally {
      setTableLoading(false);
    }
  }, []);

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
    setLoading(true);
    try {
      const payload = {
        ...values,
        tgl_laporan: values.tgl_laporan ? dayjs(values.tgl_laporan).format('YYYY-MM-DD') : null,
        tgl_mulai: values.tgl_mulai ? dayjs(values.tgl_mulai).format('YYYY-MM-DD') : null,
        tgl_selesai: values.tgl_selesai ? dayjs(values.tgl_selesai).format('YYYY-MM-DD') : null,
      };

      if (editingLaporan) {
        await (window as any).api.updateLaporan({ id_laporan: editingLaporan.id_laporan, ...payload });
        message.success('SYSTEM_UPDATE: Data berhasil diperbarui');
      } else {
        await (window as any).api.createLaporan(payload);
        message.success('SYSTEM_REGISTRY: Laporan baru terdaftar');
      }
      
      setIsInputModalVisible(false);
      form.resetFields();
      setEditingLaporan(null);
      fetchLaporan();
    } catch (err) { 
      message.error('EXECUTION_FAILED'); 
    } finally { 
      setLoading(false); 
    }
  };

  const onFinishDokumentasi = async (values: any) => {
    if (!selectedLaporan) return;
    if (rawFiles.length === 0) {
      message.warning('Pilih minimal satu file asset');
      return;
    }
    setLoading(true);
    try {
      const response = await (window as any).api.saveDokumentasi({
        id_laporan: selectedLaporan.id_laporan,
        nama_dokumentasi: values.nama_dokumentasi,
        files: rawFiles.map(f => ({ path: f.path, name: f.name }))
      });
      if (response.success) {
        message.success('ASSETS_DEPLOYED: Dokumentasi berhasil disimpan');
        setIsModalOpen(false);
        setRawFiles([]);
        dokForm.resetFields();
        fetchLaporan();
      }
    } catch (err: any) {
      message.error(`UPLOAD_FAILED: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (laporan: ILaporan) => {
    if (!laporan || exporting) return;
    setExporting(true);
    const hide = message.loading(`GENERATING_PDF: ${laporan.nama_laporan}...`, 0);
    try {
      const dokumentasi = await (window as any).api.getDokumentasiByLaporan(laporan.id_laporan);
      if (!dokumentasi || dokumentasi.length === 0) {
        message.warning('DATA_VOID: Tidak ada foto untuk PDF');
        return;
      }
      await (window as any).api.exportPdf(laporan, dokumentasi);
      message.success('PDF_EXPORT_SUCCESS');
    } catch (err) {
      message.error('PDF_EXPORT_FAILED');
    } finally { hide(); setExporting(false); }
  };

  const handleExportWord = async (laporan: ILaporan) => {
    if (!laporan || exporting) return;
    setExporting(true);
    const hide = message.loading(`Assembling report for ${laporan.nama_laporan}...`, 0);
    try {
      const dokumentasi = await (window as any).api.getDokumentasiByLaporan(laporan.id_laporan);
      if (!dokumentasi || dokumentasi.length === 0) {
        message.warning('EMPTY_ASSETS: Tidak ada foto untuk diexport');
        return;
      }
      await (window as any).api.exportWord(laporan, dokumentasi);
      message.success('EXPORT_COMPLETE: File disimpan di Desktop');
    } catch (err) {
      message.error('EXPORT_CRITICAL_ERROR');
    } finally { hide(); setExporting(false); }
  };

  const filteredData = useMemo(() => {
    if (!searchText) return laporanList;
    return laporanList.filter(item => 
      item.nama_laporan?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.tahap?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [laporanList, searchText]);

  const renderStatus = (val: string) => {
    const s = val?.toLowerCase();
    const config = s === 'selesai' 
      ? { bg: '#F0FDF4', dot: '#22C55E', text: '#166534' } 
      : s === 'pengerjaan' 
      ? { bg: '#EFF6FF', dot: '#3B82F6', text: '#1E40AF' }
      : { bg: '#F8FAFC', dot: '#94A3B8', text: '#475569' };

    return (
      <div style={{
        background: config.bg, color: config.text, padding: '2px 10px', borderRadius: '12px',
        fontSize: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px'
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: config.dot }} />
        {val?.toUpperCase() || 'GENERAL'}
      </div>
    );
  }

  const columns: TableProps<ILaporan>['columns'] = [
    { 
      title: 'REF', 
      render: (_, __, i) => <div style={localStyles.idxBadge}>{(i + 1).toString().padStart(3, '0')}</div>, 
      width: 60, align: 'center' 
    },
    { 
      title: 'PROJECT NAME', 
      dataIndex: 'nama_laporan', 
      render: (text) => (
        <div style={localStyles.projectNameContainer}>
          <Text strong style={localStyles.projectNameMain}>{text}</Text>
          <Text style={localStyles.projectNameSub}>DMS_STABLE_VERSION</Text>
        </div>
      )
    },
    { 
      title: 'DATE', 
      dataIndex: 'tgl_laporan', 
      width: 120,
      render: (date) => (
        <Space size={6}>
          <AiOutlineCalendar style={{ color: '#94a3b8' }} />
          <Text style={localStyles.dateText}>{date ? dayjs(date).format('DD/MM/YYYY') : '-'}</Text>
        </Space>
      )
    },
    { title: 'PROGRESS', dataIndex: 'progress', width: 140, render: (t) => renderStatus(t) },
    { title: 'STATUS', dataIndex: 'tahap', width: 130, render: (t) => renderStatus(t) },
    { 
      title: 'ASSETS', 
      dataIndex: 'jumlah_dok', 
      align: 'center', 
      width: 80,
      render: (val) => (
        <Text style={{ 
          fontWeight: 900, fontFamily: dmsTheme.fonts.code, 
          color: val > 0 ? dmsTheme.colors.status.success : '#cbd5e1', fontSize: '14px'
        }}>{val || 0}</Text>
      )
    },
    { 
      title: 'CONTROL CENTER', 
      key: 'action', width: 260, align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Preview"><Button className="action-btn-industrial" icon={<BsEye />} onClick={() => { setViewerLaporan(record); setViewerOpen(true); }} /></Tooltip>
          <Tooltip title="Export Word"><Button className="action-btn-industrial" icon={<BsFileEarmarkWord />} onClick={() => handleExportWord(record)} style={{ color: '#2b579a' }} disabled={exporting} /></Tooltip>
          <Tooltip title="Export PDF"><Button className="action-btn-industrial" icon={<BsFileEarmarkPdf />} onClick={() => handleExportPDF(record)} style={{ color: dmsTheme.colors.status.danger }} disabled={exporting} /></Tooltip>
          <Tooltip title="Upload Assets"><Button className="action-btn-industrial" icon={<AiOutlineCloudUpload />} onClick={() => { setSelectedLaporan(record); setIsModalOpen(true); }} style={{ color: '#059669' }} /></Tooltip>
          <Tooltip title="Edit Record"><Button className="action-btn-industrial" icon={<AiOutlineEdit />} onClick={() => handleEdit(record)} style={{ color: dmsTheme.colors.accent }} /></Tooltip>
          <Popconfirm 
            title="Hapus Laporan?"
            onConfirm={async () => {
              const hide = message.loading('EXECUTING_DELETE...', 0);
              try {
                const result = await (window as any).api.deleteLaporan(record.id_laporan);
                hide();
                if (result) { message.success('DATA_DELETED'); fetchLaporan(); }
              } catch (error) { hide(); message.error('DELETE_FAILED'); }
            }}
            okText="Ya" cancelText="Batal" okButtonProps={{ danger: true }}
          >
            <Button className="action-btn-industrial" danger icon={<AiOutlineDelete />} />
          </Popconfirm>
        </Space>
      ) 
    }
  ];

  return (
    <ConfigProvider theme={{ token: { borderRadius: 10, colorPrimary: dmsTheme.colors.primary, fontFamily: dmsTheme.fonts.main } }}>
      <div style={localStyles.container}>
        <style>{globalComponentStyles}</style>

        <Modal
          open={isInputModalVisible}
          onCancel={() => { setIsInputModalVisible(false); setEditingLaporan(null); form.resetFields(); }}
          footer={null}
          width={900}
          destroyOnClose
          centered
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
          tableIcon={<AiOutlineDatabase />}
          dataSource={filteredData}
          columns={columns}
          loading={tableLoading}
          rowKey="id_laporan"
          extra={
            <Space>
              <Input 
                prefix={<AiOutlineSearch style={{ color: '#94a3b8' }} />} 
                placeholder="Search records..." 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={localStyles.searchBar}
                allowClear
              />
              <Button 
                type="primary" 
                icon={<AiOutlinePlus />} 
                onClick={handleAdd}
                style={localStyles.addButton}
              >
                ADD_REPORT
              </Button>
            </Space>
          }
        />

        <DokumentasiViewerModal open={viewerOpen} laporan={viewerLaporan} onClose={() => setViewerOpen(false)} onRefresh={fetchLaporan} />
        <DokumentasiModal 
          visible={isModalOpen} laporan={selectedLaporan} 
          rawFiles={rawFiles} setRawFiles={setRawFiles} loading={loading} 
          onCancel={() => { setIsModalOpen(false); setRawFiles([]); dokForm.resetFields(); }} 
          onSubmit={onFinishDokumentasi} form={dokForm} 
        />
      </div>
    </ConfigProvider>
  );
};