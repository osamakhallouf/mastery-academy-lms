import { z } from "zod";

/**
 * Central environment validation. Validates on first module load and throws
 * a clear error if any required variable is missing, so the app fails fast.
 *
 * Import this module at startup so validation runs before handling requests:
 * - lib/db.ts
 * - lib/stripe.ts
 * (Any early import ensures missing env is caught on first load.)
 *
 * Usage: import { env } from "@/lib/env"
 * Then use env.STRIPE_API_KEY, env.DATABASE_URL, etc. (no process.env needed).
 */

/** @param key — اسم المتغير فقط (مثل "DATABASE_URL")، وليس القيمة أبداً */
const required = (key: string) =>
  z
    .string({ required_error: `Missing required environment variable: ${key}` })
    .min(1, `Missing required environment variable: ${key}`);

const envSchema = z.object({
  // Required – app cannot run without these
  DATABASE_URL: required("DATABASE_URL"),
  STRIPE_API_KEY: required("STRIPE_API_KEY"),
  STRIPE_WEBHOOK_SECRET: required("STRIPE_WEBHOOK_SECRET"),
  CLERK_SECRET_KEY: required("CLERK_SECRET_KEY"),
  NEXT_PUBLIC_APP_URL: required("NEXT_PUBLIC_APP_URL"),

  // Clerk (client) – required for SignInButton / UserButton and ClerkProvider
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().optional(),

  // Optional – when set, this Clerk user ID has teacher access (course creation, analytics, etc.)
  TEACHER_USER_ID: z.string().optional(),
  // Client-side: must be NEXT_PUBLIC_ so the Teacher Mode button works (navbar, layout). Accept both names.
  NEXT_PUBLIC_TEACHER_USER_ID: z.string().optional(),
  NEXT_PUBLIC_TEACHER_ID: z.string().optional(),
  // Optional – used by specific features; validate presence only when present
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  // Mux (video): required for course/chapter video upload and asset deletion
  MUX_TOKEN_ID: z.string().optional(),
  MUX_TOKEN_SECRET: z.string().optional(),
  // Brochure: required for signed PDF download URLs
  BROCHURE_SIGNING_SECRET: z.string().optional(),
});

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const key =
      typeof first?.path?.[0] === "string" ? first.path[0] : "env";
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const data = parsed.data;
  // Server: allow TEACHER_USER_ID from any of these so one env var is enough
  const fromPublic =
    data.NEXT_PUBLIC_TEACHER_USER_ID?.trim() || data.NEXT_PUBLIC_TEACHER_ID?.trim();
  if (!data.TEACHER_USER_ID?.trim() && fromPublic) {
    data.TEACHER_USER_ID = fromPublic;
  }
  return data;
}

/** Client bundle: server-only vars (e.g. DATABASE_URL) are not in process.env.
 *  TEACHER_USER_ID must come from NEXT_PUBLIC_TEACHER_USER_ID so the Teacher Mode button works. */
function getClientEnv(): EnvSchema {
  return {
    TEACHER_USER_ID:
      process.env.NEXT_PUBLIC_TEACHER_USER_ID ??
      process.env.NEXT_PUBLIC_TEACHER_ID ??
      process.env.TEACHER_USER_ID,
    NEXT_PUBLIC_TEACHER_USER_ID:
      process.env.NEXT_PUBLIC_TEACHER_USER_ID ?? process.env.NEXT_PUBLIC_TEACHER_ID ?? "",
    NEXT_PUBLIC_TEACHER_ID: process.env.NEXT_PUBLIC_TEACHER_ID ?? "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "",
    DATABASE_URL: "",
    STRIPE_API_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    CLERK_SECRET_KEY: "",
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    MUX_TOKEN_ID: process.env.MUX_TOKEN_ID,
    MUX_TOKEN_SECRET: process.env.MUX_TOKEN_SECRET,
    BROCHURE_SIGNING_SECRET: process.env.BROCHURE_SIGNING_SECRET,
  } as EnvSchema;
}

const isServer =
  typeof (globalThis as { window?: unknown }).window === "undefined";

/**
 * Validated environment variables. Throws on first access if any required
 * variable is missing or invalid (server only). On the client, only safe
 * vars are read from process.env so validation is skipped.
 */
export const env: EnvSchema = isServer ? validateEnv() : getClientEnv();
