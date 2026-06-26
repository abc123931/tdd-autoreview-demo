# WALKTHROUGH — `tokenLimit` を退化で組み上げる全段階

`docs/TDD.md` 第3章「退化（fake it → 三角測量 → 一般化）」の実演を、
`src/tokenLimit.ts` を題材に最初から最後まで追える形で記録する。
各段階は **RED（失敗テストを書いて赤を目視）→ GREEN（最小実装）→ REFACTOR** の順で進む。
コミットに残すなら `red:` / `green:` / `refactor:` プレフィックスで小刻みに積む。

> 目的: 「テストが実装を駆動している」ことを、固定値から一般化へ追い込まれる過程で示す。
> 最終形は `src/tokenLimit.ts` / `src/tokenLimit.test.ts` を参照。

---

## 段階0: 対象の決め方（同値分割で先にクラスを切る）

`isWithinLimit(plan, usedTokens)` の入力を、振る舞いが変わるクラスに分ける。

- 上限以下（許可）
- 上限超過（ブロック）
- 不正（負値＝異常系）

境界値分析で、各クラスの**境界そのものと境界±1**を狙う（上限 `300_000` / `300_001`）。

---

## 段階1: RED — 上限ちょうどは許可

最初の1本。まだ実装は存在しないので**確実に赤くなる**。

```ts
// RED 1
expect(isWithinLimit("free", 300_000)).toBe(true);
```

`npm run test:run` で赤を目視 → `commit "red: free 上限ちょうどは許可"`。

## 段階1: GREEN（fake it）— とりあえず固定値

通すだけの最小実装。きれいさは後回し。

```ts
export const isWithinLimit = () => true;
```

緑を確認 → `commit "green: fake it で true を返す"`。

---

## 段階2: RED — 上限+1 はブロック（三角測量）

固定値 `true` では**通らない**2本目を足し、一般化を強制する。

```ts
// RED 2
expect(isWithinLimit("free", 300_001)).toBe(false);
```

赤を目視 → `commit "red: free 上限+1 はブロック"`。

## 段階2: GREEN（一般化）— 上限と比較する実装へ追い込まれる

固定値では二者を同時に満たせないため、上限比較の実装に一般化される。
マジックナンバー直書きを避け、`resolvePlanLimit(plan)` を必ず経由する
（`.cursor/BUGBOT.md` の「課金・上限判定」が守らせたい形）。

```ts
const PLAN_LIMITS: Record<Plan, number> = {
  free: 300_000,
  starter: 1_000_000,
  team: 4_000_000,
};
export const resolvePlanLimit = (plan: Plan) => PLAN_LIMITS[plan];
export const isWithinLimit = (plan: Plan, usedTokens: number) =>
  usedTokens <= resolvePlanLimit(plan);
```

緑を確認 → `commit "green: 上限比較に一般化"`。

---

## 段階3: RED — 負値は異常系としてエラー

3つ目の同値クラス（不正）を突く。現状の実装は負値でも `true` を返すため赤になる。

```ts
// RED 3
expect(() => isWithinLimit("free", -1)).toThrow("usedTokens must be >= 0");
```

赤を目視 → `commit "red: 負の使用量はエラー"`。

## 段階3: GREEN — ガード追加

```ts
export function isWithinLimit(plan: Plan, usedTokens: number): boolean {
  if (usedTokens < 0) {
    throw new Error("usedTokens must be >= 0");
  }
  return usedTokens <= resolvePlanLimit(plan);
}
```

緑を確認 → `commit "green: 負値ガードを追加"`。

---

## 段階4: REFACTOR — 緑を保って整える

重複除去・命名・型の整理を、テストを緑に保ったまま行う（振る舞いは変えない）。
ここでは `Plan` 型・`PLAN_LIMITS` の定数化・`resolvePlanLimit` の抽出が該当する。

緑を確認 → `commit "refactor: 型と定数を整理"`。

---

## 段階5: ミューテーションで「テストの穴」を塞ぐ（RED から）

カバレッジ100%でも甘いアサーションは残る。`npm run test:mutation`（Stryker）で測ると、
初回は **生存ミュータント**が出た。

- `tokenLimit`: エラーメッセージを `""` に改変しても検出できない
  （テストが `.toThrow()` だけでメッセージ未検証）。

これは「テストの穴」なので、穴を**先に赤くする**テストへ更新してから埋める。

```ts
// メッセージまでアサートしないと、メッセージ改変ミュータントが生き残る
expect(() => isWithinLimit("free", -1)).toThrow("usedTokens must be >= 0");
```

メッセージ検証を加えてミュータントを殺し、`commit "green: エラーメッセージ検証で生存ミュータントを除去"`。
（`multiTenant` 側の `toLowerCase`→`toUpperCase` 生存も同様にASCII大小混在のデータで殺す。）

---

## まとめ（追える証跡）

| 段階 | 種別 | 内容 |
|---|---|---|
| 1 | red→green(fake it) | 上限ちょうど許可 / 固定値 `true` |
| 2 | red→green(一般化) | 上限+1 ブロック / `resolvePlanLimit` 比較へ |
| 3 | red→green | 負値エラー / ガード追加 |
| 4 | refactor | 型・定数・抽出の整理 |
| 5 | red→green | ミューテーション生存をテスト追加で除去 |

この順序が「固定値 → 三角測量で一般化 → 異常系 → リファクタ → テストの健全性」という
退化ドリブンの一連の流れ。最終的な到達点は `src/tokenLimit.ts` を参照。
