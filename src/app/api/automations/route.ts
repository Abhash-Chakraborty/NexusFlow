import { AUTOMATION_ACTIONS } from "@constants/automation-actions";
import { withErrorHandler } from "@lib/api/response";
import { NextResponse } from "next/server";

export const GET = withErrorHandler(async () => {
  return NextResponse.json(AUTOMATION_ACTIONS, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "application/json",
    },
  });
});
