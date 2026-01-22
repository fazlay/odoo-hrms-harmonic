import { Project, Task, Timesheet } from "@/config/type";
import { useOdoo } from "@/context/OdooContext";
import {
  CreateTimesheetData,
  GetTimesheetOptions,
  timesheetService,
  UpdateTimesheetData,
} from "@/services/timesheet.service";
import { useCallback, useEffect, useState } from "react";

interface UseTimesheetsResult {
  timesheets: Timesheet[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseTimesheetActionsResult {
  createTimesheet: (data: CreateTimesheetData) => Promise<number>;
  updateTimesheet: (id: number, data: UpdateTimesheetData) => Promise<boolean>;
  deleteTimesheet: (id: number) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
}

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  loadTasksForProject: (projectId: number) => Promise<void>;
  clearTasks: () => void;
}

/**
 * Hook to fetch timesheets with filters
 */
export const useTimesheets = (
  options: GetTimesheetOptions = {},
  refreshTrigger?: number,
): UseTimesheetsResult => {
  const { client, isAuthenticated, uid } = useOdoo();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimesheets = useCallback(async () => {
    if (!client || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // If no employeeId provided, get it from the current user
      let employeeId = options.employeeId;
      if (!employeeId && uid) {
        employeeId =
          (await timesheetService.getEmployeeId(client, uid)) || undefined;
      }

      const data = await timesheetService.getTimesheets(client, {
        ...options,
        employeeId,
      });
      setTimesheets(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch timesheets";
      setError(errorMessage);
      console.error("❌ Error fetching timesheets:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [client, isAuthenticated, uid, JSON.stringify(options)]);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets, refreshTrigger]);

  return {
    timesheets,
    isLoading,
    error,
    refetch: fetchTimesheets,
  };
};

/**
 * Hook for timesheet CRUD actions
 */
export const useTimesheetActions = (): UseTimesheetActionsResult => {
  const { client, isAuthenticated, uid } = useOdoo();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTimesheet = async (
    data: CreateTimesheetData,
  ): Promise<number> => {
    if (!client || !isAuthenticated) {
      throw new Error("Not authenticated");
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get employee ID if not provided
      let employeeId = data.employee_id;
      if (!employeeId && uid) {
        employeeId =
          (await timesheetService.getEmployeeId(client, uid)) || undefined;
      }

      const id = await timesheetService.createTimesheet(client, {
        ...data,
        employee_id: employeeId,
      });
      return id;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create timesheet";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTimesheet = async (
    id: number,
    data: UpdateTimesheetData,
  ): Promise<boolean> => {
    if (!client || !isAuthenticated) {
      throw new Error("Not authenticated");
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await timesheetService.updateTimesheet(client, id, data);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update timesheet";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTimesheet = async (id: number): Promise<boolean> => {
    if (!client || !isAuthenticated) {
      throw new Error("Not authenticated");
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await timesheetService.deleteTimesheet(client, id);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete timesheet";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createTimesheet,
    updateTimesheet,
    deleteTimesheet,
    isSubmitting,
    error,
  };
};

/**
 * Hook to fetch available projects
 */
export const useProjects = (): UseProjectsResult => {
  const { client, isAuthenticated } = useOdoo();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!client || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await timesheetService.getProjects(client);
      setProjects(data);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch projects";
      setError(errorMessage);
      console.error("❌ Error fetching projects:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [client, isAuthenticated]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
  };
};

/**
 * Hook to fetch tasks
 */
export const useTasks = (): UseTasksResult => {
  const { client, isAuthenticated } = useOdoo();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasksForProject = useCallback(
    async (projectId: number) => {
      if (!client || !isAuthenticated) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await timesheetService.getTasksByProject(
          client,
          projectId,
        );
        setTasks(data);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch tasks";
        setError(errorMessage);
        console.error("❌ Error fetching tasks:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [client, isAuthenticated],
  );

  const clearTasks = useCallback(() => {
    setTasks([]);
  }, []);

  return {
    tasks,
    isLoading,
    error,
    loadTasksForProject,
    clearTasks,
  };
};

/**
 * Hook to get timesheet summary (total hours)
 */
export const useTimesheetSummary = (refreshTrigger?: number) => {
  const { client, isAuthenticated, uid } = useOdoo();
  const [todayHours, setTodayHours] = useState(0);
  const [weekHours, setWeekHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!client || !isAuthenticated || !uid) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const employeeId = await timesheetService.getEmployeeId(client, uid);
      if (!employeeId) {
        setError("Employee not found");
        return;
      }

      const today = new Date().toISOString().split("T")[0];

      // Get week range
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(
        now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
      );
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const [todayTotal, weekTotal] = await Promise.all([
        timesheetService.getTotalHours(client, employeeId, today, today),
        timesheetService.getTotalHours(
          client,
          employeeId,
          startOfWeek.toISOString().split("T")[0],
          endOfWeek.toISOString().split("T")[0],
        ),
      ]);

      setTodayHours(todayTotal);
      setWeekHours(weekTotal);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch summary";
      setError(errorMessage);
      console.error("❌ Error fetching timesheet summary:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [client, isAuthenticated, uid]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshTrigger]);

  return {
    todayHours,
    weekHours,
    isLoading,
    error,
    refetch: fetchSummary,
  };
};
