import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, CheckCircle2,
  RefreshCw, Database, Flame, Lock, Key, Eye, EyeOff, ArrowLeft,
  Copy, Check, Undo2, Search, Activity, Scan
} from 'lucide-react';
import api from '../lib/api';
import hubStyles from '../styles/hubStyles';

const SECRET_KEY = 'RF2026';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REDFLOW — BLOCKCHAIN AUDIT HUB & IMMUTABILITY INSPECTOR
 * ═══════════════════════════════════════════════════════════════════════════
 * Demonstrates how RedFlow pairs an off-chain MongoDB database with an
 * immutable Ethereum smart contract ledger (Ganache localnet).
 * 
 * Key Principles:
 * 1. Two-Tier Architecture:
 *    - MongoDB stores live clinical documents and donor data.
 *    - Ethereum ledger stores a permanent Keccak-256 cryptographic hash.
 * 2. Real-Time Tamper Detection:
 *    - Any unauthorized change in MongoDB instantly alters its hash.
 *    - The system flags a mismatch against the immutable on-chain hash.
 * 3. Cryptographic Auditing:
 *    - "Simulate Tamper Check" tests real-time hash mismatch detection.
 *    - "Restore Original Data" resets the state to restore cryptographic match.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const BlockchainHub = () => {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked]     = useState(() => sessionStorage.getItem('rf_blockchain_hub_key') === SECRET_KEY);
  const [inputKey, setInputKey]         = useState('');
  const [showKey, setShowKey]           = useState(false);
  const [keyError, setKeyError]         = useState('');

  const [activeTab, setActiveTab]       = useState('immutability');
  const [summary, setSummary]           = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [records, setRecords]           = useState({ bloodUnits: [], donors: [] });
  const [selectedId, setSelectedId]     = useState('');
  const [verification, setVerification] = useState(null);
  const [alerts, setAlerts]             = useState([]);
  const [logs, setLogs]                 = useState([]);
  const [loading, setLoading]           = useState(false);
  const [txLoading, setTxLoading]       = useState(false);
  const [tampering, setTampering]       = useState(false);
  const [restoring, setRestoring]       = useState(false);
  const [scanning, setScanning]         = useState(false);
  const [copiedHash, setCopiedHash]     = useState(null);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery]   = useState('');
  const [txVerification, setTxVerification] = useState({});
  const [verifyingTx, setVerifyingTx]   = useState({});
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    if (inputKey.trim() === SECRET_KEY) {
      sessionStorage.setItem('rf_blockchain_hub_key', SECRET_KEY);
      setIsUnlocked(true);
      setKeyError('');
      showToast('Access Granted. Cryptographic Hub Vault Unlocked.');
    } else {
      setKeyError('Invalid Authorization Key. Access restricted to authorized personnel.');
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('rf_blockchain_hub_key');
    setIsUnlocked(false);
    setInputKey('');
    setKeyError('');
    showToast('Blockchain Hub Locked.');
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  // Fetch single record verification from backend
  const fetchVerification = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get('/blockchain/verify/' + id);
      setVerification(res.data);
      api.get('/blockchain/alerts').then(r => setAlerts(r.data.alerts || [])).catch(() => {});
      api.get('/blockchain/verification-logs').then(r => setLogs(r.data.logs || [])).catch(() => {});
    } catch (err) {
      showToast(err.response?.data?.error || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data loader on mount
  const loadInitialData = useCallback(async () => {
    try {
      const [sumRes, alertRes, recRes, txRes, logRes] = await Promise.allSettled([
        api.get('/blockchain/summary'),
        api.get('/blockchain/alerts'),
        api.get('/blockchain/records'),
        api.get('/blockchain/transactions?limit=100'),
        api.get('/blockchain/verification-logs')
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
      if (alertRes.status === 'fulfilled') setAlerts(alertRes.value.data.alerts || []);
      if (recRes.status === 'fulfilled') {
        const recData = recRes.value.data || { bloodUnits: [], donors: [] };
        setRecords(recData);
        const initialId = recData.bloodUnits?.[0]?.id || recData.donors?.[0]?.id || '';
        if (initialId) {
          setSelectedId(initialId);
          fetchVerification(initialId);
        }
      }
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data.transactions || []);
      if (logRes.status === 'fulfilled') setLogs(logRes.value.data.logs || []);
    } catch (err) {
      console.error('Initial blockchain load error:', err);
    }
  }, [fetchVerification]);

  useEffect(() => {
    if (isUnlocked) {
      loadInitialData();
    }
  }, [isUnlocked, loadInitialData]);

  const handleSelectRecord = (id) => {
    setSelectedId(id);
    fetchVerification(id);
  };

  // Simulate Tamper Check (Real-Time Discrepancy & Watchdog Test)
  const handleTamperTest = async () => {
    if (!selectedId) return;
    setTampering(true);
    try {
      const res = await api.post('/blockchain/tamper-test/' + selectedId);
      setVerification(res.data.verification);
      const [alertRes, logRes, sumRes] = await Promise.all([
        api.get('/blockchain/alerts'),
        api.get('/blockchain/verification-logs'),
        api.get('/blockchain/summary')
      ]);
      setAlerts(alertRes.data?.alerts || []);
      setLogs(logRes.data?.logs || []);
      setSummary(sumRes.data);
      showToast('Audit integrity simulated: Field altered in MongoDB. Cryptographic mismatch flagged!', 'error');
    } catch (err) {
      showToast(err.response?.data?.error || 'Tamper test failed', 'error');
    } finally {
      setTampering(false);
    }
  };

  // Restore modified record back to genuine state
  const handleRestoreRecord = async (idToRestore) => {
    const targetId = typeof idToRestore === 'string' ? idToRestore : selectedId;
    if (!targetId) return;
    setRestoring(true);
    try {
      const res = await api.post('/blockchain/restore/' + targetId);
      if (targetId === selectedId) {
        setVerification(res.data.verification);
      } else {
        await fetchVerification(selectedId);
      }
      const [alertRes, logRes, sumRes] = await Promise.all([
        api.get('/blockchain/alerts'),
        api.get('/blockchain/verification-logs'),
        api.get('/blockchain/summary')
      ]);
      setAlerts(alertRes.data?.alerts || []);
      setLogs(logRes.data?.logs || []);
      setSummary(sumRes.data);
      showToast('Database record restored. Hash matches Blockchain ledger 100%!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Restore failed', 'error');
    } finally {
      setRestoring(false);
    }
  };

  // Restore all tampered records at once
  const handleRestoreAll = async () => {
    setRestoring(true);
    try {
      const res = await api.post('/blockchain/restore-all');
      setAlerts([]);
      if (selectedId) await fetchVerification(selectedId);
      const [sumRes, logRes] = await Promise.all([
        api.get('/blockchain/summary'),
        api.get('/blockchain/verification-logs')
      ]);
      setSummary(sumRes.data);
      setLogs(logRes.data?.logs || []);
      showToast(res.data?.message || 'All records restored to original blockchain-verified state!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Restore failed', 'error');
    } finally {
      setRestoring(false);
    }
  };

  // Batch audit all records
  const handleScanAll = async () => {
    setScanning(true);
    try {
      const res = await api.post('/blockchain/scan-all');
      const [alertRes, sumRes] = await Promise.all([
        api.get('/blockchain/alerts'),
        api.get('/blockchain/summary')
      ]);
      setAlerts(alertRes.data?.alerts || []);
      setSummary(sumRes.data);
      if (selectedId) fetchVerification(selectedId);
      if (res.data.tamperedCount > 0) {
        showToast(`Audit complete: ${res.data.tamperedCount} tampered record(s) detected!`, 'error');
      } else {
        showToast(`Audit complete: All ${res.data.totalScanned} records are 100% genuine and intact.`);
      }
    } catch (_) {
      showToast('Database audit scan failed', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleRefreshAll = async () => {
    try {
      const [sumRes, alertRes, txRes, logRes] = await Promise.all([
        api.get('/blockchain/summary'),
        api.get('/blockchain/alerts'),
        api.get('/blockchain/transactions?limit=100'),
        api.get('/blockchain/verification-logs')
      ]);
      setSummary(sumRes.data);
      setAlerts(alertRes.data.alerts || []);
      setTransactions(txRes.data.transactions || []);
      setLogs(logRes.data.logs || []);
      if (selectedId) fetchVerification(selectedId);
      showToast('Blockchain telemetry synced with EVM node.');
    } catch (_) {}
  };

  // Verify a single transaction directly on the EVM node
  const verifyTxDirect = async (txHash, txNumber) => {
    setVerifyingTx(prev => ({ ...prev, [txNumber]: true }));
    try {
      const res = await api.get('/blockchain/verify-tx/' + txHash);
      setTxVerification(prev => ({ ...prev, [txNumber]: res.data }));
    } catch (err) {
      setTxVerification(prev => ({
        ...prev,
        [txNumber]: { verified: false, error: err.response?.data?.error || err.message },
      }));
    } finally {
      setVerifyingTx(prev => ({ ...prev, [txNumber]: false }));
    }
  };

  const isTampered = Boolean(verification && !verification.hashMatch);
  const activeAlerts = Array.isArray(alerts) ? alerts.filter(a => a.status === 'ACTIVE') : [];

  const filteredTxs = (Array.isArray(transactions) ? transactions : []).filter(tx => {
    if (filterAction !== 'ALL' && tx.action !== filterAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (tx.entityId || '').toLowerCase().includes(q) ||
        (tx.txHash || '').toLowerCase().includes(q) ||
        (tx.description || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action) => {
    const map = {
      verifyDonor:            { label: 'Donor Verified',    bg: '#ECFDF5', color: '#047857' },
      flagDonor:              { label: 'Donor Flagged',     bg: '#FEF2F2', color: '#B91C1C' },
      addBloodUnit:           { label: 'Unit Minted',       bg: '#F0F9FF', color: '#0369A1' },
      updateBloodUnitStatus:  { label: 'Status Shift',      bg: '#F5F3FF', color: '#6D28D9' },
    };
    const s = map[action] || { label: action, bg: '#F1F5F9', color: '#475569' };
    return (
      <span style={{ background: s.bg, color: s.color, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
        {s.label}
      </span>
    );
  };

  // ── Cryptographic Security Gate Screen (Master Key RF2026) ──────────────────
  if (!isUnlocked) {
    return (
      <div style={hubStyles.gateWrapper}>
        {toast && (
          <div style={{ ...hubStyles.toast, background: toast.type === 'error' ? '#DC2626' : '#059669' }}>
            {toast.msg}
          </div>
        )}

        <div style={hubStyles.gateCard}>
          <div style={hubStyles.gateIconCircle}>
            <Lock size={26} color="#0284C7" />
          </div>

          <div style={hubStyles.gateBadge}>
            <ShieldCheck size={12} />
            <span>Cryptographic Access Gate</span>
          </div>

          <h2 style={hubStyles.gateTitle}>Blockchain Audit Hub</h2>
          <p style={hubStyles.gateSub}>
            Authorized inspection console for smart contract immutability, cryptographic proofs, and real-time tamper detection.
          </p>

          {/* Master Authorization Vault Key Badge */}
          <div style={hubStyles.hintBox}>
            <span style={hubStyles.hintText}>Master Authorization Key:</span>
            <span style={hubStyles.hintAction}>RF2026</span>
          </div>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter master authorization key..."
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  if (keyError) setKeyError('');
                }}
                autoFocus
                style={{
                  ...hubStyles.gateInput,
                  borderColor: keyError ? '#EF4444' : '#CBD5E1',
                  letterSpacing: showKey ? '2px' : '3px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={hubStyles.eyeBtn}
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {keyError && (
              <div style={hubStyles.gateError}>
                <AlertTriangle size={13} />
                <span>{keyError}</span>
              </div>
            )}

            <button type="submit" style={hubStyles.gateSubmitBtn}>
              <Key size={16} />
              <span>Unlock Hub Vault</span>
            </button>
          </form>

          <div style={hubStyles.gateFooter}>
            <button onClick={() => navigate(-1)} style={hubStyles.backBtn}>
              <ArrowLeft size={13} />
              <span>Back to Previous Page</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={hubStyles.container}>
      {toast && (
        <div style={{ ...hubStyles.toast, background: toast.type === 'error' ? '#DC2626' : '#059669' }}>
          {toast.msg}
        </div>
      )}

      {/* ── Top Bar ── */}
      <div style={hubStyles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={hubStyles.topIcon}>
            <ShieldCheck size={22} color="#0284C7" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={hubStyles.topTitle}>Blockchain Audit Hub</h1>
              <span style={hubStyles.livePill}>
                <span style={hubStyles.pulseDot} />
                EVM Localnet (Chain 1337)
              </span>
            </div>
            <div style={hubStyles.topContract}>
              <span>Smart Contract:</span>
              <code style={hubStyles.contractCode}>
                {summary?.smartContractAddress || '0xA9908F00244CE373574c86F373A8e90637F557BE'}
              </code>
              <button
                onClick={() => copyToClipboard(summary?.smartContractAddress || '0xA9908F00244CE373574c86F373A8e90637F557BE', 'sc')}
                style={hubStyles.copyMini}
                title="Copy Smart Contract Address"
              >
                {copiedHash === 'sc' ? <Check size={12} color="#16A34A" /> : <Copy size={12} color="#64748B" />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleScanAll} disabled={scanning} style={hubStyles.btnSecondary} title="Audit every record in database against blockchain">
            <Scan size={14} style={{ animation: scanning ? 'spin 1s linear infinite' : 'none' }} />
            <span>{scanning ? 'Auditing DB...' : 'Audit Whole DB'}</span>
          </button>

          <button onClick={handleRefreshAll} style={hubStyles.btnPrimary} title="Sync latest on-chain transactions">
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>

          <button onClick={handleLock} style={hubStyles.btnLock} title="Lock Blockchain Hub">
            <Lock size={13} />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* ── Active Tamper Alert Banner ── */}
      {activeAlerts.length > 0 && (
        <div style={hubStyles.alertBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} color="#DC2626" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#DC2626' }}>
                CRITICAL INTEGRITY ALARM: Unauthorized Tampering Detected!
              </div>
              <div style={{ fontSize: 12, color: '#991B1B', marginTop: 2 }}>
                Record #{activeAlerts.map(a => a.recordId).join(', ')} was modified in the off-chain database without blockchain consensus.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                handleSelectRecord(activeAlerts[0].recordId);
                setActiveTab('immutability');
              }}
              style={hubStyles.btnAlertInspect}
              title="Inspect details of this tampered record"
            >
              Inspect Record
            </button>
            <button
              onClick={() => handleRestoreRecord(activeAlerts[0].recordId)}
              disabled={restoring}
              style={hubStyles.btnAlertRestore}
              title="Restore this record back to match the blockchain hash"
            >
              <Undo2 size={13} />
              <span>{restoring ? 'Restoring...' : 'Restore Record'}</span>
            </button>
            {activeAlerts.length > 1 && (
              <button
                onClick={handleRestoreAll}
                disabled={restoring}
                style={hubStyles.btnAlertRestoreAll}
                title="Restore all tampered records back to match the blockchain hash"
              >
                <Undo2 size={13} />
                <span>Restore All ({activeAlerts.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 4 Telemetry Metric Tiles ── */}
      <div style={hubStyles.metricGrid}>
        <div style={hubStyles.metricCard}>
          <span style={hubStyles.metricLabel}>LATEST EVM BLOCK</span>
          <span style={hubStyles.metricVal}>#{summary?.latestBlock ?? 1}</span>
          <span style={hubStyles.metricSub}>Mined on local Ethereum network</span>
        </div>
        <div style={hubStyles.metricCard}>
          <span style={hubStyles.metricLabel}>LEDGER TRANSACTIONS</span>
          <span style={{ ...hubStyles.metricVal, color: '#0284C7' }}>
            {summary?.totalTransactions ?? transactions.length}
          </span>
          <span style={hubStyles.metricSub}>Immutable audit records</span>
        </div>
        <div style={hubStyles.metricCard}>
          <span style={hubStyles.metricLabel}>NETWORK CONSENSUS</span>
          <span style={{ ...hubStyles.metricVal, color: '#059669', fontSize: 17 }}>
            Ganache Synced
          </span>
          <span style={hubStyles.metricSub}>Smart contract active</span>
        </div>
        <div style={hubStyles.metricCard}>
          <span style={hubStyles.metricLabel}>OVERALL INTEGRITY</span>
          <span style={{
            ...hubStyles.metricVal,
            color: activeAlerts.length > 0 ? '#DC2626' : '#059669',
            fontSize: 17
          }}>
            {activeAlerts.length > 0 ? `${activeAlerts.length} Tamper Issue(s)` : '100% Intact'}
          </span>
          <span style={hubStyles.metricSub}>
            {activeAlerts.length > 0 ? 'Mismatch caught' : 'All hashes match on-chain'}
          </span>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div style={hubStyles.tabRow}>
        <button
          onClick={() => setActiveTab('immutability')}
          style={{
            ...hubStyles.tabItem,
            ...(activeTab === 'immutability' ? hubStyles.tabItemActive : {})
          }}
        >
          <ShieldCheck size={15} />
          <span>Immutability & Tamper Inspector</span>
          {isTampered && <span style={hubStyles.tamperDot} />}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            ...hubStyles.tabItem,
            ...(activeTab === 'history' ? hubStyles.tabItemActive : {})
          }}
        >
          <Activity size={15} />
          <span>Transaction Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* ── TAB 1: IMMUTABILITY PROOFS ── */}
      {activeTab === 'immutability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Record Selector Bar */}
          <div style={hubStyles.selectorBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Select Record to Verify:</span>
              {(records.bloodUnits?.length > 0 || records.donors?.length > 0) ? (
                <select
                  value={selectedId}
                  onChange={(e) => handleSelectRecord(e.target.value)}
                  style={hubStyles.recordSelect}
                >
                  {records.bloodUnits?.length > 0 && (
                    <optgroup label="🩸 Blood Units">
                      {records.bloodUnits.map(u => (
                        <option key={u.id} value={u.id}>{u.label}</option>
                      ))}
                    </optgroup>
                  )}
                  {records.donors?.length > 0 && (
                    <optgroup label="👤 Donors">
                      {records.donors.map(d => (
                        <option key={d.id} value={d.id}>{d.label}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              ) : (
                <span style={{ fontSize: 12, color: '#94A3B8' }}>No records in database yet. Register a donor or collect a blood unit.</span>
              )}
            </div>

            {selectedId && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => fetchVerification(selectedId)}
                  disabled={loading}
                  style={hubStyles.btnPrimary}
                  title="Recalculate hash from database and compare with blockchain"
                >
                  <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{loading ? 'Comparing...' : 'Verify Hash'}</span>
                </button>

                {isTampered ? (
                  <button onClick={handleRestoreRecord} disabled={restoring} style={hubStyles.btnSuccess} title="Revert database modification to restore cryptographic agreement">
                    <Undo2 size={13} />
                    <span>Restore Original Data</span>
                  </button>
                ) : (
                  <button
                    onClick={handleTamperTest}
                    disabled={tampering}
                    style={hubStyles.btnDanger}
                    title="Simulate unauthorized database modification to verify real-time cryptographic alarm triggering"
                  >
                    <Flame size={13} />
                    <span>Simulate Tamper Check</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Verdict Card */}
          {verification && (
            <div style={{
              ...hubStyles.verdictCard,
              background: isTampered ? '#FEF2F2' : '#F0FDF4',
              borderColor: isTampered ? '#F87171' : '#86EFAC',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isTampered ? <AlertTriangle size={24} color="#DC2626" /> : <CheckCircle2 size={24} color="#16A34A" />}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: isTampered ? '#DC2626' : '#166534' }}>
                    {isTampered ? 'HASH MISMATCH — UNAUTHORIZED TAMPERING DETECTED!' : 'CRYPTOGRAPHIC INTEGRITY CONFIRMED — DATA UNTOUCHED'}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                    {verification.explanation}
                  </div>
                </div>
              </div>
              <span style={{
                background: isTampered ? '#DC2626' : '#16A34A',
                color: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase'
              }}>
                {verification.integrityStatus}
              </span>
            </div>
          )}

          {/* Side-by-Side Dual Hash Inspection */}
          {verification && (
            <div style={hubStyles.dualGrid}>
              {/* Off-chain DB */}
              <div style={{ ...hubStyles.card, borderColor: isTampered ? '#F87171' : '#E2E8F0' }}>
                <div style={{ ...hubStyles.cardHead, background: isTampered ? '#FEF2F2' : '#FAFAFA' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Database size={15} color="#0284C7" />
                    <span style={hubStyles.cardTitle}>Off-Chain Database State (MongoDB)</span>
                  </div>
                  <span style={{
                    ...hubStyles.tagMuted,
                    background: isTampered ? '#FEE2E2' : '#F1F5F9',
                    color: isTampered ? '#DC2626' : '#64748B'
                  }}>
                    {isTampered ? '⚠️ TAMPERED / MODIFIED' : 'LIVE MONGO STATE'}
                  </span>
                </div>
                <div style={hubStyles.cardBody}>
                  <div style={hubStyles.kvPair}>
                    <span style={hubStyles.kLabel}>Record Identifier:</span>
                    <span style={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>
                      #{verification.recordId} ({verification.recordType})
                    </span>
                  </div>

                  <div style={hubStyles.kvPair}>
                    <span style={hubStyles.kLabel}>Current Keccak-256 Calculated Hash:</span>
                    <div style={{ ...hubStyles.hashBox, borderColor: isTampered ? '#FCA5A5' : '#E2E8F0' }}>
                      <code style={{ ...hubStyles.hashText, color: isTampered ? '#DC2626' : '#0F172A' }}>
                        {verification.currentHash}
                      </code>
                      <button onClick={() => copyToClipboard(verification.currentHash, 'cHash')} style={hubStyles.copyMini} title="Copy Hash">
                        {copiedHash === 'cHash' ? <Check size={13} color="#16A34A" /> : <Copy size={13} color="#64748B" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* On-chain Blockchain */}
              <div style={hubStyles.card}>
                <div style={hubStyles.cardHead}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={15} color="#7C3AED" />
                    <span style={hubStyles.cardTitle}>Immutable Blockchain Ledger (Smart Contract)</span>
                  </div>
                  <span style={{ ...hubStyles.tagMuted, color: '#7C3AED', background: '#F5F3FF' }}>
                    ON-CHAIN COMMITMENT
                  </span>
                </div>
                <div style={hubStyles.cardBody}>
                  <div style={hubStyles.kvPair}>
                    <span style={hubStyles.kLabel}>Mined Block & Status:</span>
                    <span style={{ fontWeight: 800, color: '#7C3AED', fontSize: 13 }}>
                      Block #{verification.blockNumber || 1} • {verification.status || 'CONFIRMED ON EVM'}
                    </span>
                  </div>

                  <div style={hubStyles.kvPair}>
                    <span style={hubStyles.kLabel}>Permanent Smart Contract Hash:</span>
                    <div style={hubStyles.hashBox}>
                      <code style={{ ...hubStyles.hashText, color: '#7C3AED' }}>
                        {verification.blockchainHash}
                      </code>
                      <button onClick={() => copyToClipboard(verification.blockchainHash, 'bHash')} style={hubStyles.copyMini} title="Copy Hash">
                        {copiedHash === 'bHash' ? <Check size={13} color="#16A34A" /> : <Copy size={13} color="#64748B" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs Table */}
          <div style={hubStyles.card}>
            <div style={hubStyles.cardHead}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={15} color="#64748B" />
                <span style={hubStyles.cardTitle}>Recent Verification Audit Logs</span>
              </div>
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{logs.length} Total Verification Entries</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={hubStyles.table}>
                <thead>
                  <tr style={hubStyles.thRow}>
                    <th style={hubStyles.th}>Timestamp</th>
                    <th style={hubStyles.th}>Record ID</th>
                    <th style={hubStyles.th}>On-Chain Hash</th>
                    <th style={hubStyles.th}>Database Hash</th>
                    <th style={hubStyles.th}>Integrity Result</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#94A3B8' }}>
                        No audit logs yet. Click &apos;Verify Hash&apos; above to log an integrity check.
                      </td>
                    </tr>
                  ) : (
                    logs.slice(0, 6).map(l => (
                      <tr key={l.id || l.timestamp} style={hubStyles.tr}>
                        <td style={hubStyles.td}>{new Date(l.timestamp).toLocaleTimeString('en-IN')}</td>
                        <td style={{ ...hubStyles.td, fontWeight: 800 }}>#{l.recordId}</td>
                        <td style={{ ...hubStyles.td, fontFamily: 'monospace', fontSize: 11, color: '#7C3AED' }}>
                          {l.blockchainHash ? l.blockchainHash.substring(0, 14) + '...' : '—'}
                        </td>
                        <td style={{ ...hubStyles.td, fontFamily: 'monospace', fontSize: 11, color: l.hashMatch ? '#059669' : '#DC2626' }}>
                          {l.currentHash ? l.currentHash.substring(0, 14) + '...' : '—'}
                        </td>
                        <td style={hubStyles.td}>
                          <span style={{
                            background: l.hashMatch ? '#ECFDF5' : '#FEF2F2',
                            color: l.hashMatch ? '#047857' : '#B91C1C',
                            padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800
                          }}>
                            {l.integrityStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TRANSACTION LEDGER ── */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filters Bar */}
          <div style={hubStyles.filterBar}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Transactions' },
                { id: 'addBloodUnit', label: '🩸 Blood Units' },
                { id: 'updateBloodUnitStatus', label: '⚡ Status Shifts' },
                { id: 'verifyDonor', label: '👤 Donors' },
                { id: 'flagDonor', label: '🚩 Flagged' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterAction(f.id)}
                  style={{
                    ...hubStyles.chip,
                    ...(filterAction === f.id ? hubStyles.chipActive : {})
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={hubStyles.searchContainer}>
              <Search size={14} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search by entity, tx hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={hubStyles.searchInput}
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div style={hubStyles.card}>
            <div style={{ overflowX: 'auto' }}>
              <table style={hubStyles.table}>
                <thead>
                  <tr style={hubStyles.thRow}>
                    <th style={hubStyles.th}>#</th>
                    <th style={hubStyles.th}>Action</th>
                    <th style={hubStyles.th}>Entity</th>
                    <th style={hubStyles.th}>Clinical Description</th>
                    <th style={hubStyles.th}>Block</th>
                    <th style={hubStyles.th}>Transaction Hash</th>
                    <th style={hubStyles.th}>Date & Time</th>
                    <th style={hubStyles.th}>On-Chain Proof</th>
                  </tr>
                </thead>
                <tbody>
                  {txLoading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>
                        Loading transaction ledger from Ethereum node...
                      </td>
                    </tr>
                  ) : filteredTxs.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>
                        No transactions recorded on ledger yet.
                      </td>
                    </tr>
                  ) : (
                    filteredTxs.map(tx => {
                      const vRes = txVerification[tx.txNumber];
                      const isVerifying = Boolean(verifyingTx[tx.txNumber]);

                      return (
                        <tr key={tx.txHash || tx.txNumber} style={hubStyles.tr}>
                          <td style={{ ...hubStyles.td, fontWeight: 800, color: '#0F172A' }}>#{tx.txNumber}</td>
                          <td style={hubStyles.td}>{getActionBadge(tx.action)}</td>
                          <td style={{ ...hubStyles.td, fontWeight: 700, fontFamily: 'monospace', color: '#0284C7' }}>
                            {tx.entityId}
                          </td>
                          <td style={{ ...hubStyles.td, fontSize: 12, color: '#475569' }}>{tx.description}</td>
                          <td style={{ ...hubStyles.td, fontWeight: 800, color: '#0F172A' }}>#{tx.blockNumber}</td>
                          <td style={{ ...hubStyles.td, fontFamily: 'monospace', fontSize: 11, color: '#64748B' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <span>
                                {tx.txHash ? tx.txHash.substring(0, 8) + '...' + tx.txHash.substring(tx.txHash.length - 4) : '—'}
                              </span>
                              {tx.txHash && (
                                <button
                                  onClick={() => copyToClipboard(tx.txHash, tx.txNumber)}
                                  style={hubStyles.copyMini}
                                  title="Copy transaction hash"
                                >
                                  {copiedHash === tx.txNumber ? <Check size={11} color="#16A34A" /> : <Copy size={11} color="#94A3B8" />}
                                </button>
                              )}
                            </div>
                          </td>
                          <td style={{ ...hubStyles.td, fontSize: 11, color: '#64748B' }}>
                            {new Date(tx.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={hubStyles.td}>
                            {vRes?.verified ? (
                              <span style={{ color: '#059669', fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <CheckCircle2 size={12} color="#059669" /> Confirmed
                              </span>
                            ) : (
                              <button
                                onClick={() => verifyTxDirect(tx.txHash, tx.txNumber)}
                                disabled={isVerifying}
                                style={hubStyles.btnMiniVerify}
                                title="Query smart contract directly to verify mined status"
                              >
                                {isVerifying ? 'Checking…' : 'Verify'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainHub;
