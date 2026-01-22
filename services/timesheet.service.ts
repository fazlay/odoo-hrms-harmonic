import {
  ODOO_MODELS,
  PROJECT_FIELDS,
  TASK_FIELDS,
  TIMESHEET_FIELDS,
} from "@/config/constants";
import { Project, Task, Timesheet } from "@/config/type";
import OdooClient from "@/utils/OdooClient";

export interface GetTimesheetOptions {
  employeeId?: number;
  projectId?: number;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTimesheetData {
  name: string;
  date: string;
  unit_amount: number;
  project_id: number;
  task_id?: number;
  employee_id?: number;
}

export interface UpdateTimesheetData {
  name?: string;
  date?: string;
  unit_amount?: number;
  project_id?: number;
  task_id?: number | false;
}

export const timesheetService = {
  /**
   * Get the employee ID for the current user
   */
  getEmployeeId: async (
    client: OdooClient,
    uid: number,
  ): Promise<number | null> => {
    const employees = await client.searchRead(
      ODOO_MODELS.EMPLOYEE,
      [["user_id", "=", uid]],
      ["id"],
      1,
    );
    return employees.length > 0 ? employees[0].id : null;
  },

  /**
   * Get list of timesheet records with optional filters
   */
  getTimesheets: async (
    client: OdooClient,
    options: GetTimesheetOptions = {},
  ): Promise<Timesheet[]> => {
    const {
      employeeId,
      projectId,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
    } = options;

    // Build domain (filters) - only get timesheet lines (project_id != false)
    const domain: any[] = [["project_id", "!=", false]];

    if (employeeId) {
      domain.push(["employee_id", "=", employeeId]);
    }
    if (projectId) {
      domain.push(["project_id", "=", projectId]);
    }
    if (dateFrom) {
      domain.push(["date", ">=", dateFrom]);
    }
    if (dateTo) {
      domain.push(["date", "<=", dateTo]);
    }

    const timesheets = await client.searchRead(
      ODOO_MODELS.TIMESHEET,
      domain,
      TIMESHEET_FIELDS.BASIC as unknown as string[],
      limit,
      offset,
      "date desc, id desc",
    );

    return timesheets;
  },

  /**
   * Get a single timesheet by ID
   */
  getTimesheetById: async (
    client: OdooClient,
    id: number,
  ): Promise<Timesheet | null> => {
    const records = await client.read(
      ODOO_MODELS.TIMESHEET,
      [id],
      TIMESHEET_FIELDS.BASIC as unknown as string[],
    );
    return records.length > 0 ? records[0] : null;
  },

  /**
   * Get available projects that allow timesheets
   */
  getProjects: async (client: OdooClient): Promise<Project[]> => {
    const projects = await client.searchRead(
      ODOO_MODELS.PROJECT,
      [
        ["active", "=", true],
        ["allow_timesheets", "=", true],
      ],
      PROJECT_FIELDS.BASIC as unknown as string[],
      100,
      0,
      "name asc",
    );
    return projects;
  },

  /**
   * Get tasks for a specific project
   */
  getTasksByProject: async (
    client: OdooClient,
    projectId: number,
  ): Promise<Task[]> => {
    const tasks = await client.searchRead(
      ODOO_MODELS.TASK,
      [
        ["project_id", "=", projectId],
        ["allow_timesheets", "=", true],
      ],
      TASK_FIELDS.BASIC as unknown as string[],
      100,
      0,
      "name asc",
    );
    return tasks;
  },

  /**
   * Get all tasks that allow timesheets
   */
  getAllTasks: async (client: OdooClient): Promise<Task[]> => {
    const tasks = await client.searchRead(
      ODOO_MODELS.TASK,
      [["allow_timesheets", "=", true]],
      TASK_FIELDS.BASIC as unknown as string[],
      200,
      0,
      "project_id, name asc",
    );
    return tasks;
  },

  /**
   * Create a new timesheet entry
   */
  createTimesheet: async (
    client: OdooClient,
    data: CreateTimesheetData,
  ): Promise<number> => {
    const values: any = {
      name: data.name || "/",
      date: data.date,
      unit_amount: data.unit_amount,
      project_id: data.project_id,
    };

    if (data.task_id) {
      values.task_id = data.task_id;
    }
    if (data.employee_id) {
      values.employee_id = data.employee_id;
    }

    const timesheetId = await client.create(ODOO_MODELS.TIMESHEET, values);
    return timesheetId;
  },

  /**
   * Update an existing timesheet entry
   */
  updateTimesheet: async (
    client: OdooClient,
    id: number,
    data: UpdateTimesheetData,
  ): Promise<boolean> => {
    const values: any = {};

    if (data.name !== undefined) values.name = data.name || "/";
    if (data.date !== undefined) values.date = data.date;
    if (data.unit_amount !== undefined) values.unit_amount = data.unit_amount;
    if (data.project_id !== undefined) values.project_id = data.project_id;
    if (data.task_id !== undefined) values.task_id = data.task_id;

    return await client.write(ODOO_MODELS.TIMESHEET, [id], values);
  },

  /**
   * Delete a timesheet entry
   */
  deleteTimesheet: async (client: OdooClient, id: number): Promise<boolean> => {
    return await client.unlink(ODOO_MODELS.TIMESHEET, [id]);
  },

  /**
   * Get total hours for a date range
   */
  getTotalHours: async (
    client: OdooClient,
    employeeId: number,
    dateFrom: string,
    dateTo: string,
  ): Promise<number> => {
    const timesheets = await timesheetService.getTimesheets(client, {
      employeeId,
      dateFrom,
      dateTo,
      limit: 1000,
    });

    return timesheets.reduce((total, ts) => total + ts.unit_amount, 0);
  },

  /**
   * Get today's timesheets for an employee
   */
  getTodaysTimesheets: async (
    client: OdooClient,
    employeeId: number,
  ): Promise<Timesheet[]> => {
    const today = new Date().toISOString().split("T")[0];
    return timesheetService.getTimesheets(client, {
      employeeId,
      dateFrom: today,
      dateTo: today,
    });
  },

  /**
   * Get this week's timesheets for an employee
   */
  getWeekTimesheets: async (
    client: OdooClient,
    employeeId: number,
  ): Promise<Timesheet[]> => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
    );

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return timesheetService.getTimesheets(client, {
      employeeId,
      dateFrom: startOfWeek.toISOString().split("T")[0],
      dateTo: endOfWeek.toISOString().split("T")[0],
    });
  },
};
