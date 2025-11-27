// services/partner.service.ts
// Purpose: All partner-related business logic in one place

import { ATTENDANCE_FIELDS, ODOO_MODELS } from "@/config/constants";
import OdooClient from "@/utils/OdooClient";

import { Attendance } from "../config/type";

export interface GetAttendanceOptions {
  isCompany?: boolean;
  employeeId?: number;
  limit?: number;
  offset?: number;
  // accept readonly arrays (e.g. tuple constants) as well
  fields?: readonly string[];
}

export interface CreateAttendanceData {
  employee_id: number;
  check_in: string;
  check_out?: string;
  in_latitude?: number;
  in_longitude?: number;
  in_mode?: string;
}

export interface UpdateAttendanceData {
  check_in?: string;
  check_out?: string;
  out_latitude?: number;
  out_longitude?: number;
}

class AttendanceService {
  /**
   * Get list of attendance records with optional filters
   */
  async getAttendanceRecords(
    odoo: OdooClient,
    options: GetAttendanceOptions = {}
  ): Promise<Attendance[]> {
    const {
      isCompany,
      limit = 20,
      offset = 0,
      fields = ATTENDANCE_FIELDS.BASIC,
    } = options;

    // Build domain (filters)
    const domain: any[] = [];
    if (isCompany !== undefined) {
      domain.push(["is_company", "=", isCompany]);
    }

    const attendanceRecords = await odoo.searchRead(
      ODOO_MODELS.ATTENDANCE,
      domain,
      // PARTNER_FIELDS.* may be readonly; cast to mutable string[] for the client API
      fields as unknown as string[],
      limit,
      offset
    );

    return attendanceRecords;
  }

  /**
   * Get the current open attendance record for an employee (if any)
   */
  async getOpenAttendance(
    odoo: OdooClient,
    employeeId: number
  ): Promise<Attendance | null> {
    const domain = [
      ["employee_id", "=", employeeId],
      ["check_out", "=", false],
    ];

    const records = await odoo.searchRead(
      ODOO_MODELS.ATTENDANCE,
      domain,
      ATTENDANCE_FIELDS.BASIC as unknown as string[],
      1
    );

    return records.length > 0 ? records[0] : null;
  }

  /**
   * Get today's attendance record for an employee
   */
  async getTodaysAttendance(
    odoo: OdooClient,
    employeeId: number
  ): Promise<Attendance | null> {
    // Get today's date range in UTC (Odoo stores in UTC)
    // For simplicity, we'll use local date string comparison which works for most single-timezone cases
    // Ideally, this should handle timezones properly
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
      .toISOString()
      .replace("T", " ")
      .split(".")[0];
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
      .toISOString()
      .replace("T", " ")
      .split(".")[0];

    const domain = [
      ["employee_id", "=", employeeId],
      ["check_in", ">=", startOfDay],
      ["check_in", "<=", endOfDay],
    ];

    const records = await odoo.searchRead(
      ODOO_MODELS.ATTENDANCE,
      domain,
      ATTENDANCE_FIELDS.BASIC as unknown as string[],
      1,
      0,
      "check_in desc" // Get the latest one
    );

    return records.length > 0 ? records[0] : null;
  }

  /**
   * Get a single attendance record by ID
   */
  async getAttendanceById(
    odoo: OdooClient,
    id: number,
    // accept readonly arrays here as well
    fields: readonly string[] = ATTENDANCE_FIELDS.DETAILED
  ): Promise<Attendance | null> {
    const attendanceRecords = await odoo.read(
      ODOO_MODELS.ATTENDANCE,
      [id],
      fields as unknown as string[]
    );
    return attendanceRecords.length > 0 ? attendanceRecords[0] : null;
  }

  /**
   * Create a new attendance record
   */
  async createAttendance(
    odoo: OdooClient,
    data: CreateAttendanceData
  ): Promise<number> {
    const newId = await odoo.create(ODOO_MODELS.ATTENDANCE, data);
    return newId;
  }

  /**
   * Update an existing attendance record
   */
  async updateAttendance(
    odoo: OdooClient,
    id: number,
    data: UpdateAttendanceData
  ): Promise<boolean> {
    const success = await odoo.write(ODOO_MODELS.ATTENDANCE, [id], data);
    return success;
  }

  /**
   * Delete an attendance record
   */
  async deleteAttendance(odoo: OdooClient, id: number): Promise<boolean> {
    const success = await odoo.unlink(ODOO_MODELS.ATTENDANCE, [id]);
    return success;
  }
}

// Export a single instance (singleton pattern)
export const attendanceService = new AttendanceService();
