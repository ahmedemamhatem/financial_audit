# Financial Audit Dashboard for ERPNext

<div align="center">

**Advanced Financial Audit & Analysis Dashboard**

A standalone Frappe app that provides financial auditors with a comprehensive, real-time overview of any ERPNext business — with AI-powered analysis, advanced fraud detection, and bilingual (Arabic/English) support.

[![Frappe](https://img.shields.io/badge/Frappe-v15-blue.svg)](https://frappeframework.com)
[![ERPNext](https://img.shields.io/badge/ERPNext-v15-green.svg)](https://erpnext.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![ECharts](https://img.shields.io/badge/Charts-ECharts%205.5-orange.svg)](https://echarts.apache.org)

</div>

---

## Overview

Financial Audit Dashboard is a **universal, plug-and-play** auditing tool that works on **any** Frappe/ERPNext site regardless of chart of accounts, customization level, or installed apps. It dynamically discovers all transaction types, custom doctypes, accounting dimensions, and installed applications — giving auditors a complete 360-degree financial picture in a single page.

### Key Highlights

- **30+ Data Sections** covering every aspect of financial operations
- **12 KPI Cards** with real-time financial metrics
- **5 Interactive ECharts** (monthly trends, daily sales, expense breakdown, cash flow, Benford's Law)
- **20+ Data Tables** with drill-down links
- **Secure AI Analysis** — 3 providers (Puter free, OpenAI, Custom/Self-hosted) with server-side anonymization
- **PDF Export** — one-click print-optimized audit reports
- **Custom Dashboard Layouts** — show/hide sections with saved preferences
- **Bilingual Interface** — Arabic (RTL) and English (LTR) based on user language
- **Advanced Audit Analytics** — DuPont, CCC, Benford's Law, Duplicate Payments, Concentration Risk
- **Dynamic Discovery** of custom doctypes, custom fields, and accounting dimensions
- **Works on ANY ERPNext site** — no hardcoded account names

---

## Advanced Audit Analytics

### DuPont Analysis & Financial Ratios
- **Return on Equity (ROE)** decomposition: Profit Margin x Asset Turnover x Equity Multiplier
- **Cash Conversion Cycle (CCC)**: DSO + DIO - DPO
- **Liquidity Ratios**: Current Ratio, Quick Ratio, Cash Ratio
- **Working Capital** metrics with health indicators

### Fraud Detection
- **Benford's Law Analysis**: First-digit distribution test with Chi-square statistic (critical value 15.51 at alpha=0.05, 8df) for both sales and purchase invoices
- **Duplicate Payment Detection**: Same amount to same supplier within 7 days — automatic flagging
- **Weekend & Month-End Transactions**: Unusual timing patterns that may indicate manipulation or weak controls

### Concentration Risk
- **Customer Concentration**: Top customer and Top 5 customer revenue dependency analysis
- **Supplier Concentration**: Top supplier and Top 5 supplier purchase dependency analysis
- **Risk Level Assessment**: Automatic high/medium/low classification

### Year-over-Year Comparison
- Revenue, gross profit, expenses, net profit, and invoice count growth rates
- Same-period comparison with prior year

---

## Screenshots

> Access the dashboard at: `/app/financial-audit`

### Dashboard Layout

| Section | Description |
|---------|-------------|
| KPI Cards | 12 color-coded metrics (revenue, profit, margins, AR/AP, cash, inventory) |
| Balance Sheet | Summary by root type (Assets, Liabilities, Equity, Income, Expense) |
| Income Statement | Hierarchical P&L with expandable accounts |
| Charts | Monthly trends, daily sales, expense pie, cash flow bars, Benford's chart |
| Transaction Analysis | GL & Stock Ledger voucher type discovery |
| Customer/Product/Supplier | Top performers with collection rates |
| Returns Analysis | Sales & purchase returns by party |
| Aging Reports | AR/AP aging with color-coded badges |
| Bank & Cash | Individual account balances |
| Payment Analysis | By mode of payment and type |
| Inventory | Warehouse valuation + stock movement + dead stock detection |
| DuPont & CCC | Advanced financial ratios with visual metrics |
| Benford's Law | First-digit fraud detection chart with Chi-square test |
| Duplicate Payments | Automatic detection of suspicious duplicate payments |
| Concentration Risk | Customer & supplier dependency analysis |
| Weekend Transactions | Unusual timing pattern detection |
| AI Analysis | Secure AI report with anonymization (Puter/OpenAI/Custom) |
| PDF Export | One-click print-optimized full audit report |
| Custom Layout | Show/hide any section with persistent preferences |

---

## Bilingual Support

The dashboard automatically detects the user's language setting (`frappe.boot.lang`) and renders the entire interface in:

- **Arabic (العربية)** — RTL layout, Cairo font, full Arabic labels
- **English** — LTR layout, all labels translated

All charts, tables, KPIs, section titles, AI analysis, and risk assessments are fully bilingual.

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
├── pyproject.toml                    # Package configuration (flit_core)
├── MANIFEST.in                       # Package manifest
├── requirements.txt                  # Dependencies (none external)
├── financial_audit/
│   ├── __init__.py                   # App version (0.0.1)
│   ├── hooks.py                      # App metadata & required_apps
│   ├── modules.txt                   # Module registration
│   └── financial_audit/
│       ├── doctype/
│       │   ├── financial_audit_settings/   # AI provider config (Single DocType)
│       │   └── ai_audit_log/               # AI request audit trail
│       └── page/
│           └── financial_audit/
│               ├── financial_audit.json   # Page definition & roles
│               ├── financial_audit.py     # Backend API + AI proxy (~1,500 lines)
│               ├── financial_audit.js     # Frontend dashboard (~2,200 lines)
│               └── financial_audit.css    # RTL/LTR responsive styles (~1,000 lines)
```

**Total: ~4,700+ lines of code | Zero external dependencies**

---

## Data Sections (30+ Endpoints)

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

### Advanced Audit Analytics

| # | Section | Key | Description |
|---|---------|-----|-------------|
| 24 | Working Capital Metrics | `working_capital_metrics` | DSO, DPO, DIO, CCC, Current/Quick/Cash Ratio, DuPont ROE |
| 25 | YoY Growth | `yoy_growth` | Revenue, gross profit, expense, net profit, invoice count growth |
| 26 | Benford's Law | `benfords_law` | Chi-square first-digit analysis for sales & purchase invoices |
| 27 | Duplicate Payments | `duplicate_payments` | Same amount + same supplier within 7 days detection |
| 28 | Concentration Risk | `concentration_risk` | Top 1 & Top 5 customer/supplier revenue/purchase concentration |
| 29 | Weekend Transactions | `weekend_transactions` | Weekend and month-end transaction pattern analysis |

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
| **Language** | Auto-detected via `frappe.boot.lang` — Arabic (RTL) or English (LTR) |
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

The dashboard includes **secure AI analysis** with three provider options — managed via **Financial Audit Settings** (`/app/financial-audit-settings`).

### AI Providers

| Provider | API Key | Data Flow | Best For |
|----------|---------|-----------|----------|
| **Puter (Free)** | Not required | Server builds anonymized prompt → Browser calls Puter AI | Demos, testing, small teams |
| **OpenAI** | Required | Fully server-side (anonymize → prompt → API call → response) | Production, enterprise |
| **Custom Endpoint** | Required | Same as OpenAI but to your own URL | Self-hosted LLMs, data residency |

### How It Works

1. Click the **"AI Analysis"** button (or "تحليل ذكي" in Arabic)
2. Backend fetches financial data, **anonymizes all identifiable names** (customers, suppliers, products, bank accounts → generic labels like "Customer A", "Supplier 1")
3. Prompt is built **server-side** with anonymized data
4. For OpenAI/Custom: backend calls the AI API directly and returns the response
5. For Puter: anonymized prompt is sent to the browser, which calls Puter AI client-side
6. AI returns a comprehensive financial report in the user's language
7. Every request is logged in **AI Audit Log** with user, timestamp, status, and provider

### Data Anonymization

Before any data reaches an AI provider, the following identifiers are replaced:

| Original | Anonymized As |
|----------|---------------|
| Customer names | Customer A, Customer B, ... |
| Supplier names | Supplier 1, Supplier 2, ... |
| Product names | Product A, Product B, ... |
| Bank account names | Bank Account 1, Bank Account 2, ... |
| Cost center names | Cost Center 1, Cost Center 2, ... |
| Company name (optional) | The Company |

All **financial amounts, ratios, and percentages remain intact** for accurate analysis.

### AI Analysis Covers

1. **Financial Health Score** — Rating out of 100 with multi-factor weighted scoring
2. **DuPont Analysis** — ROE decomposition with component analysis
3. **Cash Conversion Cycle** — DSO/DPO/DIO impact on liquidity
4. **Fraud & Risk Analysis** — Benford's Law, duplicate payments, weekend transactions
5. **Concentration Risk** — Customer and supplier dependency
6. **Year-over-Year Comparison** — Growth and contraction trends
7. **Cash Flow Analysis** — Liquidity and obligation coverage
8. **Inventory Analysis** — Dead stock and management issues
9. **Returns Analysis** — Return rates and profitability impact
10. **SWOT Analysis** — Financial strengths, weaknesses, opportunities, threats
11. **Actionable Recommendations** — 10 prioritized suggestions
12. **Early Warning Signs** — Future problem indicators

### AI Settings

Configure at `/app/financial-audit-settings`:

| Setting | Description |
|---------|-------------|
| Enable AI Analysis | Master on/off toggle |
| AI Provider | Puter (Free) / OpenAI / Custom Endpoint |
| API Key | Encrypted storage (required for OpenAI/Custom) |
| Model Name | Default: gpt-4o-mini |
| Max Requests Per User Per Day | Rate limit (default: 20) |
| Anonymize Data | Replace names with generic labels before AI |
| Anonymize Company Name | Also replace the company name |

---

## PDF Export

Generate professional, print-ready audit reports with a single click.

### How It Works

1. Click the **"Export PDF"** button (or "تصدير PDF" in Arabic)
2. All collapsed sections automatically expand for a complete report
3. Frappe UI chrome (navbar, sidebar) is hidden for a clean layout
4. Browser print dialog opens — save as PDF or send to printer
5. Dashboard restores to its previous state after printing

### PDF Features

- **Full color preservation** — KPI colors, badges, and charts print exactly as displayed
- **Optimized layout** — 6-column KPI grid, 4-column metrics, proper table sizing
- **Smart section control** — hidden sections (via Custom Layout) stay hidden in PDF
- **Automatic filename** — includes company name and date range
- **All sections expanded** — no collapsed/hidden content in the export

---

## Custom Dashboard Layouts

Personalize which sections appear on your dashboard — preferences are saved per browser.

### How It Works

1. Click the **"Customize Layout"** button (or "تخصيص العرض" in Arabic)
2. A dialog shows checkboxes for all 27 dashboard sections
3. Toggle sections on/off — use **Show All**, **Hide All**, or **Reset** for bulk actions
4. Click **Save** — preferences persist across sessions via `localStorage`

### Layout Features

- **27 toggleable sections** — every data table, chart, and analytics section
- **Instant apply** — sections show/hide immediately after saving
- **Persistent preferences** — saved per browser, survives page refreshes and logouts
- **PDF-aware** — hidden sections stay hidden in PDF exports too
- **Smart divider** — advanced audit divider auto-hides when all advanced sections are hidden
- **Bilingual dialog** — fully translated in Arabic and English

---

## Filters

| Filter | Type | Default | Description |
|--------|------|---------|-------------|
| Company | Link (Company) | User's default company | Filter all data by company |
| From Date | Date | Year start | Period start date |
| To Date | Date | Today | Period end date |

Changing any filter automatically refreshes all sections, charts, and KPIs.

---

## Visual Components

### Charts (Apache ECharts 5.5)

| Chart | Type | Description |
|-------|------|-------------|
| Monthly Trends | Bar | Revenue vs Expenses by month |
| Daily Sales | Line | Sales volume with area fill |
| Expense Breakdown | Donut | Top 10 expense categories |
| Cash Flow | Bar | Receipts vs Payments by month |
| Benford's Law | Bar + Line | First-digit distribution vs expected |

### Badges

| Badge | Colors | Usage |
|-------|--------|-------|
| Aging | Green (0-30d) / Yellow (31-60d) / Red (60+d) | AR/AP aging, stock ageing |
| Account Type | Blue (Bank) / Green (Cash) | Bank balances section |
| Payment Type | Green (Receive) / Red (Pay) | Payment modes section |
| Risk Level | Green (Low) / Yellow (Medium) / Red (High) | Benford, duplicates, concentration |

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
- **AI data anonymization**: All customer, supplier, product, and account names are replaced with generic labels before any AI provider receives data
- **Server-side prompt building**: Prompts are constructed on the backend — no raw financial identifiers ever reach the browser for AI purposes
- **API key encryption**: Stored using Frappe's encrypted Password field — never exposed in API responses
- **Rate limiting**: Per-user daily request cap via Redis cache
- **Audit logging**: Every AI request logged with user, company, timestamp, provider, and status via AI Audit Log doctype
- **Provider flexibility**: Use Puter (free) for demos, OpenAI for production, or a self-hosted LLM for full data residency control

---

## Technical Details

### Backend (`financial_audit.py`)

- **Single entry point**: `get_financial_audit_data(filters)` returns all 30+ sections
- **Universal queries**: All SQL uses `root_type`, `account_type`, `is_group` — never hardcoded names
- **Performance**: Single API call fetches everything; SQL queries use proper JOINs and indexes
- **Advanced analytics**: Benford's Law with Chi-square test, DuPont decomposition, CCC calculation
- **Error handling**: `get_custom_doctypes_analysis()` handles missing doctypes gracefully
- **Cancelled entries**: All queries exclude `is_cancelled = 0` and opening entries

### Frontend (`financial_audit.js`)

- **Class-based**: `FinancialAuditDashboard` with clean method separation
- **Full i18n**: `FA_TRANSLATIONS` dictionary with 200+ keys in Arabic/English
- **Language detection**: Automatic via `frappe.boot.lang` with `t()` helper method
- **ECharts 5.5**: Interactive charts with tooltips and responsive sizing
- **Multi-provider AI**: Puter (free), OpenAI, Custom endpoint — server-side anonymization and prompt building
- **Collapsible sections**: Toggle buttons for long tables
- **PDF export**: `window.print()` with enhanced print CSS, auto-expand, Frappe chrome hidden
- **Custom layouts**: Section registry with `localStorage` persistence, Frappe dialog UI
- **Multi-factor health score**: Weighted scoring across profitability, liquidity, collection, margins, and advanced metrics

### Styling (`financial_audit.css`)

- **RTL + LTR**: Automatic direction based on language
- **Clean design**: Strong font colors, bold weights, clear size hierarchy
- **Cairo font**: Arabic-optimized Google Font
- **Responsive grid**: KPI cards adapt from 6 → 4 → 2 → 1 columns
- **Print/PDF optimized**: Full `@media print` rules — hides Frappe chrome, expands sections, preserves colors
- **Breakpoints**: 1200px, 768px, 480px

---

## Roadmap

- [x] Advanced financial ratios (DuPont, CCC, liquidity)
- [x] Benford's Law fraud detection
- [x] Duplicate payment detection
- [x] Concentration risk analysis
- [x] Weekend/month-end transaction analysis
- [x] Year-over-Year comparison
- [x] Bilingual Arabic/English support
- [x] ECharts interactive charts
- [x] PDF export for audit reports
- [x] Custom dashboard layouts (show/hide with persistence)
- [ ] Email scheduled reports
- [ ] Budget vs actual comparison
- [x] AI data anonymization (customer/supplier/product name masking)
- [x] Multi-provider AI support (Puter, OpenAI, Custom/Self-hosted)
- [x] AI audit trail logging
- [x] Per-user AI rate limiting
- [x] Financial Audit Settings doctype

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

**Ahmed Emam**
- Email: ahmedemamhatem@gmail.com
- GitHub: [@ahmedemamhatem](https://github.com/ahmedemamhatem)

---

<div align="center">

**Built with love for the Frappe Community**

**Works on any ERPNext site** | **Free AI included** | **Bilingual AR/EN**

</div>
