import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Input, Button, message, ConfigProvider } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { RiShieldUserFill } from "react-icons/ri";
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
      const result = await (window as any).electron.login(username, password);
      if (!result.success) {
        message.error(result.message || "Invalid access.");
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(result.user));
      setIsRedirecting(true);

      setTimeout(() => {
        loginStore.login(result.user);
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      message.error("System connection error.");
      setLoading(false);
    }
  };

  if (isRedirecting) return <LoadingScreen />;

  return (
    <ConfigProvider theme={{ token: { borderRadius: 12, colorPrimary: '#007AFF' } }}>
      <div style={styles.container as any}>
        <div style={styles.lightLeak as any} />
        
        <div style={styles.loginBox as any} className="mac-card-entry">
          <div style={styles.header as any}>
            <div style={styles.avatarRing as any}>
              <div style={styles.avatarInner as any}><RiShieldUserFill /></div>
            </div>
            <Title level={3} style={styles.mainTitle as any}>DMS SYSTEM</Title>
            <Text style={styles.subTitle as any}>Enterprise Secure Access</Text>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <Text strong style={{ fontSize: '11px', color: '#1d1d1f', display: 'block', marginBottom: '4px' }}>OPERATOR ID</Text>
              <Input autoFocus size="large" value={username} onChange={e => setUsername(e.target.value)} style={styles.inputField as any} variant="borderless" />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <Text strong style={{ fontSize: '11px', color: '#1d1d1f', display: 'block', marginBottom: '4px' }}>ACCESS KEY</Text>
              <Input.Password size="large" value={password} onChange={e => setPassword(e.target.value)} style={styles.inputField as any} variant="borderless" />
            </div>

            <Button type="primary" htmlType="submit" loading={loading} style={styles.submitBtn as any}>
              Sign In <ArrowRightOutlined style={{ marginLeft: 8 }} />
            </Button>
          </form>

          <div style={styles.footer as any}>
            <Text style={{ fontSize: '10px', color: 'rgba(0,0,0,0.3)', fontWeight: 600 }}>PROTECTED BY ZEN-CORE V2</Text>
          </div>
        </div>

        <style>{`
          .mac-card-entry { animation: cardAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes cardAppear {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}