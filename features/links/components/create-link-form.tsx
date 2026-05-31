"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createLinkAction,
  type CreateLinkActionState,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkActionButtons } from "@/features/links/components/link-action-buttons";
import { PLAN_LIMITS } from "@/lib/plan-constants";
import type { PlanType } from "@/types/plan";

type CreateLinkFormProps = {
  planType: PlanType;
  canCreate: boolean;
  disabledReason?: string;
};

const initialState: CreateLinkActionState = {};

export function CreateLinkForm({
  planType,
  canCreate,
  disabledReason,
}: CreateLinkFormProps) {
  const [state, formAction, isPending] = useActionState(
    createLinkAction,
    initialState,
  );

  const isPro = planType === "PRO";
  const limits = PLAN_LIMITS[planType];

  return (
    <Card>
      <CardHeader>
        <CardTitle>링크 만들기</CardTitle>
        <CardDescription>
          {isPro
            ? "원본 URL을 입력하고 Pro 옵션(슬러그, 만료일, 클릭 제한)을 설정할 수 있습니다."
            : `Free 플랜은 하루 ${limits.dailyCreateLimit}개, 활성 ${limits.activeLinkLimit}개까지 생성할 수 있습니다.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canCreate ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {disabledReason ?? "현재 플랜 한도로는 링크를 더 만들 수 없습니다."}{" "}
            <Link href="/pricing" className="font-medium underline">
              Pro 업그레이드
            </Link>
          </div>
        ) : null}

        {state.error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">링크가 생성되었습니다.</p>
            <code className="mt-2 block truncate rounded-md bg-muted px-2 py-1 text-xs">
              {state.success.shortUrl}
            </code>
            <LinkActionButtons
              className="mt-3"
              shortUrl={state.success.shortUrl}
              canOpen
            />
          </div>
        ) : null}

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="originalUrl" className="text-sm font-medium">
              원본 URL
            </label>
            <Input
              id="originalUrl"
              name="originalUrl"
              type="url"
              placeholder="https://example.com/page"
              required
              disabled={!canCreate || isPending}
            />
          </div>

          {isPro ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="slug" className="text-sm font-medium">
                  커스텀 슬러그 (선택)
                </label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="my-campaign"
                  disabled={!canCreate || isPending}
                  pattern="[a-z0-9_-]{3,32}"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="expiresAt" className="text-sm font-medium">
                  만료일 (선택)
                </label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="datetime-local"
                  disabled={!canCreate || isPending}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="clickLimit" className="text-sm font-medium">
                  클릭 제한 (선택)
                </label>
                <Input
                  id="clickLimit"
                  name="clickLimit"
                  type="number"
                  min={1}
                  placeholder="100"
                  disabled={!canCreate || isPending}
                />
              </div>
            </div>
          ) : null}

          <Button type="submit" disabled={!canCreate || isPending}>
            {isPending ? "생성 중..." : "단축 링크 만들기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
