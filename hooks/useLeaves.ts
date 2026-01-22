import { useOdoo } from "@/context/OdooContext";
import { Leave, leaveService, LeaveType } from "@/services/leave.service";
import { useEffect, useState } from "react";

interface UseLeavesResult {
    leaves: Leave[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useLeaves = (refreshTrigger?: number): UseLeavesResult => {
    const { client, uid, isAuthenticated } = useOdoo();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaves = async () => {
        if (!client || !isAuthenticated || !uid) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const employeeId = await leaveService.getEmployeeId(client, uid);
            if (employeeId) {
                const data = await leaveService.getMyLeaves(client, employeeId);
                setLeaves(data);
            } else {
                setError("Employee record not found.");
            }
        } catch (err: any) {
            const errorMessage = err.message || "Failed to fetch leaves";
            setError(errorMessage);
            console.error("❌ Error fetching leaves:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [client, isAuthenticated, uid, refreshTrigger]);

    return {
        leaves,
        isLoading,
        error,
        refetch: fetchLeaves,
    };
};

interface UseLeaveTypesResult {
    leaveTypes: LeaveType[];
    isLoading: boolean;
    error: string | null;
}

export const useLeaveTypes = (): UseLeaveTypesResult => {
    const { client, isAuthenticated } = useOdoo();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTypes = async () => {
            if (!client || !isAuthenticated) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const types = await leaveService.getLeaveTypes(client);
                setLeaveTypes(types);
            } catch (err: any) {
                setError(err.message || "Failed to fetch leave types");
                console.error("❌ Error fetching leave types:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTypes();
    }, [client, isAuthenticated]);

    return { leaveTypes, isLoading, error };
};
