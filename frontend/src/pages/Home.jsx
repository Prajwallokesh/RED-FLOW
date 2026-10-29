import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, ArrowRight, Zap, PhoneCall, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CLINICAL BLOOD COMPATIBILITY MATRIX
 * Clinical Protocol: ABO and Rh(D) antigen/antibody compatibility rules.
 * - O- is the Universal Red Cell Donor (can donate to all blood groups).
 * - AB+ is the Universal Recipient (can receive from all blood groups).
 * ─────────────────────────────────────────────────────────────────────────────
 */
const BLOOD_COMPATIBILITY = [
  { group: 'O-', canGive: 'All Blood Groups (O-, O+, A-, A+, B-, B+, AB-, AB+)', canReceive: 'O- Only', role: 'Universal Red Cell Donor', special: true },
  { group: 'O+', canGive: 'O+, A+, B+, AB+', canReceive: 'O+, O-', role: 'Most Common Type (38%)', special: false },
  { group: 'A-', canGive: 'A-, A+, AB-, AB+', canReceive: 'A-, O-', role: 'Platelet Priority Donor', special: false },
  { group: 'A+', canGive: 'A+, AB+', canReceive: 'A+, A-, O+, O-', role: 'High Clinical Need (34%)', special: false },
  { group: 'B-', canGive: 'B-, B+, AB-, AB+', canReceive: 'B-, O-', role: 'Rare Donor Type (2%)', special: false },
  { group: 'B+', canGive: 'B+, AB+', canReceive: 'B+, B-, O+, O-', role: 'Active Demand Type (9%)', special: false },
  { group: 'AB-', canGive: 'AB-, AB+', canReceive: 'AB-, A-, B-, O-', role: 'Universal Plasma Donor', special: false },
  { group: 'AB+', canGive: 'AB+ Only', canReceive: 'All Blood Groups (Universal Recipient)', role: 'Universal Red Cell Recipient', special: true },
];

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HOME PAGE COMPONENT
 * Purpose: The public welcome portal for RedFlow.
 * Provides easy donor onboarding, emergency contacts, and blood education.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const Home = () => {
  // Access global authentication state to know if user is already logged in
  const { isAuthenticated, user } = useAuth();

  /**
   * Helper: Automatically routes a logged-in user to their respective dashboard
   * (Admin -> /admin, Hospital -> /hospital, Donor -> /donor)
   */
  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'hospital') return '/hospital';
    return '/donor';
  };

  return (
    <div className="rf-new-home">
      {/* ── 1. HERO SECTION: Main Title & Action Buttons ── */}
      <section className="rf-new-hero">
        <div className="rf-new-container">
          <div className="rf-clean-tag">
            India's 1st Blockchain-Secured Blood Supply Ecosystem
          </div>

          <h1 className="rf-new-title">
            <span>Connecting Donors. </span>
            <span className="rf-title-mobile-break">Saving Lives.</span>
            <span className="rf-title-desktop-br"><br /></span>
            <span className="rf-red-gradient rf-title-gradient-part">100% Verifiable Trust.</span>
          </h1>

          <p className="rf-new-subtitle">
            RedFlow bridges voluntary blood donors with urgent hospital requests,
            secured with tamper-proof Ethereum smart contract auditing from donor screening to bedside transfusion.
          </p>

          {/* Action CTAs: Smart routing depending on login state */}
          <div className="rf-cta-row">
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className="rf-btn-donate">
                <span>Go to Console ({user?.role?.toUpperCase()})</span>
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="rf-btn-donate">
                  <Heart size={18} />
                  <span>Become a Blood Donor</span>
                </Link>
                <Link to="/login" className="rf-btn-login">
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. THREE-STEP WORKFLOW: How the System Operates ── */}
      <section className="rf-how-section">
        <div className="rf-new-container">
          <div className="rf-title-center">
            <span className="rf-section-badge">SIMPLE & TRANSPARENT</span>
            <h2 className="rf-sec-heading">How RedFlow Saves Lives</h2>
            <p className="rf-sec-sub">
              Three simple steps from volunteer sign up to life-saving transfusion.
            </p>
          </div>

          <div className="rf-steps-3col">
            {/* Step 1 */}
            <div className="rf-step-box">
              <div className="rf-step-num-icon">
                <span className="rf-step-num">01</span>
                <div className="rf-step-icon-circle" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <Heart size={20} />
                </div>
              </div>
              <h3 className="rf-step-heading">1. Register as a Donor</h3>
              <p className="rf-step-text">
                Enroll in 60 seconds with your blood type and location. Your personal identity remains private and encrypted.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rf-step-box">
              <div className="rf-step-num-icon">
                <span className="rf-step-num">02</span>
                <div className="rf-step-icon-circle" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                  <Zap size={20} />
                </div>
              </div>
              <h3 className="rf-step-heading">2. Instant Emergency Match</h3>
              <p className="rf-step-text">
                When a nearby hospital requests emergency blood, our automated engine notifies compatible voluntary donors immediately.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rf-step-box">
              <div className="rf-step-num-icon">
                <span className="rf-step-num">03</span>
                <div className="rf-step-icon-circle" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <h3 className="rf-step-heading">3. Cryptographic Verification</h3>
              <p className="rf-step-text">
                Every unit is anchored to Ethereum smart contracts. Bedside medical staff scan the QR code to verify 100% authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CLINICAL COMPATIBILITY GUIDE: Education for Donors & Staff ── */}
      <section className="rf-matrix-section">
        <div className="rf-new-container">
          <div className="rf-title-center">
            <span className="rf-section-badge">CLINICAL COMPATIBILITY GUIDE</span>
            <h2 className="rf-sec-heading">Blood Donation & Transfusion Matrix</h2>
            <p className="rf-sec-sub">
              See which blood groups can donate to and receive from each other during voluntary drives and emergency transfusions.
            </p>
          </div>

          <div className="rf-table-card">
            <div className="rf-table-responsive">
              <table className="rf-modern-table">
                <thead>
                  <tr>
                    <th className="rf-modern-th">Blood Type</th>
                    <th className="rf-modern-th">Can Donate To (Recipients)</th>
                    <th className="rf-modern-th">Can Receive From (Donors)</th>
                    <th className="rf-modern-th">Clinical Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {BLOOD_COMPATIBILITY.map((row) => (
                    <tr key={row.group} className="rf-modern-tr">
                      <td className="rf-modern-td">
                        <span className="rf-blood-pill">{row.group}</span>
                      </td>
                      <td className="rf-modern-td" style={{ fontWeight: 600 }}>
                        {row.canGive}
                      </td>
                      <td className="rf-modern-td" style={{ color: '#475569' }}>
                        {row.canReceive}
                      </td>
                      <td className="rf-modern-td">
                        {row.special ? (
                          <span className="rf-tag-special">{row.role}</span>
                        ) : (
                          <span className="rf-tag-regular">{row.role}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 24/7 EMERGENCY HELPLINE CALLOUT ── */}
      <section className="rf-helpline-section">
        <div className="rf-new-container">
          <div className="rf-helpline-card">
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#FEE2E2', marginBottom: 4 }}>
                EMERGENCY DISPATCH & REQUISITIONS
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 6px' }}>
                Need Urgent Blood for a Patient?
              </h3>
              <p style={{ fontSize: 13, color: '#FEE2E2', margin: 0, maxWidth: 540 }}>
                Hospitals and emergency trauma centers can raise priority broadcast requisitions 24/7.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="tel:108" className="rf-helpline-btn">
                <PhoneCall size={16} />
                <span>Call Helpline (108 / 112)</span>
              </a>
              <Link to="/login" style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)',
                color: '#FFFFFF', borderRadius: 8, padding: '12px 20px', fontSize: 14, fontWeight: 800, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center'
              }}>
                Hospital Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. APPLICATION FOOTER ── */}
      <footer className="rf-new-footer">
        <div className="rf-footer-wrap">
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#EF4444' }}>Red</span>Flow
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
              © {new Date().getFullYear()} RedFlow. Decentralized Blood Supply & Telemetry Ecosystem.
            </div>
          </div>

          <div className="rf-footer-links">
            <Link to="/register" className="rf-new-footlink">Donor Sign Up</Link>
            <Link to="/login" className="rf-new-footlink">Hospital Access</Link>
            <Link to="/admin" className="rf-new-footlink">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
