import React from 'react';
import { Spin } from 'antd';

interface Props {
  size?: number;       // Diameter spinner
  tip?: string;        // Teks loading
  color?: string;      // Warna spinner (Default: Apple Blue)
}

export const SmallLoading: React.FC<Props> = ({ 
  size = 16, 
  tip, 
  color = '#007AFF' 
}) => {
  // Indikator custom: Minimalist Circular Spinner (Smooth Rotation)
  const appleIndicator = (
    <div style={{ 
      position: 'relative',
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div
        className="apple-spinner-ring"
        style={{
          width: '100%',
          height: '100%',
          border: `2px solid ${color}20`, // Ring tipis transparan
          borderTop: `2px solid ${color}`, // Bagian yang berputar
          borderRadius: '50%',
          animation: 'apple-spin 0.8s linear infinite',
        }}
      />
    </div>
  );

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 10,
      padding: '2px 0'
    }}>
      <Spin indicator={appleIndicator} />
      
      {tip && (
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          letterSpacing: '-0.2px', 
          color: '#1d1d1f', // Gunakan warna teks standar Apple
          opacity: 0.7,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        }}>
          {tip}
        </span>
      )}

      <style>{`
        @keyframes apple-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};