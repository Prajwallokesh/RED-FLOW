import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2
} from 'lucide-react';
import api from '../lib/api';
import Badge, { getBadgeLevel, BADGE_DETAILS } from '../components/Badge';
import styles from '../styles/profileStyles';

const StatusPill = ({ status }) => {
  const map = {
    pending:  { label: 'Pending Review', color: '#FFA000', bg: 'rgba(255,160,0,0.12)', icon: <Clock size={12} /> },
    verified: { label: 'Verified',       color: '#2E7D32', bg: 'rgba(46,125,50,0.12)', icon: <CheckCircle2 size={12} /> },
    flagged:  { label: 'Flagged',        color: '#D32F2F', bg: 'rgba(211,47,47,0.12)', icon: <AlertTriangle size={12} /> },
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
    }}>
      {s.icon}
      <span>{s.label}</span>
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '11px 0',
    borderBottom: '1px solid #F0F0F0',
  }}>
    <span style={{ fontSize: '13px', color: '#6C757D', fontWeight: '500' }}>{label}</span>
    <span style={{ fontSize: '13px', color: '#212529', fontWeight: '600', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{value || '—'}</span>
  </div>
);

const DonorProfile = () => {
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/donors/me/profile')
      .then((r) => setDonor(r.data.donor))
      .catch(() => setDonor(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Donor Profile</h1>
      </div>
      <div style={styles.skeleton} />
    </div>
  );

  if (!donor) return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate('/donor')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <h1 style={styles.title}>Donor Profile</h1>
      </div>
      <div style={styles.emptyState}>
        <div style={styles.emptyIconWrap}>
          <FileText size={32} color="#007C91" />
        </div>
        <div style={styles.emptyTitle}>No profile found</div>
        <button onClick={() => navigate('/donor/register')} style={styles.registerBtn}>
          Complete Registration
        </button>
      </div>
    </div>
  );



  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate('/donor')} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
        <h1 style={styles.title}>Donor Profile</h1>
      </div>

      <div style={styles.content}>
        {/* Profile card */}
        <div style={styles.profileCard}>
          <div style={styles.avatarCircle}>
            <span style={styles.avatarInitial}>{donor.name?.[0]?.toUpperCase()}</span>
          </div>
          <div style={styles.profileName}>{donor.name}</div>
          <div style={styles.donorId}>ID: {donor.donorId}</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={styles.bloodBadge}>{donor.bloodGroup}</span>
            <StatusPill status={donor.eligibilityStatus} />
            <Badge donationCount={donor.donationCount} />
          </div>
        </div>

        {/* Milestone Recognition Card */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: 12,
          padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>Donor Recognition Milestone</div>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#007C91' }}>{donor.donationCount || 0} Donations</span>
          </div>
          <div style={{ fontSize: 12, color: '#6C757D' }}>
            {BADGE_DETAILS[getBadgeLevel(donor.donationCount)]?.description}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {['bronze', 'silver', 'gold', 'platinum'].map(tier => {
              const info = BADGE_DETAILS[tier];
              const reached = (donor.donationCount || 0) >= info.min;
              return (
                <div key={tier} style={{
                  flex: 1, textAlign: 'center', padding: '6px 4px',
                  borderRadius: 6, background: reached ? info.bg : '#F5F5F5',
                  border: `1px solid ${reached ? info.border : '#E0E0E0'}`,
                  opacity: reached ? 1 : 0.5,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: reached ? info.color : '#9E9E9E', textTransform: 'capitalize' }}>
                    {tier}
                  </div>
                  <div style={{ fontSize: 9, color: '#6C757D', marginTop: 2 }}>{info.min} units</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blockchain verification */}
        {donor.blockchainTxHash && (
          <div style={styles.chainCard}>
            <div style={styles.chainIcon}>
              <ShieldCheck size={20} color="#2E7D32" />
            </div>
            <div>
              <div style={styles.chainTitle}>Blockchain Verified Record</div>
              <div style={styles.chainHash}>{donor.blockchainTxHash}</div>
            </div>
          </div>
        )}

        {/* Flag reason */}
        {donor.isFlagged && donor.flagReason && (
          <div style={styles.flagCard}>
            <div style={styles.flagTitleWrap}>
              <AlertTriangle size={16} color="#D32F2F" />
              <div style={styles.flagTitle}>Account Notice</div>
            </div>
            <div style={styles.flagReason}>{donor.flagReason}</div>
          </div>
        )}

        {/* Details */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Medical & Eligibility Details</div>
          <InfoRow label="Age"          value={`${donor.age} years`} />
          <InfoRow label="Gender"       value={donor.gender?.charAt(0).toUpperCase() + donor.gender?.slice(1)} />
          <InfoRow label="Blood Group"  value={donor.bloodGroup} />
          <InfoRow label="Total Donations" value={donor.donationCount} />
          <InfoRow label="Last Donated" value={donor.lastDonationDate
            ? new Date(donor.lastDonationDate).toLocaleDateString('en-IN')
            : 'None'} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Contact & Location</div>
          <InfoRow label="Phone"   value={donor.phone} />
          <InfoRow label="Email"   value={donor.email} />
          <InfoRow label="Address" value={donor.address} />
          <InfoRow label="City"    value={donor.city} />
          <InfoRow label="Pincode" value={donor.pincode} />
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>System Metadata</div>
          <InfoRow label="Donor ID"  value={donor.donorId} />
          <InfoRow label="Status"    value={donor.eligibilityStatus} />
          <InfoRow label="Registered Date" value={new Date(donor.createdAt).toLocaleDateString('en-IN')} />
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;
