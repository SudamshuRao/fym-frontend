// Mirrors app/schemas/auth.py on the backend exactly.

export interface UserOut {
  id: string;
  email: string;
  day_start_time: string; // e.g. "00:00:00"
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string | { msg: string }[];
}

// Mirrors app/schemas/daily_target.py exactly.
export interface DailyTargetOut {
  id: string;
  protein: number;
  carb: number;
  fat: number;
  cal: number;
  updated_at: string;
}
