"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";

type KakaoSignInButtonProps = {
  callbackUrl?: string;
};

export function KakaoSignInButton({
  callbackUrl = "/dashboard",
}: KakaoSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignIn() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn.social({
        provider: "kakao",
        callbackURL: callbackUrl,
      });

      if (result.error) {
        setErrorMessage(
          result.error.message ??
            "카카오 로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } catch {
      setErrorMessage(
        "카카오 로그인 중 오류가 발생했습니다. DB 마이그레이션(pnpm db:push) 여부를 확인해 주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <Button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className="h-11 w-full bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90"
      >
        {isLoading ? "카카오 로그인 중..." : "카카오로 시작하기"}
      </Button>
    </div>
  );
}
