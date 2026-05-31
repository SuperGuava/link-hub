import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { link } from "@/db/schema";
import { formatDisplayDateTime } from "@/lib/format-datetime";
import { getShortLinkUrl } from "@/lib/site-url";

import type { LinkListItem } from "./types";

const DEFAULT_LIST_LIMIT = 50;

export async function listLinksByUser(
  userId: string,
  limit = DEFAULT_LIST_LIMIT,
): Promise<LinkListItem[]> {
  const rows = await db.query.link.findMany({
    where: eq(link.userId, userId),
    orderBy: desc(link.createdAt),
    limit,
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    shortUrl: getShortLinkUrl(row.slug),
    originalUrl: row.originalUrl,
    status: row.status,
    clickCount: row.clickCount,
    clickLimit: row.clickLimit,
    expiresAtLabel: formatDisplayDateTime(row.expiresAt),
    createdAtLabel: formatDisplayDateTime(row.createdAt),
  }));
}
