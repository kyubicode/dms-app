import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Space, Input, Form, ConfigProvider, 
  Typography, Button, Tag, Popconfirm, Avatar, App, Tooltip, Modal, message,
} from 'antd';

import { 
  AiOutlineSearch, AiOutlineDelete, AiOutlineEdit,
  AiOutlineIdcard, AiOutlineUser, AiOutlineDatabase, AiOutlinePlus,
  AiOutlineClockCircle // Tambahkan ini karena dipakai di render
} from 'react-icons/ai';
import { FcAcceptDatabase } from "react-icons/fc";

// Import komponen internal
import { DataTable } from '../DataTable/DataTable'; 
import { PersonnelIdCard } from '../PersonnelIdCard/PersonnelIdCard';
import { UserFormModal } from './UserFormModal'; 
import { localStyles, globalCss } from './UsersSection.styles';

const { Text } = Typography;

// --- FALLBACK THEME (Jika belum ada import theme global) ---
const dmsTheme = {
  colors: {
    primary: '#007AFF',
    accent: '#059669',
  },
  fonts: {
    code: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace'
  }
};

export const UsersSection: React.FC = () => {
  const [form] = Form.useForm();
  const api = (window as any).electron;
  const { message: msgApi } = App.useApp();

  // --- STATES ---
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isIdCardVisible, setIsIdCardVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // --- HELPERS ---
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('user') || '{"role":"user"}'), []);
  const isAdminUser = currentUser.role === 'admin'; // Ubah nama biar gak bentrok

  const getFileUrl = useCallback((pathStr: string | null | undefined): string | null => {
    if (!pathStr) return null;
    return `file://${pathStr.replace(/\\/g, '/')}?t=${new Date().getTime()}`;
  }, []);

  const generateUniqueId = useCallback(() => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000); 
    return `STF-${year}${random}`;
  }, []);

  // --- API ACTIONS ---
  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!api) return;
    if (!isSilent) setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { 
      msgApi.error("SYSTEM SYNC_ERROR"); 
    } finally {
      setLoading(false);
    }
  }, [api, msgApi]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSelectFoto = async () => {
    if (!api) return;
    try {
      const result = await api.selectAvatar(); 
      if (result?.[0]) {
        form.setFieldsValue({ foto: result[0] });
        setPreviewFoto(getFileUrl(result[0]));
      }
    } catch (err) { msgApi.error("Gagal memproses foto"); }
  };

  const onFinish = async (values: any) => {
    if (!api) return;
    setActionLoading(true);
    try {
      const payload = { ...values, id: editingUser?.id };
      if (editingUser && !payload.password) delete payload.password;

      const res = editingUser ? await api.updateUser(payload) : await api.registerUser(payload);
        
      if (res?.success) {
        msgApi.success(editingUser ? 'DATA UPDATED' : 'PERSONNEL REGISTERED');
        setIsModalVisible(false);
        fetchUsers(true);
      } else {
        msgApi.error(res?.message || 'TRANSACTION REJECTED');
      }
    } catch (err) { msgApi.error('TRANSACTION FAILED'); } 
    finally { setActionLoading(false); }
  };

  // --- TABLE COLUMNS ---
  const columns = [
    { 
      title: 'UID', 
      render: (_: any, __: any, i: number) => (
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
      title: 'IDENTITAS PERSONEL', 
      render: (r: any) => (
        <Space size={16}>
          <div style={{
            position: 'relative',
            padding: '2px',
            background: 'linear-gradient(135deg, #007aff 0%, #00d1ff 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Avatar 
              shape="circle" 
              size={44} 
              src={getFileUrl(r.foto) || undefined} 
              icon={<AiOutlineUser />} 
              style={{ border: '2px solid #fff' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Text strong style={{ fontSize: '14px', color: '#1e293b', letterSpacing: '-0.2px', lineHeight: 1 }}>
              {r.fullname?.toUpperCase()}
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Text style={{ fontSize: '10px', fontFamily: dmsTheme.fonts.code, color: '#94a3b8', fontWeight: 600 }}>
                ID:{r.id_pegawai || 'NO_REG'}
              </Text>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1' }} />
              <Text style={{ fontSize: '9px', color: dmsTheme.colors.primary, fontWeight: 800 }}>
                VERIFIED
              </Text>
            </div>
          </div>
        </Space>
      )
    },
    { 
      title: 'ACCESS LEVEL', 
      dataIndex: 'role', 
      width: 160,
      render: (role: string) => {
        const isRoleAdmin = role?.toLowerCase() === 'admin';
        return (
          <div style={{
            background: isRoleAdmin ? '#eff6ff' : '#f8fafc',
            border: `1px solid ${isRoleAdmin ? '#3b82f630' : '#e2e8f0'}`,
            padding: '4px 10px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isRoleAdmin ? '#3b82f6' : '#94a3b8' }} />
            <Text style={{ fontSize: '10px', fontWeight: 800, color: isRoleAdmin ? '#1e40af' : '#475569', letterSpacing: '0.5px' }}>
              {role?.toUpperCase()}
            </Text>
          </div>
        );
      }
    },
    { 
      title: 'CONTROL INTERFACE', 
      align: 'right',
      width: 200,
      render: (r: any) => (
        <Space size={4}>
          <Tooltip title="View ID Card">
            <Button className="action-btn-industrial" icon={<AiOutlineIdcard />} onClick={() => { setSelectedUser(r); setIsIdCardVisible(true); }} />
          </Tooltip>
          
          {isAdminUser && (
            <>
              <div style={{ width: '1px', height: '16px', background: '#e2e8f0', margin: '0 4px' }} />
              <Tooltip title="Edit Profile">
                <Button className="action-btn-industrial" icon={<AiOutlineEdit />} onClick={() => {
                     setEditingUser(r);
                     setPreviewFoto(getFileUrl(r.foto));
                     form.setFieldsValue(r);
                     setIsModalVisible(true);
                }} style={{ color: dmsTheme.colors.primary }} />
              </Tooltip>
              
              <Popconfirm 
                title="PURGE_USER_DATA: Konfirmasi penghapusan?" 
                onConfirm={async () => {
                    const res = await api.deleteUser(r.id);
                    if (res?.success) { msgApi.success('Purged'); fetchUsers(true); }
                }}
                okText="Purge" okButtonProps={{ danger: true, size: 'small' }}
              >
                <Button className="action-btn-industrial-danger" danger icon={<AiOutlineDelete />} disabled={r.id === currentUser.id} />
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.fullname?.toLowerCase().includes(searchText.toLowerCase()));
  }, [users, searchText]);

  return (
    <ConfigProvider theme={{ token: { borderRadius: 12, colorPrimary: '#007AFF' } }}>
      <div style={localStyles.container}>
        <style>{globalCss}</style>
        
        <UserFormModal 
          visible={isModalVisible}
          form={form}
          loading={actionLoading}
          editingUser={editingUser}
          previewFoto={previewFoto}
          onCancel={() => { setIsModalVisible(false); form.resetFields(); }}
          onFinish={onFinish}
          onSelectFoto={handleSelectFoto}
          onGenerateId={() => form.setFieldsValue({ id_pegawai: generateUniqueId() })}
        />

        <DataTable
          tableTitle="Data Pengguna"
          tableIcon={<FcAcceptDatabase size={40}/>}
          dataSource={filteredUsers}
          columns={columns as any}
          rowKey="id"
          loading={loading}
          extra={
            <Space size={12}>
              <Input 
                style={localStyles.searchBar as any}
                prefix={<AiOutlineSearch style={{ opacity: 0.4 }} />} 
                placeholder="Cari nama..." 
                value={searchText} 
                onChange={e => setSearchText(e.target.value)} 
                allowClear 
              />
              <Button style={localStyles.addButton as any} type="primary" icon={<AiOutlinePlus />} onClick={() => {
                setEditingUser(null);
                setPreviewFoto(null);
                form.resetFields();
                form.setFieldsValue({ id_pegawai: generateUniqueId(), role: 'user' });
                setIsModalVisible(true);
              }}>TAMBAH PENGGUNA</Button>
            </Space>
          }
        />

        <PersonnelIdCard 
          visible={isIdCardVisible}
          user={selectedUser}
          onClose={() => setIsIdCardVisible(false)}
          formatFilePath={getFileUrl}
        />
      </div>
    </ConfigProvider>
  );
};