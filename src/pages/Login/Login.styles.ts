import { dmsTheme } from '@/styles/dms.theme';

const { colors, fonts } = dmsTheme;

export const loginStyles: Record<string, React.CSSProperties> = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Background Mesh Gradient Dinamis
    background: `linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)`,
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif'
  },
  // Efek cahaya di sudut layar
  lightLeak: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(at 0% 0%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(at 100% 100%, rgba(161,196,253,0.3) 0%, transparent 50%)',
    pointerEvents: 'none'
  },
  loginBox: {
    width: '440px', // Sedikit lebih lebar agar elegan
    padding: '50px',
    // Glassmorphism 2026: Lebih blur, lebih jernih
    background: 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(50px) saturate(210%) brightness(110%)',
    WebkitBackdropFilter: 'blur(50px) saturate(210%) brightness(110%)',
    
    // Border tipis putih untuk efek 'Edge Glow'
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '44px',
    boxShadow: '0 40px 80px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
    zIndex: 1,
    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  header: {
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatarRing: {
    width: '90px',
    height: '90px',
    padding: '4px',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.1))',
    borderRadius: '26px', // Squircle
    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
    marginBottom: '20px'
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    background: '#fff',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px'
  },
  mainTitle: {
    margin: 0,
    fontWeight: 700,
    fontSize: '28px',
    color: '#1d1d1f',
    letterSpacing: '-0.8px',
  },
  subTitle: {
    fontSize: '13px',
    fontWeight: 400,
    color: 'rgba(29, 29, 31, 0.6)',
    marginTop: '6px'
  },
  // Style untuk form input yang 'Seamless'
  inputField: {
    height: '46px',
    background: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '16px',
    fontSize: '15px',
    padding: '0 15px',
    boxShadow: 'none',
    transition: 'all 0.3s ease'
  },
  submitBtn: {
    height: '46px',
    borderRadius: '16px',
    background: '#000', // Apple 2026 sering menggunakan Hitam Solid/Putih Solid untuk High Contrast
    borderColor: '#000',
    color: '#fff',
    fontWeight: 600,
    fontSize: '15px',
    marginTop: '20px',
    width: '100%',
    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footer: {
    marginTop: '40px',
    textAlign: 'center',
    opacity: 0.4
  }
};