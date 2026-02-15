# Financial Audit Dashboard for ERPNext

<div align="center">

**Advanced Financial Audit & Analysis Dashboard**

A standalone Frappe app that provides financial auditors with a comprehensive, real-time overview of any ERPNext business — with AI-powered analysis.

[![Frappe](https://img.shields.io/badge/Frappe-v15-blue.svg)](https://frappeframework.com)
[![ERPNext](https://img.shields.io/badge/ERPNext-v15-green.svg)](https://erpnext.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Overview

Financial Audit Dashboard is a **universal, plug-and-play** auditing tool that works on **any** Frappe/ERPNext site regardless of chart of accounts, customization level, or installed apps. It dynamically discovers all transaction types, custom doctypes, accounting dimensions, and installed applications — giving auditors a complete 360-degree financial picture in a single page.

### Key Highlights

- **25 Data Sections** covering every aspect of financial operations
- **12 KPI Cards** with real-time financial metrics
- **4 Interactive Charts** (monthly trends, daily sales, expense breakdown, cash flow)
- **20+ Data Tables** with drill-down links
- **Free AI Analysis** via Puter.js — no API keys required
- **Full Arabic RTL** interface with responsive design
- **Dynamic Discovery** of custom doctypes, custom fields, and accounting dimensions
- **Works on ANY ERPNext site** — no hardcoded account names

---

## Screenshots

> Access the dashboard at: `/app/financial-audit`

### Dashboard Layout

| Section | Description |
|---------|-------------|
| KPI Cards | 12 color-coded metrics (revenue, profit, margins, AR/AP, cash, inventory) |
| Balance Sheet | Summary by root type (Assets, Liabilities, Equity, Income, Expense) |
| Income Statement | Hierarchical P&L with expandable accounts |
| Charts | Monthly trends, daily sales, expense pie, cash flow bars |
| Transaction Analysis | GL & Stock Ledger voucher type discovery |
| Customer/Product/Supplier | Top performers with collection rates |
| Returns Analysis | Sales & purchase returns by party |
| Aging Reports | AR/AP aging with color-coded badges |
| Bank & Cash | Individual account balances |
| Payment Analysis | By mode of payment and type |
| Inventory | Warehouse valuation + stock movement + dead stock detection |
| System Analysis | Custom doctypes, GL custom fields, accounting dimensions, installed apps |
| AI Analysis | Comprehensive Arabic financial report powered by free AI |

---

## Installation

### Prerequisites

- Frappe Bench (v15+)
- ERPNext (v15+)
- Python 3.10+
- Node.js 18+

### Install Steps

```bash
# 1. Get the app
bench get-app https://github.com/ahmedemamhatem/financial_audit.git

# 2. Install on your site
bench --site your-site.com install-app financial_audit

# 3. Build assets & migrate
bench build && bench migrate

# 4. Restart
bench restart
```

### Access

Navigate to: **`/app/financial-audit`**

Required roles: `System Manager` or `Accounts Manager`

---

## Architecture

```
financial_audit/
├── setup.py                          # Package configuration
├── setup.cfg                         # Build settings
├── MANIFEST.in                       # Package manifest
├── requirements.txt                  # Dependencies (none external)
├── financial_audit/
│   ├── __init__.py                   # App version (0.0.1)
│   ├── hooks.py                      # App metadata & required_apps
│   ├── modules.txt                   # Module registration
│   └── financial_audit/
│       └── page/
│           └── financial_audit/
│               ├── financial_audit.json   # Page definition & roles
│               ├── financial_audit.py     # Backend API (594 lines)
│               ├── financial_audit.js     # Frontend dashboard (1,104 lines)
│               └── financial_audit.css    # RTL responsive styles (554 lines)
```

**Total: ~2,300 lines of code | Zero external dependencies**

---

## Data Sections (25 Endpoints)

All data is fetched in a **single API call** via `get_financial_audit_data(filters)`.

### Financial KPIs

| # | Metric | Source | Description |
|---|--------|--------|-------------|
| 1 | Revenue | GL Entry (root_type=Income) | Total income for period |
| 2 | COGS | GL Entry (account_type=Cost of Goods Sold) | Cost of goods sold |
| 3 | Gross Profit | Calculated | Revenue - COGS |
| 4 | Gross Margin | Calculated | Gross Profit / Revenue % |
| 5 | Total Expenses | GL Entry (root_type=Expense) | All operating expenses |
| 6 | Net Profit | Calculated | Revenue - Total Expenses |
| 7 | Net Margin | Calculated | Net Profit / Revenue % |
| 8 | AR Outstanding | GL Entry (account_type=Receivable) | Accounts receivable balance |
| 9 | AP Outstanding | GL Entry (account_type=Payable) | Accounts payable balance |
| 10 | Cash Balance | GL Entry (account_type=Bank/Cash) | Total liquid assets |
| 11 | Inventory Value | Bin table | Total stock valuation |
| 12 | Invoice Counts | Sales/Purchase Invoice | Transaction volume |

### Analysis Sections

| # | Section | Key | Query Strategy |
|---|---------|-----|----------------|
| 1 | Income Statement | `income_accounts`, `expense_accounts` | GL + Account (root_type, is_group=0) |
| 2 | Monthly Trends | `monthly_trends` | GL grouped by YEAR/MONTH |
| 3 | Top Customers | `top_customers` | Sales Invoice GROUP BY customer |
| 4 | Top Products | `top_products` | SI Item GROUP BY item_code |
| 5 | Top Suppliers | `top_suppliers` | Purchase Invoice GROUP BY supplier |
| 6 | AR Aging | `ar_aging` | GL (account_type=Receivable) |
| 7 | AP Aging | `ap_aging` | GL (account_type=Payable) |
| 8 | Daily Sales | `daily_sales` | SI GROUP BY posting_date |
| 9 | Expense Breakdown | `expense_breakdown` | GL (root_type=Expense) GROUP BY parent_account |
| 10 | Cash Flow | `cash_flow` | Payment Entry GROUP BY month + type |
| 11 | Inventory | `inventory_by_warehouse` | Bin JOIN Warehouse |
| 12 | GL Voucher Discovery | `gl_voucher_summary` | DISTINCT voucher_type from GL Entry |
| 13 | Stock Voucher Discovery | `stock_voucher_summary` | DISTINCT voucher_type from Stock Ledger |
| 14 | Stock Movement | `stock_movement` | Top 20 items by value change |
| 15 | Balance Sheet | `balance_sheet` | GL grouped by root_type (cumulative) |
| 16 | Bank Balances | `bank_balances` | Individual bank/cash accounts |
| 17 | Sales Returns | `sales_returns` | Credit notes by customer |
| 18 | Purchase Returns | `purchase_returns` | Debit notes by supplier |
| 19 | Journal Entries | `journal_entries_summary` | JE grouped by voucher_type |
| 20 | Payment Modes | `payment_modes` | PE grouped by mode + payment_type |
| 21 | Stock Ageing | `stock_ageing` | Dead stock detection (oldest items) |
| 22 | Custom Doctypes | `custom_doctypes_analysis` | Dynamic discovery of ALL submittable doctypes |
| 23 | Installed Apps | `installed_apps` | Site app registry with versions |

---

## Universal Compatibility

The dashboard is designed to work on **any** ERPNext site without modification:

### How It Works

| Feature | Approach |
|---------|----------|
| **Account Discovery** | Uses `root_type` (Asset/Liability/Equity/Income/Expense) and `account_type` (Receivable/Payable/Bank/Cash/COGS) — never hardcoded account names |
| **Currency** | Auto-detected via `erpnext.get_company_currency()` |
| **Company** | Falls back to user default or Global Defaults |
| **Fiscal Year** | Date range filters — no fiscal year dependency |
| **Custom Doctypes** | Dynamically discovers ALL `is_submittable=1` doctypes with `company` field |
| **Custom Fields** | Detects custom fields added to GL Entry |
| **Accounting Dimensions** | Discovers configured accounting dimensions |
| **Installed Apps** | Lists all installed apps with versions |
| **Transaction Types** | Discovers via `DISTINCT voucher_type` from GL Entry & Stock Ledger |

### Supported Chart of Accounts

- Standard ERPNext (any country)
- Custom chart of accounts
- Multi-company setups
- Any language/locale

---

## AI-Powered Analysis

The dashboard includes **free AI analysis** powered by [Puter.js](https://puter.com) — no API keys, no backend proxy, no cost.

### How It Works

1. Click **"تحليل ذكي (AI)"** button
2. Dashboard builds a structured prompt with ALL financial data
3. Puter.js sends the prompt to GPT-4o-mini (free tier)
4. AI returns a comprehensive Arabic financial report

### AI Analysis Covers

1. **Financial Health Score** — Rating out of 100 with explanation
2. **Risk Analysis** — Top 5 financial risks identified
3. **Anomaly Detection** — Unusual patterns in the data
4. **Cash Flow Analysis** — Liquidity assessment
5. **Inventory Analysis** — Dead stock and management issues
6. **Returns Analysis** — Return rates and impact
7. **Strengths** — Positive financial indicators
8. **Weaknesses** — Areas requiring attention
9. **Actionable Recommendations** — 7-10 specific improvement suggestions
10. **Custom App Risk Analysis** — Risks from customizations

---

## Filters

| Filter | Type | Default | Description |
|--------|------|---------|-------------|
| Company | Link (Company) | User's default company | Filter all data by company |
| From Date | Date | 1 month ago | Period start date |
| To Date | Date | Today | Period end date |

Changing any filter automatically refreshes all sections, charts, and KPIs.

---

## Visual Components

### Charts (Frappe Chart Library)

| Chart | Type | Description |
|-------|------|-------------|
| Monthly Trends | Bar | Revenue vs Expenses by month |
| Daily Sales | Line | Sales volume with area fill |
| Expense Breakdown | Pie | Top 10 expense categories |
| Cash Flow | Bar | Receipts vs Payments by month |

### Badges

| Badge | Colors | Usage |
|-------|--------|-------|
| Aging | Green (0-30d) / Yellow (31-60d) / Red (60+d) | AR/AP aging, stock ageing |
| Account Type | Blue (Bank) / Green (Cash) | Bank balances section |
| Payment Type | Green (Receive) / Red (Pay) | Payment modes section |
| Doctype Type | Yellow (Custom) / Blue (Core) | Custom doctypes section |

### Collection Rate Bar

Visual progress bar showing customer payment collection percentage:
- Green: 70%+ collection rate
- Yellow: 40-69% collection rate
- Red: Below 40% collection rate

---

## Security & Permissions

- **Page access**: Restricted to `System Manager` and `Accounts Manager` roles
- **Backend**: Uses `@frappe.whitelist()` with standard Frappe permission checks
- **Data isolation**: All queries filter by `company` — multi-tenant safe
- **AI processing**: Client-side only via Puter.js — no data sent to custom backend

---

## Technical Details

### Backend (`financial_audit.py`)

- **Single entry point**: `get_financial_audit_data(filters)` returns all 25 sections
- **Universal queries**: All SQL uses `root_type`, `account_type`, `is_group` — never hardcoded names
- **Performance**: Single API call fetches everything; SQL queries use proper JOINs and indexes
- **Error handling**: `get_custom_doctypes_analysis()` handles missing doctypes gracefully
- **Cancelled entries**: All queries exclude `is_cancelled = 0` and opening entries

### Frontend (`financial_audit.js`)

- **Class-based**: `FinancialAuditDashboard` with clean method separation
- **23 render methods**: Each section has its own render method
- **Frappe Chart**: Native chart library (bundled with Frappe)
- **Frappe Controls**: Uses `frappe.ui.form.make_control()` for filter fields
- **RTL**: Full Arabic interface with `direction: rtl`
- **Collapsible sections**: Toggle buttons for long tables

### Styling (`financial_audit.css`)

- **RTL-first**: `direction: rtl`, `text-align: right`
- **Responsive grid**: KPI cards adapt from 6 → 4 → 2 columns
- **Two-column layout**: Related sections paired side-by-side
- **Print-friendly**: Clean table styling with sticky headers
- **Breakpoints**: 1200px, 768px, 480px

---

## Roadmap

- [ ] PDF export for audit reports
- [ ] Date comparison (period vs period)
- [ ] Drill-down from KPI cards to filtered lists
- [ ] Email scheduled reports
- [ ] Multi-language support (English, Arabic, French)
- [ ] Custom dashboard layouts
- [ ] Ratio analysis (liquidity, solvency, efficiency)
- [ ] Budget vs actual comparison
- [ ] Audit trail logging

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**Elsaeed**
- Email: info@elsaeed-eg.com
- GitHub: [@ahmedemamhatem](https://github.com/ahmedemamhatem)

---

<div align="center">

**Built for ERPNext** | **Works on any site** | **Free AI included**

</div>
