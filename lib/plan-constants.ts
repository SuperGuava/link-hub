import type { PlanLimits, PlanType, PlanUserFields } from "@/types/plan";

/** DB 의존 없음 — Client Component에서도 import 가능 */
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    dailyCreateLimit: 5,
    activeLinkLimit: 30,
  },
  PRO: {
    dailyCreateLimit: null,
    activeLinkLimit: null,
  },
};

export function getEffectivePlanType(fields: PlanUserFields): PlanType {
  const rawPlan = fields.planType?.toUpperCase();

  if (rawPlan === "PRO") {
    if (fields.planExpiresAt) {
      const expiresAt = new Date(fields.planExpiresAt);
      if (expiresAt.getTime() <= Date.now()) {
        return "FREE";
      }
    }
    return "PRO";
  }

  return "FREE";
}
