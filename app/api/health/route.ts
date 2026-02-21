import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[HEALTH] Database check failed:", error);
    return NextResponse.json(
      { status: "error", error: "Database unavailable" },
      { status: 500 }
    );
  }
}
