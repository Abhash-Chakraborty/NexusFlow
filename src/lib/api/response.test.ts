import { NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetRateLimitBucketsForTests } from "./rate-limit";
import { withErrorHandler } from "./response";

describe("withErrorHandler", () => {
  beforeEach(() => {
    resetRateLimitBucketsForTests();
  });

  afterEach(() => {
    resetRateLimitBucketsForTests();
    vi.restoreAllMocks();
  });

  it("returns 429 once the in-memory API rate limit is exceeded", async () => {
    const handler = vi.fn(async (_request: Request) => NextResponse.json({ success: true }));
    const wrapped = withErrorHandler(handler);

    for (let index = 0; index < 60; index += 1) {
      const response = await wrapped(new Request("http://localhost/api/test"));
      expect(response.status).toBe(200);
    }

    const limitedResponse = await wrapped(new Request("http://localhost/api/test"));
    const payload = await limitedResponse.json();

    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.headers.get("x-ratelimit-limit")).toBe("60");
    expect(limitedResponse.headers.get("retry-after")).not.toBeNull();
    expect(payload.code).toBe("RATE_LIMITED");
    expect(handler).toHaveBeenCalledTimes(60);
  });
});
