import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-xl space-y-6 text-center">
        <p className="text-sm font-medium text-primary">LinkHub</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          브랜드 도메인 기반 URL 단축 SaaS
        </h1>
        <p className="text-lg text-muted-foreground">
          카카오 로그인으로 시작하고, Free/Pro 플랜에 맞춰 링크를 관리하세요.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            카카오로 시작하기
          </Link>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            요금제 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
