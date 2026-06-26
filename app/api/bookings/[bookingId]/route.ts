import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";

export async function PATCH() {
  return apiError(
    "Individual booking management is disabled. Use Corporate Inquiries instead.",
    410
  );
}
