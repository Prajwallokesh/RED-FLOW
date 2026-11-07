import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Heart,
  CheckCircle2,
  ArrowLeft,
  Share2,
  Check,
  PhoneCall,
  Award,
  Activity,
  ShieldCheck,
  Sparkles,
  Users,
  Copy,
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import logo from '../assets/logo.png';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SIMPLIFIED BLOOD DONATION CAMP DETAILS & REGISTRATION
 * Clean, modern, dedicated single-page view for upcoming blood donation drives.
 * Donors register directly through their accounts with 1-click RSVP.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const YouthCamp = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { campId: routeCampId } = useParams();
  const [searchParams] = useSearchParams();

  const campId = routeCampId || searchParams.get('id') || 'gech-hassan-2026';

  const [camp, setCamp] = useState({
    campId: 'gech-hassan-2026',
    title: 'Government Engineering College, Hassan (GECH)',
    organizer: 'RedFlow Youth Movement & NSS',
    venue: 'GECH Auditorium, Dairy Circle, B.M. Road, Hassan, Karnataka - 573201',
    city: 'Hassan',
    date: '9/11/2026 (Monday, November 9, 2026)',
    time: '9:00 AM – 4:30 PM IST',
    clinicalPartner: 'HIMS Blood Bank',
    targetUnits: 250,
    registeredCount: 6,
    description: 'Mega youth blood donation drive in association with HIMS Blood Bank. Earn official voluntary certificates with Ethereum blockchain proof.',
    contactPhone: '+91 98801 23456',
    contactEmail: 'youth@redflow.org',
    status: 'upcoming'
  });

  const [loading, setLoading] = useState(true);
  const [donorProfile, setDonorProfile] = useState(null);

  // Registration state
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationToken, setRegistrationToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Guest inputs if not authenticated or needs edit
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestBloodGroup, setGuestBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [showEditInputs, setShowEditInputs] = useState(false);

  // 1. Fetch Camp Details
  useEffect(() => {
    let isMounted = true;
    const fetchCamp = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/camps/${campId}`);
        if (isMounted && res.data?.camp) {
          setCamp(res.data.camp);
        }
      } catch (err) {
        // Fallback: fetch from /camps and match
        try {
          const listRes = await api.get('/camps');
          if (isMounted && listRes.data?.camps) {
            const found = listRes.data.camps.find(c => c.campId === campId || c._id === campId);
            if (found) setCamp(found);
          }
        } catch (_) {}
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCamp();
    return () => { isMounted = false; };
  }, [campId]);

  // 2. Fetch Donor Profile if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/donors/me')
        .then(res => {
          if (res.data?.donor) {
            setDonorProfile(res.data.donor);
            if (res.data.donor.phone) setGuestPhone(res.data.donor.phone);
            if (res.data.donor.bloodGroup) setGuestBloodGroup(res.data.donor.bloodGroup);
            if (res.data.donor.name) setGuestName(res.data.donor.name);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  // 3. Check if already registered locally
  useEffect(() => {
    const savedToken = localStorage.getItem(`rf_camp_token_${campId}`);
    if (savedToken) {
      setIsRegistered(true);
      setRegistrationToken(savedToken);
    }
  }, [campId]);

  // Handle Registration RSVP
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const donorName = donorProfile?.name || user?.name || guestName;
    const donorPhone = donorProfile?.phone || user?.phone || guestPhone;
    const donorBlood = donorProfile?.bloodGroup || user?.bloodGroup || guestBloodGroup;

    if (!donorName?.trim() || !donorPhone?.trim()) {
      setErrorMsg('Full Name and Phone Number are required to register.');
      setIsSubmitting(false);
      setShowEditInputs(true);
      return;
    }

    try {
      const payload = {
        campId: camp.campId || campId,
        name: donorName.trim(),
        phone: donorPhone.trim(),
        email: user?.email || '',
        bloodGroup: donorBlood,
        affiliation: donorProfile?.isVerified ? 'Verified Donor' : 'Voluntary Donor',
        donorId: donorProfile?.donorId || '',
        userId: user?.id || null,
      };

      const res = await api.post('/camps/register', payload);
      const token = res.data?.registration?.registrationToken || '#CAMP-101';
      setIsRegistered(true);
      setRegistrationToken(token);
      localStorage.setItem(`rf_camp_token_${campId}`, token);

      if (res.data?.totalCount) {
        setCamp(prev => ({ ...prev, registeredCount: res.data.totalCount }));
      } else {
        setCamp(prev => ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed. Please check your network.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleCopyToken = () => {
    if (navigator.clipboard && registrationToken) {
      navigator.clipboard.writeText(registrationToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const targetGoal = camp.targetUnits || 250;
  const currentCount = camp.registeredCount || 0;
  const progressPct = Math.min(100, Math.round((currentCount / targetGoal) * 100));

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#1E293B', fontFamily: 'inherit' }}>
      {/* ── Top Navbar ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{
          maxWidth: 860,
          margin: '0 auto',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => navigate(user?.role === 'donor' ? '/donor' : -1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src={logo} alt="RedFlow" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            <span style={{ fontSize: 18, fontWeight: 900, color: '#172B4D', letterSpacing: -0.3 }}>
              <span style={{ color: '#DC2626' }}>Red</span>Flow
            </span>
          </Link>

          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12.5,
              fontWeight: 700,
              color: '#172B4D',
              cursor: 'pointer',
            }}
            title="Share this camp"
          >
            {copiedShare ? <Check size={15} color="#059669" /> : <Share2 size={15} />}
            <span>{copiedShare ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* ── Main Camp Details Content ── */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '24px 18px 60px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 1. Main Header Card */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '24px 22px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: '#F3E8FF',
                  color: '#7C3AED',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  padding: '3px 10px',
                  borderRadius: 6,
                }}>
                  UPCOMING YOUTH MOVEMENT
                </span>
                <span style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
                  {camp.city || 'Hassan'}
                </span>
              </div>

              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                Drive ID: <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>#{camp.campId}</strong>
              </span>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h1 style={{ fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 900, color: '#172B4D', margin: '0 0 6px', lineHeight: 1.25 }}>
                {camp.title}
              </h1>
              <p style={{ fontSize: 13.5, color: '#475569', margin: 0, lineHeight: 1.5 }}>
                Organized by <strong>{camp.organizer || 'RedFlow Youth Movement & NSS'}</strong> in clinical partnership with <strong>{camp.clinicalPartner || 'HIMS Blood Bank'}</strong>.
              </p>
            </div>

            {/* Live Progress Bar */}
            <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: 10, border: '1px solid #E2E8F0', marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                <span>Live Drive Registrations</span>
                <span style={{ color: '#DC2626' }}>
                  {currentCount} / {targetGoal} Units Goal ({progressPct}%)
                </span>
              </div>
              <div style={{ width: '100%', height: 7, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.max(4, progressPct)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #DC2626, #EF4444)',
                  borderRadius: 999,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>

          {/* 2. Key Logistics Grid (4-card clean matrix) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Event Date</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{camp.date}</div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7', flexShrink: 0 }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Drive Timings</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{camp.time}</div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              gridColumn: '1 / -1'
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706', flexShrink: 0 }}>
                <MapPin size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Camp Venue Location</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{camp.venue}</div>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              gridColumn: '1 / -1'
            }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                <Building2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Clinical Oversight &amp; Testing</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{camp.clinicalPartner || 'HIMS Blood Bank'}</div>
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                  Licensed medical officers and transfusion specialists on-site
                </div>
              </div>
            </div>
          </div>

          {/* 3. Description & Donor Perks (Clean 3 Cards) */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            padding: '22px 20px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Camp Overview &amp; Voluntary Donor Recognition
            </h3>

            {camp.description && (
              <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>
                {camp.description}
              </p>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: 10,
              marginTop: 4,
            }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>
                  <ShieldCheck size={16} />
                  <span>On-Chain Certificate</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.4 }}>
                  Official voluntary certificate anchored to Ethereum Sepolia with permanent QR audit proof.
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0284C7', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>
                  <Activity size={16} />
                  <span>Free Health Screening</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.4 }}>
                  Complete vitals review: blood pressure, pulse, Hemoglobin Hb count, and ABO-Rh typing on site.
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7C3AED', fontWeight: 700, fontSize: 12.5, marginBottom: 4 }}>
                  <Sparkles size={16} />
                  <span>Nutrition &amp; Recovery</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.4 }}>
                  High-protein refreshments, glucose drinks, and post-donation clinical observation care.
                </div>
              </div>
            </div>

            {/* Quick Eligibility Rule Bar */}
            <div style={{
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 12,
              color: '#9A3412',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              lineHeight: 1.45
            }}>
              <Info size={16} color="#EA580C" style={{ flexShrink: 0 }} />
              <div>
                <strong>Quick Eligibility:</strong> Age 18–65 • Weight 45+ kg • 90 days since previous whole blood donation • Carry your College or Government Photo ID.
              </div>
            </div>
          </div>

          {/* 4. DEDICATED REGISTRATION / RSVP SECTION */}
          <div style={{
            background: '#FFFFFF',
            border: isRegistered ? '1.5px solid #A7F3D0' : '1.5px solid #CBD5E1',
            borderRadius: 16,
            padding: '24px 22px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {isRegistered ? (
              /* Already Registered Confirmation */
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <CheckCircle2 size={32} />
                </div>

                <h3 style={{ fontSize: 19, fontWeight: 900, color: '#065F46', margin: '0 0 6px' }}>
                  You are Registered for this Camp!
                </h3>
                <p style={{ fontSize: 13, color: '#047857', margin: '0 0 16px', lineHeight: 1.5 }}>
                  Your donation slot has been reserved. Please show this token at the welcome desk at {camp.venue}.
                </p>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#F0FDF4',
                  border: '1.5px dashed #059669',
                  borderRadius: 10,
                  padding: '8px 18px',
                  marginBottom: 16
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>Registration Token:</span>
                  <strong style={{ fontSize: 16, fontFamily: 'monospace', color: '#047857' }}>
                    {registrationToken || '#CAMP-101'}
                  </strong>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 2
                    }}
                    title="Copy Token"
                  >
                    {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => navigate(user?.role === 'donor' ? '/donor' : '/')}
                    style={{
                      background: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      padding: '9px 18px',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Go to Donor Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    style={{
                      background: '#FFFFFF',
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '9px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Share2 size={14} />
                    <span>Invite Friends</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Register Form / 1-Click Action */
              <div>
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>
                    Register for this Blood Donation Camp
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
                    Confirm your slot in seconds. All voluntary donors receive official certificate &amp; clinical vitals check.
                  </p>
                </div>

                {errorMsg && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECDD3',
                    color: '#DC2626',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <AlertCircle size={15} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Authenticated Donor Account Card */}
                {isAuthenticated && !showEditInputs ? (
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#DC2626',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14
                      }}>
                        {donorProfile?.bloodGroup || user?.bloodGroup || 'O+'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                          Registering as: {donorProfile?.name || user?.name || 'Voluntary Donor'}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>
                          Phone: {donorProfile?.phone || user?.phone || 'On File'} • Status: {donorProfile?.isVerified ? 'Verified Donor' : 'Voluntary Donor'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowEditInputs(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#007C91',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '4px 6px'
                      }}
                    >
                      Edit Info
                    </button>
                  </div>
                ) : (
                  /* Form Fields if guest or editing */
                  <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Prajwal K L"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1px solid #CBD5E1',
                            borderRadius: 8,
                            fontSize: 13,
                            outline: 'none',
                            background: '#FFFFFF'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Phone / WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="e.g. 98765 43210"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1px solid #CBD5E1',
                            borderRadius: 8,
                            fontSize: 13,
                            outline: 'none',
                            background: '#FFFFFF'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Blood Group
                        </label>
                        <select
                          value={guestBloodGroup}
                          onChange={(e) => setGuestBloodGroup(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            border: '1px solid #CBD5E1',
                            borderRadius: 8,
                            fontSize: 13,
                            outline: 'none',
                            background: '#FFFFFF'
                          }}
                        >
                          {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Do not know'].map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </form>
                )}

                {/* Primary Action Button */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRegister}
                  style={{
                    width: '100%',
                    background: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px 20px',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Heart size={18} fill="#FFFFFF" />
                  <span>{isSubmitting ? 'Registering Slot…' : 'Register for this Camp'}</span>
                </button>

                <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', margin: '8px 0 0' }}>
                  By registering, your slot is reserved for voluntary donation on {camp.date}. No spam.
                </p>
              </div>
            )}

            {/* Helpline contact banner */}
            <div style={{
              borderTop: '1px solid #F1F5F9',
              paddingTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 12,
              color: '#64748B'
            }}>
              <a
                href="tel:108"
                style={{
                  color: '#DC2626',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <PhoneCall size={13} />
                <span>24/7 Medical Helpline: 108 / 112</span>
              </a>

              <span>Email: <strong style={{ color: '#0F172A' }}>{camp.contactEmail || 'youth@redflow.org'}</strong></span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default YouthCamp;
