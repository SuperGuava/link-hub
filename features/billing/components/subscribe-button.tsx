"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

import { Button } from "@/components/ui/button";

type SubscribeButtonProps = {
  clientKey: string;
  customerEmail: string;
  customerName: string;
  className?: string;
};

export function SubscribeButton({
  clientKey,
  customerEmail,
  customerName,
  className,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const keyResponse = await fetch("/api/billing/customer-key");

      if (!keyResponse.ok) {
        throw new Error("결제 준비에 실패했습니다. 로그인 상태를 확인해주세요.");
      }

      const { customerKey } = (await keyResponse.json()) as {
        customerKey: string;
      };

      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey });

      const origin = window.location.origin;

      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: `${origin}/dashboard/billing/success`,
        failUrl: `${origin}/dashboard/billing/fail`,
        customerEmail,
        customerName,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "구독 시작 중 오류가 발생했습니다.";
      setError(message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className={className}
        disabled={loading}
        onClick={handleSubscribe}
      >
        {loading ? "결제창 여는 중…" : "Pro 구독 시작"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
