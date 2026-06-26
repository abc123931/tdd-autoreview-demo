import { describe, expect, it } from "vitest";
import { isWithinLimit, resolvePlanLimit } from "./tokenLimit";

describe("resolvePlanLimit", () => {
  it("プランごとの上限を返す", () => {
    expect(resolvePlanLimit("free")).toBe(300_000);
    expect(resolvePlanLimit("starter")).toBe(1_000_000);
    expect(resolvePlanLimit("team")).toBe(4_000_000);
  });
});

describe("isWithinLimit", () => {
  // 同値分割: 「上限以下」「上限超過」「不正(負値)」の 3 クラス。
  // 境界値分析: 境界 300_000 と境界+1 の 300_001 を突く。
  it("境界値: 上限ちょうど(300_000)は許可", () => {
    expect(isWithinLimit("free", 300_000)).toBe(true);
  });

  it("境界値: 上限+1(300_001)はブロック", () => {
    expect(isWithinLimit("free", 300_001)).toBe(false);
  });

  it("同値クラス(上限以下): 0 は許可", () => {
    expect(isWithinLimit("free", 0)).toBe(true);
  });

  it("同値クラス(不正): 負の使用量はエラー（メッセージも検証）", () => {
    // メッセージまでアサートしないと、メッセージ改変ミュータントが生き残る
    expect(() => isWithinLimit("free", -1)).toThrow("usedTokens must be >= 0");
  });
});
