import React, { useMemo } from 'react';
import { Typography, Row, Col, Space, Card, Progress } from 'antd';
import { motion } from 'framer-motion';

// Assets & Stores
import { useAuthStore } from '@/stores/auth.store';
import { dmsTheme } from '@/styles/dms.theme'; 
import { AiOutlineDatabase, AiOutlineCloudServer } from 'react-icons/ai';
import { VscPulse } from "react-icons/vsc";
import { 
  HiOutlineCpuChip, HiOutlineSquare3Stack3D, 
  HiOutlineRocketLaunch, HiOutlineFolderOpen 
} from "react-icons/hi2"; 

// Components & Styles
import { s, globalAnimations } from './HomeSection.styles';
import { SystemMonitor } from '../SystemMonitor/SystemMonitor'; 

const { Text } = Typography;

// --- INTERFACE ---
interface HomeSectionProps {
  stats: {
    totalLaporan: number;
    totalFoto: number;
    totalAlbum?: number;
    totalDokumentasi?: number;
  }; 
  sysInfo?: any;
}

// --- SUB-COMPONENT: LOG LINE ---
const LogLine = ({ text, type, delay }: { text: string; type: 'success' | 'info' | 'trace'; delay: number }) => {
  const colors = { 
    success: dmsTheme.colors.status.success, 
    info: dmsTheme.colors.status.info, 
    trace: dmsTheme.colors.text.secondary 
  };
  return (
    <motion.div 
      initial={{ opacity: 0, x: -5 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay }} 
      style={{ marginBottom: '4px', display: 'flex', gap: '12px', alignItems: 'baseline' }}
    >
      <span style={{ color: colors[type], fontSize: '10px', fontFamily: dmsTheme.fonts.code, fontWeight: 800 }}>
        [{type.toUpperCase()}]
      </span>
      <span style={{ color: '#E2E8F0', fontSize: '11px', fontFamily: dmsTheme.fonts.code, opacity: 0.9 }}>
        {text}
      </span>
    </motion.div>
  );
};

export const HomeSection: React.FC<HomeSectionProps> = ({ stats, sysInfo }) => {
  const { user } = useAuthStore();

  // --- MAPPING DATA DARI PROPS ---
  // Memastikan data selalu sinkron dengan Dashboard.tsx tanpa state tambahan
  const displayStats = useMemo(() => ({
    laporan: stats?.totalLaporan ?? 0,
    foto: stats?.totalFoto ?? 0,
    album: stats?.totalAlbum || stats?.totalDokumentasi || 0 
  }), [stats]);

  const cards = useMemo(() => [
    { label: 'Total Projects', value: displayStats.laporan, icon: <HiOutlineFolderOpen />, color: dmsTheme.colors.status.info, sub: 'Verified Records' },
    { label: 'Storage Assets', value: displayStats.foto, icon: <AiOutlineDatabase />, color: dmsTheme.colors.status.success, sub: `${displayStats.album} Albums Indexed` },
    { label: 'Processor', value: sysInfo?.cpu?.split('@')[0] || 'Core Node', icon: <HiOutlineCpuChip />, color: '#6366f1', sub: sysInfo?.arch || 'x64 Architecture' },
    { label: 'Platform', value: sysInfo?.platform?.toUpperCase() || 'STABLE', icon: <HiOutlineRocketLaunch />, color: dmsTheme.colors.accent, sub: `Build ${sysInfo?.version || 'Stable'}` },
    { label: 'Memory Pool', value: sysInfo?.totalMemory || '16GB', icon: <HiOutlineSquare3Stack3D />, color: '#ec4899', sub: 'Optimized Cache' },
    { label: 'Data Latency', value: '0.02ms', icon: <AiOutlineCloudServer />, color: '#14b8a6', sub: 'Stable Link' },
  ], [displayStats, sysInfo]);

  return (
    <div style={{ padding: '12px 0' }}>
      <style>{globalAnimations}</style>

      {/* Monitor Animasi Sistem */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '24px' }}
      >
        <SystemMonitor />
      </motion.div>

      {/* Dashboard Cards Grid */}
      <Row gutter={[20, 20]} style={{ marginBottom: '24px' }}>
        {cards.map((item, idx) => (
          <Col xs={24} sm={12} lg={8} key={idx}>
            <motion.div 
              whileHover={{ y: -4 }} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 + (idx * 0.05) }}
            >
              <Card style={{ ...s.cleanCard, border: `1px solid ${dmsTheme.colors.border}` } as any} bordered={false}>
                <Row align="middle" gutter={16}>
                  <Col flex="auto">
                    <Text style={s.cardLabel as any}>{item.label.toUpperCase()}</Text>
                    <motion.div 
                      key={item.value} 
                      initial={{ scale: 1.1, opacity: 0.5 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      style={s.cardValue as any}
                    >
                      {item.value}
                    </motion.div>
                    <Space size={6} style={{ marginTop: 4 }}>
                      <VscPulse style={{ color: item.color }} />
                      <Text style={s.cardSub as any}>{item.sub}</Text>
                    </Space>
                  </Col>
                  <Col>
                    <div style={{ ...s.iconCircle, color: item.color, background: `${item.color}12` } as any}>
                      {item.icon}
                    </div>
                  </Col>
                </Row>
                <Progress 
                  percent={75 + (idx * 2)} 
                  showInfo={false} 
                  strokeColor={item.color} 
                  strokeWidth={3} 
                  style={{ marginTop: 16 }} 
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Terminal Diagnostics Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ ...s.terminalWrapper, background: '#00162E', borderColor: dmsTheme.colors.primary } as any}
      >
        <div style={{ ...s.terminalHeader, background: dmsTheme.colors.primary } as any}>
          <div style={{ display: 'flex', gap: '6px', marginRight: '16px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <Text style={{ color: '#fff', fontSize: '9px', fontWeight: 800, fontFamily: dmsTheme.fonts.code }}>
            SYSTEM_DIAGNOSTICS.LOG
          </Text>
        </div>
        <div style={s.terminalContent as any}>
          <LogLine type="success" text={`Authenticated as: ${user?.username}`} delay={0.6} />
          <LogLine type="info" text={`Storage link established: ${displayStats.laporan} records verified.`} delay={0.7} />
          <LogLine type="trace" text={`Hardware_Pool: ${sysInfo?.cpu || 'Detecting...'}`} delay={0.8} />
          <LogLine type="trace" text={`Platform_Registry: ${sysInfo?.platform || 'NodeJS'} | ${sysInfo?.arch || 'x64'}`} delay={0.9} />
          <motion.div 
            animate={{ opacity: [1, 0] }} 
            transition={{ repeat: Infinity, duration: 0.8 }} 
            style={{ ...s.cursor, background: dmsTheme.colors.accent } as any} 
          />
        </div>
      </motion.div>
    </div>
  );
};