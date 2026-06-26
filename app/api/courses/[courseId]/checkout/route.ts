import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";

export async function POST() {
  return apiError(
    "Individual checkout is disabled. Use Corporate Training Request instead.",
    410
  );
}
