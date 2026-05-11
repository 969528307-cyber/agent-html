import type { CollectionEntry } from "astro:content";

export type ToolEntry = CollectionEntry<"tools">;

export function getPublishedTools(tools: ToolEntry[]) {
  return tools.filter((tool) => tool.data.status === "published");
}

export function filterToolsByType(tools: ToolEntry[], type: string) {
  return getPublishedTools(tools).filter((tool) => tool.data.type === type);
}

export function sortToolsByNewest(tools: ToolEntry[]) {
  return [...tools].sort((a, b) => b.data.publishedAt.localeCompare(a.data.publishedAt));
}
