import { API_BASE_URL } from "./config";
import { DailyTargetOut } from "./types";
import { parseErrorMessage } from "./errors";

export interface DailyTargetInput {
  protein: number;
  carb: number;
  fat: number;
  cal: number;
}

/**
 * Returns null (not an error) if the user hasn't set a target yet - the
 * backend returns a 404 in that case, which is an expected, normal
 * state for a new user, not a failure.
 */
export async function getDailyTarget(token: string): Promise<DailyTargetOut | null> {
  const response = await fetch(`${API_BASE_URL}/daily-target`, {
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
 * Upserts the daily target - the backend's PUT endpoint creates it if
 * none exists yet, or updates it if one already does. The client never
 * needs to know which case applies.
 */
export async function setDailyTarget(token: string, input: DailyTargetInput): Promise<DailyTargetOut> {
  const response = await fetch(`${API_BASE_URL}/daily-target`, {
    method: "PUT",
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
