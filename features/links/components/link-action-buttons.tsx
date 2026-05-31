"use client";

import { ExternalLink } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/features/links/components/copy-button";
import { cn } from "@/lib/utils";

type LinkActionButtonsProps = {
  shortUrl: string;
  originalUrl?: string;
  canOpen?: boolean;
  className?: string;
};

export function LinkActionButtons({
  shortUrl,
  originalUrl,
  canOpen = true,
  className,
}: LinkActionButtonsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <CopyButton value={shortUrl} />
      {canOpen ? (
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="새 탭에서 단축 링크 열기"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
        >
          <ExternalLink className="size-3.5" />
          바로가기
        </a>
      ) : (
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "pointer-events-none gap-1 opacity-50",
          )}
          title="비활성 링크는 열 수 없습니다"
        >
          <ExternalLink className="size-3.5" />
          바로가기
        </span>
      )}
      {originalUrl && canOpen ? (
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="원본 URL 새 탭에서 열기"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground",
          )}
        >
          원본
        </a>
      ) : null}
    </div>
  );
}
