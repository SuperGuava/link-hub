import Link from "next/link";

type LinkUnavailableProps = {
  message: string;
};

export function LinkUnavailable({ message }: LinkUnavailableProps) {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">LinkHub</p>
        <h1 className="mt-2 text-xl font-semibold">링크를 열 수 없습니다</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-primary underline underline-offset-4"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
