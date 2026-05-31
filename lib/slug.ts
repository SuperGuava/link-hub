const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const AUTO_SLUG_LENGTH = 8;

export const CUSTOM_SLUG_PATTERN = /^[a-z0-9_-]{3,32}$/;

export function generateSlug(length = AUTO_SLUG_LENGTH): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => SLUG_CHARS[byte % SLUG_CHARS.length]).join(
    "",
  );
}

export function isValidCustomSlug(slug: string): boolean {
  return CUSTOM_SLUG_PATTERN.test(slug);
}
