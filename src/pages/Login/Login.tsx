import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Input, Button, message } from 'antd';
import { 
  SafetyCertificateFilled,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { RiLoginCircleLine } from "react-icons/ri";
import { useAuthStore } from '@/stores/auth.store';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { loginStyles as styles } from './Login.styles';

const { Title, Text } = Typography;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); 
  
  const navigate = useNavigate();
  const loginStore = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return message.warning("Credentials required.");
    
    setLoading(true);
    try {
      const result = await (window as any).api.login(username, password);

      if (!result.success) {
        message.error(result.message || "Invalid access.");
        setLoading(false);
        return;
      }

      const userData = {
        id: result.user.id,
        username: result.user.username,
        fullname: result.user.fullname,
        role: result.user.role,
        foto: result.user.foto
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      setIsRedirecting(true);

      setTimeout(() => {
        loginStore.login(result.user);
        navigate('/dashboard', { replace: true });
      }, 1500);

    } catch (err) {
      message.error("Link failure.");
      setLoading(false);
    }
  };

  if (isRedirecting) return <LoadingScreen />;

  return (
    <div style={styles.container}>
      <div style={styles.lightLeak} />
      
      <div style={styles.loginBox} className="login-card-hover">
        <div style={styles.header}>
          <div style={styles.avatarRing}>
            <div style={styles.avatarInner}>
              <RiLoginCircleLine style={{ color: '#000' }} />
            </div>
          </div>
          <Title level={3} style={styles.mainTitle}>DMS LOGIN</Title>
          <Text style={styles.subTitle}>Enter credentials for secure boot</Text>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <Input
              autoFocus
              size="large"
              placeholder="Operator ID"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.inputField}
              variant="borderless" // Menghilangkan border default antd agar pakai style custom kita
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Input.Password
              size="large"
              placeholder="Access Key"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.inputField}
              variant="borderless"
            />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={styles.submitBtn}
          >
            Unlock <ArrowRightOutlined style={{ fontSize: 14, marginLeft: 10 }} />
          </Button>
        </form>

        <div style={styles.footer}>
          <Text style={{ fontSize: '10px', color: '#000', fontWeight: 600 }}>
            ENCRYPTED BY ZEN-CORE 2.0
          </Text>
        </div>
      </div>

      <style>{`
        /* Efek Hover Card macOS */
        .login-card-hover:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.5);
        }
        
        /* Smooth Focus untuk Input */
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused {
          background: rgba(255, 255, 255, 0.9) !important;
          border-color: #0071e3 !important;
          box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1) !important;
        }
      `}</style>
    </div>
  );
}