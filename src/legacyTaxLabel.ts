/**
 * 仕様書のない「レガシー」関数のデモ（As-Is テストの題材）。
 *
 * 現挙動（あえて素朴なまま）:
 * - 税率 8% 固定
 * - 小数は切り捨て（Math.floor）
 * - 負値もそのまま計算する（ガードしていない）
 *
 * これらが「正しい仕様」かどうかは未判断。まず characterization テストで
 * 現挙動を固定し（src/legacyTaxLabel.test.ts）、安全網ができてから初めて
 * リファクタ・仕様変更に着手する。
 */
export function legacyTaxLabel(price: number): string {
  const withTax = Math.floor(price * 1.08);
  return `¥${withTax}`;
}
