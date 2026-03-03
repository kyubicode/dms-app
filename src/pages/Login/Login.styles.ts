import React from 'react';

export const loginStyles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%', // Menyesuaikan tinggi parent (AppLayout)
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(at 0% 0%, #c2e9fb 0%, transparent 50%), radial-gradient(at 100% 0%, #a1c4fd 0%, transparent 50%), radial-gradient(at 100% 100%, #fbc2eb 0%, transparent 50%), radial-gradient(at 0% 100%, #e6dee9 0%, transparent 50%)',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    position: 'relative',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
  },
  lightLeak: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 80%)',
    pointerEvents: 'none'
  },
  loginBox: {
    width: '360px',
    padding: '35px',
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
    borderRadius: '32px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  header: { marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  avatarRing: {
    width: '75px',
    height: '75px',
    padding: '3px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.2))',
    borderRadius: '20px', 
    boxShadow: '0 8px 15px rgba(0,0,0,0.05)',
    marginBottom: '15px'
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    background: '#fff',
    borderRadius: '17px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#1d1d1f'
  },
  mainTitle: { fontWeight: 700, fontSize: '22px', color: '#1d1d1f', letterSpacing: '-0.8px' },
  subTitle: { fontSize: '12px', fontWeight: 500, color: 'rgba(29, 29, 31, 0.5)', marginTop: '4px' },
  inputField: {
    height: '42px',
    background: 'rgba(255, 255, 255, 0.4)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '12px',
  },
  submitBtn: {
    height: '42px',
    borderRadius: '12px',
    background: '#007AFF',
    fontWeight: 600,
    width: '100%',
    marginTop: '10px',
    border: 'none',
    cursor: 'pointer'
  },
  footer: { marginTop: '25px', textAlign: 'center' }
};