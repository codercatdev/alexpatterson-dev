import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const body = `User-Agent: *
Content-Signal: ai-train=no, search=yes, ai-input=yes
Allow: /
Allow: /mcp
Allow: /api/mcp
Allow: /speaker-kit.json
Allow: /.well-known/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /auth.md
Allow: /AGENTS.md
Allow: /pricing.md

User-Agent: GPTBot
Allow: /

User-Agent: ChatGPT-User
Allow: /

User-Agent: OAI-SearchBot
Allow: /

User-Agent: ClaudeBot
Allow: /

User-Agent: Claude-User
Allow: /

User-Agent: Claude-SearchBot
Allow: /

User-Agent: Google-Extended
Allow: /

User-Agent: Amazonbot
Allow: /

User-Agent: Bytespider
Allow: /

User-Agent: CCBot
Allow: /

User-Agent: PerplexityBot
Allow: /

User-Agent: Applebot-Extended
Allow: /

User-Agent: meta-externalagent
Allow: /

Host: ${origin}
Sitemap: ${origin}/sitemap.xml
`;

	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "max-age=0, s-maxage=3600",
		},
	});
};
