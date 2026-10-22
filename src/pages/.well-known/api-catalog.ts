import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Implements RFC 9727 (API Catalog) returning application/linkset+json
 * conforming to RFC 9264 Linkset specification.
 */
export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const catalog = {
		linkset: [
			{
				anchor: `${origin}/api/mcp`,
				"service-desc": [
					{
						href: `${origin}/.well-known/mcp/server-card.json`,
						type: "application/mcp-server-card+json",
					},
					{
						href: `${origin}/.well-known/openapi.json`,
						type: "application/vnd.oai.openapi+json",
					},
				],
				"service-doc": [
					{
						href: `${origin}/AGENTS.md`,
						type: "text/markdown",
					},
					{
						href: `${origin}/llms.txt`,
						type: "text/markdown",
					},
				],
				status: [
					{
						href: `${origin}/api/mcp`,
						type: "application/json",
					},
				],
			},
			{
				anchor: `${origin}/speaker-kit.json`,
				"service-desc": [
					{
						href: `${origin}/openapi.json`,
						type: "application/vnd.oai.openapi+json",
					},
				],
				"service-doc": [
					{
						href: `${origin}/llms.txt`,
						type: "text/markdown",
					},
				],
				status: [
					{
						href: `${origin}/speaker-kit.json`,
						type: "application/json",
					},
				],
			},
			{
				anchor: `${origin}/api/remix-headshot`,
				"service-desc": [
					{
						href: `${origin}/openapi.json`,
						type: "application/vnd.oai.openapi+json",
					},
				],
				"service-doc": [
					{
						href: `${origin}/AGENTS.md`,
						type: "text/markdown",
					},
				],
			},
		],
	};

	return new Response(JSON.stringify(catalog, null, 2), {
		headers: {
			"content-type": "application/linkset+json; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			Vary: "Accept",
			Link: `<${origin}/.well-known/mcp/server-card.json>; rel="mcp-server-card", <${origin}/llms.txt>; rel="llms-txt", <${origin}/.well-known/ai-catalog.json>; rel="ai-catalog"`,
		},
	});
};
