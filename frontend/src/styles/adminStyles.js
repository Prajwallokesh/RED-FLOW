/**
 * REDFLOW ADMIN DASHBOARD STYLING MODULE
 * Contains all shared style definitions for the administrative console and its modals.
 */
export const adminStyles = {
  page: {
    display: 'flex',
    minHeight: 'calc(100vh - 64px)',
    background: '#F8F9FA',
  },
  sidebar: {
    width: '260px',
    background: '#0F172A',
    borderRight: '1px solid #1E293B',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: '64px',
    height: 'calc(100vh - 64px)',
  },
  sidebarHeader: {
    padding: '20px 20px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  sidebarBrand: {
    fontSize: '24px',
    fontWeight: '900',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  sidebarRole: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    gap: '3px',
    flex: 1,
    overflowY: 'auto',
  },
  navGroupTitle: {
    fontSize: '10px',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    padding: '8px 12px 4px',
    fontWeight: '800',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    padding: '9px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.15s ease',
  },
  navBtnActive: {
    background: '#007C91',
    color: '#FFFFFF',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(0, 124, 145, 0.35)',
  },
  navIconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navBadge: {
    fontSize: '10px',
    fontWeight: '800',
    padding: '2px 7px',
    borderRadius: '100px',
  },
  sidebarFooter: {
    padding: '12px 14px 18px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: 'rgba(15, 23, 42, 0.8)',
  },
  userProfileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 8px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #007C91 0%, #0284C7 100%)',
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sidebarLogout: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#F87171',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.15s ease',
  },

  main: { flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', minWidth: 0 },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' },
  statCard: {
    background: '#FFFFFF', border: '1px solid #EBEBEB', borderRadius: '12px',
    padding: '16px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex', alignItems: 'center', gap: '14px',
  },
  statIconWrap: {
    width: '44px', height: '44px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 },
  sectionTitle: { fontSize: '20px', fontWeight: '800', color: '#172B4D', margin: 0 },
  collectBtn: {
    background: '#007C91', color: '#FFFFFF', border: 'none',
    borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
    fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  },
  refreshBtn: {
    background: '#FFFFFF', border: '1px solid #E0E0E0',
    borderRadius: '8px', padding: '8px 14px', fontSize: '13px',
    color: '#6C757D', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: 6,
  },

  filterTabs: { display: 'flex', gap: 6, borderBottom: '1px solid #E0E0E0', paddingBottom: 10, flexWrap: 'wrap' },
  filterTabBtn: {
    background: 'transparent', border: 'none',
    padding: '6px 14px', borderRadius: 6, fontSize: 13,
    fontWeight: 600, color: '#6C757D', cursor: 'pointer',
  },
  filterTabBtnActive: { background: '#172B4D', color: '#FFFFFF' },

  tableCard: {
    background: '#FFFFFF', border: '1px solid #EBEBEB',
    borderRadius: '12px', overflow: 'hidden', overflowX: 'auto',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  table: { width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
  tableHeadRow: { background: '#FAFAFA', borderBottom: '1px solid #EBEBEB' },
  th: { padding: '12px 16px', fontWeight: 700, color: '#6C757D', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableRow: { borderBottom: '1px solid #F5F5F5' },
  td: { padding: '12px 16px', color: '#212529', verticalAlign: 'middle' },
  bloodGroupBadge: {
    background: 'rgba(211,47,47,0.1)', color: '#D32F2F',
    borderRadius: '100px', padding: '3px 8px', fontSize: '12px', fontWeight: 800,
  },

  verifyBtn: {
    background: '#2E7D32', color: '#FFFFFF',
    border: 'none', borderRadius: '6px',
    padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
  },
  flagBtn: {
    background: 'rgba(211,47,47,0.08)', color: '#D32F2F',
    border: '1px solid rgba(211,47,47,0.2)',
    borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  unflagBtn: {
    background: 'rgba(0,124,145,0.08)', color: '#007C91',
    border: '1px solid rgba(0,124,145,0.2)',
    borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
  },
  safeBtn: {
    background: '#2E7D32', color: '#FFFFFF', border: 'none',
    borderRadius: 4, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  },
  rejectBtn: {
    background: '#D32F2F', color: '#FFFFFF', border: 'none',
    borderRadius: 4, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  },
  actionBtn: {
    background: '#F0F4F8', color: '#007C91', border: '1px solid rgba(0,124,145,0.2)',
    borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  },
  allocateBtn: {
    background: '#0284C7', color: '#FFFFFF', border: 'none',
    borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(2,132,199,0.35)', letterSpacing: '0.3px',
  },
  issueBtn: {
    background: '#6A1B9A', color: '#FFFFFF', border: 'none',
    borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  },
  iconBtn: {
    background: 'transparent', border: '1px solid #E0E0E0',
    borderRadius: 6, padding: '5px 8px', color: '#6C757D', cursor: 'pointer', display: 'flex', alignItems: 'center',
  },

  toast: {
    position: 'fixed', top: '80px', right: '24px',
    color: '#FFFFFF', padding: '12px 20px', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', zIndex: 999,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },

  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
  },
  modal: {
    background: '#FFFFFF', borderRadius: '16px', padding: '24px',
    width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: '18px', fontWeight: '800', color: '#172B4D', margin: 0 },
  modalCloseBtn: { background: 'transparent', border: 'none', color: '#6C757D', cursor: 'pointer' },
  modalSub: { fontSize: '13px', color: '#6C757D', margin: '0 0 14px', lineHeight: '1.4' },
  errorBanner: {
    background: 'rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.3)',
    borderRadius: '6px', color: '#D32F2F', padding: '10px 14px',
    fontSize: '13px', marginBottom: '12px',
  },
  inputLabel: { fontSize: '12px', fontWeight: 700, color: '#172B4D', marginBottom: 4, display: 'block' },
  select: {
    width: '100%', border: '1px solid #E0E0E0', borderRadius: '8px',
    padding: '10px 12px', fontSize: '13px', color: '#212529', outline: 'none', background: '#FAFAFA',
  },
  input: {
    width: '100%', border: '1px solid #E0E0E0', borderRadius: '8px',
    padding: '10px 12px', fontSize: '13px', color: '#212529', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', border: '1px solid #E0E0E0', borderRadius: '8px',
    padding: '10px', fontSize: '13px', color: '#212529', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
  },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' },
  cancelBtn: {
    background: 'transparent', border: '1px solid #E0E0E0',
    borderRadius: '8px', padding: '10px 18px', fontSize: '13px', color: '#6C757D', cursor: 'pointer', fontWeight: 600,
  },
  primaryBtn: {
    background: '#007C91', color: '#FFFFFF', border: 'none',
    borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
  },
  dangerBtn: {
    background: '#D32F2F', color: '#FFFFFF', border: 'none',
    borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
  },

  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12 },
  detailKey: { color: '#6C757D', fontWeight: 500 },
  detailVal: { color: '#212529', fontWeight: 700 },
};

export default adminStyles;
