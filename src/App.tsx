import { ConfigProvider, App as AntdApp } from 'antd';
import AppRouter from './routes/AppRouter';
import { injectGlobalTheme, dmsTheme } from '@/styles/dms.theme';

export default function App() {
  return (
    // ConfigProvider membuat komponen AntD (Button, Input, dll) mengikuti warna dmsTheme
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: dmsTheme.colors.primary,
          colorInfo: dmsTheme.colors.status.info,
          colorSuccess: dmsTheme.colors.status.success,
          colorError: dmsTheme.colors.status.danger,
          colorWarning: dmsTheme.colors.status.warning,
          colorBgContainer: dmsTheme.colors.surface,
          colorBgLayout: dmsTheme.colors.background,
          fontFamily: dmsTheme.fonts.main,
          borderRadius: 8,
        },
        components: {
          Table: {
            headerBg: '#f1f5f9', // Menyesuaikan dengan style industrial kamu
            headerColor: dmsTheme.colors.text.primary,
          },
        },
      }}
    >
      {/* Inject CSS variables ke <head> agar bisa dipakai via var(--nama-variabel) */}
      <style dangerouslySetInnerHTML={{ __html: injectGlobalTheme() }} />
      
      {/* AntdApp membungkus agar Modal/Message dari AntD juga ikut tema */}
      <AntdApp> 
        <div style={{ 
          background: 'var(--bg-main)', 
          minHeight: '100vh', 
          color: 'var(--text-main)',
          fontFamily: 'var(--font-main)' 
        }}>
          <AppRouter />
        </div>
      </AntdApp>
    </ConfigProvider>
  );
}