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

				<div class="chart-section">
					<div class="section-header"><span class="section-title">اتجاهات الإيرادات والمصروفات الشهرية</span></div>
					<div class="chart-container monthly-chart-container"></div>
				</div>

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

				<div class="chart-section">
					<div class="section-header"><span class="section-title">التدفق النقدي الشهري</span></div>
					<div class="chart-container cash-flow-chart-container"></div>
				</div>

				<div class="data-section pnl-section">
					<div class="section-header">
						<span class="section-title">قائمة الدخل</span>
						<span class="toggle-btn" data-target="pnl-body">▼</span>
					</div>
					<div class="section-body pnl-body"></div>
				</div>

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

				<div class="data-section">
					<div class="section-header"><span class="section-title">أعلى الموردين</span></div>
					<div class="section-body top-suppliers-body"></div>
				</div>

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

				<div class="data-section">
					<div class="section-header"><span class="section-title">تقييم المخزون حسب المخزن</span></div>
					<div class="section-body inventory-body"></div>
				</div>

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
		this.render_pnl_table();
		this.render_monthly_chart();
		this.render_daily_sales_chart();
		this.render_expense_pie();
		this.render_cash_flow_chart();
		this.render_top_customers();
		this.render_top_products();
		this.render_top_suppliers();
		this.render_ar_aging();
		this.render_ap_aging();
		this.render_inventory_table();
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
		];

		this.$kpi.html(cards.map(c => `
			<div class="kpi-card ${c.css}">
				<div class="kpi-icon"><i class="fa ${c.icon}"></i></div>
				<div class="kpi-title">${c.title}</div>
				<div class="kpi-value">${c.value}</div>
			</div>
		`).join(''));
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
		const labels = trends.map(t => `${t.yr}-${String(t.mn).padStart(2, '0')}`);

		this.charts.monthly = new frappe.Chart(this.$monthly_chart[0], {
			type: 'bar', height: 300,
			colors: ['#28a745', '#dc3545'],
			data: {
				labels: labels,
				datasets: [
					{ name: 'الإيرادات', values: trends.map(t => t.revenue) },
					{ name: 'المصروفات', values: trends.map(t => t.expenses) }
				]
			},
			barOptions: { spaceRatio: 0.3 },
			tooltipOptions: { formatTooltipY: d => this.fc(d) }
		});
	}

	render_daily_sales_chart() {
		const sales = this.data.daily_sales || [];
		if (!sales.length) { this.$daily_chart.html(this.empty_msg()); return; }

		this.$daily_chart.empty();
		this.charts.daily = new frappe.Chart(this.$daily_chart[0], {
			type: 'line', height: 250,
			colors: ['#667eea'],
			data: {
				labels: sales.map(s => frappe.datetime.str_to_user(s.date)),
				datasets: [{ name: 'المبيعات', values: sales.map(s => s.total_sales) }]
			},
			lineOptions: { regionFill: 1, hideDots: 0 },
			tooltipOptions: { formatTooltipY: d => this.fc(d) }
		});
	}

	render_expense_pie() {
		const bd = this.data.expense_breakdown || [];
		if (!bd.length) { this.$expense_pie.html(this.empty_msg()); return; }

		this.$expense_pie.empty();
		this.charts.expense = new frappe.Chart(this.$expense_pie[0], {
			type: 'pie', height: 250,
			data: {
				labels: bd.map(e => e.category_name),
				datasets: [{ values: bd.map(e => e.amount) }]
			},
			truncateLegends: 1, maxSlices: 10,
			tooltipOptions: { formatTooltipY: d => this.fc(d) }
		});
	}

	render_cash_flow_chart() {
		const cf = this.data.cash_flow || [];
		if (!cf.length) { this.$cash_flow.html(this.empty_msg()); return; }

		this.$cash_flow.empty();
		const labels = cf.map(c => `${c.yr}-${String(c.mn).padStart(2, '0')}`);

		this.charts.cash_flow = new frappe.Chart(this.$cash_flow[0], {
			type: 'bar', height: 300,
			colors: ['#28a745', '#dc3545'],
			data: {
				labels: labels,
				datasets: [
					{ name: 'المقبوضات', values: cf.map(c => c.received) },
					{ name: 'المدفوعات', values: cf.map(c => c.paid) }
				]
			},
			barOptions: { spaceRatio: 0.3 },
			tooltipOptions: { formatTooltipY: d => this.fc(d) }
		});
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

## أعلى 10 عملاء:
${top_cust}

## أعلى 10 منتجات:
${top_prod}

## تقادم الذمم المدينة:
${ar}

## تقادم الذمم الدائنة:
${ap}

## توزيع المصروفات:
${expenses}

## التدفق النقدي الشهري:
${cf}

## المطلوب:
1. **تقييم الصحة المالية** (درجة من 100 مع تفسير)
2. **تحليل المخاطر**: حدد أهم 5 مخاطر مالية
3. **كشف الشذوذ**: أنماط غير طبيعية في البيانات
4. **تحليل التدفق النقدي**: هل الشركة قادرة على تغطية التزاماتها؟
5. **نقاط القوة**: ما هي الإيجابيات؟
6. **نقاط الضعف**: ما يجب معالجته؟
7. **توصيات عملية**: 5-7 توصيات قابلة للتنفيذ لتحسين الأداء

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
