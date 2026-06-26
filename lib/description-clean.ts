/**
 * Strip HTML tags and return plain text. Use for Hero preview to avoid XSS
 * and to get clean text for line-clamp display.
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== "string") return html;
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Strip leading sentences that start with "Sure!" or "Gemini said", and remove
 * the first line if it contains "Here is a professional..." from course description.
 * Use when displaying on the course page or when building the brochure PDF.
 */
export function stripLeadingAiPhrases(text: string): string {
  if (!text || typeof text !== "string") return text;
  let s = text.trim();

  const hereIsProfessional = /^\s*Here is a professional[^\n]*\n?/i;
  s = s.replace(hereIsProfessional, "").trim();

  const stripPattern = /^\s*(Sure!?|Gemini said[^.!?\n]*(?:[.!?]|\n)?)\s*/gi;
  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(stripPattern, "").trim();
  }
  return s;
}
