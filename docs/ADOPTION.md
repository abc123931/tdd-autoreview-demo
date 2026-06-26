# 他プロジェクトへの移植手順

このワークフローを既存リポジトリに導入する手順。コピーするのは主に
**CIワークフロー**と**レビュー観点ファイル**の2つ。

## 1. CI（ブロッキングな土台）を入れる

`.github/workflows/ci.yml` をコピーし、自分のプロジェクトのコマンドに合わせる。

- パッケージマネージャ: `npm ci` → yarn なら `yarn install --frozen-lockfile`
- 監視対象ブランチ: `branches: [main]` → 運用に合わせて `develop` 等を追加
- 実行するチェック: `lint` / `test:run` / `typecheck` を自分のスクリプト名に

> 重要: **マージをブロックするのは CI だけ**。GitHub の Branch protection で
> この CI を required にする。AIレビューは required にしない。

### typecheck の注意（モノレポ / Next.js 等）

`tsc --noEmit` はテストファイルも型チェックする。フレームワークのビルド
（例: `next build`）がテストを型チェック対象外にしている場合、
`tsc --noEmit` を入れると**既存のテスト型エラーが顕在化**することがある。
その場合の方針は2つ:

- A: テストの型エラーを直して `tsc --noEmit` を完全グリーンに（テストも型安全に・推奨）
- B: typecheck を本番コードに絞る（`tsconfig` の include を調整）

## 2. レビュー観点（`.cursor/BUGBOT.md`）を入れる

`.cursor/BUGBOT.md` をコピーし、**そのプロジェクト固有の事故ポイント**に書き換える。
ポイントは「**本番事故級だけを Important に**」「NG/OK ペアで具体的に」。

書く内容の型:

- Important の定義（本番を壊す / データ越境 / ロールバック阻害のみ）
- Nit 上限（例: 最大5件）
- 報告しない（lint/format/型＝CIが見る、生成物、lockfile）
- 常にチェック（ドメイン固有の NG/OK ペア）
- 検証バー（file:line の根拠必須）
- 再レビュー収束（2回目以降は Important のみ）

モノレポではサブディレクトリにも `.cursor/BUGBOT.md` を置ける
（変更ファイルの上位ディレクトリのものが追加で読まれる）。

## 2.5. 厳格TDDの規律を入れる

`docs/TDD.md` / `docs/ROLES.md` / `.cursor/rules/tdd.mdc` をコピーする。

- `.cursor/rules/tdd.mdc`（`alwaysApply`）は **実装エージェントに Iron Law を強制**する。
  AI 駆動開発をするなら必ず入れる（テストを先に書かせる土台）。
- `docs/TDD.md` はプロジェクト共通の掟。ドメイン固有の技法例だけ差し替える。
- `docs/ROLES.md` の最低限の不変条件 **Implementer ≠ Evaluator** は必ず守る
  （実装した本人/同一モデルに最終レビューさせない）。

## 2.6. ミューテーションテストを入れる（任意・推奨）

`stryker.conf.json` と `.github/workflows/mutation.yml` をコピーし、
`test:mutation` スクリプトと Stryker 依存を追加する。

- 重いので **通常 CI（ブロッカー）には入れない**。週次/手動の別ジョブにする。
- `thresholds.break` を入れると score 低下で失敗にできる（最初は緩めに）。
- カバレッジ 100% でも生き残るミュータント＝テストの穴。塞ぐテストを RED から追加。

## 3. Bugbot を有効化

1. `cursor.com/dashboard/integrations` → GitHub 接続 → リポジトリ許可
2. `cursor.com/dashboard/bugbot` → 対象リポジトリを有効化
3. 設定の目安（観測フェーズ）:
   - Run Once Per PR: ON（コスト/ノイズ抑制）
   - Autofix: Off（助言に徹する）
   - Automatically Learn Rules: Off（最初は決定論的ルールで）

## 4. 運用の立ち上げ（段階導入）

1. **最初の数週間はコメントのみ**で観測（auto-merge はしない）
2. 誤検知 / 見逃しを見て `.cursor/BUGBOT.md` を調整
3. ルールが肥大化したらパス別ファイルに分割
4. 不可逆領域（DB migration・課金・auth・本番昇格）は常に人間が判断

## チェックリスト

- [ ] `ci.yml` をコピーし自分のコマンドに調整
- [ ] CI を Branch protection で required に
- [ ] `docs/TDD.md` / `docs/ROLES.md` / `.cursor/rules/tdd.mdc` をコピー
- [ ] `.cursor/BUGBOT.md` をプロジェクト固有の観点に書き換え
- [ ] （任意）Stryker + `mutation.yml` を入れる
- [ ] Bugbot をダッシュボードで有効化
- [ ] まずコメントのみで運用 → 調整
