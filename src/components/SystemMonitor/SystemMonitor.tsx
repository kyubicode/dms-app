import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, Row, Col, Typography, Space, Progress, Badge, Tooltip as AntTooltip } from 'antd';
import { 
  AiOutlineThunderbolt, 
  AiOutlineLineChart,
  AiOutlineInfoCircle
} from 'react-icons/ai';
import { dmsTheme } from '@/styles/dms.theme';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

/** * 1. STYLES dideklarasikan di paling atas untuk menghindari ReferenceError
 */
const localStyles: Record<string, React.CSSProperties> = {
  mainCard: {
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    background: '#fff',
    overflow: 'hidden',
    marginBottom: '0px'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconContainer: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  subText: { fontSize: '10px', fontFamily: dmsTheme.fonts.code, letterSpacing: '0.5px' },
  sectionLabel: { fontSize: '10px', color: '#94a3b8', letterSpacing: '1px', fontFamily: dmsTheme.fonts.code },
  statRow: { padding: '4px' },
  flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  valueBox: { display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' },
  gpuEngineBox: { 
    background: '#00162E', 
    padding: '16px', 
    borderRadius: '14px', 
    border: '1px solid rgba(255,255,255,0.05)' 
  },
  gpuLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 900, letterSpacing: '1px' },
  gpuInfoInner: { marginTop: '12px' },
  gpuModelText: { display: 'block', color: '#fff', fontSize: '13px', fontWeight: 600 },
  microLabel: { display: 'block', fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 },
  microValue: { display: 'block', fontSize: '11px', color: dmsTheme.colors.accent, fontWeight: 800, fontFamily: dmsTheme.fonts.code },
  customTooltip: {
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '8px 12px',
    border: '1px solid #f1f5f9',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  }
};

/** * 2. KOMPONEN PEMBANTU (Helper Components)
 */
const DividerVertical = () => <span style={{ color: '#e2e8f0', margin: '0 4px' }}>|</span>;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={localStyles.customTooltip as any}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: '10px', color: '#64748b' }}>{payload[0].payload.time}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} style={{ color: entry.color, fontSize: '12px', fontWeight: 700 }}>
            {entry.name}: {entry.value}%
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/** * 3. KOMPONEN UTAMA
 */
export const SystemMonitor: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    gpuModel: 'Scanning Hardware...',
    vramTotal: 0,
    vramUsed: 0,
    ramUsedPercent: 0,
    ramUsedGB: 0
  });

  const isCritical = useMemo(() => stats.ramUsedPercent > 80, [stats.ramUsedPercent]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const electronAPI = (window as any).electron;
        if (electronAPI) {
          // Menyesuaikan dengan nama handler di backend
          const res = await electronAPI.invoke('system:get-gpu-usage');
          if (res) {
            setStats(res);
            const vramPrc = res.vramTotal > 0 ? Math.round((res.vramUsed / res.vramTotal) * 100) : 0;

            setData(prev => {
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
              const newData = [...prev, { 
                time: timeStr, 
                ram: res.ramUsedPercent,
                vram: vramPrc 
              }];
              return newData.slice(-15);
            });
          }
        }
      } catch (err) {
        console.error("Hardware Monitor Sync Error", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginBottom: '24px' }}>
      <Row gutter={[16, 16]}>
        
        {/* CHART AREA */}
        <Col span={16}>
          <Card 
            bordered={false} 
            style={{...localStyles.mainCard, borderTop: `3px solid ${isCritical ? '#f5222d' : dmsTheme.colors.primary}`} as any}
          >
            <div style={localStyles.cardHeader as any}>
              <Space size={12}>
                <div style={{...localStyles.iconContainer, background: isCritical ? '#fff1f0' : dmsTheme.colors.secondary} as any}>
                  <AiOutlineLineChart size={20} color={isCritical ? '#f5222d' : dmsTheme.colors.primary} />
                </div>
                <div>
                  <Title level={5} style={{ margin: 0, fontSize: '14px', letterSpacing: '0.5px' }}>
                    RESOURCE_ANALYTICS_CORE
                  </Title>
                  <Space split={<DividerVertical />}>
                    <Text type="secondary" style={localStyles.subText as any}>LIVE_UTILIZATION</Text>
                    <Text style={{...localStyles.subText, color: dmsTheme.colors.status.success} as any}>STABLE_LINK</Text>
                  </Space>
                </div>
              </Space>
              <div style={{textAlign: 'right'}}>
                <Badge status={isCritical ? "error" : "processing"} />
                <Text style={{ fontSize: '10px', fontWeight: 800, color: isCritical ? '#f5222d' : dmsTheme.colors.status.success }}>
                  {isCritical ? 'OVERLOAD_WARNING' : 'SYSTEM_OPTIMAL'}
                </Text>
              </div>
            </div>

            <div style={{ height: 180, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isCritical ? '#f5222d' : dmsTheme.colors.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isCritical ? '#f5222d' : dmsTheme.colors.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="vramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={dmsTheme.colors.accent} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={dmsTheme.colors.accent} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="ram" 
                    name="System RAM"
                    stroke={isCritical ? '#f5222d' : dmsTheme.colors.primary} 
                    strokeWidth={3}
                    fill="url(#ramGradient)" 
                    isAnimationActive={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vram" 
                    name="GPU VRAM"
                    stroke={dmsTheme.colors.accent} 
                    strokeWidth={3}
                    fill="url(#vramGradient)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* STATS INFO AREA */}
        <Col span={8}>
          <Card bordered={false} style={localStyles.mainCard as any}>
            <Space direction="vertical" size={20} style={{ width: '100%', padding: '20px' }}>
              <div style={localStyles.statRow as any}>
                <div style={localStyles.flexBetween as any}>
                  <Text strong style={localStyles.sectionLabel as any}>MEM_POOL_USAGE</Text>
                  <AntTooltip title="Physical RAM allocated by OS">
                    <AiOutlineInfoCircle size={12} color="#94a3b8" />
                  </AntTooltip>
                </div>
                <div style={localStyles.valueBox as any}>
                  <Title level={3} style={{ margin: 0, fontFamily: dmsTheme.fonts.code }}>
                    {stats.ramUsedPercent}<small style={{fontSize: '14px'}}>%</small>
                  </Title>
                  <Text type="secondary" style={{fontSize: '11px'}}>{stats.ramUsedGB} GB Used</Text>
                </div>
                <Progress 
                  percent={stats.ramUsedPercent} 
                  showInfo={false} 
                  strokeColor={isCritical ? '#f5222d' : dmsTheme.colors.primary}
                  strokeWidth={8}
                  style={{marginTop: '8px'}}
                />
              </div>

              <motion.div 
                animate={{ boxShadow: isCritical ? "0 0 15px rgba(245,34,45,0.2)" : "0 0 0px rgba(0,0,0,0)" }}
                style={localStyles.gpuEngineBox as any}
              >
                <div style={localStyles.flexBetween as any}>
                  <Space>
                    <AiOutlineThunderbolt color={dmsTheme.colors.accent} />
                    <Text style={localStyles.gpuLabel as any}>GPU_ACCELERATION</Text>
                  </Space>
                  <Badge color={dmsTheme.colors.accent} />
                </div>
                <div style={localStyles.gpuInfoInner as any}>
                  <Text ellipsis style={localStyles.gpuModelText as any}>{stats.gpuModel}</Text>
                  <Row gutter={8} style={{marginTop: '10px'}}>
                    <Col span={12}>
                      <Text style={localStyles.microLabel as any}>VRAM_TOTAL</Text>
                      <Text style={localStyles.microValue as any}>{stats.vramTotal}MB</Text>
                    </Col>
                    <Col span={12}>
                      <Text style={localStyles.microLabel as any}>BUS_LOAD</Text>
                      <Text style={localStyles.microValue as any}>{stats.vramUsed > 0 ? 'ACTIVE' : 'IDLE'}</Text>
                    </Col>
                  </Row>
                </div>
              </motion.div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};