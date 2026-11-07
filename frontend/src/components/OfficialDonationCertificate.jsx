import React, { useState, useEffect } from 'react';
import { Download, Award, ShieldCheck, Eye, Check, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import certTemplateImg from '../assets/official_certificate_template.jpg';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * OFFICIAL DONATION CERTIFICATE COMPONENT
 * - Renders a sleek, compact row card on the donor dashboard matching the
 *   "Rest Interval In Progress" row directly above it.
 * - Provides immediate "View" (opens fullscreen modal) and "Download" buttons.
 * - Dynamically overlays:
 *   1. Top-Right: Certificate No (e.g. RF-2026-BU001) and Date of Issue
 *   2. Center: Recipient Donor Name in elegant crimson cursive calligraphy
 *   3. Bottom-Left: Scannable real-time QR code linked directly to the
 *      on-chain blockchain verification route (/verify/:unitId).
 * - Canvas rasterizer guarantees pixel-perfect high-resolution PNG downloads.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const OfficialDonationCertificate = ({
  donorName = 'Prajwal Lokesh',
  certificateNo = 'RF-2026-0001',
  issueDate = '15 Oct 2026',
  unitId = '0001',
  txHash = '',
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Target ID for verification: clean unitId or extracted from certificateNo
  const targetId = unitId || (certificateNo ? certificateNo.replace(/^RF(-\d{4})?-/i, '') : '0001');
  const verifyUrl = `${window.location.origin}/verify/${targetId}`;

  // Generate dynamic QR code matching the exact RedFlow verification URL
  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 360,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('[OfficialDonationCertificate] QR generation error:', err));
  }, [verifyUrl]);

  const handleDownload = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 681;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = certTemplateImg;

      img.onload = () => {
        // 1. Draw base certificate artwork
        ctx.drawImage(img, 0, 0, 1024, 681);

        // 2. Dynamic Top-Right: Certificate No & Date of Issue
        // Clear area to the right of vertical red bar (x: 778)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(785, 46, 215, 42);

        ctx.fillStyle = '#262626';
        ctx.font = '500 12px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Certificate No: ${certificateNo}`, 796, 57);
        ctx.fillText(`Date of Issue: ${issueDate}`, 796, 77);

        // 3. Dynamic Center: Donor Name in Calligraphy Red Cursive
        // White patch over center area
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(260, 275, 504, 74);

        // Name in elegant cursive script
        ctx.fillStyle = '#DC2626';
        ctx.font = 'italic bold 42px "Great Vibes", "Dancing Script", cursive, Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(donorName, 512, 342);

        // Re-stroke crisp underline in matching crimson-wine (#703E3F)
        ctx.strokeStyle = '#703E3F';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(300, 352);
        ctx.lineTo(724, 352);
        ctx.stroke();

        // 4. Dynamic Bottom-Left: Scannable QR Code
        const renderAndSave = () => {
          const link = document.createElement('a');
          link.download = `RedFlow-Official-Certificate-${donorName.replace(/\s+/g, '_')}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setDownloading(false);
          setDownloaded(true);
          setTimeout(() => setDownloaded(false), 2500);
        };

        if (qrDataUrl) {
          const qrImg = new Image();
          qrImg.onload = () => {
            // White patch to erase static placeholder QR
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(172, 472, 96, 96);
            // Draw real scannable QR code
            ctx.drawImage(qrImg, 175, 475, 90, 90);
            renderAndSave();
          };
          qrImg.onerror = renderAndSave;
          qrImg.src = qrDataUrl;
        } else {
          renderAndSave();
        }
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
        className="rf-donor-cert-row"
      >
        <div className="rf-donor-cert-top-wrap">
          {/* Left Icon Wrap */}
          <div className="rf-donor-cert-icon">
            <Award size={20} />
          </div>

          {/* Text Details */}
          <div className="rf-donor-cert-content">
            <div className="rf-donor-cert-title-wrap">
              <span className="rf-donor-cert-title">
                Official Donation Certificate
              </span>
              <span className="rf-donor-cert-badge">
                Ready
              </span>
            </div>
            <div className="rf-donor-cert-subtitle">
              Certificate No: <strong>{certificateNo}</strong> • Tap to preview or download high-res PNG.
            </div>
          </div>
        </div>

        {/* Action Buttons: View & Download */}
        <div
          className="rf-donor-cert-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rf-donor-cert-btn-view"
            title="View full certificate"
          >
            <Eye size={13} color="#007C91" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="rf-donor-cert-btn-download"
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

                {/* 1. Dynamic Top-Right Overlay: Certificate No & Date of Issue */}
                <div
                  style={{
                    position: 'absolute',
                    top: '6.75%',
                    left: '76.6%',
                    width: '21%',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '2px 4px',
                    fontSize: 'clamp(8px, 1.25vw, 12px)',
                    color: '#262626',
                    fontFamily: '"Inter", sans-serif',
                    lineHeight: 1.45,
                    pointerEvents: 'none',
                  }}
                >
                  <div>Certificate No: <strong style={{ color: '#0F172A' }}>{certificateNo}</strong></div>
                  <div>Date of Issue: <strong style={{ color: '#0F172A' }}>{issueDate}</strong></div>
                </div>

                {/* 2. Dynamic Center Overlay: Recipient Donor Name */}
                <div
                  style={{
                    position: 'absolute',
                    top: '41.5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '51%',
                    height: '8.5%',
                    background: '#FFFFFF',
                    borderBottom: '1.5px solid #703E3F',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '2px',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Great Vibes", "Dancing Script", cursive, Georgia, serif',
                      fontSize: 'clamp(18px, 3.8vw, 36px)',
                      fontWeight: 700,
                      fontStyle: 'italic',
                      color: '#DC2626',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1,
                    }}
                  >
                    {donorName}
                  </div>
                </div>

                {/* 3. Dynamic Bottom-Left Overlay: Clickable QR Code */}
                {qrDataUrl && (
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Click to verify this certificate on RedFlow Blockchain"
                    style={{
                      position: 'absolute',
                      top: '69.4%',
                      left: '16.9%',
                      width: '9.3%',
                      aspectRatio: '1',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px',
                      borderRadius: 4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <img
                      src={qrDataUrl}
                      alt="Blockchain Verification QR"
                      style={{ width: '100%', height: '100%', display: 'block' }}
                    />
                  </a>
                )}
              </div>
            </div>

            <div className="rf-cert-modal-footer">
              <div style={{ fontSize: 11.5, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="#059669" />
                <span>Certificate No: <strong>{certificateNo}</strong> • Date: <strong>{issueDate}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'rgba(0,124,145,0.08)',
                    color: '#007C91',
                    border: '1px solid rgba(0,124,145,0.25)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Verify on Blockchain</span>
                </a>

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
