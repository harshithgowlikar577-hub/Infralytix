# INFRALYTIX — Design System & UI/UX Master Specification
## Enterprise Infrastructure Intelligence Platform Design Standard

> **Document Type**: Single Source of Truth (SSOT) for UI/UX, Design Tokens, Layouts, and Component Standards  
> **Brand**: INFRALYTIX  
> **Classification**: Government-Grade Decision Intelligence / National Operations Console  
> **Target Audience**: Ministry Secretaries, PM GatiShakti, PMUs, Infrastructure Authorities, Chief Engineers, Enterprise EPCs  
> **Version**: 2.0 • Desktop-First • Dual Theme (Dark Command & Light Executive)

---

## 1. Product Vision & Strategic Intent

### 1.1 Mission Statement
**INFRALYTIX** is India's sovereign AI-powered Infrastructure Intelligence Platform engineered to monitor, forecast, and de-risk national capital projects valued at ₹150 Crore and above. Built as an autonomous decision layer over statutory monitoring systems (including MoSPI’s PAIMANA, OCMS, and PM GatiShakti), INFRALYTIX transforms infrastructure management from **retrospective reporting** to **predictive early warnings and prescriptive intervention**.

```
       ██╗███╗   ██╗███████╗██████╗  █████╗ ██╗  ██╗   ██╗████████╗██╗██╗  ██╗
       ██║████╗  ██║██╔════╝██╔══██╗██╔══██╗██║  ╚██╗ ██╔╝╚══██╔══╝██║╚██╗██╔╝
       ██║██╔██╗ ██║█████╗  ██████╔╝███████║██║   ╚████╔╝    ██║   ██║ ╚███╔╝ 
       ██║██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║██║    ╚██╔╝     ██║   ██║ ██╔██╗ 
       ██║██║ ╚████║██║     ██║  ██║██║  ██║███████╗██║      ██║   ██║██╔╝ ██╗
       ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝      ╚═╝   ╚═╝╚═╝  ╚═╝
```

### 1.2 Core Capabilities
1. **Monitor Infrastructure Projects**: Real-time multi-sector portfolio surveillance (Roads, Rail, Power, Ports, Urban, Aviation, Water).
2. **Predict Delays**: Multi-horizon schedule slippage prediction algorithms computing expected delays in calendar days/months with probability density cones.
3. **Predict Cost Overruns**: Anticipated capital escalation forecasting in ₹ Lakh Crore with confidence bounds.
4. **Detect Emerging Risks**: Dynamic multidimensional composite scoring (0–100) tracking velocity and acceleration before a milestone breaches SLA.
5. **Compare Projects with Historical Failures**: Pattern recognition matching live projects with historical failure signatures (Project Failure DNA™).
6. **Recommend Interventions**: Prescriptive, deterministic decision trees that calculate optimal resource, statutory, and contractual countermeasures.
7. **Generate Early Warnings**: Real-time triage feeds dispatching proactive notifications to cabinet and nodal agency leadership.
8. **Support Data-Driven Governance**: Automated Common Upload Format (CUF) compliance audits and verifiable data integrity scoring.

### 1.3 The National Command Center Experience
The platform must project the gravity, rigor, and technical authority of a **National Operations Center (NOC)**. It operates as an executive mission-control station where senior leaders can answer critical governance questions within 30 seconds of landing.

---

## 2. Target User Personas & Cognitive Profiles

| Persona Group | Key Roles | Primary Cognitive Need | Design Response |
| :--- | :--- | :--- | :--- |
| **Executive Leadership** | Cabinet Secretary, Ministry Secretaries, PM GatiShakti Apex Group | Macro portfolio visibility, capital exposure (₹ Cr), top deteriorating assets | High-contrast KPI ribbons, bubble matrices, executive briefing PDFs |
| **Operational Command** | Project Monitoring Units (PMUs), Implementing Agencies (NHAI, RVNL, NTPC) | Root-cause isolation, critical path milestone slippages, contractor status | 360° Project Dossiers, SHAP feature attributions, Gantt slippage flows |
| **Regional & Nodal Authorities** | State Governments, Chief Engineers, Divisional Commissioners | Spatial corridor health, Right-of-Way (RoW) chokepoints, forest clearances | GIS interactive map, corridor telemetry panels, district aggregations |
| **Audit & Policy Analysts** | IPMD Risk Auditors, Infrastructure Consultants | Statistical validation, historical failure benchmarks, data hygiene | Model Intelligence Lab, Failure DNA clustering, CUF audit gates |
| **Enterprise Contractors** | Major EPC Companies, Concessionaires | Milestone alignment, statutory clearance escalation tracking, billing sanity | Progress vs. expenditure S-curves, bottleneck ticket resolution |

---

## 3. Brand Personality & Visual Direction

### 3.1 Core Attributes
- **Professional**: Uncompromising clarity, balanced proportions, and surgical alignment.
- **Trustworthy**: Every AI prediction is accompanied by confidence bounds and historical evidence.
- **Authoritative**: Institutional aesthetic conveying national sovereignty and institutional rigor.
- **Analytical**: Tabular precision, multi-axis visualizations, and scannable visual telemetry.
- **Predictive**: Clear visual distinction between historical facts and forecasted trajectories.
- **Action-Oriented**: Never present an alert without actionable prescriptive next steps.
- **Government Grade**: Engineered for zero downtime, multi-monitor video walls, and executive readability.

### 3.2 Strict Avoidance Directives
- **NO Startup/SaaS Fluff**: No pastel bubble shapes, cartoon illustrations, celebratory confetti, or playful copy.
- **NO Crypto/Web3 Tropes**: No dark purple neon gradients, glowing wireframe globes, or iridescent card borders.
- **NO Gaming Dashboard Styles**: No sci-fi HUD borders, hexagonal decorative widgets, or high-saturation glow bloat.
- **NO Consumer Social Patterns**: No infinite micro-feed clutter, likes, or uncalibrated notification badges.
- **NO Generic Admin Templates**: No off-the-shelf bootstrap look, generic light gray cards, or cramped default tables.

---

## 4. Color Architecture & Dual-Theme System

The color system uses high-contrast functional palettes designed for extended analytical scrutiny. The platform supports **Dark Theme (Command Center NOC)** as the primary operational environment and **Light Theme (Executive Briefing)** for daylight office and print use.

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   INFRALYTIX PALETTE                                     │
├──────────────────────────┬──────────────────────────┬────────────────────────────────────┤
│ Deep Infrastructure Blue │ Governance Green         │ Intelligence Cyan                  │
│ Dark: #2563EB | Light: #1D4ED8│ Dark: #10B981 | Light: #059669│ Dark: #38BDF8 | Light: #0284C7     │
├──────────────────────────┼──────────────────────────┼────────────────────────────────────┤
│ Success (Optimal)        │ Warning (Attention)      │ Risk (High Escalation)             │
│ #10B981                  │ #F59E0B                  │ #F97316                            │
├──────────────────────────┴──────────────────────────┴────────────────────────────────────┤
│ Critical (Emergency Alarm)                          │ Neutral (Slate Gray Scale)         │
│ Dark: #991B1B / #EF4444 | Light: #B91C1C            │ 50, 100, 200, 300, 400, 500, 600,  │
│                                                     │ 700, 800, 900, 950                 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Design Tokens (CSS Variables)

```css
:root {
  /* ==================== DARK COMMAND THEME (PRIMARY) ==================== */
  --theme-mode: 'dark';

  /* Surface & Base Canvas */
  --bg-app: #0B0F19;               /* Deep Space Obsidian (App Canvas) */
  --bg-surface-1: #111827;         /* Base Panel / Main Card Surface */
  --bg-surface-2: #1F2937;         /* Elevated Container / Sliding Panel / Popover */
  --bg-surface-hover: #374151;     /* Interactive Hover State */
  --bg-surface-active: #4B5563;    /* Pressed / Active State */

  /* Structural Borders */
  --border-subtle: #1E293B;        /* Secondary Dividers */
  --border-default: #334155;       /* Card & Container Borders */
  --border-strong: #475569;        /* High-Contrast Structural Dividers */
  --border-focus: #38BDF8;         /* Focus Ring / Keyboard Navigation */

  /* Typography */
  --text-primary: #F8FAFC;         /* 98% Light Slate — Headlines & Critical KPIs */
  --text-secondary: #94A3B8;       /* Slate 400 — Subtitles, Column Headers, Labels */
  --text-muted: #64748B;           /* Slate 500 — Timestamps, Footers, Captions */
  --text-inverse: #0B0F19;         /* Dark Text on Light Pills */

  /* Primary Brand: Deep Infrastructure Blue */
  --color-primary: #2563EB;        /* Sovereign Blue 600 */
  --color-primary-hover: #1D4ED8;  /* Sovereign Blue 700 */
  --color-primary-light: #60A5FA;  /* Blue 400 */
  --color-primary-subtle: rgba(37, 99, 235, 0.15);

  /* Secondary Brand: Governance Green */
  --color-secondary: #10B981;      /* Emerald 500 */
  --color-secondary-hover: #059669;/* Emerald 600 */
  --color-secondary-subtle: rgba(16, 185, 129, 0.15);

  /* Accent: Intelligence Cyan */
  --color-accent: #38BDF8;         /* Sky Cyan 400 */
  --color-accent-hover: #0EA5E9;   /* Sky Cyan 500 */
  --color-accent-subtle: rgba(56, 189, 248, 0.15);

  /* Semantic Status Tokens (Dark) */
  --status-healthy: #10B981;
  --status-healthy-bg: rgba(16, 185, 129, 0.12);
  --status-healthy-border: #059669;

  --status-warning: #F59E0B;
  --status-warning-bg: rgba(245, 158, 11, 0.12);
  --status-warning-border: #D97706;

  --status-risk: #F97316;
  --status-risk-bg: rgba(249, 115, 22, 0.12);
  --status-risk-border: #EA580C;

  --status-critical: #EF4444;
  --status-critical-bg: rgba(239, 68, 68, 0.18);
  --status-critical-border: #B91C1C;
  --status-critical-pulse: #991B1B;

  /* Epistemic Provenance Tokens */
  --provenance-observed: #0284C7;   /* Empirical Past Facts */
  --provenance-predicted: #8B5CF6;  /* Machine Learning Forecast */
  --provenance-scenario: #EC4899;   /* Prescriptive / What-If */
  --provenance-gis: #14B8A6;        /* Telemetry & Spatial */
}

/* ==================== LIGHT EXECUTIVE THEME ==================== */
[data-theme="light"], .light {
  --theme-mode: 'light';

  /* Surface & Base Canvas */
  --bg-app: #F8FAFC;               /* Sovereign Alabaster */
  --bg-surface-1: #FFFFFF;         /* Pure Card White */
  --bg-surface-2: #F1F5F9;         /* Elevated / Section Background */
  --bg-surface-hover: #E2E8F0;     /* Interactive Hover State */
  --bg-surface-active: #CBD5E1;    /* Pressed / Active State */

  /* Structural Borders */
  --border-subtle: #E2E8F0;        /* Secondary Dividers */
  --border-default: #CBD5E1;       /* Card & Container Borders */
  --border-strong: #94A3B8;        /* High-Contrast Structural Dividers */
  --border-focus: #1D4ED8;         /* Focus Ring */

  /* Typography */
  --text-primary: #0F172A;         /* Slate 900 — Maximum Contrast Headings */
  --text-secondary: #475569;       /* Slate 600 — Balanced Secondary Text */
  --text-muted: #64748B;           /* Slate 500 — Captions & Timestamps */
  --text-inverse: #FFFFFF;         /* White Text on Dark Pills */

  /* Primary Brand: Deep Infrastructure Blue (Enhanced Contrast for Light Mode) */
  --color-primary: #1D4ED8;        /* Sovereign Blue 700 */
  --color-primary-hover: #1E40AF;  /* Sovereign Blue 800 */
  --color-primary-light: #2563EB;  /* Blue 600 */
  --color-primary-subtle: rgba(29, 78, 216, 0.08);

  /* Secondary Brand: Governance Green */
  --color-secondary: #059669;      /* Emerald 600 */
  --color-secondary-hover: #047857;/* Emerald 700 */
  --color-secondary-subtle: rgba(5, 150, 105, 0.08);

  /* Accent: Intelligence Cyan */
  --color-accent: #0284C7;         /* Sky Blue 600 */
  --color-accent-hover: #0369A1;   /* Sky Blue 700 */
  --color-accent-subtle: rgba(2, 132, 199, 0.08);

  /* Semantic Status Tokens (Light) */
  --status-healthy: #059669;
  --status-healthy-bg: #ECFDF5;
  --status-healthy-border: #A7F3D0;

  --status-warning: #D97706;
  --status-warning-bg: #FFFBEB;
  --status-warning-border: #FDE68A;

  --status-risk: #EA580C;
  --status-risk-bg: #FFF7ED;
  --status-risk-border: #FED7AA;

  --status-critical: #B91C1C;
  --status-critical-bg: #FEF2F2;
  --status-critical-border: #FECACA;
  --status-critical-pulse: #991B1B;
}
```

---

## 5. Status System & Alert Matrix

Status indicators are mission-critical. Every status tier must strictly couple a **semantic color**, **dedicated icon**, **structured badge**, and **alert pattern** to eliminate misinterpretation.

```
┌──────────────┬──────────────────┬─────────────────┬───────────────────────────────────────────┐
│ STATUS       │ SEMANTIC TOKEN   │ ICON (Lucide)   │ BEHAVIOR & INTERVENTION LEVEL             │
├──────────────┼──────────────────┼─────────────────┼───────────────────────────────────────────┤
│ Healthy      │ #10B981 (Green)  │ CheckCircle2    │ Project on schedule & within sanction     │
│ Warning      │ #F59E0B (Amber)  │ AlertCircle     │ Slippage < 3 Mo; velocity drop detected   │
│ High Risk    │ #F97316 (Orange) │ AlertTriangle   │ Cost/Time overrun predicted > 15%         │
│ Critical     │ #EF4444 (Red)    │ ShieldAlert     │ Severe blockage; Cabinet triage required  │
└──────────────┴──────────────────┴─────────────────┴───────────────────────────────────────────┘
```

### 5.1 Status Specifications

#### 1. Healthy (Score 0–30)
- **Visual Identity**: Governance Green (`#10B981` / `#059669`).
- **Icon**: `CheckCircle2` (Lucide).
- **Badge**: Solid border, green tinted pill: `● HEALTHY (Score: 18)`.
- **Alert Pattern**: Silent operational status; included in weekly summary rollups.

#### 2. Warning (Score 31–50)
- **Visual Identity**: Amber Gold (`#F59E0B` / `#D97706`).
- **Icon**: `AlertCircle` (Lucide).
- **Badge**: Amber tinted pill: `▲ WATCH (Score: 42)`.
- **Alert Pattern**: Amber left-border banner on project dossier; highlighted in PMU weekly review.

#### 3. High Risk (Score 51–70)
- **Visual Identity**: Escalation Orange (`#F97316` / `#EA580C`).
- **Icon**: `AlertTriangle` (Lucide).
- **Badge**: High-contrast orange pill: `▲ HIGH RISK (Score: 68)`.
- **Alert Pattern**: Orange header highlight; automatic notification to Ministry Nodal Officer with SHAP driver preview.

#### 4. Critical (Score 71–100)
- **Visual Identity**: Emergency Crimson (`#EF4444` / `#B91C1C`) with Deep Ruby pulse (`#991B1B`).
- **Icon**: `ShieldAlert` (Lucide).
- **Badge**: Pulsing red alert pill with beacon animation: `⚠ CRITICAL (Score: 89)`.
- **Alert Pattern**: Full-width alert banner with audio chime trigger option, instant placement on Cabinet Top-10 Deteriorating Asset Radar, and immediate dispatch to ministerial triage queue.

---

## 6. Typography System

The typography system is engineered for **extreme legibility across dense data tables, financial figures, and geospatial telemetry**.

### 6.1 Font Families
- **Primary Interface**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Enabled OpenType Features: `cv02=1`, `cv03=1`, `cv04=1`, `cv11=1`, `tnum=1` (Tabular Numbers for alignment).
- **Monospace Telemetry & Figures**: `'JetBrains Mono', 'Fira Code', monospace`
  - Used for: Project IDs (`INF0001`), financial figures (`₹42,780.50 Cr`), dates (`2026-09-11`), GPS coordinates, and delta percentages (`+14.2%`).

### 6.2 Typography Scale & Hierarchy

| Hierarchy Level | Font Family | Size (px / rem) | Line Height | Weight | Letter Spacing | Application |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Inter | 36px / 2.25rem | 44px / 2.75rem | 800 (Bold) | -0.025em | Command Center Macro Portfolio Totals |
| **Heading 1** | Inter | 24px / 1.5rem | 32px / 2.0rem | 700 (Bold) | -0.02em | Screen Titles, Dossier Project Header |
| **Heading 2** | Inter | 18px / 1.125rem | 24px / 1.5rem | 600 (SemiBold) | -0.01em | Module & Section Titles, Modal Headers |
| **Heading 3** | Inter | 15px / 0.9375rem| 20px / 1.25rem | 600 (SemiBold) | -0.005em | Widget Subheaders, Drawer Panel Titles |
| **Body Large** | Inter | 16px / 1.0rem | 24px / 1.5rem | 400 / 500 | 0.0em | Executive Briefing Narrative, AI Summaries |
| **Body Regular**| Inter | 14px / 0.875rem | 20px / 1.25rem | 400 (Regular) | 0.0em | Table Content, Descriptions, Form Inputs |
| **Caption** | Inter | 12px / 0.75rem | 16px / 1.0rem | 500 (Medium) | +0.01em | Column Headers, Badges, Timestamps |
| **Micro** | Inter | 10px / 0.625rem | 14px / 0.875rem | 600 (SemiBold) | +0.05em | Uppercase Category Tags, Pill Subtext |
| **Mono Metric** | JetBrains Mono| 14px / 0.875rem | 20px / 1.25rem | 600 (SemiBold) | 0.0em | Currency Amounts, Percentages, Lat/Long |

---

## 7. Spacing System & Sizing Scale

To ensure structural harmony and avoid arbitrary padding, all margins, paddings, and component dimensions adhere strictly to the **8-Point Enterprise Scale**.

```
┌──────────────┬────────┬────────────────────────────────────────────────────────┐
│ TOKEN        │ VALUE  │ APPLICATION GUIDELINE                                  │
├──────────────┼────────┼────────────────────────────────────────────────────────┤
│ --space-4    │ 4px    │ Micro-spacing, pill padding-y, indicator gaps          │
│ --space-8    │ 8px    │ Icon-to-text gap, compact button padding, badge gaps   │
│ --space-12   │ 12px   │ Compact table cell padding-y, small input padding      │
│ --space-16   │ 16px   │ Standard card padding, standard grid gap, button px    │
│ --space-24   │ 24px   │ Executive card padding, section gap, modal body pad    │
│ --space-32   │ 32px   │ Major dashboard grid gap, screen container margin      │
│ --space-48   │ 48px   │ Large section dividers, top navigation bottom margin   │
│ --space-64   │ 64px   │ Macro command center layout margins, empty state box   │
└──────────────┴────────┴────────────────────────────────────────────────────────┘
```

---

## 8. Layout Principles & Responsive Architecture

The layout is **Desktop-First**, optimized for 1440px+ workstations and multi-monitor operations center video walls, while adapting gracefully down to executive mobile devices.

### 8.1 Screen Breakpoint Matrix

| Device Class | Breakpoint | Viewport Target | Structural Behavior |
| :--- | :--- | :--- | :--- |
| **Command Wall** | `2xl` | 1920px – 3840px | 4-column KPI grid, 60/40 Split Map/Analytics, persistent drawer |
| **Desktop (Primary)**| `xl` | 1440px – 1919px | 4-column KPI grid, 2-column analytics, sliding context drawer |
| **Laptop** | `lg` | 1024px – 1439px | 2-column KPI grid, auto-collapsing sidebar (64px), stacked charts |
| **Tablet** | `md` | 768px – 1023px | Collapsed sidebar, single-column analytics, full-width drawers |
| **Executive Mobile** | `sm` | 375px – 767px | Bottom navigation bar, stacked KPI cards, condensed tables |

### 8.2 Global Command Shell Layout

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: [Logo + Gov Mark] [ 🔍 Global Search ⌘K ]          [● Live Sync] [Theme ☼/☾] [🔔 3] [👤 Sec. MoSPI] │
├──────────────┬───────────────────────────────────────────────────────────────────────────┬───────────────┤
│ SIDEBAR      │ MAIN CONTENT VIEWPORT                                                     │ CONTEXT PANEL │
│ (260px /     │                                                                           │ (360px - 440px│
│  64px        │ • Executive Breadcrumb Trail                                              │  Sliding or   │
│  Collapsed)  │ • Macro Metric KPI Ribbon (4 Cards)                                       │  Dockable)    │
│              │ • Data-Dense Analytical Charts & Split Panes                              │               │
│ • Dashboard  │ • Virtualized High-Density Project Grids                                  │ • SHAP Drill  │
│ • Projects   │                                                                           │ • What-If Sim │
│ • GIS Intel  │                                                                           │ • Triage Chat │
│ • Risk Radar │                                                                           │               │
│ • ...        │                                                                           │               │
├──────────────┴───────────────────────────────────────────────────────────────────────────┴───────────────┤
│ STATUS BAR: 🇮🇳 RESTRICTED • NATIONAL INFRASTRUCTURE PIPELINE • CLASSIFIED TIER 2 • CUF v4.2 COMPLIANT   │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Shell Navigation Architecture

### 9.1 Sidebar Navigation Specifications
The sidebar provides continuous access to all 11 core mission modules. It supports an **Expanded Mode (260px)** and a **Collapsed Tactical Mode (64px)** with instant tooltip hover.

```
┌──────────────────────────────────────────────┐
│ [🇮🇳] INFRALYTIX                              │
│ National Infrastructure Intelligence         │
├──────────────────────────────────────────────┤
│ ⌂  Dashboard         [Executive Mission Hub] │
│ ▣  Projects          [2,000+ Asset Grid]     │
│ ◉  GIS Intelligence  [Spatial Risk Map]      │
│ ◈  Risk Center       [Slippage & Cost Radar] │
│ ♥  Health Center     [Performance & S-Curves]│
│ 🧬 Failure DNA       [Historical Clusters]   │
│ ⚡ Interventions     [Decision Engine]       │
│ ⚠  Early Warnings    [Real-time Triage]  (3) │
│ ◫  Analytics         [Cross-Sector Trends]   │
├──────────────────────────────────────────────┤
│ 🔔 Notifications     [System Alerts]     (5) │
│ ⚙  Settings          [Security & Config]     │
├──────────────────────────────────────────────┤
│ [◄ Collapse Sidebar ( [ )]                   │
└──────────────────────────────────────────────┘
```

- **Active State**: Primary Blue left-border indicator (`3px`), elevated background (`--bg-surface-2`), bold text, and highlighted icon.
- **Hover State**: Subtle background transition (`--bg-surface-hover`) with 150ms ease.
- **Badge Indicators**: Numeric warning pill (`3`) highlighted in Crimson next to *Early Warnings*.

### 9.2 Top Bar Specifications
Height: `56px`. Sticky `z-index: 50`.

1. **Global Search (`Cmd + K` / `Ctrl + K`)**:
   - Universal search dialog with autocomplete covering: Project IDs (`INF0001`), Project Names, Ministries, EPC Contractors, and State Corridors.
2. **System Synchronization Telemetry**:
   - Real-time indicator: `● LIVE SYNC (MoSPI CUF • 11 Sep 2026 13:40 IST)` with green pulse dot.
3. **Theme Switcher**:
   - 1-click toggle between **Dark Command** and **Light Executive** modes with keyboard shortcut `Cmd + Shift + L`.
4. **Notification Drawer Trigger**:
   - Bell icon with unread count pill opening a 380px slide-out triage feed.
5. **Profile & Ministry Switcher**:
   - Avatar badge with name, title (`Secretary, MoRTH`), and role-switching dropdown (*Cabinet Exec* | *Project Director* | *IPMD Auditor*).

---

## 10. Page Intent Matrix & Screen Blueprints

Every screen inside INFRALYTIX answers a single strategic question for the decision-maker.

```
┌────────────────────────┬────────────────────────────────────────────────────────────────────────┐
│ PAGE                   │ STRATEGIC QUESTION & INTENT                                            │
├────────────────────────┼────────────────────────────────────────────────────────────────────────┤
│ 1. Dashboard           │ "What requires attention now?"                                         │
│ 2. Projects            │ "Which projects need monitoring?"                                      │
│ 3. GIS Intelligence    │ "Where are problems located?"                                          │
│ 4. Risk Center         │ "Which projects may fail?"                                             │
│ 5. Health Center       │ "Which projects are unhealthy?"                                        │
│ 6. Failure DNA         │ "What historical patterns exist?"                                      │
│ 7. Intervention Center │ "What should be done?"                                                 │
│ 8. Early Warnings      │ "What immediate alarms have fired?"                                    │
│ 9. Analytics           │ "What macro trends matter across sectors?"                             │
└────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

### 10.1 Screen 1: Dashboard (`/dashboard`)
**Question Answered**: *"What requires attention now?"*

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ TOTAL MONITORED ]         [ CRITICAL RISKS ]          [ CAPITAL AT RISK ]         [ DELAY VELOCITY ]   │
│   1,981 Projects              126 Projects (6.4%)         ₹42,780.40 Crore            +1.4 Mo / Quarter  │
│   ▲ +12 this month            ▲ +8 new critical           11.5% of total portfolio    ▲ Accelerating     │
├─────────────────────────────────────────────┬────────────────────────────────────────────────────────────┤
│ PORTFOLIO RISK BAND DISTRIBUTION            │ SECTOR RISK & EXPOSURE (BUBBLE CHART)                     │
│ ┌─────────────────────────────────────────┐ │  Risk (0-100)                                              │
│ │ Safe 42% │ W 28% │ H 18% │ VH 8% │ C 4% │ │  100 ┼                                                     │
│ └─────────────────────────────────────────┘ │       │                 ● MoRTH (₹14.2k Cr)                │
│  ● Safe: 832     ● Watch: 554   ● High: 356 │   50 ┼    ● Railways                                           │
│  ● Very High: 158 ● Critical: 81            │       │         ● Power          ● Urban Development       │
│                                             │    0 ┴────────┬──────────────┬──────────────┬──────────────│
│                                             │      0       500            1000           1500 Projects   │
├─────────────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ TOP 5 RAPIDLY DETERIORATING ASSETS          │ LIVE EARLY WARNING ALERTS FEED                             │
│ 1. INF0001: Delhi-Mumbai Expressway P-IV    │ [CRITICAL] 12m ago • INF0001: 3 Milestone Failures         │
│    Risk: 38 → 87 (+49 in 60d) [CRITICAL]    │            RoW Forest Clearance Lapsed at KM 142           │
│ 2. INF0042: High-Speed Rail Feeder C3       │ [HIGH] 45m ago • INF0089: Physical progress stalled at     │
│    Risk: 42 → 78 (+36 in 60d) [VERY HIGH]   │            48.2% for 3 consecutive billing cycles          │
│ 3. INF0104: 4000MW Ultra Mega Solar Park    │ [HIGH] 2h ago • INF0312: Contractor mobilization dropped   │
│    Risk: 29 → 64 (+35 in 60d) [HIGH]        │            28% below sanctioned SLA benchmark              │
└─────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

---

### 10.2 Screen 2: Projects Directory (`/projects`)
**Question Answered**: *"Which projects need monitoring?"*

- **Faceted Global Filter Bar**: Ministry, Implementing Agency, Sector, State, Risk Band, Cost Bracket (>₹1,000 Cr), Schedule Slippage (>6 Mo).
- **High-Density Data Grid**: Virtualized display capable of smooth scrolling through 2,000+ records.
- **Key Columns**: Project ID (`JetBrains Mono`), Project Name, Ministry, Sanctioned Cost, Spend Burn %, Physical %, Composite Risk (0–100), Trajectory Vector, 1-Click Action (`Inspect Dossier`).

---

### 10.3 Screen 3: GIS Intelligence Map (`/map`)
**Question Answered**: *"Where are problems located?"*

- **Full-Bleed Geospatial Canvas**: Tactical dark vector tile basemap with state administrative boundary fills.
- **Interactive Layers**:
  1. *Linear Corridors*: Expressways, Dedicated Freight Corridors (DFCs), Gas Pipelines, Transmission Lines.
  2. *Point Asset Hubs*: Ports, Ultra-Mega Power Plants, Railway Terminals, Smart Cities.
  3. *Risk Heatmap Overlay*: Density clustering highlighting multi-project bottlenecks in specific industrial corridors.
- **Chokepoint Telemetry Flyout**: Clicking a disputed KM segment reveals the exact forest/environmental statutory clearance hold-up and owning state department.

---

### 10.4 Screen 4: Risk Center (`/risk-center`)
**Question Answered**: *"Which projects may fail?"*

- **Multi-Axis Risk Radar**: 5-axis dimensional risk breakdown:
  1. *Cost Escalation Risk*
  2. *Schedule Slippage Risk*
  3. *Contractor Velocity Risk*
  4. *Milestone Density Risk*
  5. *Inter-Agency Dependency Risk*
- **Risk Trajectory Velocity Vector**: Sorts projects by $\frac{d(\text{Risk})}{dt}$ to expose assets that are deteriorating rapidly.

---

### 10.5 Screen 5: Health Center (`/health-center`)
**Question Answered**: *"Which projects are unhealthy?"*

- **Dual S-Curve Analytics**: Physical Progress % vs. Financial Spend % over the project lifetime.
- **Capital Burn Mismatch Detector**: Flags projects where financial disbursement is running ahead of verifiable physical execution (e.g., 60% spent but only 38% built).
- **Milestone Velocity Sparklines**: Real-time monthly progress delta against target burn rate.

---

### 10.6 Screen 6: Failure DNA™ Lab (`/failure-dna`)
**Question Answered**: *"What historical patterns exist?"*

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HISTORICAL FAILURE SIGNATURE MATCHING ENGINE                                                             │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ACTIVE ASSET: INF0001 (Vadodara-Mumbai Expressway P-IV) | Risk: 87 (Critical)                            │
│ 🧬 STRUCTURAL DNA MATCH: 84% Match with INF0412 (Eastern Peripheral Expressway 2018)                     │
│                                                                                                          │
│ MATCHED BOTTLENECK ANATOMY:                                                                              │
│ • Delayed Forest Clearance at 35% Physical Progress Point (+8.2 Mo Slippage)                             │
│ • Secondary Contractor Insolvency during Bridge Structural Phase (+₹420 Cr Cost Escalation)              │
│ • Multi-State Utility Shifting Deadlock between PGCIL and State Transco                                  │
│                                                                                                          │
│ HISTORICAL OUTCOME: Restructured after 18-month stall; Total escalation ₹840 Cr.                         │
│ RECOMMENDED PREVENTATIVE LESSON: Execute Section 17(4) Emergency Land Acquisition override immediately.  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 10.7 Screen 7: Intervention Center (`/interventions`)
**Question Answered**: *"What should be done?"*

- **Prescriptive Decision Matrix**: Converts SHAP root-cause drivers into prioritized administrative action checklists.
- **Interactive What-If Scenario Simulator**:
  - Sliders for *Manpower Mobilization (+10% to +50%)*, *Fund Release Acceleration*, *Fast-Track Clearance*.
  - Real-time recalculation of predicted completion dates and cost avoidance.

---

### 10.8 Screen 8: Early Warnings & Analytics (`/alerts` & `/analytics`)
**Question Answered**: *"What immediate alarms have fired?"* and *"What macro trends matter?"*

- **Early Warning Triage Queue**: Ranked by SLA severity with dual actions: `Acknowledge (Log Audit)` and `Escalate to Ministerial Group`.
- **Cross-Sector Analytics**: Macro charts breaking down delay factors across ministries (MoRTH, Railways, Power, Coal, MoHUA).

---

## 11. Component Design Catalog

The component library provides battle-tested, accessible primitives engineered for high-density enterprise analytics.

### 11.1 Buttons (`<Button />`)

```text
┌────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┐
│ PRIMARY                │ SECONDARY              │ OUTLINE / GHOST        │ CRITICAL ACTION        │
│ [  Save & Simulate  ]  │ [  Export Dataset   ]  │ [   Filter View   ]    │ [ ⚠ Escalate to Min  ] │
│ Solid Deep Blue        │ Elevated Slate Surface │ 1px Border Slate       │ Deep Red Solid         │
└────────────────────────┴────────────────────────┴────────────────────────┴────────────────────────┘
```

- **Height Scale**: Compact `32px` (dense tables/toolbars), Standard `38px` (standard actions), Executive `44px` (prominent CTAs).
- **Padding**: `px-4` (16px), `py-2` (8px).
- **Typography**: Inter `13px` / `14px`, weight `600` (SemiBold).
- **States**:
  - `Default`: High contrast, smooth rounded border (`6px`).
  - `:hover`: Subtle 8% brightness shift, 0px border expansion.
  - `:focus-visible`: High-contrast `2px` cyan focus ring (`#38BDF8`) with `2px` offset.
  - `:active`: Scaled 0.98x tactile feedback.
  - `:disabled`: Opacity 40%, cursor `not-allowed`.

### 11.2 Cards (`<Card />`)
- **KPI Stat Card**:
  - Upper micro-label (`text-caption`) + provenance pill (`PREDICTED`).
  - Primary metric in large monospace (`text-display-lg`).
  - Delta badge (`▲ +12% vs last cycle`) in semantic color.
  - Subtle interactive hover elevation (`border-color: var(--color-primary)`).
- **Analytics Container Card**:
  - Structured card header with module icon, title, subtitle, and action buttons (`Download CSV`, `Timeframe Select`).
  - Chart canvas container with responsive height (`280px` to `420px`).
  - Analytical insight footnote explaining statistical significance.
- **Alert Card**:
  - Left status color border (`4px`), severity icon (`ShieldAlert` or `AlertTriangle`), timestamp, project breadcrumb, and triage CTA.
- **Recommendation Card**:
  - Prescriptive action checklist, confidence score (`89%`), simulated delay/cost impact, and direct approval CTA.

### 11.3 Enterprise Tables (`<DataTable />`)
Designed to handle thousands of rows with zero sluggishness.

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ 🔍 Filter by project ID, name, contractor... ]             [ Columns ▼ ] [ Export CSV ] [ Export PDF ] │
├─────────┬────────────────────────────┬─────────────┬──────────────┬────────┬──────────┬──────────┬───────────┤
│ ID ↕    │ Project Name ↕             │ Ministry ↕  │ Cost (₹ Cr)  │ Phys % │ Risk ↕   │ Trend ↕  │ Actions   │
├─────────┼────────────────────────────┼─────────────┼──────────────┼────────┼──────────┼──────────┼───────────┤
│ INF0001 │ Vadodara-Mumbai Exp. P-IV  │ MoRTH       │  ₹4,850.00   │  42.0% │ 87 [CRIT]│ ▲ +14    │ [Inspect] │
│ INF0042 │ High Speed Rail Feeder C3  │ Railways    │ ₹12,400.00   │  68.5% │ 78 [HIGH]│ ▲ +08    │ [Inspect] │
│ INF0089 │ 765kV Power Corridor Grid  │ Power       │  ₹1,250.00   │  92.0% │ 22 [SAFE]│ ▼ -02    │ [Inspect] │
└─────────┴────────────────────────────┴─────────────┴──────────────┴────────┴──────────┴──────────┴───────────┘
```

- **Row Heights**: `32px` (Ultra-Dense Command Mode), `38px` (Standard Daily PMU), `48px` (Executive Briefing).
- **Virtualization**: Supported by `@tanstack/react-table` and `@tanstack/react-virtual` for 2,000+ items.
- **Features**: Sticky column headers, sticky left Project ID column, sort indicators (`↕`), zebra striping, inline micro-sparklines, multi-row checkbox selection.

### 11.4 Filters & Facets (`<FilterBar />` & `<FilterDrawer />`)
- **Quick-Filter Chips**: Dismissible pill tags showing active filters (`Sector: Highways ✕`, `Risk: High+ ✕`).
- **Multi-Select Dropdowns**: Searchable checklist with count indicators and "Select All" toggle.
- **Numeric Range Sliders**: Dual-thumb range sliders for Sanctioned Cost (`₹150 Cr` to `₹50,000 Cr`) and Risk Score (`0` to `100`).
- **Saved Views**: 1-click presets: `My Monitored Projects`, `Top 10 Deteriorating`, `Inter-Agency Escalations`.

### 11.5 Charts & Data Visualizations (`<ChartContainer />`)
- **Container Structure**: Standardized wrapper managing loading state, empty state, legends, and responsive resizing.
- **Palette Binding**: Strict mapping to `--color-primary`, `--status-healthy`, `--status-warning`, `--status-risk`, `--status-critical`.
- **Telemetry Tooltip**: Dark floating card displaying precise timestamp, metric value, confidence bounds, and delta comparison.
- **Export Toolbar**: Built-in 1-click image export (`PNG`, `SVG`) or data table export (`CSV`).

### 11.6 Status & Provenance Badges (`<Badge />`)
- **Semantic Risk Badges**:
  - `Healthy`: Green background tint + green border + `CheckCircle2` icon.
  - `Warning`: Amber background tint + amber border + `AlertCircle` icon.
  - `High Risk`: Orange background tint + orange border + `AlertTriangle` icon.
  - `Critical`: Red background tint + red border + `ShieldAlert` icon + pulse animation.
- **Provenance Badges**:
  - `OBSERVED`: `#0284C7` (Sky Blue) solid pill indicating factual historical records.
  - `PREDICTED`: `#8B5CF6` (Violet) subtle shimmer pill indicating machine learning inference.
  - `SCENARIO`: `#EC4899` (Magenta) dashed border pill indicating interactive user simulation.

### 11.7 Alert Banners & Inline Alarms (`<Alert />`)
- **Severity Levels**: Informational, Warning, High Risk, Critical Emergency.
- **Visual Anatomy**:
  - `4px` solid semantic border on left margin.
  - Elevated card background with 12% opacity tint of semantic color.
  - Prominent Lucide icon (`w-5 h-5`) aligned to title.
  - Bold summary headline + concise prescriptive guidance.
  - Action buttons: `Acknowledge Incident`, `View Root Cause`, `Escalate to Minister`.

### 11.8 Form Controls (`<Input />`, `<Select />`, `<Checkbox />`, `<Slider />`)
- **Input Fields**:
  - Height: `38px`.
  - Background: `--bg-surface-1`. Border: `1px solid var(--border-default)`.
  - Focus State: `border-color: var(--color-accent)`, `box-shadow: 0 0 0 2px var(--color-accent-subtle)`.
  - Monospace Variant: Dedicated for project codes, latitude/longitude, and monetary inputs.
- **Sliders (What-If Interventions)**:
  - Custom track with filled progress bar in brand blue.
  - Stepped interval ticks with value readouts (`+5%`, `+10%`, `+25%`).
  - Tactile draggable thumb with live tooltip displaying computed schedule recovery.

### 11.9 Sliding Drawers (`<SlideDrawer />`)
- **Width**: Standard `420px` (laptop/desktop) or `560px` (wide analysis), `100vw` on mobile.
- **Position**: Slides in smoothly from right edge with `250ms cubic-bezier(0, 0, 0.2, 1)`.
- **Backdrop**: Subtle dark scrim (`rgba(11, 15, 25, 0.6)`) with `4px` backdrop blur.
- **Application**: 1-click project dossier inspection, early warning triage detail, and filter facet panels without leaving the main grid.

### 11.10 Dialogs & Modals (`<Modal />`)
- **Width Scale**: Small `420px` (confirmations), Medium `640px` (forms), Large `960px` (comparative analysis).
- **Structure**: Sticky header with title and close (`✕`) button, scrollable body, sticky action footer.
- **Escalation Modal**: Special mission-critical variant with Ruby Red header accent and mandatory sign-off reason field for audit logging.

### 11.11 Telemetry Tooltips (`<Tooltip />`)
- **Appearance**: Sleek high-density container (`--bg-surface-2`) with subtle border (`--border-strong`).
- **Typography**: Inter `12px` with monospace data callouts.
- **Delay**: Instant `100ms` entry delay on hover to avoid interface flickering during rapid mouse travel.
- **Accessibility**: Paired with `aria-describedby` and full keyboard focus triggers.

### 11.12 Skeleton Loaders (`<Skeleton />`)
- **Animation**: Smooth horizontal shimmer gradient cycling every `1.5s`.
- **Shapes**:
  - Metric Card Skeleton (rounded box with header line + big metric block).
  - Table Skeleton (repeated row lines with varying width cells).
  - Chart Canvas Skeleton (simulated grid axes with shimmering placeholder area).
- **Never Use**: Spinners that lock screen interaction; always maintain visible layout geometry while data loads.

---

## 12. GIS & Geospatial Intelligence Standards

Geospatial intelligence is fundamental to INFRALYTIX. The GIS view translates abstract delay numbers into physical corridors.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GIS MAP VIEWPORT                                                      │ CORRIDOR TELEMETRY PANEL         │
│                                                                       │ Active Corridor: DMIC Western    │
│                 [▲ Jammu-Udhampur Link]                               │ Total Projects: 48 Assets        │
│                                                                       │ Cumulative Risk: 68.4 (High)     │
│                     ● Delhi Capital Hub                               ├──────────────────────────────────┤
│                     /\                                                │ CHOKEPOINT BREAKDOWN:            │
│                    /  \                                               │ KM 142.4 (Palghar Section)       │
│                   /    \                                              │ Issue: Wildlife Corridor Forest  │
│                  /      \                                             │ Delay Impact: +6.2 Months        │
│    [● Ahmedabad]/        \ [● Varanasi Link]                          │ Escalation: Secretary Level      │
│          \     /          \                                           ├──────────────────────────────────┤
│           \   /            \                                          │ GIS LAYER OVERLAYS:              │
│            \ /              \ [● Kolkata Port Node]                   │ [X] High-Risk Project Pins       │
│         [● Mumbai Hub]       \                                        │ [X] Linear Road & Rail Paths     │
│              \                / [● Vizag Port Link]                   │ [ ] Real-time Weather / Rain     │
│               \              /                                        │ [X] Multi-Modal Logistics Parks  │
│                \            /                                         │ [ ] District Clearance Heatmaps  │
│                 [● Chennai Hub]                                       ├──────────────────────────────────┤
│                        \                                              │ [ ⚡ Run Corridor Simulation ]   │
│                         [● Kochi Port]                                │ [ 📄 Export Corridor Briefing ]  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 12.1 Cartography & Layer Rules
1. **Basemap Styling**: High-contrast, desaturated cartography (Carto Dark Matter equivalent for Dark Mode; Positron for Light Mode) ensuring project markers dominate visual hierarchy.
2. **Vector Corridor Tracing**: 3px GeoJSON multi-line paths color-coded by section health. Chokepoints render with diagonal warning stripes.
3. **State Choropleth Aggregation**: Clicking any Indian state shades the boundary and computes average delay, total capital at risk, and top bottleneck agency.

---

## 13. Chart & Data Visualization Standards

Visualizations are decision-making instruments, not decorative artwork.

```
┌─────────────────────────┬────────────────────────────┬─────────────────────────────────────────────────┐
│ CHART TYPE              │ PRIMARY USE CASE           │ ENCODING & COLOR RULES                          │
├─────────────────────────┼────────────────────────────┼─────────────────────────────────────────────────┤
│ Physical & Financial    │ Detect Capital Burn        │ Solid Emerald (Physical %), Dashed Orange       │
│ S-Curve                 │ Mismatch in execution      │ (Financial Spend %), Violet Cone (AI Forecast)  │
├─────────────────────────┼────────────────────────────┼─────────────────────────────────────────────────┤
│ Sector Risk Bubble      │ Macro Portfolio Capital    │ X: Project Count, Y: Avg Risk,                  │
│ Matrix                  │ Exposure                   │ Bubble Diameter: Total Sanctioned Cost          │
├─────────────────────────┼────────────────────────────┼─────────────────────────────────────────────────┤
│ SHAP Feature            │ Root-Cause Explainable AI  │ Horizontal bars: Crimson (Risk Accelerators),   │
│ Attribution Waterfall   │ attribution                │ Emerald (Protective Mitigating Factors)         │
├─────────────────────────┼────────────────────────────┼─────────────────────────────────────────────────┤
│ Failure DNA™ Radar      │ Structural resemblance to  │ 5-Axis Polygon: Solid Blue (Active Project) vs. │
│ Chart                   │ past failed projects       │ Dotted Crimson (Historical Failed Baseline)     │
├─────────────────────────┼────────────────────────────┼─────────────────────────────────────────────────┤
│ Milestone Slippage      │ Critical Path Schedule     │ Stacked Gantt bars showing Original Baseline vs.│
│ Gantt Cascade           │ Slippage                   │ Current Expected vs. AI Predicted Slippage      │
└─────────────────────────┴────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 14. Motion & Micro-Interaction System

Animations are functional, subtle, and restrained. Fast transitions prevent user fatigue during intense operational monitoring.

- **Hover Transitions**: `150ms cubic-bezier(0.4, 0, 0.2, 1)`.
- **Sliding Drawers & Panels**: `250ms cubic-bezier(0, 0, 0.2, 1)`.
- **Critical Alert Pulse**: `2s infinite ease-in-out` (`opacity: 1` to `0.6`).
- **Skeleton Shimmer**: `1.5s linear infinite`.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by disabling non-essential transitions.

---

## 15. Accessibility & Government Compliance Standards

### 15.1 WCAG 2.1 AA Checklist
- **Contrast Ratio**: Minimum `4.5:1` for normal text and `3:1` for large metrics and graphics against surfaces in both Dark and Light themes.
- **Redundant Encoding**: Color is never the sole indicator. Every status couples:
  1. Semantic Color Token
  2. Distinct Icon
  3. Text Label (`SAFE`, `WATCH`, `HIGH`, `CRITICAL`)
  4. Monospace Score (`87/100`)
- **Keyboard Navigation**:
  - Full tab traversal through data tables and interactive filters.
  - Visible focus ring: `2px solid var(--border-focus)` with `2px offset`.
  - Global Shortcuts: `Cmd+K` (Search), `[` (Toggle Sidebar), `Cmd+Shift+L` (Toggle Theme), `Esc` (Close Drawers).
- **Screen Reader Standards**: Proper ARIA landmarks (`role="region"`, `aria-expanded`, `aria-live="polite"` on alert streams).

---

## 16. Developer Hand-off & Component Implementation Reference

### 16.1 TypeScript Status Component Example

```tsx
import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export type StatusTier = 'healthy' | 'warning' | 'high_risk' | 'critical';

interface StatusBadgeProps {
  score: number;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ score, showIcon = true }) => {
  let tier: StatusTier = 'healthy';
  let label = 'HEALTHY';
  let Icon = CheckCircle2;
  let styleClasses = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';

  if (score > 85) {
    tier = 'critical';
    label = 'CRITICAL';
    Icon = ShieldAlert;
    styleClasses = 'text-red-400 bg-red-950/60 border-red-700 animate-pulse';
  } else if (score > 70) {
    tier = 'high_risk';
    label = 'HIGH RISK';
    Icon = AlertTriangle;
    styleClasses = 'text-orange-400 bg-orange-950/40 border-orange-800/60';
  } else if (score > 30) {
    tier = 'warning';
    label = 'WARNING';
    Icon = AlertCircle;
    styleClasses = 'text-amber-400 bg-amber-950/40 border-amber-800/60';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-semibold border ${styleClasses}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
      <span className="opacity-75">({score})</span>
    </span>
  );
};
```

---

## 17. Governance & Design Sign-off Checklist

Before deploying any screen or component in INFRALYTIX, verify compliance against this checklist:

- [ ] **Dual-Theme Verification**: Clean rendering in both Dark Command Mode and Light Executive Mode.
- [ ] **8-Point Spacing Integrity**: No arbitrary paddings; all dimensions follow `4, 8, 12, 16, 24, 32, 48, 64px`.
- [ ] **Tabular Numerics**: All currency figures, percentages, dates, and Project IDs use `JetBrains Mono` with tabular numbers.
- [ ] **Epistemic Labeling**: Predictive numbers are clearly badged (`OBSERVED` vs `PREDICTED` vs `SCENARIO`).
- [ ] **Status Triad**: Every risk indicator displays color + icon + text label.
- [ ] **High-Density Table Performance**: Tables handle 500+ records with sticky headers and fast virtualized scrolling.
- [ ] **GIS Hardware Acceleration**: Map layers render vector paths smoothly at 60 FPS without DOM lag.
- [ ] **Explainability Standard**: Every AI risk alert provides a 1-click drill-down to its underlying SHAP contributors.
