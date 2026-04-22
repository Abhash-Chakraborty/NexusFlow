"use client";

import { cn } from "@lib/utils";
import { LoaderCircle } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn("h-4 w-4 animate-spin", className)} />;
}
