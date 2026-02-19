import React from 'react';
import { motion } from 'framer-motion';
import { 
  AiOutlineAppstore, 
  AiOutlineFileText, 
  AiOutlineControl 
} from 'react-icons/ai';
import { FiUsers } from "react-icons/fi";
import { s } from './DashboardNav.styles';

interface NavProps {
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const DashboardNav: React.FC<NavProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { key: 'home', label: 'Dashboard', icon: <AiOutlineAppstore /> },
    { key: 'laporan', label: 'Laporan', icon: <AiOutlineFileText /> },
    { key: 'pengguna', label: 'Pengguna', icon: <FiUsers /> },
    { key: 'settings', label: 'Settings', icon: <AiOutlineControl /> },
  ];

  // Kunci warna Navy Utama
  const navyPrimary = '#0f172a'; 

  return (
    <div style={s.floatingContainer}>
      <div style={s.navBar}>
        {items.map((item) => {
          const isActive = activeTab === item.key;
          
          return (
            <div
              key={item.key}
              onClick={() => onTabChange(item.key)}
              style={{
                ...s.navItem,
                // Kontras: Putih saat aktif di atas Navy, Navy transparan saat tidak aktif
                color: isActive ? '#ffffff' : 'rgba(15, 23, 42, 0.55)',
                position: 'relative',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    // Pill aktif menggunakan warna Navy Solid
                    background: navyPrimary, 
                    borderRadius: '35px',
                    zIndex: 0,
                    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.25)',
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Pastikan icon dan label di atas pill (zIndex 1) */}
              <span style={{ ...s.icon, zIndex: 1 }}>{item.icon}</span>
              <span style={{ ...s.label, zIndex: 1 }}>{item.label}</span>
              
              {!isActive && (
                <motion.div
                  whileHover={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    // Hover effect: Navy sangat halus
                    background: 'rgba(15, 23, 42, 0.06)',
                    borderRadius: '35px',
                    zIndex: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};