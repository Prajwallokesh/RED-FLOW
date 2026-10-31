import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  ArrowRight,
  Zap,
  PhoneCall,
  LogIn,
  Award,
  GraduationCap,
  Building2,
  Activity,
  CheckCircle2,
  Sparkles,
  Users,
  QrCode,
  FileCheck,
  Droplet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ScrollableBloodDrop from '../components/ScrollableBloodDrop';

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
 * Provides easy donor onboarding, blood shortage awareness, youth movement,
 * verified certificates, emergency contacts, and clinical compatibility guide.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const shortageSectionRef = useRef(null);
  const youthSectionRef = useRef(null);

  /**
   * Helper: Automatically routes a logged-in user to their respective dashboard
   */
  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'hospital') return '/hospital';
    return '/donor';
  };

  const scrollToYouth = (e) => {
    e.preventDefault();
    youthSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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

      {/* ── 2. SECTION: INDIA'S BLOOD SHORTAGE & SCROLLABLE LIQUID BLOOD DROPLET ── */}
      <section className="rf-shortage-section" ref={shortageSectionRef}>
        <div className="rf-new-container">
          <div className="rf-shortage-grid">
            {/* Pure Scroll-Reactive Blood Droplet Illustration */}
            <ScrollableBloodDrop containerRef={shortageSectionRef} />

            {/* Editorial Content Matching Reference */}
            <div className="rf-shortage-content">
              <h2 className="rf-shortage-title">
                India Faces a Shortage of <span style={{ color: '#DC2626' }}>2 Million Units</span> of Blood
              </h2>

              <p className="rf-shortage-desc">
                India requires approximately 15 million units of blood each year, yet only 13 million are collected. Just 2% of India's youth donating regularly would be enough to bridge this gap entirely.
              </p>

              {/* Action Button: Rectangular Red KNOW MORE */}
              <div style={{ marginTop: 8 }}>
                <Link to="/youth-camp" className="rf-btn-know-more">
                  KNOW MORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SECTION: WE, THE YOUTH, CAN MAKE INDIA BLOOD-SUFFICIENT ── */}
      <section className="rf-youth-section" id="youth-movement" ref={youthSectionRef}>
        <div className="rf-new-container">
          <div className="rf-youth-clean-wrapper">
            <h2 className="rf-youth-title">
              We, the youth, can make <span style={{ color: '#DC2626' }}>India Blood Sufficient</span>
            </h2>
            <p className="rf-youth-editorial-text">
              RedFlow Youth Movement is India's largest youth-driven organization working alongside colleges, corporates, and Resident Welfare Associations (RWAs) to help blood banks maintain adequate supplies. We offer a 360° solution, from inspiring people to donate blood to facilitating donation through organized camps.
            </p>

            {/* Featured Camp Banner: GECH Hassan */}
            <div className="rf-youth-camp-callout">
              <div className="rf-youth-camp-callout-info">
                <div className="rf-camp-tag-chip">UPCOMING YOUTH DONOR MOVEMENT</div>
                <div className="rf-youth-camp-callout-title">
                  Government Engineering College, Hassan (GECH)
                </div>
                <div className="rf-youth-camp-callout-date" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div>Time: 9:00 AM – 4:30 PM IST</div>
                  <div>Date: 9/11/2026 (November 9, 2026)</div>
                </div>
              </div>
              <Link to="/youth-camp" className="rf-btn-camp-cta">
                <span>View Movement Details</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SECTION: OFFICIAL VOLUNTARY RECOGNITION (INFORMATIONAL) ── */}
      <section className="rf-certificate-section">
        <div className="rf-new-container">
          <div className="rf-title-center" style={{ maxWidth: 760, margin: '0 auto' }}>
            <span className="rf-section-badge" style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}>
              OFFICIAL VOLUNTARY RECOGNITION
            </span>
            <h2 className="rf-sec-heading">
              Earn an Official <span style={{ color: '#D97706' }}>Donation Certificate</span> with Blockchain Proof
            </h2>
            <p className="rf-sec-sub">
              Every voluntary blood donation through RedFlow is rewarded with verified academic and professional recognition, anchored to the Ethereum Sepolia blockchain for college NSS credits, verified community service, and permanent cryptographic proof.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. THREE-STEP WORKFLOW: How the System Operates ── */}
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

      {/* ── 6. CLINICAL COMPATIBILITY GUIDE: Education for Donors & Staff ── */}
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

      {/* ── 7. 24/7 EMERGENCY HELPLINE CALLOUT ── */}
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

      {/* ── 8. APPLICATION FOOTER ── */}
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
