import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

blank_slide_layout = prs.slide_layouts[6]
slide = prs.slides.add_slide(blank_slide_layout)

# 1. Background image if exists, else soft background
bg_path = r'c:\Users\prajw\Desktop\RedFlow\docs\slides\redflow_slide_bg_light_prominent.png'
if os.path.exists(bg_path):
    slide.shapes.add_picture(bg_path, 0, 0, width=prs.slide_width, height=prs.slide_height)
else:
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = RGBColor(248, 250, 252)
    bg_shape.line.fill.background()

# Top accent bar
accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
accent.fill.solid()
accent.fill.fore_color.rgb = RGBColor(220, 38, 38)
accent.line.fill.background()

# 2. Header Category Tag
tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(6), Inches(0.35))
tf_tag = tag_box.text_frame
tf_tag.word_wrap = True
p_tag = tf_tag.paragraphs[0]
p_tag.text = "BLOCKCHAIN INFRASTRUCTURE"
p_tag.font.name = "Segoe UI"
p_tag.font.size = Pt(11)
p_tag.font.bold = True
p_tag.font.color.rgb = RGBColor(220, 38, 38)

# Title
title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.5), Inches(0.7))
tf_title = title_box.text_frame
tf_title.word_wrap = True
p_title = tf_title.paragraphs[0]
p_title.text = "Ganache Local Testnet Implementation"
p_title.font.name = "Segoe UI"
p_title.font.size = Pt(30)
p_title.font.bold = True
p_title.font.color.rgb = RGBColor(15, 23, 42)

# Subtitle
sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.45), Inches(11.5), Inches(0.4))
tf_sub = sub_box.text_frame
tf_sub.word_wrap = True
p_sub = tf_sub.paragraphs[0]
p_sub.text = "High-Speed, Zero-Cost Ethereum Simulation for RedFlow Smart Contract Testing"
p_sub.font.name = "Segoe UI"
p_sub.font.size = Pt(14)
p_sub.font.color.rgb = RGBColor(100, 116, 139)

# 3. Left Column: Core Pillars (3 Cards)
card_w = Inches(5.6)
card_h = Inches(1.4)
left_x = Inches(0.8)
start_y = Inches(2.1)
gap_y = Inches(0.25)

left_items = [
    ("Local Private EVM Network",
     "Runs an isolated Ethereum Virtual Machine on Chain ID 1337 (RPC: http://127.0.0.1:8545). Eliminates reliance on external internet connections and public testnet downtime."),
    ("Zero-Cost & Instant Mining",
     "Contracts and state updates execute in milliseconds without spending real or faucet ETH. Allows rapid testing of donor verification and blood bag creation workflows."),
    ("100% EVM Compatibility",
     "Executes identical Solidity 0.8.20 bytecode and Keccak-256 state hashing as Ethereum Mainnet. Enables seamless future migration to Sepolia or Polygon Layer 2.")
]

for i, (head, body) in enumerate(left_items):
    y = start_y + i * (card_h + gap_y)
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, y, card_w, card_h)
    card.fill.solid()
    card.fill.fore_color.rgb = RGBColor(255, 255, 255)
    card.line.color.rgb = RGBColor(226, 232, 240)
    card.line.width = Pt(1.5)
    
    tf = card.text_frame
    tf.word_wrap = True
    tf.margin_left = Inches(0.25)
    tf.margin_top = Inches(0.18)
    tf.margin_right = Inches(0.25)
    tf.margin_bottom = Inches(0.15)
    
    p1 = tf.paragraphs[0]
    p1.text = head
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(14)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(185, 28, 28)
    p1.space_after = Pt(4)
    
    p2 = tf.add_paragraph()
    p2.text = body
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(11)
    p2.font.color.rgb = RGBColor(71, 85, 105)

# 4. Right Column: Technical Spec Box & Comparison Table
right_x = Inches(6.8)

# Spec Box
spec_h = Inches(2.25)
spec_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x, start_y, card_w, spec_h)
spec_card.fill.solid()
spec_card.fill.fore_color.rgb = RGBColor(240, 249, 255)
spec_card.line.color.rgb = RGBColor(186, 230, 253)
spec_card.line.width = Pt(1.5)

tf_spec = spec_card.text_frame
tf_spec.word_wrap = True
tf_spec.margin_left = Inches(0.25)
tf_spec.margin_top = Inches(0.18)
tf_spec.margin_right = Inches(0.25)

p_sh = tf_spec.paragraphs[0]
p_sh.text = "Network Configuration Parameters"
p_sh.font.name = "Segoe UI"
p_sh.font.size = Pt(14)
p_sh.font.bold = True
p_sh.font.color.rgb = RGBColor(3, 105, 161)
p_sh.space_after = Pt(8)

specs = [
    ("Network Architecture:", "Private Local Ethereum EVM (Ganache)"),
    ("RPC Endpoint:", "http://127.0.0.1:8545 (or 7545)"),
    ("Chain / Network ID:", "1337 (EVM Compatible)"),
    ("Smart Contract Address:", "0xA990b5Fe5948cC41648eE4D8D26Ac5f5FE9557BE"),
    ("Deployer / Admin Address:", "0xA00D124986D984cA438f646903f3A3f485167154")
]

for label, val in specs:
    p = tf_spec.add_paragraph()
    p.text = f"• {label} {val}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(10.5)
    p.font.color.rgb = RGBColor(30, 58, 138)
    p.space_after = Pt(2)

# Benefit Box
comp_y = start_y + spec_h + Inches(0.2)
comp_h = Inches(2.25)
comp_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x, comp_y, card_w, comp_h)
comp_card.fill.solid()
comp_card.fill.fore_color.rgb = RGBColor(254, 243, 199)
comp_card.line.color.rgb = RGBColor(252, 211, 77)
comp_card.line.width = Pt(1.5)

tf_comp = comp_card.text_frame
tf_comp.word_wrap = True
tf_comp.margin_left = Inches(0.25)
tf_comp.margin_top = Inches(0.18)
tf_comp.margin_right = Inches(0.25)

p_ch = tf_comp.paragraphs[0]
p_ch.text = "Key Benefits in RedFlow Development"
p_ch.font.name = "Segoe UI"
p_ch.font.size = Pt(14)
p_ch.font.bold = True
p_ch.font.color.rgb = RGBColor(146, 64, 14)
p_ch.space_after = Pt(8)

benefits = [
    ("Pre-Funded Accounts: ", "10 test accounts with 100 simulated ETH for admin operations."),
    ("Zero Gas Costs: ", "No expenditure required during repetitive donor verification tests."),
    ("Instant Feedback: ", "Block confirmation under 100ms enables live web app interactions."),
    ("Deterministic Keypairs: ", "Persistent test accounts simplify backend automated testing.")
]

for b_head, b_desc in benefits:
    p = tf_comp.add_paragraph()
    p.text = f"✓ {b_head}{b_desc}"
    p.font.name = "Segoe UI"
    p.font.size = Pt(10.5)
    p.font.color.rgb = RGBColor(120, 53, 15)
    p.space_after = Pt(2)

# Output PPTX
out_pptx = r'c:\Users\prajw\Desktop\RedFlow\docs\slides\RedFlow_Ganache_Blockchain_Slide.pptx'
prs.save(out_pptx)
print("Saved single PPT slide to:", out_pptx)
