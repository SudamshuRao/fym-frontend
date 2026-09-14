import { API_BASE_URL } from "./config";
import { PreferenceSummaryOut, PersonalizationRefreshOut } from "./types";
import { parseErrorMessage } from "./errors";

export async function getPreferenceSummary(token: string): Promise<PreferenceSummaryOut> {
  const response = await fetch(`${API_BASE_URL}/personalization/summary`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

/**
 * This calls a local LLM (Ollama) on the backend, so it can genuinely
 * take 10-30 seconds - same as the cook recommendation call.
 */
export async function refreshPreferenceSummary(token: string): Promise<PersonalizationRefreshOut> {
  const response = await fetch(`${API_BASE_URL}/personalization/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}
