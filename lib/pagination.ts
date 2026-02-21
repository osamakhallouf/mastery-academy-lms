import { z } from "zod";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const paginationSchema = z.object({
  take: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  skip: z.coerce.number().int().min(0).default(0),
});

export const pageBasedPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export type PaginationParams = z.infer<typeof paginationSchema>;
export type PageBasedPaginationParams = z.infer<
  typeof pageBasedPaginationSchema
>;

export function toSkipTake(
  parsed: z.infer<typeof pageBasedPaginationSchema>
): { skip: number; take: number } {
  return {
    skip: (parsed.page - 1) * parsed.limit,
    take: parsed.limit,
  };
}

/**
 * Validates pagination input with Zod. Accepts either { take, skip } or { page, limit }.
 * Returns { skip, take }. Uses defaults (skip: 0, take: 20) when input is empty or invalid.
 */
export function parsePagination(
  input: unknown
): { skip: number; take: number } {
  const parsed = paginationSchema.safeParse(input);
  if (parsed.success) {
    return { skip: parsed.data.skip, take: parsed.data.take };
  }
  const pageParsed = pageBasedPaginationSchema.safeParse(input);
  if (pageParsed.success) {
    return toSkipTake(pageParsed.data);
  }
  return { skip: 0, take: DEFAULT_LIMIT };
}
