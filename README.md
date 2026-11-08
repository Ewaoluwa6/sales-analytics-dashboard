# SalesPulse Analytics 📊

A high-performance, single-page sales analytics dashboard built with **Vanilla HTML, CSS, and JavaScript**.

Designed with **zero backend dependencies**, **zero CSS variables**, and **100% client-side WebStorage persistence**, providing real-time sales intelligence right out of the box.

---

## ✨ Features

- **Executive KPI Metrics**:
  - **Total Revenue**: Aggregated gross sales with comparative growth badge.
  - **Transaction Volume**: Total order counts with breakdown of Completed vs. Pending deals.
  - **Average Deal Size (AOV)**: Average deal size calculated across fulfilled orders.
  - **Gross Profit & Margin**: Real-time profit and margin percentage ($ Revenue − $ Cost).
  - **Editable Target Quota Progress**: Visual completion percentage and remaining dollar amount to target (customizable goal persisted to LocalStorage).

- **Multi-Currency Support**:
  - Real-time conversion across **USD ($)**, **EUR (€)**, **GBP (£)**, and **JPY (¥)** with automatic formatting.

- **Dynamic Visual Charts**:
  - **Revenue & Gross Profit Trend**: Trajectory over time with monthly projections.
  - **Category Breakdown**: Doughnut chart representing product line revenue contribution.
  - **Geographic Distribution**: Horizontal bar chart comparing sales volume across territories.
  - **Sales Representative Leaderboard**: Top performers ranked by volume and quota fulfillment.
  - *Includes graceful native HTML5 canvas fallback for offline environments.*

- **Interactive Transaction Ledger**:
  - Real-time instant search across customer names, product titles, sales reps, and invoice IDs.
  - Category and status filters.
  - Multi-column ascending/descending sorting.
  - Paginated table navigation (10 records per page).
  - **One-Click Status Toggle**: Click any status badge in the ledger to cycle between `Completed` ➔ `Pending` ➔ `Refunded`.
  - Transaction deletion with confirmation.

- **Record New Sale Modal**:
  - Add new transactions with customer, product, category, region, sales rep, price, and COGS.
  - Automatically generates an invoice ID, updates all KPI cards, re-renders charts, and saves to LocalStorage.

- **Data Portability**:
  - **CSV Export**: Export filtered transactions directly to a downloadable `.csv` file.
  - **Reset Data**: One-click restore to the pre-populated 25-record sample enterprise sales dataset.

---

## 🛠️ Tech Stack & Constraints

| Component | Technology | Notes |
|-----------|------------|-------|
| **Markup** | HTML5 | Clean, semantic structure with accessible dialogs and ARIA landmarks |
| **Styling** | Vanilla CSS3 | Direct hex/rgba values; **strictly zero CSS variables** (`--*` or `var(--*)`) |
| **Scripting** | Vanilla JavaScript (ES6+) | Modular self-executing logic, reactive rendering pipeline |
| **Persistence** | Browser WebStorage | `localStorage` for transactions, currency selection, timeframe, and target quota |
| **Charting** | Chart.js 4.x / Canvas | Loaded via CDN with automatic fallback to native canvas rendering |

---

## 📁 File Structure

```text
sales-app/
├── index.html        # Single-page dashboard markup and modal structure
├── styles.css        # Dashboard styling (pure CSS, no CSS variables)
├── app.js            # State management, data persistence, and UI logic
├── .gitignore        # Git ignore rules for system, editor, and log files
└── README.md         # Documentation and project overview
```

---

## 🚀 Getting Started

No build tools, package managers, or server installations required.

1. Clone or download this repository:
   ```bash
   git clone https://github.com/Ewaoluwa6/sales-analytics-dashboard.git
   ```
2. Navigate to the directory:
   ```bash
   cd sales-analytics-dashboard
   ```
3. Open `index.html` in any modern web browser:
   - On Windows: Double-click `index.html` or run `start index.html`
   - On macOS: Run `open index.html`
   - On Linux: Run `xdg-open index.html`

All data and custom changes are saved automatically in your browser's LocalStorage.
