// ==========================================
// FILE 3: config/constants.ts
// ==========================================
// Purpose: App-wide constants

export const ODOO_MODELS = {
  PARTNER: "res.partner",
  PRODUCT: "product.product",
  INVOICE: "account.move",
  ATTENDANCE: "hr.attendance",
} as const;

export const PARTNER_FIELDS = {
  BASIC: ["name", "email"],
  DETAILED: ["name", "email", "phone", "city", "is_company"],
  ALL: [], // Empty array means fetch all fields
} as const;

export const ATTENDANCE_FIELDS = {
  BASIC: ["employee_id", "check_in", "check_out"],
  DETAILED: ["employee_id", "check_in", "check_out"],
  ALL: [], // Empty array means fetch all fields
} as const;

export const DEFAULT_LIMITS = {
  SMALL: 5,
  MEDIUM: 20,
  LARGE: 50,
} as const;
