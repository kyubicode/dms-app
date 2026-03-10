import React, { ReactNode, useEffect, useState } from 'react';
import { Button, Typography, Result, ConfigProvider, Space } from 'antd';
import { LockOutlined, ArrowLeftOutlined, LogoutOutlined } from '@ant-design/icons';
import { dmsTheme } from '@/styles/dms.theme';

const { Text } = Typography;

interface RoleGuardProps {
  children: ReactNode;
  allowedRole?: 'admin' | 'user';
  mode?: 'block' | 'hide';
  fallback?: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRole = 'admin', 
  mode = 'block',
  fallback = null 
}) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const sessionString = localStorage.getItem('user');
    if (sessionString) {
      try {
        const parsed = JSON.parse(sessionString);
        const role = String(parsed.role || '').toLowerCase();
        setUserRole(role);
        setIsAuthorized(role === 'admin' || role === allowedRole.toLowerCase());
      } catch (e) {
        setIsAuthorized(false);
      }
    } else {
      setIsAuthorized(false);
    }
  }, [allowedRole]);

  if (isAuthorized === null) return null;

  if (!isAuthorized) {
    if (mode === 'hide') return <>{fallback}</>;

    return (
      <ConfigProvider theme={{ token: { colorPrimary: dmsTheme.colors.primary } }}>
        <div style={styles.container}>
          <Result
            style={{ padding: 0 }} // Menghilangkan padding default Result
            icon={<LockOutlined style={{ color: dmsTheme.colors.accent, fontSize: 48 }} />}
            title={<span style={styles.title}>AKSES TERBATAS</span>}
            subTitle={
              <Space direction="vertical" style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Fitur ini memerlukan otorisasi level <Text strong>{allowedRole.toUpperCase()}</Text>
                </Text>
                <Text style={{ fontSize: 12, opacity: 0.7 }}>
                  Identitas saat ini: <Text code>{userRole.toUpperCase() || 'GUEST'}</Text>
                </Text>
              </Space>
            }
          />
        </div>
      </ConfigProvider>
    );
  }

  return <>{children}</>;
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%', // Lebar Full
    padding: '80px 24px',
    background: '#fff',
    borderRadius: '12px',
    border: `1px solid ${dmsTheme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  title: {
    fontWeight: 800,
    letterSpacing: '1px',
    color: dmsTheme.colors.text.primary,
    fontFamily: dmsTheme.fonts.main,
    fontSize: '20px'
  },
};