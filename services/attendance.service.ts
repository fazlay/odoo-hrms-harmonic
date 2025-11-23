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
}

export interface UpdateAttendanceData {
  check_in?: string;
  check_out?: string;
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
      ODOO_MODELS.PARTNER,
      domain,
      // PARTNER_FIELDS.* may be readonly; cast to mutable string[] for the client API
      fields as unknown as string[],
      limit,
      offset
    );

    return attendanceRecords;
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
