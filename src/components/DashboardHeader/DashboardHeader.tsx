import React from 'react';
import { Layout, Typography, Space, Avatar, Dropdown, message, Badge } from 'antd';
import { 
  AiOutlineUser, AiOutlineSetting, 
  AiOutlineLogout, AiOutlineCaretDown 
} from 'react-icons/ai';
import { HiOutlineBell } from 'react-icons/hi2'; // Icon lebih clean
import { useNavigate } from 'react-router-dom';

// Assets & Store
import { useAuthStore } from '@/stores/auth.store';
import { getFileUrl } from '../../utils/pathHelper';

// Styles
import { s, headerGlobalStyles } from './DashboardHeader.styles';

const { Header } = Layout;
const { Text } = Typography;

interface DashboardHeaderProps {
  onLogoutStart: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogoutStart }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogoutStart();
    setTimeout(() => {
      logout();
      navigate('/login');
      message.success('SYSTEM_OFFLINE');
    }, 800);
  };

  const menuItems = [
    { 
      key: 'settings', 
      label: 'Change Password', 
      icon: <AiOutlineSetting style={{ fontSize: '16px' }} /> 
    },
    { type: 'divider' as const },
    { 
      key: 'logout', 
      label: 'Sign Out', 
      icon: <AiOutlineLogout style={{ fontSize: '16px' }} />, 
      danger: true, 
      onClick: handleLogout 
    },
  ];

  return (
    <Header style={s.headerContainer}>
      <style>{headerGlobalStyles}</style>

      {/* LEFT: BRANDING (NAVY THEME) */}
      <div style={s.leftSection}>
        <div style={s.logoPill}>
          <div style={s.logoDot} />
        </div>
        <div style={{ marginLeft: '12px', lineHeight: 1 }}>
          <Text style={s.brandTitle}>
            DMSmanagement <Text style={s.vTag}>Enterprise</Text>
          </Text>
          <Text style={s.brandSubtitle}>CV. Dinamika Mitra Sinergi</Text>
        </div>
      </div>

      {/* RIGHT: PROFILE SECTION */}
      <div style={s.rightSection}>
        <Space size={20}>
          <Badge dot color="#ff3b30" offset={[-2, 2]}>
            <HiOutlineBell 
              size={22} 
              style={{ color: '#0f172a', cursor: 'pointer', opacity: 0.8 }} 
            />
          </Badge>

          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <div style={s.userProfileCapsule} className="profile-capsule">
              <div style={s.userInfo}>
                <Text strong style={s.userName}>
                  {user?.fullname || 'ADMIN_ROOT'}
                </Text>
                <Text style={s.userRole}>
                  {user?.role?.toUpperCase() || 'SUPER_USER'}
                </Text>
              </div>
              
              <Avatar 
                size={34} 
                src={getFileUrl(user?.foto)} 
                icon={<AiOutlineUser />} 
                style={s.avatarMain}
              />
              <AiOutlineCaretDown style={{ fontSize: '10px', color: '#64748b' }} />
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};