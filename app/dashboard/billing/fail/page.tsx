import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BillingFailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const code =
    typeof params.code === "string" ? params.code : "UNKNOWN";
  const message =
    typeof params.message === "string"
      ? params.message
      : "카드 등록이 완료되지 않았습니다.";

  return (
    <div className="mx-auto max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>카드 등록 실패</CardTitle>
          <CardDescription>
            {message}
            {code !== "UNKNOWN" ? ` (${code})` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <ButtonLink href="/pricing">다시 시도</ButtonLink>
          <ButtonLink variant="outline" href="/dashboard">
            대시보드
          </ButtonLink>
        </CardContent>
      </Card>
    </div>
  );
}
