export type PlanType = "FREE" | "PRO";

export type PlanLimits = {
  dailyCreateLimit: number | null;
  activeLinkLimit: number | null;
};

export type PlanEvaluation = {
  planType: PlanType;
  dailyCreated: number;
  activeLinks: number;
  remainingDailyCreates: number | null;
  remainingActiveLinks: number | null;
  isNearLimit: boolean;
};

export type CanCreateLinkResult =
  | { allowed: true }
  | { allowed: false; reason: string };

export type PlanUserFields = {
  planType?: string | null;
  planExpiresAt?: Date | string | null;
};
