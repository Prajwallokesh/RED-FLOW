/**
 * REDFLOW DONOR DASHBOARD STYLING MODULE
 * Mobile-first responsive styles for the voluntary donor portal.
 */
export const donorStyles = {
  shell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    maxHeight: '100dvh',
    width: '100%',
    maxWidth: 520,
    margin: '0 auto',
    background: '#F4F6F9',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 0 25px rgba(0,0,0,0.08)',
  },

  appBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 18px',
    height: 60,
    background: '#172B4D',
    flexShrink: 0,
    position: 'relative',
    top: 0,
    zIndex: 50,
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  appLogo:  { height: 32, width: 32, objectFit: 'contain' },
  appBrand: { fontSize: 20, fontWeight: 800, letterSpacing: 0.2 },
  appAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#007C91', color: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700,
  },

  body: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
    display: 'flex',
    flexDirection: 'column',
  },

  tabContent: {
    padding: '14px 14px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 13,
  },

  heroCard: {
    background: 'linear-gradient(140deg, #172B4D 0%, #1E3F7A 100%)',
    borderRadius: 16,
    padding: '16px 16px',
    boxShadow: '0 4px 16px rgba(23,43,77,0.25)',
  },
  heroTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroGreet: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 3 },
  heroName:  { fontSize: 19, fontWeight: 700, color: '#FFFFFF' },
  heroDivider: { height: 1, background: 'rgba(255,255,255,0.1)', margin: '12px 0' },
  heroBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },

  bloodChip: {
    background: 'rgba(211,47,47,0.25)',
    color: '#FF8A80',
    border: '1px solid rgba(211,47,47,0.4)',
    borderRadius: 100, padding: '4px 12px',
    fontSize: 13, fontWeight: 800,
  },
  bloodChipGray: {
    background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
    borderRadius: 100, padding: '4px 12px', fontSize: 13, fontWeight: 700,
  },
  statusLoading: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  statusNotReg: {
    background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)',
    borderRadius: 100, padding: '4px 10px', fontSize: 11, fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: 5,
  },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  statCard: {
    background: '#FFFFFF', borderRadius: 12,
    padding: '13px 12px',
    border: '1px solid #EBEBEB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  statIconBox: {
    width: 30, height: 30, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontSize: 18, fontWeight: 800, lineHeight: 1.1 },
  statLabel: { fontSize: 11, color: '#6C757D', fontWeight: 600 },

  ctaCard: {
    background: 'rgba(0,124,145,0.06)', border: '1.5px solid rgba(0,124,145,0.2)',
    borderRadius: 12, padding: '12px 14px',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  ctaIconWrap: {
    width: 36, height: 36, borderRadius: 9,
    background: 'rgba(0,124,145,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  ctaTitle: { fontSize: 13, fontWeight: 700, color: '#172B4D', marginBottom: 2 },
  ctaSub:   { fontSize: 11, color: '#6C757D', lineHeight: 1.3 },
  ctaBtn: {
    background: '#007C91', color: '#FFFFFF', border: 'none',
    borderRadius: 8, padding: '8px 14px',
    fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
  },

  infoCard: {
    border: '1.5px solid', borderRadius: 12,
    padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center',
  },
  infoIconWrap: {
    width: 36, height: 36, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  sectionLabel: { fontSize: 13, fontWeight: 700, color: '#172B4D', marginBottom: -2 },

  actionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 },
  actionBtn: {
    background: '#FFFFFF', border: '1.5px solid',
    borderRadius: 12, padding: '12px 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  actionIconBox: {
    width: 36, height: 36, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 },

  profileHero: {
    background: 'linear-gradient(140deg, #172B4D, #1E3F7A)',
    borderRadius: 16, padding: '22px 16px 18px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    boxShadow: '0 4px 16px rgba(23,43,77,0.25)',
  },
  avatarRing: {
    width: 64, height: 64, borderRadius: '50%',
    background: 'linear-gradient(135deg, #D32F2F, #8B0000)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 0 4px rgba(255,255,255,0.1)',
  },

  primaryBtn: {
    background: '#007C91', color: '#FFFFFF', border: 'none',
    borderRadius: 12, padding: 13, fontSize: 14,
    fontWeight: 700, cursor: 'pointer', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  outlineBtn: {
    background: '#FFFFFF', border: '1.5px solid #007C91',
    color: '#007C91', borderRadius: 12, padding: 12,
    fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  logoutBtn: {
    background: 'rgba(211,47,47,0.06)', border: '1.5px solid rgba(211,47,47,0.25)',
    color: '#D32F2F', borderRadius: 12, padding: 12,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },

  infoSection: {
    background: '#FFFFFF', borderRadius: 12, padding: 14,
    border: '1px solid #EBEBEB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '1px solid #F5F5F5',
  },
  infoLabel: { fontSize: 12, color: '#6C757D', fontWeight: 500 },
  infoValue: { fontSize: 12, color: '#212529', fontWeight: 700, fontFamily: 'monospace' },

  emptyCard: {
    background: '#FFFFFF', borderRadius: 12, padding: '36px 16px',
    border: '1px solid #EBEBEB',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    gap: 6,
  },
  emptyIconWrap: {
    width: 52, height: 52, borderRadius: '50%',
    background: '#F4F6F9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: '#172B4D' },
  emptySub:   { fontSize: 12, color: '#6C757D', lineHeight: 1.5, maxWidth: 240 },

  alertIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    background: 'rgba(255,160,0,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  tabBar: {
    display: 'flex',
    height: 60,
    background: '#FFFFFF',
    borderTop: '1px solid #E2E8F0',
    flexShrink: 0,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    position: 'relative',
    bottom: 0,
    zIndex: 50,
  },
  tabBtn: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent', border: 'none', cursor: 'pointer',
    position: 'relative', gap: 3,
    padding: '6px 4px',
  },
  tabActiveLine: {
    position: 'absolute', top: 0, left: '25%', right: '25%',
    height: 3, background: '#D32F2F', borderRadius: '0 0 3px 3px',
  },

  /* Modal */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modalCard: {
    background: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid #EBEBEB',
    background: '#FAFAFA',
  },
  modalCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6C757D',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInfoBox: {
    background: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  modalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
  },
  modalLabel: { color: '#6C757D', fontWeight: 500 },
  modalVal:   { color: '#212529', fontWeight: 700 },
  modalActionBtn: {
    background: '#172B4D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 10,
    padding: '12px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  },
};

export default donorStyles;
