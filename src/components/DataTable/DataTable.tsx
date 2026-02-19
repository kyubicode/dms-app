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
          fontFamily: fonts.main,
          borderRadius: 16, // Lebih rounded khas macOS
          colorPrimary: '#0f172a',
        },
        components: {
          Table: {
            fontSize: 13,
            headerBg: 'transparent', // Header menyatu dengan bar
            headerColor: 'rgba(15, 23, 42, 0.5)',
            headerSplitColor: 'transparent', // Hilangkan garis pemisah header
            cellPaddingInline: 20,
            cellPaddingBlock: 14,
            borderColor: 'rgba(15, 23, 42, 0.05)',
            rowHoverBg: 'rgba(15, 23, 42, 0.03)',
          },
          Pagination: {
            borderRadius: 8,
            colorPrimary: '#0f172a',
          },
        },
      }}
    >
      <div className="macos-table-container">
        {/* --- HEADER BAR (Apple Style Tool Bar) --- */}
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
                  <div className="status-dot" />
                  <Text className="sub-title">
                    {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
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
            } : false}
            {...restProps}
            className="macos-table-root"
          />
        </div>
      </div>

      <style>{`
        .macos-table-container {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          transition: all 0.3s ease;
        }

        .table-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.05);
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-wrapper {
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          opacity: 0.8;
        }

        .main-title {
          font-weight: 700;
          font-size: 16px;
          color: #0f172a;
          letter-spacing: -0.3px;
        }

        .sub-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          background: #34c759;
          border-radius: 50%;
        }

        .sub-title {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        /* Styling Header Table khas Mac (Lower Contrast) */
        .macos-table-root .ant-table-thead > tr > th {
          font-weight: 600 !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          padding-top: 16px !important;
          padding-bottom: 16px !important;
        }

        /* Remove Cell Borders */
        .macos-table-root .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(15, 23, 42, 0.03) !important;
        }

        /* Pagination Clean Up */
        .ant-table-pagination.ant-pagination {
          margin: 16px 24px !important;
        }

        /* Action Buttons Wrapper (jika ada extra) */
        .extra-actions {
          display: flex;
          gap: 8px;
        }

        /* Hover Row Animation */
        .ant-table-row {
          transition: background 0.2s ease;
        }
      `}</style>
    </ConfigProvider>
  );
}