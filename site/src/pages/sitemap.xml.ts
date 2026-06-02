import { getCollection } from "astro:content";

const site = "https://2playclaw.com";

export async function GET() {
  const [tools, agents, learn, signals] = await Promise.all([
    getCollection("tools"),
    getCollection("agents"),
    getCollection("learn"),
    getCollection("signals"),
  ]);

  const urls = [
    "/",
    "/tools",
    "/agents",
    "/learn",
    "/signals",
    "/upgrade",
    "/search",
    "/type/skill",
    "/type/mcp",
    "/type/cli",
    "/type/workflow",
    ...tools.filter((item) => item.data.status === "published").map((item) => `/item/${item.data.id}`),
    ...agents.filter((item) => item.data.status === "published").map((item) => `/for/${item.data.id}`),
    ...learn.filter((item) => item.data.status === "published").map((item) => `/learn/${item.id}`),
    ...signals.filter((item) => item.data.status === "published").map((item) => `/signals/${item.id}`),
  ];

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${site}${url}</loc></url>`).join("\n")}
</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
