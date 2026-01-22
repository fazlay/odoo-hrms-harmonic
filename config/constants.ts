// ==========================================
// FILE 3: config/constants.ts
// ==========================================
// Purpose: App-wide constants

export const ODOO_MODELS = {
  PARTNER: "res.partner",
  PRODUCT: "product.product",
  INVOICE: "account.move",
  ATTENDANCE: "hr.attendance",
  TIMESHEET: "account.analytic.line",
  PROJECT: "project.project",
  TASK: "project.task",
  EMPLOYEE: "hr.employee",
} as const;

export const PARTNER_FIELDS = {
  BASIC: ["name", "email"],
  DETAILED: ["name", "email", "phone", "city", "is_company"],
  ALL: [], // Empty array means fetch all fields
} as const;

export const ATTENDANCE_FIELDS = {
  BASIC: [
    "employee_id",
    "check_in",
    "check_out",
    "in_latitude",
    "in_longitude",
    "out_latitude",
    "out_longitude",
    "in_mode",
  ],
  DETAILED: [
    "employee_id",
    "check_in",
    "check_out",
    "in_latitude",
    "in_longitude",
    "out_latitude",
    "out_longitude",
    "in_mode",
    "in_city",
    "in_country_name",
    "out_city",
    "out_country_name",
  ],
  ALL: [], // Empty array means fetch all fields
} as const;

export const TIMESHEET_FIELDS = {
  BASIC: [
    "id",
    "name",
    "date",
    "unit_amount",
    "employee_id",
    "project_id",
    "task_id",
  ],
  DETAILED: [
    "id",
    "name",
    "date",
    "unit_amount",
    "employee_id",
    "project_id",
    "task_id",
    "account_id",
    "company_id",
    "create_date",
    "write_date",
  ],
} as const;

export const PROJECT_FIELDS = {
  BASIC: ["id", "name", "display_name", "active", "allow_timesheets"],
} as const;

export const TASK_FIELDS = {
  BASIC: ["id", "name", "display_name", "project_id", "allow_timesheets"],
} as const;

export const DEFAULT_LIMITS = {
  SMALL: 5,
  MEDIUM: 20,
  LARGE: 50,
} as const;
