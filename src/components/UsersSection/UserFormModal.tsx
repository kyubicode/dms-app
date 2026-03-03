import React from 'react';
import { Modal, Form, Row, Col, Input, Select, Space, Typography } from 'antd';
import { AiOutlineCamera, AiOutlineEdit, AiOutlineFileText, AiOutlineIdcard, AiOutlineUser, AiOutlineReload, AiOutlineLock } from 'react-icons/ai';
import { FormInput } from '../FormInput/FormInput';
import { localStyles } from './UsersSection.styles';

const { Text } = Typography;

interface UserFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  editingUser: any | null;
  loading: boolean;
  form: any;
  previewFoto: string | null;
  onSelectFoto: () => void;
  onGenerateId: () => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  visible,
  onCancel,
  onFinish,
  editingUser,
  loading,
  form,
  previewFoto,
  onSelectFoto,
  onGenerateId
}) => {
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={750}
      centered
      destroyOnClose
      className="apple-modal"
    >
      <FormInput
        form={form}
        loading={loading}
        onFinish={onFinish}
        isEdit={!!editingUser}
        onReset={onCancel}
        title={!!editingUser ? 'Update Personnel' : 'Register Personnel'}
      >
        <Col span={8}>
          <Text strong style={localStyles.photoLabel}>PROFILE_IMAGE</Text>
          <div className="photo-box-apple" onClick={onSelectFoto}>
            {previewFoto ? (
              <img src={previewFoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
            ) : (
              <Space direction="vertical" align="center" style={{ opacity: 0.4 }}>
                <AiOutlineCamera size={28} />
                <Text style={{ fontSize: 10, fontWeight: 600 }}>UPLOAD</Text>
              </Space>
            )}
            <div className="photo-overlay">
              <AiOutlineEdit size={20} />
            </div>
          </div>
          <Form.Item name="foto" hidden><Input /></Form.Item>
        </Col>

        <Col span={16}>
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <Form.Item name="fullname" label="FULL_NAME" rules={[{ required: true }]}>
                <Input placeholder="John Doe" style={localStyles.inputField} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="id_pegawai" label="STAFF_ID" rules={[{ required: true }]}>
                <Input
                  suffix={<AiOutlineReload style={{ cursor: 'pointer', color: '#007AFF' }} onClick={onGenerateId} />}
                  style={localStyles.inputField}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="username" label="USERNAME" rules={[{ required: true }]}>
                <Input style={localStyles.inputField} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="ROLE" rules={[{ required: true }]}>
                <Select style={{ height: 42 }} options={[{ label: 'Administrator', value: 'admin' }, { label: 'Operator', value: 'user' }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="password" label={editingUser ? "CHANGE_KEY" : "ACCESS_KEY"} rules={editingUser ? [] : [{ required: true }]}>
                <Input.Password placeholder="••••••••" style={localStyles.inputField} />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </FormInput>
    </Modal>
  );
};