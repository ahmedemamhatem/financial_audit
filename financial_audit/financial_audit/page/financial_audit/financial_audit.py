import frappe
from frappe import _
from frappe.utils import flt, getdate, nowdate, cint
import json


@frappe.whitelist()
def get_financial_audit_data(filters=None):
	"""Main entry point — returns all financial audit data in one call."""
	if isinstance(filters, str):
		filters = frappe.parse_json(filters)

	filters = frappe._dict(filters or {})

	if not filters.get("company"):
		filters["company"] = frappe.defaults.get_user_default("Company") or frappe.db.get_single_value("Global Defaults", "default_company")

	if not filters.get("from_date"):
		filters["from_date"] = frappe.utils.get_first_day(nowdate())

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
