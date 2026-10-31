import React, { useState } from 'react';
import { Award, ShieldCheck, QrCode, Download, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import logo from '../assets/logo.png';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DONATION CERTIFICATE PREVIEW COMPONENT
 * An interactive high-fidelity preview of the official RedFlow Certificate of Appreciation
 * anchored on Ethereum Sepolia.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const DonationCertificatePreview = () => {
  const [recipientName, setRecipientName] = useState('Prajwal K L');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [tier, setTier] = useState('Gold Donor');

  return (
    <div className="rf-cert-component-wrap">
      {/* ── Interactive Name & Tier Selector ── */}
      <div className="rf-cert-controls-bar">
        <div className="rf-cert-ctrl-group">
          <label>Donor Name:</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="rf-cert-name-input"
            placeholder="Type your name..."
            maxLength={30}
          />
        </div>

        <div className="rf-cert-ctrl-group">
          <label>Blood Group:</label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="rf-cert-select"
          >
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div className="rf-cert-ctrl-group">
          <label>Recognition Tier:</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="rf-cert-select"
          >
            <option value="Bronze Donor">Bronze Donor (1st Donation)</option>
            <option value="Silver Donor">Silver Donor (3 Donations)</option>
            <option value="Gold Donor">Gold Donor (5 Donations)</option>
            <option value="Platinum Guardian">Platinum Guardian (10+ Donations)</option>
          </select>
        </div>
      </div>

      {/* ── The Certificate Card Frame ── */}
      <div className="rf-cert-outer-frame" id="redflow-certificate-preview">
        {/* Decorative Certificate Inner Border */}
        <div className="rf-cert-inner-border">
          {/* Top Decorative Header Ribbon */}
          <div className="rf-cert-header-ribbon">
            <div className="rf-cert-logo-mark">
              <img src={logo} alt="RedFlow Emblem" className="rf-cert-logo-img" />
              <div>
                <div className="rf-cert-brand-name">
                  <span style={{ color: '#DC2626' }}>Red</span>
                  <span style={{ color: '#172B4D' }}>Flow</span>
                </div>
                <div className="rf-cert-brand-sub">Clinical Blood Registry & Ethereum Ledger</div>
              </div>
            </div>

            <div className="rf-cert-badge-pill">
              <ShieldCheck size={14} color="#059669" />
              <span>ETHEREUM SEPOLIA VERIFIED</span>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="rf-cert-title-block">
            <div className="rf-cert-ornament-line">
              <span className="rf-ornament-star">★</span>
              <span className="rf-ornament-text">OFFICIAL ATTESTATION</span>
              <span className="rf-ornament-star">★</span>
            </div>
            <h3 className="rf-cert-main-title">Certificate of Appreciation</h3>
            <div className="rf-cert-subtitle">FOR VOLUNTARY BLOOD DONATION & SAVING HUMAN LIVES</div>
          </div>

          {/* Recipient Notice */}
          <div className="rf-cert-body-block">
            <div className="rf-cert-present-text">THIS IS PROUDLY CONFERRED UPON</div>
            <div className="rf-cert-donor-name">{recipientName || 'Valued Voluntary Donor'}</div>
            <div className="rf-cert-citation">
              In grateful recognition of contributing a verifiable <strong>450 ml Whole Blood Unit</strong> ({bloodGroup})
              at an accredited clinical collection vault. Through this selfless act of voluntary donation,
              up to <strong>three human lives</strong> have been preserved in emergency trauma care.
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="rf-cert-meta-grid">
            <div className="rf-cert-meta-item">
              <span className="rf-cert-meta-label">BLOOD GROUP</span>
              <span className="rf-cert-meta-val blood-val">{bloodGroup}</span>
            </div>
            <div className="rf-cert-meta-item">
              <span className="rf-cert-meta-label">RECOGNITION LEVEL</span>
              <span className="rf-cert-meta-val tier-val">{tier}</span>
            </div>
            <div className="rf-cert-meta-item">
              <span className="rf-cert-meta-label">COLLECTION VAULT</span>
              <span className="rf-cert-meta-val">District Blood Bank (HIMS)</span>
            </div>
            <div className="rf-cert-meta-item">
              <span className="rf-cert-meta-label">CERTIFICATE ID</span>
              <span className="rf-cert-meta-val mono">#RF-CERT-2026-0042</span>
            </div>
          </div>

          {/* Bottom Row: Blockchain Hash, QR Code & Signatures */}
          <div className="rf-cert-bottom-row">
            {/* Blockchain Stamp */}
            <div className="rf-cert-blockchain-stamp">
              <div className="rf-stamp-title">
                <ShieldCheck size={12} color="#059669" />
                <span>On-Chain Cryptographic Proof</span>
              </div>
              <div className="rf-stamp-hash" title="Ethereum Sepolia Tx Hash">
                Tx: 0xecbd38e2027dc93437f6c5365f9e6ff94ea1089c...
              </div>
              <div className="rf-stamp-contract">
                Contract: 0x0fdD...ADE4 (Sepolia PoS)
              </div>
            </div>

            {/* Scannable Verification QR Mockup */}
            <div className="rf-cert-qr-box">
              <div className="rf-cert-qr-pattern">
                <QrCode size={48} color="#172B4D" />
              </div>
              <span className="rf-cert-qr-label">Scan to Verify</span>
            </div>

            {/* Official Signature */}
            <div className="rf-cert-signature-box">
              <div className="rf-signature-script">Dr. Arvind R. Rao, MD</div>
              <div className="rf-signature-line" />
              <div className="rf-signature-role">Chief Transfusion Medical Officer</div>
              <div className="rf-signature-sub">RedFlow Clinical Advisory Board</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="rf-cert-actions-bar">
        <button
          type="button"
          onClick={() => window.print()}
          className="rf-btn-cert-download"
        >
          <Download size={16} />
          <span>Print / Save Certificate PDF</span>
        </button>
        <span className="rf-cert-disclaimer">
          Official certificates are automatically unlocked and signed upon completed phlebotomy verification at any partner blood bank.
        </span>
      </div>
    </div>
  );
};

export default DonationCertificatePreview;
