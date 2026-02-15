import frappe
from frappe import _
from frappe.utils import flt, getdate, nowdate
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

	# Auto-detect currency
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
	}


def get_kpis(filters):
	"""Executive summary KPIs using universal root_type/account_type queries."""
	gl_filters = {
		"company": filters.company,
		"from_date": filters.from_date,
		"to_date": filters.to_date,
	}

	# Revenue (Income root_type)
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

	# COGS
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

	# Total Expenses
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

	# AR Outstanding (all-time balance up to to_date)
	ar_outstanding = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.debit - gle.credit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type = 'Receivable'
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
	""", gl_filters, as_dict=1)[0].total or 0

	# AP Outstanding
	ap_outstanding = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.credit - gle.debit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type = 'Payable'
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
	""", gl_filters, as_dict=1)[0].total or 0

	# Cash Balance (Bank + Cash accounts)
	cash_balance = frappe.db.sql("""
		SELECT IFNULL(SUM(gle.debit - gle.credit), 0) as total
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type IN ('Bank', 'Cash')
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
	""", gl_filters, as_dict=1)[0].total or 0

	# Inventory Value
	inventory_value = frappe.db.sql("""
		SELECT IFNULL(SUM(b.stock_value), 0) as total
		FROM `tabBin` b
		JOIN `tabWarehouse` w ON w.name = b.warehouse
		WHERE w.company = %(company)s
	""", {"company": filters.company}, as_dict=1)[0].total or 0

	# Sales Invoice counts for the period
	si_count = frappe.db.sql("""
		SELECT COUNT(*) as cnt
		FROM `tabSales Invoice`
		WHERE docstatus = 1 AND company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND is_return = 0
	""", gl_filters, as_dict=1)[0].cnt or 0

	# Purchase Invoice counts
	pi_count = frappe.db.sql("""
		SELECT COUNT(*) as cnt
		FROM `tabPurchase Invoice`
		WHERE docstatus = 1 AND company = %(company)s
			AND posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND is_return = 0
	""", gl_filters, as_dict=1)[0].cnt or 0

	gross_profit = flt(revenue) - flt(cogs)
	gross_margin = (gross_profit / revenue * 100) if revenue else 0
	opex = flt(total_expenses) - flt(cogs)
	net_profit = flt(revenue) - flt(total_expenses)
	net_margin = (net_profit / revenue * 100) if revenue else 0

	return {
		"revenue": flt(revenue, 2),
		"cogs": flt(cogs, 2),
		"gross_profit": flt(gross_profit, 2),
		"gross_margin": flt(gross_margin, 1),
		"total_expenses": flt(total_expenses, 2),
		"opex": flt(opex, 2),
		"net_profit": flt(net_profit, 2),
		"net_margin": flt(net_margin, 1),
		"ar_outstanding": flt(ar_outstanding, 2),
		"ap_outstanding": flt(ap_outstanding, 2),
		"cash_balance": flt(cash_balance, 2),
		"inventory_value": flt(inventory_value, 2),
		"si_count": si_count,
		"pi_count": pi_count,
	}


def get_income_accounts(filters):
	"""Income accounts breakdown for P&L."""
	return frappe.db.sql("""
		SELECT
			acc.name as account,
			acc.account_name,
			acc.parent_account,
			IFNULL(SUM(gle.credit - gle.debit), 0) as amount
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type = 'Income'
			AND acc.is_group = 0
			AND gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0
			AND IFNULL(gle.is_opening, 'No') = 'No'
		GROUP BY acc.name
		HAVING amount != 0
		ORDER BY amount DESC
	""", filters, as_dict=1)


def get_expense_accounts(filters):
	"""Expense accounts breakdown for P&L."""
	return frappe.db.sql("""
		SELECT
			acc.name as account,
			acc.account_name,
			acc.parent_account,
			IFNULL(SUM(gle.debit - gle.credit), 0) as amount
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type = 'Expense'
			AND acc.is_group = 0
			AND gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0
			AND IFNULL(gle.is_opening, 'No') = 'No'
		GROUP BY acc.name
		HAVING amount != 0
		ORDER BY amount DESC
	""", filters, as_dict=1)


def get_monthly_trends(filters):
	"""Monthly revenue vs expenses trend."""
	return frappe.db.sql("""
		SELECT
			YEAR(gle.posting_date) as yr,
			MONTH(gle.posting_date) as mn,
			IFNULL(SUM(CASE WHEN acc.root_type = 'Income' THEN gle.credit - gle.debit ELSE 0 END), 0) as revenue,
			IFNULL(SUM(CASE WHEN acc.root_type = 'Expense' THEN gle.debit - gle.credit ELSE 0 END), 0) as expenses
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.root_type IN ('Income', 'Expense')
			AND gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0
			AND IFNULL(gle.is_opening, 'No') = 'No'
		GROUP BY YEAR(gle.posting_date), MONTH(gle.posting_date)
		ORDER BY yr, mn
	""", filters, as_dict=1)


def get_top_customers(filters):
	"""Top customers by revenue with collection rate."""
	return frappe.db.sql("""
		SELECT
			si.customer,
			si.customer_name,
			SUM(si.base_grand_total) as total_revenue,
			SUM(si.outstanding_amount) as outstanding,
			COUNT(si.name) as invoice_count,
			ROUND(
				(SUM(si.base_grand_total) - SUM(si.outstanding_amount))
				/ NULLIF(SUM(si.base_grand_total), 0) * 100, 1
			) as collection_rate
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 1
			AND si.company = %(company)s
			AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND si.is_return = 0
		GROUP BY si.customer
		ORDER BY total_revenue DESC
		LIMIT 20
	""", filters, as_dict=1)


def get_top_products(filters):
	"""Top products by revenue."""
	return frappe.db.sql("""
		SELECT
			sii.item_code,
			sii.item_name,
			SUM(sii.base_net_amount) as total_revenue,
			SUM(sii.qty) as total_qty,
			COUNT(DISTINCT si.name) as invoice_count
		FROM `tabSales Invoice Item` sii
		JOIN `tabSales Invoice` si ON si.name = sii.parent
		WHERE si.docstatus = 1
			AND si.company = %(company)s
			AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND si.is_return = 0
		GROUP BY sii.item_code
		ORDER BY total_revenue DESC
		LIMIT 20
	""", filters, as_dict=1)


def get_top_suppliers(filters):
	"""Top suppliers by purchase volume."""
	return frappe.db.sql("""
		SELECT
			pi.supplier,
			pi.supplier_name,
			SUM(pi.base_grand_total) as total_purchases,
			SUM(pi.outstanding_amount) as outstanding,
			COUNT(pi.name) as invoice_count
		FROM `tabPurchase Invoice` pi
		WHERE pi.docstatus = 1
			AND pi.company = %(company)s
			AND pi.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND pi.is_return = 0
		GROUP BY pi.supplier
		ORDER BY total_purchases DESC
		LIMIT 20
	""", filters, as_dict=1)


def get_ar_aging(filters):
	"""Accounts Receivable aging by customer."""
	return frappe.db.sql("""
		SELECT
			gle.party as customer,
			gle.party_type,
			IFNULL(SUM(gle.debit - gle.credit), 0) as outstanding,
			MIN(gle.posting_date) as oldest_date,
			DATEDIFF(%(to_date)s, MIN(gle.posting_date)) as days_outstanding
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type = 'Receivable'
			AND gle.party_type = 'Customer'
			AND gle.party IS NOT NULL AND gle.party != ''
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
		GROUP BY gle.party
		HAVING outstanding > 0.5
		ORDER BY outstanding DESC
		LIMIT 30
	""", filters, as_dict=1)


def get_ap_aging(filters):
	"""Accounts Payable aging by supplier."""
	return frappe.db.sql("""
		SELECT
			gle.party as supplier,
			gle.party_type,
			IFNULL(SUM(gle.credit - gle.debit), 0) as outstanding,
			MIN(gle.posting_date) as oldest_date,
			DATEDIFF(%(to_date)s, MIN(gle.posting_date)) as days_outstanding
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		WHERE acc.account_type = 'Payable'
			AND gle.party_type = 'Supplier'
			AND gle.party IS NOT NULL AND gle.party != ''
			AND gle.company = %(company)s
			AND gle.posting_date <= %(to_date)s
			AND gle.is_cancelled = 0
		GROUP BY gle.party
		HAVING outstanding > 0.5
		ORDER BY outstanding DESC
		LIMIT 30
	""", filters, as_dict=1)


def get_daily_sales(filters):
	"""Daily sales trend."""
	return frappe.db.sql("""
		SELECT
			si.posting_date as date,
			SUM(si.base_grand_total) as total_sales,
			COUNT(si.name) as invoice_count
		FROM `tabSales Invoice` si
		WHERE si.docstatus = 1
			AND si.company = %(company)s
			AND si.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND si.is_return = 0
		GROUP BY si.posting_date
		ORDER BY si.posting_date
	""", filters, as_dict=1)


def get_expense_breakdown(filters):
	"""Operating expenses grouped by parent account category."""
	return frappe.db.sql("""
		SELECT
			IFNULL(acc.parent_account, acc.name) as category,
			IFNULL(pa.account_name, acc.account_name) as category_name,
			IFNULL(SUM(gle.debit - gle.credit), 0) as amount
		FROM `tabGL Entry` gle
		JOIN `tabAccount` acc ON acc.name = gle.account
		LEFT JOIN `tabAccount` pa ON pa.name = acc.parent_account
		WHERE acc.root_type = 'Expense'
			AND acc.is_group = 0
			AND gle.company = %(company)s
			AND gle.posting_date BETWEEN %(from_date)s AND %(to_date)s
			AND gle.is_cancelled = 0
			AND IFNULL(gle.is_opening, 'No') = 'No'
		GROUP BY IFNULL(acc.parent_account, acc.name)
		HAVING amount > 0
		ORDER BY amount DESC
	""", filters, as_dict=1)


def get_cash_flow(filters):
	"""Monthly cash flow: payments received vs paid."""
	return frappe.db.sql("""
		SELECT
			YEAR(pe.posting_date) as yr,
			MONTH(pe.posting_date) as mn,
			IFNULL(SUM(CASE WHEN pe.payment_type = 'Receive' THEN pe.paid_amount ELSE 0 END), 0) as received,
			IFNULL(SUM(CASE WHEN pe.payment_type = 'Pay' THEN pe.paid_amount ELSE 0 END), 0) as paid
		FROM `tabPayment Entry` pe
		WHERE pe.docstatus = 1
			AND pe.company = %(company)s
			AND pe.posting_date BETWEEN %(from_date)s AND %(to_date)s
		GROUP BY YEAR(pe.posting_date), MONTH(pe.posting_date)
		ORDER BY yr, mn
	""", filters, as_dict=1)


def get_inventory_by_warehouse(filters):
	"""Inventory valuation by warehouse."""
	return frappe.db.sql("""
		SELECT
			b.warehouse,
			SUM(b.actual_qty) as total_qty,
			SUM(b.stock_value) as total_value,
			COUNT(DISTINCT b.item_code) as item_count
		FROM `tabBin` b
		JOIN `tabWarehouse` w ON w.name = b.warehouse
		WHERE w.company = %(company)s
			AND b.actual_qty > 0
		GROUP BY b.warehouse
		ORDER BY total_value DESC
	""", {"company": filters.company}, as_dict=1)
