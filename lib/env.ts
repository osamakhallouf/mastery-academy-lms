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

const envSchema = z.object({
  // Required – app cannot run without these
  DATABASE_URL: z
    .string()
    .min(1, "Missing required environment variable: DATABASE_URL"),
  STRIPE_API_KEY: z
    .string()
    .min(1, "Missing required environment variable: STRIPE_API_KEY"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, "Missing required environment variable: STRIPE_WEBHOOK_SECRET"),
  CLERK_SECRET_KEY: z
    .string()
    .min(1, "Missing required environment variable: CLERK_SECRET_KEY"),
  TEACHER_USER_ID: z
    .string()
    .min(1, "Missing required environment variable: TEACHER_USER_ID"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .min(1, "Missing required environment variable: NEXT_PUBLIC_APP_URL"),

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
    const message = first?.message ?? "Invalid environment configuration";
    throw new Error(message);
  }
  return parsed.data;
}

/**
 * Validated environment variables. Throws on first access if any required
 * variable is missing or invalid.
 */
export const env = validateEnv();
