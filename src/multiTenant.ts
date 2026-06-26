export type Document = {
  id: string;
  workspaceId: string;
  text: string;
};

/**
 * テナント分離の最重要原則のデモ。
 * 検索は必ず workspaceId で絞り込む。これを省くと他テナントの文書が混ざる
 * （= マルチテナント SaaS で最大級の事故）。
 *
 * .cursor/BUGBOT.md の「マルチテナンシー（最重要）」が守らせたいのはこの形。
 */
export function searchDocuments(
  documents: readonly Document[],
  workspaceId: string,
  query: string
): Document[] {
  const normalized = query.trim().toLowerCase();
  return documents.filter(
    (doc) =>
      doc.workspaceId === workspaceId &&
      doc.text.toLowerCase().includes(normalized)
  );
}
