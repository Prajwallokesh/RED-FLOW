import S from '../styles/donorStyles';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Droplet,
  User,
  Bell,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  AlertCircle,
  FileText,
  BellOff,
  LogOut,
  ChevronRight,
  X,
  RefreshCw,
  Heart,
  PhoneCall,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import logo from '../assets/logo.png';

/* ── Status Pill ─────────────────────────────────────────────────── */
const StatusPill = ({ status }) => {
  const map = {
    pending:  { label: 'Pending Review', color: '#FFA000', bg: 'rgba(255,160,0,0.12)', icon: <Clock size={12} /> },
    verified: { label: 'Verified',       color: '#2E7D32', bg: 'rgba(46,125,50,0.12)', icon: <CheckCircle2 size={12} /> },
    flagged:  { label: 'BANNED',         color: '#DC2626', bg: '#FEE2E2',              icon: <AlertTriangle size={12} /> },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 100,
      padding: '4px 10px',
      fontSize: 12,
      fontWeight: 700,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      whiteSpace: 'nowrap'
    }}>
      {s.icon}
      <span>{s.label}</span>
    </span>
  );
};

/* ── Stat Card ───────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, accent }) => (
  <div style={S.statCard}>
    <div style={{ ...S.statIconBox, color: accent, background: `${accent}12` }}>
      {icon}
    </div>
    <div style={{ ...S.statValue, color: accent }}>{value ?? '—'}</div>
    <div style={S.statLabel}>{label}</div>
  </div>
);

/* ── Bottom Tabs ─────────────────────────────────────────────────── */
const TABS = [
  { id: 'home',    Icon: Home,    label: 'Home'    },
  { id: 'history', Icon: Droplet, label: 'History' },
  { id: 'profile', Icon: User,    label: 'Profile' },
  { id: 'alerts',  Icon: Bell,    label: 'Alerts'  },
];

/* ═══════════════════════════════════════════════════════════════════
   DONOR DASHBOARD
═══════════════════════════════════════════════════════════════════ */
const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]                 = useState('home');
  const [donor, setDonor]             = useState(null);
  const [donations, setDonations]     = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [showEligModal, setShowEligModal] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [isSyncing, setIsSyncing]     = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  /**
   * GUIDE EXPLANATION: Live Urgent Alerts from Map/Hospitals
   * Question: "How does the donor receive notifications sent from the interactive hospital map?"
   * Answer: RedFlow provides an emergency transmission route /api/notifications. When a hospital
   * or admin clicks a donor on the map and clicks 'Send Urgent Blood Alert', the backend records
   * the notification with donor user ID, sender details, and emergency template message.
   * Here on DonorDashboard, the donor polls or fetches /api/notifications/my-notifications,
   * showing the unread count badge on the Alerts tab and high-priority action cards.
   */
  const fetchNotifications = async (silent = false) => {
    if (!silent) setIsLoadingAlerts(true);
    try {
      const res = await api.get('/notifications/my-notifications');
      if (res.data) {
        const notifList = res.data.notifications || [];
        setNotifications(notifList);
        setUnreadAlertsCount(
          res.data.unreadCount !== undefined
            ? res.data.unreadCount
            : notifList.filter(n => !n.isRead).length
        );
      }
    } catch (err) {
      console.error('[DonorDashboard] Failed to fetch notifications:', err);
    } finally {
      if (!silent) setIsLoadingAlerts(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n));
      setUnreadAlertsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[DonorDashboard] Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadAlertsCount(0);
    } catch (err) {
      console.error('[DonorDashboard] Failed to mark all read:', err);
    }
  };

  /**
   * GUIDE EXPLANATION: Live Reactive Updates Without WebSockets
   * Question: "How does the donor screen update in real time when an admin changes blood status?"
   * Answer: When viewing the History tab, the component activates lightweight background
   * polling (every 6 seconds) and an instant refresh on tab switch. If an admin tests or
   * issues a unit in another window, the donor's view updates automatically.
   */
  const fetchHistory = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const histRes = await api.get('/donors/me/history');
      if (histRes.data && histRes.data.donations) {
        setDonations(histRes.data.donations);
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('[DonorDashboard] Failed to fetch donation history:', err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  /* Auto-refresh when entering history tab, plus polling every 6 seconds so admin updates reflect live */
  useEffect(() => {
    if (tab === 'history') {
      fetchHistory();
      const timer = setInterval(() => {
        fetchHistory(true);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [tab]);

  /* Auto-refresh notifications when entering alerts tab, plus polling every 6 seconds */
  useEffect(() => {
    fetchNotifications(true);
    if (tab === 'alerts') {
      fetchNotifications();
      const timer = setInterval(() => {
        fetchNotifications(true);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [tab]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profileRes = await api.get('/donors/me/profile');
        setDonor(profileRes.data.donor);

        try {
          const [eligRes, histRes] = await Promise.all([
            api.post('/donors/check-eligibility', {}),
            api.get('/donors/me/history'),
            fetchNotifications(true),
          ]);
          setEligibility(eligRes.data);
          setDonations(histRes.data.donations || []);
          setLastSyncTime(new Date());
        } catch {
          // Ignored if sub-requests fail
        }
      } catch {
        setDonor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* Badge calculation */
  const badge = (() => {
    const c = donor?.donationCount ?? 0;
    if (c >= 10) return { label: 'Platinum Donor', color: '#607D8B' };
    if (c >= 5)  return { label: 'Gold Donor',     color: '#FFA000' };
    if (c >= 3)  return { label: 'Silver Donor',   color: '#78909C' };
    if (c >= 1)  return { label: 'Bronze Donor',   color: '#A0522D' };
    return null;
  })();

  /* Next eligible date */
  const nextEligibleFormatted = (() => {
    if (!eligibility?.nextEligibleDate) return 'Eligible';
    const nextDate = new Date(eligibility.nextEligibleDate);
    const now = new Date();
    if (nextDate <= now) return 'Eligible';
    return nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  })();

  /* ── HOME ──────────────────────────────────────────────────────── */
  const HomeTab = () => (
    <div style={S.tabContent}>
      {/* Welcome hero card */}
      <div style={S.heroCard}>
        <div style={S.heroTop}>
          <div>
            <div style={S.heroGreet}>Welcome back</div>
            <div style={S.heroName}>{user?.name}</div>
          </div>
          {donor
            ? <span style={S.bloodChip}>{donor.bloodGroup}</span>
            : <span style={S.bloodChipGray}>--</span>}
        </div>
        <div style={S.heroDivider} />
        <div style={S.heroBottom}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Account Status</span>
          {loading
            ? <span style={S.statusLoading}>Checking…</span>
            : donor
              ? <StatusPill status={donor.eligibilityStatus} />
              : <span style={S.statusNotReg}>
                  <FileText size={12} />
                  <span>Not Registered</span>
                </span>}
        </div>
      </div>

      {/* Disqualification / Banned Alert */}
      {donor?.isFlagged && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECDD3',
          borderRadius: 12,
          padding: '14px 16px',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          marginBottom: 16,
        }}>
          <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#991B1B' }}>
              Account Disqualified from Blood Donation
            </div>
            <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 3, lineHeight: 1.5 }}>
              {donor.flagReason ? `Reason: "${donor.flagReason}".` : 'Your account has been permanently flagged and banned by medical administration.'}
              {' '}In accordance with strict clinical blood banking standards, this profile is permanently prohibited from donating blood.
            </div>
          </div>
        </div>
      )}

      {/* Stat grid 2×2 */}
      <div style={S.statsGrid}>
        <StatCard
          icon={<Droplet size={18} />}
          label="Donations"
          value={loading ? '…' : (donations.length || donor?.donationCount || 0)}
          accent="#D32F2F"
        />
        <StatCard
          icon={<Award size={18} />}
          label="Badge"
          value={badge ? badge.label.split(' ')[0] : 'Standard'}
          accent="#FFA000"
        />
        <StatCard
          icon={<Calendar size={18} />}
          label="Next Eligible"
          value={loading ? '…' : nextEligibleFormatted}
          accent="#007C91"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Units Issued"
          value={loading ? '…' : donations.filter(d => d.availabilityStatus === 'issued').length}
          accent="#2E7D32"
        />
      </div>

      {/* Register CTA — only when no profile */}
      {!loading && !donor && (
        <div style={S.ctaCard}>
          <div style={S.ctaIconWrap}>
            <FileText size={20} color="#007C91" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={S.ctaTitle}>Complete Donor Registration</div>
            <div style={S.ctaSub}>Register your medical details to get verified for donations</div>
          </div>
          <button onClick={() => navigate('/donor/register')} style={S.ctaBtn}>
            Register
          </button>
        </div>
      )}

      {/* Eligibility info — when registered */}
      {!loading && donor && (
        <div
          onClick={() => setShowEligModal(true)}
          style={{
            ...S.infoCard,
            borderColor: eligibility?.eligible && donor.isVerified
              ? 'rgba(46,125,50,0.3)'
              : 'rgba(0,124,145,0.25)',
            background: eligibility?.eligible && donor.isVerified
              ? 'rgba(46,125,50,0.06)'
              : 'rgba(0,124,145,0.05)',
            cursor: 'pointer'
          }}
        >
          <div style={{
            ...S.infoIconWrap,
            background: eligibility?.eligible && donor.isVerified ? 'rgba(46,125,50,0.12)' : 'rgba(0,124,145,0.12)',
            color: eligibility?.eligible && donor.isVerified ? '#2E7D32' : '#007C91',
          }}>
            {eligibility?.eligible && donor.isVerified ? <ShieldCheck size={20} /> : <Clock size={20} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: eligibility?.eligible && donor.isVerified ? '#2E7D32' : '#007C91',
              marginBottom: 2
            }}>
              {eligibility?.eligible && donor.isVerified
                ? 'Eligible to Donate (90-day Protocol Satisfied)'
                : donor.isFlagged
                  ? 'Account Flagged'
                  : !donor.isVerified
                    ? 'Pending Admin Verification'
                    : 'Rest Interval In Progress'}
            </div>
            <div style={{ fontSize: 11, color: '#6C757D', lineHeight: 1.3 }}>
              {eligibility?.reason || 'Tap to view 90-day donation interval analysis'}
            </div>
          </div>
          <ChevronRight size={16} color="#6C757D" />
        </div>
      )}

      {/* Quick Actions */}
      <div style={S.sectionLabel}>Quick Actions</div>
      <div style={S.actionsGrid}>
        {[
          { icon: <User size={20} />,        label: 'My Profile',      color: '#172B4D', cb: () => setTab('profile') },
          { icon: <ShieldCheck size={20} />, label: 'Check 90d Rule',  color: '#007C91', cb: () => setShowEligModal(true) },
          {
            icon: <QrCode size={20} />,
            label: 'Scan Blood Unit',
            color: '#2E7D32',
            cb: () => {
              const target = bloodHistory?.[0]?.unitId || 'BU001';
              navigate(`/verify/${target}`);
            }
          },
          { icon: <AlertCircle size={20} />, label: 'Emergency Help',  color: '#D32F2F', cb: () => setTab('alerts') },
        ].map(a => (
          <button
            key={a.label}
            onClick={a.cb}
            style={{ ...S.actionBtn, borderColor: `${a.color}25` }}
          >
            <div style={{ ...S.actionIconBox, color: a.color, background: `${a.color}10` }}>
              {a.icon}
            </div>
            <span style={{ ...S.actionLabel, color: a.color }}>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /* ── HISTORY ───────────────────────────────────────────────────── */
  /**
   * GUIDE EXPLANATION: Donor Blood Donation History & Lifecycle Organization
   * Question: "How does the donor page track the blood donation lifecycle?"
   * Answer: The history cards present the complete lifecycle of each whole blood unit:
   *   - Blood Flow Stage: Collected -> Lab Tested -> In Storage -> Transfused (Saved a Life)
   *   - Clinical Lab Screening: 5-panel serology test result.
   *   - Storage Vault: Cold chain preservation facility (2-6°C).
   *   - Latest Admin Update: Real-time action notes logged by medical staff.
   *   - Blockchain Proof & QR Verification: Cryptographic tamper-proof auditing.
   */
  const HistoryTab = () => (
    <div style={S.tabContent}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <div>
          <div style={S.sectionLabel}>Donation History</div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
            Cryptographically verified on Ganache EVM
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => fetchHistory(false)}
            disabled={isSyncing}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '4px 9px',
              fontSize: 11,
              fontWeight: 700,
              color: '#0F172A',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            title="Fetch latest updates from admin section"
          >
            <RefreshCw size={12} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isSyncing ? 'Syncing…' : 'Sync Status'}</span>
          </button>

          {donations.length > 0 && (
            <span style={{
              background: '#DCFCE7', color: '#166534',
              fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 100
            }}>
              {donations.length} {donations.length === 1 ? 'Record' : 'Records'}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
          Loading donation records…
        </div>
      ) : donations.length === 0 ? (
        <div style={S.emptyCard}>
          <div style={S.emptyIconWrap}>
            <Droplet size={28} color="#D32F2F" />
          </div>
          <div style={S.emptyTitle}>No donation records yet</div>
          <div style={S.emptySub}>
            Your blood donation records and verification receipts will be logged here securely once you donate at any certified hospital or blood bank.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Summary metrics bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 12
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Donated</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#DC2626', marginTop: 2 }}>
                {donations.length * 450} ml
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>{donations.length} whole blood units</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Lives Impacted</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#059669', marginTop: 2 }}>
                ~{Math.max(donations.filter(d => d.availabilityStatus === 'issued').length * 3, donations.length > 0 ? 1 : 0)} Lives
              </div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Transfusion readiness</div>
            </div>
          </div>

          {/* List of donation unit cards (Previous Design + Organized Info) */}
          {donations.map((item) => {
            const colDate = new Date(item.collectionDate);
            const expDate = new Date(item.expiryDate);
            const isIssued = item.availabilityStatus === 'issued';
            const isAvailable = item.availabilityStatus === 'available';
            const isRequested = item.availabilityStatus === 'requested';
            const isSafe = item.testStatus === 'safe';
            const isRejected = item.testStatus === 'rejected' || item.availabilityStatus === 'rejected';

            // Clean formatted stage label
            const stageLabel = (() => {
              if (isIssued) return 'Stage 4: Transfused (Saved a Life! ❤️)';
              if (isRequested) return 'Stage 4: Allocated to Hospital';
              if (isAvailable && isSafe) return 'Stage 3: Cold Storage (Available)';
              if (isRejected) return 'Stage 2: Screening Rejected';
              if (item.availabilityStatus === 'testing' || item.testStatus === 'pending') return 'Stage 2: Clinical Lab Testing';
              return 'Stage 1: Blood Collected & Bagged';
            })();

            return (
              <div key={item._id || item.unitId} style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '14px 14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                {/* Card Top */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: isIssued ? '#DCFCE7' : '#FEE2E2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isIssued ? <Heart size={17} color="#16A34A" /> : <Droplet size={17} color="#DC2626" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                        #{item.unitId}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {colDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      background: '#DC2626', color: '#FFFFFF',
                      fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6
                    }}>
                      {item.bloodGroup}
                    </span>
                    <span style={{
                      background: isIssued ? '#DCFCE7' : isAvailable ? '#E0F2FE' : '#FEF3C7',
                      color: isIssued ? '#166534' : isAvailable ? '#0369A1' : '#92400E',
                      fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 100, textTransform: 'uppercase'
                    }}>
                      {isIssued ? 'Transfused' : isAvailable ? 'Available' : item.availabilityStatus}
                    </span>
                  </div>
                </div>

                {/* Card Details (Clean Grey Box with Organized Info) */}
                <div style={{
                  background: '#F8FAFC', borderRadius: 8, padding: '10px 12px',
                  fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Lifecycle Flow</span>
                    <span style={{ fontWeight: 700, color: isIssued ? '#16A34A' : '#0F172A' }}>
                      {stageLabel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Clinical Testing</span>
                    <span style={{ fontWeight: 700, color: isSafe ? '#059669' : isRejected ? '#DC2626' : '#D97706' }}>
                      {isSafe ? 'Screened & Safe (5-Panel Passed)' : isRejected ? 'Rejected (Biohazard)' : 'Testing in Progress'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Storage Facility</span>
                    <span style={{ fontWeight: 600, color: '#1E293B' }}>{item.storageLocation || 'Hospital Blood Bank Vault'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Safe Expiry Date</span>
                    <span style={{ color: '#64748B' }}>{expDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {item.latestAction && (
                    <div style={{
                      marginTop: 4,
                      paddingTop: 6,
                      borderTop: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: isIssued ? '#166534' : '#0369A1', fontWeight: 700, fontSize: 10 }}>
                        <Clock size={11} />
                        <span>Latest Update:</span>
                      </div>
                      <div style={{ color: '#1E293B', fontWeight: 600, lineHeight: 1.3 }}>
                        {item.latestAction}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions / Proofs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2, gap: 6, flexWrap: 'wrap' }}>
                  {item.blockchainTxHash ? (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.blockchainTxHash);
                        alert('On-chain Transaction Hash copied to clipboard!\n' + item.blockchainTxHash);
                      }}
                      style={{
                        background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 6,
                        padding: '4px 8px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
                        color: '#0F172A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                      }}
                      title={item.blockchainTxHash}
                    >
                      <ShieldCheck size={12} color="#059669" />
                      <span>Tx: {item.blockchainTxHash.substring(0, 8)}…</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: 10, color: '#94A3B8' }}>Proof Recorded</span>
                  )}

                  <button
                    onClick={() => navigate(`/verify/${item.unitId}`)}
                    style={{
                      background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: 6,
                      padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 'auto'
                    }}
                  >
                    <QrCode size={12} />
                    <span>Verify QR Proof</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ── PROFILE ───────────────────────────────────────────────────── */
  const ProfileTab = () => (
    <div style={S.tabContent}>
      {/* Avatar card */}
      <div style={S.profileHero}>
        <div style={S.avatarRing}>
          <span style={{ color: '#FFFFFF', fontSize: 26, fontWeight: 800 }}>
            {user?.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginTop: 6 }}>{user?.name}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{user?.email}</div>
        {donor && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <span style={S.bloodChip}>{donor.bloodGroup}</span>
            <StatusPill status={donor.eligibilityStatus} />
            {badge && (
              <span style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#FFD700',
                borderRadius: 100,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}>
                <Award size={12} />
                <span>{badge.label}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Register button if no profile */}
      {!loading && !donor && (
        <button onClick={() => navigate('/donor/register')} style={S.primaryBtn}>
          <FileText size={16} />
          <span>Complete Donor Registration</span>
        </button>
      )}

      {/* View full profile */}
      {donor && (
        <button onClick={() => navigate('/donor/profile')} style={S.outlineBtn}>
          <span>View Detailed Profile</span>
          <ChevronRight size={16} />
        </button>
      )}

      {/* 90-Day Protocol Info */}
      {donor && (
        <div style={S.infoSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <ShieldCheck size={16} color="#007C91" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Donation Interval Rule</span>
          </div>
          {[
            { label: 'Standard Interval', value: '90 Days Minimum' },
            { label: 'Last Donation',     value: donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString('en-IN') : 'None (Eligible)' },
            { label: 'Next Eligible Date', value: nextEligibleFormatted },
            { label: 'Protocol Status',   value: eligibility?.eligible ? 'Active & Ready' : 'In Rest Period' },
          ].map(r => (
            <div key={r.label} style={S.infoRow}>
              <span style={S.infoLabel}>{r.label}</span>
              <span style={S.infoValue}>{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sign out */}
      <button onClick={() => { logout(); navigate('/login'); }} style={S.logoutBtn}>
        <LogOut size={16} />
        <span>Sign Out</span>
      </button>
    </div>
  );

  /* ── ALERTS ────────────────────────────────────────────────────── */
  /**
   * GUIDE EXPLANATION: Donor Emergency Alerts Screen
   * Question: "How does the donor interact with notifications sent from the interactive hospital map?"
   * Answer: Urgent messages dispatched by hospitals or admins via the live map are stored in
   * the notifications collection and retrieved here. Donors see the urgent blood group requested,
   * the sender facility details, one-click phone dial action, and read/acknowledge toggles.
   */
  const AlertsTab = () => (
    <div style={S.tabContent}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={S.sectionLabel}>Alerts & Notifications</div>
        {unreadAlertsCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: '#D32F2F',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 4px'
            }}
          >
            <Check size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {donor?.eligibilityStatus === 'pending' && (
        <div style={{ ...S.infoCard, borderColor: 'rgba(255,160,0,0.3)', background: 'rgba(255,160,0,0.05)' }}>
          <div style={S.alertIconWrap}>
            <Clock size={18} color="#FFA000" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E65100', marginBottom: 2 }}>Verification in Progress</div>
            <div style={{ fontSize: 11, color: '#6C757D' }}>Your donor registration has been received and is pending administrator review.</div>
          </div>
        </div>
      )}

      {/* Render notifications list sent from map or system */}
      {notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.map(n => {
            const isUnread = !n.isRead;
            return (
              <div
                key={n._id}
                style={{
                  background: isUnread ? '#FFF8F8' : '#FFFFFF',
                  border: `1.5px solid ${isUnread ? '#FFCDD2' : '#E2E8F0'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Header: Urgency tag, blood group & date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      background: n.urgency === 'critical' ? '#FEE2E2' : '#FEF3C7',
                      color: n.urgency === 'critical' ? '#DC2626' : '#D97706',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}>
                      {n.urgency === 'critical' ? '🚨 Critical Need' : '⚡ Urgent Appeal'}
                    </span>
                    <span style={{
                      background: 'rgba(211,47,47,0.1)',
                      color: '#D32F2F',
                      borderRadius: 6,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 800,
                    }}>
                      Blood: {n.bloodGroup}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#8C9BAE' }}>
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Title & Predefined Message Body */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#172B4D', marginBottom: 4 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#4A5568', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                    {n.message}
                  </div>
                </div>

                {/* Sender details */}
                <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>From: <strong>{n.senderName}</strong></span>
                  <span>•</span>
                  <span style={{ textTransform: 'capitalize' }}>{n.senderRole}</span>
                </div>

                {/* Actions row: Call hospital + Mark read toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, paddingTop: 8, borderTop: '1px solid #EDF2F7' }}>
                  {n.senderPhone ? (
                    <a
                      href={`tel:${n.senderPhone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#D32F2F',
                        color: '#FFFFFF',
                        padding: '7px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <PhoneCall size={14} />
                      <span>Call ({n.senderPhone})</span>
                    </a>
                  ) : <div />}

                  {isUnread ? (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        padding: '6px 11px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Check size={13} color="#10B981" />
                      <span>Mark Read</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Check size={13} color="#10B981" /> Read
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={S.emptyCard}>
          <div style={S.emptyIconWrap}>
            <BellOff size={26} color="#6C757D" />
          </div>
          <div style={S.emptyTitle}>All Caught Up</div>
          <div style={S.emptySub}>Emergency blood requests and donation reminders will appear here in real-time.</div>
        </div>
      )}
    </div>
  );

  const tabMap = { home: HomeTab, history: HistoryTab, profile: ProfileTab, alerts: AlertsTab };
  const ActiveTab = tabMap[tab] || HomeTab;

  /* ── RENDER ────────────────────────────────────────────────────── */
  return (
    <div style={S.shell} data-donor-view="true">
      {/* ── App Header ── */}
      <header style={S.appBar}>
        <img src={logo} alt="RedFlow" style={S.appLogo} />
        <span style={S.appBrand}>
          <span style={{ color: '#D32F2F' }}>Red</span>
          <span style={{ color: '#FFFFFF' }}>Flow</span>
        </span>
        <div style={{ flex: 1 }} />
        <div style={S.appAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
      </header>

      {/* ── Scrollable body ── */}
      <div style={S.body}>
        <ActiveTab />
      </div>

      {/* ── Eligibility Modal ── */}
      {showEligModal && (
        <div style={S.modalOverlay} onClick={() => setShowEligModal(false)}>
          <div style={S.modalCard} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={20} color="#007C91" />
                <span style={{ fontSize: 16, fontWeight: 700, color: '#172B4D' }}>90-Day Donation Interval Rule</span>
              </div>
              <button onClick={() => setShowEligModal(false)} style={S.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{
                background: eligibility?.eligible ? 'rgba(46,125,50,0.08)' : 'rgba(0,124,145,0.08)',
                border: `1.5px solid ${eligibility?.eligible ? '#2E7D32' : '#007C91'}`,
                borderRadius: 12,
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                {eligibility?.eligible ? <CheckCircle2 size={28} color="#2E7D32" /> : <Clock size={28} color="#007C91" />}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: eligibility?.eligible ? '#2E7D32' : '#007C91' }}>
                    {eligibility?.eligible ? 'Fully Eligible to Donate' : 'Waiting Period in Progress'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6C757D', marginTop: 2 }}>
                    {eligibility?.reason || 'Protocol active'}
                  </div>
                </div>
              </div>

              <div style={S.modalInfoBox}>
                <div style={S.modalRow}>
                  <span style={S.modalLabel}>Standard Interval:</span>
                  <span style={S.modalVal}>90 Days (Medical Standard)</span>
                </div>
                <div style={S.modalRow}>
                  <span style={S.modalLabel}>Days Since Last:</span>
                  <span style={S.modalVal}>{eligibility?.daysSinceLastDonation !== null && eligibility?.daysSinceLastDonation !== undefined ? `${eligibility.daysSinceLastDonation} days` : '0 days (First Time)'}</span>
                </div>
                <div style={S.modalRow}>
                  <span style={S.modalLabel}>Next Eligible Date:</span>
                  <span style={S.modalVal}>{nextEligibleFormatted}</span>
                </div>
                <div style={S.modalRow}>
                  <span style={S.modalLabel}>Verification Required:</span>
                  <span style={S.modalVal}>{donor?.isVerified ? 'Verified' : 'Pending Admin'}</span>
                </div>
              </div>

              <button onClick={() => setShowEligModal(false)} style={S.modalActionBtn}>
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Tab Bar ── */}
      <nav style={S.tabBar}>
        {TABS.map(t => {
          const active = tab === t.id;
          const IconComponent = t.Icon;
          const hasUnread = t.id === 'alerts' && unreadAlertsCount > 0;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={S.tabBtn}>
              {active && <div style={S.tabActiveLine} />}
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconComponent
                  size={20}
                  color={active ? '#D32F2F' : '#8C9BAE'}
                  strokeWidth={active ? 2.5 : 2}
                />
                {hasUnread && (
                  <span style={{
                    position: 'absolute',
                    top: -5,
                    right: -10,
                    background: '#D32F2F',
                    color: '#FFFFFF',
                    fontSize: 9,
                    fontWeight: 800,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '1.5px solid #FFFFFF',
                    boxShadow: '0 1px 4px rgba(211,47,47,0.3)',
                  }}>
                    {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? '#D32F2F' : '#8C9BAE'
              }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DonorDashboard;
