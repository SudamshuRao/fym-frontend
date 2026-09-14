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

export type FoodLogSource = "logged" | "recommended";

// Mirrors app/schemas/food_log.py exactly.
export interface FoodLogOut {
  id: string;
  name: string;
  source: FoodLogSource;
  protein: number;
  carb: number;
  fat: number;
  cal: number;
  timestamp: string;
  reverted: boolean;
}

export interface RemainingOut {
  protein: number;
  carb: number;
  fat: number;
  cal: number;
  target_protein: number;
  target_carb: number;
  target_fat: number;
  target_cal: number;
}

// Mirrors app/core/budget_split.py's SplitMode exactly.
export type SplitMode = "full" | "partial" | "meals";

// Mirrors app/schemas/standalone.py exactly.
export interface StandaloneBudgetOut {
  protein: number;
  carb: number;
  fat: number;
  cal: number;
}

export interface AddToDailyOut {
  logged_entry_id: string;
  has_daily_target: boolean;
  remaining_protein: number | null;
  remaining_carb: number | null;
  remaining_fat: number | null;
  remaining_cal: number | null;
  message: string;
}

// Mirrors app/schemas/pantry_item.py exactly - only name is required,
// everything else can be null if not provided.
export interface PantryItemOut {
  id: string;
  name: string;
  barcode: string | null;
  quantity: number | null;
  unit: string | null;
  protein: number | null;
  carb: number | null;
  fat: number | null;
  cal: number | null;
  created_at: string;
}

// Mirrors app/schemas/cook.py exactly.
export interface RecipeIngredientOut {
  pantry_item_id: string;
  name: string;
  quantity_used: number;
  unit: string;
}

export interface CookRecommendationOut {
  recipe_name: string;
  steps: string[];
  ingredients_used: RecipeIngredientOut[];
  protein: number;
  carb: number;
  fat: number;
  cal: number;
  fit_score: number;
}

// Mirrors app/schemas/recommendation.py exactly.
export interface RecommendedItem {
  restaurant_id: string;
  restaurant_name: string;
  menu_item: string;
  protein: number | null;
  carb: number | null;
  fat: number | null;
  cal: number | null;
  fit_score: number;
  restaurant_nutrition_id: string;
  distance_km: number | null;
}

// Mirrors app/schemas/pantry_item.py exactly.
export interface PantryItemOut {
  id: string;
  name: string;
  barcode: string | null;
  quantity: number | null;
  unit: string | null;
  protein: number | null;
  carb: number | null;
  fat: number | null;
  cal: number | null;
  created_at: string;
}
