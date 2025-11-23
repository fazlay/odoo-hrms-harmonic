// hooks/usePartners.ts
// Purpose: Reusable hook for fetching partners with automatic loading states

import {
  GetAttendanceOptions,
  attendanceService,
} from "@/services/attendance.service";
import { useEffect, useState } from "react";

import { Attendance } from "@/config/type";
import { useOdoo } from "@/context/OdooContext";

interface UseAttendanceResult {
  attendanceRecords: Attendance[];
  employeeId?: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAttendance = (
  options: GetAttendanceOptions = {}
): UseAttendanceResult => {
  const { client, isAuthenticated } = useOdoo();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceRecords = async () => {
    if (!client || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await attendanceService.getAttendanceRecords(
        client,
        options
      );
      setAttendanceRecords(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch attendance records";
      setError(errorMessage);
      console.error("❌ Error fetching attendance records:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAttendanceRecords();
  }, [client, isAuthenticated, JSON.stringify(options)]);

  return {
    attendanceRecords,
    isLoading,
    error,
    refetch: fetchAttendanceRecords,
  };
};
// Specific hook for fetching attendance records of a specific employee
export const useEmployeeAttendance = (
  employeeId: number,
  limit?: number
): UseAttendanceResult => {
  return useAttendance({ employeeId: employeeId, limit });
};

// HOW TO CREATE AN ATTENDANCE FROM UI

// import { useOdoo } from "@/context/OdooContext";
// import { attendanceService } from "@/services/attendance.service";

// const { client, isAuthenticated } = useOdoo();

// const createAttendance = async () => {
//   if (!client || !isAuthenticated) {
//     console.log("User is not authenticated.");
//     return;
//   }

//   try {
//     const newAttendanceId = await attendanceService.createAttendance(client, {
//       employee_id: 1, // Replace with actual employee ID
//       check_in: new Date().toISOString(),
//     });
//     console.log("New attendance record created with ID:", newAttendanceId);
//   } catch (error) {
//     console.error("Error creating attendance record:", error);
//   }
// };
