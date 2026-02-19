import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Typography, ConfigProvider } from 'antd';
import { 
  HomeOutlined, FileTextOutlined, 
  SettingOutlined, AppstoreOutlined 
} from '@ant-design/icons';
import { FiUsers } from "react-icons/fi";

import { injectGlobalTheme, dmsTheme } from '@/styles/dms.theme';
import { s, globalCSS, dashboardAnimations } from './Dashboard.styles';
import { DashboardStats } from '../../types/Dashboard.types';

// Components
import TitleBar from '../../components/TitleBar/TitleBar';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { DashboardHeader } from '../../components/DashboardHeader/DashboardHeader';
import { DashboardNav } from '../../components/DashboardNav/DashboardNav';
import { HomeSection } from '../../components/HomeSection/HomeSection';
import { UsersSection } from '../../components/UsersSection/UsersSection';
import { SettingsSection } from '../../components/SettingsSection/SettingsSection';
import { LaporanSection } from '../../components/LaporanSection/LaporanSection';

const { Content } = Layout;
const { Text } = Typography;

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ totalLaporan: 0, totalFoto: 0, totalAlbum: 0 });
  const [sysInfo, setSysInfo] = useState<any>(undefined);
  
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [resStats, resSys] = await Promise.all([
          (window as any).api.getDashboardStats(),
          (window as any).api.getSystemInfo()
        ]);
        setStats(resStats);
        setSysInfo(resSys);
      } catch (err) { 
        console.error("Fetch Error:", err); 
      } finally {
        setTimeout(() => setIsInitialLoading(false), 600);
      }
    };
    fetchBackendData();
  }, []);

  const handleTabChange = (key: string) => {
    if (key !== activeTab) setActiveTab(key);
  };

  const TabIcon = useMemo(() => {
    const icons: Record<string, React.ReactNode> = {
      home: <HomeOutlined />, 
      laporan: <FileTextOutlined />,
      pengguna: <FiUsers />, 
      settings: <SettingOutlined />,
    };
    return icons[activeTab] || <AppstoreOutlined />;
  }, [activeTab]);

  const RenderedContent = useMemo(() => {
    const sections: Record<string, React.ReactNode> = {
      home: <HomeSection stats={stats} sysInfo={sysInfo} />,
      laporan: <LaporanSection />,
      pengguna: <UsersSection />,
      settings: <SettingsSection />,
    };
    return sections[activeTab] || sections.home;
  }, [activeTab, stats, sysInfo]);

  return (
    <ConfigProvider theme={{ 
      token: { 
        colorPrimary: '#0f172a', 
        borderRadius: 16, // AntD Card di dalam konten akan mengikuti rounding ini
        fontFamily: dmsTheme.fonts.main 
      },
      components: {
        Card: {
          boxShadowTertiary: '0 4px 20px rgba(0,0,0,0.04)', // Shadow halus untuk card konten
        }
      }
    }}>
      <style dangerouslySetInnerHTML={{ __html: injectGlobalTheme() }} />
      <style>{globalCSS}</style>
      <style>{dashboardAnimations}</style>

      {(isInitialLoading || isLoggingOut) && <LoadingScreen />}
      
      <TitleBar />

      <Layout style={s.layoutBase}>
        <div style={s.headerWrapper}>
          <DashboardHeader onLogoutStart={() => setIsLoggingOut(true)} />
          <div style={s.navContainer}>
            <DashboardNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </div>

        <Content style={s.mainContent}>
          <div style={s.breadcrumbArea}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={s.iconBox}>{TabIcon}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '26px', 
                    fontWeight: 900, 
                    color: '#0f172a',
                    fontFamily: dmsTheme.fonts.code,
                    letterSpacing: '-1.5px'
                  }}>
                    ZenTE
                  </span>
                  <span style={{ color: '#cbd5e1', fontSize: '20px', fontWeight: 300 }}>/</span>
                  <span style={{ 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {activeTab}
                  </span>
                </div>
                <Text style={s.metaTextAccent}>
                  {sysInfo?.platform || 'DARWIN'} // V.{import.meta.env.VITE_APP_VERSION}
                </Text>
              </div>
            </div>
          </div>
          
          {/* AREA KONTEN: Bersih tanpa glass-panel pembungkus */}
          <div style={s.contentContainer}>
            {RenderedContent}
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}