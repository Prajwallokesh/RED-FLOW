import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

bg_path = r'c:\Users\prajw\Desktop\RedFlow\docs\slides\redflow_slide_bg_light_prominent.png'

def add_base_slide(cat_title, slide_title, subtitle):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    if os.path.exists(bg_path):
        slide.shapes.add_picture(bg_path, 0, 0, width=prs.slide_width, height=prs.slide_height)
    else:
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = RGBColor(248, 250, 252)
        bg.line.fill.background()

    accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
    accent.fill.solid()
    accent.fill.fore_color.rgb = RGBColor(220, 38, 38)
    accent.line.fill.background()

    # Category Tag
    tb_tag = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8), Inches(0.3))
    p_tag = tb_tag.text_frame.paragraphs[0]
    p_tag.text = cat_title.upper()
    p_tag.font.name = "Segoe UI"
    p_tag.font.size = Pt(11)
    p_tag.font.bold = True
    p_tag.font.color.rgb = RGBColor(220, 38, 38)

    # Title
    tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.5), Inches(0.65))
    p_t = tb_title.text_frame.paragraphs[0]
    p_t.text = slide_title
    p_t.font.name = "Segoe UI"
    p_t.font.size = Pt(28)
    p_t.font.bold = True
    p_t.font.color.rgb = RGBColor(15, 23, 42)

    # Subtitle
    tb_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.35), Inches(11.5), Inches(0.4))
    p_s = tb_sub.text_frame.paragraphs[0]
    p_s.text = subtitle
    p_s.font.name = "Segoe UI"
    p_s.font.size = Pt(13)
    p_s.font.color.rgb = RGBColor(100, 116, 139)

    return slide

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 1: Algorithms Overview
# ─────────────────────────────────────────────────────────────────────────────
s1 = add_base_slide("Mathematical & Cryptographic Foundation",
                    "RedFlow Core Algorithm Suite",
                    "Six Interconnected Mathematical, Clinical, and Cryptographic Algorithms Powering RedFlow")

grid_w = Inches(3.65)
grid_h = Inches(2.2)
cards_data = [
    ("4.1 Haversine Distance", "Computes exact great-circle spherical distance between hospital requisitions and donor coordinates.", RGBColor(219, 234, 254), RGBColor(30, 58, 138)),
    ("4.2 Fermat Spiral Dispersion", "Applies Golden Angle (137.508°) mathematical dispersion to prevent map pin-stacking in dense pincodes.", RGBColor(254, 243, 199), RGBColor(146, 64, 14)),
    ("4.3 Keccak-256 Fingerprint", "Deterministic cryptographic hashing ensuring identical Zero-PII state proofs across Node.js & Solidity.", RGBColor(220, 252, 231), RGBColor(21, 128, 61)),
    ("4.4 Antigen-Antibody Matrix", "Codifies strict biological ABO & Rh(D) compatibility rules for safe emergency blood transfusion matching.", RGBColor(254, 226, 226), RGBColor(153, 27, 27)),
    ("4.5 WHO 90-Day Rest Gap", "Clinical recovery engine calculating mandatory biological gaps to prevent donor fatigue and over-donation.", RGBColor(243, 232, 255), RGBColor(107, 33, 168)),
    ("4.6 Finite State Machine (FSM)", "Six-stage formal custody state machine enforcing cold-chain transit, testing, and terminal retirement.", RGBColor(224, 242, 254), RGBColor(3, 105, 161)),
]

for idx, (title, desc, fill_c, text_c) in enumerate(cards_data):
    col = idx % 3
    row = idx // 3
    x = Inches(0.8) + col * (grid_w + Inches(0.38))
    y = Inches(2.0) + row * (grid_h + Inches(0.35))

    sh = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, grid_w, grid_h)
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill_c
    sh.line.color.rgb = text_c
    sh.line.width = Pt(1.5)

    tf = sh.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.2)
    tf.margin_top = Inches(0.2)
    tf.margin_right = Inches(0.2)

    p1 = tf.paragraphs[0]
    p1.text = title
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(14)
    p1.font.bold = True
    p1.font.color.rgb = text_c
    p1.space_after = Pt(6)

    p2 = tf.add_paragraph()
    p2.text = desc
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(11)
    p2.font.color.rgb = RGBColor(51, 65, 85)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 2: Algorithm 1: Haversine Formula
# ─────────────────────────────────────────────────────────────────────────────
s2 = add_base_slide("Algorithm 4.1: Geospatial Routing",
                    "Haversine Geodesic Distance Formula",
                    "Calculating Exact Great-Circle Distances Across Earth's Spherical Curvature")

card_w2 = Inches(5.6)
# Left: Problem & Math
left_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), card_w2, Inches(4.8))
left_card.fill.solid()
left_card.fill.fore_color.rgb = RGBColor(255, 255, 255)
left_card.line.color.rgb = RGBColor(226, 232, 240)
left_card.line.width = Pt(1.5)

tf2_l = left_card.text_frame
tf2_l.word_wrap = True
tf2_l.margin_left = Inches(0.3)
tf2_l.margin_top = Inches(0.25)
tf2_l.margin_right = Inches(0.3)

p = tf2_l.paragraphs[0]
p.text = "Mathematical Formulation"
p.font.name = "Segoe UI"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = RGBColor(185, 28, 28)
p.space_after = Pt(8)

lines_l2 = [
    ("Problem:", "Compute great-circle distance between a hospital coordinate (φ1, λ1) and donor coordinate (φ2, λ2) on Earth."),
    ("Delta Form:", "Δφ = φ2 - φ1 (lat diff in rad), Δλ = λ2 - λ1 (lon diff in rad)"),
    ("Square Half-Chord:", "a = sin²(Δφ/2) + cos(φ1) · cos(φ2) · sin²(Δλ/2)"),
    ("Angular Distance:", "c = 2 · atan2(√a, √(1-a)) in radians"),
    ("Surface Distance:", "d = R · c   (where Earth mean volumetric radius R = 6,371 km)"),
    ("Significance:", "Provides sub-second proximity sorting across 500+ postal codes with zero third-party API costs.")
]
for h, b in lines_l2:
    p = tf2_l.add_paragraph()
    p.text = f"• {h} {b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(51, 65, 85)
    p.space_after = Pt(6)

# Right: JavaScript Code Box
right_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), card_w2, Inches(4.8))
right_card.fill.solid()
right_card.fill.fore_color.rgb = RGBColor(15, 23, 42)
right_card.line.color.rgb = RGBColor(30, 41, 59)
right_card.line.width = Pt(1.5)

tf2_r = right_card.text_frame
tf2_r.word_wrap = True
tf2_r.margin_left = Inches(0.3)
tf2_r.margin_top = Inches(0.25)

p = tf2_r.paragraphs[0]
p.text = "backend/src/services/pincodeService.js"
p.font.name = "Consolas"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = RGBColor(56, 189, 248)
p.space_after = Pt(10)

code_h = """function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Rounded to 0.1km
}"""
for line in code_h.split('\n'):
    p = tf2_r.add_paragraph()
    p.text = line
    p.font.name = "Consolas"
    p.font.size = Pt(10)
    p.font.color.rgb = RGBColor(226, 232, 240)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 3: Algorithm 2: Fermat Spiral Dispersion
# ─────────────────────────────────────────────────────────────────────────────
s3 = add_base_slide("Algorithm 4.2: Map Visualization",
                    "Fermat Spiral Pincode Dispersion",
                    "Resolving Marker Stacking on Leaflet Maps Using Golden Angle Phyllotaxis Geometry")

c3_l = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), card_w2, Inches(4.8))
c3_l.fill.solid()
c3_l.fill.fore_color.rgb = RGBColor(255, 255, 255)
c3_l.line.color.rgb = RGBColor(226, 232, 240)

tf3_l = c3_l.text_frame
tf3_l.word_wrap = True
tf3_l.margin_left = Inches(0.3)
tf3_l.margin_top = Inches(0.25)
tf3_l.margin_right = Inches(0.3)

p = tf3_l.paragraphs[0]
p.text = "The Overlapping Pin Problem & Solution"
p.font.name = "Segoe UI"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = RGBColor(180, 83, 9)
p.space_after = Pt(10)

lines_3l = [
    ("Problem:", "When multiple donors share identical pincode (e.g. 573201 Hassan), naively plotting central coordinates collapses all pins into a single point."),
    ("User Impact:", "Hospitals cannot distinguish individual donors or inspect separate profiles on Leaflet maps."),
    ("Biological Inspiration:", "Fermat spiral dispersion uses nature's Golden Angle (φ ≈ 137.508°), the same pattern seen in sunflower seed packing."),
    ("Mathematical Model:", "θ_i = i · 137.508° · (π / 180)"),
    ("Polar to Cartesian:", "lat_i = lat_base + r · cos(θ_i)\nlng_i = lng_base + r · sin(θ_i)"),
    ("Radial Growth:", "r = c · √i  ensures equidistant visual density with zero overlap.")
]
for h, b in lines_3l:
    p = tf3_l.add_paragraph()
    p.text = f"• {h} {b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(51, 65, 85)
    p.space_after = Pt(6)

c3_r = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), card_w2, Inches(4.8))
c3_r.fill.solid()
c3_r.fill.fore_color.rgb = RGBColor(254, 243, 199)
c3_r.line.color.rgb = RGBColor(245, 158, 11)

tf3_r = c3_r.text_frame
tf3_r.word_wrap = True
tf3_r.margin_left = Inches(0.3)
tf3_r.margin_top = Inches(0.25)
tf3_r.margin_right = Inches(0.3)

p = tf3_r.paragraphs[0]
p.text = "Visual Impact on Leaflet GIS Engine"
p.font.name = "Segoe UI"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = RGBColor(146, 64, 14)
p.space_after = Pt(12)

points_3r = [
    ("Deterministic Distribution: ", "Donor #1, #2, #N receive stable, repeatable micro-offsets."),
    ("Zero Geocoding API Overhead: ", "Runs instantly in client/server memory without querying external mapping services."),
    ("Interactive Pin Selection: ", "Nurses and coordinators can individually click every donor in high-density urban clusters."),
    ("Clinical Privacy Preserved: ", "Dispersion naturally provides privacy obfuscation while maintaining neighborhood accuracy.")
]
for h, b in points_3r:
    p = tf3_r.add_paragraph()
    p.text = f"✓ {h}{b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11.5)
    p.font.color.rgb = RGBColor(120, 53, 15)
    p.space_after = Pt(10)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 4: Algorithm 3: Keccak-256 State Fingerprinting
# ─────────────────────────────────────────────────────────────────────────────
s4 = add_base_slide("Algorithm 4.3: Cryptographic Integrity",
                    "Deterministic Keccak-256 Merkle Fingerprinting",
                    "Guaranteed Cross-Platform Hash Equivalence Between Node.js and Ethereum Smart Contract")

c4_l = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), card_w2, Inches(4.8))
c4_l.fill.solid()
c4_l.fill.fore_color.rgb = RGBColor(255, 255, 255)
c4_l.line.color.rgb = RGBColor(226, 232, 240)

tf4_l = c4_l.text_frame
tf4_l.word_wrap = True
tf4_l.margin_left = Inches(0.3)
tf4_l.margin_top = Inches(0.25)
tf4_l.margin_right = Inches(0.3)

p = tf4_l.paragraphs[0]
p.text = "Canonical Field Serialization Pipeline"
p.font.name = "Segoe UI"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = RGBColor(21, 128, 61)
p.space_after = Pt(10)

lines_4l = [
    ("Goal:", "Produce matching 32-byte cryptographic fingerprints across off-chain backend and on-chain EVM."),
    ("Delimiter Standard:", "Strict canonical pipe-delimited serialization sequence."),
    ("Payload String:", "Payload = chainId | unitId | donorId | bloodGroup | collectionDate | expiryDate | testStatus | availabilityStatus"),
    ("Digest Computation:", "Digest = keccak256( toUtf8Bytes( Payload ) )"),
    ("Tamper Proofing:", "Modifying a single timestamp or blood group produces completely divergent 256-bit hash (Avalanche Effect)."),
    ("Zero-PII Compliance:", "No names, phone numbers, or clinical diagnoses are committed on-chain.")
]
for h, b in lines_4l:
    p = tf4_l.add_paragraph()
    p.text = f"• {h} {b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(51, 65, 85)
    p.space_after = Pt(6)

c4_r = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), card_w2, Inches(4.8))
c4_r.fill.solid()
c4_r.fill.fore_color.rgb = RGBColor(15, 23, 42)
c4_r.line.color.rgb = RGBColor(30, 41, 59)

tf4_r = c4_r.text_frame
tf4_r.word_wrap = True
tf4_r.margin_left = Inches(0.3)
tf4_r.margin_top = Inches(0.25)

p = tf4_r.paragraphs[0]
p.text = "Solidity Contract Assertion (RedFlow.sol)"
p.font.name = "Consolas"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = RGBColor(56, 189, 248)
p.space_after = Pt(10)

code_4 = """// Smart Contract Verification Function
function verifyBloodUnit(
    string calldata unitId,
    bytes32 claimedHash
) external view returns (bool, string memory) {
    BloodUnitRecord memory record = bloodUnits[unitId];
    require(record.dataHash != bytes32(0), "Unit not found");

    bool isValid = (record.dataHash == claimedHash);
    return (isValid, record.status);
}

// 1-Scan Assertion:
// If computedHash == onChainHash => VERIFIED GENUINE
// If computedHash != onChainHash => TAMPERED / REJECTED"""

for line in code_4.split('\n'):
    p = tf4_r.add_paragraph()
    p.text = line
    p.font.name = "Consolas"
    p.font.size = Pt(10)
    p.font.color.rgb = RGBColor(226, 232, 240)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 5: Algorithm 4: Antigen-Antibody Compatibility Matrix
# ─────────────────────────────────────────────────────────────────────────────
s5 = add_base_slide("Algorithm 4.4: Biological Safety",
                    "ABO & Rh(D) Antigen-Antibody Compatibility Matrix",
                    "Mathematical Rules Engine Enforcing Safe Biological Transfusion & Universal Donor Rules")

table_shape = s5.shapes.add_table(9, 3, Inches(0.8), Inches(2.0), Inches(11.7), Inches(4.8))
table = table_shape.table

headers = ["RECIPIENT GROUP", "COMPATIBLE DONOR BLOOD GROUPS (CAN RECEIVE FROM)", "CLINICAL SIGNIFICANCE"]
matrix_data = [
    ("O-", "O- Only", "Universal Red Blood Cell Donor (Essential in Emergency Trauma)"),
    ("O+", "O+, O-", "Most prevalent clinical demand (38% of population)"),
    ("A-", "A-, O-", "Platelet-rich resource; high platelet demand"),
    ("A+", "A+, A-, O+, O-", "High regional prevalence (34% of hospital admissions)"),
    ("B-", "B-, O-", "Rare negative Rh sub-group (approx 2% of donors)"),
    ("B+", "B+, B-, O+, O-", "Predominant clinical group in South Asia"),
    ("AB-", "AB-, A-, B-, O-", "Universal plasma donor; platelets compatible with all negative types"),
    ("AB+", "All Groups (AB+, AB-, A+, A-, B+, B-, O+, O-)", "Universal Red Blood Cell Recipient")
]

for col_idx, h in enumerate(headers):
    cell = table.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = RGBColor(220, 38, 38)
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)

for row_idx, row_vals in enumerate(matrix_data):
    for col_idx, val in enumerate(row_vals):
        cell = table.cell(row_idx + 1, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(255, 255, 255) if row_idx % 2 == 0 else RGBColor(248, 250, 252)
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.name = "Segoe UI"
        p.font.size = Pt(10.5)
        p.font.bold = (col_idx == 0)
        p.font.color.rgb = RGBColor(185, 28, 28) if col_idx == 0 else RGBColor(30, 41, 59)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 6: Algorithm 5: WHO 90-Day Rest Gap Engine
# ─────────────────────────────────────────────────────────────────────────────
s6 = add_base_slide("Algorithm 4.5: Clinical Deferral",
                    "WHO 90-Day Biological Rest Gap Engine",
                    "Clinical Interval Calculations Preventing Donor Anemia, Fatigue, and Over-Donation")

c6_l = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), card_w2, Inches(4.8))
c6_l.fill.solid()
c6_l.fill.fore_color.rgb = RGBColor(255, 255, 255)
c6_l.line.color.rgb = RGBColor(226, 232, 240)

tf6_l = c6_l.text_frame
tf6_l.word_wrap = True
tf6_l.margin_left = Inches(0.3)
tf6_l.margin_top = Inches(0.25)
tf6_l.margin_right = Inches(0.3)

p = tf6_l.paragraphs[0]
p.text = "Mathematical Formulation"
p.font.name = "Segoe UI"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = RGBColor(107, 33, 168)
p.space_after = Pt(10)

lines_6l = [
    ("Clinical Baseline:", "World Health Organization (WHO) and National Blood Transfusion Council (NBTC) mandate 90-day biological rest between whole blood donations."),
    ("Elapsed Time Equation:", "Δt_days = ⌊ (t_current - t_lastDonation) / (1000 · 60 · 60 · 24) ⌋"),
    ("Eligibility Piecewise Function:", "Eligibility = true   if (t_lastDonation == null OR Δt_days ≥ 90)\nEligibility = false  (Days Left = 90 - Δt_days)  if Δt_days < 90"),
    ("Automated Recovery Countdown:", "Donors receive a live days-remaining countdown on their profile page."),
    ("Preventing Clinical Complications:", "Protects iron/ferritin stores and avoids donor deferral at collection camps.")
]
for h, b in lines_6l:
    p = tf6_l.add_paragraph()
    p.text = f"• {h} {b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(51, 65, 85)
    p.space_after = Pt(6)

c6_r = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), card_w2, Inches(4.8))
c6_r.fill.solid()
c6_r.fill.fore_color.rgb = RGBColor(243, 232, 255)
c6_r.line.color.rgb = RGBColor(192, 132, 252)

tf6_r = c6_r.text_frame
tf6_r.word_wrap = True
tf6_r.margin_left = Inches(0.3)
tf6_r.margin_top = Inches(0.25)
tf6_r.margin_right = Inches(0.3)

p = tf6_r.paragraphs[0]
p.text = "Runtime Implementation in RedFlow"
p.font.name = "Segoe UI"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = RGBColor(88, 28, 135)
p.space_after = Pt(12)

points_6r = [
    ("First-Time Donors: ", "Instant clearance upon identity verification (lastDonationDate = null)."),
    ("Dynamic Badge States: ", "Dashboard renders ELIGIBLE (Green), DEFERRED (Amber Countdown), or FLAGGED (Red)."),
    ("Camp Fast-Track: ", "Phlebotomist scanning QR code receives automated eligibility pass/fail verdict."),
    ("Zero Manual Math: ", "Eliminates calculation errors by camp staff during peak intake hours.")
]
for h, b in points_6r:
    p = tf6_r.add_paragraph()
    p.text = f"✓ {h}{b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11.5)
    p.font.color.rgb = RGBColor(88, 28, 135)
    p.space_after = Pt(10)

# ─────────────────────────────────────────────────────────────────────────────
# SLIDE 7: Algorithm 6: Finite State Machine (FSM) Lifecycle
# ─────────────────────────────────────────────────────────────────────────────
s7 = add_base_slide("Algorithm 4.6: State Machine Architecture",
                    "Finite State Machine (FSM) Blood Lifecycle",
                    "Enforcing Deterministic Custody Transitions, Cold-Chain Rules & Terminal Retirement")

c7_l = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), card_w2, Inches(4.8))
c7_l.fill.solid()
c7_l.fill.fore_color.rgb = RGBColor(255, 255, 255)
c7_l.line.color.rgb = RGBColor(226, 232, 240)

tf7_l = c7_l.text_frame
tf7_l.word_wrap = True
tf7_l.margin_left = Inches(0.3)
tf7_l.margin_top = Inches(0.25)
tf7_l.margin_right = Inches(0.3)

p = tf7_l.paragraphs[0]
p.text = "Custody State Transition Model"
p.font.name = "Segoe UI"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = RGBColor(3, 105, 161)
p.space_after = Pt(10)

fsm_lines = [
    ("Formal Definition:", "A deterministic finite state machine M = (Q, Σ, δ, q0, F) tracking each blood bag UUID."),
    ("Pending Test:", "Phlebotomy intake. Serology screening for HIV, HBV, HCV, Syphilis, Malaria."),
    ("Available:", "Passed lab screening. Placed in temperature-monitored refrigerated vaults."),
    ("Requested:", "Allocated to active hospital requisition with temporary stock reservation."),
    ("Issued (Terminal):", "Transfused to verified patient at hospital bedside. Unit ID permanently retired."),
    ("Rejected (Terminal):", "Contaminated, expired, or temperature breached. Sent to biohazard disposal.")
]
for h, b in fsm_lines:
    p = tf7_l.add_paragraph()
    p.text = f"• {h} {b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(11)
    p.font.color.rgb = RGBColor(51, 65, 85)
    p.space_after = Pt(6)

c7_r = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), card_w2, Inches(4.8))
c7_r.fill.solid()
c7_r.fill.fore_color.rgb = RGBColor(15, 23, 42)
c7_r.line.color.rgb = RGBColor(30, 41, 59)

tf7_r = c7_r.text_frame
tf7_r.word_wrap = True
tf7_r.margin_left = Inches(0.3)
tf7_r.margin_top = Inches(0.25)

p = tf7_r.paragraphs[0]
p.text = "Transition Table in Node.js & Smart Contract"
p.font.name = "Consolas"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = RGBColor(56, 189, 248)
p.space_after = Pt(10)

code_fsm = """const VALID_TRANSITIONS = {
  // Screening: pass to vault or reject
  'pending_test': ['available', 'rejected'],

  // Cold vault: allocate or discard
  'available':    ['requested', 'rejected'],

  // Allocated: transfuse or release back
  'requested':    ['issued', 'available'],

  // Terminal state: transfused to patient
  'issued':       [],

  // Terminal state: biohazard disposal
  'rejected':     []
};

// Illegal transitions (e.g. pending_test -> issued)
// throw HTTP 400 and revert Ethereum transactions."""

for line in code_fsm.split('\n'):
    p = tf7_r.add_paragraph()
    p.text = line
    p.font.name = "Consolas"
    p.font.size = Pt(10)
    p.font.color.rgb = RGBColor(226, 232, 240)

out_deck = r'c:\Users\prajw\Desktop\RedFlow\docs\slides\RedFlow_Algorithms_Deck.pptx'
prs.save(out_deck)
print("Saved 7-slide Algorithm deck to:", out_deck)
