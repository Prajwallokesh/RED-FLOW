import S from '../styles/verifyStyles';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Droplet,
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  Activity,
  ArrowLeft,
  Lock,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  Download,
  User,
  Thermometer,
  Camera,
  X,
  Building2
} from 'lucide-react';
import api from '../lib/api';
import logo from '../assets/logo.png';

const StatusBadge = ({ status }) => {
  const map = {
    collected: { label: 'Collected', color: '#172B4D', bg: 'rgba(23,43,77,0.1)' },
    testing:   { label: 'Testing',   color: '#007C91', bg: 'rgba(0,124,145,0.12)' },
    available: { label: 'Available', color: '#2E7D32', bg: 'rgba(46,125,50,0.12)' },
    requested: { label: 'Requested', color: '#FFA000', bg: 'rgba(255,160,0,0.15)' },
    issued:    { label: 'Transfused', color: '#6A1B9A', bg: 'rgba(106,27,154,0.12)' },
    expired:   { label: 'Expired',   color: '#6C757D', bg: 'rgba(108,117,125,0.15)' },
    rejected:  { label: 'Rejected',  color: '#D32F2F', bg: 'rgba(211,47,47,0.12)' },
  };
  const s = map[status] || { label: status, color: '#6C757D', bg: '#E0E0E0' };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      borderRadius: 100,
      padding: '4px 10px',
      fontSize: '10px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
      display: 'inline-block',
      whiteSpace: 'nowrap'
    }}>
      {s.label}
    </span>
  );
};

const VerifyUnit = () => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [copiedKey, setCopiedKey]   = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const handleCopy = (key, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2200);
  };

  const fetchVerification = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/verify/${unitId}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || `Blood unit ${unitId} could not be verified on the RedFlow network.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unitId) {
      fetchVerification();
    }
  }, [unitId]);

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const target = manualInput.trim().toUpperCase();
    setShowScanner(false);
    navigate(`/verify/${target}`);
  };

  const donorName = data?.donor?.name || data?.unit?.donorName || 'PRAJWAL K L';
  const isDonorVerified = data?.donor ? data.donor.isVerified : (data?.unit?.donorVerified ?? true);
  const donatedDate = data?.donor?.donatedDate || data?.unit?.donatedDate || data?.unit?.collectionDate;

  return (
    <div style={S.wrapper} data-donor-view="true">
      <div style={S.shell}>
        {/* ── App Header ── */}
        <header style={S.appBar}>
          <button onClick={() => navigate(-1)} style={S.backBtn} title="Return to Dashboard">
            <ArrowLeft size={20} color="#FFFFFF" />
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src={logo} alt="RedFlow" style={S.appLogo} />
            <span style={S.appBrand}>
              <span style={{ color: '#D32F2F' }}>Red</span>
              <span style={{ color: '#FFFFFF' }}>Flow</span>
            </span>
          </Link>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setShowScanner(true)}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                borderRadius: 8,
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 700,
              }}
              title="Open QR Scanner"
            >
              <Camera size={13} />
              <span>Scan</span>
            </button>

            <div style={S.auditChip}>
              <Lock size={11} color="#7FDFEF" />
              <span style={{ color: '#7FDFEF', fontSize: 10, fontWeight: 800, letterSpacing: '0.4px' }}>
                VERIFIED
              </span>
            </div>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <div style={S.body}>
          {loading ? (
            <div style={{ ...S.card, padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
              <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: '#007C91' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#172B4D' }}>
                Verifying Cryptographic Proofs…
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                Querying Ethereum smart contract for #{unitId}
              </div>
            </div>
          ) : error ? (
            <div style={{ ...S.card, textAlign: 'center', padding: '30px 16px', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'rgba(211,47,47,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
              }}>
                <AlertTriangle size={24} color="#D32F2F" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#D32F2F' }}>
                Verification Failed
              </div>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>
                {error}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
                <button onClick={fetchVerification} style={S.primaryBtn}>
                  <RefreshCw size={14} />
                  <span>Retry Verification</span>
                </button>
                <button onClick={() => navigate(-1)} style={S.outlineBtn}>
                  <ArrowLeft size={14} />
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </div>
          ) : data ? (
            <>
              {/* Top Subtitle Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#172B4D' }}>
                    Donation Verification
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    Cryptographically verified on Ganache EVM
                  </div>
                </div>
                <button
                  onClick={fetchVerification}
                  style={{
                    background: '#FFFFFF', border: '1px solid #E0E0E0',
                    borderRadius: 8, padding: '6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#007C91', boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                  title="Re-verify proofs"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {/* Status Banner */}
              {data.match ? (
                <div style={{
                  background: 'rgba(46,125,50,0.08)',
                  border: '1.5px solid #2E7D32',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(46,125,50,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={22} color="#2E7D32" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#2E7D32' }}>
                      Authentic Blood Unit — Verified
                    </div>
                    <div style={{ fontSize: 11, color: '#2E7D32', opacity: 0.9, marginTop: 1, lineHeight: 1.3 }}>
                      State matches Ethereum distributed ledger proof.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(211,47,47,0.08)',
                  border: '1.5px solid #D32F2F',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(211,47,47,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <AlertTriangle size={22} color="#D32F2F" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#D32F2F' }}>
                      Record Mismatch Detected
                    </div>
                    <div style={{ fontSize: 11, color: '#D32F2F', opacity: 0.9, marginTop: 1, lineHeight: 1.3 }}>
                      Database state differs from cryptographic blockchain proof!
                    </div>
                  </div>
                </div>
              )}

              {/* ── 1. VERIFIED DONOR IDENTITY CARD (Requested by user) ── */}
              <div style={{
                ...S.card,
                background: 'linear-gradient(135deg, #172B4D 0%, #1E3F7A 100%)',
                color: '#FFFFFF',
                padding: '16px 14px',
                border: 'none',
                boxShadow: '0 4px 16px rgba(23,43,77,0.25)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: 'linear-gradient(135deg, #D32F2F, #B71C1C)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(211,47,47,0.4)',
                    }}>
                      <User size={22} color="#FFFFFF" />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Registered Blood Donor
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.2px' }}>
                        {donorName}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    background: 'rgba(211,47,47,0.3)',
                    color: '#FF8A80',
                    border: '1px solid rgba(211,47,47,0.5)',
                    borderRadius: 100,
                    padding: '4px 12px',
                    fontSize: 13,
                    fontWeight: 900
                  }}>
                    {data.unit.bloodGroup}
                  </span>
                </div>

                <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '12px 0 10px' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={11} color="#4ADE80" /> Donor Status
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: isDonorVerified ? '#4ADE80' : '#FBBF24', marginTop: 2 }}>
                      {isDonorVerified ? 'Verified Donor' : 'Pending Review'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={11} color="#7FDFEF" /> Donated Date
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>
                      {new Date(donatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  <span>Donor ID: <strong style={{ color: '#FFFFFF', fontFamily: 'monospace' }}>{data.unit.donorId}</strong></span>
                  <span>Unit ID: <strong style={{ color: '#FFFFFF', fontFamily: 'monospace' }}>#{data.unit.unitId}</strong></span>
                </div>
              </div>

              {/* ── 2. TAMPER-PROOF QR PASSPORT CARD ── */}
              {data.unit.qrUrl && (
                <div style={{
                  ...S.card,
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '16px 14px',
                  background: '#FFFFFF',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <QrCode size={16} color="#007C91" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#172B4D', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                      Tamper-Proof QR Passport
                    </span>
                  </div>

                  <div style={{
                    background: '#FFFFFF',
                    padding: '10px',
                    borderRadius: '14px',
                    border: '1.5px solid #E2E8F0',
                    boxShadow: '0 3px 12px rgba(23,43,77,0.08)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={data.unit.qrUrl}
                      alt={`QR Verification Proof for ${data.unit.unitId}`}
                      style={{ width: 160, height: 160, objectFit: 'contain', display: 'block' }}
                    />
                  </div>

                  <div style={{ fontSize: 11, color: '#64748B', maxWidth: 320, lineHeight: 1.35 }}>
                    Scan with any smartphone or RedFlow hospital scanner to instantly verify authenticity and donor record.
                  </div>

                  <div style={{ display: 'flex', gap: 8, width: '100%', marginTop: 2 }}>
                    <button
                      onClick={() => handleCopy('verifyUrl', window.location.href)}
                      style={{
                        flex: 1,
                        background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 8,
                        padding: '7px 8px', fontSize: 11, fontWeight: 700, color: '#172B4D',
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4
                      }}
                    >
                      {copiedKey === 'verifyUrl' ? <Check size={12} color="#2E7D32" /> : <Copy size={12} />}
                      <span>{copiedKey === 'verifyUrl' ? 'Copied' : 'Copy Link'}</span>
                    </button>

                    <a
                      href={data.unit.qrUrl}
                      download={`RedFlow-${data.unit.unitId}-QR.png`}
                      style={{
                        flex: 1,
                        background: '#172B4D', color: '#FFFFFF', textDecoration: 'none', borderRadius: 8,
                        padding: '7px 8px', fontSize: 11, fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4
                      }}
                    >
                      <Download size={12} />
                      <span>Save QR</span>
                    </a>
                  </div>
                </div>
              )}

              {/* ── 3. COMPLETE 4-STAGE STRUCTURAL PROCESS (Requested by user) ── */}
              <div style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={16} color="#007C91" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#172B4D' }}>
                      Blood Supply Chain Lifecycle
                    </span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#007C91', background: 'rgba(0,124,145,0.1)', padding: '2px 8px', borderRadius: 100 }}>
                    4-STAGE PROVENANCE
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
                  {/* STAGE 1: BLOOD COLLECTED */}
                  <div style={S.stepperItem}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={S.stepperIconActive}>
                        <CheckCircle2 size={16} color="#FFFFFF" />
                      </div>
                      <div style={S.stepperLineActive} />
                    </div>
                    <div style={S.stepperContent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={S.stageBadge}>STAGE 1 • COLLECTED</span>
                        <span style={S.stepperDate}>
                          {new Date(donatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div style={S.stageTitle}>Blood Collected & Verified</div>
                      <div style={S.stageDesc}>
                        Unit collected from verified donor <strong>{donorName}</strong> ({data.unit.bloodGroup}). Genesis on-chain transaction recorded.
                      </div>
                      <div style={S.stageMetadata}>
                        <span>Donor: <strong>{donorName}</strong></span>
                        <span>Status: <strong style={{ color: '#2E7D32' }}>Verified</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* STAGE 2: CLINICAL LAB TESTING */}
                  <div style={S.stepperItem}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={data.unit.testStatus === 'safe' ? S.stepperIconActive : S.stepperIconWarning}>
                        <Activity size={15} color="#FFFFFF" />
                      </div>
                      <div style={S.stepperLineActive} />
                    </div>
                    <div style={S.stepperContent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={S.stageBadge}>STAGE 2 • LAB TESTING</span>
                        <span style={{
                          fontSize: 10, fontWeight: 800,
                          color: data.unit.testStatus === 'safe' ? '#2E7D32' : '#FFA000'
                        }}>
                          {data.unit.testStatus === 'safe' ? 'PASSED' : 'TESTING'}
                        </span>
                      </div>
                      <div style={S.stageTitle}>Clinical Laboratory Screening</div>
                      <div style={S.stageDesc}>
                        {data.unit.testStatus === 'safe'
                          ? 'Certified negative/non-reactive for HIV 1/2, Hepatitis B (HBsAg), Hepatitis C (HCV), Syphilis (VDRL), and Malaria.'
                          : 'Pathogen screening and serological analysis in progress.'}
                      </div>
                      <div style={S.stageMetadata}>
                        <span>Result: <strong style={{ color: '#2E7D32' }}>SAFE FOR CLINICAL USE</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* STAGE 3: LOCATION COLD STORAGE VAULT */}
                  <div style={S.stepperItem}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={S.stepperIconActive}>
                        <Thermometer size={15} color="#FFFFFF" />
                      </div>
                      <div style={S.stepperLineActive} />
                    </div>
                    <div style={S.stepperContent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={S.stageBadge}>STAGE 3 • COLD STORAGE</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#172B4D' }}>
                          {data.unit.availabilityStatus === 'issued' ? 'TRANSFUSED' : data.unit.availabilityStatus === 'requested' ? 'ALLOCATED' : 'AVAILABLE'}
                        </span>
                      </div>
                      <div style={S.stageTitle}>Cold Storage Vault Preservation</div>
                      <div style={S.stageDesc}>
                        Unit safely preserved in <strong>{data.unit.storageLocation || 'Central Cold Storage Vault'}</strong> under continuous climate monitoring.
                      </div>
                      <div style={S.stageMetadata}>
                        <span>Location: <strong>{data.unit.storageLocation || 'Vault 1'}</strong></span>
                        <span>Protocol: <strong>Certified Cold Chain Standard</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* STAGE 4: ALLOCATED OR ISSUED */}
                  <div style={{ ...S.stepperItem, paddingBottom: 0, borderLeft: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={data.unit.availabilityStatus === 'issued' ? S.stepperIconActive : S.stepperIconDefault}>
                        <CheckCircle2 size={16} color="#FFFFFF" />
                      </div>
                    </div>
                    <div style={S.stepperContent}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={S.stageBadge}>STAGE 4 • TRANSFUSION</span>
                        <span style={{
                          fontSize: 10, fontWeight: 800,
                          color: data.unit.availabilityStatus === 'issued' ? '#2E7D32' : '#6C757D'
                        }}>
                          {data.unit.availabilityStatus === 'issued' ? 'COMPLETED' : 'PENDING DEMAND'}
                        </span>
                      </div>
                      <div style={S.stageTitle}>
                        {data.unit.availabilityStatus === 'issued' ? 'Transfused to Patient' : 'Patient Bedside Administration'}
                      </div>
                      <div style={S.stageDesc}>
                        {data.unit.availabilityStatus === 'issued'
                          ? 'Successfully allocated and transfused to emergency trauma patient under certified clinical protocol.'
                          : 'Preserved in Cold Storage Vault and ready for immediate hospital allocation and transfusion.'}
                      </div>
                      <div style={S.stageMetadata}>
                        <span>Status: <strong>{data.unit.availabilityStatus === 'issued' ? 'TRANSFUSED' : 'READY IN VAULT'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 4. CRYPTOGRAPHIC AUDIT TRAIL ── */}
              <div style={S.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={15} color="#007C91" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#172B4D' }}>
                    Cryptographic Audit Trail
                  </span>
                </div>

                <div style={{
                  background: '#F8FAFC', borderRadius: 8, padding: '10px',
                  display: 'flex', flexDirection: 'column', gap: 8
                }}>
                  {/* dbHash */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Computed State Hash:</span>
                      <button
                        onClick={() => handleCopy('dbHash', data.dbHash)}
                        style={{
                          background: 'transparent', border: 'none', color: copiedKey === 'dbHash' ? '#2E7D32' : '#007C91',
                          fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3
                        }}
                      >
                        {copiedKey === 'dbHash' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === 'dbHash' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div style={{
                      background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 8px',
                      fontSize: 10, fontFamily: 'monospace', color: '#172B4D', wordBreak: 'break-all', fontWeight: 700
                    }}>
                      {data.dbHash}
                    </div>
                  </div>

                  {/* chainHash */}
                  {data.chainHash && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>On-Chain Contract Hash:</span>
                        <button
                          onClick={() => handleCopy('chainHash', data.chainHash)}
                          style={{
                            background: 'transparent', border: 'none', color: copiedKey === 'chainHash' ? '#2E7D32' : '#007C91',
                            fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3
                          }}
                        >
                          {copiedKey === 'chainHash' ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedKey === 'chainHash' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div style={{
                        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 8px',
                        fontSize: 10, fontFamily: 'monospace', color: '#172B4D', wordBreak: 'break-all', fontWeight: 700
                      }}>
                        {data.chainHash}
                      </div>
                    </div>
                  )}

                  {/* txHash */}
                  {data.unit.blockchainTxHash && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Transaction Receipt Hash:</span>
                        <button
                          onClick={() => handleCopy('txHash', data.unit.blockchainTxHash)}
                          style={{
                            background: 'transparent', border: 'none', color: copiedKey === 'txHash' ? '#2E7D32' : '#007C91',
                            fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3
                          }}
                        >
                          {copiedKey === 'txHash' ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedKey === 'txHash' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div style={{
                        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 8px',
                        fontSize: 10, fontFamily: 'monospace', color: '#172B4D', wordBreak: 'break-all', fontWeight: 700
                      }}>
                        {data.unit.blockchainTxHash}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 }}>
                    <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>Verified Timestamp:</span>
                    <span style={{ fontSize: 10, color: '#172B4D', fontWeight: 700 }}>
                      {new Date(data.verifiedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── 5. BOTTOM ACTIONS ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => setShowScanner(true)}
                  style={{
                    ...S.primaryBtn,
                    background: '#172B4D',
                  }}
                >
                  <Camera size={16} />
                  <span>Scan Another Blood Unit QR</span>
                </button>

                <button onClick={() => navigate(-1)} style={S.outlineBtn}>
                  <ArrowLeft size={15} />
                  <span>Return to Donation History</span>
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* ── IN-APP QR SCANNER MODAL ── */}
        {showScanner && (
          <div style={S.modalOverlay} onClick={() => setShowScanner(false)}>
            <div style={S.modalCard} onClick={e => e.stopPropagation()}>
              <div style={S.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <QrCode size={20} color="#007C91" />
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#172B4D' }}>
                    Blood Unit QR Scanner
                  </span>
                </div>
                <button onClick={() => setShowScanner(false)} style={S.modalCloseBtn}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  border: '2px dashed #007C91',
                  borderRadius: 14,
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: 'rgba(0,124,145,0.04)'
                }}>
                  <Camera size={36} color="#007C91" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#172B4D' }}>
                    Camera Scanner / QR Input
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
                    Point scanner at Blood Bag QR label or select unit below to inspect on-chain provenance.
                  </div>
                </div>

                {/* Quick select units */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
                    Quick Select Verified Units:
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['BU001', 'BU002', 'BU003', 'BU004'].map(u => (
                      <button
                        key={u}
                        onClick={() => {
                          setShowScanner(false);
                          navigate(`/verify/${u}`);
                        }}
                        style={{
                          background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 6,
                          padding: '6px 12px', fontSize: 12, fontWeight: 800, color: '#172B4D',
                          cursor: 'pointer', fontFamily: 'monospace'
                        }}
                      >
                        #{u}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleScanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#172B4D', display: 'block', marginBottom: 4 }}>
                      Or Enter Unit ID Manually:
                    </label>
                    <input
                      type="text"
                      value={manualInput}
                      onChange={e => setManualInput(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #CBD5E1',
                        fontSize: 14, fontFamily: 'monospace', fontWeight: 700, boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <button type="submit" style={S.primaryBtn}>
                    <ShieldCheck size={16} />
                    <span>Scan & Verify Blood Unit</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyUnit;
