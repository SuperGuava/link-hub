"use client";

import { useActionState } from "react";

import {
  deactivateLinkAction,
  type DeactivateLinkActionState,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

type DeactivateLinkButtonProps = {
  linkId: string;
};

const initialState: DeactivateLinkActionState = {};

export function DeactivateLinkButton({ linkId }: DeactivateLinkButtonProps) {
  const [state, formAction, isPending] = useActionState(
    deactivateLinkAction,
    initialState,
  );

  return (
    <div className="shrink-0">
      <form action={formAction}>
        <input type="hidden" name="linkId" value={linkId} />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={(event) => {
            if (
              !window.confirm(
                "이 링크를 비활성화할까요? 단축 URL 접근이 중단됩니다.",
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          {isPending ? "처리 중..." : "비활성화"}
        </Button>
      </form>
      {state.error ? (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      ) : null}
    </div>
  );
}
