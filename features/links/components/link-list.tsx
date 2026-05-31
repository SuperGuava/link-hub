import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DeactivateLinkButton } from "@/features/links/components/deactivate-link-button";
import { LinkActionButtons } from "@/features/links/components/link-action-buttons";
import type { LinkListItem } from "@/server/links/types";

type LinkListProps = {
  links: LinkListItem[];
};

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "active") {
    return "default";
  }
  if (status === "expired") {
    return "outline";
  }
  return "secondary";
}

function statusLabel(status: string) {
  if (status === "active") {
    return "활성";
  }
  if (status === "expired") {
    return "만료";
  }
  if (status === "inactive") {
    return "비활성";
  }
  return status;
}

function formatClickCount(item: LinkListItem) {
  if (item.clickLimit !== null) {
    return `${item.clickCount} / ${item.clickLimit}`;
  }
  return String(item.clickCount);
}

function LinkListItemRow({ item }: { item: LinkListItem }) {
  const isActive = item.status === "active";

  return (
    <div className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {isActive ? (
                <a
                  href={item.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm font-medium text-primary underline-offset-4 hover:underline"
                  title={item.shortUrl}
                >
                  {item.shortUrl}
                </a>
              ) : (
                <code className="truncate text-sm font-medium text-muted-foreground">
                  {item.shortUrl}
                </code>
              )}
              <Badge variant={statusVariant(item.status)}>
                {statusLabel(item.status)}
              </Badge>
            </div>

            <LinkActionButtons
              shortUrl={item.shortUrl}
              originalUrl={item.originalUrl}
              canOpen={isActive}
            />
          </div>

          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-60" />
            {isActive ? (
              <a
                href={item.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 truncate hover:text-foreground hover:underline"
                title={item.originalUrl}
              >
                {item.originalUrl}
              </a>
            ) : (
              <p className="min-w-0 truncate" title={item.originalUrl}>
                {item.originalUrl}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>클릭 {formatClickCount(item)}</span>
            <span>만료 {item.expiresAtLabel}</span>
            <span>생성 {item.createdAtLabel}</span>
          </div>
        </div>

        {isActive ? <DeactivateLinkButton linkId={item.id} /> : null}
      </div>
    </div>
  );
}

export function LinkList({ links }: LinkListProps) {
  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
        아직 생성된 링크가 없습니다. 위에서 첫 링크를 만들어 보세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((item) => (
        <LinkListItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}
