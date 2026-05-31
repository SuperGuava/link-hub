"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type CancelSubscriptionButtonProps = {
  periodEndLabel: string;
};

export function CancelSubscriptionButton({
  periodEndLabel,
}: CancelSubscriptionButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    const confirmed = window.confirm(
      `구독을 취소하시겠습니까?\n${periodEndLabel}까지 Pro를 이용할 수 있습니다.`,
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/dashboard/subscription/cancel", {
        method: "POST",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        window.alert(body.error ?? "구독 취소에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={pending}
      onClick={handleCancel}
    >
      {pending ? "처리 중…" : "구독 취소"}
    </Button>
  );
}
