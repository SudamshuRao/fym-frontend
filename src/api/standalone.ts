import { API_BASE_URL } from "./config";
import { SplitMode, StandaloneBudgetOut, AddToDailyOut } from "./types";
import { parseErrorMessage } from "./errors";

export interface StandaloneBudgetInput {
  protein: number;
  carb: number;
  fat: number;
  cal: number;
  split_mode: SplitMode;
  split_value?: number;
}

/**
 * No persistence - matches the backend's design exactly (this endpoint
 * doesn't even require auth on the backend, though we send the token
 * anyway for consistency with every other call in this app).
 */
export async function calculateStandaloneBudget(
  token: string,
  input: StandaloneBudgetInput
): Promise<StandaloneBudgetOut> {
  const response = await fetch(`${API_BASE_URL}/standalone/budget`, {
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

export interface AddToDailyInput {
  name: string;
  protein: number;
  carb: number;
  fat: number;
  cal: number;
}

export async function addStandaloneToDaily(token: string, input: AddToDailyInput): Promise<AddToDailyOut> {
  const response = await fetch(`${API_BASE_URL}/standalone/add-to-daily`, {
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
