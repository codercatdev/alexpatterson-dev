import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const body = [
		"User-agent: *",
		"Allow: /",
		"",
		"User-agent: GPTBot",
		"Allow: /",
		"",
		"User-agent: ChatGPT-User",
		"Allow: /",
		"",
		"User-agent: OAI-SearchBot",
		"Allow: /",
		"",
		"User-agent: ClaudeBot",
		"Allow: /",
		"",
		"User-agent: Claude-User",
		"Allow: /",
		"",
		"User-agent: Claude-SearchBot",
		"Allow: /",
		"",
		"User-agent: Google-Extended",
		"Allow: /",
		"",
		"User-agent: PerplexityBot",
		"Allow: /",
		"",
		`Sitemap: ${origin}/sitemap.xml`,
	].join("\n");

	return new Response(body, {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
