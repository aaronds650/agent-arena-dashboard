# Design Guidelines: Institutional-Grade Crypto Trading Dashboard

## Design Approach

**Selected Approach**: Design System (Fluent Design) + Financial Dashboard Best Practices

This dashboard prioritizes data density, clarity, and professional visual hierarchy inspired by institutional trading platforms like Bloomberg Terminal and TradingView. The design balances information density with readability through strategic use of whitespace, clear typography, and purposeful color-coding.

---

## Core Design Elements

### A. Typography

**Font Family**: 
- Primary: Inter or Roboto (via Google Fonts CDN) - excellent for data-dense interfaces
- Monospace: JetBrains Mono for numerical data (prices, PnL values)

**Type Scale**:
- Hero/Dashboard Title: text-2xl font-bold (24px)
- Section Headers: text-lg font-semibold (18px)
- Table Headers: text-sm font-medium uppercase tracking-wide (14px)
- Body/Data: text-sm (14px) for density
- Small/Metadata: text-xs text-gray-600 (12px)
- Numerical Data: font-mono for tabular alignment

**Hierarchy Rules**:
- Keep text black (text-gray-900) or dark gray (text-gray-700) - never use strategy colors for primary text
- Use font-weight variations (medium, semibold, bold) to establish hierarchy
- Apply uppercase + letter-spacing for table headers and labels

---

### B. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** consistently
- Component padding: p-4, p-6
- Section gaps: gap-6, gap-8
- Card/panel spacing: p-6, p-8
- Table cell padding: px-4 py-3

**Screen Division**:
- Header: Fixed height ~80px (h-20)
- Hero Zone (Equity Curve): 60% of remaining viewport (use flex-grow and proportional heights)
- Detail Zone (Tabs): 40% of remaining viewport
- Use `h-screen flex flex-col` for full-height layout management

**Container Strategy**:
- Full-width sections with max-w-[1800px] mx-auto for ultra-wide monitor support
- No artificial width constraints on data tables - let them breathe
- Horizontal overflow with scroll for wide tables if needed

---

### C. Color System

**Background Theme**: Light/White (bg-white or bg-gray-50)

**Strategy Color Mapping** (Use ONLY for identification via borders/accents):

| Strategy ID | Color Name | Tailwind Class | Usage |
|-------------|-----------|----------------|-------|
| Grok_Comprehensive | Dark Red | border-red-900 | Left border-l-4 |
| Grok_Pattern | Light Red | border-red-400 | Left border-l-4 |
| Grok_Ichimoku | Black | border-gray-900 | Left border-l-4 |
| OpenAI_Comprehensive | Dark Green | border-green-900 | Left border-l-4 |
| OpenAI_Pattern | Light Green | border-green-400 | Left border-l-4 |
| Gemini_Comprehensive | Dark Blue | border-blue-900 | Left border-l-4 |
| Gemini_Pattern | Light Blue | border-blue-400 | Left border-l-4 |

**Application Rules**:
- Table rows: White background + `border-l-4 border-{strategy-color}` only
- Chart lines: Use matching colors for line strokes
- Never tint entire backgrounds - keep them clean white/gray-50
- Status chips: bg-gray-100 with dark text for "Observation Mode"

---

### D. Component Library

**1. Header Scoreboard**
- Clean horizontal layout with dividers (divide-x divide-gray-200)
- Metrics displayed as: Label (text-xs uppercase) + Value (text-2xl font-bold)
- Status chip: Small pill-shaped badge with subtle background

**2. Hero Zone - Equity Curve Chart**
- Use Recharts library for clean, professional charts
- Multi-line chart with 7 color-coded lines
- Grid lines: Subtle gray (stroke-gray-200)
- Legend: Horizontal layout below chart with color dots + strategy names
- Tooltips: Show timestamp + all 7 strategy values on hover
- Y-axis: Currency format ($10,000)
- X-axis: Time labels

**3. Tabbed Interface**
- Tabs: Horizontal with underline indicator (border-b-2) for active state
- Tab buttons: px-6 py-3 with hover states
- Content area: White background with subtle shadow (shadow-sm)

**4. Data Tables** (Positions, Leaderboard)
- Header row: bg-gray-50 with bold uppercase text
- Data rows: White background, border-b border-gray-100 for separation
- Left color border: border-l-4 border-{strategy-color}
- Hover state: bg-gray-50 transition
- Sortable columns: Arrow icon (Heroicons) in header
- Monospace font for numerical columns (prices, PnL, percentages)
- Align numbers right, text left

**5. Decision Log (Activity Feed)**
- Card-based layout with vertical stacking
- Each card: White background, rounded-lg, border-l-4 border-{strategy-color}, shadow-sm
- Card padding: p-4
- Timestamp: text-xs text-gray-500 at top
- Rationale text: text-sm full-width, allowing multi-line

**6. Strategy View Modal**
- Full-screen overlay: bg-black/50 backdrop
- Modal panel: bg-white, max-w-4xl, rounded-lg, shadow-2xl
- Header with asset name (text-xl font-bold) and close button
- Math grid table showing all 7 strategies' signals for selected asset
- Prominent display of Z-Score, Slope, VWAP Dist in monospace font

**7. PnL Display**
- Positive PnL: text-green-600
- Negative PnL: text-red-600
- Always include +/- sign and currency symbol

---

### E. Animations

**Minimal and Purposeful Only**:
- Table row hover: Simple bg-gray-50 transition
- Tab switching: No animation - instant content swap
- Modal open/close: Simple fade-in/out (200ms)
- Data updates: No flash/highlight effects - keep stable for data reading
- Chart: No animated line drawing - institutional dashboards load instantly

---

## Images

**No images required** - This is a data-first dashboard. All visual interest comes from:
- Color-coded strategy borders
- Dynamic equity curve charts
- Well-structured data tables
- Clean typography hierarchy

The only potential graphic: A simple logo mark in the header (can be text-based logo using brand typography).