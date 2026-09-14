import { API_BASE_URL } from "./config";
import { RecommendedItem, FoodLogOut } from "./types";
import { parseErrorMessage } from "./errors";

export interface EatOutRecommendationInput {
  protein: number;
  carb: number;
  fat: number;
  cal: number;
  limit?: number;
  // If lat/lon are provided, results are restricted to chains with a
  // real-world location within radius_km - matches the backend's
  // location-overrides-everything-else behavior exactly.
  lat?: number;
  lon?: number;
  radius_km?: number;
}

export async function getEatOutRecommendations(
  token: string,
  input: EatOutRecommendationInput
): Promise<RecommendedItem[]> {
  const response = await fetch(`${API_BASE_URL}/recommendations/eat-out`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  const data = await response.json();
  return data.results;
}

export async function acceptEatOutRecommendation(
  token: string,
  restaurantNutritionId: string
): Promise<FoodLogOut> {
  const response = await fetch(`${API_BASE_URL}/recommendations/eat-out/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ restaurant_nutrition_id: restaurantNutritionId }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}
