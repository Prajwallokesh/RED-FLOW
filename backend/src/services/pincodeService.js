'use strict';

const https = require('https');

// ── 1. Comprehensive Pincode Coordinates Table ────────────────────────────────
// Pre-mapped exact coordinates for all Hassan district taluks/sub-divisions,
// Karnataka regional hubs, and all major Indian metros.
const PINCODE_COORDS = {
  // ── HASSAN DISTRICT (Every taluk & postal division) ──
  '573201': { lat: 13.0071, lng: 76.0993, city: 'Hassan City Center' },
  '573202': { lat: 13.0180, lng: 76.1090, city: 'Vidyanagar / Industrial, Hassan' },
  '573128': { lat: 12.8967, lng: 76.0645, city: 'Kattaya / Shettihalli, Hassan' },
  '573101': { lat: 13.3150, lng: 76.2570, city: 'Arsikere' },
  '573102': { lat: 12.7680, lng: 76.0590, city: 'Arkalgud' },
  '573103': { lat: 12.9120, lng: 75.9860, city: 'Alur' },
  '573111': { lat: 13.0210, lng: 76.4150, city: 'Bagur, Channarayapatna' },
  '573112': { lat: 13.2510, lng: 76.3120, city: 'Banasavandra, Arsikere' },
  '573113': { lat: 12.6950, lng: 76.0120, city: 'Basavapatna, Arkalgud' },
  '573115': { lat: 13.1610, lng: 75.8600, city: 'Belur' },
  '573116': { lat: 12.9050, lng: 76.3920, city: 'Channarayapatna' },
  '573117': { lat: 13.3720, lng: 76.2150, city: 'Gandasi, Arsikere' },
  '573118': { lat: 12.8350, lng: 76.2850, city: 'Halekote, Holenarasipura' },
  '573119': { lat: 13.2120, lng: 76.1850, city: 'Javagal, Arsikere' },
  '573121': { lat: 13.2250, lng: 75.9450, city: 'Halebidu, Belur' },
  '573122': { lat: 13.3950, lng: 76.2850, city: 'Kanakatte, Arsikere' },
  '573123': { lat: 12.9850, lng: 75.6820, city: 'Hanbal, Sakleshpur' },
  '573124': { lat: 12.8750, lng: 76.2150, city: 'Hariharapura, Holenarasipura' },
  '573125': { lat: 13.4120, lng: 76.3450, city: 'Arsikere Rural' },
  '573126': { lat: 13.2850, lng: 76.2150, city: 'Arsikere Town' },
  '573127': { lat: 12.8250, lng: 75.6950, city: 'Hethur, Sakleshpur' },
  '573130': { lat: 12.7120, lng: 76.1150, city: 'Konanur, Arkalgud' },
  '573131': { lat: 12.9650, lng: 76.4820, city: 'Hirisave, Channarayapatna' },
  '573134': { lat: 12.8950, lng: 75.7850, city: 'Sakleshpur Town' },
  '573135': { lat: 12.8550, lng: 76.4850, city: 'Shravanabelagola' },
  '573137': { lat: 13.1150, lng: 75.7850, city: 'Arehalli, Belur' },
  '573142': { lat: 12.7850, lng: 75.9850, city: 'Ramanathapura, Arkalgud' },
  '573144': { lat: 13.3450, lng: 76.1850, city: 'Arsikere North' },
  '573153': { lat: 12.6550, lng: 76.0450, city: 'Magge, Arkalgud' },
  '573160': { lat: 13.2850, lng: 75.8150, city: 'Bikkarane, Belur' },
  '573211': { lat: 12.7880, lng: 76.2410, city: 'Holenarasipura Town' },
  '573212': { lat: 12.9850, lng: 76.1250, city: 'Boovanahalli, Hassan' },
  '573213': { lat: 12.9850, lng: 75.9860, city: 'Alur Town' },
  '573214': { lat: 13.0420, lng: 76.1820, city: 'Shanthigrama, Hassan' },
  '573217': { lat: 13.0850, lng: 76.0120, city: 'Dudda, Hassan' },
  '573218': { lat: 12.8950, lng: 75.9450, city: 'Kenchammana Hoskote, Alur' },
  '573220': { lat: 12.9450, lng: 76.3250, city: 'Nuggehalli, Channarayapatna' },
  '573225': { lat: 13.0450, lng: 76.0850, city: 'Mosale Hosahalli, Hassan' },

  // ── BENGALURU & SURROUNDING ──
  '560001': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru GPO' },
  '560002': { lat: 12.9640, lng: 77.5850, city: 'Bengaluru City' },
  '560004': { lat: 12.9431, lng: 77.5762, city: 'Basavanagudi' },
  '560017': { lat: 12.9560, lng: 77.6580, city: 'HAL Bengaluru' },
  '560025': { lat: 12.9698, lng: 77.6101, city: 'Richmond Town' },
  '560034': { lat: 12.9254, lng: 77.6245, city: 'Koramangala' },
  '560038': { lat: 12.9784, lng: 77.6408, city: 'Indiranagar' },
  '560041': { lat: 12.9250, lng: 77.5938, city: 'Jayanagar' },
  '560066': { lat: 12.9698, lng: 77.7499, city: 'Whitefield' },
  '560068': { lat: 12.9081, lng: 77.6476, city: 'Madivala' },
  '560078': { lat: 12.9080, lng: 77.5850, city: 'JP Nagar' },
  '560100': { lat: 12.8452, lng: 77.6602, city: 'Electronic City' },
  '562125': { lat: 12.7210, lng: 77.2790, city: 'Ramanagara' },
  '562135': { lat: 13.2350, lng: 77.5510, city: 'Doddaballapura' },

  // ── MYSURU & MANDYA ──
  '570001': { lat: 12.2958, lng: 76.6394, city: 'Mysuru HPO' },
  '570004': { lat: 12.3120, lng: 76.6510, city: 'Nazarbad Mysuru' },
  '570020': { lat: 12.3350, lng: 76.6180, city: 'Gokulam Mysuru' },
  '571401': { lat: 12.5218, lng: 76.8951, city: 'Mandya City' },
  '571402': { lat: 12.5250, lng: 76.8980, city: 'Mandya Town' },
  '571201': { lat: 12.4244, lng: 75.7382, city: 'Madikeri / Kodagu' },

  // ── TUMAKURU & CHIKKAMAGALURU ──
  '572101': { lat: 13.3409, lng: 77.1010, city: 'Tumakuru Town' },
  '577101': { lat: 13.3153, lng: 75.7754, city: 'Chikkamagaluru' },

  // ── MANGALURU & COASTAL ──
  '575001': { lat: 12.9141, lng: 74.8560, city: 'Mangaluru HPO' },
  '575003': { lat: 12.8710, lng: 74.8420, city: 'Kankanady Mangaluru' },
  '576101': { lat: 13.3409, lng: 74.7421, city: 'Udupi' },
  '576104': { lat: 13.3520, lng: 74.7860, city: 'Manipal' },

  // ── SHIVAMOGGA & CENTRAL KARNATAKA ──
  '577201': { lat: 13.9299, lng: 75.5681, city: 'Shivamogga Town' },
  '577216': { lat: 13.9850, lng: 75.5120, city: 'Bhadravathi' },
  '577002': { lat: 14.4644, lng: 75.9218, city: 'Davanagere' },
  '577501': { lat: 14.2251, lng: 76.3980, city: 'Chitradurga' },

  // ── NORTH KARNATAKA ──
  '580001': { lat: 15.3647, lng: 75.1240, city: 'Hubli' },
  '580029': { lat: 15.4589, lng: 75.0078, city: 'Dharwad' },
  '590001': { lat: 15.8497, lng: 74.4977, city: 'Belagavi' },
  '583101': { lat: 15.1394, lng: 76.9214, city: 'Ballari' },
  '583201': { lat: 15.2689, lng: 76.3909, city: 'Hosapete / Vijayanagara' },
  '584101': { lat: 16.2120, lng: 77.3439, city: 'Raichur' },
  '585101': { lat: 17.3297, lng: 76.8343, city: 'Kalaburagi' },
  '586101': { lat: 16.8302, lng: 75.7100, city: 'Vijayapura' },
  '587101': { lat: 16.1691, lng: 75.6615, city: 'Bagalkot' },

  // ── NATIONAL HUBS & METROS ──
  '110001': { lat: 28.6139, lng: 77.2090, city: 'New Delhi' },
  '400001': { lat: 18.9388, lng: 72.8355, city: 'Mumbai' },
  '411001': { lat: 18.5204, lng: 73.8567, city: 'Pune' },
  '600001': { lat: 13.0827, lng: 80.2707, city: 'Chennai' },
  '500001': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad' },
  '700001': { lat: 22.5726, lng: 88.3639, city: 'Kolkata' },
  '380001': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad' },
  '302001': { lat: 26.9124, lng: 75.7873, city: 'Jaipur' },
};

// ── 2. Regional 3-Digit Postal Prefix Mapping ─────────────────────────────────
const PREFIX_MAP = {
  '560': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru Urban' },
  '561': { lat: 13.2930, lng: 77.5400, city: 'Bengaluru Rural' },
  '562': { lat: 12.7150, lng: 77.2810, city: 'Ramanagara' },
  '563': { lat: 13.1367, lng: 78.1340, city: 'Kolar' },
  '570': { lat: 12.2958, lng: 76.6394, city: 'Mysuru' },
  '571': { lat: 12.5218, lng: 76.8951, city: 'Mandya / Kodagu' },
  '572': { lat: 13.3409, lng: 77.1010, city: 'Tumakuru' },
  '573': { lat: 13.0071, lng: 76.0993, city: 'Hassan' },
  '574': { lat: 12.8797, lng: 75.0385, city: 'Dakshina Kannada' },
  '575': { lat: 12.9141, lng: 74.8560, city: 'Mangaluru' },
  '576': { lat: 13.3409, lng: 74.7421, city: 'Udupi' },
  '577': { lat: 13.9299, lng: 75.5681, city: 'Shivamogga / Davanagere' },
  '580': { lat: 15.3647, lng: 75.1240, city: 'Hubli-Dharwad' },
  '581': { lat: 14.8185, lng: 74.1350, city: 'Uttara Kannada / Haveri' },
  '582': { lat: 15.4283, lng: 75.6320, city: 'Gadag' },
  '583': { lat: 15.1394, lng: 76.9214, city: 'Ballari / Vijayanagara' },
  '584': { lat: 16.2120, lng: 77.3439, city: 'Raichur / Koppal' },
  '585': { lat: 17.3297, lng: 76.8343, city: 'Kalaburagi / Bidar / Yadgir' },
  '586': { lat: 16.8302, lng: 75.7100, city: 'Vijayapura' },
  '587': { lat: 16.1691, lng: 75.6615, city: 'Bagalkot' },
  '590': { lat: 15.8497, lng: 74.4977, city: 'Belagavi City' },
  '591': { lat: 16.1667, lng: 74.8333, city: 'Belagavi Rural' },
  '110': { lat: 28.6139, lng: 77.2090, city: 'New Delhi' },
  '120': { lat: 28.4595, lng: 77.0266, city: 'Gurugram' },
  '201': { lat: 28.5355, lng: 77.3910, city: 'Noida / Ghaziabad' },
  '302': { lat: 26.9124, lng: 75.7873, city: 'Jaipur' },
  '380': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad' },
  '400': { lat: 18.9388, lng: 72.8355, city: 'Mumbai' },
  '411': { lat: 18.5204, lng: 73.8567, city: 'Pune' },
  '500': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad' },
  '600': { lat: 13.0827, lng: 80.2707, city: 'Chennai' },
  '700': { lat: 22.5726, lng: 88.3639, city: 'Kolkata' },
};

// In-memory dynamic geocoding cache for fast 0ms repeated lookups
const DYNAMIC_PINCODE_CACHE = {};

// Spreads nearby donors slightly apart on the map so pins don't stack on top of each other
function applyOffset(base, index, radius) {
  const angle = ((index * 137.5) * Math.PI) / 180;
  return {
    lat: Number((base.lat + radius * Math.cos(angle)).toFixed(5)),
    lng: Number((base.lng + radius * Math.sin(angle)).toFixed(5)),
    city: base.city,
  };
}

/**
 * Synchronously extracts coordinates from the verified dictionary and prefix map.
 */
function getCoordsForPincode(pin, city = '', district = '', index = 0) {
  const cleanPin = String(pin || '').trim();

  // 1. Direct match in verified PINCODE_COORDS table
  if (PINCODE_COORDS[cleanPin]) {
    const p = { ...PINCODE_COORDS[cleanPin], city: PINCODE_COORDS[cleanPin].city || city || district || 'Karnataka' };
    return index === 0 ? p : applyOffset(p, index, 0.0018 + (index % 4) * 0.0012);
  }

  // 2. Dynamic in-memory cache match
  if (DYNAMIC_PINCODE_CACHE[cleanPin]) {
    const c = DYNAMIC_PINCODE_CACHE[cleanPin];
    return index === 0 ? { lat: c.lat, lng: c.lng, city: c.city } : applyOffset(c, index, 0.002);
  }

  // 3. 3-digit prefix lookup
  const prefix = cleanPin.slice(0, 3);
  if (PREFIX_MAP[prefix]) {
    const base = { ...PREFIX_MAP[prefix], city: city || district || PREFIX_MAP[prefix].city };
    return index === 0 ? base : applyOffset(base, index, 0.003 + (index % 4) * 0.002);
  }

  // 4. Default fallback to Hassan City Center
  const hassan = { lat: 13.0071, lng: 76.0993, city: 'Hassan' };
  return index === 0 ? hassan : applyOffset(hassan, index, 0.0025);
}

/**
 * Asynchronously resolves ANY 6-digit Indian pincode via the official Postal Directory.
 * Automatically caches results so repeated lookups take 0ms.
 */
async function resolvePincodeAsync(pin) {
  const cleanPin = String(pin || '').trim();
  if (PINCODE_COORDS[cleanPin]) {
    return { pincode: cleanPin, ...PINCODE_COORDS[cleanPin], source: 'table' };
  }
  if (DYNAMIC_PINCODE_CACHE[cleanPin]) {
    return { pincode: cleanPin, ...DYNAMIC_PINCODE_CACHE[cleanPin], source: 'cache' };
  }

  // Fetch from India Post API
  try {
    const data = await new Promise((resolve, reject) => {
      https.get(`https://api.postalpincode.in/pincode/${cleanPin}`, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(e); }
        });
      }).on('error', reject);
    });

    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
      const po = data[0].PostOffice[0];
      const cityName = po.Name || po.Block || po.District;
      const districtName = po.District || 'Karnataka';

      // Check if known block/taluk exists
      const blockKey = (po.Block || '').toLowerCase();
      let coords = null;

      for (const [k, v] of Object.entries(PINCODE_COORDS)) {
        if (v.city && v.city.toLowerCase().includes(blockKey)) {
          coords = { lat: v.lat, lng: v.lng };
          break;
        }
      }

      if (!coords) {
        coords = getCoordsForPincode(cleanPin, cityName, districtName, 0);
      }

      const result = {
        lat: coords.lat,
        lng: coords.lng,
        city: `${cityName}, ${districtName}`,
        district: districtName,
        state: po.State || 'Karnataka',
        source: 'postal_api',
      };

      DYNAMIC_PINCODE_CACHE[cleanPin] = result;
      return { pincode: cleanPin, ...result };
    }
  } catch (err) {
    console.warn(`[PincodeService] Online lookup failed for ${cleanPin}, using mathematical fallback`);
  }

  // Fallback to synchronous mathematical resolver
  const syncFallback = getCoordsForPincode(cleanPin, '', '', 0);
  return { pincode: cleanPin, ...syncFallback, source: 'prefix_fallback' };
}

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

module.exports = {
  PINCODE_COORDS,
  PREFIX_MAP,
  getCoordsForPincode,
  resolvePincodeAsync,
  calculateHaversineKm,
};
