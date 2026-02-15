import frappe
from frappe import _
from frappe.utils import flt, getdate, nowdate, cint, date_diff, add_years
import json
import math


@frappe.whitelist()
def get_financial_audit_data(filters=None):
	"""Main entry point — returns all financial audit data in one call."""
	if isinstance(filters, str):
		filters = frappe.parse_json(filters)

	filters = frappe._dict(filters or {})

	if not filters.get("company"):
		filters["company"] = frappe.defaults.get_user_default("Company") or frappe.db.get_single_value("Global Defaults", "default_company")

	if not filters.get("from_date"):
		filters["from_date"] = frappe.utils.get_year_start(nowdate())

	if not filters.get("to_date"):
		filters["to_date"] = nowdate()

	from erpnext import get_company_currency
	currency = get_company_currency(filters.company)

	return {
		"currency": currency,
		"company": filters.company,
		"from_date": str(filters.from_date),
		"to_date": str(filters.to_date),
		"kpis": get_kpis(filters),
		"income_accounts": get_income_accounts(filters),
		"expense_accounts": get_expense_accounts(filters),
		"monthly_trends": get_monthly_trends(filters),
		"top_customers": get_top_customers(filters),
		"top_products": get_top_products(filters),
		"top_suppliers": get_top_suppliers(filters),
		"ar_aging": get_ar_aging(filters),
		"ap_aging": get_ap_aging(filters),
		"daily_sales": get_daily_sales(filters),
		"expense_breakdown": get_expense_breakdown(filters),
		"cash_flow": get_cash_flow(filters),
		"inventory_by_warehouse": get_inventory_by_warehouse(filters),
		# New advanced sections
		"gl_voucher_summary": get_gl_voucher_summary(filters),
		"stock_voucher_summary": get_stock_voucher_summary(filters),
		"stock_movement": get_stock_movement(filters),
		"balance_sheet": get_balance_sheet_summary(filters),
		"bank_balances": get_bank_balances(filters),
		"sales_returns": get_sales_returns(filters),
		"purchase_returns": get_purchase_returns(filters),
		"journal_entries_summary": get_journal_entries_summary(filters),
		"payment_modes": get_payment_modes(filters),
		"stock_ageing": get_stock_ageing(filters),
		"custom_doctypes_analysis": get_custom_doctypes_analysis(filters),
		"installed_apps": get_installed_apps_info(),
		# Advanced audit analytics
		"benfords_law": get_benfords_law_analysis(filters),
		"duplicate_payments": get_duplicate_payments(filters),
		"working_capital_metrics": get_working_capital_metrics(filters),
		"yoy_growth": get_yoy_growth(filters),
		"concentration_risk": get_concentration_risk(filters),
		"weekend_transactions": get_weekend_transactions(filters),
		# ── New advanced sections ──
		"payment_reconciliation": get_payment_reconciliation(filters),
		"cost_center_pl": get_cost_center_pl(filters),
		"depreciation_audit": get_depreciation_audit(filters),
		"aging_trend": get_aging_trend(filters),
		"inventory_turnover": get_inventory_turnover(filters),
		"trial_balance": get_trial_balance(filters),
		"ratio_trend": get_ratio_trend(filters),
	}


# ═══════════════════════════════════════════
#  ORIGINAL 12 SECTIONS (unchanged)
# ═══════════════════════════════════════════

def get_kpis(filters):
	"""Executive summary KPIs using universal root_type/account_type queries."""
	gl_filters = {
		"company": filters.company,
		"from_date": filters.from_date,
		"to_date": filters.to_date,
	}

	revenue = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.credit - gle.debit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type = 'Income'
			AND gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0
			AND IFNULL(gle.is_opening, 'No') = 'No'
	""", gl_filters, as_dict=1)[0].total or 0

	cogs = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.debit - gle.credit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type = 'Expense'
			AND acc.account_type = 'Cost of Goods Sold'
			AND gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0
			AND IFNULL(gle.is_opening, 'No') = 'No'
	""", gl_filters, as_dict=1)[0].total or 0

	total_expenses = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.debit - gle.credit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type = 'Expense'
			AND gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0
			AND IFNULL(gle.is_opening, 'No') = 'No'
	""", gl_filters, as_dict=1)[0].total or 0

	ar_outstanding = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.debit - gle.credit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type = 'Receivable'
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
	""", gl_filters, as_dict=1)[0].total or 0

	ap_outstanding = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.credit - gle.debit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type = 'Payable'
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
	""", gl_filters, as_dict=1)[0].total or 0

	cash_balance = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.debit - gle.credit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type IN ('Bank', 'Cash')
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
	""", gl_filters, as_dict=1)[0].total or 0

	inventory_value = frappe.db.sql("""
		SELECT IFNULL(SUM(b.stock_value), 0) as total
		FROM `tabBin` b
		JOIN `tabWarehouse` w ON w.name = b.warehouse
		WHERE w.company = %(company)s
	""", {"company": filters.company}, as_dict=1)[0].total or 0

	si_count = frappe.db.sql("""
		SELECT COUNT(*) as cnt FROM `tabSales Invoice`
		WHERE docstatus = 1 AND company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s AND is_return = 0
	""", gl_filters, as_dict=1)[0].cnt or 0

	pi_count = frappe.db.sql("""
		SELECT COUNT(*) as cnt FROM `tabPurchase Invoice`
		WHERE docstatus = 1 AND company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s AND is_return = 0
	""", gl_filters, as_dict=1)[0].cnt or 0

	gross_profit = flt(revenue) - flt(cogs)
	gross_margin = (gross_profit / revenue * 100) if revenue else 0
	opex = flt(total_expenses) - flt(cogs)
	net_profit = flt(revenue) - flt(total_expenses)
	net_margin = (net_profit / revenue * 100) if revenue else 0

	return {
		"revenue": flt(revenue, 2), "cogs": flt(cogs, 2),
		"gross_profit": flt(gross_profit, 2), "gross_margin": flt(gross_margin, 1),
		"total_expenses": flt(total_expenses, 2), "opex": flt(opex, 2),
		"net_profit": flt(net_profit, 2), "net_margin": flt(net_margin, 1),
		"ar_outstanding": flt(ar_outstanding, 2), "ap_outstanding": flt(ap_outstanding, 2),
		"cash_balance": flt(cash_balance, 2), "inventory_value": flt(inventory_value, 2),
		"si_count": si_count, "pi_count": pi_count,
	}


def get_income_accounts(filters):
	return frappe.db.sql("""
		SELECT acc.name as account, acc.account_name, acc.parent_account,
			IFNULL(SUM(gle.credit - gle.debit), 0) as amount
		FROM `tabGL Entry` gle JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type = 'Income' AND acc.is_group = 0
			AND gle.company = %(company)s AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0 AND IFNULL(gle.is_opening, 'No') = 'No'
		GROUP BY acc.name HAVING amount != 0 ORDER BY amount DESC
	""", filters, as_dict=1)


def get_expense_accounts(filters):
	return frappe.db.sql("""
		SELECT acc.name as account, acc.account_name, acc.parent_account,
			IFNULL(SUM(gle.debit - gle.credit), 0) as amount
		FROM `tabGL Entry` gle JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type = 'Expense' AND acc.is_group = 0
			AND gle.company = %(company)s AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0 AND IFNULL(gle.is_opening, 'No') = 'No'
		GROUP BY acc.name HAVING amount != 0 ORDER BY amount DESC
	""", filters, as_dict=1)


def get_monthly_trends(filters):
	return frappe.db.sql("""
		SELECT YEAR(gle.posting_date) as yr, MONTH(gle.posting_date) as mn,
			IFNULL(SUM(CASE WHEN acc.root_type='Income' THEN gle.credit-gle.debit ELSE 0 END),0) as revenue,
			IFNULL(SUM(CASE WHEN acc.root_type='Expense' THEN gle.debit-gle.credit ELSE 0 END),0) as expenses
		FROM `tabGL Entry` gle JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type IN ('Income','Expense') AND gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0 AND IFNULL(gle.is_opening,'No')='No'
		GROUP BY YEAR(gle.posting_date), MONTH(gle.posting_date) ORDER BY yr, mn
	""", filters, as_dict=1)


def get_top_customers(filters):
	return frappe.db.sql("""
		SELECT si.customer, si.customer_name, SUM(si.base_grand_total) as total_revenue,
			SUM(si.outstanding_amount) as outstanding, COUNT(si.name) as invoice_count,
			ROUND((SUM(si.base_grand_total)-SUM(si.outstanding_amount))/NULLIF(SUM(si.base_grand_total),0)*100,1) as collection_rate
		FROM `tabSales Invoice` si
		WHERE si.docstatus=1 AND si.company=%(company)s
			AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s AND si.is_return=0
		GROUP BY si.customer ORDER BY total_revenue DESC LIMIT 20
	""", filters, as_dict=1)


def get_top_products(filters):
	return frappe.db.sql("""
		SELECT sii.item_code, sii.item_name, SUM(sii.base_net_amount) as total_revenue,
			SUM(sii.qty) as total_qty, COUNT(DISTINCT si.name) as invoice_count
		FROM `tabSales Invoice Item` sii JOIN `tabSales Invoice` si ON si.name=sii.parent
		WHERE si.docstatus=1 AND si.company=%(company)s
			AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s AND si.is_return=0
		GROUP BY sii.item_code ORDER BY total_revenue DESC LIMIT 20
	""", filters, as_dict=1)


def get_top_suppliers(filters):
	return frappe.db.sql("""
		SELECT pi.supplier, pi.supplier_name, SUM(pi.base_grand_total) as total_purchases,
			SUM(pi.outstanding_amount) as outstanding, COUNT(pi.name) as invoice_count
		FROM `tabPurchase Invoice` pi
		WHERE pi.docstatus=1 AND pi.company=%(company)s
			AND pi.posting_date BETWEEN %(from_date)s AND %(to_date)s AND pi.is_return=0
		GROUP BY pi.supplier ORDER BY total_purchases DESC LIMIT 20
	""", filters, as_dict=1)


def get_ar_aging(filters):
	return frappe.db.sql("""
		SELECT gle.party as customer, IFNULL(SUM(gle.debit-gle.credit),0) as outstanding,
			MIN(gle.posting_date) as oldest_date, DATEDIFF(%(to_date)s, MIN(gle.posting_date)) as days_outstanding
		FROM `tabGL Entry` gle JOIN `tabAccount` acc ON acc.name=gle.account
		WHERE acc.account_type='Receivable' AND gle.party_type='Customer'
			AND gle.party IS NOT NULL AND gle.party!='' AND gle.company=%(company)s
			AND gle.posting_date<=%(to_date)s AND gle.is_cancelled=0
		GROUP BY gle.party HAVING outstanding > 0.5 ORDER BY outstanding DESC LIMIT 30
	""", filters, as_dict=1)


def get_ap_aging(filters):
	return frappe.db.sql("""
		SELECT gle.party as supplier, IFNULL(SUM(gle.credit-gle.debit),0) as outstanding,
			MIN(gle.posting_date) as oldest_date, DATEDIFF(%(to_date)s, MIN(gle.posting_date)) as days_outstanding
		FROM `tabGL Entry` gle JOIN `tabAccount` acc ON acc.name=gle.account
		WHERE acc.account_type='Payable' AND gle.party_type='Supplier'
			AND gle.party IS NOT NULL AND gle.party!='' AND gle.company=%(company)s
			AND gle.posting_date<=%(to_date)s AND gle.is_cancelled=0
		GROUP BY gle.party HAVING outstanding > 0.5 ORDER BY outstanding DESC LIMIT 30
	""", filters, as_dict=1)


def get_daily_sales(filters):
	return frappe.db.sql("""
		SELECT si.posting_date as date, SUM(si.base_grand_total) as total_sales, COUNT(si.name) as invoice_count
		FROM `tabSales Invoice` si
		WHERE si.docstatus=1 AND si.company=%(company)s
			AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s AND si.is_return=0
		GROUP BY si.posting_date ORDER BY si.posting_date
	""", filters, as_dict=1)


def get_expense_breakdown(filters):
	return frappe.db.sql("""
		SELECT IFNULL(acc.parent_account, acc.name) as category,
			IFNULL(pa.account_name, acc.account_name) as category_name,
			IFNULL(SUM(gle.debit-gle.credit),0) as amount
		FROM `tabGL Entry` gle JOIN `tabAccount` acc ON acc.name=gle.account
			LEFT JOIN `tabAccount` pa ON pa.name=acc.parent_account
		WHERE acc.root_type='Expense' AND acc.is_group=0 AND gle.company=%(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled=0 AND IFNULL(gle.is_opening,'No')='No'
		GROUP BY IFNULL(acc.parent_account, acc.name) HAVING amount > 0 ORDER BY amount DESC
	""", filters, as_dict=1)


def get_cash_flow(filters):
	return frappe.db.sql("""
		SELECT YEAR(pe.posting_date) as yr, MONTH(pe.posting_date) as mn,
			IFNULL(SUM(CASE WHEN pe.payment_type='Receive' THEN pe.paid_amount ELSE 0 END),0) as received,
			IFNULL(SUM(CASE WHEN pe.payment_type='Pay' THEN pe.paid_amount ELSE 0 END),0) as paid
		FROM `tabPayment Entry` pe
		WHERE pe.docstatus=1 AND pe.company=%(company)s
			AND pe.posting_date BETWEEN %(from_date)s AND %(to_date)s
		GROUP BY YEAR(pe.posting_date), MONTH(pe.posting_date) ORDER BY yr, mn
	""", filters, as_dict=1)


def get_inventory_by_warehouse(filters):
	return frappe.db.sql("""
		SELECT b.warehouse, SUM(b.actual_qty) as total_qty,
			SUM(b.stock_value) as total_value, COUNT(DISTINCT b.item_code) as item_count
		FROM `tabBin` b JOIN `tabWarehouse` w ON w.name=b.warehouse
		WHERE w.company=%(company)s AND b.actual_qty > 0
		GROUP BY b.warehouse ORDER BY total_value DESC
	""", {"company": filters.company}, as_dict=1)


# ═══════════════════════════════════════════
#  NEW ADVANCED SECTIONS - Dynamic Discovery
# ═══════════════════════════════════════════

def get_gl_voucher_summary(filters):
	"""Discover ALL transaction types that created GL entries — core AND custom."""
	return frappe.db.sql("""
		SELECT
			voucher_type,
			COUNT(*) as entry_count,
			COUNT(DISTINCT voucher_no) as doc_count,
			IFNULL(SUM(debit), 0) as total_debit,
			IFNULL(SUM(credit), 0) as total_credit
		FROM `tabGL Entry`
		WHERE company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND is_cancelled = 0
		GROUP BY voucher_type
		ORDER BY total_debit DESC
	""", filters, as_dict=1)


def get_stock_voucher_summary(filters):
	"""Discover ALL transaction types that created Stock Ledger entries."""
	return frappe.db.sql("""
		SELECT
			voucher_type,
			COUNT(*) as entry_count,
			COUNT(DISTINCT voucher_no) as doc_count,
			IFNULL(SUM(CASE WHEN actual_qty > 0 THEN actual_qty ELSE 0 END), 0) as qty_in,
			IFNULL(SUM(CASE WHEN actual_qty < 0 THEN ABS(actual_qty) ELSE 0 END), 0) as qty_out,
			IFNULL(SUM(stock_value_difference), 0) as value_change
		FROM `tabStock Ledger Entry`
		WHERE company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND is_cancelled = 0
		GROUP BY voucher_type
		ORDER BY ABS(IFNULL(SUM(stock_value_difference), 0)) DESC
	""", filters, as_dict=1)


def get_stock_movement(filters):
	"""Stock movement by item — top movers."""
	return frappe.db.sql("""
		SELECT
			sle.item_code,
			item.item_name,
			item.item_group,
			IFNULL(SUM(CASE WHEN sle.actual_qty > 0 THEN sle.actual_qty ELSE 0 END), 0) as qty_in,
			IFNULL(SUM(CASE WHEN sle.actual_qty < 0 THEN ABS(sle.actual_qty) ELSE 0 END), 0) as qty_out,
			IFNULL(SUM(sle.stock_value_difference), 0) as value_change,
			COUNT(*) as txn_count
		FROM `tabStock Ledger Entry` sle
		LEFT JOIN `tabItem` item ON item.name = sle.item_code
		WHERE sle.company = %(company)s
			AND sle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND sle.is_cancelled = 0
		GROUP BY sle.item_code
		ORDER BY ABS(IFNULL(SUM(sle.stock_value_difference), 0)) DESC
		LIMIT 20
	""", filters, as_dict=1)


def get_balance_sheet_summary(filters):
	"""Balance sheet summary by root_type — works on any chart of accounts."""
	return frappe.db.sql("""
		SELECT
			acc.root_type,
			IFNULL(SUM(gle.debit), 0) as total_debit,
			IFNULL(SUM(gle.credit), 0) as total_credit,
			IFNULL(SUM(gle.debit - gle.credit), 0) as net_balance
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
		GROUP BY acc.root_type
		ORDER BY acc.root_type
	""", filters, as_dict=1)


def get_bank_balances(filters):
	"""Individual bank and cash account balances."""
	return frappe.db.sql("""
		SELECT
			acc.name as account,
			acc.account_name,
			acc.account_type,
			IFNULL(SUM(gle.debit - gle.credit), 0) as balance
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type IN ('Bank', 'Cash')
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
		GROUP BY acc.name
		HAVING balance != 0
		ORDER BY balance DESC
	""", filters, as_dict=1)


def get_sales_returns(filters):
	"""Sales returns / credit notes."""
	return frappe.db.sql("""
		SELECT
			si.customer_name,
			COUNT(*) as return_count,
			IFNULL(SUM(ABS(si.base_grand_total)), 0) as return_amount
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 1 AND si.company = %(company)s
			AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND si.is_return = 1
		GROUP BY si.customer_name
		ORDER BY return_amount DESC
		LIMIT 15
	""", filters, as_dict=1)


def get_purchase_returns(filters):
	"""Purchase returns / debit notes."""
	return frappe.db.sql("""
		SELECT
			pi.supplier_name,
			COUNT(*) as return_count,
			IFNULL(SUM(ABS(pi.base_grand_total)), 0) as return_amount
		FROM `tabPurchase Invoice` pi
		WHERE pi.docstatus = 1 AND pi.company = %(company)s
			AND pi.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND pi.is_return = 1
		GROUP BY pi.supplier_name
		ORDER BY return_amount DESC
		LIMIT 15
	""", filters, as_dict=1)


def get_journal_entries_summary(filters):
	"""Journal entries grouped by entry type."""
	return frappe.db.sql("""
		SELECT
			IFNULL(je.voucher_type, 'Journal Entry') as entry_type,
			COUNT(*) as entry_count,
			IFNULL(SUM(je.total_debit), 0) as total_amount
		FROM `tabJournal Entry` je
		WHERE je.docstatus = 1 AND je.company = %(company)s
			AND je.posting_date BETWEEN %(from_date)s AND %(to_date)s
		GROUP BY je.voucher_type
		ORDER BY total_amount DESC
	""", filters, as_dict=1)


def get_payment_modes(filters):
	"""Payment entries grouped by mode of payment."""
	return frappe.db.sql("""
		SELECT
			IFNULL(pe.mode_of_payment, 'غير محدد') as mode,
			pe.payment_type,
			COUNT(*) as entry_count,
			IFNULL(SUM(pe.paid_amount), 0) as total_amount
		FROM `tabPayment Entry` pe
		WHERE pe.docstatus = 1 AND pe.company = %(company)s
			AND pe.posting_date BETWEEN %(from_date)s AND %(to_date)s
		GROUP BY pe.mode_of_payment, pe.payment_type
		ORDER BY total_amount DESC
	""", filters, as_dict=1)


def get_stock_ageing(filters):
	"""Items with oldest stock — potential dead stock detection."""
	return frappe.db.sql("""
		SELECT
			sle.item_code,
			item.item_name,
			sle.warehouse,
			MIN(sle.posting_date) as first_entry,
			DATEDIFF(%(to_date)s, MIN(sle.posting_date)) as age_days,
			IFNULL(bin.actual_qty, 0) as current_qty,
			IFNULL(bin.stock_value, 0) as current_value
		FROM `tabStock Ledger Entry` sle
		LEFT JOIN `tabItem` item ON item.name = sle.item_code
		LEFT JOIN `tabBin` bin ON bin.item_code = sle.item_code AND bin.warehouse = sle.warehouse
		WHERE sle.company = %(company)s
			AND sle.is_cancelled = 0
			AND IFNULL(bin.actual_qty, 0) > 0
		GROUP BY sle.item_code, sle.warehouse
		HAVING current_qty > 0
		ORDER BY age_days DESC
		LIMIT 20
	""", filters, as_dict=1)


def get_custom_doctypes_analysis(filters):
	"""Dynamically discover ALL custom and core submittable doctypes
	that have transactions in the period — works on ANY site."""
	result = {
		"submittable_doctypes": [],
		"custom_fields_on_gl": [],
		"accounting_dimensions": [],
	}

	# 1. Find ALL submittable doctypes with company field that have data
	submittable = frappe.get_all("DocType",
		filters={"is_submittable": 1, "istable": 0},
		fields=["name", "module", "custom"],
		order_by="name"
	)

	for dt in submittable:
		try:
			meta = frappe.get_meta(dt.name)
			has_company = meta.has_field("company")
			has_posting_date = meta.has_field("posting_date")

			if not has_company:
				continue

			# Count submitted docs in the period
			conditions = "docstatus = 1 AND company = %(company)s"
			params = {"company": filters.company}

			if has_posting_date:
				conditions += " AND posting_date BETWEEN %(from_date)s AND %(to_date)s"
				params["from_date"] = filters.from_date
				params["to_date"] = filters.to_date

			count = frappe.db.sql(
				"SELECT COUNT(*) as cnt FROM `tab{doctype}` WHERE {conditions}".format(
					doctype=dt.name, conditions=conditions
				), params, as_dict=1
			)[0].cnt or 0

			if count > 0:
				# Detect amount fields
				amount_fields = [
					f.fieldname for f in meta.fields
					if f.fieldtype in ("Currency", "Float") and "amount" in (f.fieldname or "").lower()
				]

				result["submittable_doctypes"].append({
					"doctype": dt.name,
					"module": dt.module,
					"is_custom": cint(dt.custom),
					"doc_count": count,
					"has_posting_date": has_posting_date,
					"amount_fields": amount_fields[:3],
				})
		except Exception:
			pass

	# 2. Find custom fields added to GL Entry (accounting dimensions, etc.)
	custom_gl_fields = frappe.get_all("Custom Field",
		filters={"dt": "GL Entry"},
		fields=["fieldname", "label", "fieldtype", "options"]
	)
	result["custom_fields_on_gl"] = custom_gl_fields

	# 3. Find accounting dimensions
	try:
		dimensions = frappe.get_all("Accounting Dimension",
			filters={"disabled": 0},
			fields=["name", "label", "document_type"]
		)
		result["accounting_dimensions"] = dimensions
	except Exception:
		result["accounting_dimensions"] = []

	return result


def get_installed_apps_info():
	"""Get all installed apps on the site — shows what's customized."""
	apps = []
	for app in frappe.get_installed_apps():
		try:
			app_info = frappe.get_attr(app + ".__version__", None)
			apps.append({
				"app": app,
				"version": str(app_info) if app_info else "",
			})
		except Exception:
			apps.append({"app": app, "version": ""})
	return apps


# ═══════════════════════════════════════════
#  ADVANCED AUDIT ANALYTICS
# ═══════════════════════════════════════════

def get_benfords_law_analysis(filters):
	"""Benford's Law — first digit distribution analysis for fraud detection."""
	benford_expected = {
		"1": 30.1, "2": 17.6, "3": 12.5, "4": 9.7, "5": 7.9,
		"6": 6.7, "7": 5.8, "8": 5.1, "9": 4.6
	}

	si_digits = frappe.db.sql("""
		SELECT LEFT(CAST(FLOOR(base_grand_total) AS CHAR), 1) as digit, COUNT(*) as cnt
		FROM `tabSales Invoice`
		WHERE docstatus = 1 AND company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND is_return = 0 AND base_grand_total > 0
		GROUP BY digit HAVING digit BETWEEN '1' AND '9'
		ORDER BY digit
	""", filters, as_dict=1)

	pi_digits = frappe.db.sql("""
		SELECT LEFT(CAST(FLOOR(base_grand_total) AS CHAR), 1) as digit, COUNT(*) as cnt
		FROM `tabPurchase Invoice`
		WHERE docstatus = 1 AND company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND is_return = 0 AND base_grand_total > 0
		GROUP BY digit HAVING digit BETWEEN '1' AND '9'
		ORDER BY digit
	""", filters, as_dict=1)

	def analyze(observed_data):
		total = sum(d.cnt for d in observed_data) or 1
		chi_square = 0
		results = []
		for d in range(1, 10):
			ds = str(d)
			obs = next((r.cnt for r in observed_data if r.digit == ds), 0)
			obs_pct = flt(obs / total * 100, 1)
			exp_pct = benford_expected[ds]
			exp_count = total * exp_pct / 100
			if exp_count > 0:
				chi_square += ((obs - exp_count) ** 2) / exp_count
			results.append({
				"digit": d, "observed": obs,
				"observed_pct": obs_pct, "expected_pct": exp_pct,
				"deviation": flt(obs_pct - exp_pct, 1)
			})
		# Chi-square critical at 0.05 with 8 df = 15.51
		return {
			"data": results, "total": total,
			"chi_square": flt(chi_square, 2),
			"conforms": chi_square < 15.51,
			"risk": "high" if chi_square > 20 else ("medium" if chi_square > 15.51 else "low")
		}

	return {
		"sales": analyze(si_digits),
		"purchases": analyze(pi_digits),
	}


def get_duplicate_payments(filters):
	"""Detect potential duplicate payments — same supplier, same amount, within 7 days."""
	duplicates = frappe.db.sql("""
		SELECT
			pe1.name as payment1, pe2.name as payment2,
			pe1.party_name as supplier,
			pe1.paid_amount as amount,
			pe1.posting_date as date1, pe2.posting_date as date2,
			DATEDIFF(pe2.posting_date, pe1.posting_date) as days_apart
		FROM `tabPayment Entry` pe1
		JOIN `tabPayment Entry` pe2 ON
			pe1.party = pe2.party AND pe1.name < pe2.name
			AND pe1.payment_type = 'Pay' AND pe2.payment_type = 'Pay'
			AND ABS(pe1.paid_amount - pe2.paid_amount) < 1.0
			AND DATEDIFF(pe2.posting_date, pe1.posting_date) BETWEEN 0 AND 7
		WHERE pe1.docstatus = 1 AND pe2.docstatus = 1
			AND pe1.company = %(company)s
			AND pe1.posting_date BETWEEN %(from_date)s AND %(to_date)s
		ORDER BY pe1.paid_amount DESC
		LIMIT 20
	""", filters, as_dict=1)

	total_risk = sum(d.amount for d in duplicates)
	return {
		"items": duplicates,
		"count": len(duplicates),
		"total_risk_amount": flt(total_risk, 2),
		"risk": "high" if len(duplicates) > 5 else ("medium" if len(duplicates) > 0 else "low")
	}


def get_working_capital_metrics(filters):
	"""DSO, DPO, DIO, Cash Conversion Cycle, Current/Quick/Cash Ratios."""
	gl_filters = {"company": filters.company, "from_date": filters.from_date, "to_date": filters.to_date}

	# Period balances
	balances = frappe.db.sql("""
		SELECT
			SUM(CASE WHEN acc.account_type = 'Receivable' THEN gle.debit - gle.credit ELSE 0 END) as ar,
			SUM(CASE WHEN acc.account_type = 'Payable' THEN gle.credit - gle.debit ELSE 0 END) as ap,
			SUM(CASE WHEN acc.account_type IN ('Bank', 'Cash') THEN gle.debit - gle.credit ELSE 0 END) as cash,
			SUM(CASE WHEN acc.root_type = 'Asset' AND acc.account_type IN ('Bank', 'Cash', 'Receivable', 'Stock')
				THEN gle.debit - gle.credit ELSE 0 END) as current_assets,
			SUM(CASE WHEN acc.root_type = 'Asset' THEN gle.debit - gle.credit ELSE 0 END) as total_assets,
			SUM(CASE WHEN acc.root_type = 'Equity' THEN gle.credit - gle.debit ELSE 0 END) as equity
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE gle.company = %(company)s AND gle.posting_date <= %(to_date)s AND gle.is_cancelled = 0
	""", gl_filters, as_dict=1)[0]

	# Period income/expense
	pnl = frappe.db.sql("""
		SELECT
			SUM(CASE WHEN acc.root_type = 'Income' THEN gle.credit - gle.debit ELSE 0 END) as revenue,
			SUM(CASE WHEN acc.root_type = 'Expense' AND acc.account_type = 'Cost of Goods Sold'
				THEN gle.debit - gle.credit ELSE 0 END) as cogs,
			SUM(CASE WHEN acc.root_type = 'Expense' THEN gle.debit - gle.credit ELSE 0 END) as total_expenses
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0 AND IFNULL(gle.is_opening, 'No') = 'No'
	""", gl_filters, as_dict=1)[0]

	inventory = frappe.db.sql("""
		SELECT IFNULL(SUM(b.stock_value), 0) as val
		FROM `tabBin` b JOIN `tabWarehouse` w ON w.name = b.warehouse
		WHERE w.company = %(company)s
	""", {"company": filters.company}, as_dict=1)[0].val or 0

	days = max(date_diff(filters.to_date, filters.from_date), 1)
	ar = flt(balances.ar)
	ap = flt(balances.ap)
	cash = flt(balances.cash)
	revenue = flt(pnl.revenue)
	cogs = flt(pnl.cogs)
	current_assets = flt(balances.current_assets)
	total_assets = flt(balances.total_assets)
	equity = flt(balances.equity)
	net_income = revenue - flt(pnl.total_expenses)

	dso = flt((ar / revenue * days) if revenue else 0, 1)
	dpo = flt((ap / cogs * days) if cogs else 0, 1)
	dio = flt((inventory / cogs * days) if cogs else 0, 1)
	ccc = flt(dso + dio - dpo, 1)

	current_ratio = flt((current_assets + inventory) / ap if ap else 0, 2)
	quick_ratio = flt((current_assets) / ap if ap else 0, 2)
	cash_ratio = flt(cash / ap if ap else 0, 2)

	# ROE & Asset Turnover
	roe = flt((net_income / equity * 100) if equity else 0, 1)
	asset_turnover = flt((revenue / total_assets) if total_assets else 0, 2)
	equity_multiplier = flt((total_assets / equity) if equity else 0, 2)
	profit_margin = flt((net_income / revenue * 100) if revenue else 0, 1)

	return {
		"dso": dso, "dpo": dpo, "dio": dio, "ccc": ccc,
		"current_ratio": current_ratio, "quick_ratio": quick_ratio, "cash_ratio": cash_ratio,
		"roe": roe, "asset_turnover": asset_turnover,
		"equity_multiplier": equity_multiplier, "profit_margin": profit_margin,
		"working_capital": flt(current_assets + inventory - ap, 2),
		"total_assets": flt(total_assets, 2), "equity": flt(equity, 2),
	}


def get_yoy_growth(filters):
	"""Year-over-Year growth comparison."""
	gl_filters = {"company": filters.company, "from_date": filters.from_date, "to_date": filters.to_date}

	current = frappe.db.sql("""
		SELECT
			SUM(CASE WHEN acc.root_type = 'Income' THEN gle.credit - gle.debit ELSE 0 END) as revenue,
			SUM(CASE WHEN acc.root_type = 'Expense' THEN gle.debit - gle.credit ELSE 0 END) as expenses,
			SUM(CASE WHEN acc.root_type = 'Expense' AND acc.account_type = 'Cost of Goods Sold'
				THEN gle.debit - gle.credit ELSE 0 END) as cogs
		FROM `tabGL Entry` gle JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0 AND IFNULL(gle.is_opening, 'No') = 'No'
	""", gl_filters, as_dict=1)[0]

	prior_filters = {
		"company": filters.company,
		"from_date": str(add_years(getdate(filters.from_date), -1)),
		"to_date": str(add_years(getdate(filters.to_date), -1)),
	}

	prior = frappe.db.sql("""
		SELECT
			SUM(CASE WHEN acc.root_type = 'Income' THEN gle.credit - gle.debit ELSE 0 END) as revenue,
			SUM(CASE WHEN acc.root_type = 'Expense' THEN gle.debit - gle.credit ELSE 0 END) as expenses,
			SUM(CASE WHEN acc.root_type = 'Expense' AND acc.account_type = 'Cost of Goods Sold'
				THEN gle.debit - gle.credit ELSE 0 END) as cogs
		FROM `tabGL Entry` gle JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0 AND IFNULL(gle.is_opening, 'No') = 'No'
	""", prior_filters, as_dict=1)[0]

	def growth(cur, prev):
		return flt(((cur - prev) / prev * 100) if prev else 0, 1)

	cr = flt(current.revenue)
	pr = flt(prior.revenue)
	ce = flt(current.expenses)
	pe = flt(prior.expenses)
	cc = flt(current.cogs)
	pc = flt(prior.cogs)
	c_net = cr - ce
	p_net = pr - pe
	c_gross = cr - cc
	p_gross = pr - pc

	# Invoice counts
	si_current = frappe.db.sql("""
		SELECT COUNT(*) as cnt FROM `tabSales Invoice`
		WHERE docstatus = 1 AND company = %(company)s AND is_return = 0
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
	""", gl_filters, as_dict=1)[0].cnt or 0

	si_prior = frappe.db.sql("""
		SELECT COUNT(*) as cnt FROM `tabSales Invoice`
		WHERE docstatus = 1 AND company = %(company)s AND is_return = 0
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
	""", prior_filters, as_dict=1)[0].cnt or 0

	return {
		"current_revenue": flt(cr, 2), "prior_revenue": flt(pr, 2), "revenue_growth": growth(cr, pr),
		"current_expenses": flt(ce, 2), "prior_expenses": flt(pe, 2), "expense_growth": growth(ce, pe),
		"current_net": flt(c_net, 2), "prior_net": flt(p_net, 2), "net_growth": growth(c_net, p_net),
		"current_gross": flt(c_gross, 2), "prior_gross": flt(p_gross, 2), "gross_growth": growth(c_gross, p_gross),
		"current_invoices": si_current, "prior_invoices": si_prior,
		"invoice_growth": growth(si_current, si_prior),
	}


def get_concentration_risk(filters):
	"""Revenue & supplier concentration — top N as % of total."""
	total_rev = frappe.db.sql("""
		SELECT IFNULL(SUM(base_grand_total), 0) as total FROM `tabSales Invoice`
		WHERE docstatus = 1 AND company = %(company)s AND is_return = 0
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
	""", filters, as_dict=1)[0].total or 1

	top_cust = frappe.db.sql("""
		SELECT customer_name, SUM(base_grand_total) as revenue,
			ROUND(SUM(base_grand_total) / %(total)s * 100, 1) as pct
		FROM `tabSales Invoice`
		WHERE docstatus = 1 AND company = %(company)s AND is_return = 0
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
		GROUP BY customer ORDER BY revenue DESC LIMIT 10
	""", {"company": filters.company, "from_date": filters.from_date,
		  "to_date": filters.to_date, "total": total_rev}, as_dict=1)

	total_pur = frappe.db.sql("""
		SELECT IFNULL(SUM(base_grand_total), 0) as total FROM `tabPurchase Invoice`
		WHERE docstatus = 1 AND company = %(company)s AND is_return = 0
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
	""", filters, as_dict=1)[0].total or 1

	top_supp = frappe.db.sql("""
		SELECT supplier_name, SUM(base_grand_total) as purchases,
			ROUND(SUM(base_grand_total) / %(total)s * 100, 1) as pct
		FROM `tabPurchase Invoice`
		WHERE docstatus = 1 AND company = %(company)s AND is_return = 0
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
		GROUP BY supplier ORDER BY purchases DESC LIMIT 10
	""", {"company": filters.company, "from_date": filters.from_date,
		  "to_date": filters.to_date, "total": total_pur}, as_dict=1)

	top1_cust_pct = flt(top_cust[0].pct if top_cust else 0, 1)
	top5_cust_pct = flt(sum(c.pct for c in top_cust[:5]), 1)
	top1_supp_pct = flt(top_supp[0].pct if top_supp else 0, 1)
	top5_supp_pct = flt(sum(s.pct for s in top_supp[:5]), 1)

	return {
		"customers": top_cust, "suppliers": top_supp,
		"top1_cust_pct": top1_cust_pct, "top5_cust_pct": top5_cust_pct,
		"top1_supp_pct": top1_supp_pct, "top5_supp_pct": top5_supp_pct,
		"cust_risk": "high" if top1_cust_pct > 30 else ("medium" if top5_cust_pct > 60 else "low"),
		"supp_risk": "high" if top1_supp_pct > 30 else ("medium" if top5_supp_pct > 60 else "low"),
	}


def get_weekend_transactions(filters):
	"""Detect transactions on weekends (Friday/Saturday for Arabic region)."""
	results = frappe.db.sql("""
		SELECT
			voucher_type as doctype,
			COUNT(*) as total_count,
			SUM(CASE WHEN DAYOFWEEK(posting_date) IN (6, 7) THEN 1 ELSE 0 END) as weekend_count,
			ROUND(SUM(CASE WHEN DAYOFWEEK(posting_date) IN (6, 7) THEN 1 ELSE 0 END)
				/ COUNT(*) * 100, 1) as weekend_pct,
			SUM(CASE WHEN DAY(posting_date) >= DAY(LAST_DAY(posting_date)) - 2 THEN 1 ELSE 0 END) as eom_count,
			ROUND(SUM(CASE WHEN DAY(posting_date) >= DAY(LAST_DAY(posting_date)) - 2 THEN 1 ELSE 0 END)
				/ COUNT(*) * 100, 1) as eom_pct
		FROM `tabGL Entry`
		WHERE company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND is_cancelled = 0
		GROUP BY voucher_type
		HAVING weekend_count > 0 OR eom_count > 0
		ORDER BY weekend_count DESC
	""", filters, as_dict=1)

	total_weekend = sum(r.weekend_count for r in results)
	total_eom = sum(r.eom_count for r in results)
	return {
		"items": results,
		"total_weekend": total_weekend,
		"total_eom": total_eom,
		"risk": "high" if total_weekend > 50 else ("medium" if total_weekend > 20 else "low"),
	}


# ═══════════════════════════════════════════
#  NEW ADVANCED FEATURES
# ═══════════════════════════════════════════

def get_payment_reconciliation(filters):
	"""Payment reconciliation dashboard — unreconciled payments by party with aging."""
	unreconciled = frappe.db.sql("""
		SELECT
			pe.party_type,
			pe.party,
			pe.party_name,
			COUNT(*) as entry_count,
			IFNULL(SUM(pe.unallocated_amount), 0) as unallocated_amount,
			IFNULL(SUM(pe.paid_amount), 0) as total_paid,
			MIN(pe.posting_date) as oldest_date,
			MAX(pe.posting_date) as latest_date,
			DATEDIFF(%(to_date)s, MIN(pe.posting_date)) as days_oldest
		FROM `tabPayment Entry` pe
		WHERE pe.docstatus = 1
			AND pe.company = %(company)s
			AND pe.unallocated_amount > 0
			AND pe.posting_date <= %(to_date)s
		GROUP BY pe.party_type, pe.party
		ORDER BY unallocated_amount DESC
		LIMIT 30
	""", filters, as_dict=1)

	total_unallocated = sum(flt(r.unallocated_amount) for r in unreconciled)
	total_entries = sum(r.entry_count for r in unreconciled)

	# Aging buckets for unreconciled
	buckets = frappe.db.sql("""
		SELECT
			CASE
				WHEN DATEDIFF(%(to_date)s, pe.posting_date) <= 30 THEN '0-30'
				WHEN DATEDIFF(%(to_date)s, pe.posting_date) <= 60 THEN '31-60'
				WHEN DATEDIFF(%(to_date)s, pe.posting_date) <= 90 THEN '61-90'
				ELSE '90+'
			END as bucket,
			COUNT(*) as cnt,
			IFNULL(SUM(pe.unallocated_amount), 0) as amount
		FROM `tabPayment Entry` pe
		WHERE pe.docstatus = 1
			AND pe.company = %(company)s
			AND pe.unallocated_amount > 0
			AND pe.posting_date <= %(to_date)s
		GROUP BY bucket
		ORDER BY FIELD(bucket, '0-30', '31-60', '61-90', '90+')
	""", filters, as_dict=1)

	return {
		"items": unreconciled,
		"buckets": buckets,
		"total_unallocated": flt(total_unallocated, 2),
		"total_entries": total_entries,
		"party_count": len(unreconciled),
		"risk": "high" if total_unallocated > 1000000 else ("medium" if total_unallocated > 100000 else "low"),
	}


def get_cost_center_pl(filters):
	"""Profit & Loss by cost center — income, expenses, and net profit per cost center."""
	data = frappe.db.sql("""
		SELECT
			IFNULL(gle.cost_center, 'غير محدد') as cost_center,
			IFNULL(SUM(CASE WHEN acc.root_type = 'Income' THEN gle.credit - gle.debit ELSE 0 END), 0) as income,
			IFNULL(SUM(CASE WHEN acc.root_type = 'Expense' AND acc.account_type = 'Cost of Goods Sold'
				THEN gle.debit - gle.credit ELSE 0 END), 0) as cogs,
			IFNULL(SUM(CASE WHEN acc.root_type = 'Expense' THEN gle.debit - gle.credit ELSE 0 END), 0) as expenses
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0
			AND IFNULL(gle.is_opening, 'No') = 'No'
			AND acc.root_type IN ('Income', 'Expense')
		GROUP BY gle.cost_center
		HAVING income != 0 OR expenses != 0
		ORDER BY income DESC
	""", filters, as_dict=1)

	total_income = sum(flt(r.income) for r in data)
	total_expenses = sum(flt(r.expenses) for r in data)

	for row in data:
		row["gross_profit"] = flt(row.income) - flt(row.cogs)
		row["net_profit"] = flt(row.income) - flt(row.expenses)
		row["margin"] = flt((row["net_profit"] / row.income * 100) if row.income else 0, 1)
		row["income_pct"] = flt((row.income / total_income * 100) if total_income else 0, 1)

	return {
		"items": data,
		"total_income": flt(total_income, 2),
		"total_expenses": flt(total_expenses, 2),
		"total_net": flt(total_income - total_expenses, 2),
	}


def get_depreciation_audit(filters):
	"""Depreciation schedule audit — validates asset depreciation accuracy."""
	assets = frappe.db.sql("""
		SELECT
			a.name,
			a.asset_name,
			a.asset_category,
			a.status,
			a.purchase_date,
			IFNULL(a.gross_purchase_amount, 0) as purchase_amount,
			IFNULL(a.opening_accumulated_depreciation, 0) as opening_depreciation,
			IFNULL(a.value_after_depreciation, 0) as current_value,
			(IFNULL(a.gross_purchase_amount, 0) - IFNULL(a.value_after_depreciation, 0)) as total_depreciated,
			DATEDIFF(%(to_date)s, a.purchase_date) as age_days
		FROM `tabAsset` a
		WHERE a.docstatus = 1
			AND a.company = %(company)s
		ORDER BY a.gross_purchase_amount DESC
		LIMIT 30
	""", filters, as_dict=1)

	# Depreciation entries in period
	dep_entries = frappe.db.sql("""
		SELECT
			IFNULL(SUM(je.total_debit), 0) as total_depreciation,
			COUNT(*) as entry_count
		FROM `tabJournal Entry` je
		WHERE je.docstatus = 1
			AND je.company = %(company)s
			AND je.voucher_type = 'Depreciation Entry'
			AND je.posting_date BETWEEN %(from_date)s AND %(to_date)s
	""", filters, as_dict=1)[0]

	total_purchase = sum(flt(a.purchase_amount) for a in assets)
	total_current = sum(flt(a.current_value) for a in assets)
	total_depreciated = sum(flt(a.total_depreciated) for a in assets)

	# Flag anomalies
	anomalies = []
	for a in assets:
		if a.status == "Partially Depreciated" and flt(a.total_depreciated) == 0:
			anomalies.append({
				"asset": a.name, "asset_name": a.asset_name,
				"issue": "no_depreciation",
				"detail": flt(a.purchase_amount, 2),
			})
		if flt(a.current_value) > flt(a.purchase_amount):
			anomalies.append({
				"asset": a.name, "asset_name": a.asset_name,
				"issue": "value_exceeds_cost",
				"detail": flt(a.current_value - a.purchase_amount, 2),
			})
		if flt(a.current_value) < 0:
			anomalies.append({
				"asset": a.name, "asset_name": a.asset_name,
				"issue": "negative_value",
				"detail": flt(a.current_value, 2),
			})

	return {
		"items": assets,
		"anomalies": anomalies,
		"total_purchase": flt(total_purchase, 2),
		"total_current": flt(total_current, 2),
		"total_depreciated": flt(total_depreciated, 2),
		"period_depreciation": flt(dep_entries.total_depreciation, 2),
		"period_dep_entries": dep_entries.entry_count,
		"depreciation_rate": flt((total_depreciated / total_purchase * 100) if total_purchase else 0, 1),
	}


def get_aging_trend(filters):
	"""AR aging bucket trend — shows how aging distribution changes month by month."""
	from frappe.utils import add_months, get_first_day, get_last_day

	# Get monthly snapshots for the last 6 months from to_date
	months_data = []
	current_date = getdate(filters.to_date)

	for i in range(6):
		snapshot_date = add_months(current_date, -i)
		snapshot_end = get_last_day(snapshot_date) if i > 0 else current_date

		buckets = frappe.db.sql("""
			SELECT
				IFNULL(SUM(CASE WHEN DATEDIFF(%(snap)s, si.posting_date) <= 30
					THEN si.outstanding_amount ELSE 0 END), 0) as bucket_0_30,
				IFNULL(SUM(CASE WHEN DATEDIFF(%(snap)s, si.posting_date) BETWEEN 31 AND 60
					THEN si.outstanding_amount ELSE 0 END), 0) as bucket_31_60,
				IFNULL(SUM(CASE WHEN DATEDIFF(%(snap)s, si.posting_date) BETWEEN 61 AND 90
					THEN si.outstanding_amount ELSE 0 END), 0) as bucket_61_90,
				IFNULL(SUM(CASE WHEN DATEDIFF(%(snap)s, si.posting_date) > 90
					THEN si.outstanding_amount ELSE 0 END), 0) as bucket_90_plus,
				IFNULL(SUM(si.outstanding_amount), 0) as total_outstanding,
				COUNT(*) as invoice_count
			FROM `tabSales Invoice` si
			WHERE si.docstatus = 1
				AND si.company = %(company)s
				AND si.outstanding_amount > 0
				AND si.posting_date <= %(snap)s
		""", {"company": filters.company, "snap": str(snapshot_end)}, as_dict=1)[0]

		months_data.append({
			"month": str(snapshot_end)[:7],
			"date": str(snapshot_end),
			"bucket_0_30": flt(buckets.bucket_0_30, 2),
			"bucket_31_60": flt(buckets.bucket_31_60, 2),
			"bucket_61_90": flt(buckets.bucket_61_90, 2),
			"bucket_90_plus": flt(buckets.bucket_90_plus, 2),
			"total": flt(buckets.total_outstanding, 2),
			"count": buckets.invoice_count,
		})

	months_data.reverse()
	return {"months": months_data}


def get_inventory_turnover(filters):
	"""Inventory turnover by item — COGS-based turnover ratio and days on hand."""
	data = frappe.db.sql("""
		SELECT
			sle.item_code,
			item.item_name,
			item.item_group,
			IFNULL(bin.actual_qty, 0) as current_qty,
			IFNULL(bin.stock_value, 0) as current_value,
			IFNULL(SUM(CASE WHEN sle.actual_qty < 0 THEN ABS(sle.stock_value_difference) ELSE 0 END), 0) as cogs_value,
			IFNULL(SUM(CASE WHEN sle.actual_qty < 0 THEN ABS(sle.actual_qty) ELSE 0 END), 0) as qty_sold,
			IFNULL(SUM(CASE WHEN sle.actual_qty > 0 THEN sle.actual_qty ELSE 0 END), 0) as qty_received,
			COUNT(DISTINCT sle.voucher_no) as txn_count
		FROM `tabStock Ledger Entry` sle
		LEFT JOIN `tabItem` item ON item.name = sle.item_code
		LEFT JOIN (
			SELECT item_code, SUM(actual_qty) as actual_qty, SUM(stock_value) as stock_value
			FROM `tabBin`
			WHERE warehouse IN (SELECT name FROM `tabWarehouse` WHERE company = %(company)s)
			GROUP BY item_code
		) bin ON bin.item_code = sle.item_code
		WHERE sle.company = %(company)s
			AND sle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND sle.is_cancelled = 0
		GROUP BY sle.item_code
		HAVING current_qty > 0 OR cogs_value > 0
		ORDER BY cogs_value DESC
		LIMIT 30
	""", filters, as_dict=1)

	days = max(date_diff(filters.to_date, filters.from_date), 1)

	for row in data:
		avg_inventory = flt(row.current_value)
		cogs = flt(row.cogs_value)
		if avg_inventory > 0 and cogs > 0:
			row["turnover_ratio"] = flt(cogs / avg_inventory, 2)
			row["days_on_hand"] = flt(avg_inventory / cogs * days, 0)
		else:
			row["turnover_ratio"] = 0
			row["days_on_hand"] = flt(days) if avg_inventory > 0 else 0

	return {"items": data, "period_days": days}


def get_trial_balance(filters):
	"""Trial balance — opening + period movement + closing for all accounts."""
	data = frappe.db.sql("""
		SELECT
			acc.name as account,
			acc.account_name,
			acc.root_type,
			acc.is_group,
			acc.parent_account,
			IFNULL(SUM(CASE WHEN gle.posting_date < %(from_date)s THEN gle.debit ELSE 0 END), 0) as opening_debit,
			IFNULL(SUM(CASE WHEN gle.posting_date < %(from_date)s THEN gle.credit ELSE 0 END), 0) as opening_credit,
			IFNULL(SUM(CASE WHEN gle.posting_date BETWEEN %(from_date)s AND %(to_date)s THEN gle.debit ELSE 0 END), 0) as period_debit,
			IFNULL(SUM(CASE WHEN gle.posting_date BETWEEN %(from_date)s AND %(to_date)s THEN gle.credit ELSE 0 END), 0) as period_credit,
			IFNULL(SUM(CASE WHEN gle.posting_date <= %(to_date)s THEN gle.debit ELSE 0 END), 0) as closing_debit,
			IFNULL(SUM(CASE WHEN gle.posting_date <= %(to_date)s THEN gle.credit ELSE 0 END), 0) as closing_credit
		FROM `tabAccount` acc
		LEFT JOIN `tabGL Entry` gle ON gle.account = acc.name
			AND gle.company = %(company)s
			AND gle.is_cancelled = 0
			AND gle.posting_date <= %(to_date)s
		WHERE acc.company = %(company)s
			AND acc.is_group = 0
		GROUP BY acc.name
		HAVING (opening_debit != 0 OR opening_credit != 0 OR period_debit != 0
			OR period_credit != 0 OR closing_debit != 0 OR closing_credit != 0)
		ORDER BY acc.root_type, acc.name
	""", filters, as_dict=1)

	for row in data:
		row["opening_balance"] = flt(row.opening_debit - row.opening_credit, 2)
		row["closing_balance"] = flt(row.closing_debit - row.closing_credit, 2)

	totals = {
		"opening_debit": flt(sum(r.opening_debit for r in data), 2),
		"opening_credit": flt(sum(r.opening_credit for r in data), 2),
		"period_debit": flt(sum(r.period_debit for r in data), 2),
		"period_credit": flt(sum(r.period_credit for r in data), 2),
		"closing_debit": flt(sum(r.closing_debit for r in data), 2),
		"closing_credit": flt(sum(r.closing_credit for r in data), 2),
	}

	return {"items": data, "totals": totals}


def get_ratio_trend(filters):
	"""Financial ratio trend — monthly DSO, DPO, current ratio, net margin over 6 months."""
	from frappe.utils import add_months, get_first_day, get_last_day

	current_date = getdate(filters.to_date)
	months_data = []

	for i in range(6):
		month_end = get_last_day(add_months(current_date, -i)) if i > 0 else current_date
		month_start = get_first_day(month_end)

		# P&L for the month
		pnl = frappe.db.sql("""
			SELECT
				IFNULL(SUM(CASE WHEN acc.root_type = 'Income' THEN gle.credit - gle.debit ELSE 0 END), 0) as revenue,
				IFNULL(SUM(CASE WHEN acc.root_type = 'Expense' AND acc.account_type = 'Cost of Goods Sold'
					THEN gle.debit - gle.credit ELSE 0 END), 0) as cogs,
				IFNULL(SUM(CASE WHEN acc.root_type = 'Expense' THEN gle.debit - gle.credit ELSE 0 END), 0) as expenses
			FROM `tabGL Entry` gle
			JOIN `tabAccount` acc ON acc.name = gle.account
			WHERE gle.company = %(company)s
				AND gle.posting_date BETWEEN %(ms)s AND %(me)s
				AND gle.is_cancelled = 0
				AND IFNULL(gle.is_opening, 'No') = 'No'
		""", {"company": filters.company, "ms": str(month_start), "me": str(month_end)}, as_dict=1)[0]

		# Balance sheet at month end
		bal = frappe.db.sql("""
			SELECT
				IFNULL(SUM(CASE WHEN acc.account_type = 'Receivable' THEN gle.debit - gle.credit ELSE 0 END), 0) as ar,
				IFNULL(SUM(CASE WHEN acc.account_type = 'Payable' THEN gle.credit - gle.debit ELSE 0 END), 0) as ap,
				IFNULL(SUM(CASE WHEN acc.account_type IN ('Bank', 'Cash') THEN gle.debit - gle.credit ELSE 0 END), 0) as cash,
				IFNULL(SUM(CASE WHEN acc.root_type = 'Asset' AND acc.account_type IN ('Bank', 'Cash', 'Receivable', 'Stock')
					THEN gle.debit - gle.credit ELSE 0 END), 0) as current_assets
			FROM `tabGL Entry` gle
			JOIN `tabAccount` acc ON acc.name = gle.account
			WHERE gle.company = %(company)s
				AND gle.posting_date <= %(me)s
				AND gle.is_cancelled = 0
		""", {"company": filters.company, "me": str(month_end)}, as_dict=1)[0]

		days_in_month = max(date_diff(month_end, month_start), 1)
		revenue = max(flt(pnl.revenue), 0)
		cogs = max(flt(pnl.cogs), 0)
		expenses = flt(pnl.expenses)
		ar = max(flt(bal.ar), 0)
		ap = max(flt(bal.ap), 0)
		cash = flt(bal.cash)
		current_assets = flt(bal.current_assets)
		net = revenue - expenses

		months_data.append({
			"month": str(month_end)[:7],
			"revenue": flt(revenue, 2),
			"net_profit": flt(net, 2),
			"net_margin": flt((net / revenue * 100) if revenue else 0, 1),
			"gross_margin": flt(((revenue - cogs) / revenue * 100) if revenue else 0, 1),
			"dso": flt((ar / revenue * days_in_month) if revenue else 0, 1),
			"dpo": flt((ap / cogs * days_in_month) if cogs else 0, 1),
			"current_ratio": flt((current_assets / ap) if ap > 0 else 0, 2),
			"cash_ratio": flt((cash / ap) if ap > 0 else 0, 2),
		})

	months_data.reverse()
	return {"months": months_data}
