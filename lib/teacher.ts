/**
 * Server-side only: TEACHER_USER_ID must be set in .env.
 * When called from client (e.g. in "use client" components), the env is not
 * available so this returns false without throwing.
 */
export function isTeacher(userId?: string | null): boolean {
  const teacherId = process.env.TEACHER_USER_ID;

  if (typeof window === "undefined") {
    if (teacherId === undefined || teacherId === "") {
      throw new Error(
        "TEACHER_USER_ID environment variable is not set. Add it to .env for server-side teacher check."
      );
    }
  }

  return userId === teacherId;
}