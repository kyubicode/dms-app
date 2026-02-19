import React from 'react';
import { Row, Col, Space, Typography, Button, Divider } from 'antd';
import { motion } from 'framer-motion';
import { AiOutlineReload } from 'react-icons/ai';
import { dmsTheme } from '@/styles/dms.theme';

const { Title, Text } = Typography;

interface IndustrialHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  watermark?: string;
  totalRecords?: number;
  onRefresh?: () => void;
  loading?: boolean;
  showStats?: boolean; 
}

export const ContentHeader: React.FC<IndustrialHeaderProps> = ({
  title,
  subtitle = "Management",
  totalRecords = 0,
  onRefresh,
  loading = false,
  showStats = true 
}) => {
  const version = import.meta.env.VITE_APP_VERSION || 'v1.0.0';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ marginBottom: '32px' }} // Sama dengan margin header Home
    >
      <Row justify="space-between" align="bottom">
        <Col>
          <Space direction="vertical" size={0}>
            {/* Top Bar: Indikator Status & Version (Identik dengan Home) */}
            <Space align="center" style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                  className="dot-pulse" 
                  style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: dmsTheme.colors.status.success 
                  }} 
                />
                <Text style={{ 
                  fontSize: '10px', 
                  fontWeight: 800, 
                  letterSpacing: '1px', 
                  color: dmsTheme.colors.status.success 
                }}>
                  DATA SYNCHRONIZED
                </Text>
              </div>
              <Divider type="vertical" style={{ borderColor: dmsTheme.colors.border }} />
              <Text style={{ 
                fontSize: '10px', 
                fontWeight: 600, 
                color: dmsTheme.colors.text.secondary, 
                opacity: 0.6 
              }}>
                {version}
              </Text>
            </Space>

            {/* Main Title: Gaya Bold & Light (Identik dengan Dashboard Overview) */}
            <Title level={2} style={{ 
              margin: 0, 
              fontSize: '32px', 
              fontWeight: 800, 
              letterSpacing: '-1px',
              color: dmsTheme.colors.text.primary,
              lineHeight: 1.2
            }}>
              {title} <span style={{ fontWeight: 300, color: dmsTheme.colors.text.secondary }}>{subtitle}</span>
            </Title>

            {/* Sub-info baris ketiga */}
            <Text style={{ color: dmsTheme.colors.text.secondary, fontSize: '13px' }}>
              Resource Status: <span style={{ color: dmsTheme.colors.primary, fontWeight: 600 }}>READY</span>
            </Text>
          </Space>
        </Col>

        <Col>
          <Row gutter={24} align="middle">
            {showStats && (
              <Col>
                {/* Stats Display: Identik dengan Clock Container di Home */}
                <div style={{ 
                  textAlign: 'right', 
                  paddingRight: '20px', 
                  borderRight: `3px solid ${dmsTheme.colors.primary}`,
                  lineHeight: 1.1
                }}>
                  <Text style={{ 
                    display: 'block', 
                    fontSize: '28px', 
                    fontWeight: 800, 
                    color: dmsTheme.colors.text.primary,
                    fontFamily: dmsTheme.fonts.code 
                  }}>
                    {totalRecords.toString().padStart(2, '0')}
                  </Text>
                  <Text style={{ 
                    fontSize: '10px', 
                    fontWeight: 700, 
                    color: dmsTheme.colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Total Records
                  </Text>
                </div>
              </Col>
            )}

            {onRefresh && (
              <Col>
                <Button 
                  loading={loading}
                  onClick={onRefresh}
                  type="text"
                  icon={<AiOutlineReload size={18} />}
                  style={{ 
                    height: '42px',
                    width: '42px',
                    borderRadius: '50%',
                    background: '#F0F2F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: dmsTheme.colors.primary,
                    border: 'none'
                  }}
                />
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </motion.div>
  );
};