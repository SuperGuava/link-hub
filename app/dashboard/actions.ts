"use server";

import { revalidatePath } from "next/cache";

import { parseCreateLinkInput } from "@/features/links/schemas";
import {
  CreateLinkError,
  createLink,
} from "@/server/links/create-link";
import {
  DeactivateLinkError,
  deactivateLink,
} from "@/server/links/deactivate-link";
import { getSession } from "@/server/auth/session";

export type CreateLinkActionState = {
  error?: string;
  success?: {
    shortUrl: string;
    slug: string;
  };
};

export type DeactivateLinkActionState = {
  error?: string;
  success?: boolean;
};

export async function createLinkAction(
  _prevState: CreateLinkActionState,
  formData: FormData,
): Promise<CreateLinkActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "로그인이 필요합니다." };
  }

  const parsed = parseCreateLinkInput({
    originalUrl: formData.get("originalUrl"),
    slug: formData.get("slug"),
    expiresAt: formData.get("expiresAt"),
    clickLimit: formData.get("clickLimit"),
  });

  if (!parsed.success) {
    return { error: parsed.error };
  }

  const { originalUrl, slug, expiresAt, clickLimit } = parsed.data;

  let parsedExpiresAt: Date | null = null;
  if (expiresAt) {
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) {
      return { error: "만료일 형식이 올바르지 않습니다." };
    }
    parsedExpiresAt = date;
  }

  let parsedClickLimit: number | null = null;
  if (clickLimit) {
    const value = Number(clickLimit);
    if (!Number.isInteger(value) || value <= 0) {
      return { error: "클릭 제한은 1 이상의 정수여야 합니다." };
    }
    parsedClickLimit = value;
  }

  try {
    const created = await createLink({
      userId: session.user.id,
      originalUrl,
      slug,
      expiresAt: parsedExpiresAt,
      clickLimit: parsedClickLimit,
    });

    revalidatePath("/dashboard");

    return {
      success: {
        shortUrl: created.shortUrl,
        slug: created.slug,
      },
    };
  } catch (error) {
    if (error instanceof CreateLinkError) {
      return { error: error.message };
    }
    return { error: "링크 생성 중 오류가 발생했습니다." };
  }
}

export async function deactivateLinkAction(
  _prevState: DeactivateLinkActionState,
  formData: FormData,
): Promise<DeactivateLinkActionState> {
  const session = await getSession();
  if (!session) {
    return { error: "로그인이 필요합니다." };
  }

  const linkId = formData.get("linkId");
  if (typeof linkId !== "string" || !linkId) {
    return { error: "링크 ID가 필요합니다." };
  }

  try {
    await deactivateLink(session.user.id, linkId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof DeactivateLinkError) {
      return { error: error.message };
    }
    return { error: "링크 비활성화 중 오류가 발생했습니다." };
  }
}
