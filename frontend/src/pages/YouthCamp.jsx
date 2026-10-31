import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  Award,
  ShieldCheck,
  Heart,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Check,
  PhoneCall,
  Activity,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import logo from '../assets/logo.png';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * YOUTH DONOR MOVEMENT & BLOOD DONATION CAMP PAGE
 * Single-page high-impact event portal for the upcoming blood donation drive
 * at Government Engineering College, Hassan on 9/11/2026.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const YouthCamp = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Registration state
  const [isJoined, setIsJoined] = useState(false);
  const [donorCount, setDonorCount] = useState(5);
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [affiliation, setAffiliation] = useState('GECH Student / Faculty');
  const [registeredToken, setRegisteredToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    api.get('/camps/stats')
      .then(res => {
        if (res.data?.totalCount !== undefined) {
          setDonorCount(res.data.totalCount);
        }
      })
      .catch(() => {});
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!donorName.trim() || !donorPhone.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/camps/register', {
        name: donorName.trim(),
        phone: donorPhone.trim(),
        bloodGroup,
        affiliation: affiliation.trim(),
        email: user?.email || '',
      });
      setIsJoined(true);
      const token = res.data?.registration?.registrationToken || '#GECH-CAMP-106';
      setRegisteredToken(token);
      if (res.data?.totalCount) {
        setDonorCount(res.data.totalCount);
      } else {
        setDonorCount(prev => prev + 1);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text = 'Join the Mega Youth Blood Donation Movement at Government Engineering College, Hassan on 9/11/2026! Every unit saves up to 3 lives. Register now on RedFlow!';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  return (
    <div className="rf-camp-page">
      {/* ── Top Header Bar ── */}
      <header className="rf-camp-navbar">
        <div className="rf-camp-nav-container">
          <button onClick={() => navigate(-1)} className="rf-camp-back-btn">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <Link to="/" className="rf-camp-logo-link">
            <img src={logo} alt="RedFlow" className="rf-camp-logo-img" />
            <span className="rf-camp-logo-text">
              <span style={{ color: '#DC2626' }}>Red</span>Flow
            </span>
          </Link>

          <button onClick={handleShare} className="rf-camp-share-btn" title="Share event">
            {copiedShare ? <Check size={16} color="#059669" /> : <Share2 size={16} />}
            <span>{copiedShare ? 'Copied Link' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="rf-camp-main">
        {/* Hero Event Banner */}
        <div className="rf-camp-hero-card">
          <div className="rf-camp-badge-row">
            <span className="rf-camp-live-badge">
              <span className="rf-live-pulse-dot" />
              UPCOMING MEGA DONATION DRIVE
            </span>

          </div>

          <h1 className="rf-camp-main-heading">
            Youth Blood Donor Movement
          </h1>

          <p className="rf-camp-subheading">
            Organized by <strong>RedFlow Youth Network</strong> &amp; <strong>Red Cross Society</strong> in clinical partnership with <strong>Hassan Institute of Medical Sciences (HIMS Blood Bank)</strong>.
          </p>

          {/* Quick Event Summary Highlights */}
          <div className="rf-camp-meta-strip">
            <div className="rf-camp-meta-box">
              <Calendar size={18} color="#DC2626" />
              <div>
                <div className="rf-meta-lbl">DATE</div>
                <div className="rf-meta-val">Monday, 9 Nov 2026 (09/11/2026)</div>
              </div>
            </div>

            <div className="rf-camp-meta-box">
              <Clock size={18} color="#007C91" />
              <div>
                <div className="rf-meta-lbl">TIMINGS</div>
                <div className="rf-meta-val">9:00 AM – 4:30 PM IST</div>
              </div>
            </div>

            <div className="rf-camp-meta-box full-span">
              <MapPin size={18} color="#D97706" />
              <div>
                <div className="rf-meta-lbl">CAMP VENUE</div>
                <div className="rf-meta-val">
                  Main College Auditorium &amp; Health Center, <strong>Government Engineering College, Hassan (GECH)</strong>
                </div>
                <div className="rf-meta-sub">Dairy Circle, B.M. Road, Hassan, Karnataka - 573201</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Column Content Grid ── */}
        <div className="rf-camp-grid">
          {/* Left Column: Camp Objectives, Perks & Eligibility */}
          <div className="rf-camp-left-col">
            {/* Why This Camp Matters */}
            <div className="rf-camp-info-card">
              <h2 className="rf-camp-sec-title">
                <Heart size={20} color="#DC2626" />
                <span>The Mission Behind GECH Hassan Drive</span>
              </h2>
              <p className="rf-camp-text">
                Every month, hospitals across Hassan district face sudden acute shortages of blood for emergency trauma victims, thalassemia children, and maternity surgeries. By turning out on <strong>November 9th, 2026</strong>, student engineers, professors, and youth from across Hassan can build an unbreakable emergency buffer.
              </p>
              <div className="rf-camp-target-highlight">
                <div className="rf-target-num">250+</div>
                <div>
                  <div className="rf-target-title">Target Whole Blood Units Goal</div>
                  <div className="rf-target-sub">Can treat up to 750 emergency surgical and trauma patients</div>
                </div>
              </div>
            </div>

            {/* Perks for Donors */}
            <div className="rf-camp-info-card">
              <h2 className="rf-camp-sec-title">
                <Award size={20} color="#D97706" />
                <span>What Every Voluntary Donor Receives</span>
              </h2>
              <div className="rf-camp-perks-list">
                <div className="rf-camp-perk-item">
                  <ShieldCheck size={18} color="#059669" />
                  <div>
                    <strong>Verified On-Chain Certificate:</strong> Official Certificate of Appreciation anchored to Ethereum Sepolia with QR code for college credits &amp; NSS volunteering recognition.
                  </div>
                </div>
                <div className="rf-camp-perk-item">
                  <Activity size={18} color="#007C91" />
                  <div>
                    <strong>Free Health &amp; Hemoglobin Checkup:</strong> Complete vitals check (Blood pressure, pulse, Hemoglobin Hb count, ABO-Rh typing) by HIMS clinical medical officers.
                  </div>
                </div>
                <div className="rf-camp-perk-item">
                  <Sparkles size={18} color="#7C3AED" />
                  <div>
                    <strong>Nutritional Refreshment Pack:</strong> High-protein energy refreshments, glucose juices, and fresh fruits post-donation.
                  </div>
                </div>
                <div className="rf-camp-perk-item">
                  <CheckCircle2 size={18} color="#DC2626" />
                  <div>
                    <strong>Donor Privilege Badge:</strong> Priority emergency blood support for yourself and immediate family via RedFlow network.
                  </div>
                </div>
              </div>
            </div>

            {/* Donor Eligibility Quick Checklist */}
            <div className="rf-camp-info-card">
              <h2 className="rf-camp-sec-title">
                <FileCheck size={20} color="#007C91" />
                <span>Eligibility Checklist for Students &amp; Youths</span>
              </h2>
              <ul className="rf-camp-checklist">
                <li>Age must be between <strong>18 and 65 years</strong>.</li>
                <li>Weight must be at least <strong>45 kg</strong>.</li>
                <li>Hemoglobin level should be at least <strong>12.5 g/dL</strong> (tested free on-site).</li>
                <li>Must be at least <strong>90 days</strong> since your previous whole blood donation.</li>
                <li>Have a light meal and drink plenty of water prior to donation.</li>
                <li>Please carry your <strong>College Student ID</strong> or government photo identification.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: RSVP & Join Form */}
          <div className="rf-camp-right-col">
            <div className="rf-camp-rsvp-card">
              <div className="rf-rsvp-header">
                <h3 className="rf-rsvp-title">Register for the Camp</h3>
                <p className="rf-rsvp-sub">Confirm your attendance in 30 seconds</p>
              </div>

              {isJoined ? (
                <div className="rf-rsvp-success-box">
                  <div className="rf-rsvp-success-icon">
                    <CheckCircle2 size={36} color="#059669" />
                  </div>
                  <h4 className="rf-rsvp-success-heading">You are Registered!</h4>
                  <p className="rf-rsvp-success-text">
                    Thank you, <strong>{donorName || 'Champion'}</strong>! Your commitment has been recorded for the Youth Blood Donor Movement at <strong>GECH Hassan on 9/11/2026</strong>.
                  </p>
                  <div className="rf-rsvp-ticket-chip">
                    <span>Registration Token:</span>
                    <strong>{registeredToken || `#GECH-CAMP-${donorCount}`}</strong>
                  </div>
                  <p style={{ fontSize: 11, color: '#64748B', marginTop: 10 }}>
                    A reminder will be sent to your registered contact. See you at the GECH Auditorium!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleJoin} className="rf-rsvp-form">
                  {errorMsg && (
                    <div style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECDD3',
                      color: '#DC2626',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {errorMsg}
                    </div>
                  )}

                  <div className="rf-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="e.g. Prajwal K L"
                      className="rf-camp-input"
                    />
                  </div>

                  <div className="rf-form-group">
                    <label>Phone / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      placeholder="e.g. 98765 43210"
                      className="rf-camp-input"
                    />
                  </div>

                  <div className="rf-form-row">
                    <div className="rf-form-group" style={{ flex: 1 }}>
                      <label>Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="rf-camp-input"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Do not know'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="rf-form-group" style={{ flex: 1.2 }}>
                      <label>College / Affiliation</label>
                      <input
                        type="text"
                        value={affiliation}
                        onChange={(e) => setAffiliation(e.target.value)}
                        placeholder="GECH Student / Faculty"
                        className="rf-camp-input"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="rf-btn-submit-camp">
                    <Heart size={18} />
                    <span>{loading ? 'Registering…' : 'Join Movement & Register'}</span>
                  </button>

                  <p className="rf-camp-form-foot">
                    No spam. Registration helps the medical team prepare collection bags and test kits.
                  </p>
                </form>
              )}

              {/* Direct Hospital Contact */}
              <div className="rf-camp-help-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#172B4D' }}>
                  <Building2 size={16} color="#DC2626" />
                  <span>Clinical Oversight:</span>
                </div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
                  Blood Bank Department, Hassan Institute of Medical Sciences (HIMS)
                </div>
                <a href="tel:108" style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <PhoneCall size={12} />
                  <span>24/7 Camp Helpline: 108 / 112</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YouthCamp;
