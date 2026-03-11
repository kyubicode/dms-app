import React from 'react';
import { 
  Form, Input, DatePicker, Button, Row, Col, 
  Space, ConfigProvider, InputNumber, Select, 
  Card, Typography 
} from 'antd';
import { AiFillSave, AiOutlineReload } from 'react-icons/ai';
import { dmsTheme } from '@/styles/dms.theme';

const { Text, Title } = Typography;
const { colors, shadow, fonts } = dmsTheme;

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'password' | 'textarea' | 'custom';
export type FormVariant = 'tumpuk' | 'bersih'; 

export interface FormField {
  name: string;
  label: React.ReactNode; 
  type: FieldType;
  icon?: React.ReactNode; 
  placeholder?: string;
  rules?: any[];
  span?: number; 
  options?: { label: string; value: any }[];
  render?: () => React.ReactNode;
}

interface Props {
  form: any;
  loading: boolean;
  onFinish: (values: any) => void;
  fields?: FormField[];
  variant?: FormVariant;
  isEdit?: boolean;
  onReset?: () => void;
  title?: string;
  icon?: React.ReactNode;
  hideCard?: boolean;
  children?: React.ReactNode;
}

export const FormInput: React.FC<Props> = ({
  form,
  loading,
  onFinish,
  fields = [],
  variant = 'tumpuk',
  isEdit = false,
  onReset,
  title,
  icon,
  hideCard = false,
  children
}) => {
  const isClean = variant === 'bersih';

  const renderInput = (field: FormField) => {
    const commonStyle: React.CSSProperties = { 
      width: '100%', 
      borderRadius: '4px', 
      fontSize: '13px',
      background: '#fff', 
      border: `1px solid ${colors.border}`,
      fontFamily: fonts.main,
      transition: 'all 0.2s ease'
    };
    
    const placeholder = typeof field.label === 'string' ? `Input ${field.label}...` : '';

    // FIX: Container diarahkan ke modal-content agar tidak terpotong dan tidak mental
    const getContainer = () => (document.querySelector('.mac-modal .ant-modal-content') as HTMLElement) || document.body;

    switch (field.type) {
      case 'custom':
        return field.render ? field.render() : null;
      case 'number': 
        return <InputNumber placeholder={placeholder} style={{...commonStyle, height: '42px', display: 'flex', alignItems: 'center'}} prefix={field.icon} />;
      case 'date': 
        return (
          <DatePicker 
            placeholder={placeholder} 
            style={{...commonStyle, height: '42px'}} 
            suffixIcon={field.icon} 
            format="DD/MM/YYYY" 
            getPopupContainer={getContainer}
            // STOP PROPAGATION AGAR MODAL TIDAK MENDETEKSI CLICK OUTSIDE
            onMouseDown={(e) => e.stopPropagation()} 
            popupStyle={{ zIndex: 11000 }} // Lebih tinggi dari Modal
          />
        );
      case 'select': 
        return (
          <Select 
            placeholder={placeholder} 
            style={{...commonStyle, height: '42px'}} 
            options={field.options} 
            suffixIcon={field.icon} 
            getPopupContainer={getContainer}
            dropdownStyle={{ zIndex: 11000 }}
          />
        );
      case 'textarea': 
        return <Input.TextArea placeholder={placeholder} rows={4} style={{ ...commonStyle, height: 'auto', padding: '10px' }} />;
      case 'password': 
        return <Input.Password placeholder={placeholder} style={{...commonStyle, height: '42px'}} prefix={field.icon} />;
      default: 
        return <Input placeholder={placeholder} style={{...commonStyle, height: '42px'}} prefix={field.icon} />;
    }
  };

  const formContent = (
    <Form form={form} onFinish={onFinish} requiredMark={false} layout="vertical" style={{ width: '100%' }}>
      {/* ... bagian Row dan Col tetap sama ... */}
      <Row gutter={[24, 4]}>
        {children ? children : fields.map((field) => (
          <Col key={field.name} span={field.span || 12} xs={24} sm={field.span || 12}>
            <Form.Item name={field.name} label={!isClean ? (
                <Space size={6} style={{ marginBottom: '2px' }}>
                  <div style={{ width: '8px', height: '2px', background: colors.accent, borderRadius: '1px' }} />
                  <Text strong style={{ fontSize: '11px', color: colors.text.secondary, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: fonts.code }}>
                    {field.label}
                  </Text>
                </Space>
              ) : null} rules={field.rules}>
              {renderInput(field)}
            </Form.Item>
          </Col>
        ))}
      </Row>
      
      {/* Footer Buttons tetap sama */}
      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `1px dashed ${colors.border}`, display: 'flex', justifyContent: 'flex-end' }}>
        <Space size="middle">
          {onReset && (
            <Button onClick={onReset} disabled={loading} icon={<AiOutlineReload />} style={{ height: '40px', padding: '0 20px', borderRadius: '4px', fontWeight: 600 }}>RESET</Button>
          )}
          <Button type="primary" htmlType="submit" loading={loading} icon={<AiFillSave />} style={{ height: '40px', padding: '0 32px', borderRadius: '4px', background: isEdit ? colors.status.warning : colors.primary, border: 'none', fontWeight: 700, boxShadow: shadow.card, fontFamily: fonts.code }}>
            {isEdit ? 'UPDATE_DATABASE' : 'SAVE_RECORDS'}
          </Button>
        </Space>
      </div>
    </Form>
  );

  return (
    <ConfigProvider 
      theme={{ 
        token: { borderRadius: 4, colorPrimary: colors.primary, fontFamily: fonts.main, colorBorder: colors.border },
        components: {
          Input: { activeBorderColor: colors.primary, hoverBorderColor: colors.accent },
          Select: { colorPrimaryHover: colors.accent }
        }
      }}
    >
      {hideCard ? (
        <div style={{ padding: '8px 0' }}>{formContent}</div>
      ) : (
        <Card 
          bordered={false}
          title={title && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 0' }}>
              <div style={{ background: isEdit ? colors.status.warning : colors.primary, width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', borderRadius: '4px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                {icon || <AiFillSave size={20} />}
              </div>
              <div>
                <Title level={5} style={{ margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '14px', color: colors.text.primary }}>{title}</Title>
                <Text style={{ fontSize: '10px', color: colors.text.secondary, fontFamily: fonts.code }}>PROTOCOL: {isEdit ? 'UPDATE_SEQUENCE' : 'DATA_ENTRY'}</Text>
              </div>
            </div>
          )}
          style={{ borderRadius: '8px', boxShadow: shadow.card, borderLeft: `4px solid ${isEdit ? colors.status.warning : colors.accent}`, background: '#ffffff', overflow: 'visible' }}
          styles={{ header: { borderBottom: `1px solid ${colors.border}`, padding: '16px 24px' }, body: { padding: '24px 32px', overflow: 'visible' } }}
        >
          {formContent}
        </Card>
      )}
    </ConfigProvider>
  );
};