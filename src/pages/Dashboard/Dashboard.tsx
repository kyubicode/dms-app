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
// Dashboard.tsx
useEffect(() => {
  const fetchBackendData = async () => {
    try {
      const electronAPI = (window as any).electron;
      if (!electronAPI) return;

      // Ambil data
      const [resStats, resSys] = await Promise.all([
        electronAPI.getDashboardStats(),
        electronAPI.getAppSysInfo()
      ]);
      
      console.log("📥 Dashboard Main Fetch:", resStats);
      
      if (resStats) {
        setStats({
          totalLaporan: Number(resStats.totalLaporan || 0),
          totalFoto: Number(resStats.totalFoto || 0),
          totalAlbum: Number(resStats.totalAlbum || resStats.totalDokumentasi || 0)
        });
      }
      if (resSys) setSysInfo(resSys);
    } catch (err) { 
      console.error("Dashboard Fetch Error:", err); 
    } finally {
      setIsInitialLoading(false);
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
        borderRadius: 16, 
        fontFamily: dmsTheme.fonts.main 
      },
      components: {
        Card: {
          boxShadowTertiary: '0 4px 20px rgba(0,0,0,0.04)',
        }
      }
    }}>
      <style dangerouslySetInnerHTML={{ __html: injectGlobalTheme() }} />
      <style>{globalCSS}</style>
      <style>{dashboardAnimations}</style>

      {(isInitialLoading || isLoggingOut) && <LoadingScreen />}

      <Layout style={s.layoutBase as any}>
        <div style={s.headerWrapper as any}>
          <DashboardHeader onLogoutStart={() => setIsLoggingOut(true)} />
          <div style={s.navContainer as any}>
            <DashboardNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </div>

        <Content style={s.mainContent as any}>
          <div style={s.breadcrumbArea}>
          <div style={s.breadcrumbFlex}>
            <div style={s.iconBox}>{TabIcon}</div>
            
            <div style={s.titleColumn}>
              <div style={s.titleRow}>
                <span style={s.appNameText}>Window</span>
                <span style={s.slashDivider}>/</span>
                <span style={s.activeTabText}>{activeTab}</span>
              </div>
              
              <Text style={s.metaTextAccent}>
                {sysInfo?.platform?.toUpperCase() || 'SCREEN ACTIVE'} {import.meta.env.VITE_APP_VERSION || '2.0.0'}
              </Text>
            </div>
          </div>
        </div>
          
          <div style={s.contentContainer as any}>
            {RenderedContent}
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}