import OdooClient from "@/utils/OdooClient";

export interface LeaveType {
    id: number;
    name: string;
    display_name: string;
}

export interface Leave {
    id: number;
    name: string; // Description
    holiday_status_id: [number, string]; // [id, name]
    date_from: string;
    date_to: string;
    duration_display: string;
    state: 'draft' | 'confirm' | 'refuse' | 'validate1' | 'validate';
}

export const leaveService = {
    getEmployeeId: async (client: OdooClient, uid: number): Promise<number | null> => {
        const employees = await client.searchRead(
            "hr.employee",
            [["user_id", "=", uid]],
            ["id"],
            1
        );
        return employees.length > 0 ? employees[0].id : null;
    },

    getLeaveTypes: async (client: OdooClient): Promise<LeaveType[]> => {
        const types = await client.searchRead(
            "hr.leave.type",
            [],
            ["id", "name", "display_name"]
        );
        return types;
    },

    getMyLeaves: async (client: OdooClient, employeeId: number): Promise<Leave[]> => {
        const leaves = await client.searchRead(
            "hr.leave",
            [["employee_id", "=", employeeId]],
            ["id", "name", "holiday_status_id", "date_from", "date_to", "duration_display", "state"],
            undefined,
            undefined,
            "date_from desc"
        );
        return leaves;
    },

    createLeaveRequest: async (
        client: OdooClient,
        employeeId: number,
        leaveTypeId: number,
        dateFrom: string,
        dateTo: string,
        description: string
    ): Promise<number> => {
        const leaveId = await client.create("hr.leave", {
            employee_id: employeeId,
            holiday_status_id: leaveTypeId,
            date_from: dateFrom,
            date_to: dateTo,
            name: description,
            request_date_from: dateFrom.split(" ")[0],
            request_date_to: dateTo.split(" ")[0],
        });
        return leaveId;
    },
};
