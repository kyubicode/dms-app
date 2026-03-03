import React from 'react';
import { Switch } from 'antd';

// Gunakan export interface agar bisa terbaca di file lain
export interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  color?: string;
  extra?: React.ReactNode; // Properti baru
}

export const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  label, 
  desc, 
  checked, 
  onChange, 
  color, 
  extra 
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '16px 0',
      borderBottom: '1px solid #f1f5f9',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <div style={{ 
          color: color || '#64748b',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{label}</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{desc}</span>
        </div>
      </div>

      <div className="setting-action" style={{ marginLeft: '16px', minWidth: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        {/* Logika: Tampilkan extra jika ada, jika tidak ada baru tampilkan Switch */}
        {extra ? (
          extra
        ) : (
          onChange !== undefined && <Switch checked={checked} onChange={onChange} />
        )}
      </div>
    </div>
  );
};