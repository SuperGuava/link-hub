import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { link } from "@/db/schema";

export class DeactivateLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeactivateLinkError";
  }
}

export async function deactivateLink(userId: string, linkId: string) {
  const existing = await db.query.link.findFirst({
    where: and(eq(link.id, linkId), eq(link.userId, userId)),
  });

  if (!existing) {
    throw new DeactivateLinkError("링크를 찾을 수 없습니다.");
  }

  if (existing.status !== "active") {
    throw new DeactivateLinkError("이미 비활성화된 링크입니다.");
  }

  await db
    .update(link)
    .set({ status: "inactive", updatedAt: new Date() })
    .where(eq(link.id, linkId));
}
