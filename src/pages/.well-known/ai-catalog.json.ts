import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Implements Agentic Resource Discovery (ARD) capability manifest
 * per https://agenticresourcediscovery.org/ and ai-catalog data model.
 */
export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";
	const hostDomain = locals.siteUrl?.hostname ?? "alexpatterson.dev";

	const manifest = {
		specVersion: "1.0",
		host: {
			displayName: "Alex Patterson — DevRel & Speaker Kit",
			identifier: `did:web:${hostDomain}`,
		},
		entries: [
			{
				identifier: `urn:air:${hostDomain}:server:mcp`,
				displayName: "Alex Patterson Speaker Kit MCP Server",
				type: "application/mcp-server-card+json",
				url: `${origin}/.well-known/mcp/server-card.json`,
				representativeQueries: [
					"get Alex Patterson speaker bio",
					"list conference talk abstracts",
					"download high-res Sanity CDN headshots",
					"query Alex Patterson speaking ledger",
				],
			},
			{
				identifier: `urn:air:${hostDomain}:api:speaker-kit`,
				displayName: "Alex Patterson Programmatic Speaker Kit API",
				type: "application/vnd.oai.openapi+json",
				url: `${origin}/.well-known/openapi.json`,
				representativeQueries: [
					"fetch speaker kit json",
					"remix speaker headshot with Cloudflare Workers AI",
					"conference speaker profile and credentials",
				],
			},
			{
				identifier: `urn:air:${hostDomain}:skills:agent`,
				displayName: "Alex Patterson Speaker Kit Agent Skills",
				type: "application/json",
				url: `${origin}/.well-known/agent-skills/index.json`,
				representativeQueries: [
					"speaker kit agent skill",
					"book Alex Patterson for keynote or workshop",
					"retrieve bios and headshots for conference program",
				],
			},
		],
	};

	return new Response(JSON.stringify(manifest, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
