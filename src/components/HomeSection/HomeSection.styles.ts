import { dmsTheme } from '@/styles/dms.theme';
import React from 'react';

export const s: Record<string, React.CSSProperties> = {
  mainTitle: { margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', fontFamily: dmsTheme.fonts.main },
  liveIndicator: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusText: { fontSize: '10px', fontWeight: 800, fontFamily: dmsTheme.fonts.code },
  versionTag: { fontSize: '10px', color: dmsTheme.colors.text.disabled, fontFamily: dmsTheme.fonts.code },
  clockContainer: { textAlign: 'right', borderRight: '4px solid', paddingRight: '16px' },
  timeDisplay: { display: 'block', fontSize: '28px', fontWeight: 700, lineHeight: 1, fontFamily: dmsTheme.fonts.code },
  dateDisplay: { fontSize: '10px', fontWeight: 600, color: dmsTheme.colors.text.secondary, letterSpacing: '1px' },
  cleanCard: { background: '#fff', borderRadius: '14px', boxShadow: dmsTheme.shadow.card },
  cardLabel: { fontSize: '10px', fontWeight: 700, color: dmsTheme.colors.text.secondary, fontFamily: dmsTheme.fonts.code },
  cardValue: { fontSize: '22px', fontWeight: 700, margin: '2px 0', fontFamily: dmsTheme.fonts.code },
  cardSub: { fontSize: '11px', color: dmsTheme.colors.text.secondary },
  iconCircle: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' },
  terminalWrapper: { marginTop: '32px', borderRadius: '12px', border: '1px solid', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  terminalHeader: { padding: '8px 16px', display: 'flex', alignItems: 'center' },
  terminalContent: { padding: '16px', minHeight: '140px', position: 'relative', fontFamily: dmsTheme.fonts.code },
  cursor: { width: '8px', height: '14px', display: 'inline-block', marginTop: '4px' }
};

export const globalAnimations = `
  @keyframes dot-pulse {
    0% { transform: scale(0.95); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.5; }
    100% { transform: scale(0.95); opacity: 1; }
  }
  .dot-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: dot-pulse 2s infinite ease-in-out;
  }
`;