import { NextResponse } from "next/server";
import { z } from "zod";

export type ValidateResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function formatZodError(error: z.ZodError): string {
  const messages = error.issues.map(
    (issue) =>
      (issue.path.length ? `${issue.path.join(".")}: ` : "") + issue.message
  );
  return messages.length > 0 ? messages.join("; ") : "Validation failed";
}

export async function validateRequest<T extends z.ZodType>(
  schema: T,
  request: Request
): Promise<ValidateResult<z.infer<T>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { success: false, error: "Invalid JSON" };
  }

  const parsed = schema.safeParse(body);
  if (parsed.success) {
    return { success: true, data: parsed.data as z.infer<T> };
  }

  return {
    success: false,
    error: formatZodError(parsed.error),
  };
}

export function validationErrorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}
