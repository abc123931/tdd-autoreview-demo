import { describe, expect, it } from "vitest";
import { type Document, searchDocuments } from "./multiTenant";

const docs: Document[] = [
  { id: "1", workspaceId: "ws_a", text: "勤怠の打刻について" },
  { id: "2", workspaceId: "ws_a", text: "投票の作り方" },
  { id: "3", workspaceId: "ws_b", text: "勤怠の集計レポート" },
  { id: "4", workspaceId: "ws_a", text: "Slack APP setup" },
];

describe("searchDocuments", () => {
  it("自テナントの一致する文書だけ返す", () => {
    const result = searchDocuments(docs, "ws_a", "勤怠");
    expect(result.map((d) => d.id)).toEqual(["1"]);
  });

  it("他テナントの文書は絶対に混ざらない", () => {
    const result = searchDocuments(docs, "ws_a", "勤怠");
    expect(result.every((d) => d.workspaceId === "ws_a")).toBe(true);
  });

  it("一致が無ければ空", () => {
    expect(searchDocuments(docs, "ws_a", "存在しない語")).toEqual([]);
  });

  it("前後空白を無視する", () => {
    const result = searchDocuments(docs, "ws_b", "  レポート  ");
    expect(result.map((d) => d.id)).toEqual(["3"]);
  });

  it("大文字小文字を無視する（ASCIIで実証）", () => {
    // 日本語データだけだと toUpperCase/toLowerCase の差が出ず、
    // ミューテーションが生き残る。ASCII の大小混在で実証する。
    const result = searchDocuments(docs, "ws_a", "app");
    expect(result.map((d) => d.id)).toEqual(["4"]);
  });
});
