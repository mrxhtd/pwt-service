# 💧 AquaTrack CRM

> Water Treatment Client & Survey Management System

---

## Overview

AquaTrack CRM is a tool built for water treatment technicians and field engineers to manage client sites, track chemical inventory (gallons on stock), and log detailed water quality surveys — all in one place.

The system comes in two formats:

- **Web App (React JSX)** — runs in any browser, great for field use on tablet or laptop
- **Excel Workbook (.xlsx)** — for offline use, reporting, and sharing with management

---

## Deliverables

### Web App (`water_treatment_crm.jsx`)

Single-page React app with three tabs:

| Tab | Description |
|---|---|
| **Clients** | Client registry — add sites, set system type, track gallons on stock, status, and next follow-up date. One-click shortcut to open a new survey for any client. |
| **Surveys** | Full survey entry form with all 16 water quality parameters. Values outside the acceptable range are flagged red in real time. Previous surveys shown in reverse chronological order with pass/fail indicators. |
| **Dashboard** | Live KPI cards (total clients, active, follow-up required, total surveys, total gallons). Upcoming follow-ups sorted by date. Automatic out-of-range alerts across all survey history. |

### Excel Workbook (`water_treatment_crm.xlsx`)

Three sheets:

| Sheet | Description |
|---|---|
| **Clients** | Master client list with color-coded status indicators |
| **Survey Log** | All 16 parameters in grouped columns with sample data |
| **Dashboard** | Live Excel formulas auto-calculating KPIs and pulling the 5 most recent surveys |

---

## Client Data Fields

| Field | Description |
|---|---|
| `Client ID` | Auto-generated unique ID (e.g. `CLT-001`) |
| `Company Name` | Full name of the client or facility |
| `Contact Person` | Name of the primary point of contact |
| `Phone` | Contact phone number |
| `System Type` | Cooling Tower / Boiler System / Closed Loop / Swimming Pool / RO System / Other |
| `Total Gallons` | Total water volume currently on stock (in gallons) |
| `Status` | Active / Follow-up / Inactive |
| `Last Visit` | Date of most recent site visit |
| `Next Follow-up` | Scheduled date for next visit |

---

## Survey Parameters

Each survey captures 16 water chemistry parameters. The web app flags any value outside the acceptable range in real time.

| Parameter | Unit | Acceptable Range | Notes |
|---|---|---|---|
| pH | — | 6.5 – 8.5 | Acidity/alkalinity balance |
| TDS | ppm | 0 – 500 | Total dissolved solids |
| Conductivity | µS/cm | 0 – 1200 | Electrical conductivity |
| Total Hardness | ppm | 0 – 300 | Combined Ca + Mg hardness |
| Calcium Hardness | ppm | 0 – 200 | Calcium ion concentration |
| P-Alkalinity | ppm | 0 – 100 | Phenolphthalein alkalinity |
| M-Alkalinity | ppm | 80 – 300 | Methyl orange (total) alkalinity |
| OH-Alkalinity | ppm | 0 – 50 | Hydroxide alkalinity |
| Chloride | ppm | 0 – 100 | Chloride ion level |
| Iron | ppm | 0 – 0.5 | Dissolved iron content |
| Phosphate | ppm | 2 – 8 | Phosphate inhibitor residual |
| Sulfite | ppm | 0 – 20 | Oxygen scavenger residual |
| Tannin | ppm | 0 – 5 | Organic dispersant level |
| CHZ | ppm | 8 – 20 | Corrosion inhibitor residual |
| DEHA | ppm | 3 – 10 | Oxygen scavenger (boiler) |
| Silica | ppm | 0 – 30 | Silica scale control |

---

## Client Status System

| Status | Meaning |
|---|---|
| ✅ Active | Site is being serviced regularly. No issues. |
| ⚠️ Follow-up | Site requires a follow-up visit or has a pending concern. |
| 🔴 Inactive | Site is not currently active. No scheduled visits. |

---

## Tech Stack

- **Web App:** React (JSX), inline styles, in-memory state (no backend yet)
- **Excel:** Python + `openpyxl`, LibreOffice for formula recalculation
- **Deployment:** Runs as a standalone React artifact in Claude.ai

---

## Project Structure

```
aquatrack/
├── README.md
├── water_treatment_crm.jsx     # React web app
└── water_treatment_crm.xlsx    # Excel workbook
```

---

## Future Roadmap

- [ ] Chemical dosing recommendations based on survey results
- [ ] CSV / PDF export from the web app
- [ ] WhatsApp or email reminders when a follow-up date is approaching
- [ ] Historical trend charts per parameter per site
- [ ] Supabase backend for persistent data storage
- [ ] Multi-user support with technician login
- [ ] Mobile-optimized PWA for field use
