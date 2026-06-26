import { describe, expect, it } from "vitest";
import { legacyTaxLabel } from "./legacyTaxLabel";

/**
 * As-Is（characterization / ゴールデンマスター）テスト。
 * 「正しい仕様」ではなく「現在の事実」を写し取る。これがある状態で初めて
 * 安全にリファクタできる。仕様の良し悪しの議論は別 PR で。
 */
describe("legacyTaxLabel（現挙動の固定）", () => {
  it("整数: 8% 加算（100 → ¥108）", () => {
    expect(legacyTaxLabel(100)).toBe("¥108");
  });

  it("0 は ¥0", () => {
    expect(legacyTaxLabel(0)).toBe("¥0");
  });

  it("As-Is: 小数は切り捨て（105 → 113.4 → ¥113）", () => {
    expect(legacyTaxLabel(105)).toBe("¥113");
  });

  it("As-Is: 負値もガードせず計算（-105 → floor(-113.4)=-114）", () => {
    expect(legacyTaxLabel(-105)).toBe("¥-114");
  });
});
