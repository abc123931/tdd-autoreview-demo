export type Plan = "free" | "starter" | "team";

/** プラン別の月間トークン上限（換算後）。 */
const PLAN_LIMITS: Record<Plan, number> = {
  free: 300_000,
  starter: 1_000_000,
  team: 4_000_000,
};

export function resolvePlanLimit(plan: Plan): number {
  return PLAN_LIMITS[plan];
}

/**
 * 課金/上限判定のデモ。plan を必ず経由して上限を解く。
 * .cursor/BUGBOT.md の「課金・上限判定」が守らせたい形。
 */
export function isWithinLimit(plan: Plan, usedTokens: number): boolean {
  if (usedTokens < 0) {
    throw new Error("usedTokens must be >= 0");
  }
  return usedTokens <= resolvePlanLimit(plan);
}
