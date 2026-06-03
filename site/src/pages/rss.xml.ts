import { getCollection } from "astro:content";

export async function GET() {
  const tools = (await getCollection("tools"))
    .filter((tool) => tool.data.status === "published")
    .sort((a, b) => b.data.publishedAt.localeCompare(a.data.publishedAt))
    .slice(0, 50);

  const items = tools
    .map(
      (tool) => `<item>
  <title><![CDATA[${tool.data.name}]]></title>
  <link>https://2playclaw.com/item/${tool.data.id}</link>
  <guid>https://2playclaw.com/item/${tool.data.id}</guid>
  <description><![CDATA[${tool.data.summary}]]></description>
  <pubDate>${new Date(tool.data.publishedAt).toUTCString()}</pubDate>
</item>`,
    )
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>2playclaw.com tools</title>
  <link>https://2playclaw.com/tools</link>
  <description>Recently published AI agent tools.</description>
${items}
</channel>
</rss>`, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
