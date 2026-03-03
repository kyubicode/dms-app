import React from 'react';
import { Button, Avatar, Modal } from 'antd';
import { IoFingerPrint } from "react-icons/io5";
import { AiOutlinePrinter } from 'react-icons/ai';
import { dmsTheme } from '@/styles/dms.theme';

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
  return (
    <Modal 
      open={visible} 
      onCancel={onClose} 
      footer={null} 
      width={520} 
      centered 
      styles={{ body: { padding: 0, background: 'transparent' } }}
      closeIcon={<div className="modal-close-tech">X</div>}
      destroyOnClose
    >
      {!user ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#0f172a', borderRadius: '12px', color: '#38bdf8' }}>
          LOADING_SECURE_DATA...
        </div>
      ) : (
        <>
          <div className={`id-card-visual ${user.role}`}>
            <div className="card-texture" />
            
            <div className="card-header-visual">
              <div className="org-brand">
                <div className="brand-logo" />
                <div className="brand-text">
                  <span className="main">CV.DINAMIKA MITRA SINERGI</span>
                  <span className="sub">SECURE ACCESS NODE // CORE_V2</span>
                </div>
              </div>
              <div className="hologram-chip" />
            </div>

            <div className="card-body-visual">
              <div className="photo-area">
                <Avatar 
                  shape="square" 
                  size={140} 
                  src={user.foto ? formatFilePath(user.foto) : undefined} 
                  className="id-avatar"
                />
              </div>
              
              <div className="info-area">
                <div className="badge-row">
                  <span className="role-label">{user.role.toUpperCase()}</span>
                  <div className="status-indicator">● SECURE_DATA</div>
                </div>
                
                <h2 className="user-fullname">{user.fullname.toUpperCase()}</h2>
                
                <div className="grid-details">
                  <div className="detail-box">
                    <label>NODE_ID</label>
                    <span className="mono-text">{user.id_pegawai}</span>
                  </div>
                  <div className="detail-box">
                    <label>ALIAS</label>
                    <span className="mono-text">@{user.username}</span>
                  </div>
                </div>

                <div className="security-footer">
                  <div className="fingerprint-scan"><IoFingerPrint /></div>
                  <div className="auth-stamp">VERIFIED_BY_CORE_PROTOCOL</div>
                </div>
              </div>
            </div>

            <div className="card-bottom-visual">
              <div className="magnetic-stripe" />
              <div className="legal-text">
                PROPERTY OF DMS_SYSTEMS. UNAUTHORIZED USE IS A VIOLATION OF SECURITY_PROTOCOL_09.
              </div>
            </div>
          </div>

          <div className="modal-actions-print">
            <Button 
              type="primary" 
              block 
              icon={<AiOutlinePrinter />} 
              onClick={() => window.print()} 
              className="btn-print"
              style={{ background: dmsTheme.colors.primary, border: 'none' }}
            >
              EXECUTE HARD COPY PRINT
            </Button>
          </div>
        </>
      )}

      <style>{`
        .id-card-visual {
          width: 100%; height: 320px; border-radius: 12px; position: relative;
          padding: 28px; overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5); 
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .id-card-visual.admin { 
          background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); 
          color: white; 
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .id-card-visual.user { 
          background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%); 
          color: #0f172a; 
          border: 1px solid #e2e8f0;
        }
        
        .card-texture {
          position: absolute; top:0; left:0; width:100%; height:100%;
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h1v1H0V0zm10 10h1v1h-1v-1zm10 10h1v1h-1v-1zm10 10h1v1h-1v-1z' fill='%2394a3b8' fill-opacity='0.1'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .card-header-visual { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; z-index: 2; }
        .org-brand { display: flex; align-items: center; gap: 12px; }
        .brand-logo { width: 28px; height: 28px; background: ${dmsTheme.colors.primary}; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
        .brand-text .main { font-weight: 900; font-size: 16px; letter-spacing: 2px; display: block; }
        .brand-text .sub { font-size: 8px; opacity: 0.5; font-weight: 700; font-family: ${dmsTheme.fonts.code}; }
        
        .hologram-chip { 
          width: 48px; height: 36px; 
          background: linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #94a3b8 100%); 
          border-radius: 6px; border: 1px solid rgba(0,0,0,0.1);
        }

        .card-body-visual { display: flex; gap: 28px; z-index: 2; flex: 1; }
        
        .photo-area { 
          padding: 2px; 
          background: rgba(148, 163, 184, 0.2); 
          border-radius: 6px; 
          height: fit-content;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .id-avatar { border-radius: 4px !important; }

        .info-area { flex: 1; display: flex; flex-direction: column; }
        .badge-row { display: flex; justify-content: space-between; align-items: center; }
        .role-label { 
          background: ${dmsTheme.colors.primary}; color: white; padding: 2px 12px; 
          font-size: 10px; font-weight: 900; border-radius: 2px; letter-spacing: 1px;
        }
        .status-indicator { font-size: 8px; font-weight: 800; opacity: 0.6; }

        .user-fullname { margin: 12px 0 20px 0; font-size: 24px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
        .grid-details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .detail-box label { display: block; font-size: 9px; opacity: 0.5; font-weight: 800; margin-bottom: 4px; }
        .mono-text { font-family: ${dmsTheme.fonts.code}; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; }

        .security-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: flex-end; }
        .fingerprint-scan { font-size: 32px; opacity: 0.15; }
        .auth-stamp { 
          font-size: 7px; font-weight: 900; padding: 4px 8px; 
          border: 1px solid currentColor; opacity: 0.3; border-radius: 2px;
        }

        .card-bottom-visual { margin-top: 20px; z-index: 2; }
        .magnetic-stripe { height: 16px; background: #000; margin-bottom: 8px; opacity: 0.05; border-radius: 2px; }
        .legal-text { font-size: 7px; text-align: center; opacity: 0.4; letter-spacing: 0.5px; font-weight: 600; }

        .modal-actions-print { padding: 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .btn-print { height: 48px; font-weight: 900; border-radius: 4px; }
        .modal-close-tech { 
          color: white; background: #ef4444; width: 32px; height: 32px; 
          display: flex; align-items: center; justify-content: center; 
          font-weight: 900; border-radius: 0 0 0 8px; cursor: pointer;
        }

        @media print {
          body * { visibility: hidden; }
          .id-card-visual, .id-card-visual * { visibility: visible; }
          .id-card-visual { 
            position: fixed; left: 50%; top: 50%; 
            transform: translate(-50%, -50%);
            box-shadow: none !important; border: 1px solid #000;
          }
          .modal-actions-print, .modal-close-tech { display: none !important; }
        }
      `}</style>
    </Modal>
  );
};