import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Droplet,
  ShieldCheck,
  Clock,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Eye,
  LogOut,
  X,
  FileText,
  AlertCircle,
  BarChart3,
  Activity,
  Cpu,
  Zap,
  Database,
  TrendingUp,
  ArrowUpRight,
  Check,
  MapPin,
  Navigation,
  Phone,
  Building2,
  ShieldAlert,
  Thermometer
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import GoogleDonorMap from '../components/GoogleDonorMap';
import logo from '../assets/logo.png';
import adminStyles from '../styles/adminStyles';
import {
  StatusPill,
  CreateHospitalModal,
  VerifyDonorModal,
  CollectUnitModal,
  LabTestModal,
  AllocateUnitModal,
  IssueUnitModal,
  UnitDetailsModal,
  FlagModal
} from '../components/AdminModals';

// ── Metric Stat Card ────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div style={adminStyles.statCard}>
    <div style={{ ...adminStyles.statIconWrap, color, background: `${color}15` }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#172B4D', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#6C757D', marginTop: '4px', fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

// ── Clinical & Administrative Modals (Modularized in ../components/AdminModals.jsx) ──

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mainNav, setMainNav]         = useState('analytics'); // 'analytics' | 'inventory' | 'donors' | 'requests'

  const [donorTab, setDonorTab]       = useState('pending');   // 'pending' | 'verified' | 'flagged'
  const [unitTab, setUnitTab]         = useState('all');       // 'all' | 'available' | 'testing' | 'issued'
  
  const [pending, setPending]         = useState([]);
  const [allDonors, setAllDonors]     = useState([]);
  const [bloodUnits, setBloodUnits]   = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  const [loading, setLoading]         = useState(true);
  const [verifying, setVerifying]     = useState(null);
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [flagTarget, setFlagTarget]   = useState(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [labTestTarget, setLabTestTarget] = useState(null);
  const [allocateTarget, setAllocateTarget] = useState(null);
  const [issueTarget, setIssueTarget] = useState(null);
  const [toast, setToast]             = useState(null);
  const [blockchainSummary, setBlockchainSummary] = useState(null);

  // Global District Deployment Scope State
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('ALL');

  // Nearby Donor Locator State
  const [nearbyPincode, setNearbyPincode] = useState('573201');
  const [nearbyGroup, setNearbyGroup]     = useState('ANY');
  const [nearbyRadius, setNearbyRadius]   = useState(50);
  const [nearbyDonors, setNearbyDonors]   = useState([]);
  const [searchingNearby, setSearchingNearby] = useState(false);

  // Hospital Accounts State
  const [hospitalsList, setHospitalsList] = useState([]);
  const [showCreateHospitalModal, setShowCreateHospitalModal] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  const loadHospitals = useCallback(async () => {
    setLoadingHospitals(true);
    try {
      const res = await api.get('/auth/hospitals');
      setHospitalsList(res.data.hospitals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHospitals(false);
    }
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };


  const searchNearby = useCallback(async (pin = nearbyPincode, group = nearbyGroup, rad = nearbyRadius) => {
    setSearchingNearby(true);
    try {
      const cleanPin = (pin || '').trim();
      const res = await api.post('/donor-search', {
        pincode: cleanPin || undefined,
        bloodGroup: group === 'ANY' ? undefined : group,
        radiusKm: rad
      });
      setNearbyDonors(res.data.donors || []);
    } catch (e) {
      showToast('Nearby search failed', 'error');
    } finally {
      setSearchingNearby(false);
    }
  }, [nearbyPincode, nearbyGroup, nearbyRadius]);


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, allDonorsRes, unitsRes, reqsRes, statsRes, bcRes, hospRes] = await Promise.all([
        api.get('/donors/pending'),
        api.get('/donors'),
        api.get('/blood-units'),
        api.get('/requests').catch(() => ({ data: { requests: [] } })),
        api.get('/dashboard/admin').catch(() => ({ data: null })),
        api.get('/blockchain/summary').catch(() => ({ data: null })),
        api.get('/auth/hospitals').catch(() => ({ data: { hospitals: [] } })),
      ]);
      setPending(pendingRes.data.donors || []);
      setAllDonors(allDonorsRes.data.donors || []);
      setBloodUnits(unitsRes.data.units || []);
      setEmergencyRequests(reqsRes.data.requests || []);
      if (statsRes?.data) setDashboardStats(statsRes.data);
      if (bcRes?.data) setBlockchainSummary(bcRes.data);
      if (hospRes?.data?.hospitals) setHospitalsList(hospRes.data.hospitals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (mainNav === 'nearby') {
      searchNearby();
    }
  }, [mainNav, searchNearby]);

  useEffect(() => {
    if (mainNav === 'hospitals') {
      loadHospitals();
    }
  }, [mainNav, loadHospitals]);



  const handleMatchRequest = async (requestId) => {
    try {
      const res = await api.post(`/requests/${requestId}/match`);
      showToast(res.data.message || 'Allocation match completed.');
      loadData();
    } catch (e) {
      showToast(e.response?.data?.error || 'Matching failed', 'error');
    }
  };

  const handleIssueRequest = async (requestId) => {
    try {
      const res = await api.post(`/requests/${requestId}/issue`);
      showToast(res.data.message || 'Blood units issued to hospital.');
      loadData();
    } catch (e) {
      showToast(e.response?.data?.error || 'Issue failed', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/status`, { status: 'rejected' });
      showToast(`Request #${requestId} rejected.`);
      loadData();
    } catch (e) {
      showToast(e.response?.data?.error || 'Reject failed', 'error');
    }
  };

  const handleVerify = async (donor) => {
    setVerifying(donor.donorId);
    try {
      const res = await api.put(`/donors/${donor.donorId}/verify`);
      showToast(`${donor.name} verified successfully.`);
      loadData();
    } catch (e) {
      showToast(e.response?.data?.error || 'Verify failed', 'error');
    } finally {
      setVerifying(null);
    }
  };

  const handleTestStatus = async (unitId, status) => {
    try {
      await api.put(`/blood-units/${unitId}/test-status`, { status });
      showToast(`Unit #${unitId} marked as ${status.toUpperCase()}.`);
      loadData();
    } catch (e) {
      showToast(e.response?.data?.error || 'Test status update failed', 'error');
    }
  };

  const handleTransition = async (unitId, status) => {
    try {
      await api.put(`/blood-units/${unitId}/availability`, { status });
      showToast(`Unit #${unitId} transitioned to ${status.toUpperCase()}.`);
      loadData();
    } catch (e) {
      showToast(e.response?.data?.error || 'State transition failed', 'error');
    }
  };

  // District Filtered Collections
  const filteredDonors = selectedDistrictFilter === 'ALL'
    ? allDonors
    : allDonors.filter(d => (d.district || 'Hassan').toLowerCase() === selectedDistrictFilter.toLowerCase());

  const filteredPending = selectedDistrictFilter === 'ALL'
    ? pending
    : pending.filter(d => (d.district || 'Hassan').toLowerCase() === selectedDistrictFilter.toLowerCase());

  const filteredHospitals = selectedDistrictFilter === 'ALL'
    ? hospitalsList
    : hospitalsList.filter(h => (h.district || 'Hassan').toLowerCase() === selectedDistrictFilter.toLowerCase());

  // Filtered Donors - STRICT ISOLATION: Flagged donors ONLY appear in flagged tab
  const displayedDonors = donorTab === 'pending'
    ? filteredPending.filter(d => !d.isFlagged)
    : donorTab === 'flagged'
    ? filteredDonors.filter(d => d.isFlagged)
    : filteredDonors.filter(d => d.isVerified && !d.isFlagged);

  // Filtered Blood Units
  const displayedUnits = unitTab === 'all'
    ? bloodUnits
    : bloodUnits.filter(u => u.availabilityStatus === unitTab);

  const verifiedDonors = filteredDonors.filter(d => d.isVerified && !d.isFlagged);


  return (
    <div style={adminStyles.page}>
      {/* Redesigned Executive Sidebar */}
      <aside style={adminStyles.sidebar}>
        {/* Brand & Role Header */}
        <div style={adminStyles.sidebarHeader}>
          <div style={{ ...adminStyles.sidebarBrand, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={logo} alt="SMPS Logo" style={{ width: 30, height: 30, objectFit: 'contain' }} />
            <div>
              <span style={{ color: '#EF4444' }}>SM</span>
              <span style={{ color: '#FFFFFF' }}>PS</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span style={adminStyles.sidebarRole}>ADMIN CONSOLE</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav style={adminStyles.sidebarNav}>
          <div style={adminStyles.navGroupTitle}>MAIN MENU</div>
          <button
            onClick={() => setMainNav('analytics')}
            style={{ ...adminStyles.navBtn, ...(mainNav === 'analytics' ? adminStyles.navBtnActive : {}) }}
          >
            <div style={adminStyles.navIconWrap}><BarChart3 size={17} /></div>
            <span style={{ flex: 1 }}>Overview & KPIs</span>
          </button>

          <div style={{ ...adminStyles.navGroupTitle, marginTop: 14 }}>OPERATIONS & SUPPLY</div>
          <button
            onClick={() => setMainNav('inventory')}
            style={{ ...adminStyles.navBtn, ...(mainNav === 'inventory' ? adminStyles.navBtnActive : {}) }}
          >
            <div style={adminStyles.navIconWrap}><Droplet size={17} /></div>
            <span style={{ flex: 1 }}>Blood Units</span>
            <span style={{ ...adminStyles.navBadge, background: 'rgba(2, 132, 199, 0.18)', color: '#38BDF8' }}>
              {bloodUnits.length}
            </span>
          </button>

          <button
            onClick={() => setMainNav('requests')}
            style={{ ...adminStyles.navBtn, ...(mainNav === 'requests' ? adminStyles.navBtnActive : {}) }}
          >
            <div style={adminStyles.navIconWrap}><AlertCircle size={17} /></div>
            <span style={{ flex: 1 }}>Emergency Demands</span>
            <span style={{
              ...adminStyles.navBadge,
              background: emergencyRequests.some(r => r.urgency === 'critical' && r.status === 'open') ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              color: emergencyRequests.some(r => r.urgency === 'critical' && r.status === 'open') ? '#F87171' : '#E2E8F0',
            }}>
              {emergencyRequests.length}
            </span>
          </button>

          <button
            onClick={() => setMainNav('hospitals')}
            style={{ ...adminStyles.navBtn, ...(mainNav === 'hospitals' ? adminStyles.navBtnActive : {}) }}
          >
            <div style={adminStyles.navIconWrap}><Building2 size={17} /></div>
            <span style={{ flex: 1 }}>Hospital Centers</span>
            <span style={{ ...adminStyles.navBadge, background: 'rgba(16, 185, 129, 0.18)', color: '#34D399' }}>
              {hospitalsList.length}
            </span>
          </button>

          <div style={{ ...adminStyles.navGroupTitle, marginTop: 14 }}>DONOR ECOSYSTEM</div>
          <button
            onClick={() => { setMainNav('donors'); setDonorTab('pending'); }}
            style={{ ...adminStyles.navBtn, ...(mainNav === 'donors' && donorTab === 'pending' ? adminStyles.navBtnActive : {}) }}
          >
            <div style={adminStyles.navIconWrap}><Clock size={17} /></div>
            <span style={{ flex: 1 }}>Pending Review</span>
            {pending.length > 0 && (
              <span style={{ ...adminStyles.navBadge, background: 'rgba(245, 158, 11, 0.25)', color: '#FBBF24' }}>
                {pending.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setMainNav('donors'); setDonorTab('verified'); }}
            style={{ ...adminStyles.navBtn, ...(mainNav === 'donors' && donorTab === 'verified' ? adminStyles.navBtnActive : {}) }}
          >
            <div style={adminStyles.navIconWrap}><ShieldCheck size={17} /></div>
            <span style={{ flex: 1 }}>Verified Donors</span>
            <span style={{ ...adminStyles.navBadge, background: 'rgba(16, 185, 129, 0.18)', color: '#34D399' }}>
              {allDonors.filter(d => d.isVerified && !d.isFlagged).length}
            </span>
          </button>

          <button
            onClick={() => { setMainNav('donors'); setDonorTab('flagged'); }}
            style={{ ...adminStyles.navBtn, ...(mainNav === 'donors' && donorTab === 'flagged' ? adminStyles.navBtnActive : {}) }}
          >
            <div style={adminStyles.navIconWrap}><AlertTriangle size={17} /></div>
            <span style={{ flex: 1 }}>Flagged Accounts</span>
            <span style={{ ...adminStyles.navBadge, background: 'rgba(239, 68, 68, 0.18)', color: '#F87171' }}>
              {allDonors.filter(d => d.isFlagged).length}
            </span>
          </button>

          <button
            onClick={() => setMainNav('nearby')}
            style={{ ...adminStyles.navBtn, ...(mainNav === 'nearby' ? adminStyles.navBtnActive : {}) }}
          >
            <div style={adminStyles.navIconWrap}><MapPin size={17} /></div>
            <span style={{ flex: 1 }}>Nearby Donors (Map)</span>
          </button>

          <div style={{ ...adminStyles.navGroupTitle, marginTop: 14 }}>SECURITY & AUDIT</div>
          <button
            onClick={() => navigate('/admin/blockchain')}
            style={adminStyles.navBtn}
          >
            <div style={adminStyles.navIconWrap}><Cpu size={17} /></div>
            <span style={{ flex: 1 }}>Blockchain Hub</span>
            <span style={{ ...adminStyles.navBadge, background: 'rgba(168, 85, 247, 0.18)', color: '#C084FC' }}>
              Ledger
            </span>
          </button>
        </nav>

        {/* User Card & Logout */}
        <div style={adminStyles.sidebarFooter}>
          <div style={adminStyles.userProfileCard}>
            <div style={adminStyles.userAvatar}>AD</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'SMPS Admin'}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'smps@redflow.com'}
              </div>
            </div>
          </div>
          <button onClick={() => logout()} style={adminStyles.sidebarLogout}>
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={adminStyles.main}>
        {/* Toast Notification */}
        {toast && (
          <div style={{
            ...adminStyles.toast,
            background: toast.type === 'error' ? '#D32F2F' : '#2E7D32',
          }}>{toast.msg}</div>
        )}

        {/* Executive Blockchain Node Telemetry Command Bar */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}>
          {/* Left: Node Info & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            }}>
              <Cpu size={18} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.2px' }}>
                  Ganache EVM Blockchain Ledger
                </span>
                <span style={{
                  background: (blockchainSummary?.isConnected ?? true) ? '#ECFDF5' : '#FEF2F2',
                  color: (blockchainSummary?.isConnected ?? true) ? '#047857' : '#B91C1C',
                  border: `1px solid ${(blockchainSummary?.isConnected ?? true) ? '#A7F3D0' : '#FECACA'}`,
                  borderRadius: 100,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <span style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: (blockchainSummary?.isConnected ?? true) ? '#10B981' : '#EF4444',
                    display: 'inline-block'
                  }} />
                  {blockchainSummary?.isConnected ? 'NODE ACTIVE' : 'NODE OFFLINE'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 11, color: '#64748B', flexWrap: 'wrap' }}>
                <span>RPC: <strong>127.0.0.1:7545</strong></span>
                <span>•</span>
                <span>Chain ID: <strong>{blockchainSummary?.chainId || '1337'}</strong></span>
                <span>•</span>
                <span>Latest Block: <strong style={{ color: '#0284C7' }}>#{blockchainSummary?.latestBlock ?? '1'}</strong></span>
                <span>•</span>
                <span>Smart Contract: <strong style={{ fontFamily: 'monospace', color: '#0F172A' }}>{blockchainSummary?.smartContractAddress ? `${blockchainSummary.smartContractAddress.slice(0, 8)}...${blockchainSummary.smartContractAddress.slice(-6)}` : '0xA990...57BE'}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Clean Unified Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigate('/admin/blockchain')}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(15,23,42,0.15)',
                whiteSpace: 'nowrap',
              }}
            >
              <Zap size={13} color="#38BDF8" />
              <span>Inspect Proofs ({blockchainSummary?.totalTransactions ?? (bloodUnits.length + allDonors.filter(d => d.isVerified).length)})</span>
              <ArrowUpRight size={13} />
            </button>

            <button
              onClick={async () => {
                try {
                  const res = await api.get('/blood-units/refresh-expiry');
                  showToast(`Expiry scan complete. ${res.data.expiredCount} unit(s) expired.`);
                  loadData();
                } catch (e) {
                  showToast('Expiry scan failed', 'error');
                }
              }}
              title="Scan and mark expired blood units"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                whiteSpace: 'nowrap',
              }}
            >
              <Clock size={13} color="#64748B" />
              <span>Scan Expiry</span>
            </button>

            <button
              onClick={loadData}
              title="Refresh live data"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                whiteSpace: 'nowrap',
              }}
            >
              <RefreshCw size={13} color="#64748B" />
              <span>Sync</span>
            </button>
          </div>
        </div>


        {/* Global Stats Row (only on management views, not on analytics view to avoid duplication) */}
        {mainNav !== 'analytics' && (
          <div style={adminStyles.statsRow}>
            <StatCard icon={<Users size={22} />} label="Total Donors" value={allDonors.length} color="#172B4D" />
            <StatCard icon={<Droplet size={22} />} label="Available Units" value={bloodUnits.filter(u => u.availabilityStatus === 'available').length} color="#007C91" />
            <StatCard icon={<Clock size={22} />} label="Pending Verification" value={pending.length} color="#FFA000" />
            <StatCard icon={<CheckCircle2 size={22} />} label="Units Issued" value={bloodUnits.filter(u => u.availabilityStatus === 'issued').length} color="#2E7D32" />
          </div>
        )}

        {/* ── ANALYTICS & KPIS OVERVIEW (MODULE 12) ── */}
        {mainNav === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 4 Hero KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {/* Card 1: Registered Donors */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10,
                padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                    REGISTERED DONORS
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} color="#0284C7" />
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', marginTop: 2 }}>
                  {dashboardStats?.totalDonors ?? allDonors.length}
                </div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <span>{dashboardStats?.verifiedDonors ?? allDonors.filter(d => d.isVerified && !d.isFlagged).length} Verified</span>
                  <span style={{ color: '#94A3B8' }}>·</span>
                  <span style={{ color: '#D97706' }}>{pending.filter(d => !d.isFlagged).length} Pending</span>
                  {(dashboardStats?.flaggedDonors > 0 || allDonors.some(d => d.isFlagged)) && (
                    <>
                      <span style={{ color: '#94A3B8' }}>·</span>
                      <span style={{ color: '#DC2626' }}>{dashboardStats?.flaggedDonors ?? allDonors.filter(d => d.isFlagged).length} Banned</span>
                    </>
                  )}
                </div>
              </div>

              {/* Card 2: Safe Blood Reserves */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10,
                padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                    AVAILABLE BLOOD UNITS
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Droplet size={16} color="#059669" />
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#059669', marginTop: 2 }}>
                  {dashboardStats?.availableUnits?.total ?? bloodUnits.filter(u => u.availabilityStatus === 'available').length}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  Screened & Tested Safe for Transfusion
                </div>
              </div>

              {/* Card 3: Emergency Demands */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10,
                padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                    EMERGENCY REQUISITIONS
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={16} color="#DC2626" />
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', marginTop: 2 }}>
                  {emergencyRequests.length}
                </div>
                <div style={{ fontSize: 12, color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{emergencyRequests.filter(r => r.status === 'issued').length} Dispatched</span>
                  <span style={{ color: '#94A3B8' }}>·</span>
                  <span style={{ color: '#DC2626' }}>{emergencyRequests.filter(r => r.urgency === 'critical').length} Critical</span>
                </div>
              </div>

              {/* Card 4: Blockchain Ledger Receipts */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10,
                padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.5px' }}>
                    ON-CHAIN AUDIT PROOFS
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={16} color="#7C3AED" />
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#7C3AED', marginTop: 2 }}>
                  {dashboardStats?.recentTransactions?.length ?? 8}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                  Cryptographically Anchored on Ganache
                </div>
              </div>
            </div>

            {/* 2-Column Analytics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16 }}>
              {/* Left Column: Blood Vault Reserves by Group */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Droplet size={16} color="#DC2626" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Blood Vault Inventory by Group</span>
                  </div>
                  <button
                    onClick={() => setMainNav('inventory')}
                    style={{
                      background: 'transparent', border: 'none', color: '#0284C7',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <span>Manage Inventory</span>
                    <ArrowUpRight size={12} />
                  </button>
                </div>
                <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => {
                    const count = dashboardStats?.availableUnits?.byGroup?.[bg] ?? bloodUnits.filter(u => u.bloodGroup === bg && u.availabilityStatus === 'available').length;
                    const isAdequate = count >= 3;
                    const isLow = count > 0 && count < 3;
                    return (
                      <div key={bg} style={{
                        background: count > 0 ? '#FFFFFF' : '#F8FAFC',
                        border: `1px solid ${count > 0 ? '#CBD5E1' : '#E2E8F0'}`,
                        borderRadius: 8, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 6,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#DC2626' }}>{bg}</span>
                          <span style={{
                            background: isAdequate ? '#ECFDF5' : isLow ? '#FEF3C7' : '#F1F5F9',
                            color: isAdequate ? '#047857' : isLow ? '#B45309' : '#94A3B8',
                            fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 5px', textTransform: 'uppercase',
                          }}>
                            {isAdequate ? 'Ready' : isLow ? 'Low' : 'Empty'}
                          </span>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#0F172A' }}>{count}</div>
                        <div style={{ width: '100%', height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(count * 25, 100)}%`,
                            height: '100%',
                            background: isAdequate ? '#059669' : isLow ? '#D97706' : '#CBD5E1',
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Registered Hospital Network & Facilities */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)', padding: '16px 18px',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={16} color="#0284C7" />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                        Registered Hospital Network
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        {hospitalsList.length} Authorized Healthcare Centers
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setShowCreateHospitalModal(true)}
                      style={{
                        background: '#0284C7', color: '#FFFFFF', border: 'none',
                        borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                      }}
                    >
                      <Plus size={13} />
                      <span>Provision</span>
                    </button>

                    <button
                      onClick={() => setMainNav('hospitals')}
                      style={{
                        background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155',
                        borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                      }}
                    >
                      <span>View All</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Hospital List Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
                  {hospitalsList.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1' }}>
                      <Building2 size={24} color="#94A3B8" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>No Hospital Accounts Configured</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Click 'Provision' to add your first authorized partner center.</div>
                    </div>
                  ) : (
                    hospitalsList.slice(0, 4).map(h => {
                      const hReqs = emergencyRequests.filter(r => (r.hospitalName || '').toLowerCase().includes((h.name || '').toLowerCase()));
                      const activeReqs = hReqs.filter(r => r.status === 'open' || r.status === 'matched');
                      return (
                        <div
                          key={h._id}
                          style={{
                            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8,
                            padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{h.name}</div>
                              <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                                <MapPin size={11} color="#64748B" />
                                <span>{h.district || 'Hassan'}, {h.state || 'Karnataka'} - {h.pincode || '573201'}</span>
                              </div>
                            </div>

                            <span style={{
                              background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0',
                              borderRadius: 100, padding: '2px 8px', fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                              whiteSpace: 'nowrap'
                            }}>
                              AUTHORIZED
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4, borderTop: '1px dashed #E2E8F0', fontSize: 11 }}>
                            <div style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Phone size={11} color="#0284C7" />
                              <span>{h.phone || h.email}</span>
                            </div>

                            <div style={{ fontWeight: 700, color: activeReqs.length > 0 ? '#DC2626' : '#059669' }}>
                              {activeReqs.length > 0 ? `${activeReqs.length} Active Urgent Demand` : 'All Demands Cleared'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ── INVENTORY VIEW (MODULE 4) ── */}
        {mainNav === 'inventory' && (
          <>
            <div style={adminStyles.sectionHeader}>
              <div>
                <h2 style={adminStyles.sectionTitle}>Blood Inventory Management</h2>
                <p style={{ fontSize: 13, color: '#6C757D', margin: '2px 0 0' }}>
                  Track units, manage state machine transitions, and record lab tests.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowCollectModal(true)} style={adminStyles.collectBtn}>
                  <Plus size={16} />
                  <span>Collect Blood Unit</span>
                </button>
                <button onClick={loadData} style={adminStyles.refreshBtn}>
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div style={adminStyles.filterTabs}>
              {[
                { id: 'all',       label: 'All Units' },
                { id: 'collected', label: 'Collected (Pending Test)' },
                { id: 'available', label: 'Available for Transfusion' },
                { id: 'issued',    label: 'Issued' },
                { id: 'expired',   label: 'Expired' },
                { id: 'rejected',  label: 'Rejected' },
              ].map(ft => (
                <button
                  key={ft.id}
                  onClick={() => setUnitTab(ft.id)}
                  style={{
                    ...adminStyles.filterTabBtn,
                    ...(unitTab === ft.id ? adminStyles.filterTabBtnActive : {}),
                  }}
                >
                  {ft.label}
                </button>
              ))}
            </div>

            {/* Units Table */}
            <div style={adminStyles.tableCard}>
              <table style={adminStyles.table}>
                <thead>
                  <tr style={adminStyles.tableHeadRow}>
                    <th style={adminStyles.th}>Unit ID</th>
                    <th style={adminStyles.th}>Blood Group</th>
                    <th style={adminStyles.th}>Donor</th>
                    <th style={adminStyles.th}>Storage Facility</th>
                    <th style={adminStyles.th}>Collection Date</th>
                    <th style={adminStyles.th}>Expiry Date</th>
                    <th style={adminStyles.th}>Lab Screening</th>
                    <th style={adminStyles.th}>Supply Status</th>
                    <th style={adminStyles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#6C757D' }}>Loading units…</td></tr>
                  ) : displayedUnits.length === 0 ? (
                    <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#6C757D' }}>No blood units found in this category.</td></tr>
                  ) : (
                    displayedUnits.map(u => (
                      <tr key={u._id} style={adminStyles.tableRow}>
                        <td style={{ ...adminStyles.td, fontWeight: 700, fontFamily: 'monospace' }}>#{u.unitId}</td>
                        <td style={adminStyles.td}><span style={adminStyles.bloodGroupBadge}>{u.bloodGroup}</span></td>
                        <td style={adminStyles.td}>{u.donorId}</td>
                        <td style={adminStyles.td}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#007C91', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Thermometer size={12} color="#007C91" />
                            {u.storageLocation ? u.storageLocation.replace(/\s*\(\+4°?C\)/gi, '') : 'Cold Storage Vault 1'}
                          </span>
                        </td>
                        <td style={adminStyles.td}>{new Date(u.collectionDate).toLocaleDateString('en-IN')}</td>
                        <td style={adminStyles.td}>{new Date(u.expiryDate).toLocaleDateString('en-IN')}</td>
                        <td style={adminStyles.td}>
                          {u.testStatus === 'pending' ? (
                            <button
                              onClick={() => setLabTestTarget(u)}
                              style={{
                                background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534',
                                borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                              }}
                              title="Perform Laboratory Pathogen Screening"
                            >
                              <Activity size={12} />
                              <span>Screening</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, fontWeight: 800, color: u.testStatus === 'safe' ? '#16A34A' : '#DC2626' }}>
                              {u.testStatus === 'safe' ? 'SAFE' : 'REJECTED'}
                            </span>
                          )}
                        </td>
                        <td style={adminStyles.td}>
                          <StatusPill status={u.availabilityStatus} type="unit" />
                        </td>
                        <td style={adminStyles.td}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {/* If collected & pending test */}
                            {u.testStatus === 'pending' && (
                              <button
                                onClick={() => setLabTestTarget(u)}
                                style={adminStyles.actionBtn}
                                title="Perform Lab Screening"
                              >
                                Lab Test
                              </button>
                            )}

                            {/* If available in cold storage, allow matching & allocating */}
                            {u.availabilityStatus === 'available' && (
                              <button
                                onClick={() => setAllocateTarget(u)}
                                style={adminStyles.allocateBtn}
                                title="Match & Allocate to Emergency Request"
                              >
                                Allocate
                              </button>
                            )}

                            {/* If requested (allocated), allow issuing for transfusion */}
                            {u.availabilityStatus === 'requested' && (
                              <button
                                onClick={() => setIssueTarget(u)}
                                style={adminStyles.issueBtn}
                                title="Issue Unit for Patient Transfusion"
                              >
                                Issue Unit
                              </button>
                            )}

                            {/* If issued */}
                            {u.availabilityStatus === 'issued' && (
                              <span style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: '#6A1B9A',
                                background: 'rgba(106,27,154,0.12)',
                                padding: '4px 8px',
                                borderRadius: 100,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                flexShrink: 0
                              }}>
                                Transfused
                              </span>
                            )}

                            {/* View details & QR */}
                            <button onClick={() => setSelectedUnit(u)} style={adminStyles.iconBtn} title="View QR & Traceability">
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── NEARBY DONORS LOCATOR (GOOGLE MAPS) ── */}
        {mainNav === 'nearby' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Control Bar */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={20} color="#0284C7" />
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Geospatial Nearby Donor Locator (Google Maps)
                  </h2>
                </div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                  Locate verified donors filtered dynamically by exact pincode and radius.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {/* Pincode Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8, padding: '4px 10px' }}>
                  <MapPin size={14} color="#64748B" />
                  <input
                    type="text"
                    value={nearbyPincode}
                    onChange={(e) => setNearbyPincode(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, fontWeight: 700, width: 140, color: '#0F172A' }}
                  />
                </div>

                {/* Blood Group Select */}
                <select
                  value={nearbyGroup}
                  onChange={(e) => setNearbyGroup(e.target.value)}
                  style={{
                    background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8,
                    padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#0F172A', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="ANY">All Blood Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>

                {/* Radius Select */}
                <select
                  value={nearbyRadius}
                  onChange={(e) => setNearbyRadius(Number(e.target.value))}
                  style={{
                    background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: 8,
                    padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#0F172A', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value={10}>10 km Radius</option>
                  <option value={25}>25 km Radius</option>
                  <option value={50}>50 km Radius</option>
                  <option value={100}>100 km Radius</option>
                  <option value={500}>State-Wide (500 km)</option>
                </select>

                <button
                  onClick={() => searchNearby(nearbyPincode, nearbyGroup, nearbyRadius)}
                  style={adminStyles.refreshBtn}
                >
                  {searchingNearby ? <RefreshCw size={13} className="spin" /> : <Navigation size={13} />}
                  <span>Search Donors</span>
                </button>

                {/* Quick Pincodes for Fast Admin Lookup */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', width: '100%', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #E2E8F0' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Quick Pincodes:</span>
                  {[
                    { pin: '573201', name: 'Hassan' },
                    { pin: '560001', name: 'Bengaluru' },
                    { pin: '570001', name: 'Mysuru' },
                    { pin: '575001', name: 'Mangaluru' },
                    { pin: '580001', name: 'Hubli' },
                    { pin: '577201', name: 'Shivamogga' }
                  ].map(q => (
                    <button
                      key={q.pin}
                      type="button"
                      onClick={() => {
                        setNearbyPincode(q.pin);
                        searchNearby(q.pin, nearbyGroup, nearbyRadius);
                      }}
                      style={{
                        background: nearbyPincode === q.pin ? '#0284C7' : '#F8FAFC',
                        color: nearbyPincode === q.pin ? '#FFFFFF' : '#334155',
                        border: '1px solid ' + (nearbyPincode === q.pin ? '#0284C7' : '#CBD5E1'),
                        borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {q.name} ({q.pin})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2-Column Split: Left = Google Map, Right = Donor List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
              {/* Left Column: Interactive Map */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
                padding: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Navigation size={15} color="#0284C7" />
                    <span>Interactive Map {nearbyPincode ? `· Target Pincode: ${nearbyPincode}` : '· Registered Locations'}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                    {nearbyDonors.length} Donor(s) Found
                  </span>
                </div>

                <div style={{ height: 480, borderRadius: 10, overflow: 'hidden' }}>
                  <GoogleDonorMap
                    donors={nearbyDonors}
                    centerPin={nearbyPincode}
                    originLabel={nearbyPincode ? `Admin Search Origin (${nearbyPincode})` : 'Search Origin'}
                    height="100%"
                    radiusKm={nearbyRadius}
                  />
                </div>
              </div>

              {/* Right Column: Donor List */}
              <div style={{
                background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Matched Donors List</div>
                  <span style={{ fontSize: 11, color: '#64748B' }}>Sorted by Proximity</span>
                </div>

                <div style={{ padding: 12, overflowY: 'auto', maxHeight: 470, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {searchingNearby ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#64748B' }}>Searching nearby donors…</div>
                  ) : nearbyDonors.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'center', color: '#64748B' }}>No donors found near pincode <strong>{nearbyPincode}</strong>. Try increasing the radius or choosing another pincode.</div>
                  ) : (
                    nearbyDonors.map(donor => (
                      <div
                        key={donor.donorId}
                        style={{
                          background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10,
                          padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{donor.name}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', color: '#64748B' }}>#{donor.donorId}</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>Pincode: <strong>{donor.pincode}</strong></span>
                              {donor.city && <span>· {donor.city}</span>}
                            </div>
                          </div>

                          <span style={{
                            background: donor.bloodGroup?.includes('-') ? '#B71C1C' : '#DC2626',
                            color: '#FFFFFF', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800
                          }}>
                            {donor.bloodGroup}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, pt: 4, borderTop: '1px dashed #E2E8F0' }}>
                          <span style={{
                            background: donor.matchType === 'exact_pincode' ? '#ECFDF5' : '#F0F9FF',
                            color: donor.matchType === 'exact_pincode' ? '#047857' : '#0284C7',
                            fontSize: 10, fontWeight: 800, borderRadius: 4, padding: '2px 6px'
                          }}>
                            {donor.distanceKm !== undefined ? `${donor.distanceKm} km` : 'Near'} ({donor.matchType === 'exact_pincode' ? 'Exact Pincode' : 'Regional'})
                          </span>

                          {donor.phone && (
                            <a
                              href={`tel:${donor.phone}`}
                              style={{
                                background: '#0F172A', color: '#FFFFFF', borderRadius: 6,
                                padding: '4px 10px', fontSize: 11, fontWeight: 700, textDecoration: 'none',
                                display: 'flex', alignItems: 'center', gap: 4
                              }}
                            >
                              <Phone size={12} />
                              <span>{donor.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DONORS VIEW (MODULE 2) ── */}
        {mainNav === 'donors' && (
          <>
            <div style={adminStyles.sectionHeader}>
              <div>
                <h2 style={adminStyles.sectionTitle}>
                  {donorTab === 'pending' ? 'Donors Pending Verification' : donorTab === 'verified' ? 'Verified Donors Directory' : 'Flagged & Disqualified Donors'}
                </h2>
                <p style={{ fontSize: 13, color: '#6C757D', margin: '2px 0 0' }}>
                  {donorTab === 'flagged'
                    ? 'Strict Policy: Flagged accounts are permanently banned from blood donation with immutable on-chain audit hashes.'
                    : 'Review donor records, verify identities on blockchain, and manage active supply readiness.'}
                </p>
              </div>
              <button onClick={loadData} style={adminStyles.refreshBtn}>
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Sub Tabs: Verified | Pending | Flagged */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setDonorTab('verified')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: donorTab === 'verified' ? '#0F172A' : '#FFFFFF',
                  color: donorTab === 'verified' ? '#FFFFFF' : '#475569',
                  border: '1px solid ' + (donorTab === 'verified' ? '#0F172A' : '#CBD5E1'),
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: donorTab === 'verified' ? '0 2px 6px rgba(15,23,42,0.15)' : 'none',
                }}
              >
                <ShieldCheck size={14} color={donorTab === 'verified' ? '#38BDF8' : '#10B981'} />
                <span>Verified Donors ({allDonors.filter(d => d.isVerified && !d.isFlagged).length})</span>
              </button>

              <button
                onClick={() => setDonorTab('pending')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: donorTab === 'pending' ? '#0F172A' : '#FFFFFF',
                  color: donorTab === 'pending' ? '#FFFFFF' : '#475569',
                  border: '1px solid ' + (donorTab === 'pending' ? '#0F172A' : '#CBD5E1'),
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: donorTab === 'pending' ? '0 2px 6px rgba(15,23,42,0.15)' : 'none',
                }}
              >
                <Clock size={14} color={donorTab === 'pending' ? '#38BDF8' : '#F59E0B'} />
                <span>Pending Review ({pending.filter(d => !d.isFlagged).length})</span>
              </button>

              <button
                onClick={() => setDonorTab('flagged')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: donorTab === 'flagged' ? '#DC2626' : '#FFFFFF',
                  color: donorTab === 'flagged' ? '#FFFFFF' : '#DC2626',
                  border: '1px solid ' + (donorTab === 'flagged' ? '#DC2626' : '#FECDD3'),
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: donorTab === 'flagged' ? '0 2px 6px rgba(220,38,38,0.2)' : 'none',
                }}
              >
                <AlertTriangle size={14} color={donorTab === 'flagged' ? '#FFFFFF' : '#DC2626'} />
                <span>Flagged & Banned Accounts ({allDonors.filter(d => d.isFlagged).length})</span>
              </button>
            </div>

            {donorTab === 'flagged' && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECDD3',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12,
                color: '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                fontWeight: 600
              }}>
                <ShieldAlert size={16} color="#DC2626" />
                <span>Strict Medical & Integrity Policy: Flagged donors are permanently disqualified from blood donation and excluded from all search queries.</span>
              </div>
            )}

            <div style={adminStyles.tableCard}>
              <table style={adminStyles.table}>
                <thead>
                  <tr style={adminStyles.tableHeadRow}>
                    <th style={adminStyles.th}>Donor ID</th>
                    <th style={adminStyles.th}>Name</th>
                    <th style={adminStyles.th}>Blood Group</th>
                    <th style={adminStyles.th}>Age/Gender</th>
                    <th style={adminStyles.th}>Location</th>
                    {donorTab === 'flagged' && <th style={adminStyles.th}>Flag Reason</th>}
                    {donorTab === 'flagged' && <th style={adminStyles.th}>Blockchain Proof</th>}
                    <th style={adminStyles.th}>Status / Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={donorTab === 'flagged' ? 8 : 6} style={{ padding: 24, textAlign: 'center', color: '#6C757D' }}>Loading donors…</td></tr>
                  ) : displayedDonors.length === 0 ? (
                    <tr><td colSpan={donorTab === 'flagged' ? 8 : 6} style={{ padding: 32, textAlign: 'center', color: '#6C757D' }}>No donor records in this category.</td></tr>
                  ) : (
                    displayedDonors.map(d => (
                      <tr key={d._id} style={adminStyles.tableRow}>
                        <td style={{ ...adminStyles.td, fontWeight: 700, fontFamily: 'monospace' }}>#{d.donorId}</td>
                        <td style={adminStyles.td}>
                          <div style={{ fontWeight: 600, color: '#172B4D' }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: '#6C757D' }}>{d.email}</div>
                        </td>
                        <td style={adminStyles.td}><span style={adminStyles.bloodGroupBadge}>{d.bloodGroup}</span></td>
                        <td style={adminStyles.td}>{d.age} yrs / {d.gender}</td>
                        <td style={adminStyles.td}>{d.city || d.district} ({d.pincode})</td>
                        
                        {donorTab === 'flagged' && (
                          <td style={{ ...adminStyles.td, maxWidth: 220 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '4px 8px', borderRadius: 6, border: '1px solid #FECDD3' }}>
                              {d.flagReason || 'Medical / Identity Disqualification'}
                            </div>
                          </td>
                        )}

                        {donorTab === 'flagged' && (
                          <td style={adminStyles.td}>
                            {d.blockchainTxHash ? (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(d.blockchainTxHash);
                                  showToast('On-chain Flag Tx Hash copied!');
                                }}
                                title={d.blockchainTxHash}
                                style={{
                                  background: '#F8FAFC',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: 5,
                                  padding: '4px 8px',
                                  fontSize: 11,
                                  fontFamily: 'monospace',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  color: '#0F172A',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                              >
                                <span>Tx: {d.blockchainTxHash.substring(0, 8)}…</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: 11, color: '#94A3B8' }}>Pending Confirmation</span>
                            )}
                          </td>
                        )}

                        <td style={adminStyles.td}>
                          {d.isFlagged ? (
                            <span style={{
                              background: '#FEF2F2',
                              border: '1px solid #FECDD3',
                              color: '#DC2626',
                              borderRadius: 6,
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5
                            }}>
                              <ShieldAlert size={13} color="#DC2626" />
                              <span>Permanently Banned</span>
                            </span>
                          ) : (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <StatusPill status={d.eligibilityStatus} type="donor" />
                              {!d.isVerified && (
                                <button
                                  onClick={() => setVerifyTarget(d)}
                                  disabled={verifying === d.donorId}
                                  style={adminStyles.verifyBtn}
                                  title="Review donor details and verify on-chain"
                                >
                                  {verifying === d.donorId ? '…' : 'Verify'}
                                </button>
                              )}
                              <button onClick={() => setFlagTarget(d)} style={adminStyles.flagBtn}>Flag</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── EMERGENCY REQUESTS VIEW (MODULE 9) ── */}
        {mainNav === 'requests' && (
          <>
            <div style={adminStyles.sectionHeader}>
              <div>
                <h2 style={adminStyles.sectionTitle}>Hospital Emergency Requests</h2>
                <p style={{ fontSize: 13, color: '#6C757D', margin: '2px 0 0' }}>
                  Allocate inventory, match nearby ready donors, and issue on-chain blood transfusions.
                </p>
              </div>
              <button onClick={loadData} style={adminStyles.refreshBtn}>
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>

            <div style={adminStyles.tableCard}>
              <table style={adminStyles.table}>
                <thead>
                  <tr style={adminStyles.tableHeadRow}>
                    <th style={adminStyles.th}>Req ID</th>
                    <th style={adminStyles.th}>Hospital / Contact</th>
                    <th style={adminStyles.th}>Group Needed</th>
                    <th style={adminStyles.th}>Pincode</th>
                    <th style={adminStyles.th}>Urgency</th>
                    <th style={adminStyles.th}>Status</th>
                    <th style={adminStyles.th}>Allocated Units</th>
                    <th style={adminStyles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#6C757D' }}>Loading requests…</td></tr>
                  ) : emergencyRequests.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#6C757D' }}>No emergency requests recorded.</td></tr>
                  ) : (
                    emergencyRequests.map(r => (
                      <tr key={r._id} style={adminStyles.tableRow}>
                        <td style={{ ...adminStyles.td, fontWeight: 700, fontFamily: 'monospace' }}>#{r.requestId}</td>
                        <td style={adminStyles.td}>
                          <div style={{ fontWeight: 700, color: '#172B4D' }}>{r.hospitalName}</div>
                          <div style={{ fontSize: 11, color: '#6C757D' }}>{r.contactNumber}</div>
                        </td>
                        <td style={adminStyles.td}>
                          <span style={adminStyles.bloodGroupBadge}>{r.bloodGroup}</span>
                          <span style={{ fontSize: 12, color: '#6C757D', marginLeft: 4 }}>({r.unitsRequired} Units)</span>
                        </td>
                        <td style={adminStyles.td}>{r.pincode}</td>
                        <td style={adminStyles.td}>
                          <span style={{
                            background: r.urgency === 'critical' ? 'rgba(211,47,47,0.15)' : r.urgency === 'urgent' ? 'rgba(255,160,0,0.15)' : 'rgba(0,124,145,0.15)',
                            color: r.urgency === 'critical' ? '#D32F2F' : r.urgency === 'urgent' ? '#E65100' : '#007C91',
                            borderRadius: 100, padding: '3px 8px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                          }}>
                            {r.urgency}
                          </span>
                        </td>
                        <td style={adminStyles.td}>
                          <StatusPill status={r.status} type="unit" />
                        </td>
                        <td style={adminStyles.td}>
                          {r.allocatedUnits && r.allocatedUnits.length > 0 ? (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {r.allocatedUnits.map(uid => (
                                <span key={uid} style={{ background: '#2E7D32', color: '#FFF', borderRadius: 4, padding: '2px 6px', fontSize: 11, fontFamily: 'monospace' }}>
                                  #{uid}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#6C757D' }}>None allocated</span>
                          )}
                        </td>
                        <td style={adminStyles.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {r.status === 'open' && (
                              <button onClick={() => handleMatchRequest(r.requestId)} style={adminStyles.verifyBtn}>
                                Match & Allocate
                              </button>
                            )}
                            {r.status === 'matched' && r.allocatedUnits?.length > 0 && (
                              <button onClick={() => handleIssueRequest(r.requestId)} style={adminStyles.issueBtn}>
                                Dispatch & Issue
                              </button>
                            )}
                            {['open', 'matched'].includes(r.status) && (
                              <button onClick={() => handleRejectRequest(r.requestId)} style={adminStyles.flagBtn}>
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── HOSPITAL ACCOUNTS VIEW ── */}
        {mainNav === 'hospitals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Header */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
              padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={20} color="#0284C7" />
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Hospital Authorization & Account Management
                  </h2>
                </div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                  Provision verified hospital accounts to allow medical staff to issue emergency requisitions.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowCreateHospitalModal(true)}
                  style={{
                    background: '#0F172A', color: '#FFFFFF', border: 'none',
                    borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Plus size={15} />
                  <span>Create Hospital Account</span>
                </button>
                <button onClick={loadHospitals} style={adminStyles.refreshBtn}>
                  <RefreshCw size={13} />
                  <span>Sync Accounts</span>
                </button>
              </div>
            </div>

            {/* Hospital Accounts Table */}
            <div style={adminStyles.tableCard}>
              <table style={adminStyles.table}>
                <thead>
                  <tr style={adminStyles.tableHeadRow}>
                    <th style={adminStyles.th}>Hospital Facility</th>
                    <th style={adminStyles.th}>District & Pincode</th>
                    <th style={adminStyles.th}>Contact & Email</th>
                    <th style={adminStyles.th}>Address</th>
                    <th style={adminStyles.th}>Provisioned Date</th>
                    <th style={adminStyles.th}>Access Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingHospitals ? (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#6C757D' }}>Loading hospital accounts…</td></tr>
                  ) : filteredHospitals.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#6C757D' }}>
                        No registered hospital accounts found for <strong>{selectedDistrictFilter === 'ALL' ? 'any district' : selectedDistrictFilter}</strong>. Click <strong>"Create Hospital Account"</strong> to provision an account.
                      </td>
                    </tr>
                  ) : (
                    filteredHospitals.map(h => (
                      <tr key={h._id} style={adminStyles.tableRow}>
                        <td style={{ ...adminStyles.td, fontWeight: 800, color: '#0F172A' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Building2 size={16} color="#0284C7" />
                            <span>{h.name}</span>
                          </div>
                        </td>
                        <td style={adminStyles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{
                              background: '#F1F5F9', color: '#0F172A', borderRadius: 4,
                              padding: '2px 6px', fontSize: 11, fontWeight: 800, width: 'fit-content'
                            }}>
                              {h.district || 'Hassan'}
                            </span>
                            <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
                              PIN: {h.pincode || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td style={adminStyles.td}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontFamily: 'monospace', color: '#334155', fontWeight: 600, fontSize: 12 }}>
                              {h.email}
                            </span>
                            {h.phone && (
                              <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>
                                Tel: {h.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...adminStyles.td, fontSize: 12, color: '#475569', maxWidth: 180 }}>
                          {h.address || 'Local Zone'}, {h.state || 'Karnataka'}
                        </td>
                        <td style={{ ...adminStyles.td, fontSize: 12, color: '#64748B' }}>
                          {new Date(h.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={adminStyles.td}>
                          <span style={{
                            background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0',
                            borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 800
                          }}>
                            AUTHORIZED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>

      {/* Create Hospital Modal */}
      {showCreateHospitalModal && (
        <CreateHospitalModal
          onClose={() => setShowCreateHospitalModal(false)}
          onDone={(data) => {
            setShowCreateHospitalModal(false);
            loadHospitals();
            showToast(`Hospital account '${data.hospital.name}' created successfully!`);
          }}
          onError={(err) => showToast(err, 'error')}
        />
      )}

      {/* Collect Unit Modal */}
      {showCollectModal && (
        <CollectUnitModal
          verifiedDonors={verifiedDonors}
          onClose={() => setShowCollectModal(false)}
          onDone={(data) => {
            setShowCollectModal(false);
            loadData();
            showToast(`Blood Unit #${data.unit.unitId} created with verified QR!`);
          }}
          onError={(err) => showToast(err, 'error')}
        />
      )}


      {/* QR & Timeline Modal */}
      {selectedUnit && (
        <UnitDetailsModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      )}

      {/* Clinical Lab Screening Modal */}
      {labTestTarget && (
        <LabTestModal
          unit={labTestTarget}
          onClose={() => setLabTestTarget(null)}
          onDone={(status, data) => {
            setLabTestTarget(null);
            loadData();
            showToast(`Blood Unit #${data?.unit?.unitId || labTestTarget.unitId} marked ${status.toUpperCase()} and updated on-chain!`);
          }}
          onError={(err) => showToast(err, 'error')}
        />
      )}

      {/* Match & Allocate Modal */}
      {allocateTarget && (
        <AllocateUnitModal
          unit={allocateTarget}
          requests={emergencyRequests}
          onClose={() => setAllocateTarget(null)}
          onDone={(unitId, hospitalName) => {
            setAllocateTarget(null);
            loadData();
            showToast(`Blood Unit #${unitId} allocated from Cold Storage to ${hospitalName}!`);
          }}
          onError={(err) => showToast(err, 'error')}
        />
      )}

      {/* Issue Transfusion Modal */}
      {issueTarget && (
        <IssueUnitModal
          unit={issueTarget}
          onClose={() => setIssueTarget(null)}
          onDone={(unitId) => {
            setIssueTarget(null);
            loadData();
            showToast(`Blood Unit #${unitId} successfully transfused and recorded on-chain!`);
          }}
          onError={(err) => showToast(err, 'error')}
        />
      )}

      {/* Flag Modal */}
      {flagTarget && (
        <FlagModal
          donor={flagTarget}
          onClose={() => setFlagTarget(null)}
          onDone={() => { setFlagTarget(null); setDonorTab('flagged'); loadData(); showToast('Donor permanently flagged & banned on blockchain.'); }}
        />
      )}

      {/* Verify Donor Preview Modal */}
      {verifyTarget && (
        <VerifyDonorModal
          donor={verifyTarget}
          onClose={() => setVerifyTarget(null)}
          onVerify={async (d) => {
            await handleVerify(d);
            setVerifyTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
