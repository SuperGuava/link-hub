"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ResumeSubscriptionButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleResume() {
    startTransition(async () => {
      const response = await fetch("/dashboard/subscription/resume", {
        method: "POST",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        window.alert(body.error ?? "취소 철회에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button type="button" variant="outline" disabled={pending} onClick={handleResume}>
      {pending ? "처리 중…" : "취소 철회"}
    </Button>
  );
}
