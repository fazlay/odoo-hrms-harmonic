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
  in_latitude?: number;
  in_longitude?: number;
  out_latitude?: number;
  out_longitude?: number;
  in_mode?: string;
  in_city?: string;
  in_country_name?: string;
  out_city?: string;
  out_country_name?: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  isLoading: boolean;
}
