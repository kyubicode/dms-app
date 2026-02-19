import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Space, Input, message, Form, ConfigProvider, 
  Typography, Button, Tag, Popconfirm, Row, Col, Avatar, Select, Tooltip, Modal 
} from 'antd';
import { 
  AiOutlineSearch, AiOutlineDelete, AiOutlineEdit, AiOutlineCamera,
  AiOutlineIdcard, AiOutlineLock, AiOutlineFileText, AiOutlineUser,
  AiOutlineDatabase, AiOutlinePlus, AiOutlineReload, AiOutlineUserAdd 
} from 'react-icons/ai';

// Internal Components & Styles
import { RoleGuard } from '../Guards/RoleGuard';
import { dmsTheme } from '@/styles/dms.theme'; 
import { FormInput } from '../FormInput/FormInput'; 
import { DataTable } from '../DataTable/DataTable'; 
import { PersonnelIdCard } from '../PersonnelIdCard/PersonnelIdCard';
import { ContentHeader } from '../ContentHeader/ContentHeader';
import { localStyles, globalCss } from './UsersSection.styles';

const { Text } = Typography;

export const UsersSection: React.FC = () => {
  const [form] = Form.useForm();
  
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isIdCardVisible, setIsIdCardVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('user') || '{"role":"user"}'), []);
  const isAdmin = currentUser.role === 'admin';

  // --- BUSINESS LOGIC ---
  const generateUniqueId = useCallback(() => {
    const year = new Date().getFullYear().toString().slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000); 
    return `STF-${year}${random}`;
  }, []);

  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await (window as any).api.getUsers();
      // Delay untuk efek loading premium
      setTimeout(() => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      }, 500);
    } catch (e) { 
      message.error("SYSTEM_SYNC_ERROR: DATABASE_UNREACHABLE"); 
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Search Debounce Effect
  useEffect(() => {
    if (searchText) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [searchText]);

  // --- EVENT HANDLERS ---
  const handleAdd = () => {
    setEditingUser(null);
    setPreviewFoto(null);
    form.resetFields();
    form.setFieldsValue({ id_pegawai: generateUniqueId(), role: 'user' });
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingUser(record);
    setPreviewFoto(record.foto ? `file://${record.foto.replace(/\\/g, '/')}` : null);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    setPreviewFoto(null);
    form.resetFields();
  };

const handleSelectFoto = async () => {
  if (!isAdmin) return;
  try {
    const result = await (window as any).api.selectAvatar(); 
    // Pastikan API selectAvatar Anda sudah memindahkan file ke folder C:\Users\tu20\...\avatar
    
    if (result?.[0]) {
      const rawPath = result[0]; // Ini path asli: C:\Users\tu20\...
      
      // Simpan path ASLI ke form (ini yang masuk ke DATABASE)
      form.setFieldsValue({ foto: rawPath });
      
      // Gunakan protokol file:// untuk PREVIEW di UI
      const displayPath = rawPath.replace(/\\/g, '/');
      setPreviewFoto(`file://${displayPath}?t=${new Date().getTime()}`);
      
      message.success("Foto berhasil disinkronkan");
    }
  } catch (err) {
    message.error("Gagal memproses foto");
  }
};

  const onFinish = async (values: any) => {
    setActionLoading(true);
    try {
      const payload = editingUser ? { ...values, id: editingUser.id } : { ...values };
      if (editingUser && !payload.password) delete payload.password;

      const res = editingUser 
        ? await (window as any).api.updateUser(payload)
        : await (window as any).api.registerUser(payload);
        
      if (res?.success) {
        message.success(editingUser ? 'DATA_UPDATED' : 'PERSONNEL_REGISTERED');
        handleCloseModal();
        fetchUsers(false);
      }
    } catch (err: any) {
      message.error('TRANSACTION_FAILED');
    } finally { 
      setActionLoading(false); 
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await (window as any).api.deleteUser(id);
      if (res?.success || res === true) {
        message.success('RECORD_PURGED');
        fetchUsers(true);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  // --- TABLE COLUMNS DEFINITION ---
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
              shape="square" size={40} 
              src={r.foto ? `file://${r.foto.replace(/\\/g, '/')}` : undefined} 
              icon={<AiOutlineUser />} 
            />
          </div>
          <div>
            <Text strong style={localStyles.nameText}>{r.fullname}</Text>
            <Text style={localStyles.idText}>ID: {r.id_pegawai || 'NO_ID'}</Text>
          </div>
        </Space>
      )
    },
    { 
      title: 'ACCESS_LEVEL', 
      dataIndex: 'role', 
      width: 130,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'volcano' : 'blue'} style={{ fontWeight: 800, fontSize: '10px' }}>
          {role?.toUpperCase()}
        </Tag>
      )
    },
    { 
      title: 'CONTROL_PANEL', 
      align: 'right',
      width: 180,
      render: (r: any) => (
        <Space size={6}>
          <Button className="action-btn-industrial" icon={<AiOutlineIdcard />} onClick={() => { setSelectedUser(r); setIsIdCardVisible(true); }} />
          {isAdmin && (
            <>
              <Button className="action-btn-industrial" icon={<AiOutlineEdit />} style={{ color: dmsTheme.colors.status.warning }} onClick={() => handleEdit(r)} />
              <Popconfirm title="CONFIRM_DELETE?" onConfirm={() => handleDelete(r.id)} okText="PURGE" cancelText="CANCEL" okButtonProps={{ danger: true }}>
                <Button className="action-btn-industrial" danger icon={<AiOutlineDelete />} disabled={r.id === currentUser.id} />
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
    <ConfigProvider theme={{ token: { borderRadius: 4, colorPrimary: dmsTheme.colors.primary } }}>
      <div style={localStyles.container}>
        <style>{globalCss}</style>
        {/* --- MODAL INPUT --- */}
        <Modal open={isModalVisible} onCancel={handleCloseModal} footer={null} width={800} centered destroyOnClose>
          <FormInput 
            form={form} loading={actionLoading} onFinish={onFinish} 
            isEdit={!!editingUser} onReset={handleCloseModal} 
            title={!!editingUser ? 'EDIT_PERSONNEL_FILE' : 'REGISTER_NEW_PERSONNEL'} 
            icon={!!editingUser ? <AiOutlineEdit /> : <AiOutlineUserAdd />}
          >
            <Col span={7}>
               <Text strong style={localStyles.photoLabel}>01 // BIOMETRIC_PHOTO</Text>
               <div className="photo-box-container" onClick={handleSelectFoto}>
                 {previewFoto ? (
                   <>
                     <img src={previewFoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                     <div className="photo-upload-overlay"><AiOutlineCamera size={24} /></div>
                   </>
                 ) : (
                   <Space direction="vertical" align="center" style={{ opacity: 0.4 }}>
                     <AiOutlineCamera size={32} /><Text style={{ fontSize: 9, fontWeight: 800 }}>CLICK_TO_UPLOAD</Text>
                   </Space>
                 )}
               </div>
               <Form.Item name="foto" hidden><Input /></Form.Item>
            </Col>
            <Col span={17}>
               <Row gutter={[16, 0]}>
                 <Col span={24}>
                   <Form.Item name="fullname" label="IDENTITAS_NAMA" rules={[{ required: true }]}>
                     <Input prefix={<AiOutlineFileText />} placeholder="Nama Lengkap" style={localStyles.inputField} />
                   </Form.Item>
                 </Col>
                 <Col span={12}>
                   <Form.Item name="id_pegawai" label="ID_REGISTRATION" rules={[{ required: true }]}>
                     <Input 
                       prefix={<AiOutlineIdcard />} style={localStyles.idInputField}
                       suffix={<AiOutlineReload style={{ cursor: 'pointer' }} onClick={() => form.setFieldsValue({ id_pegawai: generateUniqueId() })} />}
                     />
                   </Form.Item>
                 </Col>
                 <Col span={12}>
                   <Form.Item name="username" label="SYSTEM_USERNAME" rules={[{ required: true }]}>
                     <Input prefix={<AiOutlineUser />} style={localStyles.inputField} />
                   </Form.Item>
                 </Col>
                 <Col span={12}>
                   <Form.Item name="role" label="ACCESS_LEVEL" rules={[{ required: true }]}>
                     <Select style={localStyles.inputField} options={[{label:'ADMINISTRATOR', value:'admin'}, {label:'OPERATOR', value:'user'}]} />
                   </Form.Item>
                 </Col>
                 <Col span={12}>
                   <Form.Item name="password" label={editingUser ? "UPDATE_AUTH_KEY" : "AUTH_KEY"} rules={editingUser ? [] : [{ required: true }]}>
                     <Input.Password prefix={<AiOutlineLock />} placeholder="********" style={localStyles.inputField} />
                   </Form.Item>
                 </Col>
               </Row>
            </Col>
          </FormInput>
        </Modal>

        {/* --- TABLE SECTION --- */}
        <DataTable<any>
          tableTitle="PERSONNEL_REGISTRY_EXPLORER"
          tableIcon={<AiOutlineDatabase />}
          dataSource={filteredUsers}
          columns={columns as any}
          rowKey="id"
          loading={loading}
          extra={
            <Space>
              <Input 
                prefix={<AiOutlineSearch style={{ color: dmsTheme.colors.primary }} />} 
                placeholder="Search name..." value={searchText} 
                onChange={e => setSearchText(e.target.value)} 
                style={{ width: 250, height: 38 }} allowClear 
              />
              <RoleGuard allowedRole="admin" mode="hide">
                <Button 
                  type="primary" icon={<AiOutlinePlus />} onClick={handleAdd}
                  style={{ height: 38, fontWeight: 'bold' }}
                >ADD_PERSONNEL</Button>
              </RoleGuard>
            </Space>
          }
        />

        <PersonnelIdCard 
          visible={isIdCardVisible} user={selectedUser} 
          onClose={() => setIsIdCardVisible(false)} 
          formatFilePath={(p) => p || ''} 
        />
      </div>
    </ConfigProvider>
  );
};