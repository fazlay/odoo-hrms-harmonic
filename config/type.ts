// ==========================================
// FILE 2: config/types.ts
// ==========================================
// Purpose: TypeScript types for type safety

export interface OdooConfig {
  url: string;
  db: string;
  username: string;
  password: string;
}

export interface OdooSession {
  uid: number;
  session_id: string;
  partner_id: number;
}

// Partner model type
export interface Partner {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  is_company?: boolean;
}

// Attendance model type
export interface Attendance {
  id: number;
  employee_id: number;
  check_in: string;
  check_out?: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  isLoading: boolean;
}
