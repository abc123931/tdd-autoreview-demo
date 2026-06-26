export type FreeeAccessInput = {
  isPaidPlan: boolean;
  withinTrial: boolean;
  hasPaidContract: boolean;
};

/**
 * デシジョンテーブル技法のデモ。
 * 複数の boolean 条件で結果が決まるロジックは、全組み合わせを表で網羅する
 * （src/featureAccess.test.ts に 2^3=8 行の表テストがある）。
 *
 * | isPaidPlan | withinTrial | hasPaidContract | canUseFreee |
 * |------------|-------------|-----------------|-------------|
 * | true       | *           | *               | true        |
 * | false      | true        | false           | true        |
 * | false      | true        | true            | false       |
 * | false      | false       | *               | false       |
 */
export function canUseFreee({
  isPaidPlan,
  withinTrial,
  hasPaidContract,
}: FreeeAccessInput): boolean {
  if (isPaidPlan) {
    return true;
  }
  return withinTrial && !hasPaidContract;
}
