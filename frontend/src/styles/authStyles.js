/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REDFLOW — AUTHENTICATION STYLES (LOGIN & REGISTRATION)
 * ═══════════════════════════════════════════════════════════════════════════
 * Shared visual presentation rules for Login and Register views.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const authStyles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    background: '#F8F9FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    background: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    padding: 'clamp(20px, 5vw, 36px)',
    width: '100%',
    maxWidth: '440px',
  },
  logoRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  logoImg: {
    height: '72px',
    width: '72px',
    objectFit: 'contain',
  },
  brandText: {
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    lineHeight: 1,
  },
  red: { color: '#D32F2F' },
  flow: { color: '#172B4D' },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#172B4D',
    textAlign: 'center',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6C757D',
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  errorBanner: {
    background: 'rgba(211,47,47,0.08)',
    border: '1px solid rgba(211,47,47,0.3)',
    borderRadius: '4px',
    color: '#D32F2F',
    padding: '10px 14px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#212529',
  },
  input: {
    border: '1px solid #E0E0E0',
    borderRadius: '4px',
    padding: '12px',
    fontSize: '14px',
    color: '#212529',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  submitBtn: {
    background: '#007C91',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#6C757D',
  },
  switchLink: {
    color: '#007C91',
    fontWeight: '600',
    textDecoration: 'none',
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    gap: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: '0.5px',
  },
  googleBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
};

export default authStyles;
