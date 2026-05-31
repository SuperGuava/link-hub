import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KakaoSignInButton } from "@/features/auth/components/kakao-sign-in-button";
import { getSession } from "@/server/auth/session";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    callbackUrl?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/dashboard";
  const errorMessage =
    params.error === "auth"
      ? "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."
      : params.error
        ? "로그인 중 문제가 발생했습니다."
        : null;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <p className="text-sm font-medium text-primary">LinkHub</p>
          <CardTitle className="text-2xl">브랜드 링크를 더 빠르게</CardTitle>
          <CardDescription>
            카카오 계정으로 로그인하고 단축 링크 관리를 시작하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <KakaoSignInButton callbackUrl={callbackUrl} />

          <p className="text-center text-xs text-muted-foreground">
            로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4">
              홈으로 돌아가기
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
