import React from 'react';
import { Table, ConfigProvider, Typography } from 'antd';
import type { TableProps } from 'antd';
import { dmsTheme } from '@/styles/dms.theme';

const { Text } = Typography;
const { colors, fonts } = dmsTheme;

interface DataTableProps<T> extends TableProps<T> {
  tableTitle?: string;
  tableIcon?: React.ReactNode;
  extra?: React.ReactNode;
}

export function DataTable<T extends object>(props: DataTableProps<T>) {
  const { tableTitle, tableIcon, extra, ...restProps } = props;

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
          borderRadius: 20, // Lebih bulat untuk estetika 2026
          colorPrimary: '#007AFF', // Warna aksen klasik macOS
          colorBgContainer: '#ffffff',
        },
        components: {
          Table: {
            fontSize: 14,
            headerBg: 'rgb(4, 71, 97)', 
            headerColor: '#86868b', // Warna teks tersier Apple
            headerSplitColor: 'transparent',
            cellPaddingInline: 24,
            cellPaddingBlock: 16,
            borderColor: '#f5f5f7',
            rowHoverBg: 'rgba(0, 122, 255, 0.04)', // Highlight biru lembut saat hover
          },
          Pagination: {
            borderRadius: 10,
            colorPrimary: '#007AFF',
            itemSize: 32,
          },
        },
      }}
    >
      <div className="macos-2026-table-wrapper">
        <div className="macos-table-container">
          {/* --- HEADER BAR (Refined Apple Toolbar) --- */}
          {(tableTitle || extra) && (
            <div className="table-top-bar">
              <div className="title-section">
                {tableIcon && (
                  <div className="icon-wrapper">
                    {tableIcon}
                  </div>
                )}
                
                <div className="text-wrapper">
                  <Text className="main-title">{tableTitle}</Text>
                  <div className="sub-title-row">
                    <div className="status-dot-pulse" />
                    <Text className="sub-title">
                      System Active • {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </div>
                </div>
              </div>

              <div className="extra-actions">
                {extra}
              </div>
            </div>
          )}

          {/* --- TABLE BODY --- */}
          <div className="table-inner-body">
            <Table<T>
              size="middle"
              bordered={false}
              pagination={props.pagination !== false ? {
                ...props.pagination,
                showSizeChanger: true,
                position: ['bottomRight'],
                size: 'small',
              } : false}
              {...restProps}
              className="macos-table-root"
            />
          </div>
        </div>
      </div>

      <style>{`
        /* Container Wrapper dengan Ambient Shadow */
        .macos-2026-table-wrapper {
          padding: 10px;
          background: transparent;
        }

        .macos-table-container {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(25px) saturate(180%);
          -webkit-backdrop-filter: blur(25px) saturate(180%);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          overflow: hidden;
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05), 
            0 20px 40px -10px rgba(0, 0, 0, 0.08),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5);
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .table-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 28px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-wrapper {
          background: linear-gradient(145deg, #ffffff, #f0f0f0);
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 20px;
          color: #007AFF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.04);
          border: 0.5px solid rgba(0,0,0,0.05);
        }

        .main-title {
          font-weight: 600;
          font-size: 18px;
          color: #1d1d1f;
          letter-spacing: -0.4px;
          display: block;
        }

        .sub-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }

        .status-dot-pulse {
          width: 6px;
          height: 6px;
          background: #34c759;
          border-radius: 50%;
          position: relative;
        }
        
        .status-dot-pulse::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #34c759;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        .sub-title {
          font-size: 12px;
          color: #86868b;
          font-weight: 400;
        }

        /* Styling Header Table khas macOS (Clean & Subtle) */
        .macos-table-root .ant-table-thead > tr > th {
          font-weight: 500 !important;
          font-size: 12px !important;
          color: #86868b !important;
          background: rgba(250, 250, 252, 0.4) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03) !important;
          transition: all 0.2s ease;
        }

        /* Table Content */
        .macos-table-root .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f5f5f7 !important;
          color: #1d1d1f;
          font-weight: 400;
        }

        /* Hover Effect pada Row */
        .ant-table-row:hover > td {
          background: rgba(0, 122, 255, 0.02) !important;
        }

        /* Pagination Styling */
        .ant-table-pagination.ant-pagination {
          padding: 16px 24px !important;
          margin: 0 !important;
          border-top: 1px solid rgba(0, 0, 0, 0.02);
        }

        .extra-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        /* Custom Scrollbar untuk Table */
        .ant-table-body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .ant-table-body::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
      `}</style>
    </ConfigProvider>
  );
}