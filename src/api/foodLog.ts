import { API_BASE_URL } from "./config";
import { FoodLogOut, RemainingOut } from "./types";
import { parseErrorMessage } from "./errors";

export interface FoodLogInput {
  name: string;
  protein: number;
  carb: number;
  fat: number;
  cal: number;
}

export async function createFoodLogEntry(token: string, input: FoodLogInput): Promise<FoodLogOut> {
  const response = await fetch(`${API_BASE_URL}/food-log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // Source defaults to "logged" server-side for manual entries - no
    // need to send it explicitly here.
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

/**
 * Returns null (not an error) if no daily target is set yet - the
 * backend returns a 404 in that case, since Remaining is undefined
 * without a target to subtract from. That's an expected state for a
 * new user, not a failure.
 */
export async function getRemaining(token: string): Promise<RemainingOut | null> {
  const response = await fetch(`${API_BASE_URL}/food-log/remaining`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

/**
 * Returns ALL of today's entries, including already-reverted ones (the
 * backend intentionally includes them so the client can show a
 * history/strikethrough view rather than entries just vanishing).
 */
export async function getTodaysEntries(token: string): Promise<FoodLogOut[]> {
  const response = await fetch(`${API_BASE_URL}/food-log/today`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function revertFoodLogEntry(token: string, entryId: string): Promise<FoodLogOut> {
  const response = await fetch(`${API_BASE_URL}/food-log/${entryId}/revert`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}
