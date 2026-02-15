frappe.pages['financial-audit'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: (frappe.boot.lang || 'ar') === 'ar' ? 'لوحة التدقيق المالي' : 'Financial Audit Dashboard',
		single_column: true
	});

	wrapper.financial_audit = new FinancialAuditDashboard(page);
}

frappe.pages['financial-audit'].on_page_show = function(wrapper) {
	if (wrapper.financial_audit) {
		wrapper.financial_audit.load_data();
	}
}

// ═══════════════════════════════════════════════════════════
// Bilingual Translations Dictionary (AR / EN)
// ═══════════════════════════════════════════════════════════
const FA_TRANSLATIONS = {
	// ── Page & Actions ──
	refresh: { ar: 'تحديث', en: 'Refresh' },
	ai_analysis_btn: { ar: 'تحليل ذكي (AI)', en: 'AI Analysis' },
	loading_data: { ar: 'جاري تحميل البيانات المالية...', en: 'Loading financial data...' },
	error_loading: { ar: 'حدث خطأ أثناء تحميل البيانات', en: 'Error loading data' },
	no_data: { ar: 'لا توجد بيانات', en: 'No data available' },
	load_data_first: { ar: 'يرجى تحميل البيانات المالية أولاً', en: 'Please load financial data first' },
	ai_loading: { ar: 'جاري تحميل محرك الذكاء الاصطناعي، يرجى المحاولة مرة أخرى بعد ثوانٍ', en: 'AI engine is loading, please try again in a few seconds' },
	ai_analyzing: { ar: 'جاري التحليل بالذكاء الاصطناعي... قد يستغرق دقيقة', en: 'AI analysis in progress... may take a minute' },
	ai_no_response: { ar: 'لا توجد استجابة', en: 'No response' },
	ai_error: { ar: 'حدث خطأ', en: 'An error occurred' },

	// ── Filters ──
	company: { ar: 'الشركة', en: 'Company' },
	from_date: { ar: 'من تاريخ', en: 'From Date' },
	to_date: { ar: 'إلى تاريخ', en: 'To Date' },
	select_company: { ar: 'اختر الشركة', en: 'Select Company' },

	// ── KPI Cards ──
	revenue: { ar: 'الإيرادات', en: 'Revenue' },
	revenue_desc: { ar: 'إجمالي المبيعات خلال الفترة', en: 'Total sales during the period' },
	cogs: { ar: 'تكلفة البضاعة', en: 'COGS' },
	cogs_desc: { ar: 'تكلفة البضاعة المباعة', en: 'Cost of Goods Sold' },
	gross_profit: { ar: 'مجمل الربح', en: 'Gross Profit' },
	gross_profit_desc: { ar: 'الإيرادات - تكلفة البضاعة', en: 'Revenue - COGS' },
	gross_margin: { ar: 'هامش الربح الإجمالي', en: 'Gross Margin' },
	gross_margin_desc: { ar: 'نسبة مجمل الربح للإيرادات', en: 'Gross profit to revenue ratio' },
	net_profit: { ar: 'صافي الربح', en: 'Net Profit' },
	net_profit_desc: { ar: 'الربح بعد كل المصروفات', en: 'Profit after all expenses' },
	net_margin: { ar: 'هامش صافي الربح', en: 'Net Margin' },
	net_margin_desc: { ar: 'نسبة صافي الربح للإيرادات', en: 'Net profit to revenue ratio' },
	ar_outstanding: { ar: 'الذمم المدينة', en: 'Accounts Receivable' },
	ar_outstanding_desc: { ar: 'المستحق من العملاء', en: 'Outstanding from customers' },
	ap_outstanding: { ar: 'الذمم الدائنة', en: 'Accounts Payable' },
	ap_outstanding_desc: { ar: 'المستحق للموردين', en: 'Outstanding to suppliers' },
	cash_balance: { ar: 'الرصيد النقدي', en: 'Cash Balance' },
	cash_balance_desc: { ar: 'إجمالي النقد والبنوك', en: 'Total cash & bank' },
	inventory_value: { ar: 'قيمة المخزون', en: 'Inventory Value' },
	inventory_value_desc: { ar: 'إجمالي قيمة المخزون الحالي', en: 'Total current inventory value' },
	sales_invoices: { ar: 'فواتير المبيعات', en: 'Sales Invoices' },
	sales_invoices_desc: { ar: 'عدد فواتير البيع المعتمدة', en: 'Number of submitted sales invoices' },
	purchase_invoices: { ar: 'فواتير المشتريات', en: 'Purchase Invoices' },
	purchase_invoices_desc: { ar: 'عدد فواتير الشراء المعتمدة', en: 'Number of submitted purchase invoices' },

	// ── Section Titles ──
	sec_balance_sheet: { ar: 'ملخص الميزانية العمومية', en: 'Balance Sheet Summary' },
	sec_balance_sheet_desc: { ar: 'ملخص إجمالي الأصول والالتزامات وحقوق الملكية والإيرادات والمصروفات خلال الفترة المحددة', en: 'Summary of total assets, liabilities, equity, income, and expenses for the selected period' },
	sec_monthly_trends: { ar: 'اتجاهات الإيرادات والمصروفات الشهرية', en: 'Monthly Revenue & Expense Trends' },
	sec_monthly_trends_desc: { ar: 'مقارنة شهرية بين الإيرادات والمصروفات لتتبع الأداء المالي عبر الزمن', en: 'Monthly comparison of revenue and expenses to track financial performance over time' },
	sec_daily_sales: { ar: 'المبيعات اليومية', en: 'Daily Sales' },
	sec_daily_sales_desc: { ar: 'تتبع حركة المبيعات اليومية لكشف الأنماط والاتجاهات الموسمية', en: 'Track daily sales movement to detect patterns and seasonal trends' },
	sec_expense_dist: { ar: 'توزيع المصروفات', en: 'Expense Distribution' },
	sec_expense_dist_desc: { ar: 'توزيع المصروفات حسب الفئة الرئيسية لمعرفة أكبر بنود الإنفاق', en: 'Expense distribution by category to identify top spending items' },
	sec_cash_flow: { ar: 'التدفق النقدي الشهري', en: 'Monthly Cash Flow' },
	sec_cash_flow_desc: { ar: 'مقارنة المقبوضات والمدفوعات الشهرية لتقييم السيولة النقدية', en: 'Monthly receipts vs payments comparison to evaluate cash liquidity' },
	sec_income_stmt: { ar: 'قائمة الدخل', en: 'Income Statement' },
	sec_income_stmt_desc: { ar: 'تفصيل الإيرادات والمصروفات وصافي الربح أو الخسارة للفترة المحددة', en: 'Detailed revenue, expenses, and net profit/loss for the selected period' },
	sec_gl_voucher: { ar: 'ملخص قيود اليومية حسب النوع', en: 'GL Entries Summary by Type' },
	sec_gl_voucher_desc: { ar: 'إجمالي القيود المحاسبية مصنفة حسب نوع المستند المنشئ لها', en: 'Total accounting entries classified by originating document type' },
	sec_stock_voucher: { ar: 'ملخص حركات المخزون حسب النوع', en: 'Stock Ledger Summary by Type' },
	sec_stock_voucher_desc: { ar: 'حركات المخزون الواردة والصادرة مصنفة حسب نوع مستند المخزون', en: 'Incoming and outgoing stock movements classified by stock document type' },
	sec_top_customers: { ar: 'أعلى العملاء حسب الإيرادات', en: 'Top Customers by Revenue' },
	sec_top_customers_desc: { ar: 'ترتيب العملاء حسب حجم المبيعات مع نسبة التحصيل والمستحقات المتبقية', en: 'Customers ranked by sales volume with collection rate and outstanding balance' },
	sec_top_products: { ar: 'أعلى المنتجات حسب الإيرادات', en: 'Top Products by Revenue' },
	sec_top_products_desc: { ar: 'أكثر المنتجات مبيعاً مرتبة حسب إجمالي الإيرادات والكمية المباعة', en: 'Best-selling products ranked by total revenue and quantity sold' },
	sec_top_suppliers: { ar: 'أعلى الموردين', en: 'Top Suppliers' },
	sec_top_suppliers_desc: { ar: 'أكبر الموردين حسب حجم المشتريات مع المستحقات المتبقية لكل مورد', en: 'Top suppliers by purchase volume with remaining outstanding per supplier' },
	sec_sales_returns: { ar: 'مرتجعات المبيعات (إشعارات دائنة)', en: 'Sales Returns (Credit Notes)' },
	sec_sales_returns_desc: { ar: 'ملخص مرتجعات المبيعات حسب العميل لتقييم جودة المنتجات ورضا العملاء', en: 'Sales returns summary by customer to evaluate product quality and customer satisfaction' },
	sec_purchase_returns: { ar: 'مرتجعات المشتريات (إشعارات مدينة)', en: 'Purchase Returns (Debit Notes)' },
	sec_purchase_returns_desc: { ar: 'ملخص مرتجعات المشتريات حسب المورد لتقييم جودة التوريد', en: 'Purchase returns summary by supplier to evaluate supply quality' },
	sec_ar_aging: { ar: 'تقادم الذمم المدينة (العملاء)', en: 'Accounts Receivable Aging' },
	sec_ar_aging_desc: { ar: 'تحليل أعمار المبالغ المستحقة من العملاء لمتابعة التحصيل وإدارة المخاطر', en: 'Analysis of customer outstanding amounts by age to track collection and manage risks' },
	sec_ap_aging: { ar: 'تقادم الذمم الدائنة (الموردين)', en: 'Accounts Payable Aging' },
	sec_ap_aging_desc: { ar: 'تحليل أعمار المبالغ المستحقة للموردين لإدارة جدول السداد والتدفق النقدي', en: 'Analysis of supplier outstanding amounts by age to manage payment schedule and cash flow' },
	sec_bank_balances: { ar: 'أرصدة البنوك والصناديق', en: 'Bank & Cash Balances' },
	sec_bank_balances_desc: { ar: 'أرصدة جميع الحسابات البنكية والصناديق النقدية في تاريخ التقرير', en: 'Balances of all bank accounts and cash at report date' },
	sec_payment_modes: { ar: 'أنماط الدفع', en: 'Payment Modes' },
	sec_payment_modes_desc: { ar: 'توزيع المدفوعات والمقبوضات حسب طريقة الدفع المستخدمة', en: 'Distribution of payments and receipts by payment method used' },
	sec_journal_entries: { ar: 'ملخص قيود اليومية', en: 'Journal Entries Summary' },
	sec_journal_entries_desc: { ar: 'ملخص القيود اليدوية المسجلة مصنفة حسب نوع القيد', en: 'Summary of manual journal entries classified by entry type' },
	sec_inventory: { ar: 'تقييم المخزون حسب المخزن', en: 'Inventory Valuation by Warehouse' },
	sec_inventory_desc: { ar: 'قيمة المخزون الحالية موزعة على المخازن مع عدد الأصناف والكميات', en: 'Current inventory value distributed across warehouses with item count and quantities' },
	sec_stock_movement: { ar: 'أعلى حركات المخزون', en: 'Top Stock Movements' },
	sec_stock_movement_desc: { ar: 'أكثر الأصناف حركة من حيث الكميات الواردة والصادرة وتغير القيمة', en: 'Most active items by incoming/outgoing quantities and value change' },
	sec_stock_ageing: { ar: 'تقادم المخزون (مخزون راكد)', en: 'Stock Ageing (Slow-Moving Stock)' },
	sec_stock_ageing_desc: { ar: 'الأصناف التي مضى على تخزينها فترة طويلة لتحديد المخزون الراكد', en: 'Items stored for a long time to identify slow-moving inventory' },

	// ── Advanced Audit Sections ──
	sec_advanced_divider: { ar: 'تحليلات التدقيق المتقدمة', en: 'Advanced Audit Analytics' },
	sec_working_capital: { ar: 'النسب المالية المتقدمة (DuPont / DSO / CCC)', en: 'Advanced Financial Ratios (DuPont / DSO / CCC)' },
	sec_working_capital_desc: { ar: 'تحليل DuPont لعائد حقوق الملكية، دورة التحويل النقدي، ونسب السيولة المتقدمة', en: 'DuPont ROE analysis, cash conversion cycle, and advanced liquidity ratios' },
	sec_yoy_growth: { ar: 'مقارنة سنوية (YoY Growth)', en: 'Year-over-Year Growth' },
	sec_yoy_growth_desc: { ar: 'مقارنة أداء الفترة الحالية بنفس الفترة من العام السابق لقياس النمو', en: 'Compare current period performance with same period last year to measure growth' },
	sec_benford: { ar: 'تحليل قانون بنفورد (كشف الاحتيال)', en: "Benford's Law Analysis (Fraud Detection)" },
	sec_benford_desc: { ar: 'تحليل توزيع الرقم الأول في مبالغ الفواتير — الانحراف عن قانون بنفورد يشير لاحتمال تلاعب', en: 'First-digit distribution analysis of invoice amounts — deviation from Benford\'s Law may indicate manipulation' },
	sec_duplicate_payments: { ar: 'كشف المدفوعات المكررة', en: 'Duplicate Payment Detection' },
	sec_duplicate_payments_desc: { ar: 'اكتشاف مدفوعات بنفس المبلغ لنفس المورد خلال 7 أيام — مؤشر احتيال محتمل', en: 'Detect payments with same amount to same supplier within 7 days — potential fraud indicator' },
	sec_concentration: { ar: 'تحليل تركز العملاء والموردين', en: 'Customer & Supplier Concentration Risk' },
	sec_concentration_desc: { ar: 'قياس الاعتماد على عدد محدود من العملاء أو الموردين — خطر التركز العالي', en: 'Measure dependency on limited customers/suppliers — high concentration risk' },
	sec_weekend_txn: { ar: 'معاملات نهاية الشهر وعطلات نهاية الأسبوع', en: 'Month-End & Weekend Transactions' },
	sec_weekend_txn_desc: { ar: 'كشف المعاملات في أوقات غير اعتيادية — مؤشر تلاعب أو ضعف رقابة', en: 'Detect transactions at unusual times — indicator of manipulation or weak controls' },

	// ── AI Section ──
	ai_section_title: { ar: 'التحليل الذكي (AI)', en: 'AI Analysis' },

	// ── Table Headers ──
	th_type: { ar: 'النوع', en: 'Type' },
	th_total_debit: { ar: 'إجمالي المدين', en: 'Total Debit' },
	th_total_credit: { ar: 'إجمالي الدائن', en: 'Total Credit' },
	th_balance: { ar: 'الرصيد', en: 'Balance' },
	th_account: { ar: 'الحساب', en: 'Account' },
	th_amount: { ar: 'المبلغ', en: 'Amount' },
	th_doc_type: { ar: 'نوع المستند', en: 'Document Type' },
	th_documents: { ar: 'المستندات', en: 'Documents' },
	th_entries: { ar: 'القيود', en: 'Entries' },
	th_debit: { ar: 'مدين', en: 'Debit' },
	th_credit: { ar: 'دائن', en: 'Credit' },
	th_total: { ar: 'الإجمالي', en: 'Total' },
	th_movements: { ar: 'الحركات', en: 'Movements' },
	th_qty_in: { ar: 'كمية واردة', en: 'Qty In' },
	th_qty_out: { ar: 'كمية صادرة', en: 'Qty Out' },
	th_value_change: { ar: 'تغير القيمة', en: 'Value Change' },
	th_customer: { ar: 'العميل', en: 'Customer' },
	th_invoices: { ar: 'الفواتير', en: 'Invoices' },
	th_revenue_col: { ar: 'الإيرادات', en: 'Revenue' },
	th_outstanding: { ar: 'المستحق', en: 'Outstanding' },
	th_collection: { ar: 'التحصيل', en: 'Collection' },
	th_product: { ar: 'المنتج', en: 'Product' },
	th_quantity: { ar: 'الكمية', en: 'Qty' },
	th_supplier: { ar: 'المورد', en: 'Supplier' },
	th_purchases: { ar: 'المشتريات', en: 'Purchases' },
	th_return_count: { ar: 'عدد المرتجعات', en: 'Return Count' },
	th_oldest_invoice: { ar: 'أقدم فاتورة', en: 'Oldest Invoice' },
	th_age: { ar: 'العمر', en: 'Age' },
	th_account_name: { ar: 'الحساب', en: 'Account' },
	th_account_type: { ar: 'النوع', en: 'Type' },
	th_payment_mode: { ar: 'طريقة الدفع', en: 'Payment Mode' },
	th_count: { ar: 'العدد', en: 'Count' },
	th_entry_type: { ar: 'نوع القيد', en: 'Entry Type' },
	th_warehouse: { ar: 'المخزن', en: 'Warehouse' },
	th_items: { ar: 'الأصناف', en: 'Items' },
	th_value: { ar: 'القيمة', en: 'Value' },
	th_item: { ar: 'الصنف', en: 'Item' },
	th_group: { ar: 'المجموعة', en: 'Group' },
	th_in: { ar: 'وارد', en: 'In' },
	th_out: { ar: 'صادر', en: 'Out' },
	th_status: { ar: 'الحالة', en: 'Status' },
	th_gap: { ar: 'الفارق', en: 'Gap' },
	th_payment1: { ar: 'الدفعة 1', en: 'Payment 1' },
	th_payment2: { ar: 'الدفعة 2', en: 'Payment 2' },
	th_percentage: { ar: 'النسبة', en: 'Percentage' },
	th_indicator: { ar: 'المؤشر', en: 'Indicator' },
	th_current_period: { ar: 'الفترة الحالية', en: 'Current Period' },
	th_prior_period: { ar: 'الفترة السابقة', en: 'Prior Period' },
	th_growth: { ar: 'النمو', en: 'Growth' },
	th_weekend: { ar: 'عطلة نهاية الأسبوع', en: 'Weekend' },
	th_eom: { ar: 'نهاية الشهر', en: 'Month-End' },

	// ── Balance Sheet Root Types ──
	rt_asset: { ar: 'الأصول', en: 'Assets' },
	rt_liability: { ar: 'الالتزامات', en: 'Liabilities' },
	rt_equity: { ar: 'حقوق الملكية', en: 'Equity' },
	rt_income: { ar: 'الإيرادات', en: 'Income' },
	rt_expense: { ar: 'المصروفات', en: 'Expenses' },

	// ── P&L ──
	pnl_income: { ar: 'الإيرادات', en: 'Income' },
	pnl_expenses: { ar: 'المصروفات', en: 'Expenses' },
	pnl_net: { ar: 'صافي الربح / (الخسارة)', en: 'Net Profit / (Loss)' },

	// ── Chart Labels ──
	chart_revenue: { ar: 'الإيرادات', en: 'Revenue' },
	chart_expenses: { ar: 'المصروفات', en: 'Expenses' },
	chart_sales: { ar: 'المبيعات', en: 'Sales' },
	chart_receipts: { ar: 'المقبوضات', en: 'Receipts' },
	chart_payments: { ar: 'المدفوعات', en: 'Payments' },
	chart_total_revenue: { ar: 'إجمالي الإيرادات', en: 'Total Revenue' },
	chart_total_expenses: { ar: 'إجمالي المصروفات', en: 'Total Expenses' },
	chart_avg_revenue_month: { ar: 'متوسط الإيرادات / شهر', en: 'Avg Revenue / Month' },
	chart_best_month: { ar: 'أفضل شهر', en: 'Best Month' },
	chart_total_sales: { ar: 'إجمالي المبيعات', en: 'Total Sales' },
	chart_avg_daily: { ar: 'متوسط يومي', en: 'Daily Average' },
	chart_best_day: { ar: 'أفضل يوم', en: 'Best Day' },
	chart_invoice_count: { ar: 'عدد الفواتير', en: 'Invoice Count' },
	chart_total_receipts: { ar: 'إجمالي المقبوضات', en: 'Total Receipts' },
	chart_total_payments: { ar: 'إجمالي المدفوعات', en: 'Total Payments' },
	chart_net_flow: { ar: 'صافي التدفق', en: 'Net Flow' },
	chart_net: { ar: 'صافي', en: 'Net' },
	chart_benford_expected: { ar: 'التوزيع المتوقع (بنفورد)', en: "Expected (Benford's)" },
	chart_benford_sales: { ar: 'فواتير المبيعات', en: 'Sales Invoices' },
	chart_benford_purchases: { ar: 'فواتير المشتريات', en: 'Purchase Invoices' },
	chart_digit: { ar: 'الرقم', en: 'Digit' },
	chart_first_digit: { ar: 'الرقم الأول', en: 'First Digit' },
	chart_percentage: { ar: 'النسبة %', en: 'Percentage %' },

	// ── Bank Type ──
	bank_type: { ar: 'بنك', en: 'Bank' },
	cash_type: { ar: 'صندوق', en: 'Cash' },

	// ── Payment Types ──
	pay_receive: { ar: 'تحصيل', en: 'Receive' },
	pay_pay: { ar: 'دفع', en: 'Pay' },
	pay_transfer: { ar: 'تحويل داخلي', en: 'Internal Transfer' },

	// ── Working Capital Metrics ──
	wc_dso: { ar: 'DSO (أيام التحصيل)', en: 'DSO (Days Sales Outstanding)' },
	wc_dpo: { ar: 'DPO (أيام السداد)', en: 'DPO (Days Payable Outstanding)' },
	wc_dio: { ar: 'DIO (أيام المخزون)', en: 'DIO (Days Inventory Outstanding)' },
	wc_ccc: { ar: 'CCC (دورة التحويل النقدي)', en: 'CCC (Cash Conversion Cycle)' },
	wc_current_ratio: { ar: 'نسبة التداول', en: 'Current Ratio' },
	wc_quick_ratio: { ar: 'نسبة السيولة السريعة', en: 'Quick Ratio' },
	wc_cash_ratio: { ar: 'نسبة النقد', en: 'Cash Ratio' },
	wc_roe: { ar: 'العائد على حقوق الملكية (ROE)', en: 'Return on Equity (ROE)' },
	wc_dupont: { ar: 'تحليل DuPont', en: 'DuPont Analysis' },
	wc_margin: { ar: 'هامش', en: 'Margin' },
	wc_turnover: { ar: 'دوران', en: 'Turnover' },
	wc_leverage: { ar: 'رافعة', en: 'Leverage' },
	day: { ar: 'يوم', en: 'day' },
	days: { ar: 'يوم', en: 'days' },

	// ── Rating Labels ──
	excellent: { ar: 'ممتاز', en: 'Excellent' },
	good: { ar: 'جيد', en: 'Good' },
	acceptable: { ar: 'مقبول', en: 'Acceptable' },
	slow: { ar: 'بطيء', en: 'Slow' },
	normal: { ar: 'طبيعي', en: 'Normal' },
	fast: { ar: 'سريع', en: 'Fast' },
	healthy: { ar: 'صحي', en: 'Healthy' },
	danger: { ar: 'خطر', en: 'Danger' },
	strong: { ar: 'قوي', en: 'Strong' },
	weak: { ar: 'ضعيف', en: 'Weak' },
	average: { ar: 'متوسط', en: 'Average' },

	// ── Risk Levels ──
	risk_high: { ar: 'مرتفع', en: 'High' },
	risk_medium: { ar: 'متوسط', en: 'Medium' },
	risk_low: { ar: 'منخفض', en: 'Low' },
	risk_high_label: { ar: 'خطر مرتفع', en: 'High Risk' },
	risk_medium_label: { ar: 'خطر متوسط', en: 'Medium Risk' },
	risk_low_label: { ar: 'خطر منخفض', en: 'Low Risk' },
	suspicious: { ar: 'مشبوه', en: 'Suspicious' },
	attention: { ar: 'انتباه', en: 'Attention' },
	normal_label: { ar: 'طبيعي', en: 'Normal' },

	// ── Benford Stats ──
	benford_sales_chi: { ar: 'مبيعات χ²', en: 'Sales χ²' },
	benford_purchases_chi: { ar: 'مشتريات χ²', en: 'Purchases χ²' },
	benford_conforms: { ar: 'يتوافق مع بنفورد', en: "Conforms to Benford's" },
	benford_suspicious: { ar: 'انحراف مشبوه', en: 'Suspicious Deviation' },
	benford_risk_level: { ar: 'مستوى الخطر', en: 'Risk Level' },
	benford_threshold: { ar: 'حد القبول: χ² < 15.51', en: 'Threshold: χ² < 15.51' },

	// ── Duplicate Payments ──
	dp_no_duplicates: { ar: 'لم يتم اكتشاف مدفوعات مكررة مشبوهة', en: 'No suspicious duplicate payments detected' },
	dp_suspicious_count: { ar: 'مدفوعات مشبوهة — إجمالي المبلغ المعرض للخطر', en: 'suspicious payments — total at-risk amount' },

	// ── Concentration ──
	conc_customers: { ar: 'تركز العملاء', en: 'Customer Concentration' },
	conc_suppliers: { ar: 'تركز الموردين', en: 'Supplier Concentration' },
	conc_top_customer: { ar: 'أعلى عميل', en: 'Top Customer' },
	conc_top5: { ar: 'أعلى 5', en: 'Top 5' },
	conc_top_supplier: { ar: 'أعلى مورد', en: 'Top Supplier' },

	// ── Weekend Transactions ──
	wt_weekend_txn: { ar: 'معاملة في عطلة نهاية الأسبوع', en: 'weekend transaction(s)' },
	wt_eom_txn: { ar: 'معاملة نهاية شهر', en: 'month-end transaction(s)' },

	// ── YoY ──
	yoy_revenue: { ar: 'الإيرادات', en: 'Revenue' },
	yoy_gross: { ar: 'مجمل الربح', en: 'Gross Profit' },
	yoy_expenses: { ar: 'المصروفات', en: 'Expenses' },
	yoy_net: { ar: 'صافي الربح', en: 'Net Profit' },
	yoy_invoices: { ar: 'عدد الفواتير', en: 'Invoice Count' },

	// ── AI Report ──
	ai_report_title: { ar: 'تقرير التدقيق المالي الذكي', en: 'AI Financial Audit Report' },
	ai_to: { ar: 'إلى', en: 'to' },
	ai_financial_health: { ar: 'الصحة المالية', en: 'Financial Health' },
	ai_net_profit_label: { ar: 'صافي الربح', en: 'Net Profit' },
	ai_margin_label: { ar: 'هامش', en: 'Margin' },
	ai_cash_liquidity: { ar: 'السيولة النقدية', en: 'Cash Liquidity' },
	ai_covers_liabilities: { ar: 'تغطي الالتزامات', en: 'Covers liabilities' },
	ai_no_covers: { ar: 'لا تغطي الالتزامات', en: 'Does not cover liabilities' },
	ai_collection_rate: { ar: 'نسبة التحصيل', en: 'Collection Rate' },
	ai_receivables: { ar: 'ذمم', en: 'Receivables' },
	ai_working_capital: { ar: 'رأس المال العامل', en: 'Working Capital' },
	ai_wc_formula: { ar: 'مدينون + مخزون − دائنون', en: 'Receivables + Inventory − Payables' },
	ai_key_ratios: { ar: 'النسب المالية الرئيسية', en: 'Key Financial Ratios' },
	ai_gross_margin_label: { ar: 'هامش الربح الإجمالي', en: 'Gross Margin' },
	ai_expense_ratio: { ar: 'نسبة المصروفات', en: 'Expense Ratio' },
	ai_current_ratio: { ar: 'نسبة التداول', en: 'Current Ratio' },
	ai_avg_invoice: { ar: 'متوسط الفاتورة', en: 'Avg Invoice' },
	ai_risk_assessment: { ar: 'تقييم المخاطر', en: 'Risk Assessment' },
	ai_monthly_perf: { ar: 'الأداء الشهري', en: 'Monthly Performance' },
	ai_month: { ar: 'الشهر', en: 'Month' },
	ai_net_col: { ar: 'صافي', en: 'Net' },
	ai_top5_customers: { ar: 'أعلى 5 عملاء', en: 'Top 5 Customers' },
	ai_top5_expenses: { ar: 'أعلى 5 مصروفات', en: 'Top 5 Expenses' },
	ai_item_label: { ar: 'البند', en: 'Item' },
	ai_analysis_reco: { ar: 'التحليل والتوصيات (AI)', en: 'Analysis & Recommendations (AI)' },

	// ── AI Risk Descriptions ──
	risk_weak_collection: { ar: 'ضعف التحصيل', en: 'Weak Collection' },
	risk_liquidity_deficit: { ar: 'عجز السيولة', en: 'Liquidity Deficit' },
	risk_net_loss: { ar: 'خسارة صافية', en: 'Net Loss' },
	risk_benford_deviation: { ar: 'انحراف بنفورد مشبوه', en: 'Suspicious Benford Deviation' },
	risk_benford_desc: { ar: 'تحليل قانون بنفورد يكشف انحراف غير طبيعي في توزيع الفواتير — يتطلب تحقيق', en: "Benford's Law analysis reveals abnormal deviation in invoice distribution — requires investigation" },
	risk_dup_payments: { ar: 'مدفوعات مكررة مشبوهة', en: 'Suspicious Duplicate Payments' },
	risk_high_concentration: { ar: 'تركز عالي في العملاء', en: 'High Customer Concentration' },
	risk_low_margin: { ar: 'هامش ربح منخفض', en: 'Low Profit Margin' },
	risk_high_receivables: { ar: 'تركز الذمم المدينة', en: 'High Receivables Concentration' },
	risk_high_receivables_desc: { ar: 'الذمم المدينة تتجاوز 40% من الإيرادات', en: 'Receivables exceed 40% of revenue' },
	risk_high_inventory: { ar: 'ارتفاع المخزون', en: 'High Inventory Level' },
	risk_high_inventory_desc: { ar: 'قيمة المخزون مرتفعة مقارنة بالإيرادات', en: 'Inventory value is high relative to revenue' },
	risk_long_ccc: { ar: 'دورة نقدية طويلة', en: 'Long Cash Cycle' },
	risk_limited_liquidity: { ar: 'سيولة محدودة', en: 'Limited Liquidity' },
	risk_limited_liquidity_desc: { ar: 'النقد لا يغطي كامل الالتزامات الحالية', en: 'Cash does not cover all current liabilities' },
	risk_ok_margin: { ar: 'هامش ربح مقبول', en: 'Acceptable Margin' },
	risk_ok_margin_desc: { ar: 'هامش الربح مقبول لكن يمكن تحسينه', en: 'Margin is acceptable but can be improved' },

	// ── PDF Export ──
	pdf_export_btn: { ar: 'تصدير PDF', en: 'Export PDF' },
	pdf_title: { ar: 'تقرير التدقيق المالي', en: 'Financial Audit Report' },
	pdf_preparing: { ar: 'جاري تجهيز التقرير للطباعة...', en: 'Preparing report for print...' },

	// ── Custom Layout ──
	layout_btn: { ar: 'تخصيص العرض', en: 'Customize Layout' },
	layout_dialog_title: { ar: 'تخصيص أقسام التقرير', en: 'Customize Report Sections' },
	layout_show_all: { ar: 'عرض الكل', en: 'Show All' },
	layout_hide_all: { ar: 'إخفاء الكل', en: 'Hide All' },
	layout_reset: { ar: 'إعادة تعيين', en: 'Reset' },
	layout_save: { ar: 'حفظ', en: 'Save' },

	// ── Months ──
	month_1: { ar: 'يناير', en: 'January' },
	month_2: { ar: 'فبراير', en: 'February' },
	month_3: { ar: 'مارس', en: 'March' },
	month_4: { ar: 'أبريل', en: 'April' },
	month_5: { ar: 'مايو', en: 'May' },
	month_6: { ar: 'يونيو', en: 'June' },
	month_7: { ar: 'يوليو', en: 'July' },
	month_8: { ar: 'أغسطس', en: 'August' },
	month_9: { ar: 'سبتمبر', en: 'September' },
	month_10: { ar: 'أكتوبر', en: 'October' },
	month_11: { ar: 'نوفمبر', en: 'November' },
	month_12: { ar: 'ديسمبر', en: 'December' },
};

class FinancialAuditDashboard {
	constructor(page) {
		this.page = page;
		this.filters = {};
		this.data = {};
		this.echarts_instances = {};
		this.currency = 'EGP';
		this.lang = (frappe.boot.lang || 'ar') === 'ar' ? 'ar' : 'en';
		this.is_rtl = this.lang === 'ar';
		this.months_ar = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
		this.months_en = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		// Section registry for custom layout
		this.section_registry = [
			{ key: 'balance-sheet', label_key: 'sec_balance_sheet' },
			{ key: 'monthly-chart', label_key: 'sec_monthly_trends' },
			{ key: 'daily-sales-chart', label_key: 'sec_daily_sales' },
			{ key: 'expense-pie', label_key: 'sec_expense_dist' },
			{ key: 'cash-flow-chart', label_key: 'sec_cash_flow' },
			{ key: 'pnl', label_key: 'sec_income_stmt' },
			{ key: 'gl-voucher', label_key: 'sec_gl_voucher' },
			{ key: 'stock-voucher', label_key: 'sec_stock_voucher' },
			{ key: 'top-customers', label_key: 'sec_top_customers' },
			{ key: 'top-products', label_key: 'sec_top_products' },
			{ key: 'top-suppliers', label_key: 'sec_top_suppliers' },
			{ key: 'sales-returns', label_key: 'sec_sales_returns' },
			{ key: 'purchase-returns', label_key: 'sec_purchase_returns' },
			{ key: 'ar-aging', label_key: 'sec_ar_aging' },
			{ key: 'ap-aging', label_key: 'sec_ap_aging' },
			{ key: 'bank-balances', label_key: 'sec_bank_balances' },
			{ key: 'payment-modes', label_key: 'sec_payment_modes' },
			{ key: 'journal-entries', label_key: 'sec_journal_entries' },
			{ key: 'inventory', label_key: 'sec_inventory' },
			{ key: 'stock-movement', label_key: 'sec_stock_movement' },
			{ key: 'stock-ageing', label_key: 'sec_stock_ageing' },
			{ key: 'working-capital', label_key: 'sec_working_capital' },
			{ key: 'yoy-growth', label_key: 'sec_yoy_growth' },
			{ key: 'benford-chart', label_key: 'sec_benford' },
			{ key: 'duplicate-payments', label_key: 'sec_duplicate_payments' },
			{ key: 'concentration', label_key: 'sec_concentration' },
			{ key: 'weekend-txn', label_key: 'sec_weekend_txn' },
		];
		this.load_layout_prefs();

		this.setup_page();
		this.load_puter_js();
		this.load_echarts();
		this.render_filters();
		this.load_data();
	}

	// Translation helper
	t(key) {
		const entry = FA_TRANSLATIONS[key];
		if (!entry) return key;
		return entry[this.lang] || entry['en'] || key;
	}

	// Month name by number
	month_name(mn) {
		return this.lang === 'ar' ? (this.months_ar[mn] || '') : (this.months_en[mn] || '');
	}

	load_puter_js() {
		if (!window.puter) {
			const script = document.createElement('script');
			script.src = 'https://js.puter.com/v2/';
			script.async = true;
			document.head.appendChild(script);
		}
	}

	load_echarts() {
		if (!window.echarts) {
			const script = document.createElement('script');
			script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js';
			script.async = true;
			document.head.appendChild(script);
		}
		// Load Cairo font via link tag as backup
		if (!document.querySelector('link[href*="Cairo"]')) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap';
			document.head.appendChild(link);
		}
	}

	make_section(cls, icon, icon_bg, icon_color, title, body_cls, desc) {
		const section_key = body_cls.replace('-body', '');
		const hidden = this.hidden_sections.has(section_key) ? ' style="display:none"' : '';
		return `
			<div class="${cls}" data-section-key="${section_key}"${hidden}>
				<div class="section-header" data-target="${body_cls}">
					<span class="section-title">
						<span class="section-icon" style="background:${icon_bg};color:${icon_color};"><i class="fa ${icon}"></i></span>
						${title}
					</span>
					<span class="toggle-chevron">&#9660;</span>
				</div>
				${desc ? `<div class="section-desc">${desc}</div>` : ''}
				<div class="section-body ${body_cls}"></div>
			</div>`;
	}

	make_chart_section(icon, icon_bg, icon_color, title, chart_cls, stats_cls, desc) {
		const section_key = chart_cls;
		const hidden = this.hidden_sections.has(section_key) ? ' style="display:none"' : '';
		return `
			<div class="chart-section" data-section-key="${section_key}"${hidden}>
				<div class="section-header" data-target="${chart_cls}">
					<span class="section-title">
						<span class="section-icon" style="background:${icon_bg};color:${icon_color};"><i class="fa ${icon}"></i></span>
						${title}
					</span>
					<span class="toggle-chevron">&#9660;</span>
				</div>
				${desc ? `<div class="section-desc">${desc}</div>` : ''}
				<div class="section-body ${chart_cls}">
					<div class="chart-container ${chart_cls}-chart"></div>
					${stats_cls ? `<div class="chart-stats ${stats_cls}"></div>` : ''}
				</div>
			</div>`;
	}

	setup_page() {
		const dir = this.is_rtl ? 'rtl' : 'ltr';
		const icon_margin = this.is_rtl ? 'margin-left:8px' : 'margin-right:8px';

		this.page.set_primary_action(this.t('refresh'), () => this.load_data(), 'refresh');
		this.page.add_inner_button(this.t('ai_analysis_btn'), () => this.run_ai_analysis());
		this.page.add_inner_button(this.lang === 'ar' ? 'مسح التحليل' : 'Clear AI', () => this.clear_ai_analysis());
		this.page.add_inner_button(this.t('pdf_export_btn'), () => this.export_pdf());
		this.page.add_inner_button(this.t('layout_btn'), () => this.show_layout_dialog());

		this.page.main.html(`
			<div class="financial-audit-page ${this.is_rtl ? '' : 'ltr-mode'}" dir="${dir}">
				<div class="filters-section"></div>

				<!-- AI Analysis — right after filters, before everything -->
				<div class="ai-analysis-section" style="display: none;">
					<div class="section-header ai-header" data-target="ai-analysis-body">
						<span class="section-title"><i class="fa fa-magic" style="${icon_margin}"></i> ${this.t('ai_section_title')}</span>
						<span class="toggle-chevron">&#9660;</span>
					</div>
					<div class="section-body ai-analysis-body"></div>
				</div>

				<div class="kpi-cards"></div>

				${this.make_section('data-section', 'fa-balance-scale', '#eef1ff', '#4361ee',
					this.t('sec_balance_sheet'), 'balance-sheet-body',
					this.t('sec_balance_sheet_desc'))}

				${this.make_chart_section('fa-bar-chart', '#ecfdf5', '#10b981',
					this.t('sec_monthly_trends'), 'monthly-chart', 'monthly-chart-stats',
					this.t('sec_monthly_trends_desc'))}

				${this.make_chart_section('fa-line-chart', '#f5f3ff', '#8b5cf6',
					this.t('sec_daily_sales'), 'daily-sales-chart', 'daily-chart-stats',
					this.t('sec_daily_sales_desc'))}

				${this.make_chart_section('fa-pie-chart', '#fef2f2', '#ef4444',
					this.t('sec_expense_dist'), 'expense-pie', '',
					this.t('sec_expense_dist_desc'))}

				${this.make_chart_section('fa-exchange', '#f0fdfa', '#14b8a6',
					this.t('sec_cash_flow'), 'cash-flow-chart', 'cash-flow-stats',
					this.t('sec_cash_flow_desc'))}

				${this.make_section('data-section pnl-section', 'fa-file-text-o', '#fff7ed', '#f97316',
					this.t('sec_income_stmt'), 'pnl-body',
					this.t('sec_income_stmt_desc'))}

				${this.make_section('data-section', 'fa-book', '#eef1ff', '#4361ee',
					this.t('sec_gl_voucher'), 'gl-voucher-body',
					this.t('sec_gl_voucher_desc'))}

				${this.make_section('data-section', 'fa-cubes', '#fff7ed', '#f97316',
					this.t('sec_stock_voucher'), 'stock-voucher-body',
					this.t('sec_stock_voucher_desc'))}

				${this.make_section('data-section', 'fa-users', '#fdf2f8', '#ec4899',
					this.t('sec_top_customers'), 'top-customers-body',
					this.t('sec_top_customers_desc'))}

				${this.make_section('data-section', 'fa-shopping-bag', '#ecfdf5', '#10b981',
					this.t('sec_top_products'), 'top-products-body',
					this.t('sec_top_products_desc'))}

				${this.make_section('data-section', 'fa-truck', '#fff7ed', '#f97316',
					this.t('sec_top_suppliers'), 'top-suppliers-body',
					this.t('sec_top_suppliers_desc'))}

				${this.make_section('data-section', 'fa-undo', '#fef2f2', '#ef4444',
					this.t('sec_sales_returns'), 'sales-returns-body',
					this.t('sec_sales_returns_desc'))}

				${this.make_section('data-section', 'fa-reply', '#fffbeb', '#f59e0b',
					this.t('sec_purchase_returns'), 'purchase-returns-body',
					this.t('sec_purchase_returns_desc'))}

				${this.make_section('data-section', 'fa-clock-o', '#fdf2f8', '#ec4899',
					this.t('sec_ar_aging'), 'ar-aging-body',
					this.t('sec_ar_aging_desc'))}

				${this.make_section('data-section', 'fa-clock-o', '#fffbeb', '#f59e0b',
					this.t('sec_ap_aging'), 'ap-aging-body',
					this.t('sec_ap_aging_desc'))}

				${this.make_section('data-section', 'fa-university', '#f0fdfa', '#14b8a6',
					this.t('sec_bank_balances'), 'bank-balances-body',
					this.t('sec_bank_balances_desc'))}

				${this.make_section('data-section', 'fa-credit-card', '#f5f3ff', '#8b5cf6',
					this.t('sec_payment_modes'), 'payment-modes-body',
					this.t('sec_payment_modes_desc'))}

				${this.make_section('data-section', 'fa-pencil-square-o', '#eef1ff', '#4361ee',
					this.t('sec_journal_entries'), 'journal-entries-body',
					this.t('sec_journal_entries_desc'))}

				${this.make_section('data-section', 'fa-archive', '#f8fafc', '#64748b',
					this.t('sec_inventory'), 'inventory-body',
					this.t('sec_inventory_desc'))}

				${this.make_section('data-section', 'fa-arrows-v', '#fff7ed', '#f97316',
					this.t('sec_stock_movement'), 'stock-movement-body',
					this.t('sec_stock_movement_desc'))}

				${this.make_section('data-section', 'fa-hourglass-half', '#fef2f2', '#ef4444',
					this.t('sec_stock_ageing'), 'stock-ageing-body',
					this.t('sec_stock_ageing_desc'))}

				<!-- ═══ ADVANCED AUDIT ANALYTICS ═══ -->
				<div class="audit-divider"><span><i class="fa fa-shield"></i> ${this.t('sec_advanced_divider')}</span></div>

				${this.make_section('data-section', 'fa-line-chart', '#ecfdf5', '#047857',
					this.t('sec_working_capital'), 'working-capital-body',
					this.t('sec_working_capital_desc'))}

				${this.make_section('data-section', 'fa-calendar-check-o', '#eef1ff', '#4361ee',
					this.t('sec_yoy_growth'), 'yoy-growth-body',
					this.t('sec_yoy_growth_desc'))}

				${this.make_chart_section('fa-bar-chart-o', '#fdf2f8', '#ec4899',
					this.t('sec_benford'), 'benford-chart', '',
					this.t('sec_benford_desc'))}

				${this.make_section('data-section', 'fa-copy', '#fef2f2', '#b91c1c',
					this.t('sec_duplicate_payments'), 'duplicate-payments-body',
					this.t('sec_duplicate_payments_desc'))}

				${this.make_section('data-section', 'fa-bullseye', '#fffbeb', '#b45309',
					this.t('sec_concentration'), 'concentration-body',
					this.t('sec_concentration_desc'))}

				${this.make_section('data-section', 'fa-calendar-times-o', '#f5f3ff', '#6d28d9',
					this.t('sec_weekend_txn'), 'weekend-txn-body',
					this.t('sec_weekend_txn_desc'))}

			</div>
		`);

		// Cache references
		this.$filters = this.page.main.find('.filters-section');
		this.$kpi = this.page.main.find('.kpi-cards');
		this.$monthly_chart = this.page.main.find('.monthly-chart-chart');
		this.$monthly_stats = this.page.main.find('.monthly-chart-stats');
		this.$daily_chart = this.page.main.find('.daily-sales-chart-chart');
		this.$daily_stats = this.page.main.find('.daily-chart-stats');
		this.$expense_pie = this.page.main.find('.expense-pie-chart');
		this.$cash_flow = this.page.main.find('.cash-flow-chart-chart');
		this.$cash_flow_stats = this.page.main.find('.cash-flow-stats');
		this.$pnl = this.page.main.find('.pnl-body');
		this.$top_customers = this.page.main.find('.top-customers-body');
		this.$top_products = this.page.main.find('.top-products-body');
		this.$top_suppliers = this.page.main.find('.top-suppliers-body');
		this.$ar_aging = this.page.main.find('.ar-aging-body');
		this.$ap_aging = this.page.main.find('.ap-aging-body');
		this.$inventory = this.page.main.find('.inventory-body');
		this.$ai = this.page.main.find('.ai-analysis-section');
		this.$ai_body = this.page.main.find('.ai-analysis-body');
		this.$ai_desc = this.page.main.find('.ai-analysis-section .section-desc');
		this.$balance_sheet = this.page.main.find('.balance-sheet-body');
		this.$gl_voucher = this.page.main.find('.gl-voucher-body');
		this.$stock_voucher = this.page.main.find('.stock-voucher-body');
		this.$stock_movement = this.page.main.find('.stock-movement-body');
		this.$bank_balances = this.page.main.find('.bank-balances-body');
		this.$sales_returns = this.page.main.find('.sales-returns-body');
		this.$purchase_returns = this.page.main.find('.purchase-returns-body');
		this.$journal_entries = this.page.main.find('.journal-entries-body');
		this.$payment_modes = this.page.main.find('.payment-modes-body');
		this.$stock_ageing = this.page.main.find('.stock-ageing-body');
		// Advanced audit sections
		this.$working_capital = this.page.main.find('.working-capital-body');
		this.$yoy_growth = this.page.main.find('.yoy-growth-body');
		this.$benford_chart = this.page.main.find('.benford-chart-chart');
		this.$duplicate_payments = this.page.main.find('.duplicate-payments-body');
		this.$concentration = this.page.main.find('.concentration-body');
		this.$weekend_txn = this.page.main.find('.weekend-txn-body');

		// Toggle all sections via header click (including AI)
		this.page.main.on('click', '.section-header', function(e) {
			const target = $(this).data('target');
			if (!target) return;
			const $parent = $(this).closest('.data-section, .chart-section, .ai-analysis-section');
			const $body = $parent.find('.section-body');
			const $chevron = $(this).find('.toggle-chevron');
			$body.slideToggle(200);
			$chevron.toggleClass('collapsed');
		});

		// Resize echarts on window resize
		$(window).on('resize', () => {
			Object.values(this.echarts_instances).forEach(chart => {
				if (chart && !chart.isDisposed()) chart.resize();
			});
		});
	}

	render_filters() {
		const today = frappe.datetime.get_today();
		const year_start = frappe.datetime.year_start();

		this.$filters.html(`
			<div class="filters-row">
				<div class="filter-field"><label>${this.t('company')}</label><div class="company-field"></div></div>
				<div class="filter-field"><label>${this.t('from_date')}</label><div class="from-date-field"></div></div>
				<div class="filter-field"><label>${this.t('to_date')}</label><div class="to-date-field"></div></div>
			</div>
		`);

		this.company_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link', options: 'Company', fieldname: 'company',
				placeholder: this.t('select_company'),
				default: frappe.defaults.get_user_default("Company"),
				change: () => { this.filters.company = this.company_field.get_value(); this.load_data(); }
			},
			parent: this.$filters.find('.company-field'),
			render_input: true
		});
		this.company_field.set_value(frappe.defaults.get_user_default("Company"));
		this.filters.company = frappe.defaults.get_user_default("Company");

		this.from_date_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Date', fieldname: 'from_date', default: year_start,
				change: () => { this.filters.from_date = this.from_date_field.get_value(); this.load_data(); }
			},
			parent: this.$filters.find('.from-date-field'),
			render_input: true
		});
		this.from_date_field.set_value(year_start);
		this.filters.from_date = year_start;

		this.to_date_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Date', fieldname: 'to_date', default: today,
				change: () => { this.filters.to_date = this.to_date_field.get_value(); this.load_data(); }
			},
			parent: this.$filters.find('.to-date-field'),
			render_input: true
		});
		this.to_date_field.set_value(today);
		this.filters.to_date = today;
	}

	load_data() {
		this.$kpi.html(`<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> ${this.t('loading_data')}</div>`);

		frappe.call({
			method: 'financial_audit.financial_audit.page.financial_audit.financial_audit.get_financial_audit_data',
			args: { filters: this.filters },
			callback: (r) => {
				if (r.message) {
					this.data = r.message;
					this.currency = r.message.currency || 'EGP';
					this.render_all();
				}
			},
			error: () => {
				this.$kpi.html(`<div class="empty-state"><div class="empty-icon"><i class="fa fa-exclamation-triangle"></i></div><p>${this.t('error_loading')}</p></div>`);
			}
		});
	}

	render_all() {
		this.render_kpi_cards();
		this.render_balance_sheet();
		this.render_pnl_table();
		this.render_monthly_chart();
		this.render_daily_sales_chart();
		this.render_expense_pie();
		this.render_cash_flow_chart();
		this.render_gl_voucher_summary();
		this.render_stock_voucher_summary();
		this.render_top_customers();
		this.render_top_products();
		this.render_top_suppliers();
		this.render_sales_returns();
		this.render_purchase_returns();
		this.render_ar_aging();
		this.render_ap_aging();
		this.render_bank_balances();
		this.render_payment_modes();
		this.render_journal_entries();
		this.render_inventory_table();
		this.render_stock_movement();
		this.render_stock_ageing();
		// Advanced audit analytics
		this.render_working_capital();
		this.render_yoy_growth();
		this.render_benford_chart();
		this.render_duplicate_payments();
		this.render_concentration_risk();
		this.render_weekend_transactions();
	}

	// ─── ECharts Helper ─────────────────────────────────────
	init_echart(container_el, options) {
		if (!window.echarts) {
			setTimeout(() => this.init_echart(container_el, options), 500);
			return null;
		}
		const key = container_el.className;
		if (this.echarts_instances[key]) {
			this.echarts_instances[key].dispose();
		}
		const chart = echarts.init(container_el, null, { renderer: 'canvas' });
		chart.setOption(options);
		this.echarts_instances[key] = chart;
		return chart;
	}

	// ─── KPI Cards ─────────────────────────────────────────
	render_kpi_cards() {
		const k = this.data.kpis;
		const cards = [
			{ title: this.t('revenue'), desc: this.t('revenue_desc'), value: this.fc(k.revenue), css: 'revenue', icon: 'fa-money' },
			{ title: this.t('cogs'), desc: this.t('cogs_desc'), value: this.fc(k.cogs), css: 'cogs', icon: 'fa-shopping-cart' },
			{ title: this.t('gross_profit'), desc: this.t('gross_profit_desc'), value: this.fc(k.gross_profit), css: k.gross_profit >= 0 ? 'profit' : 'loss', icon: 'fa-line-chart' },
			{ title: this.t('gross_margin'), desc: this.t('gross_margin_desc'), value: k.gross_margin.toFixed(1) + '%', css: 'margin', icon: 'fa-percent' },
			{ title: this.t('net_profit'), desc: this.t('net_profit_desc'), value: this.fc(k.net_profit), css: k.net_profit >= 0 ? 'profit' : 'loss', icon: 'fa-trophy' },
			{ title: this.t('net_margin'), desc: this.t('net_margin_desc'), value: k.net_margin.toFixed(1) + '%', css: 'margin', icon: 'fa-percent' },
			{ title: this.t('ar_outstanding'), desc: this.t('ar_outstanding_desc'), value: this.fc(k.ar_outstanding), css: 'receivable', icon: 'fa-users' },
			{ title: this.t('ap_outstanding'), desc: this.t('ap_outstanding_desc'), value: this.fc(k.ap_outstanding), css: 'payable', icon: 'fa-truck' },
			{ title: this.t('cash_balance'), desc: this.t('cash_balance_desc'), value: this.fc(k.cash_balance), css: k.cash_balance >= 0 ? 'cash' : 'loss', icon: 'fa-university' },
			{ title: this.t('inventory_value'), desc: this.t('inventory_value_desc'), value: this.fc(k.inventory_value), css: 'inventory', icon: 'fa-cubes' },
			{ title: this.t('sales_invoices'), desc: this.t('sales_invoices_desc'), value: k.si_count, css: 'revenue', icon: 'fa-file-text-o' },
			{ title: this.t('purchase_invoices'), desc: this.t('purchase_invoices_desc'), value: k.pi_count, css: 'cogs', icon: 'fa-file-text' },
		];

		this.$kpi.html(cards.map(c => `
			<div class="kpi-card ${c.css}">
				<div class="kpi-icon"><i class="fa ${c.icon}"></i></div>
				<div class="kpi-title">${c.title}</div>
				<div class="kpi-value">${c.value}</div>
				<div class="kpi-desc">${c.desc}</div>
			</div>
		`).join(''));
	}

	// ─── Balance Sheet Summary ────────────────────────────
	render_balance_sheet() {
		const data = this.data.balance_sheet || [];
		if (!data.length) { this.$balance_sheet.html(this.empty_msg()); return; }

		const root_type_labels = {
			'Asset': this.t('rt_asset'), 'Liability': this.t('rt_liability'), 'Equity': this.t('rt_equity'),
			'Income': this.t('rt_income'), 'Expense': this.t('rt_expense')
		};
		const root_type_icons = {
			'Asset': 'fa-building', 'Liability': 'fa-credit-card', 'Equity': 'fa-shield',
			'Income': 'fa-arrow-circle-up', 'Expense': 'fa-arrow-circle-down'
		};
		const im = this.is_rtl ? 'margin-left:6px' : 'margin-right:6px';

		const rows = data.map(r => {
			const label = root_type_labels[r.root_type] || r.root_type;
			const icon = root_type_icons[r.root_type] || 'fa-circle';
			const is_debit = ['Asset', 'Expense'].includes(r.root_type);
			const balance = is_debit ? r.net_balance : -r.net_balance;
			return `<tr>
				<td><i class="fa ${icon}" style="${im};opacity:0.5"></i> <strong>${label}</strong></td>
				<td class="currency">${this.fc(r.total_debit)}</td>
				<td class="currency">${this.fc(r.total_credit)}</td>
				<td class="currency ${balance >= 0 ? 'positive' : 'negative'}">${this.fc(balance)}</td>
			</tr>`;
		}).join('');

		this.$balance_sheet.html(`<table class="audit-table"><thead><tr>
			<th>${this.t('th_type')}</th><th>${this.t('th_total_debit')}</th><th>${this.t('th_total_credit')}</th><th>${this.t('th_balance')}</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── P&L Table ─────────────────────────────────────────
	render_pnl_table() {
		const inc = this.data.income_accounts || [];
		const exp = this.data.expense_accounts || [];
		const k = this.data.kpis;
		const im = this.is_rtl ? 'margin-left:6px' : 'margin-right:6px';

		let rows = '';
		rows += `<tr class="pnl-row parent income-header"><td colspan="2"><i class="fa fa-arrow-circle-up" style="${im}"></i> ${this.t('pnl_income')}</td><td class="currency positive">${this.fc(k.revenue)}</td></tr>`;
		inc.forEach(a => {
			rows += `<tr class="pnl-row child"><td></td><td>${a.account_name}</td><td class="currency">${this.fc(a.amount)}</td></tr>`;
		});

		rows += `<tr class="pnl-row parent expense-header"><td colspan="2"><i class="fa fa-arrow-circle-down" style="${im}"></i> ${this.t('pnl_expenses')}</td><td class="currency negative">${this.fc(k.total_expenses)}</td></tr>`;
		exp.forEach(a => {
			rows += `<tr class="pnl-row child"><td></td><td>${a.account_name}</td><td class="currency">${this.fc(a.amount)}</td></tr>`;
		});

		rows += `<tr class="pnl-row total"><td colspan="2">${this.t('pnl_net')}</td><td class="currency ${k.net_profit >= 0 ? 'positive' : 'negative'}">${this.fc(k.net_profit)}</td></tr>`;

		this.$pnl.html(`<table class="audit-table"><thead><tr><th></th><th>${this.t('th_account')}</th><th>${this.t('th_amount')}</th></tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── Charts (ECharts) ─────────────────────────────────
	render_monthly_chart() {
		if (!this.data.monthly_trends || !this.data.monthly_trends.length) {
			this.$monthly_chart.html(this.empty_msg());
			this.$monthly_stats.empty();
			return;
		}

		const trends = this.data.monthly_trends;
		this.$monthly_chart.empty();
		const labels = trends.map(t => `${this.month_name(t.mn)} ${t.yr}`);
		const total_revenue = trends.reduce((s, t) => s + (t.revenue || 0), 0);
		const total_expenses = trends.reduce((s, t) => s + (t.expenses || 0), 0);
		const avg_revenue = total_revenue / trends.length;
		const best_month = trends.reduce((best, t) => (t.revenue || 0) > (best.revenue || 0) ? t : best, trends[0]);

		this.init_echart(this.$monthly_chart[0], {
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				formatter: (params) => {
					let html = `<div style="font-weight:700;margin-bottom:4px">${params[0].name}</div>`;
					params.forEach(p => {
						html += `<div>${p.marker} ${p.seriesName}: <strong>${this.fc(p.value)}</strong></div>`;
					});
					return html;
				}
			},
			legend: {
				data: [this.t('chart_revenue'), this.t('chart_expenses')],
				bottom: 0,
				textStyle: { fontFamily: 'Cairo', fontSize: 12 }
			},
			grid: { top: 20, right: 16, bottom: 40, left: 16, containLabel: true },
			xAxis: {
				type: 'category',
				data: labels,
				axisLabel: { fontSize: 11, fontFamily: 'Cairo', rotate: labels.length > 6 ? 30 : 0 }
			},
			yAxis: {
				type: 'value',
				axisLabel: { fontSize: 11, formatter: (v) => this.short_number(v) }
			},
			series: [
				{
					name: this.t('chart_revenue'), type: 'bar', data: trends.map(t => t.revenue),
					itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 32
				},
				{
					name: this.t('chart_expenses'), type: 'bar', data: trends.map(t => t.expenses),
					itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 32
				}
			]
		});

		this.$monthly_stats.html(`
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_total_revenue')}</div><div class="chart-stat-value positive">${this.fc(total_revenue)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_total_expenses')}</div><div class="chart-stat-value negative">${this.fc(total_expenses)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_avg_revenue_month')}</div><div class="chart-stat-value">${this.fc(avg_revenue)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_best_month')}</div><div class="chart-stat-value">${this.month_name(best_month.mn)} ${best_month.yr}</div></div>
		`);
	}

	render_daily_sales_chart() {
		if (!this.data.daily_sales || !this.data.daily_sales.length) {
			this.$daily_chart.html(this.empty_msg());
			this.$daily_stats.empty();
			return;
		}

		const sales = this.data.daily_sales;
		this.$daily_chart.empty();
		const total_sales = sales.reduce((s, d) => s + (d.total_sales || 0), 0);
		const avg_daily = total_sales / sales.length;
		const best_day = sales.reduce((best, d) => (d.total_sales || 0) > (best.total_sales || 0) ? d : best, sales[0]);
		const total_invoices = sales.reduce((s, d) => s + (d.invoice_count || 0), 0);

		this.init_echart(this.$daily_chart[0], {
			tooltip: {
				trigger: 'axis',
				formatter: (params) => {
					const p = params[0];
					return `<div style="font-weight:700;margin-bottom:4px">${p.name}</div>
						<div>${p.marker} ${this.t('chart_sales')}: <strong>${this.fc(p.value)}</strong></div>`;
				}
			},
			legend: {
				data: [this.t('chart_sales')],
				bottom: 0,
				textStyle: { fontFamily: 'Cairo', fontSize: 12 }
			},
			grid: { top: 20, right: 16, bottom: 40, left: 16, containLabel: true },
			xAxis: {
				type: 'category',
				data: sales.map(s => frappe.datetime.str_to_user(s.date)),
				axisLabel: { fontSize: 10, rotate: 45 },
				boundaryGap: false
			},
			yAxis: {
				type: 'value',
				axisLabel: { fontSize: 11, formatter: (v) => this.short_number(v) }
			},
			series: [{
				name: this.t('chart_sales'), type: 'line', data: sales.map(s => s.total_sales),
				smooth: true,
				symbol: 'circle', symbolSize: 5,
				lineStyle: { width: 3, color: '#8b5cf6' },
				itemStyle: { color: '#8b5cf6' },
				areaStyle: {
					color: {
						type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
						colorStops: [
							{ offset: 0, color: 'rgba(139,92,246,0.25)' },
							{ offset: 1, color: 'rgba(139,92,246,0.02)' }
						]
					}
				}
			}]
		});

		this.$daily_stats.html(`
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_total_sales')}</div><div class="chart-stat-value positive">${this.fc(total_sales)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_avg_daily')}</div><div class="chart-stat-value">${this.fc(avg_daily)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_best_day')}</div><div class="chart-stat-value">${frappe.datetime.str_to_user(best_day.date)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_invoice_count')}</div><div class="chart-stat-value">${total_invoices}</div></div>
		`);
	}

	render_expense_pie() {
		const bd = this.data.expense_breakdown || [];
		if (!bd.length) { this.$expense_pie.html(this.empty_msg()); return; }

		this.$expense_pie.empty();
		const colors = ['#10b981', '#ef4444', '#4361ee', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#64748b', '#06b6d4'];
		const top10 = bd.slice(0, 10);

		this.init_echart(this.$expense_pie[0], {
			tooltip: {
				trigger: 'item',
				formatter: (p) => `<div style="font-weight:700;margin-bottom:4px">${p.name}</div>
					<div>${p.marker} ${this.fc(p.value)} (${p.percent}%)</div>`
			},
			legend: {
				orient: 'vertical',
				left: 16,
				top: 'center',
				textStyle: { fontFamily: 'Cairo', fontSize: 12 }
			},
			color: colors,
			series: [{
				type: 'pie',
				radius: ['40%', '70%'],
				center: ['65%', '50%'],
				avoidLabelOverlap: true,
				itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
				label: { show: false },
				emphasis: {
					label: { show: true, fontSize: 13, fontWeight: 'bold', fontFamily: 'Cairo' }
				},
				data: top10.map(e => ({ name: e.category_name, value: e.amount }))
			}]
		});
	}

	render_cash_flow_chart() {
		if (!this.data.cash_flow || !this.data.cash_flow.length) {
			this.$cash_flow.html(this.empty_msg());
			this.$cash_flow_stats.empty();
			return;
		}

		const cf = this.data.cash_flow;
		this.$cash_flow.empty();
		const labels = cf.map(c => `${this.month_name(c.mn)} ${c.yr}`);
		const total_received = cf.reduce((s, c) => s + (c.received || 0), 0);
		const total_paid = cf.reduce((s, c) => s + (c.paid || 0), 0);
		const net_flow = total_received - total_paid;

		this.init_echart(this.$cash_flow[0], {
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				formatter: (params) => {
					let html = `<div style="font-weight:700;margin-bottom:4px">${params[0].name}</div>`;
					params.forEach(p => {
						html += `<div>${p.marker} ${p.seriesName}: <strong>${this.fc(p.value)}</strong></div>`;
					});
					const net = (params[0]?.value || 0) - (params[1]?.value || 0);
					html += `<div style="border-top:1px solid #eee;margin-top:4px;padding-top:4px;font-weight:700;color:${net >= 0 ? '#059669' : '#dc2626'}">${this.t('chart_net')}: ${this.fc(net)}</div>`;
					return html;
				}
			},
			legend: {
				data: [this.t('chart_receipts'), this.t('chart_payments')],
				bottom: 0,
				textStyle: { fontFamily: 'Cairo', fontSize: 12 }
			},
			grid: { top: 20, right: 16, bottom: 40, left: 16, containLabel: true },
			xAxis: {
				type: 'category',
				data: labels,
				axisLabel: { fontSize: 11, fontFamily: 'Cairo', rotate: labels.length > 6 ? 30 : 0 }
			},
			yAxis: {
				type: 'value',
				axisLabel: { fontSize: 11, formatter: (v) => this.short_number(v) }
			},
			series: [
				{
					name: this.t('chart_receipts'), type: 'bar', data: cf.map(c => c.received),
					itemStyle: { color: '#14b8a6', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 32
				},
				{
					name: this.t('chart_payments'), type: 'bar', data: cf.map(c => c.paid),
					itemStyle: { color: '#f97316', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 32
				}
			]
		});

		this.$cash_flow_stats.html(`
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_total_receipts')}</div><div class="chart-stat-value positive">${this.fc(total_received)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_total_payments')}</div><div class="chart-stat-value negative">${this.fc(total_paid)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">${this.t('chart_net_flow')}</div><div class="chart-stat-value ${net_flow >= 0 ? 'positive' : 'negative'}">${this.fc(net_flow)}</div></div>
		`);
	}

	// ─── GL Voucher Summary ───────────────────────────────
	render_gl_voucher_summary() {
		const data = this.data.gl_voucher_summary || [];
		if (!data.length) { this.$gl_voucher.html(this.empty_msg()); return; }

		let total_debit = 0, total_credit = 0, total_docs = 0;
		const rows = data.map((v, i) => {
			total_debit += v.total_debit;
			total_credit += v.total_credit;
			total_docs += v.doc_count;
			return `<tr>
				<td>${i + 1}</td>
				<td><a href="/app/${frappe.router.slug(v.voucher_type)}">${v.voucher_type}</a></td>
				<td><span class="section-count">${v.doc_count}</span></td>
				<td>${v.entry_count}</td>
				<td class="currency">${this.fc(v.total_debit)}</td>
				<td class="currency">${this.fc(v.total_credit)}</td>
			</tr>`;
		}).join('');

		this.$gl_voucher.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_doc_type')}</th><th>${this.t('th_documents')}</th><th>${this.t('th_entries')}</th><th>${this.t('th_debit')}</th><th>${this.t('th_credit')}</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>${this.t('th_total')}</td><td><span class="section-count">${total_docs}</span></td><td></td><td class="currency">${this.fc(total_debit)}</td><td class="currency">${this.fc(total_credit)}</td></tr>
		</tbody></table>`);
	}

	// ─── Stock Voucher Summary ────────────────────────────
	render_stock_voucher_summary() {
		const data = this.data.stock_voucher_summary || [];
		if (!data.length) { this.$stock_voucher.html(this.empty_msg()); return; }

		const rows = data.map((v, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/${frappe.router.slug(v.voucher_type)}">${v.voucher_type}</a></td>
			<td><span class="section-count">${v.doc_count}</span></td>
			<td>${v.entry_count}</td>
			<td class="currency positive">${format_number(v.qty_in, null, 2)}</td>
			<td class="currency negative">${format_number(v.qty_out, null, 2)}</td>
			<td class="currency ${v.value_change >= 0 ? 'positive' : 'negative'}">${this.fc(v.value_change)}</td>
		</tr>`).join('');

		this.$stock_voucher.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_doc_type')}</th><th>${this.t('th_documents')}</th><th>${this.t('th_movements')}</th><th>${this.t('th_qty_in')}</th><th>${this.t('th_qty_out')}</th><th>${this.t('th_value_change')}</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── Tables ────────────────────────────────────────────
	render_top_customers() {
		const data = this.data.top_customers || [];
		if (!data.length) { this.$top_customers.html(this.empty_msg()); return; }

		const rows = data.map((c, i) => {
			const rate = c.collection_rate || 0;
			const bar_css = rate >= 70 ? 'good' : (rate >= 40 ? 'medium' : 'poor');
			return `<tr>
				<td>${i + 1}</td>
				<td><a href="/app/customer/${c.customer}">${c.customer_name}</a></td>
				<td><span class="section-count">${c.invoice_count}</span></td>
				<td class="currency">${this.fc(c.total_revenue)}</td>
				<td class="currency negative">${this.fc(c.outstanding)}</td>
				<td>
					<div class="collection-bar"><div class="fill ${bar_css}" style="width:${Math.min(rate, 100)}%"></div></div>
					<div class="collection-rate-text">${rate}%</div>
				</td>
			</tr>`;
		}).join('');

		this.$top_customers.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_customer')}</th><th>${this.t('th_invoices')}</th><th>${this.t('th_revenue_col')}</th><th>${this.t('th_outstanding')}</th><th>${this.t('th_collection')}</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	render_top_products() {
		const data = this.data.top_products || [];
		if (!data.length) { this.$top_products.html(this.empty_msg()); return; }

		const rows = data.map((p, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/item/${p.item_code}">${p.item_name}</a></td>
			<td>${format_number(p.total_qty, null, 2)}</td>
			<td class="currency">${this.fc(p.total_revenue)}</td>
			<td><span class="section-count">${p.invoice_count}</span></td>
		</tr>`).join('');

		this.$top_products.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_product')}</th><th>${this.t('th_quantity')}</th><th>${this.t('th_revenue_col')}</th><th>${this.t('th_invoices')}</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	render_top_suppliers() {
		const data = this.data.top_suppliers || [];
		if (!data.length) { this.$top_suppliers.html(this.empty_msg()); return; }

		const rows = data.map((s, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/supplier/${s.supplier}">${s.supplier_name}</a></td>
			<td><span class="section-count">${s.invoice_count}</span></td>
			<td class="currency">${this.fc(s.total_purchases)}</td>
			<td class="currency negative">${this.fc(s.outstanding)}</td>
		</tr>`).join('');

		this.$top_suppliers.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_supplier')}</th><th>${this.t('th_invoices')}</th><th>${this.t('th_purchases')}</th><th>${this.t('th_outstanding')}</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── Sales & Purchase Returns ─────────────────────────
	render_sales_returns() {
		const data = this.data.sales_returns || [];
		if (!data.length) { this.$sales_returns.html(this.empty_msg()); return; }

		let total = 0;
		const rows = data.map((r, i) => {
			total += r.return_amount;
			return `<tr>
				<td>${i + 1}</td>
				<td>${r.customer_name}</td>
				<td><span class="section-count">${r.return_count}</span></td>
				<td class="currency negative">${this.fc(r.return_amount)}</td>
			</tr>`;
		}).join('');

		this.$sales_returns.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_customer')}</th><th>${this.t('th_return_count')}</th><th>${this.t('th_amount')}</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>${this.t('th_total')}</td><td></td><td class="currency negative">${this.fc(total)}</td></tr>
		</tbody></table>`);
	}

	render_purchase_returns() {
		const data = this.data.purchase_returns || [];
		if (!data.length) { this.$purchase_returns.html(this.empty_msg()); return; }

		let total = 0;
		const rows = data.map((r, i) => {
			total += r.return_amount;
			return `<tr>
				<td>${i + 1}</td>
				<td>${r.supplier_name}</td>
				<td><span class="section-count">${r.return_count}</span></td>
				<td class="currency negative">${this.fc(r.return_amount)}</td>
			</tr>`;
		}).join('');

		this.$purchase_returns.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_supplier')}</th><th>${this.t('th_return_count')}</th><th>${this.t('th_amount')}</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>${this.t('th_total')}</td><td></td><td class="currency negative">${this.fc(total)}</td></tr>
		</tbody></table>`);
	}

	// ─── AR/AP Aging ──────────────────────────────────────
	render_ar_aging() {
		const data = this.data.ar_aging || [];
		if (!data.length) { this.$ar_aging.html(this.empty_msg()); return; }

		let total = 0;
		const rows = data.map((a, i) => {
			total += a.outstanding;
			return `<tr>
				<td>${i + 1}</td>
				<td><a href="/app/customer/${a.customer}">${a.customer}</a></td>
				<td class="currency negative">${this.fc(a.outstanding)}</td>
				<td>${frappe.datetime.str_to_user(a.oldest_date)}</td>
				<td>${this.aging_badge(a.days_outstanding)}</td>
			</tr>`;
		}).join('');

		this.$ar_aging.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_customer')}</th><th>${this.t('th_outstanding')}</th><th>${this.t('th_oldest_invoice')}</th><th>${this.t('th_age')}</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>${this.t('th_total')}</td><td class="currency negative">${this.fc(total)}</td><td colspan="2"></td></tr>
		</tbody></table>`);
	}

	render_ap_aging() {
		const data = this.data.ap_aging || [];
		if (!data.length) { this.$ap_aging.html(this.empty_msg()); return; }

		let total = 0;
		const rows = data.map((a, i) => {
			total += a.outstanding;
			return `<tr>
				<td>${i + 1}</td>
				<td><a href="/app/supplier/${a.supplier}">${a.supplier}</a></td>
				<td class="currency negative">${this.fc(a.outstanding)}</td>
				<td>${frappe.datetime.str_to_user(a.oldest_date)}</td>
				<td>${this.aging_badge(a.days_outstanding)}</td>
			</tr>`;
		}).join('');

		this.$ap_aging.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_supplier')}</th><th>${this.t('th_outstanding')}</th><th>${this.t('th_oldest_invoice')}</th><th>${this.t('th_age')}</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>${this.t('th_total')}</td><td class="currency negative">${this.fc(total)}</td><td colspan="2"></td></tr>
		</tbody></table>`);
	}

	// ─── Bank Balances ────────────────────────────────────
	render_bank_balances() {
		const data = this.data.bank_balances || [];
		if (!data.length) { this.$bank_balances.html(this.empty_msg()); return; }

		let total = 0;
		const rows = data.map((b, i) => {
			total += b.balance;
			const type_label = b.account_type === 'Bank' ? this.t('bank_type') : this.t('cash_type');
			const type_css = b.account_type === 'Bank' ? 'bank-type' : 'cash-type';
			return `<tr>
				<td>${i + 1}</td>
				<td>${b.account_name}</td>
				<td><span class="account-type-badge ${type_css}">${type_label}</span></td>
				<td class="currency ${b.balance >= 0 ? 'positive' : 'negative'}">${this.fc(b.balance)}</td>
			</tr>`;
		}).join('');

		this.$bank_balances.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_account_name')}</th><th>${this.t('th_account_type')}</th><th>${this.t('th_balance')}</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>${this.t('th_total')}</td><td></td><td class="currency ${total >= 0 ? 'positive' : 'negative'}">${this.fc(total)}</td></tr>
		</tbody></table>`);
	}

	// ─── Payment Modes ────────────────────────────────────
	render_payment_modes() {
		const data = this.data.payment_modes || [];
		if (!data.length) { this.$payment_modes.html(this.empty_msg()); return; }

		const type_labels = { 'Receive': this.t('pay_receive'), 'Pay': this.t('pay_pay'), 'Internal Transfer': this.t('pay_transfer') };
		const type_css_map = { 'Receive': 'receive', 'Pay': 'pay', 'Internal Transfer': 'transfer' };

		const rows = data.map((p, i) => `<tr>
			<td>${i + 1}</td>
			<td>${p.mode}</td>
			<td><span class="payment-type-badge ${type_css_map[p.payment_type] || 'pay'}">${type_labels[p.payment_type] || p.payment_type}</span></td>
			<td><span class="section-count">${p.entry_count}</span></td>
			<td class="currency">${this.fc(p.total_amount)}</td>
		</tr>`).join('');

		this.$payment_modes.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_payment_mode')}</th><th>${this.t('th_type')}</th><th>${this.t('th_count')}</th><th>${this.t('th_amount')}</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── Journal Entries Summary ──────────────────────────
	render_journal_entries() {
		const data = this.data.journal_entries_summary || [];
		if (!data.length) { this.$journal_entries.html(this.empty_msg()); return; }

		let total = 0;
		const rows = data.map((j, i) => {
			total += j.total_amount;
			return `<tr>
				<td>${i + 1}</td>
				<td>${j.entry_type}</td>
				<td><span class="section-count">${j.entry_count}</span></td>
				<td class="currency">${this.fc(j.total_amount)}</td>
			</tr>`;
		}).join('');

		this.$journal_entries.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_entry_type')}</th><th>${this.t('th_count')}</th><th>${this.t('th_amount')}</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>${this.t('th_total')}</td><td></td><td class="currency">${this.fc(total)}</td></tr>
		</tbody></table>`);
	}

	// ─── Inventory ────────────────────────────────────────
	render_inventory_table() {
		const data = this.data.inventory_by_warehouse || [];
		if (!data.length) { this.$inventory.html(this.empty_msg()); return; }

		let total_value = 0, total_items = 0;
		const rows = data.map((w, i) => {
			total_value += w.total_value;
			total_items += w.item_count;
			return `<tr>
				<td>${i + 1}</td>
				<td>${w.warehouse}</td>
				<td><span class="section-count">${w.item_count}</span></td>
				<td>${format_number(w.total_qty, null, 2)}</td>
				<td class="currency">${this.fc(w.total_value)}</td>
			</tr>`;
		}).join('');

		this.$inventory.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_warehouse')}</th><th>${this.t('th_items')}</th><th>${this.t('th_quantity')}</th><th>${this.t('th_value')}</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>${this.t('th_total')}</td><td><span class="section-count">${total_items}</span></td><td></td><td class="currency">${this.fc(total_value)}</td></tr>
		</tbody></table>`);
	}

	// ─── Stock Movement ───────────────────────────────────
	render_stock_movement() {
		const data = this.data.stock_movement || [];
		if (!data.length) { this.$stock_movement.html(this.empty_msg()); return; }

		const rows = data.map((s, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/item/${s.item_code}">${s.item_name || s.item_code}</a></td>
			<td>${s.item_group || '-'}</td>
			<td class="currency positive">${format_number(s.qty_in, null, 2)}</td>
			<td class="currency negative">${format_number(s.qty_out, null, 2)}</td>
			<td class="currency ${s.value_change >= 0 ? 'positive' : 'negative'}">${this.fc(s.value_change)}</td>
			<td><span class="section-count">${s.txn_count}</span></td>
		</tr>`).join('');

		this.$stock_movement.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_item')}</th><th>${this.t('th_group')}</th><th>${this.t('th_in')}</th><th>${this.t('th_out')}</th><th>${this.t('th_value_change')}</th><th>${this.t('th_movements')}</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── Stock Ageing ─────────────────────────────────────
	render_stock_ageing() {
		const data = this.data.stock_ageing || [];
		if (!data.length) { this.$stock_ageing.html(this.empty_msg()); return; }

		const rows = data.map((s, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/item/${s.item_code}">${s.item_name || s.item_code}</a></td>
			<td>${s.warehouse}</td>
			<td>${format_number(s.current_qty, null, 2)}</td>
			<td class="currency">${this.fc(s.current_value)}</td>
			<td>${this.aging_badge(s.age_days)}</td>
		</tr>`).join('');

		this.$stock_ageing.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>${this.t('th_item')}</th><th>${this.t('th_warehouse')}</th><th>${this.t('th_quantity')}</th><th>${this.t('th_value')}</th><th>${this.t('th_age')}</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ═══ ADVANCED AUDIT ANALYTICS ═══════════════════════════

	render_working_capital() {
		const wc = this.data.working_capital_metrics;
		if (!wc) { this.$working_capital.html(this.empty_msg()); return; }

		const ratio_color = (val, good, warn) => val >= good ? '#047857' : (val >= warn ? '#b45309' : '#b91c1c');

		const im = this.is_rtl ? 'margin-left:6px' : 'margin-right:6px';
		const dso_rate = wc.dso < 30 ? this.t('excellent') : wc.dso < 45 ? this.t('good') : wc.dso < 60 ? this.t('acceptable') : this.t('slow');
		const dpo_rate = wc.dpo > 45 ? this.t('slow') : this.t('normal');
		const dio_rate = wc.dio < 30 ? this.t('fast') : wc.dio < 60 ? this.t('normal') : this.t('slow');
		const cr_rate = wc.current_ratio >= 1.5 ? this.t('healthy') : wc.current_ratio >= 1 ? this.t('acceptable') : this.t('danger');
		const qr_rate = wc.quick_ratio >= 1 ? this.t('healthy') : wc.quick_ratio >= 0.5 ? this.t('acceptable') : this.t('danger');
		const cash_rate = wc.cash_ratio >= 0.5 ? this.t('strong') : wc.cash_ratio >= 0.2 ? this.t('acceptable') : this.t('weak');
		const roe_rate = wc.roe >= 15 ? this.t('excellent') : wc.roe >= 5 ? this.t('good') : this.t('weak');

		this.$working_capital.html(`
			<div style="padding:20px">
				<div class="audit-metrics-grid">
					<div class="metric-card">
						<div class="metric-icon" style="background:#ecfdf5;color:#047857"><i class="fa fa-clock-o"></i></div>
						<div class="metric-label">${this.t('wc_dso')}</div>
						<div class="metric-value" style="color:${ratio_color(90-wc.dso, 45, 0)}">${wc.dso} <small>${this.t('days')}</small></div>
						<div class="metric-sub">${dso_rate}</div>
					</div>
					<div class="metric-card">
						<div class="metric-icon" style="background:#fffbeb;color:#b45309"><i class="fa fa-truck"></i></div>
						<div class="metric-label">${this.t('wc_dpo')}</div>
						<div class="metric-value" style="color:var(--fa-text-mid)">${wc.dpo} <small>${this.t('days')}</small></div>
						<div class="metric-sub">${dpo_rate}</div>
					</div>
					<div class="metric-card">
						<div class="metric-icon" style="background:#fff7ed;color:#f97316"><i class="fa fa-cubes"></i></div>
						<div class="metric-label">${this.t('wc_dio')}</div>
						<div class="metric-value" style="color:${ratio_color(90-wc.dio, 30, 0)}">${wc.dio} <small>${this.t('days')}</small></div>
						<div class="metric-sub">${dio_rate}</div>
					</div>
					<div class="metric-card highlight">
						<div class="metric-icon" style="background:#eef1ff;color:#4361ee"><i class="fa fa-refresh"></i></div>
						<div class="metric-label">${this.t('wc_ccc')}</div>
						<div class="metric-value" style="color:${ratio_color(60-wc.ccc, 0, -30)}">${wc.ccc} <small>${this.t('days')}</small></div>
						<div class="metric-sub">DSO + DIO - DPO</div>
					</div>
				</div>
				<div class="audit-metrics-grid" style="margin-top:14px">
					<div class="metric-card">
						<div class="metric-icon" style="background:#f0fdfa;color:#14b8a6"><i class="fa fa-tachometer"></i></div>
						<div class="metric-label">${this.t('wc_current_ratio')}</div>
						<div class="metric-value" style="color:${ratio_color(wc.current_ratio, 1.5, 1)}">${wc.current_ratio}</div>
						<div class="metric-sub">${cr_rate}</div>
					</div>
					<div class="metric-card">
						<div class="metric-icon" style="background:#fdf2f8;color:#ec4899"><i class="fa fa-bolt"></i></div>
						<div class="metric-label">${this.t('wc_quick_ratio')}</div>
						<div class="metric-value" style="color:${ratio_color(wc.quick_ratio, 1, 0.5)}">${wc.quick_ratio}</div>
						<div class="metric-sub">${qr_rate}</div>
					</div>
					<div class="metric-card">
						<div class="metric-icon" style="background:#ecfdf5;color:#047857"><i class="fa fa-money"></i></div>
						<div class="metric-label">${this.t('wc_cash_ratio')}</div>
						<div class="metric-value" style="color:${ratio_color(wc.cash_ratio, 0.5, 0.2)}">${wc.cash_ratio}</div>
						<div class="metric-sub">${cash_rate}</div>
					</div>
					<div class="metric-card">
						<div class="metric-icon" style="background:#f5f3ff;color:#6d28d9"><i class="fa fa-line-chart"></i></div>
						<div class="metric-label">${this.t('wc_roe')}</div>
						<div class="metric-value" style="color:${ratio_color(wc.roe, 15, 5)}">${wc.roe}%</div>
						<div class="metric-sub">${roe_rate}</div>
					</div>
				</div>
				<div style="margin-top:16px;padding:14px 18px;background:#f8fafc;border-radius:8px;border:1px solid var(--fa-border)">
					<div style="font-weight:800;font-size:13px;margin-bottom:8px;color:var(--fa-text)"><i class="fa fa-sitemap" style="${im};color:var(--fa-primary-light)"></i> ${this.t('wc_dupont')}</div>
					<div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;font-size:14px;font-weight:700;direction:ltr">
						<span style="color:${ratio_color(wc.roe, 15, 5)}">ROE ${wc.roe}%</span>
						<span style="color:var(--fa-text-muted)">=</span>
						<span style="padding:4px 10px;background:#ecfdf5;border-radius:6px;color:#047857">${this.t('wc_margin')} ${wc.profit_margin}%</span>
						<span style="color:var(--fa-text-muted)">×</span>
						<span style="padding:4px 10px;background:#eef1ff;border-radius:6px;color:#4361ee">${this.t('wc_turnover')} ${wc.asset_turnover}</span>
						<span style="color:var(--fa-text-muted)">×</span>
						<span style="padding:4px 10px;background:#f5f3ff;border-radius:6px;color:#6d28d9">${this.t('wc_leverage')} ${wc.equity_multiplier}</span>
					</div>
				</div>
			</div>
		`);
	}

	render_yoy_growth() {
		const yoy = this.data.yoy_growth;
		if (!yoy) { this.$yoy_growth.html(this.empty_msg()); return; }

		const arrow = (val) => val >= 0
			? `<span style="color:#047857"><i class="fa fa-arrow-up"></i> ${val.toFixed(1)}%</span>`
			: `<span style="color:#b91c1c"><i class="fa fa-arrow-down"></i> ${Math.abs(val).toFixed(1)}%</span>`;

		const im = this.is_rtl ? 'margin-left:6px' : 'margin-right:6px';
		this.$yoy_growth.html(`<table class="audit-table"><thead><tr>
			<th>${this.t('th_indicator')}</th><th>${this.t('th_current_period')}</th><th>${this.t('th_prior_period')}</th><th>${this.t('th_growth')}</th>
		</tr></thead><tbody>
			<tr>
				<td><i class="fa fa-money" style="${im};color:#047857"></i> ${this.t('yoy_revenue')}</td>
				<td class="currency">${this.fc(yoy.current_revenue)}</td>
				<td class="currency">${this.fc(yoy.prior_revenue)}</td>
				<td>${arrow(yoy.revenue_growth)}</td>
			</tr>
			<tr>
				<td><i class="fa fa-line-chart" style="${im};color:#4361ee"></i> ${this.t('yoy_gross')}</td>
				<td class="currency">${this.fc(yoy.current_gross)}</td>
				<td class="currency">${this.fc(yoy.prior_gross)}</td>
				<td>${arrow(yoy.gross_growth)}</td>
			</tr>
			<tr>
				<td><i class="fa fa-arrow-circle-down" style="${im};color:#ef4444"></i> ${this.t('yoy_expenses')}</td>
				<td class="currency">${this.fc(yoy.current_expenses)}</td>
				<td class="currency">${this.fc(yoy.prior_expenses)}</td>
				<td>${arrow(yoy.expense_growth)}</td>
			</tr>
			<tr style="font-weight:800;border-top:2px solid var(--fa-border)">
				<td><i class="fa fa-trophy" style="${im};color:#b45309"></i> ${this.t('yoy_net')}</td>
				<td class="currency ${yoy.current_net >= 0 ? 'positive' : 'negative'}">${this.fc(yoy.current_net)}</td>
				<td class="currency ${yoy.prior_net >= 0 ? 'positive' : 'negative'}">${this.fc(yoy.prior_net)}</td>
				<td>${arrow(yoy.net_growth)}</td>
			</tr>
			<tr>
				<td><i class="fa fa-file-text-o" style="${im};color:#8b5cf6"></i> ${this.t('yoy_invoices')}</td>
				<td class="currency">${yoy.current_invoices}</td>
				<td class="currency">${yoy.prior_invoices}</td>
				<td>${arrow(yoy.invoice_growth)}</td>
			</tr>
		</tbody></table>`);
	}

	render_benford_chart() {
		const bf = this.data.benfords_law;
		if (!bf || !bf.sales || !bf.sales.data) { this.$benford_chart.html(this.empty_msg()); return; }
		this.$benford_chart.empty();

		const si = bf.sales;
		const pi = bf.purchases;
		const digits = si.data.map(d => d.digit.toString());

		this.init_echart(this.$benford_chart[0], {
			tooltip: {
				trigger: 'axis',
				formatter: (params) => {
					let html = `<div style="font-weight:700;margin-bottom:4px">${this.t('chart_digit')} ${params[0].name}</div>`;
					params.forEach(p => {
						html += `<div>${p.marker} ${p.seriesName}: <strong>${p.value}%</strong></div>`;
					});
					return html;
				}
			},
			legend: {
				data: [this.t('chart_benford_expected'), this.t('chart_benford_sales'), this.t('chart_benford_purchases')],
				bottom: 0,
				textStyle: { fontFamily: 'Cairo', fontSize: 11 }
			},
			grid: { top: 30, right: 16, bottom: 50, left: 16, containLabel: true },
			xAxis: {
				type: 'category', data: digits,
				axisLabel: { fontSize: 13, fontWeight: 'bold' },
				name: this.t('chart_first_digit'), nameLocation: 'middle', nameGap: 30,
				nameTextStyle: { fontFamily: 'Cairo', fontSize: 12 }
			},
			yAxis: {
				type: 'value',
				axisLabel: { fontSize: 11, formatter: '{value}%' },
				name: this.t('chart_percentage'), nameTextStyle: { fontFamily: 'Cairo', fontSize: 12 }
			},
			series: [
				{
					name: this.t('chart_benford_expected'), type: 'line',
					data: si.data.map(d => d.expected_pct),
					lineStyle: { width: 3, color: '#64748b', type: 'dashed' },
					itemStyle: { color: '#64748b' }, symbol: 'diamond', symbolSize: 8
				},
				{
					name: this.t('chart_benford_sales'), type: 'bar',
					data: si.data.map(d => d.observed_pct),
					itemStyle: { color: si.conforms ? '#10b981' : '#ef4444', borderRadius: [4,4,0,0] },
					barMaxWidth: 28
				},
				{
					name: this.t('chart_benford_purchases'), type: 'bar',
					data: pi.data.map(d => d.observed_pct),
					itemStyle: { color: pi.conforms ? '#3b82f6' : '#f97316', borderRadius: [4,4,0,0] },
					barMaxWidth: 28
				}
			]
		});

		// Add stats below chart
		const $parent = this.$benford_chart.closest('.section-body');
		$parent.find('.benford-stats').remove();
		$parent.append(`<div class="benford-stats" style="padding:12px 20px;border-top:1px solid var(--fa-border);display:flex;gap:24px;justify-content:center;flex-wrap:wrap">
			<div style="text-align:center">
				<div style="font-size:11px;font-weight:800;color:var(--fa-text-muted);text-transform:uppercase">${this.t('benford_sales_chi')}</div>
				<div style="font-size:16px;font-weight:900;color:${si.conforms ? '#047857' : '#b91c1c'}">${si.chi_square}</div>
				<div style="font-size:10px;color:var(--fa-text-muted)">${si.conforms ? this.t('benford_conforms') : this.t('benford_suspicious')}</div>
			</div>
			<div style="text-align:center">
				<div style="font-size:11px;font-weight:800;color:var(--fa-text-muted);text-transform:uppercase">${this.t('benford_purchases_chi')}</div>
				<div style="font-size:16px;font-weight:900;color:${pi.conforms ? '#047857' : '#b91c1c'}">${pi.chi_square}</div>
				<div style="font-size:10px;color:var(--fa-text-muted)">${pi.conforms ? this.t('benford_conforms') : this.t('benford_suspicious')}</div>
			</div>
			<div style="text-align:center">
				<div style="font-size:11px;font-weight:800;color:var(--fa-text-muted);text-transform:uppercase">${this.t('benford_risk_level')}</div>
				<div><span class="ai-risk-badge ${si.risk === 'low' && pi.risk === 'low' ? 'low' : (si.risk === 'high' || pi.risk === 'high' ? 'high' : 'medium')}">${
					si.risk === 'low' && pi.risk === 'low' ? this.t('risk_low') : (si.risk === 'high' || pi.risk === 'high' ? this.t('risk_high') : this.t('risk_medium'))
				}</span></div>
				<div style="font-size:10px;color:var(--fa-text-muted);margin-top:2px">${this.t('benford_threshold')}</div>
			</div>
		</div>`);
	}

	render_duplicate_payments() {
		const dp = this.data.duplicate_payments;
		if (!dp || !dp.items || !dp.items.length) {
			this.$duplicate_payments.html(`<div class="empty-state" style="padding:28px">
				<div class="empty-icon" style="background:#ecfdf5;color:#047857"><i class="fa fa-check-circle"></i></div>
				<p style="color:#047857;font-weight:700">${this.t('dp_no_duplicates')}</p>
			</div>`);
			return;
		}

		const rows = dp.items.map((d, i) => `<tr>
			<td>${i + 1}</td>
			<td>${d.supplier}</td>
			<td class="currency">${this.fc(d.amount)}</td>
			<td><a href="/app/payment-entry/${d.payment1}">${d.payment1}</a></td>
			<td><a href="/app/payment-entry/${d.payment2}">${d.payment2}</a></td>
			<td>${d.days_apart} ${this.t('days')}</td>
			<td><span class="ai-risk-badge high">${this.t('suspicious')}</span></td>
		</tr>`).join('');

		const risk_label = dp.risk === 'high' ? this.t('risk_high_label') : dp.risk === 'medium' ? this.t('risk_medium_label') : this.t('risk_low_label');
		this.$duplicate_payments.html(`
			<div style="padding:12px 20px;background:#fef2f2;border-bottom:1px solid var(--fa-border);display:flex;align-items:center;gap:12px">
				<span class="ai-risk-badge ${dp.risk}">${risk_label}</span>
				<span style="font-weight:700;font-size:13px">${dp.count} ${this.t('dp_suspicious_count')}: ${this.fc(dp.total_risk_amount)}</span>
			</div>
			<table class="audit-table"><thead><tr>
				<th>#</th><th>${this.t('th_supplier')}</th><th>${this.t('th_amount')}</th><th>${this.t('th_payment1')}</th><th>${this.t('th_payment2')}</th><th>${this.t('th_gap')}</th><th>${this.t('th_status')}</th>
			</tr></thead><tbody>${rows}</tbody></table>
		`);
	}

	render_concentration_risk() {
		const cr = this.data.concentration_risk;
		if (!cr) { this.$concentration.html(this.empty_msg()); return; }

		const risk_badge = (level) => `<span class="ai-risk-badge ${level}">${level === 'high' ? this.t('risk_high') : level === 'medium' ? this.t('risk_medium') : this.t('risk_low')}</span>`;

		const cust_rows = (cr.customers || []).map((c, i) => `<tr>
			<td>${i + 1}</td>
			<td>${c.customer_name}</td>
			<td class="currency">${this.fc(c.revenue)}</td>
			<td>
				<div style="display:flex;align-items:center;gap:6px">
					<div style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden">
						<div style="width:${Math.min(c.pct, 100)}%;height:100%;background:${c.pct > 20 ? '#ef4444' : c.pct > 10 ? '#f59e0b' : '#10b981'};border-radius:4px"></div>
					</div>
					<span style="font-weight:800;font-size:12px;min-width:40px">${c.pct}%</span>
				</div>
			</td>
		</tr>`).join('');

		const supp_rows = (cr.suppliers || []).map((s, i) => `<tr>
			<td>${i + 1}</td>
			<td>${s.supplier_name}</td>
			<td class="currency">${this.fc(s.purchases)}</td>
			<td>
				<div style="display:flex;align-items:center;gap:6px">
					<div style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden">
						<div style="width:${Math.min(s.pct, 100)}%;height:100%;background:${s.pct > 20 ? '#ef4444' : s.pct > 10 ? '#f59e0b' : '#10b981'};border-radius:4px"></div>
					</div>
					<span style="font-weight:800;font-size:12px;min-width:40px">${s.pct}%</span>
				</div>
			</td>
		</tr>`).join('');

		const im = this.is_rtl ? 'margin-left:6px' : 'margin-right:6px';
		const border_side = this.is_rtl ? 'border-left' : 'border-right';
		this.$concentration.html(`
			<div style="padding:12px 20px;background:#f8fafc;border-bottom:1px solid var(--fa-border);display:flex;gap:24px;flex-wrap:wrap">
				<div>${this.t('conc_customers')}: ${this.t('conc_top_customer')} <strong>${cr.top1_cust_pct}%</strong> | ${this.t('conc_top5')} <strong>${cr.top5_cust_pct}%</strong> ${risk_badge(cr.cust_risk)}</div>
				<div>${this.t('conc_suppliers')}: ${this.t('conc_top_supplier')} <strong>${cr.top1_supp_pct}%</strong> | ${this.t('conc_top5')} <strong>${cr.top5_supp_pct}%</strong> ${risk_badge(cr.supp_risk)}</div>
			</div>
			<div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
				<div style="${border_side}:1px solid var(--fa-border)">
					<div style="padding:10px 16px;font-weight:800;font-size:13px;border-bottom:1px solid var(--fa-border-light);color:var(--fa-text-mid)"><i class="fa fa-users" style="${im}"></i> ${this.t('conc_customers')}</div>
					<table class="audit-table"><thead><tr><th>#</th><th>${this.t('th_customer')}</th><th>${this.t('th_revenue_col')}</th><th>${this.t('th_percentage')}</th></tr></thead><tbody>${cust_rows}</tbody></table>
				</div>
				<div>
					<div style="padding:10px 16px;font-weight:800;font-size:13px;border-bottom:1px solid var(--fa-border-light);color:var(--fa-text-mid)"><i class="fa fa-truck" style="${im}"></i> ${this.t('conc_suppliers')}</div>
					<table class="audit-table"><thead><tr><th>#</th><th>${this.t('th_supplier')}</th><th>${this.t('th_purchases')}</th><th>${this.t('th_percentage')}</th></tr></thead><tbody>${supp_rows}</tbody></table>
				</div>
			</div>
		`);
	}

	render_weekend_transactions() {
		const wt = this.data.weekend_transactions;
		if (!wt || !wt.items || !wt.items.length) { this.$weekend_txn.html(this.empty_msg()); return; }

		const rows = wt.items.map((t, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/${frappe.router.slug(t.doctype)}">${t.doctype}</a></td>
			<td><span class="section-count">${t.total_count}</span></td>
			<td style="color:${t.weekend_pct > 10 ? '#b91c1c' : '#047857'};font-weight:800">${t.weekend_count} <small>(${t.weekend_pct}%)</small></td>
			<td style="color:${t.eom_pct > 30 ? '#b45309' : '#047857'};font-weight:800">${t.eom_count} <small>(${t.eom_pct}%)</small></td>
		</tr>`).join('');

		const wt_risk_label = wt.risk === 'high' ? this.t('risk_high_label') : wt.risk === 'medium' ? this.t('attention') : this.t('normal_label');
		this.$weekend_txn.html(`
			<div style="padding:12px 20px;background:${wt.risk === 'low' ? '#ecfdf5' : '#fffbeb'};border-bottom:1px solid var(--fa-border);display:flex;align-items:center;gap:12px">
				<span class="ai-risk-badge ${wt.risk}">${wt_risk_label}</span>
				<span style="font-weight:700;font-size:13px">${wt.total_weekend} ${this.t('wt_weekend_txn')} | ${wt.total_eom} ${this.t('wt_eom_txn')}</span>
			</div>
			<table class="audit-table"><thead><tr>
				<th>#</th><th>${this.t('th_doc_type')}</th><th>${this.t('th_total')}</th><th>${this.t('th_weekend')}</th><th>${this.t('th_eom')}</th>
			</tr></thead><tbody>${rows}</tbody></table>
		`);
	}

	// ─── AI Analysis ───────────────────────────────────────
	async run_ai_analysis() {
		if (!this.data || !this.data.kpis) {
			frappe.msgprint(this.t('load_data_first'));
			return;
		}

		if (!window.puter) {
			frappe.msgprint(this.t('ai_loading'));
			return;
		}

		this.$ai.slideDown(200, () => {
			$('html, body').animate({ scrollTop: this.$ai.offset().top - 60 }, 300);
		});
		this.$ai_body.html(`<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> ${this.t('ai_analyzing')}</div>`);

		try {
			const prompt = this.build_ai_prompt();
			const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
			const text = typeof response === 'string' ? response
				: (response?.message?.content?.[0]?.text || response?.message?.content || response?.toString() || this.t('ai_no_response'));
			this.show_ai_results(text);
		} catch (e) {
			this.$ai_body.html(`<div class="empty-state"><div class="empty-icon"><i class="fa fa-exclamation-triangle"></i></div><p>${this.t('ai_error')}: ${e.message || e}</p></div>`);
		}
	}

	clear_ai_analysis() {
		this.$ai.slideUp(200);
		this.$ai_body.empty();
	}

	build_ai_prompt() {
		const k = this.data.kpis;
		const top_cust = (this.data.top_customers || []).slice(0, 10).map(c =>
			`${c.customer_name}: إيرادات ${c.total_revenue?.toLocaleString()} - مستحق ${c.outstanding?.toLocaleString()} - تحصيل ${c.collection_rate}%`
		).join('\n');

		const top_prod = (this.data.top_products || []).slice(0, 10).map(p =>
			`${p.item_name}: كمية ${p.total_qty?.toLocaleString()} - إيرادات ${p.total_revenue?.toLocaleString()}`
		).join('\n');

		const ar = (this.data.ar_aging || []).slice(0, 10).map(a =>
			`${a.customer}: مستحق ${a.outstanding?.toLocaleString()} - عمر ${a.days_outstanding} يوم`
		).join('\n');

		const ap = (this.data.ap_aging || []).slice(0, 10).map(a =>
			`${a.supplier}: مستحق ${a.outstanding?.toLocaleString()} - عمر ${a.days_outstanding} يوم`
		).join('\n');

		const expenses = (this.data.expense_breakdown || []).slice(0, 10).map(e =>
			`${e.category_name}: ${e.amount?.toLocaleString()}`
		).join('\n');

		const cf = (this.data.cash_flow || []).map(c =>
			`${c.yr}-${c.mn}: مقبوضات ${c.received?.toLocaleString()} - مدفوعات ${c.paid?.toLocaleString()}`
		).join('\n');

		const balance_sheet = (this.data.balance_sheet || []).map(b =>
			`${b.root_type}: مدين ${b.total_debit?.toLocaleString()} - دائن ${b.total_credit?.toLocaleString()} - صافي ${b.net_balance?.toLocaleString()}`
		).join('\n');

		const gl_vouchers = (this.data.gl_voucher_summary || []).map(v =>
			`${v.voucher_type}: ${v.doc_count} مستند - مدين ${v.total_debit?.toLocaleString()} - دائن ${v.total_credit?.toLocaleString()}`
		).join('\n');

		const stock_vouchers = (this.data.stock_voucher_summary || []).map(v =>
			`${v.voucher_type}: ${v.doc_count} مستند - وارد ${v.qty_in?.toLocaleString()} - صادر ${v.qty_out?.toLocaleString()}`
		).join('\n');

		const bank_balances = (this.data.bank_balances || []).map(b =>
			`${b.account_name} (${b.account_type}): ${b.balance?.toLocaleString()}`
		).join('\n');

		const sales_returns = (this.data.sales_returns || []).map(r =>
			`${r.customer_name}: ${r.return_count} مرتجع - ${r.return_amount?.toLocaleString()}`
		).join('\n');

		const purchase_returns = (this.data.purchase_returns || []).map(r =>
			`${r.supplier_name}: ${r.return_count} مرتجع - ${r.return_amount?.toLocaleString()}`
		).join('\n');

		const stock_movement = (this.data.stock_movement || []).slice(0, 10).map(s =>
			`${s.item_name}: وارد ${s.qty_in?.toLocaleString()} - صادر ${s.qty_out?.toLocaleString()} - تغير القيمة ${s.value_change?.toLocaleString()}`
		).join('\n');

		const custom_dt = (this.data.custom_doctypes_analysis?.submittable_doctypes || []).map(d =>
			`${d.doctype} (${d.module}${d.is_custom ? ' - مخصص' : ''}): ${d.doc_count} مستند`
		).join('\n');

		const installed_apps = (this.data.installed_apps || []).map(a =>
			`${a.app}: ${a.version || 'N/A'}`
		).join('\n');

		// Advanced audit analytics data
		const wc = this.data.working_capital_metrics;
		const wc_text = wc ? `- DSO (أيام التحصيل): ${wc.dso} يوم
- DPO (أيام السداد): ${wc.dpo} يوم
- DIO (أيام المخزون): ${wc.dio} يوم
- CCC (دورة التحويل النقدي): ${wc.ccc} يوم
- نسبة التداول: ${wc.current_ratio}
- نسبة السيولة السريعة: ${wc.quick_ratio}
- نسبة النقد: ${wc.cash_ratio}
- العائد على حقوق الملكية (ROE): ${wc.roe}%
- تحليل DuPont: هامش ${wc.profit_margin}% × دوران الأصول ${wc.asset_turnover} × الرافعة المالية ${wc.equity_multiplier}
- رأس المال العامل: ${wc.working_capital?.toLocaleString()}` : 'لا تتوفر بيانات';

		const yoy = this.data.yoy_growth;
		const yoy_text = yoy ? `- نمو الإيرادات: ${yoy.revenue_growth}% (الحالي: ${yoy.current_revenue?.toLocaleString()} / السابق: ${yoy.prior_revenue?.toLocaleString()})
- نمو مجمل الربح: ${yoy.gross_growth}%
- نمو المصروفات: ${yoy.expense_growth}%
- نمو صافي الربح: ${yoy.net_growth}% (الحالي: ${yoy.current_net?.toLocaleString()} / السابق: ${yoy.prior_net?.toLocaleString()})
- نمو عدد الفواتير: ${yoy.invoice_growth}%` : 'لا تتوفر بيانات';

		const bf = this.data.benfords_law;
		const bf_text = bf ? `- فواتير المبيعات: χ² = ${bf.sales?.chi_square} (${bf.sales?.conforms ? 'يتوافق مع بنفورد' : 'انحراف مشبوه'}) — مستوى الخطر: ${bf.sales?.risk}
- فواتير المشتريات: χ² = ${bf.purchases?.chi_square} (${bf.purchases?.conforms ? 'يتوافق مع بنفورد' : 'انحراف مشبوه'}) — مستوى الخطر: ${bf.purchases?.risk}` : 'لا تتوفر بيانات';

		const dp = this.data.duplicate_payments;
		const dp_text = dp ? `- عدد المدفوعات المكررة المشبوهة: ${dp.count}
- إجمالي المبلغ المعرض للخطر: ${dp.total_risk_amount?.toLocaleString()}
- مستوى الخطر: ${dp.risk}` : 'لا تتوفر بيانات';

		const cr = this.data.concentration_risk;
		const cr_text = cr ? `- أعلى عميل يمثل: ${cr.top1_cust_pct}% من الإيرادات (خطر: ${cr.cust_risk})
- أعلى 5 عملاء يمثلون: ${cr.top5_cust_pct}%
- أعلى مورد يمثل: ${cr.top1_supp_pct}% من المشتريات (خطر: ${cr.supp_risk})
- أعلى 5 موردين يمثلون: ${cr.top5_supp_pct}%` : 'لا تتوفر بيانات';

		const wt = this.data.weekend_transactions;
		const wt_text = wt ? `- إجمالي معاملات عطلة نهاية الأسبوع: ${wt.total_weekend}
- إجمالي معاملات نهاية الشهر: ${wt.total_eom}
- مستوى الخطر: ${wt.risk}` : 'لا تتوفر بيانات';

		const is_ar = this.lang === 'ar';
		const lang_instruction = is_ar
			? 'قدم التقرير منظماً بعناوين واضحة ونقاط محددة باللغة العربية. استخدم أرقام ونسب محددة من البيانات المقدمة.'
			: 'Present the report organized with clear headings and specific points in English. Use specific numbers and ratios from the provided data.';

		const intro = is_ar
			? `أنت محلل مالي ومدقق حسابات خبير بمعايير التدقيق الدولية (ISA). حلل البيانات المالية التالية لشركة "${this.data.company}" للفترة من ${this.data.from_date} إلى ${this.data.to_date} وقدم تقريراً تدقيقياً شاملاً باللغة العربية.`
			: `You are an expert financial analyst and auditor following International Standards on Auditing (ISA). Analyze the following financial data for company "${this.data.company}" for the period from ${this.data.from_date} to ${this.data.to_date} and provide a comprehensive audit report in English.`;

		const requirements = is_ar
			? `## المطلوب — تقرير تدقيق شامل:
1. **تقييم الصحة المالية** (درجة من 100 مع تفسير مفصل)
2. **تحليل DuPont وعائد حقوق الملكية**: تفكيك ROE إلى مكوناته وتحليل نقاط القوة والضعف
3. **تحليل دورة التحويل النقدي (CCC)**: تقييم DSO/DPO/DIO وتأثيرها على السيولة
4. **تحليل المخاطر والاحتيال**: بناءً على نتائج قانون بنفورد، المدفوعات المكررة، ومعاملات العطلات
5. **تحليل تركز العملاء والموردين**: مخاطر الاعتماد على عدد محدود
6. **المقارنة السنوية**: تقييم اتجاهات النمو أو الانكماش
7. **تحليل التدفق النقدي**: هل الشركة قادرة على تغطية التزاماتها؟
8. **تحليل المخزون**: مخزون راكد، دوران بطيء، مشاكل إدارة
9. **تحليل المرتجعات**: نسب المرتجعات وتأثيرها على الربحية
10. **نقاط القوة والضعف**: تحليل SWOT مالي مختصر
11. **توصيات عملية**: 10 توصيات قابلة للتنفيذ مرتبة حسب الأولوية
12. **علامات الإنذار المبكر**: أي مؤشرات تدل على مشاكل مستقبلية`
			: `## Required — Comprehensive Audit Report:
1. **Financial Health Assessment** (score out of 100 with detailed explanation)
2. **DuPont Analysis & ROE**: Break down ROE into components and analyze strengths/weaknesses
3. **Cash Conversion Cycle (CCC) Analysis**: Evaluate DSO/DPO/DIO and their impact on liquidity
4. **Risk & Fraud Analysis**: Based on Benford's Law results, duplicate payments, and weekend transactions
5. **Customer & Supplier Concentration Analysis**: Risks of dependency on limited parties
6. **Year-over-Year Comparison**: Evaluate growth or contraction trends
7. **Cash Flow Analysis**: Can the company cover its obligations?
8. **Inventory Analysis**: Slow-moving stock, slow turnover, management issues
9. **Returns Analysis**: Return rates and their impact on profitability
10. **Strengths & Weaknesses**: Brief financial SWOT analysis
11. **Actionable Recommendations**: 10 prioritized actionable recommendations
12. **Early Warning Signs**: Any indicators pointing to future problems`;

		const no_returns = is_ar ? 'لا توجد مرتجعات' : 'No returns';
		const no_data_text = is_ar ? 'لا تتوفر بيانات' : 'No data available';

		return `${intro}

## Key Financial Indicators:
- Revenue: ${k.revenue?.toLocaleString()} ${this.currency}
- COGS: ${k.cogs?.toLocaleString()} ${this.currency}
- Gross Profit: ${k.gross_profit?.toLocaleString()} ${this.currency} (${k.gross_margin}%)
- Total Expenses: ${k.total_expenses?.toLocaleString()} ${this.currency}
- Net Profit: ${k.net_profit?.toLocaleString()} ${this.currency} (${k.net_margin}%)
- Accounts Receivable: ${k.ar_outstanding?.toLocaleString()} ${this.currency}
- Accounts Payable: ${k.ap_outstanding?.toLocaleString()} ${this.currency}
- Cash Balance: ${k.cash_balance?.toLocaleString()} ${this.currency}
- Inventory Value: ${k.inventory_value?.toLocaleString()} ${this.currency}
- Sales Invoices: ${k.si_count}
- Purchase Invoices: ${k.pi_count}

## Balance Sheet Summary:
${balance_sheet}

## Advanced Financial Ratios (DuPont / CCC):
${wc_text || no_data_text}

## Year-over-Year Comparison:
${yoy_text || no_data_text}

## Benford's Law Analysis (Fraud Detection):
${bf_text || no_data_text}

## Duplicate Payment Detection:
${dp_text || no_data_text}

## Customer & Supplier Concentration:
${cr_text || no_data_text}

## Weekend & Month-End Transactions:
${wt_text || no_data_text}

## GL Entry Types:
${gl_vouchers}

## Stock Voucher Types:
${stock_vouchers}

## Bank & Cash Balances:
${bank_balances}

## Top 10 Customers:
${top_cust}

## Top 10 Products:
${top_prod}

## Sales Returns:
${sales_returns || no_returns}

## Purchase Returns:
${purchase_returns || no_returns}

## AR Aging:
${ar}

## AP Aging:
${ap}

## Expense Distribution:
${expenses}

## Monthly Cash Flow:
${cf}

## Top Stock Movements:
${stock_movement}

## Documents & Custom Doctypes:
${custom_dt}

## Installed Apps:
${installed_apps}

${requirements}

${lang_instruction}`;
	}

	show_ai_results(text) {
		const k = this.data.kpis;

		// Advanced health score — weighted multi-factor
		let score = 50;
		// Profitability (30 pts)
		if (k.net_margin > 20) score += 30; else if (k.net_margin > 10) score += 22; else if (k.net_margin > 5) score += 15; else if (k.net_margin > 0) score += 8; else score -= 10;
		// Liquidity (20 pts)
		const liquidity_ratio = k.ap_outstanding > 0 ? k.cash_balance / k.ap_outstanding : 2;
		if (liquidity_ratio >= 1.5) score += 20; else if (liquidity_ratio >= 1) score += 12; else if (liquidity_ratio >= 0.5) score += 5; else score -= 5;
		// Collection efficiency (15 pts)
		const collection_pct = k.revenue > 0 ? Math.round((1 - k.ar_outstanding / k.revenue) * 100) : 100;
		if (collection_pct >= 85) score += 15; else if (collection_pct >= 70) score += 10; else if (collection_pct >= 50) score += 5; else score -= 5;
		// Gross margin health (10 pts)
		if (k.gross_margin > 30) score += 10; else if (k.gross_margin > 20) score += 7; else if (k.gross_margin > 10) score += 4; else score += 0;
		// Revenue presence (-25 if zero)
		if (k.revenue <= 0) score -= 25;
		// Advanced audit adjustments
		if (this.data.benfords_law) {
			const bf_s = this.data.benfords_law.sales;
			const bf_p = this.data.benfords_law.purchases;
			if (bf_s?.risk === 'high' || bf_p?.risk === 'high') score -= 8;
			else if (bf_s?.conforms && bf_p?.conforms) score += 3;
		}
		if (this.data.duplicate_payments?.count > 5) score -= 5;
		if (this.data.working_capital_metrics) {
			const wc_m = this.data.working_capital_metrics;
			if (wc_m.current_ratio >= 1.5) score += 3;
			else if (wc_m.current_ratio < 1) score -= 3;
		}
		if (this.data.yoy_growth) {
			if (this.data.yoy_growth.revenue_growth > 10) score += 3;
			else if (this.data.yoy_growth.revenue_growth < -10) score -= 5;
		}

		const health_score = Math.max(0, Math.min(100, score));
		const health_color = health_score >= 75 ? '#047857' : (health_score >= 50 ? '#b45309' : '#b91c1c');
		const health_label = health_score >= 75 ? this.t('excellent') : (health_score >= 60 ? this.t('good') : (health_score >= 40 ? this.t('average') : this.t('weak')));
		const gauge_border = `6px solid ${health_color}`;

		// Financial ratios
		const expense_ratio = k.revenue > 0 ? ((k.total_expenses / k.revenue) * 100).toFixed(1) : '0';
		const working_capital = k.ar_outstanding + k.inventory_value - k.ap_outstanding;
		const current_ratio = k.ap_outstanding > 0 ? ((k.cash_balance + k.ar_outstanding) / k.ap_outstanding).toFixed(2) : '∞';
		const debt_to_equity_approx = k.ar_outstanding > 0 ? (k.ap_outstanding / (k.cash_balance + k.ar_outstanding + k.inventory_value)).toFixed(2) : '0';
		const avg_invoice = k.si_count > 0 ? k.revenue / k.si_count : 0;

		// Risk assessment — including advanced audit data
		const risks = [];
		const is_ar = this.lang === 'ar';
		if (collection_pct < 60) risks.push({ level: 'high', title: this.t('risk_weak_collection'), desc: is_ar ? `نسبة التحصيل ${collection_pct}% فقط — خطر تعثر السيولة` : `Collection rate only ${collection_pct}% — liquidity risk` });
		if (liquidity_ratio < 0.5) risks.push({ level: 'high', title: this.t('risk_liquidity_deficit'), desc: is_ar ? `النقد يغطي ${(liquidity_ratio * 100).toFixed(0)}% فقط من الالتزامات` : `Cash covers only ${(liquidity_ratio * 100).toFixed(0)}% of liabilities` });
		if (k.net_margin < 0) risks.push({ level: 'high', title: this.t('risk_net_loss'), desc: is_ar ? `هامش صافي الربح سلبي ${k.net_margin.toFixed(1)}%` : `Net margin is negative ${k.net_margin.toFixed(1)}%` });
		// Benford's Law risk
		const bf = this.data.benfords_law;
		if (bf && (bf.sales?.risk === 'high' || bf.purchases?.risk === 'high')) {
			risks.push({ level: 'high', title: this.t('risk_benford_deviation'), desc: this.t('risk_benford_desc') });
		}
		// Duplicate payments risk
		const dp = this.data.duplicate_payments;
		if (dp && dp.count > 0) {
			risks.push({ level: dp.risk === 'high' ? 'high' : 'medium', title: `${this.t('risk_dup_payments')} (${dp.count})`, desc: is_ar ? `مبلغ معرض للخطر: ${this.fc(dp.total_risk_amount)} — مدفوعات بنفس المبلغ لنفس المورد` : `At-risk amount: ${this.fc(dp.total_risk_amount)} — same amount to same supplier` });
		}
		// Concentration risk
		const cr = this.data.concentration_risk;
		if (cr && cr.cust_risk === 'high') {
			risks.push({ level: 'medium', title: this.t('risk_high_concentration'), desc: is_ar ? `أعلى عميل يمثل ${cr.top1_cust_pct}% من الإيرادات — خطر فقدان العميل` : `Top customer represents ${cr.top1_cust_pct}% of revenue — customer loss risk` });
		}
		if (k.gross_margin < 15) risks.push({ level: 'medium', title: this.t('risk_low_margin'), desc: is_ar ? `هامش الربح الإجمالي ${k.gross_margin.toFixed(1)}% — ضغط على الأسعار` : `Gross margin ${k.gross_margin.toFixed(1)}% — pricing pressure` });
		if (k.ar_outstanding > k.revenue * 0.4) risks.push({ level: 'medium', title: this.t('risk_high_receivables'), desc: this.t('risk_high_receivables_desc') });
		if (k.inventory_value > k.revenue * 0.5) risks.push({ level: 'medium', title: this.t('risk_high_inventory'), desc: this.t('risk_high_inventory_desc') });
		// CCC risk
		const wc = this.data.working_capital_metrics;
		if (wc && wc.ccc > 90) {
			risks.push({ level: 'medium', title: this.t('risk_long_ccc'), desc: is_ar ? `دورة التحويل النقدي ${wc.ccc} يوم — رأس المال مقيد لفترة طويلة` : `Cash conversion cycle ${wc.ccc} days — capital tied up for long periods` });
		}
		if (liquidity_ratio >= 0.5 && liquidity_ratio < 1) risks.push({ level: 'low', title: this.t('risk_limited_liquidity'), desc: this.t('risk_limited_liquidity_desc') });
		if (k.gross_margin >= 15 && k.gross_margin < 25) risks.push({ level: 'low', title: this.t('risk_ok_margin'), desc: this.t('risk_ok_margin_desc') });

		const risks_html = risks.slice(0, 5).map(r => `
			<div class="ai-risk-card ${r.level}">
				<span class="ai-risk-badge ${r.level}">${r.level === 'high' ? this.t('risk_high') : (r.level === 'medium' ? this.t('risk_medium') : this.t('risk_low'))}</span>
				<div class="ai-risk-title">${r.title}</div>
				<div class="ai-risk-desc">${r.desc}</div>
			</div>
		`).join('');

		// Top 5 customers
		const top5 = (this.data.top_customers || []).slice(0, 5);
		const top5_html = top5.map((c, i) => `<tr>
			<td class="num">${i + 1}</td>
			<td>${c.customer_name}</td>
			<td class="currency-val">${this.fc(c.total_revenue)}</td>
			<td style="color:${(c.collection_rate || 0) >= 70 ? '#047857' : '#b45309'};font-weight:800">${c.collection_rate || 0}%</td>
		</tr>`).join('');

		// Top 5 expenses
		const top5_exp = (this.data.expense_breakdown || []).slice(0, 5);
		const top5_exp_html = top5_exp.map((e, i) => `<tr>
			<td class="num">${i + 1}</td>
			<td>${e.category_name}</td>
			<td class="currency-val">${this.fc(e.amount)}</td>
		</tr>`).join('');

		// Monthly trend
		const trends = this.data.monthly_trends || [];
		const trend_html = trends.map(t => `<tr>
			<td>${this.month_name(t.mn)} ${t.yr}</td>
			<td class="currency-val" style="color:#047857">${this.fc(t.revenue)}</td>
			<td class="currency-val" style="color:#b91c1c">${this.fc(t.expenses)}</td>
			<td class="currency-val" style="color:${(t.revenue - t.expenses) >= 0 ? '#047857' : '#b91c1c'}">${this.fc(t.revenue - t.expenses)}</td>
		</tr>`).join('');

		// Convert AI text to HTML
		let ai_html = text
			.replace(/^### (.*$)/gm, '<h4>$1</h4>')
			.replace(/^## (.*$)/gm, '<h3>$1</h3>')
			.replace(/^# (.*$)/gm, '<h2>$1</h2>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/^[\-\*] (.*$)/gm, '<li>$1</li>')
			.replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
			.replace(/\n\n/g, '</p><p>')
			.replace(/\n/g, '<br>');
		ai_html = ai_html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
		ai_html = ai_html.replace(/<\/ul>\s*<ul>/g, '');

		const dir = this.is_rtl ? 'rtl' : 'ltr';
		const align = this.is_rtl ? 'left' : 'right';
		this.$ai_body.html(`
			<div class="ai-report" dir="${dir}">
				<div class="ai-report-header">
					<i class="fa fa-magic" style="color:var(--fa-primary-light)"></i>
					<span>${this.t('ai_report_title')} — ${this.data.company}</span>
					<span class="ai-date">${this.data.from_date} ${this.t('ai_to')} ${this.data.to_date}</span>
				</div>

				<!-- Row 1: Health Gauge + Summary Cards -->
				<div style="display:grid;grid-template-columns:180px 1fr;gap:20px;margin-bottom:24px;align-items:start">
					<div style="text-align:center;padding:20px 10px;border:1px solid var(--fa-border);border-radius:10px">
						<div class="ai-gauge">
							<div class="ai-gauge-circle" style="border:${gauge_border}">
								<div class="ai-gauge-score" style="color:${health_color}">${health_score}</div>
								<div class="ai-gauge-label" style="color:${health_color}">${health_label}</div>
							</div>
						</div>
						<div style="font-size:11px;color:var(--fa-text-muted);font-weight:700;margin-top:6px">${this.t('ai_financial_health')}</div>
					</div>
					<div class="ai-summary-grid" style="margin-bottom:0">
						<div class="ai-summary-card">
							<div class="label">${this.t('ai_net_profit_label')}</div>
							<div class="value" style="color:${k.net_profit >= 0 ? '#047857' : '#b91c1c'}">${this.fc(k.net_profit)}</div>
							<div class="sub" style="color:var(--fa-text-muted)">${this.t('ai_margin_label')} ${k.net_margin.toFixed(1)}%</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">${this.t('ai_cash_liquidity')}</div>
							<div class="value" style="color:${k.cash_balance >= 0 ? '#047857' : '#b91c1c'}">${this.fc(k.cash_balance)}</div>
							<div class="sub" style="color:var(--fa-text-muted)">${k.cash_balance >= k.ap_outstanding ? this.t('ai_covers_liabilities') : this.t('ai_no_covers')}</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">${this.t('ai_collection_rate')}</div>
							<div class="value" style="color:${collection_pct >= 70 ? '#047857' : '#b45309'}">${collection_pct}%</div>
							<div class="sub" style="color:var(--fa-text-muted)">${this.t('ai_receivables')}: ${this.fc(k.ar_outstanding)}</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">${this.t('ai_working_capital')}</div>
							<div class="value" style="color:${working_capital >= 0 ? '#047857' : '#b91c1c'}">${this.fc(working_capital)}</div>
							<div class="sub" style="color:var(--fa-text-muted)">${this.t('ai_wc_formula')}</div>
						</div>
					</div>
				</div>

				<!-- Row 2: Financial Ratios -->
				<div style="margin-bottom:24px">
					<div class="ai-section-title"><i class="fa fa-calculator"></i> ${this.t('ai_key_ratios')}</div>
					<div class="ai-summary-grid">
						<div class="ai-summary-card">
							<div class="label">${this.t('ai_gross_margin_label')}</div>
							<div class="value" style="color:${k.gross_margin >= 20 ? '#047857' : '#b45309'}">${k.gross_margin.toFixed(1)}%</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">${this.t('ai_expense_ratio')}</div>
							<div class="value" style="color:${expense_ratio <= 80 ? '#047857' : '#b91c1c'}">${expense_ratio}%</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">${this.t('ai_current_ratio')}</div>
							<div class="value" style="color:${parseFloat(current_ratio) >= 1 ? '#047857' : '#b91c1c'}">${current_ratio}</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">${this.t('ai_avg_invoice')}</div>
							<div class="value" style="color:var(--fa-text-mid)">${this.fc(avg_invoice)}</div>
						</div>
					</div>
				</div>

				<!-- Row 3: Risk Assessment -->
				${risks.length ? `
				<div style="margin-bottom:24px">
					<div class="ai-section-title"><i class="fa fa-exclamation-triangle" style="color:#b91c1c"></i> ${this.t('ai_risk_assessment')}</div>
					${risks_html}
				</div>` : ''}

				<!-- Row 4: Monthly Trend -->
				${trends.length ? `
				<div style="margin-bottom:24px">
					<div class="ai-section-title"><i class="fa fa-bar-chart"></i> ${this.t('ai_monthly_perf')}</div>
					<table class="ai-data-table">
						<thead><tr>
							<th>${this.t('ai_month')}</th><th style="text-align:${align}">${this.t('chart_revenue')}</th><th style="text-align:${align}">${this.t('chart_expenses')}</th><th style="text-align:${align}">${this.t('ai_net_col')}</th>
						</tr></thead>
						<tbody>${trend_html}</tbody>
					</table>
				</div>` : ''}

				<!-- Row 5: Top Customers + Expenses -->
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
					${top5.length ? `<div>
						<div class="ai-section-title"><i class="fa fa-users"></i> ${this.t('ai_top5_customers')}</div>
						<table class="ai-data-table">
							<thead><tr><th>#</th><th>${this.t('th_customer')}</th><th style="text-align:${align}">${this.t('th_revenue_col')}</th><th style="text-align:${align}">${this.t('th_collection')}</th></tr></thead>
							<tbody>${top5_html}</tbody>
						</table>
					</div>` : '<div></div>'}
					${top5_exp.length ? `<div>
						<div class="ai-section-title"><i class="fa fa-pie-chart"></i> ${this.t('ai_top5_expenses')}</div>
						<table class="ai-data-table">
							<thead><tr><th>#</th><th>${this.t('ai_item_label')}</th><th style="text-align:${align}">${this.t('th_amount')}</th></tr></thead>
							<tbody>${top5_exp_html}</tbody>
						</table>
					</div>` : '<div></div>'}
				</div>

				<!-- Row 6: AI Analysis Text -->
				<div style="border-top:2px solid var(--fa-border);padding-top:24px;margin-top:8px">
					<div class="ai-section-title">
						<i class="fa fa-lightbulb-o" style="color:#b45309"></i> ${this.t('ai_analysis_reco')}
					</div>
					<div class="ai-report-content"><p>${ai_html}</p></div>
				</div>
			</div>
		`);
	}

	// ─── PDF Export ─────────────────────────────────────────
	export_pdf() {
		if (!this.data || !this.data.kpis) {
			frappe.msgprint(this.t('load_data_first'));
			return;
		}

		// Expand all collapsed sections before printing
		const $page = this.page.main.find('.financial-audit-page');
		const $collapsed_bodies = $page.find('.section-body:hidden');
		const $collapsed_chevrons = $page.find('.toggle-chevron.collapsed');
		$collapsed_bodies.show();
		$collapsed_chevrons.removeClass('collapsed');

		// Add print class for enhanced print styling
		$page.addClass('pdf-export-mode');

		// Set document title for PDF filename
		const orig_title = document.title;
		document.title = `${this.t('pdf_title')} - ${this.data.company} - ${this.data.from_date} ${this.t('ai_to')} ${this.data.to_date}`;

		// Trigger print
		setTimeout(() => {
			window.print();

			// Restore state after print dialog
			setTimeout(() => {
				$page.removeClass('pdf-export-mode');
				document.title = orig_title;
				// Re-collapse sections that were collapsed
				$collapsed_bodies.hide();
				$collapsed_chevrons.addClass('collapsed');
			}, 500);
		}, 300);
	}

	// ─── Custom Layout ──────────────────────────────────────
	load_layout_prefs() {
		this.hidden_sections = new Set();
		try {
			const saved = localStorage.getItem('fa_hidden_sections');
			if (saved) {
				const arr = JSON.parse(saved);
				if (Array.isArray(arr)) {
					arr.forEach(k => this.hidden_sections.add(k));
				}
			}
		} catch(e) { /* ignore */ }
	}

	save_layout_prefs() {
		localStorage.setItem('fa_hidden_sections', JSON.stringify([...this.hidden_sections]));
	}

	apply_layout() {
		const $page = this.page.main.find('.financial-audit-page');
		this.section_registry.forEach(sec => {
			const $el = $page.find(`[data-section-key="${sec.key}"]`);
			if ($el.length) {
				if (this.hidden_sections.has(sec.key)) {
					$el.hide();
				} else {
					$el.show();
				}
			}
		});
		// Handle the advanced divider — hide if all advanced sections are hidden
		const advanced_keys = ['working-capital', 'yoy-growth', 'benford-chart', 'duplicate-payments', 'concentration', 'weekend-txn'];
		const all_advanced_hidden = advanced_keys.every(k => this.hidden_sections.has(k));
		const $divider = $page.find('.audit-divider');
		if (all_advanced_hidden) {
			$divider.hide();
		} else {
			$divider.show();
		}
	}

	show_layout_dialog() {
		const me = this;
		const fields = [];

		fields.push({
			fieldtype: 'HTML',
			fieldname: 'layout_actions',
			options: `<div style="display:flex;gap:10px;margin-bottom:12px;">
				<button class="btn btn-xs btn-default layout-show-all">${this.t('layout_show_all')}</button>
				<button class="btn btn-xs btn-default layout-hide-all">${this.t('layout_hide_all')}</button>
				<button class="btn btn-xs btn-default layout-reset">${this.t('layout_reset')}</button>
			</div>`
		});

		this.section_registry.forEach(sec => {
			fields.push({
				fieldtype: 'Check',
				fieldname: `sec_${sec.key.replace(/-/g, '_')}`,
				label: this.t(sec.label_key),
				default: this.hidden_sections.has(sec.key) ? 0 : 1
			});
		});

		const dlg = new frappe.ui.Dialog({
			title: this.t('layout_dialog_title'),
			fields: fields,
			primary_action_label: this.t('layout_save'),
			primary_action: (values) => {
				me.hidden_sections.clear();
				me.section_registry.forEach(sec => {
					const fname = `sec_${sec.key.replace(/-/g, '_')}`;
					if (!values[fname]) {
						me.hidden_sections.add(sec.key);
					}
				});
				me.save_layout_prefs();
				me.apply_layout();
				dlg.hide();
				frappe.show_alert({
					message: me.lang === 'ar' ? 'تم حفظ التخطيط' : 'Layout saved',
					indicator: 'green'
				}, 3);
			}
		});

		dlg.show();

		// Bulk actions
		dlg.$wrapper.find('.layout-show-all').on('click', function() {
			me.section_registry.forEach(sec => {
				const fname = `sec_${sec.key.replace(/-/g, '_')}`;
				dlg.set_value(fname, 1);
			});
		});

		dlg.$wrapper.find('.layout-hide-all').on('click', function() {
			me.section_registry.forEach(sec => {
				const fname = `sec_${sec.key.replace(/-/g, '_')}`;
				dlg.set_value(fname, 0);
			});
		});

		dlg.$wrapper.find('.layout-reset').on('click', function() {
			me.section_registry.forEach(sec => {
				const fname = `sec_${sec.key.replace(/-/g, '_')}`;
				dlg.set_value(fname, 1);
			});
		});
	}

	// ─── Utilities ─────────────────────────────────────────
	fc(value) {
		return format_currency(value || 0, this.currency);
	}

	short_number(value) {
		if (Math.abs(value) >= 1e6) return (value / 1e6).toFixed(1) + 'M';
		if (Math.abs(value) >= 1e3) return (value / 1e3).toFixed(0) + 'K';
		return value.toString();
	}

	aging_badge(days) {
		const d = this.t('days');
		if (days <= 30) return `<span class="aging-badge current"><i class="fa fa-check-circle"></i> ${days} ${d}</span>`;
		if (days <= 60) return `<span class="aging-badge warning"><i class="fa fa-exclamation-circle"></i> ${days} ${d}</span>`;
		return `<span class="aging-badge overdue"><i class="fa fa-times-circle"></i> ${days} ${d}</span>`;
	}

	empty_msg() {
		return `<div class="empty-state"><div class="empty-icon"><i class="fa fa-inbox"></i></div><p>${this.t('no_data')}</p></div>`;
	}
}
