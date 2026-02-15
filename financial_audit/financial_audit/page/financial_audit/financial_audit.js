frappe.pages['financial-audit'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'لوحة التدقيق المالي',
		single_column: true
	});

	new FinancialAuditDashboard(page);
}

class FinancialAuditDashboard {
	constructor(page) {
		this.page = page;
		this.filters = {};
		this.data = {};
		this.charts = {};
		this.currency = 'EGP';

		this.setup_page();
		this.load_puter_js();
		this.render_filters();
		this.load_data();
	}

	load_puter_js() {
		if (!window.puter) {
			const script = document.createElement('script');
			script.src = 'https://js.puter.com/v2/';
			script.async = true;
			document.head.appendChild(script);
		}
	}

	setup_page() {
		this.page.set_primary_action('تحديث', () => this.load_data(), 'refresh');
		this.page.add_inner_button('تحليل ذكي (AI)', () => this.run_ai_analysis());

		this.page.main.html(`
			<div class="financial-audit-page" dir="rtl">
				<div class="filters-section"></div>
				<div class="kpi-cards"></div>

				<!-- Balance Sheet Summary -->
				<div class="data-section">
					<div class="section-header">
						<span class="section-title">ملخص الميزانية العمومية</span>
						<span class="toggle-btn" data-target="balance-sheet-body">▼</span>
					</div>
					<div class="section-body balance-sheet-body"></div>
				</div>

				<!-- Monthly Trends Chart -->
				<div class="chart-section">
					<div class="section-header"><span class="section-title">اتجاهات الإيرادات والمصروفات الشهرية</span></div>
					<div class="chart-container monthly-chart-container"></div>
				</div>

				<!-- Daily Sales + Expense Pie -->
				<div class="charts-row two-col">
					<div class="chart-section">
						<div class="section-header"><span class="section-title">المبيعات اليومية</span></div>
						<div class="chart-container daily-sales-chart-container"></div>
					</div>
					<div class="chart-section">
						<div class="section-header"><span class="section-title">توزيع المصروفات</span></div>
						<div class="chart-container expense-pie-container"></div>
					</div>
				</div>

				<!-- Cash Flow Chart -->
				<div class="chart-section">
					<div class="section-header"><span class="section-title">التدفق النقدي الشهري</span></div>
					<div class="chart-container cash-flow-chart-container"></div>
				</div>

				<!-- P&L -->
				<div class="data-section pnl-section">
					<div class="section-header">
						<span class="section-title">قائمة الدخل</span>
						<span class="toggle-btn" data-target="pnl-body">▼</span>
					</div>
					<div class="section-body pnl-body"></div>
				</div>

				<!-- GL Voucher Summary + Stock Voucher Summary -->
				<div class="tables-row two-col">
					<div class="data-section">
						<div class="section-header">
							<span class="section-title">ملخص قيود اليومية حسب النوع</span>
							<span class="toggle-btn" data-target="gl-voucher-body">▼</span>
						</div>
						<div class="section-body gl-voucher-body"></div>
					</div>
					<div class="data-section">
						<div class="section-header">
							<span class="section-title">ملخص حركات المخزون حسب النوع</span>
							<span class="toggle-btn" data-target="stock-voucher-body">▼</span>
						</div>
						<div class="section-body stock-voucher-body"></div>
					</div>
				</div>

				<!-- Top Customers + Top Products -->
				<div class="tables-row two-col">
					<div class="data-section">
						<div class="section-header"><span class="section-title">أعلى العملاء حسب الإيرادات</span></div>
						<div class="section-body top-customers-body"></div>
					</div>
					<div class="data-section">
						<div class="section-header"><span class="section-title">أعلى المنتجات حسب الإيرادات</span></div>
						<div class="section-body top-products-body"></div>
					</div>
				</div>

				<!-- Top Suppliers -->
				<div class="data-section">
					<div class="section-header"><span class="section-title">أعلى الموردين</span></div>
					<div class="section-body top-suppliers-body"></div>
				</div>

				<!-- Sales Returns + Purchase Returns -->
				<div class="tables-row two-col">
					<div class="data-section">
						<div class="section-header"><span class="section-title">مرتجعات المبيعات (إشعارات دائنة)</span></div>
						<div class="section-body sales-returns-body"></div>
					</div>
					<div class="data-section">
						<div class="section-header"><span class="section-title">مرتجعات المشتريات (إشعارات مدينة)</span></div>
						<div class="section-body purchase-returns-body"></div>
					</div>
				</div>

				<!-- AR Aging + AP Aging -->
				<div class="tables-row two-col">
					<div class="data-section">
						<div class="section-header"><span class="section-title">تقادم الذمم المدينة (العملاء)</span></div>
						<div class="section-body ar-aging-body"></div>
					</div>
					<div class="data-section">
						<div class="section-header"><span class="section-title">تقادم الذمم الدائنة (الموردين)</span></div>
						<div class="section-body ap-aging-body"></div>
					</div>
				</div>

				<!-- Bank Balances -->
				<div class="data-section">
					<div class="section-header">
						<span class="section-title">أرصدة البنوك والصناديق</span>
						<span class="toggle-btn" data-target="bank-balances-body">▼</span>
					</div>
					<div class="section-body bank-balances-body"></div>
				</div>

				<!-- Payment Modes + Journal Entries -->
				<div class="tables-row two-col">
					<div class="data-section">
						<div class="section-header"><span class="section-title">أنماط الدفع</span></div>
						<div class="section-body payment-modes-body"></div>
					</div>
					<div class="data-section">
						<div class="section-header"><span class="section-title">ملخص قيود اليومية</span></div>
						<div class="section-body journal-entries-body"></div>
					</div>
				</div>

				<!-- Inventory + Stock Movement -->
				<div class="tables-row two-col">
					<div class="data-section">
						<div class="section-header"><span class="section-title">تقييم المخزون حسب المخزن</span></div>
						<div class="section-body inventory-body"></div>
					</div>
					<div class="data-section">
						<div class="section-header"><span class="section-title">أعلى حركات المخزون</span></div>
						<div class="section-body stock-movement-body"></div>
					</div>
				</div>

				<!-- Stock Ageing -->
				<div class="data-section">
					<div class="section-header">
						<span class="section-title">تقادم المخزون (مخزون راكد)</span>
						<span class="toggle-btn" data-target="stock-ageing-body">▼</span>
					</div>
					<div class="section-body stock-ageing-body"></div>
				</div>

				<!-- AI Analysis -->
				<div class="ai-analysis-section" style="display: none;">
					<div class="section-header ai-header">
						<span class="section-title">التحليل الذكي (AI)</span>
						<button class="btn btn-xs btn-default close-ai-btn">✕</button>
					</div>
					<div class="ai-analysis-body"></div>
				</div>
			</div>
		`);

		// Cache references
		this.$filters = this.page.main.find('.filters-section');
		this.$kpi = this.page.main.find('.kpi-cards');
		this.$monthly_chart = this.page.main.find('.monthly-chart-container');
		this.$daily_chart = this.page.main.find('.daily-sales-chart-container');
		this.$expense_pie = this.page.main.find('.expense-pie-container');
		this.$cash_flow = this.page.main.find('.cash-flow-chart-container');
		this.$pnl = this.page.main.find('.pnl-body');
		this.$top_customers = this.page.main.find('.top-customers-body');
		this.$top_products = this.page.main.find('.top-products-body');
		this.$top_suppliers = this.page.main.find('.top-suppliers-body');
		this.$ar_aging = this.page.main.find('.ar-aging-body');
		this.$ap_aging = this.page.main.find('.ap-aging-body');
		this.$inventory = this.page.main.find('.inventory-body');
		this.$ai = this.page.main.find('.ai-analysis-section');
		this.$ai_body = this.page.main.find('.ai-analysis-body');
		// New section references
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

		// Toggle sections
		this.page.main.on('click', '.toggle-btn', function() {
			const target = $(this).data('target');
			$('.' + target).slideToggle(200);
			$(this).text($('.' + target).is(':visible') ? '▼' : '▶');
		});

		// Close AI
		this.page.main.on('click', '.close-ai-btn', () => this.$ai.slideUp());
	}

	render_filters() {
		const today = frappe.datetime.get_today();
		const year_start = frappe.datetime.add_months(today, -1);

		this.$filters.html(`
			<div class="filters-row">
				<div class="filter-field"><label>الشركة</label><div class="company-field"></div></div>
				<div class="filter-field"><label>من تاريخ</label><div class="from-date-field"></div></div>
				<div class="filter-field"><label>إلى تاريخ</label><div class="to-date-field"></div></div>
			</div>
		`);

		this.company_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link', options: 'Company', fieldname: 'company',
				placeholder: 'اختر الشركة',
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
		this.$kpi.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> جاري تحميل البيانات المالية...</div>');

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
				this.$kpi.html('<div class="empty-state"><i class="fa fa-exclamation-triangle"></i><p>حدث خطأ أثناء تحميل البيانات</p></div>');
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
	}

	// ─── KPI Cards ─────────────────────────────────────────
	render_kpi_cards() {
		const k = this.data.kpis;
		const cards = [
			{ title: 'الإيرادات', value: this.fc(k.revenue), css: 'revenue', icon: 'fa-money' },
			{ title: 'تكلفة البضاعة', value: this.fc(k.cogs), css: 'cogs', icon: 'fa-shopping-cart' },
			{ title: 'مجمل الربح', value: this.fc(k.gross_profit), css: k.gross_profit >= 0 ? 'profit' : 'loss', icon: 'fa-line-chart' },
			{ title: 'هامش الربح الإجمالي', value: k.gross_margin.toFixed(1) + '%', css: 'margin', icon: 'fa-percent' },
			{ title: 'صافي الربح', value: this.fc(k.net_profit), css: k.net_profit >= 0 ? 'profit' : 'loss', icon: 'fa-trophy' },
			{ title: 'هامش صافي الربح', value: k.net_margin.toFixed(1) + '%', css: 'margin', icon: 'fa-percent' },
			{ title: 'الذمم المدينة', value: this.fc(k.ar_outstanding), css: 'receivable', icon: 'fa-users' },
			{ title: 'الذمم الدائنة', value: this.fc(k.ap_outstanding), css: 'payable', icon: 'fa-truck' },
			{ title: 'الرصيد النقدي', value: this.fc(k.cash_balance), css: k.cash_balance >= 0 ? 'cash' : 'loss', icon: 'fa-university' },
			{ title: 'قيمة المخزون', value: this.fc(k.inventory_value), css: 'inventory', icon: 'fa-cubes' },
			{ title: 'فواتير المبيعات', value: k.si_count, css: 'revenue', icon: 'fa-file-text-o' },
			{ title: 'فواتير المشتريات', value: k.pi_count, css: 'cogs', icon: 'fa-file-text' },
		];

		this.$kpi.html(cards.map(c => `
			<div class="kpi-card ${c.css}">
				<div class="kpi-icon"><i class="fa ${c.icon}"></i></div>
				<div class="kpi-title">${c.title}</div>
				<div class="kpi-value">${c.value}</div>
			</div>
		`).join(''));
	}

	// ─── Balance Sheet Summary ────────────────────────────
	render_balance_sheet() {
		const data = this.data.balance_sheet || [];
		if (!data.length) { this.$balance_sheet.html(this.empty_msg()); return; }

		const root_type_labels = {
			'Asset': 'الأصول',
			'Liability': 'الالتزامات',
			'Equity': 'حقوق الملكية',
			'Income': 'الإيرادات',
			'Expense': 'المصروفات'
		};

		const rows = data.map(r => {
			const label = root_type_labels[r.root_type] || r.root_type;
			const is_debit = ['Asset', 'Expense'].includes(r.root_type);
			const balance = is_debit ? r.net_balance : -r.net_balance;
			return `<tr>
				<td><strong>${label}</strong></td>
				<td class="currency">${this.fc(r.total_debit)}</td>
				<td class="currency">${this.fc(r.total_credit)}</td>
				<td class="currency ${balance >= 0 ? 'positive' : 'negative'}">${this.fc(balance)}</td>
			</tr>`;
		}).join('');

		this.$balance_sheet.html(`<table class="audit-table"><thead><tr>
			<th>النوع</th><th>إجمالي المدين</th><th>إجمالي الدائن</th><th>الرصيد</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── P&L Table ─────────────────────────────────────────
	render_pnl_table() {
		const inc = this.data.income_accounts || [];
		const exp = this.data.expense_accounts || [];
		const k = this.data.kpis;

		let rows = '';
		rows += `<tr class="pnl-row parent income-header"><td colspan="2">الإيرادات</td><td class="currency positive">${this.fc(k.revenue)}</td></tr>`;
		inc.forEach(a => {
			rows += `<tr class="pnl-row child"><td></td><td>${a.account_name}</td><td class="currency">${this.fc(a.amount)}</td></tr>`;
		});

		rows += `<tr class="pnl-row parent expense-header"><td colspan="2">المصروفات</td><td class="currency negative">${this.fc(k.total_expenses)}</td></tr>`;
		exp.forEach(a => {
			rows += `<tr class="pnl-row child"><td></td><td>${a.account_name}</td><td class="currency">${this.fc(a.amount)}</td></tr>`;
		});

		rows += `<tr class="pnl-row total"><td colspan="2">صافي الربح / (الخسارة)</td><td class="currency ${k.net_profit >= 0 ? 'positive' : 'negative'}">${this.fc(k.net_profit)}</td></tr>`;

		this.$pnl.html(`<table class="audit-table"><thead><tr><th></th><th>الحساب</th><th>المبلغ</th></tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── Charts ────────────────────────────────────────────
	render_monthly_chart() {
		const trends = this.data.monthly_trends || [];
		if (!trends.length) { this.$monthly_chart.html(this.empty_msg()); return; }

		this.$monthly_chart.empty();
		const months_ar = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
		const labels = trends.map(t => `${months_ar[t.mn]} ${t.yr}`);

		this.charts.monthly = new frappe.Chart(this.$monthly_chart[0], {
			type: 'bar', height: 320,
			colors: ['#28a745', '#dc3545'],
			data: {
				labels: labels,
				datasets: [
					{ name: 'الإيرادات', values: trends.map(t => t.revenue) },
					{ name: 'المصروفات', values: trends.map(t => t.expenses) }
				]
			},
			barOptions: { spaceRatio: 0.4 },
			tooltipOptions: { formatTooltipY: d => this.fc(d) },
			axisOptions: { xIsSeries: true }
		});
	}

	render_daily_sales_chart() {
		const sales = this.data.daily_sales || [];
		if (!sales.length) { this.$daily_chart.html(this.empty_msg()); return; }

		this.$daily_chart.empty();
		this.charts.daily = new frappe.Chart(this.$daily_chart[0], {
			type: 'line', height: 280,
			colors: ['#667eea'],
			data: {
				labels: sales.map(s => frappe.datetime.str_to_user(s.date)),
				datasets: [{ name: 'المبيعات', values: sales.map(s => s.total_sales) }]
			},
			lineOptions: { regionFill: 1, hideDots: 1, spline: 1 },
			tooltipOptions: { formatTooltipY: d => this.fc(d) },
			axisOptions: { xIsSeries: true }
		});
	}

	render_expense_pie() {
		const bd = this.data.expense_breakdown || [];
		if (!bd.length) { this.$expense_pie.html(this.empty_msg()); return; }

		this.$expense_pie.empty();
		this.charts.expense = new frappe.Chart(this.$expense_pie[0], {
			type: 'percentage', height: 280,
			colors: ['#28a745', '#dc3545', '#007bff', '#fd7e14', '#6f42c1', '#e83e8c', '#20c997', '#ffc107', '#6c757d', '#17a2b8'],
			data: {
				labels: bd.slice(0, 8).map(e => e.category_name),
				datasets: [{ values: bd.slice(0, 8).map(e => e.amount) }]
			},
			tooltipOptions: { formatTooltipY: d => this.fc(d) }
		});
	}

	render_cash_flow_chart() {
		const cf = this.data.cash_flow || [];
		if (!cf.length) { this.$cash_flow.html(this.empty_msg()); return; }

		this.$cash_flow.empty();
		const months_ar = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
		const labels = cf.map(c => `${months_ar[c.mn]} ${c.yr}`);

		this.charts.cash_flow = new frappe.Chart(this.$cash_flow[0], {
			type: 'bar', height: 320,
			colors: ['#28a745', '#dc3545'],
			data: {
				labels: labels,
				datasets: [
					{ name: 'المقبوضات', values: cf.map(c => c.received) },
					{ name: 'المدفوعات', values: cf.map(c => c.paid) }
				]
			},
			barOptions: { spaceRatio: 0.4 },
			tooltipOptions: { formatTooltipY: d => this.fc(d) },
			axisOptions: { xIsSeries: true }
		});
	}

	// ─── GL Voucher Summary ───────────────────────────────
	render_gl_voucher_summary() {
		const data = this.data.gl_voucher_summary || [];
		if (!data.length) { this.$gl_voucher.html(this.empty_msg()); return; }

		let total_debit = 0, total_credit = 0;
		const rows = data.map((v, i) => {
			total_debit += v.total_debit;
			total_credit += v.total_credit;
			return `<tr>
				<td>${i + 1}</td>
				<td><a href="/app/${frappe.router.slug(v.voucher_type)}">${v.voucher_type}</a></td>
				<td>${v.doc_count}</td>
				<td>${v.entry_count}</td>
				<td class="currency">${this.fc(v.total_debit)}</td>
				<td class="currency">${this.fc(v.total_credit)}</td>
			</tr>`;
		}).join('');

		this.$gl_voucher.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>نوع المستند</th><th>المستندات</th><th>القيود</th><th>مدين</th><th>دائن</th>
		</tr></thead><tbody>${rows}
		<tr class="pnl-row total"><td colspan="4">الإجمالي</td><td class="currency">${this.fc(total_debit)}</td><td class="currency">${this.fc(total_credit)}</td></tr>
		</tbody></table>`);
	}

	// ─── Stock Voucher Summary ────────────────────────────
	render_stock_voucher_summary() {
		const data = this.data.stock_voucher_summary || [];
		if (!data.length) { this.$stock_voucher.html(this.empty_msg()); return; }

		const rows = data.map((v, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/${frappe.router.slug(v.voucher_type)}">${v.voucher_type}</a></td>
			<td>${v.doc_count}</td>
			<td>${v.entry_count}</td>
			<td class="currency positive">${format_number(v.qty_in, null, 2)}</td>
			<td class="currency negative">${format_number(v.qty_out, null, 2)}</td>
			<td class="currency ${v.value_change >= 0 ? 'positive' : 'negative'}">${this.fc(v.value_change)}</td>
		</tr>`).join('');

		this.$stock_voucher.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>نوع المستند</th><th>المستندات</th><th>الحركات</th><th>كمية واردة</th><th>كمية صادرة</th><th>تغير القيمة</th>
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
				<td>${c.invoice_count}</td>
				<td class="currency">${this.fc(c.total_revenue)}</td>
				<td class="currency negative">${this.fc(c.outstanding)}</td>
				<td><div class="collection-bar"><div class="fill ${bar_css}" style="width:${rate}%"></div></div><small>${rate}%</small></td>
			</tr>`;
		}).join('');

		this.$top_customers.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>العميل</th><th>الفواتير</th><th>الإيرادات</th><th>المستحق</th><th>التحصيل</th>
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
			<td>${p.invoice_count}</td>
		</tr>`).join('');

		this.$top_products.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>المنتج</th><th>الكمية</th><th>الإيرادات</th><th>الفواتير</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	render_top_suppliers() {
		const data = this.data.top_suppliers || [];
		if (!data.length) { this.$top_suppliers.html(this.empty_msg()); return; }

		const rows = data.map((s, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/supplier/${s.supplier}">${s.supplier_name}</a></td>
			<td>${s.invoice_count}</td>
			<td class="currency">${this.fc(s.total_purchases)}</td>
			<td class="currency negative">${this.fc(s.outstanding)}</td>
		</tr>`).join('');

		this.$top_suppliers.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>المورد</th><th>الفواتير</th><th>المشتريات</th><th>المستحق</th>
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
				<td>${r.return_count}</td>
				<td class="currency negative">${this.fc(r.return_amount)}</td>
			</tr>`;
		}).join('');

		this.$sales_returns.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>العميل</th><th>عدد المرتجعات</th><th>المبلغ</th>
		</tr></thead><tbody>${rows}
		<tr class="pnl-row total"><td colspan="3">الإجمالي</td><td class="currency negative">${this.fc(total)}</td></tr>
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
				<td>${r.return_count}</td>
				<td class="currency negative">${this.fc(r.return_amount)}</td>
			</tr>`;
		}).join('');

		this.$purchase_returns.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>المورد</th><th>عدد المرتجعات</th><th>المبلغ</th>
		</tr></thead><tbody>${rows}
		<tr class="pnl-row total"><td colspan="3">الإجمالي</td><td class="currency negative">${this.fc(total)}</td></tr>
		</tbody></table>`);
	}

	// ─── AR/AP Aging ──────────────────────────────────────
	render_ar_aging() {
		const data = this.data.ar_aging || [];
		if (!data.length) { this.$ar_aging.html(this.empty_msg()); return; }

		const rows = data.map((a, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/customer/${a.customer}">${a.customer}</a></td>
			<td class="currency negative">${this.fc(a.outstanding)}</td>
			<td>${frappe.datetime.str_to_user(a.oldest_date)}</td>
			<td>${this.aging_badge(a.days_outstanding)}</td>
		</tr>`).join('');

		this.$ar_aging.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>العميل</th><th>المستحق</th><th>أقدم فاتورة</th><th>العمر</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	render_ap_aging() {
		const data = this.data.ap_aging || [];
		if (!data.length) { this.$ap_aging.html(this.empty_msg()); return; }

		const rows = data.map((a, i) => `<tr>
			<td>${i + 1}</td>
			<td><a href="/app/supplier/${a.supplier}">${a.supplier}</a></td>
			<td class="currency negative">${this.fc(a.outstanding)}</td>
			<td>${frappe.datetime.str_to_user(a.oldest_date)}</td>
			<td>${this.aging_badge(a.days_outstanding)}</td>
		</tr>`).join('');

		this.$ap_aging.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>المورد</th><th>المستحق</th><th>أقدم فاتورة</th><th>العمر</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── Bank Balances ────────────────────────────────────
	render_bank_balances() {
		const data = this.data.bank_balances || [];
		if (!data.length) { this.$bank_balances.html(this.empty_msg()); return; }

		let total = 0;
		const rows = data.map((b, i) => {
			total += b.balance;
			const type_label = b.account_type === 'Bank' ? 'بنك' : 'صندوق';
			const type_css = b.account_type === 'Bank' ? 'bank-type' : 'cash-type';
			return `<tr>
				<td>${i + 1}</td>
				<td>${b.account_name}</td>
				<td><span class="account-type-badge ${type_css}">${type_label}</span></td>
				<td class="currency ${b.balance >= 0 ? 'positive' : 'negative'}">${this.fc(b.balance)}</td>
			</tr>`;
		}).join('');

		this.$bank_balances.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>الحساب</th><th>النوع</th><th>الرصيد</th>
		</tr></thead><tbody>${rows}
		<tr class="pnl-row total"><td colspan="3">الإجمالي</td><td class="currency ${total >= 0 ? 'positive' : 'negative'}">${this.fc(total)}</td></tr>
		</tbody></table>`);
	}

	// ─── Payment Modes ────────────────────────────────────
	render_payment_modes() {
		const data = this.data.payment_modes || [];
		if (!data.length) { this.$payment_modes.html(this.empty_msg()); return; }

		const type_labels = { 'Receive': 'تحصيل', 'Pay': 'دفع', 'Internal Transfer': 'تحويل داخلي' };

		const rows = data.map((p, i) => `<tr>
			<td>${i + 1}</td>
			<td>${p.mode}</td>
			<td><span class="payment-type-badge ${p.payment_type === 'Receive' ? 'receive' : 'pay'}">${type_labels[p.payment_type] || p.payment_type}</span></td>
			<td>${p.entry_count}</td>
			<td class="currency">${this.fc(p.total_amount)}</td>
		</tr>`).join('');

		this.$payment_modes.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>طريقة الدفع</th><th>النوع</th><th>العدد</th><th>المبلغ</th>
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
				<td>${j.entry_count}</td>
				<td class="currency">${this.fc(j.total_amount)}</td>
			</tr>`;
		}).join('');

		this.$journal_entries.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>نوع القيد</th><th>العدد</th><th>المبلغ</th>
		</tr></thead><tbody>${rows}
		<tr class="pnl-row total"><td colspan="3">الإجمالي</td><td class="currency">${this.fc(total)}</td></tr>
		</tbody></table>`);
	}

	// ─── Inventory ────────────────────────────────────────
	render_inventory_table() {
		const data = this.data.inventory_by_warehouse || [];
		if (!data.length) { this.$inventory.html(this.empty_msg()); return; }

		let total_value = 0;
		const rows = data.map((w, i) => {
			total_value += w.total_value;
			return `<tr>
				<td>${i + 1}</td>
				<td>${w.warehouse}</td>
				<td>${w.item_count}</td>
				<td>${format_number(w.total_qty, null, 2)}</td>
				<td class="currency">${this.fc(w.total_value)}</td>
			</tr>`;
		}).join('');

		this.$inventory.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>المخزن</th><th>الأصناف</th><th>الكمية</th><th>القيمة</th>
		</tr></thead><tbody>${rows}
		<tr class="pnl-row total"><td colspan="4">الإجمالي</td><td class="currency">${this.fc(total_value)}</td></tr>
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
			<td>${s.txn_count}</td>
		</tr>`).join('');

		this.$stock_movement.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>الصنف</th><th>المجموعة</th><th>وارد</th><th>صادر</th><th>تغير القيمة</th><th>الحركات</th>
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
			<th>#</th><th>الصنف</th><th>المخزن</th><th>الكمية</th><th>القيمة</th><th>العمر</th>
		</tr></thead><tbody>${rows}</tbody></table>`);
	}

	// ─── AI Analysis ───────────────────────────────────────
	async run_ai_analysis() {
		if (!this.data || !this.data.kpis) {
			frappe.msgprint('يرجى تحميل البيانات المالية أولاً');
			return;
		}

		if (!window.puter) {
			frappe.msgprint('جاري تحميل محرك الذكاء الاصطناعي، يرجى المحاولة مرة أخرى بعد ثوانٍ');
			return;
		}

		this.$ai.slideDown();
		this.$ai_body.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> جاري التحليل بالذكاء الاصطناعي... قد يستغرق دقيقة</div>');

		// Scroll to AI section
		$('html, body').animate({ scrollTop: this.$ai.offset().top - 100 }, 300);

		try {
			const prompt = this.build_ai_prompt();
			const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
			const text = typeof response === 'string' ? response
				: (response?.message?.content?.[0]?.text || response?.message?.content || response?.toString() || 'لا توجد استجابة');
			this.show_ai_results(text);
		} catch (e) {
			this.$ai_body.html(`<div class="empty-state"><i class="fa fa-exclamation-triangle"></i><p>حدث خطأ: ${e.message || e}</p></div>`);
		}
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

		// New data sections for AI
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

		return `أنت محلل مالي ومدقق حسابات خبير. حلل البيانات المالية التالية لشركة "${this.data.company}" للفترة من ${this.data.from_date} إلى ${this.data.to_date} وقدم تقريراً شاملاً باللغة العربية.

## المؤشرات المالية الرئيسية:
- الإيرادات: ${k.revenue?.toLocaleString()} ${this.currency}
- تكلفة البضاعة المباعة: ${k.cogs?.toLocaleString()} ${this.currency}
- مجمل الربح: ${k.gross_profit?.toLocaleString()} ${this.currency} (${k.gross_margin}%)
- إجمالي المصروفات: ${k.total_expenses?.toLocaleString()} ${this.currency}
- صافي الربح: ${k.net_profit?.toLocaleString()} ${this.currency} (${k.net_margin}%)
- الذمم المدينة: ${k.ar_outstanding?.toLocaleString()} ${this.currency}
- الذمم الدائنة: ${k.ap_outstanding?.toLocaleString()} ${this.currency}
- الرصيد النقدي: ${k.cash_balance?.toLocaleString()} ${this.currency}
- قيمة المخزون: ${k.inventory_value?.toLocaleString()} ${this.currency}
- عدد فواتير المبيعات: ${k.si_count}
- عدد فواتير المشتريات: ${k.pi_count}

## ملخص الميزانية العمومية:
${balance_sheet}

## أنواع القيود المحاسبية:
${gl_vouchers}

## أنواع حركات المخزون:
${stock_vouchers}

## أرصدة البنوك والصناديق:
${bank_balances}

## أعلى 10 عملاء:
${top_cust}

## أعلى 10 منتجات:
${top_prod}

## مرتجعات المبيعات:
${sales_returns || 'لا توجد مرتجعات'}

## مرتجعات المشتريات:
${purchase_returns || 'لا توجد مرتجعات'}

## تقادم الذمم المدينة:
${ar}

## تقادم الذمم الدائنة:
${ap}

## توزيع المصروفات:
${expenses}

## التدفق النقدي الشهري:
${cf}

## أعلى حركات المخزون:
${stock_movement}

## المستندات والتطبيقات:
${custom_dt}

## التطبيقات المثبتة:
${installed_apps}

## المطلوب:
1. **تقييم الصحة المالية** (درجة من 100 مع تفسير)
2. **تحليل المخاطر**: حدد أهم 5 مخاطر مالية
3. **كشف الشذوذ**: أنماط غير طبيعية في البيانات
4. **تحليل التدفق النقدي**: هل الشركة قادرة على تغطية التزاماتها؟
5. **تحليل المخزون**: هل هناك مخزون راكد أو مشاكل في إدارة المخزون؟
6. **تحليل المبيعات والمرتجعات**: نسبة المرتجعات وتأثيرها
7. **نقاط القوة**: ما هي الإيجابيات؟
8. **نقاط الضعف**: ما يجب معالجته؟
9. **توصيات عملية**: 7-10 توصيات قابلة للتنفيذ لتحسين الأداء
10. **تحليل التطبيقات المخصصة**: هل هناك مخاطر من التخصيصات؟

قدم التقرير منظماً بعناوين واضحة باللغة العربية.`;
	}

	show_ai_results(text) {
		// Convert markdown to basic HTML
		let html = text
			.replace(/^### (.*$)/gm, '<h4>$1</h4>')
			.replace(/^## (.*$)/gm, '<h3>$1</h3>')
			.replace(/^# (.*$)/gm, '<h2>$1</h2>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/^[\-\*] (.*$)/gm, '<li>$1</li>')
			.replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
			.replace(/\n\n/g, '</p><p>')
			.replace(/\n/g, '<br>');

		// Wrap consecutive <li> in <ul>
		html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
		html = html.replace(/<\/ul>\s*<ul>/g, '');

		this.$ai_body.html(`
			<div class="ai-report" dir="rtl">
				<div class="ai-report-header">
					<i class="fa fa-magic"></i>
					<span>تقرير التحليل الذكي</span>
					<span class="ai-date">${frappe.datetime.now_datetime()}</span>
				</div>
				<div class="ai-report-content"><p>${html}</p></div>
			</div>
		`);
	}

	// ─── Utilities ─────────────────────────────────────────
	fc(value) {
		return format_currency(value || 0, this.currency);
	}

	aging_badge(days) {
		if (days <= 30) return `<span class="aging-badge current">${days} يوم</span>`;
		if (days <= 60) return `<span class="aging-badge warning">${days} يوم</span>`;
		return `<span class="aging-badge overdue">${days} يوم</span>`;
	}

	empty_msg() {
		return '<div class="empty-state"><i class="fa fa-inbox"></i><p>لا توجد بيانات</p></div>';
	}
}
