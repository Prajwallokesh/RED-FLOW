import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle, Plus, Search, Clock, CheckCircle2, Phone, MapPin,
  RefreshCw, Droplet, Users, X, Building2, Activity,
  Zap, TrendingUp, Navigation, Filter, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import 'leaflet/dist/leaflet.css';

import GoogleDonorMap from '../components/GoogleDonorMap';
import S from '../styles/hospitalStyles';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BG_COLOR = {
  'A+': '#E53935',
  'A-': '#B71C1C',
  'B+': '#1565C0',
  'B-': '#0D47A1',
  'AB+': '#6A1B9A',
  'AB-': '#4A148C',
  'O+': '#2E7D32',
  'O-': '#1B5E20',
};

const UrgencyBadge = ({ urgency }) => {
  const m = {
    normal:   { label: 'Normal',   color: '#007C91', bg: 'rgba(0,124,145,0.1)',  bd: 'rgba(0,124,145,0.25)'  },
    urgent:   { label: 'Urgent',   color: '#B45309', bg: 'rgba(255,160,0,0.1)', bd: 'rgba(255,160,0,0.3)'  },
    critical: { label: 'Critical', color: '#B91C1C', bg: 'rgba(211,47,47,0.1)', bd: 'rgba(211,47,47,0.3)'  },
  };
  const s = m[urgency] || m.normal;
  return <span style={{ background: s.bg, color: s.color, border: '1px solid '+s.bd, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>;
};

const StatusBadge = ({ status }) => {
  const m = {
    open:     { label: 'Open',       color: '#B45309', bg: 'rgba(255,160,0,0.1)', bd: 'rgba(255,160,0,0.3)'  },
    matched:  { label: 'Matched',    color: '#0369A1', bg: 'rgba(0,124,145,0.1)', bd: 'rgba(0,124,145,0.3)' },
    issued:   { label: 'Dispatched', color: '#15803D', bg: 'rgba(46,125,50,0.1)', bd: 'rgba(46,125,50,0.3)'  },
    rejected: { label: 'Rejected',   color: '#B91C1C', bg: 'rgba(211,47,47,0.1)', bd: 'rgba(211,47,47,0.3)'  },
    closed:   { label: 'Closed',     color: '#64748B', bg: '#F1F5F9',            bd: '#CBD5E1'              },
  };
  const s = m[status] || { label: status, color: '#64748B', bg: '#F1F5F9', bd: '#CBD5E1' };
  return <span style={{ background: s.bg, color: s.color, border: '1px solid '+s.bd, borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>;
};

const QUICK_PINCODES = [
  { pin: '573201', name: 'Hassan' },
  { pin: '560001', name: 'Bengaluru' },
  { pin: '570001', name: 'Mysuru' },
  { pin: '575001', name: 'Mangaluru' },
  { pin: '580001', name: 'Hubli' },
  { pin: '577201', name: 'Shivamogga' },
];

const DonorMap = ({ donors, centerPin, radiusKm }) => (
  <GoogleDonorMap
    donors={donors}
    centerPin={centerPin}
    originLabel={centerPin ? `Hospital Search Origin (${centerPin})` : 'Hospital Location'}
    height="100%"
    radiusKm={radiusKm || 25}
  />
);

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [searchPin, setSearchPin]         = useState(user?.pincode || '573201');
  const [searchGroup, setSearchGroup]     = useState('ANY');
  const [searchRadius, setSearchRadius]   = useState(50);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [toast, setToast]                 = useState(null);
  const [activeTab, setActiveTab]         = useState('map');
  const [form, setForm] = useState({
    hospitalName: user?.name || 'City Central Hospital',
    contactNumber: user?.phone || '080-23456789', bloodGroup: 'O+',
    unitsRequired: 2, pincode: user?.pincode || '573201', urgency: 'urgent', notes: '',
  });

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get('/requests'); setRequests(res.data.requests || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  const handleSearch = useCallback(async (pin = searchPin, group = searchGroup, radius = searchRadius) => {
    setSearchLoading(true);
    try {
      const cleanPin = (pin || '').trim();
      const res = await api.post('/donor-search', {
        bloodGroup: group === 'ANY' ? undefined : group,
        pincode: cleanPin || undefined,
        radiusKm: radius,
        callerRole: 'hospital'
      });
      setSearchResults(res.data.donors || []);
    } catch (e) { showToast('Donor search failed', 'error'); }
    finally { setSearchLoading(false); }
  }, [searchPin, searchGroup, searchRadius]);

  useEffect(() => { loadRequests(); handleSearch(); }, [loadRequests, handleSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/requests', form); setShowModal(false); loadRequests(); showToast('Emergency request broadcasted!'); }
    catch (err) { showToast(err.response?.data?.error || 'Failed to submit', 'error'); }
  };

  const criticalCount = requests.filter(r => r.urgency === 'critical').length;
  const openCount     = requests.filter(r => r.status  === 'open').length;
  const issuedCount   = requests.filter(r => r.status  === 'issued').length;
  const rate          = requests.length > 0 ? Math.round((issuedCount / requests.length) * 100) : 100;

  return (
    <div style={S.page}>
      {toast && <div style={{ ...S.toast, background: toast.type === 'error' ? '#B91C1C' : '#15803D' }}>{toast.msg}</div>}

      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={S.avatar}><Building2 size={20} color="#007C91" /></div>
          <div>
            <h1 style={S.title}>{user?.name || 'Hospital Portal'}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#15803D' }} />
              <span style={S.subtitle}>Emergency Blood Requisition & Verified Donor Coordination Portal</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadRequests} style={S.iconBtn}><RefreshCw size={15} color="#64748B" /></button>
          <button onClick={() => setShowModal(true)} style={S.primaryBtn}><Plus size={15} /><span>New Requisition</span></button>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={S.kpiRow}>
        {[
          { icon: <Activity size={16} />,     label: 'Total Requisitions', value: requests.length,      color: '#172B4D', bg: 'rgba(23,43,77,0.08)'    },
          { icon: <Zap size={16} />,          label: 'Critical Demands',   value: criticalCount,        color: '#B91C1C', bg: 'rgba(185,28,28,0.08)'   },
          { icon: <Clock size={16} />,        label: 'Open / Searching',   value: openCount,            color: '#B45309', bg: 'rgba(180,83,9,0.08)'    },
          { icon: <CheckCircle2 size={16} />, label: 'Fulfilled',          value: issuedCount,          color: '#15803D', bg: 'rgba(21,128,61,0.08)'   },
          { icon: <TrendingUp size={16} />,   label: 'Fulfillment Rate',   value: rate + '%',           color: '#0369A1', bg: 'rgba(3,105,161,0.08)'   },
          { icon: <Users size={16} />,        label: 'Donors Mapped',      value: searchResults.length, color: '#6A1B9A', bg: 'rgba(106,27,154,0.08)'  },
        ].map(k => (
          <div key={k.label} style={S.kpiCard}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, fontWeight: 600 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={S.grid}>
        {/* LEFT: Requests */}
        <div style={S.leftPanel}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Bell size={15} color="#172B4D" />
            <span style={S.panelTitle}>Active Requisitions</span>
            <span style={S.badge}>{requests.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loading ? (
              <div style={S.empty}><RefreshCw size={24} color="#CBD5E1" /><div style={{ color: '#94A3B8', marginTop: 8, fontSize: 13 }}>Loading…</div></div>
            ) : requests.length === 0 ? (
              <div style={S.empty}>
                <AlertCircle size={32} color="#CBD5E1" />
                <div style={{ fontSize: 14, fontWeight: 700, color: '#64748B', marginTop: 8 }}>No active requests</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center' }}>Create an emergency requisition to begin allocation.</div>
                <button onClick={() => setShowModal(true)} style={{ ...S.primaryBtn, marginTop: 14, fontSize: 12 }}><Plus size={13} /> Create Request</button>
              </div>
            ) : requests.map(req => (
              <div key={req._id} style={{ ...S.reqCard, borderLeft: '3px solid ' + (req.urgency === 'critical' ? '#B91C1C' : req.urgency === 'urgent' ? '#B45309' : '#007C91') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>#{req.requestId}</span>
                      <UrgencyBadge urgency={req.urgency} /><StatusBadge status={req.status} />
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={9} /> {new Date(req.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={S.bloodChip}><Droplet size={11} fill="#D32F2F" color="#D32F2F" />{req.bloodGroup}<span style={{ color: '#94A3B8', fontSize: 10 }}>x{req.unitsRequired}</span></div>
                </div>
                {req.allocatedUnits?.length > 0 && (
                  <div style={S.allocBox}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}><CheckCircle2 size={11} /> Allocated ({req.allocatedUnits.length})</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>{req.allocatedUnits.map(u => <span key={u} style={S.unitChip}>#{u}</span>)}</div>
                  </div>
                )}
                {req.matchedDonors?.length > 0 && (
                  <div style={S.matchBox}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0369A1', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}><Users size={11} /> Nearby Donors ({req.matchedDonors.length})</div>
                    {req.matchedDonors.slice(0, 3).map(d => (
                      <div key={d.donorId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <div><span style={{ fontWeight: 700, color: '#0F172A', fontSize: 12 }}>{d.name}</span><span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 6 }}>{d.pincode}</span></div>
                        {d.phone && <a href={'tel:' + d.phone} style={S.phoneBtn}><Phone size={10} /><span>Call</span></a>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Map + Search */}
        <div style={S.rightPanel}>
          {/* Persistent Pincode Search Box */}
          <div style={S.searchBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="#007C91" />
                <span>Geospatial Pincode Donor Locator</span>
              </div>
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 700, background: 'rgba(5,150,105,0.1)', padding: '2px 8px', borderRadius: 100 }}>
                {searchResults.length} Donor(s) Found
              </span>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchPin, searchGroup, searchRadius); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 140px', minWidth: 130 }}>
                <input
                  type="text"
                  value={searchPin}
                  onChange={(e) => setSearchPin(e.target.value)}
                  style={S.inp}
                  maxLength={6}
                />
              </div>

              <select
                value={searchGroup}
                onChange={(e) => {
                  setSearchGroup(e.target.value);
                  handleSearch(searchPin, e.target.value, searchRadius);
                }}
                style={{ ...S.inp, flex: '0 0 auto', width: 'auto', minWidth: 100 }}
              >
                <option value="ANY">All Groups</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>

              <select
                value={searchRadius}
                onChange={(e) => {
                  setSearchRadius(Number(e.target.value));
                  handleSearch(searchPin, searchGroup, Number(e.target.value));
                }}
                style={{ ...S.inp, flex: '0 0 auto', width: 'auto', minWidth: 100 }}
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
                <option value={500}>State-Wide (500 km)</option>
              </select>

              <button type="submit" disabled={searchLoading} style={{ ...S.searchBtn, flex: '0 0 auto', width: 'auto', padding: '8px 16px' }}>
                <Search size={13} />
                <span>{searchLoading ? 'Searching…' : 'Locate'}</span>
              </button>
            </form>

            {/* Quick Pincode Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Quick Pincodes:</span>
              {QUICK_PINCODES.map(q => (
                <button
                  key={q.pin}
                  type="button"
                  onClick={() => {
                    setSearchPin(q.pin);
                    handleSearch(q.pin, searchGroup, searchRadius);
                  }}
                  style={{
                    background: searchPin === q.pin ? '#007C91' : '#FFFFFF',
                    color: searchPin === q.pin ? '#FFFFFF' : '#334155',
                    border: '1px solid ' + (searchPin === q.pin ? '#007C91' : '#CBD5E1'),
                    borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {q.name} ({q.pin})
                </button>
              ))}
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ ...S.tabBar, marginTop: 12 }}>
            <button
              onClick={() => setActiveTab('map')}
              style={{ ...S.tab, ...(activeTab === 'map' ? S.tabActive : {}) }}
            >
              <Navigation size={12} />
              <span>Map View ({searchResults.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              style={{ ...S.tab, ...(activeTab === 'search' ? S.tabActive : {}) }}
            >
              <Filter size={12} />
              <span>Donor Directory ({searchResults.length})</span>
            </button>
          </div>

          {/* Tab 1: Map View */}
          {activeTab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Legend:</span>
                  {[
                    ['#0F172A', 'Hospital Pin'],
                    ['#E53935', 'A+'],
                    ['#1565C0', 'B+'],
                    ['#6A1B9A', 'AB+'],
                    ['#2E7D32', 'O+']
                  ].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#007C91', fontWeight: 700 }}>
                  Target Pincode: <strong>{searchPin || 'Central'}</strong>
                </div>
              </div>

              {/* Map Container */}
              <div style={{ height: 420, borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <DonorMap donors={searchResults} centerPin={searchPin} radiusKm={searchRadius} />
              </div>

              {/* Plotted donors under map */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>
                  Nearby Donors Located Near PIN {searchPin}:
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {searchResults.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#94A3B8', padding: '8px 0' }}>No donors found in this radius. Try a larger radius or different pincode.</div>
                  ) : (
                    searchResults.map(d => (
                      <div key={d.donorId} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: BG_COLOR[d.bloodGroup] || '#007C91', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900 }}>
                          {d.bloodGroup}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{d.name}</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>
                            PIN {d.pincode} {d.distanceKm !== undefined ? `· ${d.distanceKm} km` : ''}
                          </div>
                        </div>
                        {d.phone && (
                          <a href={'tel:' + d.phone} style={{ ...S.phoneBtn, padding: '3px 8px', fontSize: 10, marginLeft: 4 }}>
                            <Phone size={9} /> Call
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Donor Directory */}
          {activeTab === 'search' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 460, overflowY: 'auto' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                  No verified donors found matching this criteria.
                </div>
              ) : searchResults.map(d => (
                <div key={d.donorId} style={S.donorCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: BG_COLOR[d.bloodGroup] || '#007C91',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 900, flexShrink: 0
                    }}>
                      {d.bloodGroup}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={9} /> {d.city || d.district || 'Karnataka'} – {d.pincode}
                        </span>
                        {d.distanceKm !== undefined && (
                          <span style={{ color: '#0284C7', fontWeight: 700 }}>{d.distanceKm} km</span>
                        )}
                        <span>· {d.donationCount || 0} donations</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {d.phone && (
                      <a href={'tel:' + d.phone} style={S.phoneBtn}>
                        <Phone size={10} />
                        <span>Call</span>
                      </a>
                    )}
                    <button
                      onClick={() => setActiveTab('map')}
                      style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700 }}
                    >
                      <Navigation size={10} /> Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>New Emergency Requisition</h2>
                <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0' }}>This request will be broadcast to the BloodBank allocation network.</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px', cursor: 'pointer', color: '#64748B' }}>
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <label style={S.lbl}>Hospital / Facility Name *</label>
                <input type="text" value={form.hospitalName} onChange={e => setForm({ ...form, hospitalName: e.target.value })} style={S.inp} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={S.lbl}>Emergency Contact *</label>
                  <input type="tel" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} style={S.inp} required />
                </div>
                <div>
                  <label style={S.lbl}>Hospital Pincode *</label>
                  <input type="text" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} style={S.inp} maxLength={6} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={S.lbl}>Blood Group *</label>
                  <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} style={S.inp}>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.lbl}>Units Required *</label>
                  <input type="number" min="1" max="20" value={form.unitsRequired} onChange={e => setForm({ ...form, unitsRequired: e.target.value })} style={S.inp} required />
                </div>
                <div>
                  <label style={S.lbl}>Urgency Level *</label>
                  <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })} style={S.inp}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div style={{
                padding: '10px 14px', borderRadius: 8, fontSize: 12,
                background: form.urgency === 'critical' ? 'rgba(185,28,28,0.06)' : form.urgency === 'urgent' ? 'rgba(180,83,9,0.06)' : 'rgba(0,124,145,0.06)',
                border: '1px solid ' + (form.urgency === 'critical' ? 'rgba(185,28,28,0.2)' : form.urgency === 'urgent' ? 'rgba(180,83,9,0.2)' : 'rgba(0,124,145,0.2)'),
                color: form.urgency === 'critical' ? '#B91C1C' : form.urgency === 'urgent' ? '#B45309' : '#007C91',
                fontWeight: 600
              }}>
                {form.urgency === 'critical' && 'CRITICAL: Immediate life-threatening emergency. High priority dispatch.'}
                {form.urgency === 'urgent'   && 'URGENT: Patient requires transfusion within hours.'}
                {form.urgency === 'normal'   && 'NORMAL: Standard scheduled procedure queue.'}
              </div>
              <div>
                <label style={S.lbl}>Clinical Notes / Case Details</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ ...S.inp, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4, borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 16px', fontSize: 13, color: '#64748B', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={S.primaryBtn}><Zap size={13} />Broadcast Requisition</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
