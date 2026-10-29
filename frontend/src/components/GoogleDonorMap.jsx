import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { Send, AlertTriangle, CheckCircle2, X, Bell, PhoneCall } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const MAPTILER_KEY = 'lR8f5RPsNx1JcUzBiKkd';

/**
 * PREDEFINED URGENT MESSAGE TEMPLATES
 * Clinical Specification: Standardized emergency communication templates
 * dispatchable to voluntary donors based on urgent hospital requisition priorities:
 *   1. Critical Trauma Emergency (immediate surgical/trauma transfusion need)
 *   2. Low Blood Reserve Appeal (blood bank stock critically low)
 *   3. Direct Compatibility Match (exact ABO/Rh requisition match)
 */
const PREDEFINED_TEMPLATES = [
  {
    id: 'trauma',
    label: 'Critical Trauma Emergency',
    urgency: 'critical',
    getText: (donor, sender) =>
      `🚨 CRITICAL EMERGENCY: Immediate requirement for ${donor.bloodGroup} blood at ${sender?.name || 'Emergency Trauma Center'}. A patient requires emergency transfusion immediately. Please report to the blood bank or call us immediately.`,
  },
  {
    id: 'depletion',
    label: 'Low Blood Reserve Appeal',
    urgency: 'urgent',
    getText: (donor, sender) =>
      `🩸 URGENT INVENTORY APPEAL: Our supply of ${donor.bloodGroup} whole blood at ${sender?.name || 'Hospital Blood Bank'} is running critically low. As a verified voluntary donor, your donation today can save lives.`,
  },
  {
    id: 'match',
    label: 'Direct Patient Compatibility Match',
    urgency: 'urgent',
    getText: (donor, sender) =>
      `🏥 DIRECT COMPATIBILITY MATCH: An urgent requisition matching your specific ${donor.bloodGroup} blood group has been raised at ${sender?.name || 'our medical center'}. Please confirm your availability to donate.`,
  },
];

const BG_COLOR = {
  'A+': '#E53935', 'A-': '#B71C1C', 'B+': '#1565C0', 'B-': '#0D47A1',
  'AB+': '#6A1B9A', 'AB-': '#4A148C', 'O+': '#2E7D32', 'O-': '#1B5E20',
};

const PINCODE_COORDS = {
  // Hassan District (Every taluk & postal division)
  '573201': [13.0071, 76.0993], // Hassan City Center
  '573202': [13.0180, 76.1090], // Vidyanagar / Industrial, Hassan
  '573128': [12.8967, 76.0645], // Kattaya / Shettihalli, Hassan
  '573101': [13.3150, 76.2570], // Arsikere
  '573102': [12.7680, 76.0590], // Arkalgud
  '573103': [12.9120, 75.9860], // Alur
  '573111': [13.0210, 76.4150], // Bagur, Channarayapatna
  '573112': [13.2510, 76.3120], // Banasavandra, Arsikere
  '573113': [12.6950, 76.0120], // Basavapatna, Arkalgud
  '573115': [13.1610, 75.8600], // Belur
  '573116': [12.9050, 76.3920], // Channarayapatna
  '573117': [13.3720, 76.2150], // Gandasi, Arsikere
  '573118': [12.8350, 76.2850], // Halekote, Holenarasipura
  '573119': [13.2120, 76.1850], // Javagal, Arsikere
  '573121': [13.2250, 75.9450], // Halebidu, Belur
  '573122': [13.3950, 76.2850], // Kanakatte, Arsikere
  '573123': [12.9850, 75.6820], // Hanbal, Sakleshpur
  '573124': [12.8750, 76.2150], // Hariharapura, Holenarasipura
  '573125': [13.4120, 76.3450], // Arsikere Rural
  '573126': [13.2850, 76.2150], // Arsikere Town
  '573127': [12.8250, 75.6950], // Hethur, Sakleshpur
  '573130': [12.7120, 76.1150], // Konanur, Arkalgud
  '573131': [12.9650, 76.4820], // Hirisave, Channarayapatna
  '573134': [12.8950, 75.7850], // Sakleshpur Town
  '573135': [12.8550, 76.4850], // Shravanabelagola
  '573137': [13.1150, 75.7850], // Arehalli, Belur
  '573142': [12.7850, 75.9850], // Ramanathapura, Arkalgud
  '573144': [13.3450, 76.1850], // Arsikere North
  '573153': [12.6550, 76.0450], // Magge, Arkalgud
  '573160': [13.2850, 75.8150], // Bikkarane, Belur
  '573211': [12.7880, 76.2410], // Holenarasipura Town
  '573212': [12.9850, 76.1250], // Boovanahalli, Hassan
  '573213': [12.9850, 75.9860], // Alur Town
  '573214': [13.0420, 76.1820], // Shanthigrama, Hassan
  '573217': [13.0850, 76.0120], // Dudda, Hassan
  '573218': [12.8950, 75.9450], // Kenchammana Hoskote, Alur
  '573220': [12.9450, 76.3250], // Nuggehalli, Channarayapatna
  '573225': [13.0450, 76.0850], // Mosale Hosahalli, Hassan

  // Bengaluru Urban & Rural
  '560001': [12.9716, 77.5946], '560002': [12.9640, 77.5850],
  '560004': [12.9431, 77.5762], '560017': [12.9560, 77.6580],
  '560025': [12.9698, 77.6101], '560032': [13.0180, 77.5890],
  '560034': [12.9254, 77.6245], '560038': [12.9784, 77.6408],
  '560041': [12.9250, 77.5938], '560066': [12.9698, 77.7499],
  '560068': [12.9081, 77.6476], '560078': [12.9080, 77.5850],
  '560100': [12.8452, 77.6602], '562125': [12.7210, 77.2790],
  '562135': [13.2350, 77.5510],

  // Mysuru & Mandya
  '570001': [12.2958, 76.6394], '570004': [12.3120, 76.6510],
  '570020': [12.3350, 76.6180], '571401': [12.5218, 76.8951],
  '571402': [12.5250, 76.8980], '571201': [12.4244, 75.7382],

  // Tumakuru & Chikkamagaluru
  '572101': [13.3409, 77.1010], '577101': [13.3153, 75.7754],

  // Mangaluru & Coastal
  '575001': [12.9141, 74.8560], '575003': [12.8710, 74.8420],
  '576101': [13.3409, 74.7421], '576104': [13.3520, 74.7860],
  '574220': [12.8420, 75.2410],

  // Shivamogga, Davanagere & Chitradurga
  '577201': [13.9299, 75.5681], '577216': [13.9850, 75.5120],
  '577001': [14.4644, 75.9218], '577501': [14.2251, 76.3980],

  // North Karnataka Hubs
  '580001': [15.3647, 75.1240], '580020': [15.4589, 75.0078],
  '590001': [15.8497, 74.4977], '591115': [16.1667, 74.8333],
  '583101': [15.1394, 76.9214], '583201': [15.2689, 76.3909],
  '584101': [16.2120, 77.3439], '585101': [17.3297, 76.8343],
  '586101': [16.8302, 75.7100], '587101': [16.1691, 75.6615],

  // National Metros & Major Indian Cities
  '110001': [28.6139, 77.2090], // New Delhi
  '400001': [18.9388, 72.8355], // Mumbai
  '411001': [18.5204, 73.8567], // Pune
  '600001': [13.0827, 80.2707], // Chennai
  '500001': [17.3850, 78.4867], // Hyderabad
  '700001': [22.5726, 88.3639], // Kolkata
  '380001': [23.0225, 72.5714], // Ahmedabad
  '302001': [26.9124, 75.7873], // Jaipur
  '530001': [17.6868, 83.2185], // Visakhapatnam
  '682001': [9.9312, 76.2673],  // Kochi
};

const PREFIX_COORDS = {
  '560': [12.9716, 77.5946], // Bengaluru Urban
  '561': [13.2930, 77.5400], // Bengaluru Rural
  '562': [12.7150, 77.2810], // Ramanagara
  '563': [13.1367, 78.1340], // Kolar
  '570': [12.2958, 76.6394], // Mysuru
  '571': [12.5218, 76.8951], // Mandya / Kodagu
  '572': [13.3409, 77.1010], // Tumakuru
  '573': [13.0072, 76.0962], // Hassan
  '574': [12.8797, 75.0385], // Dakshina Kannada
  '575': [12.9141, 74.8560], // Mangaluru
  '576': [13.3409, 74.7421], // Udupi
  '577': [13.9299, 75.5681], // Shivamogga / Davanagere / Chitradurga
  '580': [15.3647, 75.1240], // Hubli-Dharwad
  '581': [14.8185, 74.1350], // Uttara Kannada / Haveri
  '582': [15.4283, 75.6320], // Gadag
  '583': [15.1394, 76.9214], // Ballari / Hosapete
  '584': [16.2120, 77.3439], // Raichur
  '585': [17.3297, 76.8343], // Kalaburagi / Bidar / Yadgir
  '586': [16.8302, 75.7100], // Vijayapura
  '587': [16.1691, 75.6615], // Bagalkot
  '590': [15.8497, 74.4977], // Belagavi
  '591': [16.1667, 74.8333], // Belagavi Rural
  '400': [18.9388, 72.8355], // Mumbai
  '411': [18.5204, 73.8567], // Pune
  '110': [28.6139, 77.2090], // New Delhi
  '600': [13.0827, 80.2707], // Chennai
  '500': [17.3850, 78.4867], // Hyderabad
  '700': [22.5726, 88.3639], // Kolkata
  '380': [23.0225, 72.5714], // Ahmedabad
  '302': [26.9124, 75.7873], // Jaipur
};

const DISTRICT_FALLBACKS = {
  hassan: [13.0072, 76.0962],
  bengaluru: [12.9716, 77.5946],
  mysuru: [12.2958, 76.6394],
  mandya: [12.5218, 76.8951],
  mangaluru: [12.9141, 74.8560],
  udupi: [13.3409, 74.7421],
  shivamogga: [13.9299, 75.5681],
  davanagere: [14.4644, 75.9218],
  chitradurga: [14.2251, 76.3980],
  hubli: [15.3647, 75.1240],
  dharwad: [15.4589, 75.0078],
  belagavi: [15.8497, 74.4977],
  ballari: [15.1394, 76.9214],
  kalaburagi: [17.3297, 76.8343],
  tumakuru: [13.3409, 77.1010],
  chikkamagaluru: [13.3153, 75.7754],
};

/**
 * Directly extracts [latitude, longitude] from any 6-digit Indian pincode.
 * Assigns precise geographic coordinates to map markers.
 */
export const extractLocationFromPincode = (pin, index = 0) => {
  const cleanPin = String(pin || '').trim();
  if (PINCODE_COORDS[cleanPin]) {
    const [lat, lng] = PINCODE_COORDS[cleanPin];
    if (index === 0) return [lat, lng];
    const angle = ((index * 137.5) * Math.PI) / 180;
    const radius = 0.0018 + (index % 4) * 0.0012;
    return [
      Number((lat + radius * Math.cos(angle)).toFixed(5)),
      Number((lng + radius * Math.sin(angle)).toFixed(5))
    ];
  }

  const prefix = cleanPin.slice(0, 3);
  if (PREFIX_COORDS[prefix]) {
    const [bLat, bLng] = PREFIX_COORDS[prefix];
    if (index === 0) return [bLat, bLng];
    const angle = ((index * 137.5) * Math.PI) / 180;
    const radius = 0.003 + (index % 4) * 0.002;
    return [
      Number((bLat + radius * Math.cos(angle)).toFixed(5)),
      Number((bLng + radius * Math.sin(angle)).toFixed(5))
    ];
  }

  const distKey = cleanPin.toLowerCase().trim();
  for (const [key, coords] of Object.entries(DISTRICT_FALLBACKS)) {
    if (distKey.includes(key)) {
      if (index === 0) return [coords[0], coords[1]];
      const angle = ((index * 137.5) * Math.PI) / 180;
      const radius = 0.003 + (index % 4) * 0.002;
      return [
        Number((coords[0] + radius * Math.cos(angle)).toFixed(5)),
        Number((coords[1] + radius * Math.sin(angle)).toFixed(5))
      ];
    }
  }

  // Central default fallback: Hassan City Center
  if (index === 0) return [13.0071, 76.0993];
  const angle = ((index * 137.5) * Math.PI) / 180;
  return [
    Number((13.0071 + 0.0025 * Math.cos(angle)).toFixed(5)),
    Number((76.0993 + 0.0025 * Math.sin(angle)).toFixed(5))
  ];
};

export const getCoords = extractLocationFromPincode;

const GoogleDonorMap = ({
  donors = [],
  centerPin = '',
  originLabel = 'Search Origin',
  height = '100%',
  radiusKm = 25
}) => {
  const { user } = useAuth();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const circleRef = useRef(null);
  const [mapLayer, setMapLayer] = useState('google_streets');

  // Emergency notification modal state
  const [notifyDonor, setNotifyDonor] = useState(null);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');

  // Handle opening notification modal from Leaflet popup button
  useEffect(() => {
    window.__redflowNotifyDonor = (donorId) => {
      const d = donors.find((x) => x.donorId === donorId || String(x._id) === String(donorId));
      if (d) {
        setNotifyDonor(d);
        setSelectedTemplateIndex(0);
        setCustomMessage(PREDEFINED_TEMPLATES[0].getText(d, user));
        setSendSuccess('');
        setSendError('');
      }
    };
    return () => {
      delete window.__redflowNotifyDonor;
    };
  }, [donors, user]);

  const handleSendAlert = async () => {
    if (!notifyDonor || !customMessage.trim()) return;
    setIsSending(true);
    setSendError('');
    setSendSuccess('');
    try {
      const template = PREDEFINED_TEMPLATES[selectedTemplateIndex];
      await api.post('/notifications/send', {
        recipientDonorId: notifyDonor.donorId || notifyDonor._id,
        bloodGroup: notifyDonor.bloodGroup,
        urgency: template.urgency,
        title: `🚨 Urgent Need for ${notifyDonor.bloodGroup} Blood`,
        message: customMessage.trim(),
        senderPhone: user?.phone || '',
      });
      setSendSuccess(`Urgent alert successfully delivered to ${notifyDonor.name}!`);
      setTimeout(() => {
        setNotifyDonor(null);
        setSendSuccess('');
      }, 1600);
    } catch (err) {
      setSendError(err.response?.data?.error || 'Failed to send notification. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const tileUrls = {
    google_streets: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    google_satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    google_terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    maptiler: 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + MAPTILER_KEY,
  };

  const tileAttributions = {
    google_streets: 'Google Maps',
    google_satellite: 'Google Imagery',
    google_terrain: 'Google Terrain',
    maptiler: 'MapTiler & OpenStreetMap',
  };
  // Dynamic geocoding fallback: if centerPin is not pre-mapped, query the backend geocoding service
  useEffect(() => {
    const cleanPin = String(centerPin || '').trim();
    if (!cleanPin || cleanPin.length !== 6 || PINCODE_COORDS[cleanPin]) return;

    let isSubscribed = true;
    fetch(`/api/donor-search/geocode?pincode=${encodeURIComponent(cleanPin)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isSubscribed || !data || !data.lat || !data.lng) return;
        PINCODE_COORDS[cleanPin] = [data.lat, data.lng];
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([data.lat, data.lng], 12, { duration: 1 });
        }
      })
      .catch(() => {});

    return () => { isSubscribed = false; };
  }, [centerPin]);

  useEffect(() => {
    let isCancelled = false;

    import('leaflet').then((L) => {
      if (isCancelled || !mapContainerRef.current) return;
      delete L.Icon.Default.prototype._getIconUrl;

      const originCoords = centerPin ? extractLocationFromPincode(centerPin, 0) : null;
      const center = originCoords || (donors.length > 0 ? extractLocationFromPincode(donors[0].pincode, 0) : [13.0071, 76.0993]);

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapContainerRef.current, {
          center,
          zoom: 12,
          zoomControl: true,
        });

        tileLayerRef.current = L.tileLayer(tileUrls[mapLayer], {
          attribution: tileAttributions[mapLayer],
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        }).addTo(mapInstanceRef.current);
      } else {
        if (tileLayerRef.current) {
          tileLayerRef.current.setUrl(tileUrls[mapLayer]);
        }
        mapInstanceRef.current.setView(center, 12);
      }

      const map = mapInstanceRef.current;

      setTimeout(() => {
        if (!isCancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }

      if (centerPin) {
        const originCoords = extractLocationFromPincode(centerPin, 0);
        const originIcon = L.divIcon({
          html: `<div style="width:34px;height:34px;background:#0F172A;border-radius:50%;border:3px solid #FFF;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:#38BDF8;font-size:11px;font-weight:900;">HUB</div>`,
          className: '',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -20],
        });

        const originMarker = L.marker(originCoords, { icon: originIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui;padding:4px 0;">
              <b style="font-size:13px;color:#0F172A;">${originLabel}</b><br/>
              <span style="font-size:11px;color:#64748B;">Pincode: ${centerPin}</span>
            </div>
          `);
        markersRef.current.push(originMarker);

        if (radiusKm && radiusKm > 0) {
          circleRef.current = L.circle(originCoords, {
            color: '#0284C7',
            fillColor: '#0284C7',
            fillOpacity: 0.08,
            radius: radiusKm * 1000,
            weight: 1.5,
            dashArray: '4, 6',
          }).addTo(map);
        }
      }

      donors.forEach((donor, index) => {
        // Extract the location directly from pincode and assign to the map marker
        const coords = extractLocationFromPincode(donor.pincode, index + 1);
        const color = BG_COLOR[donor.bloodGroup] || '#0284C7';

        const donorIcon = L.divIcon({
          html: `<div style="background:${color};color:#FFF;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;border:2.5px solid #FFF;box-shadow:0 3px 10px rgba(0,0,0,0.35);cursor:pointer;">${donor.bloodGroup}</div>`,
          className: '',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -20],
        });

        const marker = L.marker(coords, { icon: donorIcon }).addTo(map).bindPopup(`
          <div style="font-family:system-ui;min-width:190px;padding:4px 0;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <b style="font-size:14px;color:#0F172A;">${donor.name}</b>
              <span style="background:${color};color:#fff;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:800;">${donor.bloodGroup}</span>
            </div>
            <div style="font-size:11px;color:#64748B;margin-top:3px;">
              Pincode: <strong>${donor.pincode || 'N/A'}</strong> ${donor.city ? '· ' + donor.city : ''}
            </div>
            ${donor.distanceKm !== undefined ? `<div style="font-size:11px;color:#0284C7;font-weight:700;margin-top:2px;">Distance: ${donor.distanceKm} km</div>` : ''}
            <div style="font-size:11px;color:#059669;font-weight:700;margin-top:2px;">
              ${donor.isVerified ? 'Verified Donor' : 'Registered Donor'}
            </div>
            <div style="margin-top:8px;display:flex;flex-direction:column;gap:5px;">
              ${donor.phone ? `
                <a href="tel:${donor.phone}" style="background:#0F172A;color:#FFF;padding:5px 10px;border-radius:6px;text-decoration:none;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:4px;">
                  Call ${donor.phone}
                </a>
              ` : ''}
              <button onclick="window.__redflowNotifyDonor('${donor.donorId || donor._id}')" style="background:#DC2626;color:#FFF;border:none;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;box-shadow:0 2px 5px rgba(220,38,38,0.25);">
                🚨 Send Urgent Blood Alert
              </button>
            </div>
          </div>
        `);
        markersRef.current.push(marker);
      });

      if (donors.length > 0) {
        const allPoints = donors.map((d, i) => (d.lat && d.lng) ? [d.lat, d.lng] : getCoords(d.pincode, d.city, d.district, i));
        if (originCoords) allPoints.push(originCoords);
        try {
          map.fitBounds(allPoints, { padding: [40, 40], maxZoom: 14 });
        } catch (_) {}
      } else if (originCoords) {
        map.setView(originCoords, 13);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [donors, centerPin, mapLayer, radiusKm, originLabel]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height, minHeight: 380, borderRadius: 12, overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
        border: '1px solid #E2E8F0', borderRadius: 8, padding: '4px',
        display: 'flex', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}>
        {[
          { id: 'google_streets', label: 'Google Streets' },
          { id: 'google_satellite', label: 'Google Satellite' },
          { id: 'google_terrain', label: 'Google Terrain' },
          { id: 'maptiler', label: 'MapTiler' },
        ].map((layer) => (
          <button
            key={layer.id}
            onClick={() => setMapLayer(layer.id)}
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: 5,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
              background: mapLayer === layer.id ? '#0F172A' : 'transparent',
              color: mapLayer === layer.id ? '#FFFFFF' : '#475569',
            }}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* ── Emergency Blood Alert Transmission Modal ── */}
      {notifyDonor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: 16,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            width: '100%',
            maxWidth: 480,
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, background: '#DC2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bell size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900 }}>Send Urgent Need Alert</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    To: <strong style={{ color: '#FFFFFF' }}>{notifyDonor.name}</strong> ({notifyDonor.donorId}) · Pincode: {notifyDonor.pincode}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNotifyDonor(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Recipient Blood Group Callout */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FEF2F2',
                border: '1px solid #FECDD3',
                borderRadius: 10,
                padding: '10px 14px',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>
                    Target Blood Compatibility
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#7F1D1D', marginTop: 2 }}>
                    Requesting <span style={{ color: '#DC2626' }}>{notifyDonor.bloodGroup}</span> Blood
                  </div>
                </div>
                <span style={{
                  background: '#DC2626', color: '#FFFFFF',
                  fontSize: 16, fontWeight: 900, padding: '4px 12px', borderRadius: 8
                }}>
                  {notifyDonor.bloodGroup}
                </span>
              </div>

              {/* Predefined Template Selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 6 }}>
                  Select Pre-defined Urgent Message:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {PREDEFINED_TEMPLATES.map((tmpl, idx) => {
                    const isSelected = selectedTemplateIndex === idx;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => {
                          setSelectedTemplateIndex(idx);
                          setCustomMessage(tmpl.getText(notifyDonor, user));
                        }}
                        style={{
                          background: isSelected ? 'rgba(2, 132, 199, 0.08)' : '#F8FAFC',
                          border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                          borderRadius: 8,
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: '50%',
                            border: isSelected ? '4px solid #0284C7' : '2px solid #94A3B8',
                            background: '#FFFFFF',
                          }} />
                          <span style={{ fontSize: 12, fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0369A1' : '#334155' }}>
                            {tmpl.label}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 800,
                          color: tmpl.urgency === 'critical' ? '#DC2626' : '#D97706',
                          textTransform: 'uppercase',
                        }}>
                          {tmpl.urgency}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: 4 }}>
                  Message Preview (will appear on donor's phone):
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    padding: '10px',
                    fontSize: 12,
                    fontFamily: 'inherit',
                    lineHeight: 1.4,
                    resize: 'none',
                    color: '#0F172A',
                  }}
                />
              </div>

              {/* Feedback messages */}
              {sendError && (
                <div style={{
                  background: '#FEE2E2', border: '1px solid #FECDD3',
                  color: '#991B1B', borderRadius: 8, padding: '8px 12px',
                  fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <AlertTriangle size={15} />
                  <span>{sendError}</span>
                </div>
              )}

              {sendSuccess && (
                <div style={{
                  background: '#DCFCE7', border: '1px solid #86EFAC',
                  color: '#166534', borderRadius: 8, padding: '8px 12px',
                  fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <CheckCircle2 size={15} />
                  <span>{sendSuccess}</span>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setNotifyDonor(null)}
                  style={{
                    background: '#F1F5F9', border: 'none',
                    borderRadius: 8, padding: '10px 16px',
                    fontSize: 13, fontWeight: 700, color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendAlert}
                  disabled={isSending || !customMessage.trim()}
                  style={{
                    background: '#DC2626', border: 'none',
                    borderRadius: 8, padding: '10px 20px',
                    fontSize: 13, fontWeight: 800, color: '#FFFFFF',
                    cursor: isSending ? 'not-allowed' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                  }}
                >
                  <Send size={15} />
                  <span>{isSending ? 'Transmitting Alert…' : 'Send Emergency Alert'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleDonorMap;
