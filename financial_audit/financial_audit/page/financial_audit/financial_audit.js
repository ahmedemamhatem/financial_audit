frappe.pages['financial-audit'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'لوحة التدقيق المالي',
		single_column: true
	});

	wrapper.financial_audit = new FinancialAuditDashboard(page);
}

frappe.pages['financial-audit'].on_page_show = function(wrapper) {
	if (wrapper.financial_audit) {
		wrapper.financial_audit.load_data();
	}
}

class FinancialAuditDashboard {
	constructor(page) {
		this.page = page;
		this.filters = {};
		this.data = {};
		this.echarts_instances = {};
		this.currency = 'EGP';
		this.months_ar = ['', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

		this.setup_page();
		this.load_puter_js();
		this.load_echarts();
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
		return `
			<div class="${cls}">
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
		return `
			<div class="chart-section">
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
		this.page.set_primary_action('تحديث', () => this.load_data(), 'refresh');
		this.page.add_inner_button('تحليل ذكي (AI)', () => this.run_ai_analysis());

		this.page.main.html(`
			<div class="financial-audit-page" dir="rtl">
				<div class="filters-section"></div>

				<!-- AI Analysis — right after filters, before everything -->
				<div class="ai-analysis-section" style="display: none;">
					<div class="section-header ai-header" data-target="ai-analysis-body">
						<span class="section-title"><i class="fa fa-magic" style="margin-left:8px"></i> التحليل الذكي (AI)</span>
						<span class="toggle-chevron">&#9660;</span>
					</div>
					<div class="section-body ai-analysis-body"></div>
				</div>

				<div class="kpi-cards"></div>

				${this.make_section('data-section', 'fa-balance-scale', '#eef1ff', '#4361ee',
					'ملخص الميزانية العمومية', 'balance-sheet-body',
					'ملخص إجمالي الأصول والالتزامات وحقوق الملكية والإيرادات والمصروفات خلال الفترة المحددة')}

				${this.make_chart_section('fa-bar-chart', '#ecfdf5', '#10b981',
					'اتجاهات الإيرادات والمصروفات الشهرية', 'monthly-chart', 'monthly-chart-stats',
					'مقارنة شهرية بين الإيرادات والمصروفات لتتبع الأداء المالي عبر الزمن')}

				${this.make_chart_section('fa-line-chart', '#f5f3ff', '#8b5cf6',
					'المبيعات اليومية', 'daily-sales-chart', 'daily-chart-stats',
					'تتبع حركة المبيعات اليومية لكشف الأنماط والاتجاهات الموسمية')}

				${this.make_chart_section('fa-pie-chart', '#fef2f2', '#ef4444',
					'توزيع المصروفات', 'expense-pie', '',
					'توزيع المصروفات حسب الفئة الرئيسية لمعرفة أكبر بنود الإنفاق')}

				${this.make_chart_section('fa-exchange', '#f0fdfa', '#14b8a6',
					'التدفق النقدي الشهري', 'cash-flow-chart', 'cash-flow-stats',
					'مقارنة المقبوضات والمدفوعات الشهرية لتقييم السيولة النقدية')}

				${this.make_section('data-section pnl-section', 'fa-file-text-o', '#fff7ed', '#f97316',
					'قائمة الدخل', 'pnl-body',
					'تفصيل الإيرادات والمصروفات وصافي الربح أو الخسارة للفترة المحددة')}

				${this.make_section('data-section', 'fa-book', '#eef1ff', '#4361ee',
					'ملخص قيود اليومية حسب النوع', 'gl-voucher-body',
					'إجمالي القيود المحاسبية مصنفة حسب نوع المستند المنشئ لها')}

				${this.make_section('data-section', 'fa-cubes', '#fff7ed', '#f97316',
					'ملخص حركات المخزون حسب النوع', 'stock-voucher-body',
					'حركات المخزون الواردة والصادرة مصنفة حسب نوع مستند المخزون')}

				${this.make_section('data-section', 'fa-users', '#fdf2f8', '#ec4899',
					'أعلى العملاء حسب الإيرادات', 'top-customers-body',
					'ترتيب العملاء حسب حجم المبيعات مع نسبة التحصيل والمستحقات المتبقية')}

				${this.make_section('data-section', 'fa-shopping-bag', '#ecfdf5', '#10b981',
					'أعلى المنتجات حسب الإيرادات', 'top-products-body',
					'أكثر المنتجات مبيعاً مرتبة حسب إجمالي الإيرادات والكمية المباعة')}

				${this.make_section('data-section', 'fa-truck', '#fff7ed', '#f97316',
					'أعلى الموردين', 'top-suppliers-body',
					'أكبر الموردين حسب حجم المشتريات مع المستحقات المتبقية لكل مورد')}

				${this.make_section('data-section', 'fa-undo', '#fef2f2', '#ef4444',
					'مرتجعات المبيعات (إشعارات دائنة)', 'sales-returns-body',
					'ملخص مرتجعات المبيعات حسب العميل لتقييم جودة المنتجات ورضا العملاء')}

				${this.make_section('data-section', 'fa-reply', '#fffbeb', '#f59e0b',
					'مرتجعات المشتريات (إشعارات مدينة)', 'purchase-returns-body',
					'ملخص مرتجعات المشتريات حسب المورد لتقييم جودة التوريد')}

				${this.make_section('data-section', 'fa-clock-o', '#fdf2f8', '#ec4899',
					'تقادم الذمم المدينة (العملاء)', 'ar-aging-body',
					'تحليل أعمار المبالغ المستحقة من العملاء لمتابعة التحصيل وإدارة المخاطر')}

				${this.make_section('data-section', 'fa-clock-o', '#fffbeb', '#f59e0b',
					'تقادم الذمم الدائنة (الموردين)', 'ap-aging-body',
					'تحليل أعمار المبالغ المستحقة للموردين لإدارة جدول السداد والتدفق النقدي')}

				${this.make_section('data-section', 'fa-university', '#f0fdfa', '#14b8a6',
					'أرصدة البنوك والصناديق', 'bank-balances-body',
					'أرصدة جميع الحسابات البنكية والصناديق النقدية في تاريخ التقرير')}

				${this.make_section('data-section', 'fa-credit-card', '#f5f3ff', '#8b5cf6',
					'أنماط الدفع', 'payment-modes-body',
					'توزيع المدفوعات والمقبوضات حسب طريقة الدفع المستخدمة')}

				${this.make_section('data-section', 'fa-pencil-square-o', '#eef1ff', '#4361ee',
					'ملخص قيود اليومية', 'journal-entries-body',
					'ملخص القيود اليدوية المسجلة مصنفة حسب نوع القيد')}

				${this.make_section('data-section', 'fa-archive', '#f8fafc', '#64748b',
					'تقييم المخزون حسب المخزن', 'inventory-body',
					'قيمة المخزون الحالية موزعة على المخازن مع عدد الأصناف والكميات')}

				${this.make_section('data-section', 'fa-arrows-v', '#fff7ed', '#f97316',
					'أعلى حركات المخزون', 'stock-movement-body',
					'أكثر الأصناف حركة من حيث الكميات الواردة والصادرة وتغير القيمة')}

				${this.make_section('data-section', 'fa-hourglass-half', '#fef2f2', '#ef4444',
					'تقادم المخزون (مخزون راكد)', 'stock-ageing-body',
					'الأصناف التي مضى على تخزينها فترة طويلة لتحديد المخزون الراكد')}

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
				this.$kpi.html('<div class="empty-state"><div class="empty-icon"><i class="fa fa-exclamation-triangle"></i></div><p>حدث خطأ أثناء تحميل البيانات</p></div>');
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
			{ title: 'الإيرادات', desc: 'إجمالي المبيعات خلال الفترة', value: this.fc(k.revenue), css: 'revenue', icon: 'fa-money' },
			{ title: 'تكلفة البضاعة', desc: 'تكلفة البضاعة المباعة', value: this.fc(k.cogs), css: 'cogs', icon: 'fa-shopping-cart' },
			{ title: 'مجمل الربح', desc: 'الإيرادات - تكلفة البضاعة', value: this.fc(k.gross_profit), css: k.gross_profit >= 0 ? 'profit' : 'loss', icon: 'fa-line-chart' },
			{ title: 'هامش الربح الإجمالي', desc: 'نسبة مجمل الربح للإيرادات', value: k.gross_margin.toFixed(1) + '%', css: 'margin', icon: 'fa-percent' },
			{ title: 'صافي الربح', desc: 'الربح بعد كل المصروفات', value: this.fc(k.net_profit), css: k.net_profit >= 0 ? 'profit' : 'loss', icon: 'fa-trophy' },
			{ title: 'هامش صافي الربح', desc: 'نسبة صافي الربح للإيرادات', value: k.net_margin.toFixed(1) + '%', css: 'margin', icon: 'fa-percent' },
			{ title: 'الذمم المدينة', desc: 'المستحق من العملاء', value: this.fc(k.ar_outstanding), css: 'receivable', icon: 'fa-users' },
			{ title: 'الذمم الدائنة', desc: 'المستحق للموردين', value: this.fc(k.ap_outstanding), css: 'payable', icon: 'fa-truck' },
			{ title: 'الرصيد النقدي', desc: 'إجمالي النقد والبنوك', value: this.fc(k.cash_balance), css: k.cash_balance >= 0 ? 'cash' : 'loss', icon: 'fa-university' },
			{ title: 'قيمة المخزون', desc: 'إجمالي قيمة المخزون الحالي', value: this.fc(k.inventory_value), css: 'inventory', icon: 'fa-cubes' },
			{ title: 'فواتير المبيعات', desc: 'عدد فواتير البيع المعتمدة', value: k.si_count, css: 'revenue', icon: 'fa-file-text-o' },
			{ title: 'فواتير المشتريات', desc: 'عدد فواتير الشراء المعتمدة', value: k.pi_count, css: 'cogs', icon: 'fa-file-text' },
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
			'Asset': 'الأصول', 'Liability': 'الالتزامات', 'Equity': 'حقوق الملكية',
			'Income': 'الإيرادات', 'Expense': 'المصروفات'
		};
		const root_type_icons = {
			'Asset': 'fa-building', 'Liability': 'fa-credit-card', 'Equity': 'fa-shield',
			'Income': 'fa-arrow-circle-up', 'Expense': 'fa-arrow-circle-down'
		};

		const rows = data.map(r => {
			const label = root_type_labels[r.root_type] || r.root_type;
			const icon = root_type_icons[r.root_type] || 'fa-circle';
			const is_debit = ['Asset', 'Expense'].includes(r.root_type);
			const balance = is_debit ? r.net_balance : -r.net_balance;
			return `<tr>
				<td><i class="fa ${icon}" style="margin-left:6px;opacity:0.5"></i> <strong>${label}</strong></td>
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
		rows += `<tr class="pnl-row parent income-header"><td colspan="2"><i class="fa fa-arrow-circle-up" style="margin-left:6px"></i> الإيرادات</td><td class="currency positive">${this.fc(k.revenue)}</td></tr>`;
		inc.forEach(a => {
			rows += `<tr class="pnl-row child"><td></td><td>${a.account_name}</td><td class="currency">${this.fc(a.amount)}</td></tr>`;
		});

		rows += `<tr class="pnl-row parent expense-header"><td colspan="2"><i class="fa fa-arrow-circle-down" style="margin-left:6px"></i> المصروفات</td><td class="currency negative">${this.fc(k.total_expenses)}</td></tr>`;
		exp.forEach(a => {
			rows += `<tr class="pnl-row child"><td></td><td>${a.account_name}</td><td class="currency">${this.fc(a.amount)}</td></tr>`;
		});

		rows += `<tr class="pnl-row total"><td colspan="2">صافي الربح / (الخسارة)</td><td class="currency ${k.net_profit >= 0 ? 'positive' : 'negative'}">${this.fc(k.net_profit)}</td></tr>`;

		this.$pnl.html(`<table class="audit-table"><thead><tr><th></th><th>الحساب</th><th>المبلغ</th></tr></thead><tbody>${rows}</tbody></table>`);
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
		const labels = trends.map(t => `${this.months_ar[t.mn]} ${t.yr}`);
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
				data: ['الإيرادات', 'المصروفات'],
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
					name: 'الإيرادات', type: 'bar', data: trends.map(t => t.revenue),
					itemStyle: { color: '#10b981', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 32
				},
				{
					name: 'المصروفات', type: 'bar', data: trends.map(t => t.expenses),
					itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 32
				}
			]
		});

		this.$monthly_stats.html(`
			<div class="chart-stat"><div class="chart-stat-label">إجمالي الإيرادات</div><div class="chart-stat-value positive">${this.fc(total_revenue)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">إجمالي المصروفات</div><div class="chart-stat-value negative">${this.fc(total_expenses)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">متوسط الإيرادات / شهر</div><div class="chart-stat-value">${this.fc(avg_revenue)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">أفضل شهر</div><div class="chart-stat-value">${this.months_ar[best_month.mn]} ${best_month.yr}</div></div>
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
						<div>${p.marker} المبيعات: <strong>${this.fc(p.value)}</strong></div>`;
				}
			},
			legend: {
				data: ['المبيعات'],
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
				name: 'المبيعات', type: 'line', data: sales.map(s => s.total_sales),
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
			<div class="chart-stat"><div class="chart-stat-label">إجمالي المبيعات</div><div class="chart-stat-value positive">${this.fc(total_sales)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">متوسط يومي</div><div class="chart-stat-value">${this.fc(avg_daily)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">أفضل يوم</div><div class="chart-stat-value">${frappe.datetime.str_to_user(best_day.date)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">عدد الفواتير</div><div class="chart-stat-value">${total_invoices}</div></div>
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
		const labels = cf.map(c => `${this.months_ar[c.mn]} ${c.yr}`);
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
					html += `<div style="border-top:1px solid #eee;margin-top:4px;padding-top:4px;font-weight:700;color:${net >= 0 ? '#059669' : '#dc2626'}">صافي: ${this.fc(net)}</div>`;
					return html;
				}
			},
			legend: {
				data: ['المقبوضات', 'المدفوعات'],
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
					name: 'المقبوضات', type: 'bar', data: cf.map(c => c.received),
					itemStyle: { color: '#14b8a6', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 32
				},
				{
					name: 'المدفوعات', type: 'bar', data: cf.map(c => c.paid),
					itemStyle: { color: '#f97316', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 32
				}
			]
		});

		this.$cash_flow_stats.html(`
			<div class="chart-stat"><div class="chart-stat-label">إجمالي المقبوضات</div><div class="chart-stat-value positive">${this.fc(total_received)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">إجمالي المدفوعات</div><div class="chart-stat-value negative">${this.fc(total_paid)}</div></div>
			<div class="chart-stat"><div class="chart-stat-label">صافي التدفق</div><div class="chart-stat-value ${net_flow >= 0 ? 'positive' : 'negative'}">${this.fc(net_flow)}</div></div>
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
			<th>#</th><th>نوع المستند</th><th>المستندات</th><th>القيود</th><th>مدين</th><th>دائن</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>الإجمالي</td><td><span class="section-count">${total_docs}</span></td><td></td><td class="currency">${this.fc(total_debit)}</td><td class="currency">${this.fc(total_credit)}</td></tr>
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
			<td><span class="section-count">${p.invoice_count}</span></td>
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
			<td><span class="section-count">${s.invoice_count}</span></td>
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
				<td><span class="section-count">${r.return_count}</span></td>
				<td class="currency negative">${this.fc(r.return_amount)}</td>
			</tr>`;
		}).join('');

		this.$sales_returns.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>العميل</th><th>عدد المرتجعات</th><th>المبلغ</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>الإجمالي</td><td></td><td class="currency negative">${this.fc(total)}</td></tr>
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
			<th>#</th><th>المورد</th><th>عدد المرتجعات</th><th>المبلغ</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>الإجمالي</td><td></td><td class="currency negative">${this.fc(total)}</td></tr>
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
			<th>#</th><th>العميل</th><th>المستحق</th><th>أقدم فاتورة</th><th>العمر</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>الإجمالي</td><td class="currency negative">${this.fc(total)}</td><td colspan="2"></td></tr>
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
			<th>#</th><th>المورد</th><th>المستحق</th><th>أقدم فاتورة</th><th>العمر</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>الإجمالي</td><td class="currency negative">${this.fc(total)}</td><td colspan="2"></td></tr>
		</tbody></table>`);
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
		<tr class="table-total-row"><td></td><td>الإجمالي</td><td></td><td class="currency ${total >= 0 ? 'positive' : 'negative'}">${this.fc(total)}</td></tr>
		</tbody></table>`);
	}

	// ─── Payment Modes ────────────────────────────────────
	render_payment_modes() {
		const data = this.data.payment_modes || [];
		if (!data.length) { this.$payment_modes.html(this.empty_msg()); return; }

		const type_labels = { 'Receive': 'تحصيل', 'Pay': 'دفع', 'Internal Transfer': 'تحويل داخلي' };
		const type_css_map = { 'Receive': 'receive', 'Pay': 'pay', 'Internal Transfer': 'transfer' };

		const rows = data.map((p, i) => `<tr>
			<td>${i + 1}</td>
			<td>${p.mode}</td>
			<td><span class="payment-type-badge ${type_css_map[p.payment_type] || 'pay'}">${type_labels[p.payment_type] || p.payment_type}</span></td>
			<td><span class="section-count">${p.entry_count}</span></td>
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
				<td><span class="section-count">${j.entry_count}</span></td>
				<td class="currency">${this.fc(j.total_amount)}</td>
			</tr>`;
		}).join('');

		this.$journal_entries.html(`<table class="audit-table"><thead><tr>
			<th>#</th><th>نوع القيد</th><th>العدد</th><th>المبلغ</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>الإجمالي</td><td></td><td class="currency">${this.fc(total)}</td></tr>
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
			<th>#</th><th>المخزن</th><th>الأصناف</th><th>الكمية</th><th>القيمة</th>
		</tr></thead><tbody>${rows}
		<tr class="table-total-row"><td></td><td>الإجمالي</td><td><span class="section-count">${total_items}</span></td><td></td><td class="currency">${this.fc(total_value)}</td></tr>
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

		this.$ai.slideDown(200, () => {
			$('html, body').animate({ scrollTop: this.$ai.offset().top - 60 }, 300);
		});
		this.$ai_body.html('<div class="loading-state"><i class="fa fa-spinner fa-spin"></i> جاري التحليل بالذكاء الاصطناعي... قد يستغرق دقيقة</div>');

		try {
			const prompt = this.build_ai_prompt();
			const response = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
			const text = typeof response === 'string' ? response
				: (response?.message?.content?.[0]?.text || response?.message?.content || response?.toString() || 'لا توجد استجابة');
			this.show_ai_results(text);
		} catch (e) {
			this.$ai_body.html(`<div class="empty-state"><div class="empty-icon"><i class="fa fa-exclamation-triangle"></i></div><p>حدث خطأ: ${e.message || e}</p></div>`);
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

		const health_score = Math.max(0, Math.min(100, score));
		const health_color = health_score >= 75 ? '#047857' : (health_score >= 50 ? '#b45309' : '#b91c1c');
		const health_label = health_score >= 75 ? 'ممتاز' : (health_score >= 60 ? 'جيد' : (health_score >= 40 ? 'متوسط' : 'ضعيف'));
		const gauge_border = `6px solid ${health_color}`;

		// Financial ratios
		const expense_ratio = k.revenue > 0 ? ((k.total_expenses / k.revenue) * 100).toFixed(1) : '0';
		const working_capital = k.ar_outstanding + k.inventory_value - k.ap_outstanding;
		const current_ratio = k.ap_outstanding > 0 ? ((k.cash_balance + k.ar_outstanding) / k.ap_outstanding).toFixed(2) : '∞';
		const debt_to_equity_approx = k.ar_outstanding > 0 ? (k.ap_outstanding / (k.cash_balance + k.ar_outstanding + k.inventory_value)).toFixed(2) : '0';
		const avg_invoice = k.si_count > 0 ? k.revenue / k.si_count : 0;

		// Risk assessment
		const risks = [];
		if (collection_pct < 60) risks.push({ level: 'high', title: 'ضعف التحصيل', desc: `نسبة التحصيل ${collection_pct}% فقط — خطر تعثر السيولة` });
		if (liquidity_ratio < 0.5) risks.push({ level: 'high', title: 'عجز السيولة', desc: `النقد يغطي ${(liquidity_ratio * 100).toFixed(0)}% فقط من الالتزامات` });
		if (k.net_margin < 0) risks.push({ level: 'high', title: 'خسارة صافية', desc: `هامش صافي الربح سلبي ${k.net_margin.toFixed(1)}%` });
		if (k.gross_margin < 15) risks.push({ level: 'medium', title: 'هامش ربح منخفض', desc: `هامش الربح الإجمالي ${k.gross_margin.toFixed(1)}% — ضغط على الأسعار` });
		if (k.ar_outstanding > k.revenue * 0.4) risks.push({ level: 'medium', title: 'تركز الذمم المدينة', desc: 'الذمم المدينة تتجاوز 40% من الإيرادات' });
		if (k.inventory_value > k.revenue * 0.5) risks.push({ level: 'medium', title: 'ارتفاع المخزون', desc: 'قيمة المخزون مرتفعة مقارنة بالإيرادات' });
		if (liquidity_ratio >= 0.5 && liquidity_ratio < 1) risks.push({ level: 'low', title: 'سيولة محدودة', desc: 'النقد لا يغطي كامل الالتزامات الحالية' });
		if (k.gross_margin >= 15 && k.gross_margin < 25) risks.push({ level: 'low', title: 'هامش ربح مقبول', desc: 'هامش الربح مقبول لكن يمكن تحسينه' });

		const risks_html = risks.slice(0, 5).map(r => `
			<div class="ai-risk-card ${r.level}">
				<span class="ai-risk-badge ${r.level}">${r.level === 'high' ? 'مرتفع' : (r.level === 'medium' ? 'متوسط' : 'منخفض')}</span>
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
			<td>${this.months_ar[t.mn]} ${t.yr}</td>
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

		this.$ai_body.html(`
			<div class="ai-report" dir="rtl">
				<div class="ai-report-header">
					<i class="fa fa-magic" style="color:var(--fa-primary-light)"></i>
					<span>تقرير التدقيق المالي الذكي — ${this.data.company}</span>
					<span class="ai-date">${this.data.from_date} إلى ${this.data.to_date}</span>
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
						<div style="font-size:11px;color:var(--fa-text-muted);font-weight:700;margin-top:6px">الصحة المالية</div>
					</div>
					<div class="ai-summary-grid" style="margin-bottom:0">
						<div class="ai-summary-card">
							<div class="label">صافي الربح</div>
							<div class="value" style="color:${k.net_profit >= 0 ? '#047857' : '#b91c1c'}">${this.fc(k.net_profit)}</div>
							<div class="sub" style="color:var(--fa-text-muted)">هامش ${k.net_margin.toFixed(1)}%</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">السيولة النقدية</div>
							<div class="value" style="color:${k.cash_balance >= 0 ? '#047857' : '#b91c1c'}">${this.fc(k.cash_balance)}</div>
							<div class="sub" style="color:var(--fa-text-muted)">${k.cash_balance >= k.ap_outstanding ? 'تغطي الالتزامات' : 'لا تغطي الالتزامات'}</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">نسبة التحصيل</div>
							<div class="value" style="color:${collection_pct >= 70 ? '#047857' : '#b45309'}">${collection_pct}%</div>
							<div class="sub" style="color:var(--fa-text-muted)">ذمم: ${this.fc(k.ar_outstanding)}</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">رأس المال العامل</div>
							<div class="value" style="color:${working_capital >= 0 ? '#047857' : '#b91c1c'}">${this.fc(working_capital)}</div>
							<div class="sub" style="color:var(--fa-text-muted)">مدينون + مخزون − دائنون</div>
						</div>
					</div>
				</div>

				<!-- Row 2: Financial Ratios -->
				<div style="margin-bottom:24px">
					<div class="ai-section-title"><i class="fa fa-calculator"></i> النسب المالية الرئيسية</div>
					<div class="ai-summary-grid">
						<div class="ai-summary-card">
							<div class="label">هامش الربح الإجمالي</div>
							<div class="value" style="color:${k.gross_margin >= 20 ? '#047857' : '#b45309'}">${k.gross_margin.toFixed(1)}%</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">نسبة المصروفات</div>
							<div class="value" style="color:${expense_ratio <= 80 ? '#047857' : '#b91c1c'}">${expense_ratio}%</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">نسبة التداول</div>
							<div class="value" style="color:${parseFloat(current_ratio) >= 1 ? '#047857' : '#b91c1c'}">${current_ratio}</div>
						</div>
						<div class="ai-summary-card">
							<div class="label">متوسط الفاتورة</div>
							<div class="value" style="color:var(--fa-text-mid)">${this.fc(avg_invoice)}</div>
						</div>
					</div>
				</div>

				<!-- Row 3: Risk Assessment -->
				${risks.length ? `
				<div style="margin-bottom:24px">
					<div class="ai-section-title"><i class="fa fa-exclamation-triangle" style="color:#b91c1c"></i> تقييم المخاطر</div>
					${risks_html}
				</div>` : ''}

				<!-- Row 4: Monthly Trend -->
				${trends.length ? `
				<div style="margin-bottom:24px">
					<div class="ai-section-title"><i class="fa fa-bar-chart"></i> الأداء الشهري</div>
					<table class="ai-data-table">
						<thead><tr>
							<th>الشهر</th><th style="text-align:left">الإيرادات</th><th style="text-align:left">المصروفات</th><th style="text-align:left">صافي</th>
						</tr></thead>
						<tbody>${trend_html}</tbody>
					</table>
				</div>` : ''}

				<!-- Row 5: Top Customers + Expenses -->
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
					${top5.length ? `<div>
						<div class="ai-section-title"><i class="fa fa-users"></i> أعلى 5 عملاء</div>
						<table class="ai-data-table">
							<thead><tr><th>#</th><th>العميل</th><th style="text-align:left">الإيرادات</th><th style="text-align:left">التحصيل</th></tr></thead>
							<tbody>${top5_html}</tbody>
						</table>
					</div>` : '<div></div>'}
					${top5_exp.length ? `<div>
						<div class="ai-section-title"><i class="fa fa-pie-chart"></i> أعلى 5 مصروفات</div>
						<table class="ai-data-table">
							<thead><tr><th>#</th><th>البند</th><th style="text-align:left">المبلغ</th></tr></thead>
							<tbody>${top5_exp_html}</tbody>
						</table>
					</div>` : '<div></div>'}
				</div>

				<!-- Row 6: AI Analysis Text -->
				<div style="border-top:2px solid var(--fa-border);padding-top:24px;margin-top:8px">
					<div class="ai-section-title">
						<i class="fa fa-lightbulb-o" style="color:#b45309"></i> التحليل والتوصيات (AI)
					</div>
					<div class="ai-report-content"><p>${ai_html}</p></div>
				</div>
			</div>
		`);
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
		if (days <= 30) return `<span class="aging-badge current"><i class="fa fa-check-circle"></i> ${days} يوم</span>`;
		if (days <= 60) return `<span class="aging-badge warning"><i class="fa fa-exclamation-circle"></i> ${days} يوم</span>`;
		return `<span class="aging-badge overdue"><i class="fa fa-times-circle"></i> ${days} يوم</span>`;
	}

	empty_msg() {
		return '<div class="empty-state"><div class="empty-icon"><i class="fa fa-inbox"></i></div><p>لا توجد بيانات</p></div>';
	}
}
