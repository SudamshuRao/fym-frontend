import { API_BASE_URL } from "./config";
import { CookRecommendationOut, FoodLogOut } from "./types";
import { parseErrorMessage } from "./errors";

export interface CookRecommendationInput {
  protein: number;
  carb: number;
  fat: number;
  cal: number;
}

/**
 * This calls a local LLM (Ollama) on the backend, so it can genuinely
 * take 10-30 seconds - the caller should show a loading state that
 * makes that expected, not alarming.
 */
export async function getCookRecommendation(
  token: string,
  input: CookRecommendationInput
): Promise<CookRecommendationOut> {
  const response = await fetch(`${API_BASE_URL}/recommendations/cook`, {
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
  return response.json();
}

export interface AcceptCookIngredient {
  pantry_item_id: string;
  quantity_used: number;
}

/**
 * Deliberately sends only pantry_item_id + quantity_used per
 * ingredient - never macro totals. The backend recomputes everything
 * itself from the pantry's own known values, the same way it did at
 * generation time, rather than trusting whatever the client might send.
 */
export async function acceptCookRecommendation(
  token: string,
  recipeName: string,
  ingredientsUsed: AcceptCookIngredient[]
): Promise<FoodLogOut> {
  const response = await fetch(`${API_BASE_URL}/recommendations/cook/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ recipe_name: recipeName, ingredients_used: ingredientsUsed }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}
