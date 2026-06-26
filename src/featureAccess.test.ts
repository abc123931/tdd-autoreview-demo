import { describe, expect, it } from "vitest";
import { canUseFreee } from "./featureAccess";

/**
 * デシジョンテーブル技法: 3 つの boolean 条件 → 2^3 = 8 通りを全網羅。
 * 表を「データ」として持ち、テストで全行を回す。
 */
const table: {
  isPaidPlan: boolean;
  withinTrial: boolean;
  hasPaidContract: boolean;
  expected: boolean;
}[] = [
  {
    isPaidPlan: true,
    withinTrial: true,
    hasPaidContract: true,
    expected: true,
  },
  {
    isPaidPlan: true,
    withinTrial: true,
    hasPaidContract: false,
    expected: true,
  },
  {
    isPaidPlan: true,
    withinTrial: false,
    hasPaidContract: true,
    expected: true,
  },
  {
    isPaidPlan: true,
    withinTrial: false,
    hasPaidContract: false,
    expected: true,
  },
  {
    isPaidPlan: false,
    withinTrial: true,
    hasPaidContract: false,
    expected: true,
  },
  {
    isPaidPlan: false,
    withinTrial: true,
    hasPaidContract: true,
    expected: false,
  },
  {
    isPaidPlan: false,
    withinTrial: false,
    hasPaidContract: true,
    expected: false,
  },
  {
    isPaidPlan: false,
    withinTrial: false,
    hasPaidContract: false,
    expected: false,
  },
];

describe("canUseFreee（デシジョンテーブル全網羅）", () => {
  for (const row of table) {
    const label = `paid=${row.isPaidPlan} trial=${row.withinTrial} paidContract=${row.hasPaidContract} → ${row.expected}`;
    it(label, () => {
      expect(
        canUseFreee({
          isPaidPlan: row.isPaidPlan,
          withinTrial: row.withinTrial,
          hasPaidContract: row.hasPaidContract,
        })
      ).toBe(row.expected);
    });
  }
});
