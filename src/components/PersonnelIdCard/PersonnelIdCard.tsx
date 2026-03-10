import React, { useMemo } from 'react';
import { Button, Modal } from 'antd';
// @ts-ignore
import Barcode from 'react-barcode'; 
import { AiOutlinePrinter, AiOutlineClose } from 'react-icons/ai';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import { MdSecurity } from 'react-icons/md';

interface UserRecord {
  id: string;
  fullname: string;
  id_pegawai: string;
  username: string;
  role: 'admin' | 'user';
  foto?: string;
}

interface PersonnelIdCardProps {
  visible: boolean;
  user: UserRecord | null;
  onClose: () => void;
  formatFilePath: (path: string | undefined) => string | null;
}

export const PersonnelIdCard: React.FC<PersonnelIdCardProps> = ({ 
  visible, 
  user, 
  onClose, 
  formatFilePath 
}) => {

  const canPrint = useMemo(() => {
    if (!user || !user.id) return false;
    try {
      const storedData = localStorage.getItem('user');
      if (storedData) {
        const currentUser = JSON.parse(storedData);
        return String(user.id) === String(currentUser?.id);
      }
    } catch (e) { return false; }
    return false;
  }, [user, visible]);

  if (!user) return null;

  const barcodeValue = user.id_pegawai || 'DMS-0000';

  return (
    <Modal 
      open={visible} 
      onCancel={onClose} 
      footer={null} 
      width={600} 
      centered 
      closable={false}
      destroyOnClose
      bodyStyle={{ padding: 0, background: 'none' }}
    >
      <div className="id-upgrade-wrapper">
        <button className="id-close-btn" onClick={onClose}>
          <AiOutlineClose />
        </button>

        <div className={`id-frame ${user.role}`}>
          {/* Layer 1: Background Patterns */}
          <div className="id-pattern-overlay" />
          <div className="id-hologram-strip" />
          
          <div className="id-content-layer">
            {/* Header: Brand & Security Level */}
            <header className="id-header">
              <div className="id-brand-box">
                <div className="id-logo-icon">DMS</div>
                <div className="id-brand-text">
                  <h1 className="id-main-co">CV. DINAMIKA MITRA SINERGI</h1>
                  <span className="id-tagline">INTEGRATED INDUSTRIAL SOLUTIONS</span>
                </div>
              </div>
              <div className="id-auth-badge">
                <MdSecurity className="id-sec-icon" />
                <span>{user.role === 'admin' ? 'SEC_LEVEL_01' : 'SEC_LEVEL_02'}</span>
              </div>
            </header>

            {/* Middle Section */}
            <main className="id-main">
              <div className="id-left-col">
                <div className="id-photo-container">
                  <img 
                    src={user.foto ? (formatFilePath(user.foto) || '') : ''} 
                    className="id-photo"
                    alt="Personnel"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }}
                  />
                  <div className="id-photo-border" />
                </div>
                <div className={`id-status-pill ${user.role}`}>
                  ACTIVE PERSONNEL
                </div>
              </div>

              <div className="id-right-col">
                <div className="id-field-group">
                  <label>IDENTIFIED PERSONNEL</label>
                  <h2 className="id-name-display">{user.fullname.toUpperCase()}</h2>
                </div>

                <div className="id-stats-row">
                  <div className="id-stat-box">
                    <label>REGISTRY ID</label>
                    <span className="id-stat-val">{user.id_pegawai}</span>
                  </div>
                  <div className="id-stat-box">
                    <label>DEPT. CLEARANCE</label>
                    <span className="id-stat-val">{user.role === 'admin' ? 'HQ_MGMT' : 'OPS_CORE'}</span>
                  </div>
                </div>

                <div className="id-barcode-container">
                  <div className="id-barcode-bg">
                    <Barcode 
                      value={barcodeValue}
                      width={1.1}
                      height={32}
                      fontSize={0} // Sembunyikan text bawaan barcode agar lebih rapi
                      background="transparent"
                      lineColor={user.role === 'admin' ? "#ffffff" : "#0f172a"}
                    />
                  </div>
                  <span className="id-barcode-caption">SYSTEM AUTH: @{user.username}</span>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="id-footer">
              <div className="id-chip-set">
                <div className={`id-smart-chip ${user.role === 'admin' ? 'gold' : 'silver'}`} />
              </div>
              <div className="id-legal-info">
                THIS DOCUMENT IS THE PROPERTY OF CV. DMS. UNAUTHORIZED USE IS PROHIBITED.
                <br />
                <span className="id-serial">SN: {String(user.id).toUpperCase().slice(0, 12)}</span>
              </div>
            </footer>
          </div>
        </div>

        {canPrint && (
          <div className="id-actions">
            <Button 
              type="primary" 
              block 
              icon={<AiOutlinePrinter />} 
              onClick={() => window.print()}
              className="id-print-btn"
            >
              GENERATE PHYSICAL CARD
            </Button>
          </div>
        )}
      </div>

      <style>{`
        .ant-modal-content { background: transparent !important; box-shadow: none !important; }
        .id-upgrade-wrapper { position: relative; width: 500px; margin: 0 auto; padding: 10px; }
        
        .id-close-btn {
          position: absolute; top: 0; right: -40px;
          width: 35px; height: 35px; border-radius: 50%;
          background: #334155; color: white; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
        }
        .id-close-btn:hover { background: #ef4444; transform: rotate(90deg); }

        /* Card Frame */
        .id-frame {
          width: 480px; height: 300px; border-radius: 14px;
          position: relative; overflow: hidden;
          font-family: 'Inter', sans-serif;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.45);
        }

        .id-frame.admin { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #f8fafc; }
        .id-frame.user { background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%); color: #0f172a; }

        /* Graphics */
        .id-pattern-overlay {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px);
          background-size: 12px 12px;
        }

        .id-hologram-strip {
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: linear-gradient(to bottom, #2563eb, #6366f1, #3b82f6);
          opacity: 0.6;
        }

        .id-content-layer { position: relative; z-index: 5; padding: 22px; height: 100%; display: flex; flex-direction: column; }

        /* Header */
        .id-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .id-brand-box { display: flex; gap: 12px; align-items: center; }
        .id-logo-icon { 
          width: 32px; height: 32px; background: #2563eb; color: white;
          font-weight: 900; font-size: 10px; display: flex; 
          align-items: center; justify-content: center; border-radius: 6px;
        }
        .id-main-co { font-size: 13px; font-weight: 800; margin: 0; letter-spacing: 0.5px; }
        .id-tagline { font-size: 7px; font-weight: 600; opacity: 0.6; letter-spacing: 0.8px; }
        
        .id-auth-badge { 
          display: flex; align-items: center; gap: 5px; font-size: 8px; font-weight: 800;
          background: rgba(37, 99, 235, 0.1); padding: 4px 8px; border-radius: 20px; color: #2563eb;
        }

        /* Main Section */
        .id-main { display: flex; gap: 25px; flex: 1; align-items: center; }
        .id-photo-container { position: relative; width: 110px; height: 135px; }
        .id-photo { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }
        .id-photo-border { 
          position: absolute; inset: -3px; border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 6px; 
        }
        
        .id-status-pill { 
          font-size: 7px; font-weight: 800; text-align: center; margin-top: 10px;
          padding: 3px; border-radius: 4px; border: 1px solid currentColor; opacity: 0.7;
        }

        .id-right-col { flex: 1; }
        .id-field-group label { font-size: 7px; font-weight: 700; opacity: 0.5; display: block; margin-bottom: 3px; }
        .id-name-display { 
          font-size: 20px !important; font-weight: 900 !important; color: inherit !important; 
          margin: 0 0 15px 0 !important; line-height: 1; letter-spacing: -0.5px;
        }

        .id-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .id-stat-val { font-size: 11px; font-weight: 800; display: block; }

        .id-barcode-container { margin-top: 10px; }
        .id-barcode-bg { 
          padding: 4px; display: inline-block; border-radius: 3px;
          background: ${user.role === 'admin' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
        }
        .id-barcode-caption { display: block; font-size: 7px; font-family: monospace; opacity: 0.5; margin-top: 4px; }

        /* Footer */
        .id-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; }
        .id-smart-chip { 
          width: 38px; height: 28px; border-radius: 4px;
          background: linear-gradient(135deg, #94a3b8, #cbd5e1); position: relative;
        }
        .id-smart-chip.gold { background: linear-gradient(135deg, #d4af37, #f59e0b); }
        .id-smart-chip::after {
          content: ''; position: absolute; inset: 4px; border: 0.5px solid rgba(0,0,0,0.2); border-radius: 2px;
        }

        .id-legal-info { font-size: 6px; text-align: right; opacity: 0.4; font-weight: 600; max-width: 200px; line-height: 1.4; }
        .id-serial { font-family: monospace; font-size: 7px; }

        /* Actions */
        .id-actions { margin-top: 20px; }
        .id-print-btn { 
          height: 48px !important; border-radius: 12px !important; font-weight: 800 !important;
          background: #2563eb !important; border: none !important;
          box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4) !important;
        }

        @media print {
          body * { visibility: hidden; }
          .id-frame, .id-frame * { visibility: visible; }
          .id-frame { position: fixed; left: 0; top: 0; box-shadow: none !important; border: 1px solid #ddd; }
        }
      `}</style>
    </Modal>
  );
};