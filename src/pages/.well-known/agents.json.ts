import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const agentsData = {
		agents: [
			{
				name: "Alex Patterson Speaker Kit MCP Agent",
				description:
					"Unauthenticated Model Context Protocol (MCP) server for retrieving Alex Patterson's speaker bios, conference talk abstracts, Sanity CDN headshots, and speaking ledger.",
				url: `${origin}/api/mcp`,
				protocol: "mcp",
				capabilities: ["text", "json"],
				documentation: `${origin}/.well-known/mcp/server-card.json`,
			},
			{
				name: "Alex Patterson A2A Discovery Agent",
				description:
					"Agent-to-agent interface for conference organizers and automated DevRel discovery.",
				url: `${origin}/agent/claim`,
				protocol: "a2a",
				capabilities: ["text", "json"],
				documentation: `${origin}/auth.md`,
			},
		],
	};

	return new Response(JSON.stringify(agentsData, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			"access-control-allow-origin": "*",
		},
	});
};
