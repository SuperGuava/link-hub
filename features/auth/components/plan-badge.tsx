import { Badge } from "@/components/ui/badge";
import type { PlanType } from "@/types/plan";

type PlanBadgeProps = {
  planType: PlanType;
};

export function PlanBadge({ planType }: PlanBadgeProps) {
  if (planType === "PRO") {
    return <Badge variant="pro">Pro</Badge>;
  }

  return <Badge variant="free">Free</Badge>;
}
