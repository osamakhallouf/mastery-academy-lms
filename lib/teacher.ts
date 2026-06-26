import { env } from "@/lib/env";

/**
 * Returns true if userId matches the optional teacher user ID from env.
 * Server: uses TEACHER_USER_ID or NEXT_PUBLIC_TEACHER_USER_ID from .env.
 * Client: uses NEXT_PUBLIC_TEACHER_USER_ID only (required for Teacher Mode button in navbar).
 */
export function isTeacher(userId?: string | null): boolean {
  const teacherId = env.TEACHER_USER_ID;
  if (!teacherId?.trim()) return false;
  return userId === teacherId;
}