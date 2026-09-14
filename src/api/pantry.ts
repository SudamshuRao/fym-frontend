import { API_BASE_URL } from "./config";
import { PantryItemOut } from "./types";
import { parseErrorMessage } from "./errors";

export interface PantryItemInput {
  name: string;
  barcode?: string;
  quantity?: number;
  unit?: string;
  protein?: number;
  carb?: number;
  fat?: number;
  cal?: number;
}

export async function listPantryItems(token: string): Promise<PantryItemOut[]> {
  const response = await fetch(`${API_BASE_URL}/pantry`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function createPantryItem(token: string, input: PantryItemInput): Promise<PantryItemOut> {
  const response = await fetch(`${API_BASE_URL}/pantry`, {
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

export async function updatePantryItem(
  token: string,
  itemId: string,
  input: PantryItemInput
): Promise<PantryItemOut> {
  const response = await fetch(`${API_BASE_URL}/pantry/${itemId}`, {
    method: "PATCH",
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

export async function deletePantryItem(token: string, itemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/pantry/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseErrorMessage(response));
  }
}
