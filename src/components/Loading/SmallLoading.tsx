import React from 'react';
import { Spin } from 'antd';
import { dmsTheme } from '@/styles/dms.theme';

interface Props {
  size?: number;       // Tinggi maksimal bar
  tip?: string;        // Teks loading
  color?: string;      // Warna bar
}

export const SmallLoading: React.FC<Props> = ({ 
  size = 14, 
  tip, 
  color = dmsTheme.colors.primary 
}) => {
  // Indikator custom: 3 bar vertikal tipis (Data Transmission Look)
  const industrialIndicator = (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', // Diubah ke center agar bar tumbuh dari tengah ke atas-bawah
      gap: '2px', 
      height: size,
    }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="industrial-bar"
          style={{
            width: '2px', // Lebih tipis agar elegan
            background: color,
            borderRadius: '1px',
            boxShadow: `0 0 6px ${color}40`,
            animation: 'industrial-grow 0.8s infinite ease-in-out',
            animationDelay: `${i * 0.15}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 8,
      padding: '2px 4px'
    }}>
      <Spin indicator={industrialIndicator} />
      {tip && (
        <span style={{ 
          fontSize: '10px', // Lebih kecil menyesuaikan tema
          fontWeight: 800, 
          letterSpacing: '0.5px', 
          color: color,
          textTransform: 'uppercase',
          fontFamily: 'monospace', // Memberikan kesan teknis
        }}>
          {tip}
        </span>
      )}

      <style>{`
        @keyframes industrial-grow {
          0%, 100% { height: 4px; opacity: 0.3; }
          50% { height: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};