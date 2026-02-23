import frappe
from frappe import _
from frappe.model.document import Document


class FinancialAuditSettings(Document):
	def validate(self):
		if self.enabled and self.ai_provider != "Puter (Free)" and not self.api_key:
			frappe.throw(_("API Key is required when using {0} provider").format(self.ai_provider))

		if self.enabled and self.ai_provider == "Custom Endpoint" and not self.custom_endpoint:
			frappe.throw(_("Custom API Endpoint URL is required when using Custom Endpoint provider"))

		if self.max_requests_per_day < 1:
			self.max_requests_per_day = 20
