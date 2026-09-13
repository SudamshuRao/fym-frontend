import { ApiError } from "./types";

export async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data: ApiError = await response.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join(", ");
  } catch {
    // response wasn't JSON at all - fall through to generic message
  }
  return `Request failed with status ${response.status}`;
}
