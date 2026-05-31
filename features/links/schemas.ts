import { CUSTOM_SLUG_PATTERN } from "@/lib/slug";

export type ParsedCreateLinkInput = {
  originalUrl: string;
  slug?: string;
  expiresAt?: string;
  clickLimit?: string;
};

export function parseCreateLinkInput(input: {
  originalUrl: unknown;
  slug?: unknown;
  expiresAt?: unknown;
  clickLimit?: unknown;
}):
  | { success: true; data: ParsedCreateLinkInput }
  | { success: false; error: string } {
  if (typeof input.originalUrl !== "string" || !input.originalUrl.trim()) {
    return { success: false, error: "URL을 입력해 주세요." };
  }

  const originalUrl = input.originalUrl.trim();

  try {
    const parsed = new URL(originalUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { success: false, error: "http 또는 https URL만 사용할 수 있습니다." };
    }
  } catch {
    return { success: false, error: "올바른 URL 형식이 아닙니다." };
  }

  const slug =
    typeof input.slug === "string" && input.slug.trim()
      ? input.slug.trim()
      : undefined;

  if (slug && !CUSTOM_SLUG_PATTERN.test(slug)) {
    return {
      success: false,
      error:
        "슬러그는 3~32자의 영소문자, 숫자, 하이픈(-), 밑줄(_)만 사용할 수 있습니다.",
    };
  }

  const expiresAt =
    typeof input.expiresAt === "string" && input.expiresAt.trim()
      ? input.expiresAt.trim()
      : undefined;

  const clickLimit =
    typeof input.clickLimit === "string" && input.clickLimit.trim()
      ? input.clickLimit.trim()
      : undefined;

  return {
    success: true,
    data: {
      originalUrl,
      slug,
      expiresAt,
      clickLimit,
    },
  };
}
