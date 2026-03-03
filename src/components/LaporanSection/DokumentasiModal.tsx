import React from 'react';
import { Modal, Form, Input, Button, Space, message, Image, Row, Col, Typography, Tag } from 'antd';
import { 
  HiOutlineFolderPlus, 
  HiOutlineCloudArrowUp, 
  HiOutlineTrash, 
  HiOutlineDocumentPlus,
  HiOutlineXMark
} from 'react-icons/hi2';
import { TbDatabaseExport } from "react-icons/tb";
import { ILaporan, IFile } from '@/types/laporan';
import { dmsTheme } from '@/styles/dms.theme';

const { Text, Title } = Typography;

interface Props {
  visible: boolean;
  laporan: ILaporan | null;
  rawFiles: IFile[];
  setRawFiles: (files: IFile[]) => void;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: any;
  zIndex?: number;
}

export const DokumentasiModal: React.FC<Props> = ({
  visible,
  laporan,
  rawFiles,
  setRawFiles,
  loading,
  onCancel,
  onSubmit,
  form
}) => {

  const electronAPI = (window as any).electron;

  const handleRemoveFile = (uid?: string) => {
    if (!uid) return;
    const filtered = rawFiles.filter(f => f.uid !== uid);
    setRawFiles(filtered);
    message.info('DATA REMOVED FROM QUEUE');
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={750}
      centered
      zIndex={1100}
      // PERBAIKAN: Gunakan style untuk dekorasi kontainer luar (pengganti styles.content)
      style={{ 
        borderRadius: dmsTheme.radius.lg,
        borderTop: `6px solid ${dmsTheme.colors.primary}`,
        overflow: 'hidden',
        padding: 0
      }}
      // PERBAIKAN: Gunakan styles hanya untuk sub-elemen yang valid (body, header, mask, dll)
      styles={{
        body: { 
          padding: 0, 
        },
        header: { 
          padding: '16px 24px', 
          borderBottom: `1px solid ${dmsTheme.colors.border}`, 
          marginBottom: 0 
        }
      }}
      closeIcon={<HiOutlineXMark size={20} />}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
          <div style={{ borderLeft: `5px solid ${dmsTheme.colors.accent}`, paddingLeft: 16 }}>
            <Space size={6}>
              <HiOutlineFolderPlus style={{ color: dmsTheme.colors.primary }} size={16} />
              <Text strong style={{ 
                color: dmsTheme.colors.primary, 
                fontSize: '10px', 
                letterSpacing: '2px',
                fontFamily: dmsTheme.fonts.code 
              }}>
                ARCHIVE SYSTEM // NEW ENTRY
              </Text>
            </Space>
            <Title level={4} style={{ margin: 0, fontWeight: 800, textTransform: 'uppercase', color: dmsTheme.colors.text.primary }}>
              {laporan?.nama_laporan || 'NULL_REPORT'}
            </Title>
          </div>
          <Tag color="blue" style={{ borderRadius: 4, fontWeight: 800, border: 'none', fontFamily: dmsTheme.fonts.code }}>
            REF_ID: {laporan?.id_laporan || '000'}
          </Tag>
        </div>
      }
    >
      <div style={{ padding: '0 24px' }}>
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onSubmit}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="nama_dokumentasi"
            label={
              <Text className="industrial-label" style={{ fontFamily: dmsTheme.fonts.code }}>
                01 // FOLDER DESIGNATION / LABEL
              </Text>
            }
            rules={[{ required: true, message: 'Label wajib diisi' }]}
          >
            <Input 
              placeholder="CONTOH: LANTAI 1, AREA PRODUKSI, PANEL UTAMA" 
              className="industrial-input"
            />
          </Form.Item>

          <Form.Item 
            label={
              <Text className="industrial-label" style={{ fontFamily: dmsTheme.fonts.code }}>
                02 // MEDIA ASSETS (MULTIPLE_SELECT)
              </Text>
            }
          >
            <Button
              block
              className="industrial-upload-btn"
              icon={<HiOutlineCloudArrowUp size={20} />}
              onClick={async () => {
                if (!electronAPI) {
                  message.error('ELECTRON API NOT_FOUND');
                  return;
                }
                const files: IFile[] = await electronAPI.invoke('select-files');
                if (files && files.length > 0) {
                  const filesWithUid = files.map(f => ({ 
                    ...f, 
                    uid: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` 
                  }));
                  setRawFiles([...rawFiles, ...filesWithUid]);
                  message.success(`${files.length} ASSETS STAGED`);
                }
              }}
            >
              PILIH FILE DARI DISK
            </Button>

            <div className="preview-container">
              <Row gutter={[10, 10]}>
                {rawFiles.map(f => (
                  <Col key={f.uid} span={6}>
                    <div className="preview-card-tactical">
                      <Image
                        src={`file://${f.path}`}
                        alt={f.name}
                        preview={false}
                        style={{ width: '100%', height: 90, objectFit: 'cover' }}
                      />
                      <div className="preview-overlay">
                        <Button
                          type="primary"
                          danger
                          icon={<HiOutlineTrash size={14} />}
                          className="remove-btn"
                          onClick={() => handleRemoveFile(f.uid)}
                        />
                      </div>
                      <div className="preview-footer" style={{ fontFamily: dmsTheme.fonts.code }}>
                        {f.name?.toUpperCase().substring(0, 12)}...
                      </div>
                    </div>
                  </Col>
                ))}
                {rawFiles.length === 0 && (
                  <Col span={24}>
                    <div className="empty-staging">
                      <HiOutlineDocumentPlus size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                      <br />
                      <span style={{ fontFamily: dmsTheme.fonts.code }}>MENUNGGU FOTO / FILE</span>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </Form.Item>

          <div className="form-footer">
            <Button 
              onClick={onCancel} 
              className="btn-cancel"
              style={{ borderRadius: 4 }}
            >
              BATAL
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<TbDatabaseExport size={18} />}
              className="btn-submit"
              style={{ 
                background: dmsTheme.colors.primary, 
                border: 'none',
                borderRadius: 4
              }}
            >
              SIMPAN KE DATABASE
            </Button>
          </div>
        </Form>
      </div>

      <style>{`
        /* Menghilangkan padding bawaan AntD modal content untuk kontrol penuh */
        .ant-modal-content { padding: 0 !important; }
        
        .industrial-label { font-size: 10px !important; font-weight: 800 !important; letter-spacing: 1.5px; color: #64748b; }
        .industrial-input { border-radius: 4px !important; padding: 10px 14px !important; border: 1px solid ${dmsTheme.colors.border} !important; font-weight: 600; }
        
        .industrial-upload-btn { 
          height: 60px !important; 
          border-radius: 6px !important; 
          border: 2px dashed ${dmsTheme.colors.border} !important; 
          color: ${dmsTheme.colors.primary} !important;
          font-weight: 800 !important;
          background: #f8fafc !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: 0.3s !important;
        }
        .industrial-upload-btn:hover { border-color: ${dmsTheme.colors.primary} !important; background: #fff !important; }

        .preview-container { 
          margin-top: 15px; 
          max-height: 280px; 
          overflow-y: auto; 
          padding: 12px;
          background: #0f172a; 
          border: 1px solid #1e293b;
          border-radius: 6px;
        }
        
        .preview-card-tactical { position: relative; background: #1e293b; padding: 3px; border: 1px solid #334155; transition: 0.3s; border-radius: 4px; overflow: hidden; }
        .preview-overlay { position: absolute; top: 5px; right: 5px; opacity: 0; transition: 0.2s; z-index: 10; }
        .preview-card-tactical:hover .preview-overlay { opacity: 1; }
        
        .remove-btn { 
          width: 24px !important; 
          height: 24px !important; 
          display: flex !important; 
          align-items: center !important; 
          justify-content: center !important;
          border-radius: 4px !important;
          background: ${dmsTheme.colors.status.danger} !important;
          border: none !important;
        }

        .preview-footer { font-size: 8px; padding: 4px; background: #1e293b; color: #94a3b8; font-weight: 700; white-space: nowrap; overflow: hidden; }
        .empty-staging { text-align: center; padding: 40px; color: #475569; font-size: 10px; font-weight: 800; letter-spacing: 2px; }

        .form-footer { 
          display: flex; 
          justify-content: flex-end; 
          gap: 12px; 
          margin-top: 30px; 
          padding: 20px 24px; 
          background: #f8fafc; 
          border-top: 1px solid ${dmsTheme.colors.border}; 
          margin-left: -24px; 
          margin-right: -24px; 
        }
        
        .preview-container::-webkit-scrollbar { width: 4px; }
        .preview-container::-webkit-scrollbar-thumb { background: ${dmsTheme.colors.primary}; border-radius: 10px; }
      `}</style>
    </Modal>
  );
};