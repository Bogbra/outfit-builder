export class TryOnApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "TryOnApiError";
  }
}

export async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  const json: unknown = await response.json().catch(() => null);
  if (json && typeof json === "object" && "error" in json && typeof json.error === "string") {
    return json.error;
  }
  return fallback;
}
