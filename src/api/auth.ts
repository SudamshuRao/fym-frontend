import { API_BASE_URL } from "./config";
import { UserOut, Token, ApiError } from "./types";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data: ApiError = await response.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join(", ");
  } catch {
    // response wasn't JSON at all - fall through to generic message
  }
  return `Request failed with status ${response.status}`;
}

export async function register(email: string, password: string): Promise<UserOut> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function login(email: string, password: string): Promise<Token> {
  // The backend's /auth/login uses OAuth2PasswordRequestForm, which
  // expects form-encoded data with "username" and "password" fields -
  // NOT a JSON body, even though the field is called "email" everywhere
  // else in this app.
  const body = new URLSearchParams();
  body.append("username", email);
  body.append("password", password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}

export async function getMe(token: string): Promise<UserOut> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return response.json();
}
