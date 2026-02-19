import React from 'react';
import { Row, Col, Space, Typography, Switch } from 'antd';
import { colors } from '@/styles/dms.theme';

const { Text } = Typography;

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked?: boolean;
  onChange: (label: string, checked: boolean) => void;
  color?: string;
}

export const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, label, desc, checked, onChange, color = colors.primary 
}) => (
  <div className="settings-row">
    <Row align="middle" justify="space-between">
      <Col xs={18}>
        <Space size="middle" align="start">
          <div style={{ ...localStyles.actionIconBox, color }}>{icon}</div>
          <div>
            <Text strong style={localStyles.settingLabel}>{label}</Text>
            <Text type="secondary" style={localStyles.settingDesc}>{desc}</Text>
          </div>
        </Space>
      </Col>
      <Col>
        <Switch 
          defaultChecked={checked} 
          onChange={(c) => onChange(label, c)} 
          style={{ backgroundColor: '#334155' }}
        />
      </Col>
    </Row>
  </div>
);

const localStyles: Record<string, React.CSSProperties> = {
  actionIconBox: { background: '#f8fafc', padding: '8px', borderRadius: '8px', display: 'flex' },
  settingLabel: { fontSize: '13px', color: '#1e293b' },
  settingDesc: { fontSize: '11px', color: '#64748b', display: 'block' },
};