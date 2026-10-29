import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  AlertTriangle,
  ShieldCheck,
  Droplet,
  Clock,
  CheckCircle2,
  Activity,
  AlertCircle,
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  User,
  ShieldAlert
} from 'lucide-react';
import api from '../lib/api';
import adminStyles from '../styles/adminStyles';

// ── Shared Status Pill Helper ────────────────────────────────────────────────
export const StatusPill = ({ status, type = 'donor' }) => {
  const donorMap = {
    pending:  { label: 'Pending',  color: '#FFA000', bg: 'rgba(255,160,0,0.12)' },
    verified: { label: 'Verified', color: '#2E7D32', bg: 'rgba(46,125,50,0.12)' },
    flagged:  { label: 'BANNED',   color: '#DC2626', bg: '#FEE2E2' },
  };

  const unitMap = {
    collected: { label: 'Collected', color: '#172B4D', bg: 'rgba(23,43,77,0.1)' },
    testing:   { label: 'Testing',   color: '#007C91', bg: 'rgba(0,124,145,0.12)' },
    available: { label: 'Available', color: '#2E7D32', bg: 'rgba(46,125,50,0.12)' },
    requested: { label: 'Requested', color: '#FFA000', bg: 'rgba(255,160,0,0.15)' },
    issued:    { label: 'Issued',    color: '#6A1B9A', bg: 'rgba(106,27,154,0.12)' },
    expired:   { label: 'Expired',   color: '#6C757D', bg: 'rgba(108,117,125,0.15)' },
    rejected:  { label: 'Rejected',  color: '#D32F2F', bg: 'rgba(211,47,47,0.12)' },
  };

  const map = type === 'donor' ? donorMap : unitMap;
  const s = map[status] || { label: status, color: '#6C757D', bg: '#E0E0E0' };

  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 100,
      padding: '3px 10px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

// ── 1. Create Hospital Account Modal ─────────────────────────────────────────
/**
 * GUIDE EXPLANATION: Partner Hospital Onboarding
 * Question: "How are hospital accounts created?"
 * Answer: Only RedFlow Administrators can create authenticated hospital accounts.
 * This ensures that blood units and emergency notifications are only dispatched
 * to accredited medical centers with valid emergency contact numbers and pincodes.
 */
export const CreateHospitalModal = ({ onClose, onDone, onError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PHONE_REGEX = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return onError('Hospital name is required');
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      return onError('Please enter a valid official email address (e.g. hospital@example.com)');
    }
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    if (phone && !PHONE_REGEX.test(cleanPhone)) {
      return onError('Please enter a valid 10-digit emergency contact number starting with 6, 7, 8, or 9');
    }
    if (!password || !PASSWORD_REGEX.test(password)) {
      return onError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/create-hospital', {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: cleanPhone,
        address: address.trim(),
        district: (district || 'Hassan').trim(),
        state: (state || 'Karnataka').trim(),
        pincode: (pincode || '573201').trim()
      });
      onDone(res.data);
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to create hospital account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminStyles.overlay}>
      <div style={{ ...adminStyles.modal, maxWidth: 540 }}>
        <div style={adminStyles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0, 124, 145, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#007C91" />
            </div>
            <div>
              <h2 style={{ ...adminStyles.modalTitle, margin: 0, fontSize: 18 }}>Onboard Partner Hospital</h2>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Provision accredited clinical credentials for blood requisitions.</p>
            </div>
          </div>
          <button onClick={onClose} style={adminStyles.modalCloseBtn} disabled={loading}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={adminStyles.inputLabel}>Hospital / Center Name *</label>
            <input type="text" placeholder="e.g. Hassan Institute of Medical Sciences" value={name} onChange={e => setName(e.target.value)} style={adminStyles.input} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={adminStyles.inputLabel}>Official Email Address *</label>
              <input type="email" placeholder="hospital@domain.org" value={email} onChange={e => setEmail(e.target.value)} style={adminStyles.input} required />
            </div>
            <div>
              <label style={adminStyles.inputLabel}>Emergency Phone / Blood Bank *</label>
              <input type="text" placeholder="9845012345" value={phone} onChange={e => setPhone(e.target.value)} style={adminStyles.input} required />
            </div>
          </div>

          <div>
            <label style={adminStyles.inputLabel}>Initial Access Password *</label>
            <input type="password" placeholder="Min 8 chars, 1 uppercase, 1 special char" value={password} onChange={e => setPassword(e.target.value)} style={adminStyles.input} required />
          </div>

          <div>
            <label style={adminStyles.inputLabel}>Hospital Facility Address</label>
            <input type="text" placeholder="BM Road, Hassan" value={address} onChange={e => setAddress(e.target.value)} style={adminStyles.input} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={adminStyles.inputLabel}>District</label>
              <input type="text" placeholder="Hassan" value={district} onChange={e => setDistrict(e.target.value)} style={adminStyles.input} />
            </div>
            <div>
              <label style={adminStyles.inputLabel}>State</label>
              <input type="text" value={state} onChange={e => setState(e.target.value)} style={adminStyles.input} />
            </div>
            <div>
              <label style={adminStyles.inputLabel}>Pincode</label>
              <input type="text" placeholder="573201" value={pincode} onChange={e => setPincode(e.target.value)} style={adminStyles.input} />
            </div>
          </div>

          <div style={adminStyles.modalBtns}>
            <button type="button" onClick={onClose} disabled={loading} style={adminStyles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={adminStyles.primaryBtn}>
              {loading ? 'Registering Facility…' : 'Register & Authorize Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── 2. Verify Donor Preview Modal ────────────────────────────────────────────
/**
 * GUIDE EXPLANATION: Pre-Donation Clinical Verification
 * Question: "How does the admin verify a donor before collection?"
 * Answer: The administrator reviews the donor's age (18-65), identity details,
 * and confirms that at least 90 days have elapsed since their last donation.
 * Once verified, an immutable cryptographic Keccak-256 hash is anchored on-chain.
 */
export const VerifyDonorModal = ({ donor, onClose, onVerify }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!donor) return null;

  const daysSinceLast = donor.lastDonationDate
    ? Math.floor((new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24))
    : null;
  const isIntervalEligible = daysSinceLast === null || daysSinceLast >= 90;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await onVerify(donor);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Verification failed.');
      setLoading(false);
    }
  };

  return (
    <div style={adminStyles.overlay}>
      <div style={{ ...adminStyles.modal, maxWidth: 640 }}>
        <div style={adminStyles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(22, 163, 74, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#16A34A" />
            </div>
            <div>
              <h2 style={{ ...adminStyles.modalTitle, margin: 0, fontSize: 18 }}>Review & Verify Donor Registration</h2>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>Review clinical eligibility before cryptographic blockchain commitment.</p>
            </div>
          </div>
          <button onClick={onClose} style={adminStyles.modalCloseBtn} disabled={loading}><X size={18} /></button>
        </div>

        {error && <div style={adminStyles.errorBanner}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 'calc(80vh - 120px)', overflowY: 'auto', paddingRight: 4 }}>
          {/* Top Profile Summary Card */}
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: 12, padding: '16px 18px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #007C91 0%, #0284C7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16 }}>
                {donor.name?.[0]?.toUpperCase() || 'D'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{donor.name}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>
                  ID: {donor.donorId} • {donor.gender ? `${donor.gender.toUpperCase()}, ` : ''}{donor.age} yrs
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: '#DC2626', color: '#FFFFFF', padding: '4px 12px', borderRadius: 8, fontSize: 15, fontWeight: 900 }}>
                {donor.bloodGroup}
              </span>
              <div style={{ fontSize: 11, color: '#38BDF8', marginTop: 4, fontWeight: 700 }}>
                {donor.city || 'Hassan'}, {donor.pincode}
              </div>
            </div>
          </div>

          {/* 90-Day Biological Interval Verification */}
          <div style={{
            background: isIntervalEligible ? '#F0FDF4' : '#FEF2F2',
            border: `1.5px solid ${isIntervalEligible ? '#86EFAC' : '#FCA5A5'}`,
            borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12
          }}>
            {isIntervalEligible ? <CheckCircle2 size={24} color="#16A34A" /> : <Clock size={24} color="#DC2626" />}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: isIntervalEligible ? '#166534' : '#991B1B' }}>
                {isIntervalEligible ? 'Clinical Rest Interval: ELIGIBLE' : 'Clinical Rest Interval: NOT ELIGIBLE'}
              </div>
              <div style={{ fontSize: 12, color: isIntervalEligible ? '#15803D' : '#B91C1C', marginTop: 2 }}>
                {daysSinceLast === null
                  ? 'First-time donor — no previous donation recorded. Eligible immediately.'
                  : `${daysSinceLast} days elapsed since last donation (${new Date(donor.lastDonationDate).toLocaleDateString('en-IN')}). Medical standard requires minimum 90 days.`}
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Contact Phone</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>{donor.phone || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Email Address</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>{donor.email || donor.userId?.email || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Residential Address</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>{donor.address || 'Hassan'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>District & State</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginTop: 2 }}>{donor.district || 'Hassan'}, {donor.state || 'Karnataka'}</div>
            </div>
          </div>

          <div style={adminStyles.modalBtns}>
            <button type="button" onClick={onClose} disabled={loading} style={adminStyles.cancelBtn}>Cancel</button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || !isIntervalEligible}
              style={{
                ...adminStyles.primaryBtn,
                background: '#16A34A',
                opacity: (!isIntervalEligible || loading) ? 0.6 : 1,
                cursor: (!isIntervalEligible || loading) ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting to Smart Contract…' : 'Confirm & Commit On-Chain'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 3. Collect Unit Modal ────────────────────────────────────────────────────
/**
 * GUIDE EXPLANATION: Blood Collection Pouch Intake
 * Question: "What happens when blood is collected from a donor?"
 * Answer: The system registers a new pouch (BUxxx), links it to the verified donor,
 * starts the cold-chain custody clock (35-day shelf life), calculates a Keccak-256
 * cryptographic hash, and sets the initial state to 'COLLECTED'.
 */
export const CollectUnitModal = ({ verifiedDonors, onClose, onDone, onError }) => {
  const [donorId, setDonorId] = useState('');
  const [storageLocation, setStorageLocation] = useState('Cold Storage Vault 1');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const eligibleDonors = (verifiedDonors || []).filter(d => d.isVerified && !d.isFlagged);
  const selectedDonor = eligibleDonors.find(d => d.donorId === donorId);

  const handleCollect = async (e) => {
    e.preventDefault();
    if (!donorId) return;
    setLoading(true);
    try {
      const res = await api.post('/blood-units', { donorId, storageLocation, collectionDate });
      onDone(res.data);
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to collect blood unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminStyles.overlay}>
      <div style={{ ...adminStyles.modal, maxWidth: 520 }}>
        <div style={adminStyles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplet size={20} color="#D32F2F" />
            <h2 style={adminStyles.modalTitle}>Blood Collection & Genesis Minting</h2>
          </div>
          <button onClick={onClose} style={adminStyles.modalCloseBtn}><X size={18} /></button>
        </div>
        <form onSubmit={handleCollect} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={adminStyles.inputLabel}>Select Verified Donor *</label>
            <select value={donorId} onChange={e => setDonorId(e.target.value)} style={adminStyles.select} required>
              <option value="">-- Choose Verified Donor ({eligibleDonors.length} available) --</option>
              {eligibleDonors.map(d => (
                <option key={d.donorId} value={d.donorId}>
                  {d.name} ({d.donorId}) — Group {d.bloodGroup} • {d.district || 'Hassan'}
                </option>
              ))}
            </select>
          </div>

          {selectedDonor && (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{selectedDonor.name}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>ID: {selectedDonor.donorId} • Phone: {selectedDonor.phone || 'Verified'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={adminStyles.bloodGroupBadge}>{selectedDonor.bloodGroup}</span>
                <div style={{ fontSize: 10, color: '#16A34A', fontWeight: 700, marginTop: 2 }}>Verified Donor</div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={adminStyles.inputLabel}>Collection Date</label>
              <input type="date" value={collectionDate} onChange={e => setCollectionDate(e.target.value)} style={adminStyles.input} required />
            </div>
            <div>
              <label style={adminStyles.inputLabel}>Cold Storage Location</label>
              <select value={storageLocation} onChange={e => setStorageLocation(e.target.value)} style={adminStyles.select}>
                <option value="Cold Storage Vault 1">Cold Storage Vault 1</option>
                <option value="Cold Storage Vault 2">Cold Storage Vault 2</option>
                <option value="Cold Storage Vault 3">Cold Storage Vault 3</option>
                <option value="Hassan District Blood Bank Vault">Hassan District Blood Bank Vault</option>
              </select>
            </div>
          </div>

          <div style={adminStyles.modalBtns}>
            <button type="button" onClick={onClose} style={adminStyles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading || !donorId} style={adminStyles.primaryBtn}>
              {loading ? 'Minting On-Chain…' : 'Collect Unit & Mint QR Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── 4. Clinical Lab Screening Modal ──────────────────────────────────────────
/**
 * GUIDE EXPLANATION: 5-Panel Serology Screening
 * Question: "What tests are performed before blood is certified safe?"
 * Answer: Every whole blood unit is subjected to mandatory clinical serology:
 * HIV-1/2, Hepatitis B (HBsAg), Hepatitis C (Anti-HCV), Syphilis (VDRL), and Malaria.
 * Only units testing non-reactive are marked 'SAFE' and moved to available inventory.
 */
export const LabTestModal = ({ unit, onClose, onDone, onError }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status) => {
    setLoading(true);
    try {
      const res = await api.put(`/blood-units/${unit.unitId}/test-status`, { status, notes });
      onDone(status, res.data);
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to update lab test status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminStyles.overlay}>
      <div style={{ ...adminStyles.modal, maxWidth: 520 }}>
        <div style={adminStyles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={20} color="#007C91" />
            <h2 style={adminStyles.modalTitle}>Clinical Lab Screening — #{unit.unitId}</h2>
          </div>
          <button onClick={onClose} style={adminStyles.modalCloseBtn}><X size={18} /></button>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0' }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Blood Unit & Donor</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', fontFamily: 'monospace' }}>
              #{unit.unitId} • Donor: {unit.donorId}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={adminStyles.bloodGroupBadge}>{unit.bloodGroup}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#007C91', background: 'rgba(0,124,145,0.1)', padding: '3px 8px', borderRadius: 6 }}>
              {unit.storageLocation || 'Cold Storage Vault 1'}
            </span>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#172B4D', marginBottom: 8, display: 'block' }}>
            Standard Clinical Serology Panel (Required for Release):
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 12px' }}>
            {[
              'HIV-1 & HIV-2 (Antigen/Antibody Combo) — Non-Reactive',
              'Hepatitis B Surface Antigen (HBsAg) — Non-Reactive',
              'Hepatitis C Virus (Anti-HCV) — Non-Reactive',
              'Syphilis Serology (VDRL / RPR) — Non-Reactive',
              'Malaria Parasite Screen — Negative',
            ].map((panel, idx) => (
              <div key={idx} style={{ fontSize: 11, fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} color="#16A34A" />
                <span>{panel}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label style={adminStyles.inputLabel}>Lab Officer Remarks / Batch Notes</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} style={adminStyles.input} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdate('rejected')}
            style={{
              flex: 1, background: '#FEF2F2', border: '1.5px solid #EF4444', color: '#B91C1C',
              borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }}
          >
            Reject (Dispose)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpdate('safe')}
            style={{
              flex: 2, background: '#16A34A', border: 'none', color: '#FFFFFF',
              borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
            }}
          >
            {loading ? 'Certifying On-Chain…' : 'Approve & Move to Cold Storage'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── 5. Allocate & Match Unit Modal ───────────────────────────────────────────
/**
 * GUIDE EXPLANATION: Blood Allocation & Matching
 * Question: "How are blood units matched to emergency requests?"
 * Answer: The system filters active hospital demands by exact ABO/Rh compatibility.
 * Admin can either allocate the unit to reserve it for a specific hospital request
 * or directly authorize a patient transfusion.
 */
export const AllocateUnitModal = ({ unit, requests, onClose, onDone, onError }) => {
  const [mode, setMode] = useState('requests');
  const [selectedReqId, setSelectedReqId] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [wardNotes, setWardNotes] = useState('');
  const [clinicianNotes, setClinicianNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!unit) return null;

  const exactMatchReqs = (requests || []).filter(
    r => ['open', 'matched'].includes(r.status) && r.bloodGroup === unit.bloodGroup
  );
  const isAlreadyRequested = unit.availabilityStatus === 'requested';

  const handleAllocateToHospital = async (e) => {
    e.preventDefault();
    if (!selectedReqId) return;
    const targetReq = exactMatchReqs.find(r => r.requestId === selectedReqId);
    setLoading(true);
    try {
      await api.put(`/blood-units/${unit.unitId}/availability`, {
        status: 'requested',
        requestId: selectedReqId,
        hospitalName: targetReq?.hospitalName || 'Hospital Center',
        notes: `Allocated from ${unit.storageLocation || 'Cold Storage'} to ${targetReq?.hospitalName || 'Hospital'} (Request #${selectedReqId})`
      });
      onDone(unit.unitId, `Allocated to ${targetReq?.hospitalName || selectedReqId}`);
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to allocate blood unit');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullNotes = `${wardNotes ? `[${wardNotes}] ` : ''}${clinicianNotes}`;
      await api.put(`/blood-units/${unit.unitId}/availability`, {
        status: 'issued',
        hospitalName,
        notes: fullNotes
      });
      onDone(unit.unitId, `Directly issued for transfusion at ${hospitalName || 'Hospital'}`);
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to issue unit for transfusion');
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseToStorage = async () => {
    setLoading(true);
    try {
      await api.put(`/blood-units/${unit.unitId}/availability`, {
        status: 'available',
        notes: `Allocation released back to ${unit.storageLocation || 'Cold Storage Vault'}`
      });
      onDone(unit.unitId, 'Released back to Cold Storage (Available)');
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to release unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminStyles.overlay}>
      <div style={{ ...adminStyles.modal, maxWidth: 620 }}>
        <div style={adminStyles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0, 124, 145, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} color="#007C91" />
            </div>
            <div>
              <h2 style={{ ...adminStyles.modalTitle, margin: 0, fontSize: 18 }}>
                Allocate & Dispatch Blood Unit #{unit.unitId}
              </h2>
              <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>
                Allocate to matching hospital emergency requests or issue directly for patient transfusion.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={adminStyles.modalCloseBtn} disabled={loading}><X size={18} /></button>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Blood Unit Details</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', fontFamily: 'monospace' }}>
              #{unit.unitId} • Donor: {unit.donorId}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={adminStyles.bloodGroupBadge}>{unit.bloodGroup}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#007C91', background: 'rgba(0,124,145,0.1)', padding: '3px 8px', borderRadius: 6 }}>
              {unit.storageLocation || 'Cold Storage Vault 1'}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: unit.testStatus === 'safe' ? '#16A34A' : '#D97706', background: unit.testStatus === 'safe' ? '#DCFCE7' : '#FEF3C7', padding: '3px 8px', borderRadius: 6 }}>
              {unit.testStatus === 'safe' ? 'SAFE' : unit.testStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {isAlreadyRequested && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400E', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><strong>Currently Allocated:</strong> This unit is in <code>REQUESTED</code> state for a hospital dispatch.</div>
            <button type="button" disabled={loading} onClick={handleReleaseToStorage} style={{ background: '#FFFFFF', border: '1px solid #D97706', color: '#B45309', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
              Release to Available
            </button>
          </div>
        )}

        <div style={{ display: 'flex', background: '#F1F5F9', padding: 4, borderRadius: 10, marginBottom: 16, gap: 4 }}>
          <button
            type="button"
            onClick={() => setMode('requests')}
            style={{
              flex: 1, padding: '9px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              background: mode === 'requests' ? '#FFFFFF' : 'transparent',
              color: mode === 'requests' ? '#0F172A' : '#64748B',
              boxShadow: mode === 'requests' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <Building2 size={15} color={mode === 'requests' ? '#007C91' : '#64748B'} />
            <span>1. Hospital Emergency Requisitions ({exactMatchReqs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('direct')}
            style={{
              flex: 1, padding: '9px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 700,
              background: mode === 'direct' ? '#FFFFFF' : 'transparent',
              color: mode === 'direct' ? '#0F172A' : '#64748B',
              boxShadow: mode === 'direct' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
          >
            <CheckCircle2 size={15} color={mode === 'direct' ? '#6A1B9A' : '#64748B'} />
            <span>2. Direct Patient Transfusion</span>
          </button>
        </div>

        {mode === 'requests' && (
          <form onSubmit={handleAllocateToHospital} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...adminStyles.inputLabel, margin: 0 }}>
                  Active Hospital Demands for <strong>{unit.bloodGroup}</strong> Blood:
                </label>
                <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 700 }}>Showing Exact Blood Group Matches Only</span>
              </div>

              {exactMatchReqs.length === 0 ? (
                <div style={{ padding: '20px 16px', background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={28} color="#94A3B8" />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                    No pending hospital emergency requests seeking <strong>{unit.bloodGroup}</strong> at this time.
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', maxWidth: 380 }}>
                    You can switch to <strong>Direct Patient Transfusion</strong> to issue this unit immediately.
                  </div>
                  <button type="button" onClick={() => setMode('direct')} style={{ marginTop: 4, background: '#6A1B9A', color: '#FFF', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Switch to Direct Patient Transfusion
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {exactMatchReqs.map(r => {
                    const isSelected = selectedReqId === r.requestId;
                    return (
                      <div
                        key={r.requestId}
                        onClick={() => setSelectedReqId(r.requestId)}
                        style={{
                          border: isSelected ? '2px solid #007C91' : '1px solid #CBD5E1',
                          background: isSelected ? 'rgba(0,124,145,0.06)' : '#FFFFFF',
                          borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{r.hospitalName}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 800,
                              background: r.urgency === 'critical' ? '#FEE2E2' : r.urgency === 'urgent' ? '#FEF3C7' : '#E0F2FE',
                              color: r.urgency === 'critical' ? '#DC2626' : r.urgency === 'urgent' ? '#D97706' : '#0284C7',
                              padding: '2px 7px', borderRadius: 4
                            }}>
                              {r.urgency.toUpperCase()}
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>
                              {r.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <span>Req: <strong>#{r.requestId}</strong></span>
                            <span>•</span>
                            <span>Demanded: <strong>{r.unitsRequired} Units</strong></span>
                            <span>•</span>
                            <span>Pincode: <strong>{r.pincode}</strong></span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', marginLeft: 12, flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 900, padding: '4px 10px', borderRadius: 6, background: '#DC2626', color: '#FFFFFF', display: 'inline-block' }}>
                            {r.bloodGroup}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={adminStyles.modalBtns}>
              <button type="button" onClick={onClose} disabled={loading} style={adminStyles.cancelBtn}>Cancel</button>
              <button type="submit" disabled={loading || !selectedReqId} style={{ ...adminStyles.primaryBtn, opacity: (!selectedReqId || loading) ? 0.6 : 1, cursor: (!selectedReqId || loading) ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Allocating On-Chain…' : 'Confirm Allocation & Reserve for Hospital'}
              </button>
            </div>
          </form>
        )}

        {mode === 'direct' && (
          <form onSubmit={handleDirectIssue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={adminStyles.inputLabel}>Administering Hospital / Healthcare Facility *</label>
              <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} style={adminStyles.input} required />
            </div>
            <div>
              <label style={adminStyles.inputLabel}>Patient Case Reference / Ward Location</label>
              <input type="text" value={wardNotes} onChange={e => setWardNotes(e.target.value)} style={adminStyles.input} />
            </div>
            <div>
              <label style={adminStyles.inputLabel}>Clinical Transfusion Remarks</label>
              <textarea rows={3} value={clinicianNotes} onChange={e => setClinicianNotes(e.target.value)} style={adminStyles.textarea} />
            </div>
            <div style={adminStyles.modalBtns}>
              <button type="button" onClick={onClose} disabled={loading} style={adminStyles.cancelBtn}>Cancel</button>
              <button type="submit" disabled={loading} style={{ ...adminStyles.primaryBtn, background: '#6A1B9A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {loading ? <RefreshCw size={14} className="spin" /> : null}
                <span>{loading ? 'Signing Transfusion On-Chain…' : 'Confirm Transfusion & Sign On-Chain'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── 6. Issue / Transfusion Dispatch Modal ────────────────────────────────────
export const IssueUnitModal = ({ unit, onClose, onDone, onError }) => {
  const [hospitalName, setHospitalName] = useState('');
  const [clinicianNotes, setClinicianNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put(`/blood-units/${unit.unitId}/availability`, {
        status: 'issued',
        hospitalName,
        notes: clinicianNotes
      });
      onDone(unit.unitId, res.data);
    } catch (err) {
      onError(err.response?.data?.error || 'Failed to issue unit for transfusion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminStyles.overlay}>
      <div style={{ ...adminStyles.modal, maxWidth: 520 }}>
        <div style={adminStyles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={20} color="#6A1B9A" />
            <h2 style={adminStyles.modalTitle}>Issue Blood Unit for Transfusion</h2>
          </div>
          <button onClick={onClose} style={adminStyles.modalCloseBtn}><X size={18} /></button>
        </div>

        <div style={{ background: '#FAF5FF', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E9D5FF' }}>
          <div>
            <div style={{ fontSize: 11, color: '#7E22CE', fontWeight: 600 }}>Dispatched Blood Unit</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#581C87', fontFamily: 'monospace' }}>
              #{unit.unitId} • Donor: {unit.donorId}
            </div>
          </div>
          <span style={adminStyles.bloodGroupBadge}>{unit.bloodGroup}</span>
        </div>

        <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={adminStyles.inputLabel}>Receiving Hospital / Center *</label>
            <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} style={adminStyles.input} required />
          </div>
          <div>
            <label style={adminStyles.inputLabel}>Clinical Transfusion Remarks</label>
            <textarea rows={3} value={clinicianNotes} onChange={e => setClinicianNotes(e.target.value)} style={adminStyles.textarea} />
          </div>
          <div style={adminStyles.modalBtns}>
            <button type="button" onClick={onClose} style={adminStyles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...adminStyles.primaryBtn, background: '#6A1B9A' }}>
              {loading ? 'Broadcasting Transfusion…' : 'Confirm Transfusion & Sign On-Chain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── 7. Unit Details & QR Modal ───────────────────────────────────────────────
export const UnitDetailsModal = ({ unit, onClose }) => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (unit) {
      api.get(`/blood-units/${unit.unitId}/timeline`)
        .then(r => setTimeline(r.data.timeline || []))
        .catch(() => setTimeline([]))
        .finally(() => setLoading(false));
    }
  }, [unit]);

  if (!unit) return null;

  return (
    <div style={adminStyles.overlay}>
      <div style={{ ...adminStyles.modal, maxWidth: 540 }}>
        <div style={adminStyles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplet size={20} color="#D32F2F" />
            <h2 style={adminStyles.modalTitle}>Blood Unit #{unit.unitId}</h2>
          </div>
          <button onClick={onClose} style={adminStyles.modalCloseBtn}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: 20, padding: '16px 0', borderBottom: '1px solid #F0F0F0' }}>
          {unit.qrUrl && (
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <img src={unit.qrUrl} alt="QR Code" style={{ width: 140, height: 140, borderRadius: 8, border: '1px solid #E0E0E0' }} />
              <div style={{ fontSize: 11, color: '#6C757D', marginTop: 4, fontFamily: 'monospace' }}>Scan to Verify</div>
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#D32F2F' }}>{unit.bloodGroup}</span>
              <StatusPill status={unit.availabilityStatus} type="unit" />
            </div>
            <div style={adminStyles.detailRow}><span style={adminStyles.detailKey}>Donor:</span> <span style={adminStyles.detailVal}>{unit.donorId}</span></div>
            <div style={adminStyles.detailRow}><span style={adminStyles.detailKey}>Collected:</span> <span style={adminStyles.detailVal}>{new Date(unit.collectionDate).toLocaleDateString('en-IN')}</span></div>
            <div style={adminStyles.detailRow}><span style={adminStyles.detailKey}>Expires:</span> <span style={adminStyles.detailVal}>{new Date(unit.expiryDate).toLocaleDateString('en-IN')}</span></div>
            <div style={adminStyles.detailRow}><span style={adminStyles.detailKey}>Lab Status:</span> <span style={adminStyles.detailVal}>{unit.testStatus.toUpperCase()}</span></div>
            <div style={adminStyles.detailRow}><span style={adminStyles.detailKey}>Location:</span> <span style={adminStyles.detailVal}>{unit.storageLocation}</span></div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D', marginBottom: 12 }}>Traceability Audit Timeline</div>
          {loading ? (
            <div style={{ fontSize: 12, color: '#6C757D' }}>Loading trace events…</div>
          ) : timeline.length === 0 ? (
            <div style={{ fontSize: 12, color: '#6C757D' }}>No trace events recorded.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {timeline.map((evt, idx) => (
                <div key={evt.eventId || idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#007C91', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#212529' }}>{evt.eventType.toUpperCase()} - {evt.description}</div>
                    <div style={{ fontSize: 11, color: '#6C757D', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span>{new Date(evt.timestamp).toLocaleString('en-IN')}</span>
                      {evt.blockchainTxHash && <span style={{ fontFamily: 'monospace' }}>Tx: {evt.blockchainTxHash.substring(0, 10)}…</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── 8. Permanent Flag / Medical Disqualification Modal ───────────────────────
/**
 * GUIDE EXPLANATION: Irreversible Medical Flagging
 * Question: "Why is donor flagging permanent?"
 * Answer: In blood transfusion safety, a donor identified with transfusion-transmissible
 * infections (TTIs) or fraudulent documentation must be permanently barred. To protect
 * recipient patients, flagged accounts cannot be unflagged.
 */
export const FlagModal = ({ donor, onClose, onDone }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFlag = async () => {
    if (!reason.trim()) return setError('Please enter a clinical or administrative reason for flagging.');
    setLoading(true);
    try {
      await api.put(`/donors/${donor.donorId}/flag`, { flag: true, reason });
      onDone();
    } catch (e) {
      setError(e.response?.data?.error || 'Flag failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminStyles.overlay}>
      <div style={adminStyles.modal}>
        <div style={adminStyles.modalHeader}>
          <h2 style={adminStyles.modalTitle}>Flag Donor</h2>
          <button onClick={onClose} style={adminStyles.modalCloseBtn}><X size={18} /></button>
        </div>
        <p style={adminStyles.modalSub}>
          Flagging <strong>{donor.name}</strong> ({donor.donorId}) will permanently prevent them from donating.
          The clinical reason is encrypted and stored securely in the database.
        </p>
        {error && <div style={adminStyles.errorBanner}>{error}</div>}
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(''); }}
          style={adminStyles.textarea}
          placeholder="Enter specific audit/medical reason..."
        />
        <div style={adminStyles.modalBtns}>
          <button onClick={onClose} style={adminStyles.cancelBtn}>Cancel</button>
          <button onClick={handleFlag} disabled={loading} style={adminStyles.dangerBtn}>
            {loading ? 'Flagging…' : 'Confirm Flag'}
          </button>
        </div>
      </div>
    </div>
  );
};
