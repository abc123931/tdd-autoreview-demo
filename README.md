# tdd-autoreview-demo

**厳格TDD ＋ 自動コードレビュー（Bugbot / CI）** の開発ワークフローを示す模範デモ。
他プロジェクトの雛形となることを目的にしている。実コードは最小限だが、
**ルール・レビュー構成・テスト規律**はそのまま流用できる完成度で揃えている。

- 厳格TDDの掟: [`docs/TDD.md`](docs/TDD.md)
- ロール分離（別血筋モデル）: [`docs/ROLES.md`](docs/ROLES.md)
- 他プロジェクトへの移植: [`docs/ADOPTION.md`](docs/ADOPTION.md)

## 何を示すデモか

「人間レビュアーが少ない / いない」状況で、**テストとAIレビューに信頼を担保させる**
ワークフローの型を示す。

```
① 書いてる最中      ② PR作成/push                ③ 本番昇格
   (ローカル)           (GitHubで自動)                (人間)
   Cursor + tdd.mdc     CI(ブロック) + Bugbot(助言)     人間が最終判断
   = Iron Law強制        = 決定論ゲート + 別血筋レビュー   = 不可逆領域
```

## 踏襲している概念（チェックリスト）

| 概念 | 実装箇所 |
|---|---|
| **厳格TDD / Iron Law（RED必須）** | `docs/TDD.md` + `.cursor/rules/tdd.mdc`（実装エージェントに強制） |
| **退化（fake it→三角測量→一般化）** | `docs/TDD.md` の実演（`tokenLimit` の構築過程） |
| **ロール分離（Evaluatorは別血筋モデル）** | `docs/ROLES.md` + Bugbot=実装者と別血筋 |
| **境界値分析** | `src/tokenLimit.test.ts`（上限ちょうど / +1） |
| **同値分割** | `src/tokenLimit.test.ts`（上限以下 / 超過 / 不正） |
| **デシジョンテーブル** | `src/featureAccess.test.ts`（2³=8 全網羅） |
| **As-Isテスト（characterization）** | `src/legacyTaxLabel.test.ts`（現挙動の固定） |
| **ミューテーションテスト** | Stryker（`npm run test:mutation`・現在 score 100%） |
| **多層防御 / 重大度とブロックの分離** | CI=ブロック / Bugbot=助言（`.cursor/BUGBOT.md`） |

## 構成

| パス | 役割 |
|---|---|
| `.github/workflows/ci.yml` | PR/pushで lint・test・typecheck（**唯一のブロッカー**） |
| `.github/workflows/mutation.yml` | ミューテーションテスト（週次/手動・非ブロッキング） |
| `.cursor/rules/tdd.mdc` | 実装エージェントに **Iron Law** を強制 |
| `.cursor/rules/review.mdc` | エディタ内エージェントへ BUGBOT.md を参照させる |
| `.cursor/BUGBOT.md` | Bugbot が読むレビュー観点（**正本**） |
| `docs/TDD.md` | 厳格TDDの掟（Iron Law/退化/技法/As-Is/ミューテーション） |
| `docs/ROLES.md` | ロール分離・別血筋モデル |
| `docs/ADOPTION.md` | 他プロジェクトへの移植手順 |
| `src/*.ts` / `src/*.test.ts` | 技法別の最小デモ（下表） |

### src の題材（最小コードで各技法を実演）

| ファイル | 示す技法 |
|---|---|
| `tokenLimit.ts` | 境界値 + 同値分割 + 退化の実演対象 |
| `featureAccess.ts` | デシジョンテーブル（全組み合わせ網羅） |
| `legacyTaxLabel.ts` | As-Is / characterization |
| `multiTenant.ts` | テナント分離（workspaceId 必須）+ ミューテーションで穴を発見・除去 |

## ローカルでの回し方

```bash
npm install
npm run test        # 監視モード（TDD: RED→GREEN→REFACTOR）
npm run test:run    # 1回実行（CIと同じ）
npm run lint
npm run typecheck
npm run test:mutation   # ミューテーション（テストの健全性を測る）
```

## ミューテーションテストの実演（穴を見つけて塞ぐ）

初回の mutation score は 91.67% で、**2種類の生存ミュータント＝テストの穴**が出た:

- `tokenLimit`: エラーメッセージを `""` に改変しても検出できない
  （テストが `.toThrow()` だけでメッセージ未検証）
- `multiTenant`: `toLowerCase`→`toUpperCase` を検出できない
  （テストデータが日本語で大小の差が出ない）

これらを潰すテストを追加（メッセージ検証 / ASCII 大小混在）し、**score 100%** に。
これが「カバレッジでは測れないテストの健全性」をミューテーションで担保する流れ。

## Bugbot の有効化（GitHub）

1. `cursor.com/dashboard/integrations` で GitHub を接続しリポジトリを許可
2. `cursor.com/dashboard/bugbot` で対象リポジトリを有効化
   （観測フェーズは "Run Once Per PR" 推奨・Autofix Off・Learn Rules Off）
3. PR作成で自動レビュー / または PR に `bugbot run` とコメントで手動実行

詳細・移植は [`docs/ADOPTION.md`](docs/ADOPTION.md)。
