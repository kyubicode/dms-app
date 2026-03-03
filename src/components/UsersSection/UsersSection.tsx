import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Space, Input, Form, ConfigProvider, 
  Typography, Button, Tag, Popconfirm, Avatar, App 
} from 'antd';
import { 
  AiOutlineSearch, AiOutlineDelete, AiOutlineEdit,
  AiOutlineIdcard, AiOutlineUser, AiOutlineDatabase, AiOutlinePlus 
} from 'react-icons/ai';

// Import komponen internal
import { DataTable } from '../DataTable/DataTable'; 
import { PersonnelIdCard } from '../PersonnelIdCard/PersonnelIdCard';
import { UserFormModal } from './UserFormModal'; // Komponen yang kita pisah tadi
import { localStyles, globalCss } from './UsersSection.styles';

const { Text } = Typography;

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
  const isAdmin = currentUser.role === 'admin';

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
      msgApi.error("SYSTEM_SYNC_ERROR"); 
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
        msgApi.success(editingUser ? 'DATA_UPDATED' : 'PERSONNEL_REGISTERED');
        setIsModalVisible(false);
        fetchUsers(true);
      } else {
        msgApi.error(res?.message || 'TRANSACTION_REJECTED');
      }
    } catch (err) { msgApi.error('TRANSACTION_FAILED'); } 
    finally { setActionLoading(false); }
  };

  // --- TABLE COLUMNS ---
  const columns = [
    { 
      title: 'IDX', 
      render: (_: any, __: any, i: number) => (
        <div style={localStyles.idxBadge}>{(i + 1).toString().padStart(3, '0')}</div>
      ), 
      width: 70, align: 'center' 
    },
    { 
      title: 'IDENTITAS PERSONEL', 
      render: (r: any) => (
        <Space size={12}>
          <div style={localStyles.avatarWrapper}>
            <Avatar 
              shape="circle" size={42} 
              src={getFileUrl(r.foto) || undefined} 
              icon={<AiOutlineUser />} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={localStyles.nameText}>{r.fullname}</Text>
            <Text style={localStyles.idText}>{r.id_pegawai || 'NO_ID'}</Text>
          </div>
        </Space>
      )
    },
    { 
      title: 'ACCESS_LEVEL', 
      dataIndex: 'role', 
      width: 140,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'blue' : 'default'} style={localStyles.roleTag}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
    { 
      title: 'CONTROL_PANEL', 
      align: 'right',
      width: 180,
      render: (r: any) => (
        <Space size={8}>
          <Button 
            className="action-btn-apple" 
            icon={<AiOutlineIdcard />} 
            onClick={() => { setSelectedUser(r); setIsIdCardVisible(true); }} 
          />
          {isAdmin && (
            <>
              <Button className="action-btn-apple" icon={<AiOutlineEdit />} onClick={() => {
                   setEditingUser(r);
                   setPreviewFoto(getFileUrl(r.foto));
                   form.setFieldsValue(r);
                   setIsModalVisible(true);
              }} />
              <Popconfirm title="Hapus data?" onConfirm={async () => {
                  const res = await api.deleteUser(r.id);
                  if (res?.success) { msgApi.success('Purged'); fetchUsers(true); }
              }}>
                <Button className="action-btn-apple" danger icon={<AiOutlineDelete />} disabled={r.id === currentUser.id} />
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
    <ConfigProvider theme={{ 
      token: { borderRadius: 12, colorPrimary: '#007AFF' } 
    }}>
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
          tableIcon={<AiOutlineDatabase style={{ color: '#007AFF' }} />}
          dataSource={filteredUsers}
          columns={columns as any}
          rowKey="id"
          loading={loading}
          extra={
            <Space size={12}>
              <Input 
                prefix={<AiOutlineSearch style={{ opacity: 0.4 }} />} 
                placeholder="Cari nama..." 
                value={searchText} 
                onChange={e => setSearchText(e.target.value)} 
                style={{ width: 220, borderRadius: 10 }}
                allowClear 
              />
              <Button type="primary" icon={<AiOutlinePlus />} onClick={() => {
                setEditingUser(null);
                setPreviewFoto(null);
                form.resetFields();
                form.setFieldsValue({ id_pegawai: generateUniqueId(), role: 'user' });
                setIsModalVisible(true);
              }}>Add Personnel</Button>
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