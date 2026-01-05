# Andes Motor — App Branding Rules (Codex Guide)

This document translates the **Andes Motor Corporate Identity Manual** into **practical UI rules** for a web/mobile app.

---

## 1) Color System

### 1.1 Official brand colors (do not alter)
These are the corporate colors used to reproduce the full-color logo and must **never be altered**. :contentReference[oaicite:0]{index=0}

- **Andes Blue (Primary)**  
  - Pantone **280 C**  
  - HEX **#002D74** :contentReference[oaicite:1]{index=1}

- **Andes Cyan (Secondary / Accent)**  
  - Pantone **2925**  
  - HEX **#0096D6** :contentReference[oaicite:2]{index=2}

- **Complementary Gray (Neutral support)**
  - Pantone **428 C**
  - CMYK **C28 M18 Y18 K2** :contentReference[oaicite:3]{index=3}  
  - Note: the manual does not provide HEX here; if you need HEX, convert Pantone 428C using your official Pantone→sRGB workflow.

### 1.2 UI usage rules (what to use, when)
Use the palette consistently and keep the interface “clean and ordered” next to the brand mark. :contentReference[oaicite:4]{index=4}

**Primary (Blue #002D74)**
- Use for: top navigation/header, primary CTA buttons, key highlights, active states (when Cyan is too loud).
- Avoid: using it as body text color on white for long paragraphs (use near-black or gray for readability).

**Secondary (Cyan #0096D6)**
- Use for: highlights, links, focus rings, stepper “current step”, badges, small accents.
- Avoid: using as the only indicator of state (also use icons/labels).

**Neutrals**
- Backgrounds: prefer white/very light neutral.
- Lines/dividers: Complementary Gray (Pantone 428C conversion).
- Text: near-black for long-form text; reserve brand colors for UI emphasis.

---

## 2) Typography

### 2.1 Font family
**Gotham** is the official typeface for printed and digital applications. :contentReference[oaicite:5]{index=5}

Available weights to use:
- **Gotham Light**
- **Gotham Regular**
- **Gotham Medium**
- **Gotham Bold** :contentReference[oaicite:6]{index=6}

### 2.2 When to use each weight (UI mapping)
The manual explicitly suggests: **Title = Bold, Subtitle = Medium, Text = Light**. :contentReference[oaicite:7]{index=7}

Use this mapping in the app:
- **Page titles / screen headers:** Gotham **Bold**
- **Section titles / step titles / card titles:** Gotham **Medium**
- **Body text / helper text:** Gotham **Light**
- **Form labels / table headers:** Gotham **Regular** or **Medium** (choose Medium if you need stronger hierarchy)

---

## 3) Layout & Spacing (Digital)

### 3.1 Minimum margins
- **Mobile / vertical formats:** keep content “safe” using **1% to 3% of screen width** (choose based on how narrow the format is). :contentReference[oaicite:8]{index=8}  
- **Web:** for content that should *not* go edge-to-edge, use **minimum 20px left/right** margins. :contentReference[oaicite:9]{index=9}

Top/bottom spacing is “as needed” by layout criteria. :contentReference[oaicite:10]{index=10}

---

## 4) Logo Rules (for app header, login, splash)

### 4.1 Allowed versions
- **Main / preferred:** **Semi-horizontal** version. :contentReference[oaicite:11]{index=11}  
- **Exceptional only (space restricted):** vertical or horizontal alternatives. :contentReference[oaicite:12]{index=12}  

### 4.2 Clear space (protection area)
The logo protection area corresponds **ideally to 3 modules** (from the construction grid). :contentReference[oaicite:13]{index=13}

### 4.3 Strict “don’ts” (must enforce)
Do not:
- alter composition, decompose the mark, change proportions/orientation
- deform, outline, change colors, or tilt (except inside patterns as an exception) :contentReference[oaicite:14]{index=14}

### 4.4 Background usage
- Prefer the logo in corporate colors.
- On photo backgrounds, ensure **clean readability** and enough contrast. :contentReference[oaicite:15]{index=15}

---

## 5) Core UI Components (how to style them with Andes Motor)

> The manual defines colors + typography + spacing. The rules below apply those brand constraints to common app components.

### 5.1 Buttons

**Primary Button (Main CTA)**
- Background: **Andes Blue #002D74**
- Text: white
- Use for: primary actions (Save, Continue, Confirm)
- Hover/Active: add **Cyan #0096D6** as accent (e.g., subtle glow, underline, top border, or focus ring) while keeping the primary fill stable.

**Secondary Button (Alternative action)**
- Background: transparent/white
- Border + text: Andes Blue #002D74
- Use for: secondary actions (Back, Cancel, Edit)

**Tertiary / Link Button**
- Text: Andes Blue #002D74
- Hover: underline or switch to Cyan #0096D6
- Use for: low-priority actions in dense areas (tables, cards)

**Disabled**
- Use neutral gray (Pantone 428C conversion) for border/text; reduce emphasis.

### 5.2 Steppers (multi-step flows)

**Structure**
- Horizontal stepper for desktop, vertical for mobile when space is tight (respect mobile safe margins 1–3%). :contentReference[oaicite:16]{index=16}  
- Each step has: (1) indicator (circle), (2) label, (3) optional helper text.

**States**
- **Current step:** Cyan (#0096D6) emphasis + Gotham Medium label
- **Completed step:** Andes Blue (#002D74) emphasis + check icon
- **Upcoming step:** neutral gray emphasis

**Typography**
- Step label: Gotham **Medium**
- Helper/description: Gotham **Light** :contentReference[oaicite:17]{index=17}

**Spacing**
- Use consistent gaps and keep the layout clean; on web, keep at least **20px** left/right margins for non-edge-to-edge content. :contentReference[oaicite:18]{index=18}

---

## 6) Imagery Style (if the app uses photos)

The brand should communicate **closeness, empathy, and expert advice**. Use images that show support, guidance, and accompaniment. :contentReference[oaicite:19]{index=19}

**Product imagery**
Vehicles/machinery should appear as a **fan arrangement** in an open frontal shot, with the biggest/most important equipment centered. :contentReference[oaicite:20]{index=20}

---

## 7) Co-branding (if the app shows represented brands)

When Andes Motor appears alongside represented brands:
- Use represented brands in their **own colors**, or convert them to **monochrome**.
- Monochrome is recommended to keep a **cleaner, more ordered** visual next to Andes Motor. :contentReference[oaicite:21]{index=21}

---

## 8) Implementation Tokens (copy/paste starter)

```css
:root {
  /* Brand */
  --am-blue: #002D74;   /* Pantone 280 C */
  --am-cyan: #0096D6;   /* Pantone 2925 */

  /* Neutral (set via official Pantone 428C conversion) */
  --am-gray-428: #C7CBD1; /* placeholder: replace with your Pantone->sRGB conversion */

  /* Typography */
  --am-font: "Gotham", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;

  /* Layout */
  --am-web-min-margin: 20px;
}
