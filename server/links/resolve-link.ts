import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { link } from "@/db/schema";

export type ResolveLinkResult =
  | { ok: true; originalUrl: string }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "unavailable"; message: string };

function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) {
    return false;
  }
  return expiresAt.getTime() <= Date.now();
}

function isClickLimitReached(
  clickCount: number,
  clickLimit: number | null,
): boolean {
  return clickLimit !== null && clickCount >= clickLimit;
}

export async function resolveLinkForRedirect(
  slug: string,
): Promise<ResolveLinkResult> {
  const row = await db.query.link.findFirst({
    where: eq(link.slug, slug),
  });

  if (!row) {
    return { ok: false, reason: "not_found" };
  }

  if (row.status === "inactive") {
    return {
      ok: false,
      reason: "unavailable",
      message: "비활성화된 링크입니다. 관리자에게 문의해 주세요.",
    };
  }

  if (row.status === "expired" || isExpired(row.expiresAt)) {
    if (row.status === "active" && isExpired(row.expiresAt)) {
      await db
        .update(link)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(link.id, row.id));
    }

    return {
      ok: false,
      reason: "unavailable",
      message: "만료된 링크입니다.",
    };
  }

  if (row.status !== "active") {
    return {
      ok: false,
      reason: "unavailable",
      message: "이 링크는 더 이상 사용할 수 없습니다.",
    };
  }

  if (isClickLimitReached(row.clickCount, row.clickLimit)) {
    return {
      ok: false,
      reason: "unavailable",
      message: "클릭 제한에 도달한 링크입니다.",
    };
  }

  await db
    .update(link)
    .set({
      clickCount: row.clickCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(link.id, row.id));

  return { ok: true, originalUrl: row.originalUrl };
}
