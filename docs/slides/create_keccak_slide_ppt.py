import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

blank_slide_layout = prs.slide_layouts[6]
slide = prs.slides.add_slide(blank_slide_layout)

# 1. Background image if exists
bg_path = r'c:\Users\prajw\Desktop\RedFlow\docs\slides\redflow_slide_bg_light_prominent.png'
if os.path.exists(bg_path):
    slide.shapes.add_picture(bg_path, 0, 0, width=prs.slide_width, height=prs.slide_height)
else:
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = RGBColor(248, 250, 252)
    bg_shape.line.fill.background()

# Top accent bar (Crimson)
accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
accent.fill.solid()
accent.fill.fore_color.rgb = RGBColor(220, 38, 38)
accent.line.fill.background()

# 2. Header Category Tag
tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8), Inches(0.35))
tf_tag = tag_box.text_frame
p_tag = tf_tag.paragraphs[0]
p_tag.text = "CRYPTOGRAPHIC INTEGRITY & ZERO-PII PRIVACY"
p_tag.font.name = "Segoe UI"
p_tag.font.size = Pt(11)
p_tag.font.bold = True
p_tag.font.color.rgb = RGBColor(220, 38, 38)

# Title
title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.8), Inches(0.7))
tf_title = title_box.text_frame
p_title = tf_title.paragraphs[0]
p_title.text = "Keccak-256 Cryptographic Hashing Function"
p_title.font.name = "Segoe UI"
p_title.font.size = Pt(30)
p_title.font.bold = True
p_title.font.color.rgb = RGBColor(15, 23, 42)

# Subtitle
sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(11.8), Inches(0.4))
tf_sub = sub_box.text_frame
p_sub = tf_sub.paragraphs[0]
p_sub.text = "Deterministic State Fingerprinting & Tamper-Proof On-Chain Verification in RedFlow"
p_sub.font.name = "Segoe UI"
p_sub.font.size = Pt(13.5)
p_sub.font.color.rgb = RGBColor(100, 116, 139)

card_w = Inches(5.6)
start_y = Inches(2.05)

# ─────────────────────────────────────────────────────────────────────────────
# 3. Left Column: Architecture & Core Principles (2 Cards)
# ─────────────────────────────────────────────────────────────────────────────
left_x = Inches(0.8)

# Card 1: Sponge Construction Mechanics
c1_h = Inches(2.4)
c1 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, start_y, card_w, c1_h)
c1.fill.solid()
c1.fill.fore_color.rgb = RGBColor(255, 255, 255)
c1.line.color.rgb = RGBColor(226, 232, 240)
c1.line.width = Pt(1.5)

tf1 = c1.text_frame
tf1.word_wrap = True
tf1.margin_left = Inches(0.25)
tf1.margin_top = Inches(0.2)
tf1.margin_right = Inches(0.25)

p = tf1.paragraphs[0]
p.text = "Sponge Construction Mechanics"
p.font.name = "Segoe UI"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = RGBColor(185, 28, 28)
p.space_after = Pt(6)

points_1 = [
    ("State Array: ", "Operates on 1600-bit state (b = r + c: Rate r = 1088 bits, Capacity c = 512 bits)."),
    ("Absorbing Phase: ", "Message blocks are XORed into the bitrate slice of the state array."),
    ("24-Round Permutation: ", "Applies 5 non-linear transformations: θ (parity), ρ (rotation), π (permutation), χ (mapping), and ι (constants)."),
    ("Squeezing Phase: ", "Extracts an immutable 256-bit (bytes32) output digest.")
]
for h, b in points_1:
    p = tf1.add_paragraph()
    p.text = f"• {h}{b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(10.5)
    p.font.color.rgb = RGBColor(51, 65, 85)
    p.space_after = Pt(2)

# Card 2: Why Keccak-256 in RedFlow
c2_y = start_y + c1_h + Inches(0.2)
c2_h = Inches(2.4)
c2 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, c2_y, card_w, c2_h)
c2.fill.solid()
c2.fill.fore_color.rgb = RGBColor(240, 253, 244)
c2.line.color.rgb = RGBColor(134, 239, 172)
c2.line.width = Pt(1.5)

tf2 = c2.text_frame
tf2.word_wrap = True
tf2.margin_left = Inches(0.25)
tf2.margin_top = Inches(0.2)
tf2.margin_right = Inches(0.25)

p = tf2.paragraphs[0]
p.text = "Key Architectural Advantages in RedFlow"
p.font.name = "Segoe UI"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = RGBColor(21, 128, 61)
p.space_after = Pt(6)

points_2 = [
    ("Zero-PII On-Chain: ", "No donor names, phone numbers, or HIV/HBV medical notes touch the blockchain (100% HIPAA/DPDP compliant)."),
    ("Native EVM Opcode (0x20): ", "Executed natively in hardware by Ethereum nodes for minimal gas cost (~30 gas)."),
    ("Length-Extension Immune: ", "Unlike SHA-256 (Merkle-Damgård), Keccak's capacity prevents message extension forgery."),
    ("Avalanche Effect: ", "Altering 1 character in blood group or expiry date completely changes 50%+ of the hash output.")
]
for h, b in points_2:
    p = tf2.add_paragraph()
    p.text = f"✓ {h}{b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(10.5)
    p.font.color.rgb = RGBColor(20, 83, 45)
    p.space_after = Pt(2)

# ─────────────────────────────────────────────────────────────────────────────
# 4. Right Column: RedFlow Implementation & Verification (2 Cards)
# ─────────────────────────────────────────────────────────────────────────────
right_x = Inches(6.8)

# Card 3: Exact Canonical Serialization Formula
c3_h = Inches(2.2)
c3 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x, start_y, card_w, c3_h)
c3.fill.solid()
c3.fill.fore_color.rgb = RGBColor(240, 249, 255)
c3.line.color.rgb = RGBColor(186, 230, 253)
c3.line.width = Pt(1.5)

tf3 = c3.text_frame
tf3.word_wrap = True
tf3.margin_left = Inches(0.25)
tf3.margin_top = Inches(0.2)
tf3.margin_right = Inches(0.25)

p = tf3.paragraphs[0]
p.text = "Deterministic Field Serialization Pipeline"
p.font.name = "Segoe UI"
p.font.size = Pt(14)
p.font.bold = True
p.font.color.rgb = RGBColor(3, 105, 161)
p.space_after = Pt(6)

lines_3 = [
    ("Canonical Payload Format:", "chainId | unitId | donorId | bloodGroup | collectionDate | expiryDate | testStatus | availabilityStatus"),
    ("Node.js Cryptographic Digest:", "ethers.keccak256( ethers.toUtf8Bytes( input ) )"),
    ("Dual-Platform Determinism:", "Ensures byte-for-byte matching between off-chain JavaScript and on-chain Solidity.")
]
for h, b in lines_3:
    p = tf3.add_paragraph()
    p.text = f"• {h}\n  {b}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(10.5)
    p.font.color.rgb = RGBColor(30, 58, 138)
    p.space_after = Pt(3)

# Card 4: Code Implementation & Bedside Dual-Assertion
c4_y = start_y + c3_h + Inches(0.2)
c4_h = Inches(2.6)
c4 = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x, c4_y, card_w, c4_h)
c4.fill.solid()
c4.fill.fore_color.rgb = RGBColor(15, 23, 42)
c4.line.color.rgb = RGBColor(30, 41, 59)
c4.line.width = Pt(1.5)

tf4 = c4.text_frame
tf4.word_wrap = True
tf4.margin_left = Inches(0.25)
tf4.margin_top = Inches(0.2)

p = tf4.paragraphs[0]
p.text = "Production Code & Bedside Verification Rule"
p.font.name = "Consolas"
p.font.size = Pt(12)
p.font.bold = True
p.font.color.rgb = RGBColor(56, 189, 248)
p.space_after = Pt(8)

code_snippet = """// 1. Off-Chain (backend/src/services/hashService.js)
const input = `${chainId}|${unitId}|${donorId}|${bloodGroup}|` +
              `${collectionDate}|${expiryDate}|${testStatus}|${availabilityStatus}`;
const unitHash = ethers.keccak256(ethers.toUtf8Bytes(input));

// 2. On-Chain Assertion (blockchain/contracts/RedFlow.sol)
bool isValid = (bloodUnits[unitId].dataHash == claimedHash);

// Bedside QR Verification Rule:
// If computedHash == onChainHash => VERIFIED GENUINE (Green Shield)
// If computedHash != onChainHash => TAMPERED / REJECTED (Red Alert)"""

for line in code_snippet.split('\n'):
    p = tf4.add_paragraph()
    p.text = line
    p.font.name = "Consolas"
    p.font.size = Pt(9.5)
    p.font.color.rgb = RGBColor(226, 232, 240)

out_pptx = r'c:\Users\prajw\Desktop\RedFlow\docs\slides\RedFlow_Keccak256_Slide.pptx'
prs.save(out_pptx)
print("Saved Keccak PPT slide to:", out_pptx)
