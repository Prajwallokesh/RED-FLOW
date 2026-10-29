/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REDFLOW — HOSPITAL DASHBOARD STYLES
 * ═══════════════════════════════════════════════════════════════════════════
 * Visual style dictionary for Hospital Emergency Blood Requisitions,
 * Blood Unit allocation status, and nearby donor locator.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const hospitalStyles = {
  page:     { padding: '24px 28px', background: '#F1F5F9', minHeight: 'calc(100vh - 64px)', fontFamily: 'Inter, system-ui, sans-serif' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' },
  avatar:   { width: 44, height: 44, borderRadius: 10, background: 'rgba(0,124,145,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title:    { fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 },
  subtitle: { fontSize: 12, color: '#64748B' },
  iconBtn:  { width: 38, height: 38, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { background: '#D32F2F', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  kpiRow:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 18 },
  kpiCard:  { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 18, alignItems: 'start' },
  leftPanel: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.03)', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' },
  panelTitle: { fontSize: 14, fontWeight: 800, color: '#0F172A' },
  badge:    { background: '#F1F5F9', color: '#64748B', borderRadius: 6, padding: '1px 7px', fontSize: 11, fontWeight: 800 },
  empty:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' },
  reqCard:  { border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', background: '#FFFFFF' },
  bloodChip: { background: 'rgba(211,47,47,0.07)', color: '#B91C1C', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 },
  allocBox: { background: 'rgba(21,128,61,0.05)', border: '1px solid rgba(21,128,61,0.15)', borderRadius: 8, padding: '8px 10px' },
  unitChip: { background: '#15803D', color: '#FFFFFF', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, fontFamily: 'monospace' },
  matchBox: { background: 'rgba(3,105,161,0.05)', border: '1px solid rgba(3,105,161,0.15)', borderRadius: 8, padding: '8px 10px' },
  phoneBtn: { background: '#007C91', color: '#FFFFFF', borderRadius: 6, padding: '3px 9px', fontSize: 10, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 },
  rightPanel: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' },
  tabBar:   { display: 'flex', gap: 4, marginBottom: 16, background: '#F8FAFC', padding: 4, borderRadius: 10, border: '1px solid #E2E8F0' },
  tab:      { flex: 1, padding: '8px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#64748B', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabActive: { background: '#FFFFFF', color: '#0F172A', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  searchBox: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 },
  lbl:      { fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 5, display: 'block', letterSpacing: '0.3px' },
  inp:      { width: '100%', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#0F172A', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' },
  searchBtn: { background: '#172B4D', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' },
  donorCard: { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  toast:    { position: 'fixed', top: 80, right: 24, color: '#FFFFFF', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' },
  overlay:  { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 },
  modal:    { background: '#FFFFFF', borderRadius: 16, padding: '22px 24px', width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' },
};

export default hospitalStyles;
