import React, { useRef, useState, useEffect } from 'react';
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
  Droplet,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EligibilityChecker from '../components/EligibilityChecker';
import api from '../lib/api';
import logo from '../assets/logo.png';

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
  const youthSectionRef = useRef(null);
  const [latestCamp, setLatestCamp] = useState(null);

  useEffect(() => {
    api.get('/camps')
      .then((res) => {
        if (res.data?.camps && res.data.camps.length > 0) {
          setLatestCamp(res.data.camps[0]);
        }
      })
      .catch((err) => {
        console.log('[Home] Camps fetch fallback to default:', err?.message);
      });
  }, []);

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

      {/* ── 2. SECTION: CHECK YOUR ELIGIBILITY (MOHFW / eRAKTKOSH 9-QUESTION CLINICAL PRE-SCREENING) ── */}
      <EligibilityChecker />

      {/* ── 3. SECTION: INDIA'S BLOOD SHORTAGE (CLEAN EDITORIAL SECTION) ── */}
      <section className="rf-shortage-section">
        <div className="rf-new-container">
          <div className="rf-shortage-clean-card">
            <h2 className="rf-shortage-title">
              India Faces a Shortage of <span style={{ color: '#DC2626' }}>2 Million Units</span> of Blood
            </h2>

            <p className="rf-shortage-desc">
              India requires approximately 15 million units of blood each year, yet only 13 million are collected. Just 2% of India's youth donating regularly would be enough to bridge this gap entirely.
            </p>

            {/* Quick Stat Chips */}
            <div className="rf-shortage-stats-row">
              <div className="rf-shortage-stat-item">
                <span className="rf-shortage-stat-num">15M Units</span>
                <span className="rf-shortage-stat-lbl">Annual Requirement</span>
              </div>
              <div className="rf-shortage-stat-divider" />
              <div className="rf-shortage-stat-item">
                <span className="rf-shortage-stat-num">13M Units</span>
                <span className="rf-shortage-stat-lbl">Collected Annually</span>
              </div>
              <div className="rf-shortage-stat-divider" />
              <div className="rf-shortage-stat-item">
                <span className="rf-shortage-stat-num" style={{ color: '#DC2626' }}>2M Units</span>
                <span className="rf-shortage-stat-lbl">Deficit Gap</span>
              </div>
            </div>

            {/* Action Button: Rectangular Red KNOW MORE linking to Wikipedia */}
            <div style={{ marginTop: 10 }}>
              <a
                href="https://en.wikipedia.org/wiki/Blood_donation_in_India"
                target="_blank"
                rel="noopener noreferrer"
                className="rf-btn-know-more"
              >
                <span>KNOW MORE</span>
                <ExternalLink size={15} />
              </a>
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

            {/* Featured Camp Banner: Dynamic Camp Feed */}
            <div className="rf-youth-camp-callout">
              <div className="rf-youth-camp-callout-info">
                <div className="rf-camp-tag-chip">UPCOMING BLOOD DONATION CAMP</div>
                <div className="rf-youth-camp-callout-title">
                  {latestCamp?.title || 'Government Engineering College, Hassan (GECH)'}
                </div>
                <div className="rf-youth-camp-callout-date" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div>Time: {latestCamp?.time || '9:00 AM – 4:30 PM IST'}</div>
                  <div>Date: {latestCamp?.date || '9/11/2026 (November 9, 2026)'}</div>
                  <div>Venue: {latestCamp?.venue || 'GECH Auditorium, Hassan'}</div>
                </div>
              </div>
              <Link
                to={isAuthenticated ? (user?.role === 'donor' ? '/donor' : '/youth-camp') : '/youth-camp'}
                className="rf-btn-camp-cta"
              >
                <span>View Camp Details</span>
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

      {/* ── 5. FOUR-STEP WORKFLOW: How the System Operates ── */}
      <section className="rf-how-section">
        <div className="rf-new-container">
          <div className="rf-title-center">
            <span className="rf-section-badge">SIMPLE & TRANSPARENT</span>
            <h2 className="rf-sec-heading">How RedFlow Saves Lives</h2>
            <p className="rf-sec-sub">
              Four simple steps from volunteer registration to life-saving bedside transfusion.
            </p>
          </div>

          <div className="rf-steps-4col">
            {/* Step 1: Register */}
            <div className="rf-step-box">
              <div className="rf-step-num-icon">
                <span className="rf-step-num">01</span>
                <div className="rf-step-icon-circle" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                  <Heart size={20} />
                </div>
              </div>
              <h3 className="rf-step-heading">1. Register as a Donor</h3>
              <p className="rf-step-text">
                Enroll in 60 seconds with your blood group and location. Your personal identity remains secure and encrypted.
              </p>
            </div>

            {/* Step 2: Donate */}
            <div className="rf-step-box">
              <div className="rf-step-num-icon">
                <span className="rf-step-num">02</span>
                <div className="rf-step-icon-circle" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  <Droplet size={20} />
                </div>
              </div>
              <h3 className="rf-step-heading">2. Donate Blood</h3>
              <p className="rf-step-text">
                Visit an authorized blood bank or youth drive camp. Undergo rapid clinical vitals screening and safe phlebotomy.
              </p>
            </div>

            {/* Step 3: Blockchain Verification */}
            <div className="rf-step-box">
              <div className="rf-step-num-icon">
                <span className="rf-step-num">03</span>
                <div className="rf-step-icon-circle" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <h3 className="rf-step-heading">3. Blockchain Verification</h3>
              <p className="rf-step-text">
                Every unit is anchored to Ethereum smart contracts, minting an immutable audit trail and verifiable QR certificate.
              </p>
            </div>

            {/* Step 4: Allocate */}
            <div className="rf-step-box">
              <div className="rf-step-num-icon">
                <span className="rf-step-num">04</span>
                <div className="rf-step-icon-circle" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <Building2 size={20} />
                </div>
              </div>
              <h3 className="rf-step-heading">4. Allocate & Transfuse</h3>
              <p className="rf-step-text">
                Matched in real-time with urgent hospital requisitions and safely transfused with verified bedside provenance.
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
            <div className="rf-table-scroll-hint">
              <span>← Swipe horizontally to view full matrix →</span>
            </div>
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

            <div className="rf-helpline-actions">
              <a href="tel:108" className="rf-helpline-btn">
                <PhoneCall size={16} />
                <span>Call Helpline (108 / 112)</span>
              </a>
              <Link to="/login" className="rf-helpline-login-btn">
                Hospital Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. MODERN COMPREHENSIVE APPLICATION FOOTER ── */}
      <footer className="rf-new-footer">
        {/* Desktop / Tablet Multi-Column View */}
        <div className="rf-footer-grid">
          {/* Column 1: Brand & Live Telemetry */}
          <div className="rf-footer-brand-col">
            <Link to="/" className="rf-footer-logo">
              <span style={{ color: '#EF4444' }}>Red</span>Flow
            </Link>
            <p className="rf-footer-tagline">
              India's 1st Blockchain-Secured Decentralized Blood Supply &amp; Telemetry Ecosystem. Ensuring verifiable provenance from voluntary donor to bedside transfusion.
            </p>
            <div className="rf-footer-badge">
              <ShieldCheck size={14} />
              <span>Ethereum Sepolia Audited</span>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="rf-footer-col">
            <h4 className="rf-footer-col-title">Quick Navigation</h4>
            <ul className="rf-footer-links-list">
              <li><a href="#check-eligibility" className="rf-footer-link">Check Eligibility</a></li>
              <li><a href="#youth-movement" className="rf-footer-link">Youth Movement</a></li>
              <li><Link to="/youth-camp" className="rf-footer-link">Nearby Blood Camps</Link></li>
              <li><Link to="/blockchain" className="rf-footer-link">Blockchain Explorer</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform Access */}
          <div className="rf-footer-col">
            <h4 className="rf-footer-col-title">Platform Access</h4>
            <ul className="rf-footer-links-list">
              <li><Link to="/register" className="rf-footer-link">Donor Registration</Link></li>
              <li><Link to="/login" className="rf-footer-link">Hospital Portal</Link></li>
              <li><Link to="/login" className="rf-footer-link">Admin Console</Link></li>
              <li><Link to="/donor" className="rf-footer-link">Donor Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 4: Emergency Contacts & Compliance */}
          <div className="rf-footer-col">
            <h4 className="rf-footer-col-title">Emergency &amp; Standards</h4>
            <div className="rf-footer-links-list">
              <div className="rf-footer-contact-item">
                <PhoneCall size={14} style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }} />
                <span>24/7 National Emergency Helpline: <strong>108 / 112</strong></span>
              </div>
              <div className="rf-footer-contact-item">
                <ShieldCheck size={14} style={{ color: '#059669', flexShrink: 0, marginTop: 2 }} />
                <span>MoHFW &amp; eRaktKosh Clinical Screening Standards</span>
              </div>
              <div className="rf-footer-contact-item">
                <Building2 size={14} style={{ color: '#0284C7', flexShrink: 0, marginTop: 2 }} />
                <span>National Blood Transfusion Council (NBTC) Norms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Simplified View: Just logo, name, and rights */}
        <div className="rf-footer-mobile-simple">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src={logo} alt="RedFlow" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            <span style={{ fontSize: 17, fontWeight: 900, color: '#FFFFFF', letterSpacing: -0.3 }}>
              <span style={{ color: '#EF4444' }}>Red</span>Flow
            </span>
          </Link>
          <div style={{ fontSize: 11.5, color: '#94A3B8', textAlign: 'center', marginTop: 2 }}>
            © {new Date().getFullYear()} RedFlow. All rights reserved.
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="rf-footer-bottom">
          <div>
            © {new Date().getFullYear()} RedFlow. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <ShieldCheck size={13} color="#059669" />
            <span>Ethereum Sepolia Audited</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
