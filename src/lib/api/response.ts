import { checkRateLimit, type RateLimitResult } from "@lib/api/rate-limit";
import type { ApiErrorResponse, ApiSuccessResponse } from "@types-app/api.types";
import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

export function apiError(error: string, code: string, status: number, details?: unknown) {
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error,
      code,
      details,
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}

function getRequestArg(args: unknown[]) {
  const request = args[0];
  return request instanceof Request ? request : null;
}

function getClientIdentifier(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1"
  );
}

function applyRateLimitHeaders(response: NextResponse, rateLimit: RateLimitResult) {
  response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  response.headers.set("X-RateLimit-Reset", String(rateLimit.reset));

  if (!rateLimit.success) {
    response.headers.set("Retry-After", String(rateLimit.retryAfter));
  }
}

export function withErrorHandler<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<NextResponse>,
) {
  return async (...args: TArgs) => {
    const request = getRequestArg(args);
    const isApiRequest = request ? new URL(request.url).pathname.startsWith("/api/") : false;
    let rateLimit: RateLimitResult | null = null;

    try {
      if (request && isApiRequest) {
        rateLimit = await checkRateLimit(getClientIdentifier(request));
        if (!rateLimit.success) {
          const response = apiError("Too many requests", "RATE_LIMITED", 429, {
            retryAfter: rateLimit.retryAfter,
          });
          applyRateLimitHeaders(response, rateLimit);
          return response;
        }
      }

      const response = await handler(...args);
      if (rateLimit) {
        applyRateLimitHeaders(response, rateLimit);
      }

      return response;
    } catch (error) {
      console.error("[api]", error);
      const response = apiError(
        "Internal server error",
        "INTERNAL_ERROR",
        500,
        process.env.NODE_ENV === "development"
          ? { message: error instanceof Error ? error.message : String(error) }
          : undefined,
      );

      if (rateLimit) {
        applyRateLimitHeaders(response, rateLimit);
      }

      return response;
    }
  };
}
