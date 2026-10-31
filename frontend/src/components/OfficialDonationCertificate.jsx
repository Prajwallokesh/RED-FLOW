import React, { useState } from 'react';
import { Download, Award, ShieldCheck, Eye, Check, X } from 'lucide-react';
import certTemplateImg from '../assets/official_certificate_template.jpg';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * OFFICIAL DONATION CERTIFICATE COMPONENT
 * - Renders a sleek, compact row card on the donor dashboard matching the
 *   "Rest Interval In Progress" row directly above it.
 * - Provides immediate "View" (opens fullscreen modal) and "Download" buttons.
 * - Inside the modal, renders the official RedFlow certificate artwork with
 *   the donor's name dynamically rendered in calligraphy cursive with a pure
 *   white background patch (zero overlap).
 * - Generates high-resolution PNG downloads on-the-fly via HTML5 canvas.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const OfficialDonationCertificate = ({
  donorName = 'Prajwal Lokesh',
  certificateNo = 'RF-2026-0001',
  issueDate = '15 Oct 2026',
  txHash = '',
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDownload = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 682;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = certTemplateImg;

      img.onload = () => {
        // 1. Draw base certificate artwork
        ctx.drawImage(img, 0, 0, 1024, 682);

        // 2. Pure white patch over recipient name area (guaranteed clean background)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(240, 280, 544, 88);

        // 3. Delicate accent underline below name
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(320, 362);
        ctx.lineTo(704, 362);
        ctx.stroke();

        // 4. Render dynamic donor name in calligraphy red cursive script
        ctx.fillStyle = '#DC2626';
        ctx.font = 'italic bold 44px "Great Vibes", "Dancing Script", cursive, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(donorName, 512, 332);

        // 5. Trigger instant download
        const link = document.createElement('a');
        link.download = `RedFlow-Official-Certificate-${donorName.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        setDownloading(false);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2500);
      };

      img.onerror = () => {
        const link = document.createElement('a');
        link.download = `RedFlow-Certificate-${donorName.replace(/\s+/g, '_')}.jpg`;
        link.href = certTemplateImg;
        link.click();
        setDownloading(false);
      };
    } catch (e) {
      console.error('Download error:', e);
      setDownloading(false);
    }
  };

  return (
    <>
      {/* ── Compact Dashboard Row Card (Matches Rest Interval In Progress Row) ── */}
      <div
        onClick={() => setShowModal(true)}
        style={{
          border: '1.5px solid rgba(220, 38, 38, 0.25)',
          background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.85) 0%, #FFFFFF 100%)',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(220, 38, 38, 0.04)',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Left Icon Wrap */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: 'rgba(220, 38, 38, 0.12)',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Award size={20} />
        </div>

        {/* Text Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>
              Official Donation Certificate
            </span>
            <span
              style={{
                background: 'rgba(46, 125, 50, 0.12)',
                color: '#2E7D32',
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 100,
                letterSpacing: 0.3,
              }}
            >
              Ready
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#6C757D', lineHeight: 1.3 }}>
            Certificate of Appreciation for voluntary donation. Tap to view or download.
          </div>
        </div>

        {/* Action Buttons: View & Download */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#172B4D',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="View full certificate"
          >
            <Eye size={13} color="#007C91" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            style={{
              background: '#DC2626',
              border: 'none',
              borderRadius: 8,
              padding: '6px 11px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
            }}
            title="Download PNG certificate"
          >
            {downloaded ? (
              <>
                <Check size={13} />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>{downloading ? '…' : 'Download'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Fullscreen Modal View ── */}
      {showModal && (
        <div className="rf-cert-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="rf-cert-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="rf-cert-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Award size={18} color="#DC2626" />
                <span style={{ fontWeight: 800, color: '#172B4D', fontSize: 14 }}>
                  Official RedFlow Certificate of Appreciation
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rf-cert-modal-close"
              >
                ✕
              </button>
            </div>

            <div className="rf-cert-modal-body">
              <div style={{ position: 'relative', width: '100%', borderRadius: 10, overflow: 'hidden' }}>
                <img
                  src={certTemplateImg}
                  alt={`Certificate for ${donorName}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                {/* Clean Pure White Background Patch + Calligraphy Recipient Name */}
                <div className="rf-cert-name-box">
                  <div className="rf-cert-name-text">
                    {donorName}
                  </div>
                </div>
              </div>
            </div>

            <div className="rf-cert-modal-footer">
              <div style={{ fontSize: 11.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#059669" />
                <span>Certificate No: <strong>{certificateNo}</strong> • Date: <strong>{issueDate}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="rf-cert-download-btn"
                  style={{ padding: '8px 18px', fontSize: 13 }}
                >
                  {downloaded ? (
                    <>
                      <Check size={15} color="#FFFFFF" />
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>{downloading ? 'Preparing…' : 'Download Certificate PNG'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OfficialDonationCertificate;
