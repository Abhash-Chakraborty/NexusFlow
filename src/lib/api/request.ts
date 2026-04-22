import type { NextResponse } from "next/server";
import type { z } from "zod";

import { apiError } from "./response";

export const MAX_REQUEST_BODY_BYTES = 256 * 1024;

class SanitizationError extends Error {}

function hasUnsupportedControlCharacters(value: string) {
  for (const char of value) {
    const code = char.charCodeAt(0);
    const isAllowedWhitespace = code === 9 || code === 10 || code === 13;
    if (!isAllowedWhitespace && (code < 32 || code === 127)) {
      return true;
    }
  }

  return false;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (typeof value === "string") {
    const normalized = value.trim();

    if (hasUnsupportedControlCharacters(normalized)) {
      throw new SanitizationError("Text inputs contain unsupported control characters");
    }

    return normalized;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeJsonValue(nestedValue)]),
    );
  }

  return value;
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ data: T; response?: never } | { data?: never; response: NextResponse }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_REQUEST_BODY_BYTES) {
    return {
      response: apiError("Request body is too large", "PAYLOAD_TOO_LARGE", 413, {
        maxBytes: MAX_REQUEST_BODY_BYTES,
      }),
    };
  }

  const bodyText = await request.text();
  if (!bodyText.trim()) {
    return { response: apiError("Request body is required", "BAD_REQUEST", 400) };
  }

  if (bodyText.length > MAX_REQUEST_BODY_BYTES) {
    return {
      response: apiError("Request body is too large", "PAYLOAD_TOO_LARGE", 413, {
        maxBytes: MAX_REQUEST_BODY_BYTES,
      }),
    };
  }

  let rawBody: unknown;
  try {
    rawBody = JSON.parse(bodyText) as unknown;
  } catch {
    return { response: apiError("Malformed JSON body", "BAD_REQUEST", 400) };
  }

  let sanitized: unknown;
  try {
    sanitized = sanitizeJsonValue(rawBody);
  } catch (error) {
    if (error instanceof SanitizationError) {
      return { response: apiError(error.message, "INVALID_TEXT_INPUT", 422) };
    }

    throw error;
  }

  const result = schema.safeParse(sanitized);
  if (!result.success) {
    return {
      response: apiError("Invalid request body", "VALIDATION_ERROR", 422, result.error.flatten()),
    };
  }

  return { data: result.data };
}
