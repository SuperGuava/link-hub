import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { link, user } from "@/db/schema";
import { canCreateLink } from "@/lib/plan";
import { getEffectivePlanType } from "@/lib/plan-constants";
import { generateSlug, isValidCustomSlug } from "@/lib/slug";
import { getShortLinkUrl } from "@/lib/site-url";

import type { CreateLinkParams, CreatedLink } from "./types";

const MAX_SLUG_RETRIES = 5;

export class CreateLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreateLinkError";
  }
}

async function resolveSlug(
  planType: "FREE" | "PRO",
  requestedSlug?: string,
): Promise<string> {
  if (planType === "FREE") {
    if (requestedSlug) {
      throw new CreateLinkError("Free 플랜에서는 커스텀 슬러그를 사용할 수 없습니다.");
    }

    for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
      const candidate = generateSlug();
      const existing = await db.query.link.findFirst({
        where: eq(link.slug, candidate),
      });
      if (!existing) {
        return candidate;
      }
    }

    throw new CreateLinkError("슬러그를 생성하지 못했습니다. 다시 시도해 주세요.");
  }

  if (!requestedSlug) {
    for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
      const candidate = generateSlug();
      const existing = await db.query.link.findFirst({
        where: eq(link.slug, candidate),
      });
      if (!existing) {
        return candidate;
      }
    }
    throw new CreateLinkError("슬러그를 생성하지 못했습니다. 다시 시도해 주세요.");
  }

  if (!isValidCustomSlug(requestedSlug)) {
    throw new CreateLinkError(
      "슬러그는 3~32자의 영소문자, 숫자, 하이픈(-), 밑줄(_)만 사용할 수 있습니다.",
    );
  }

  const existing = await db.query.link.findFirst({
    where: eq(link.slug, requestedSlug),
  });
  if (existing) {
    throw new CreateLinkError("이미 사용 중인 슬러그입니다.");
  }

  return requestedSlug;
}

export async function createLink(
  params: CreateLinkParams,
): Promise<CreatedLink> {
  const permission = await canCreateLink(params.userId);
  if (!permission.allowed) {
    throw new CreateLinkError(permission.reason);
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, params.userId),
  });

  const planType = getEffectivePlanType({
    planType: dbUser?.planType,
    planExpiresAt: dbUser?.planExpiresAt,
  });

  const slug = await resolveSlug(planType, params.slug?.trim() || undefined);

  const [created] = await db
    .insert(link)
    .values({
      userId: params.userId,
      originalUrl: params.originalUrl,
      slug,
      expiresAt: planType === "PRO" ? params.expiresAt ?? null : null,
      clickLimit: planType === "PRO" ? params.clickLimit ?? null : null,
      status: "active",
    })
    .returning({
      id: link.id,
      slug: link.slug,
      originalUrl: link.originalUrl,
    });

  if (!created) {
    throw new CreateLinkError("링크를 저장하지 못했습니다.");
  }

  return {
    id: created.id,
    slug: created.slug,
    shortUrl: getShortLinkUrl(created.slug),
    originalUrl: created.originalUrl,
  };
}
