import type { APIRoute } from "astro";
import { MCP_RESOURCES, MCP_SERVER_INFO, MCP_TOOLS } from "@/pages/api/mcp";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const serverCard = {
		$schema: "https://modelcontextprotocol.io/schema/server-card.json",
		name: "Alex Patterson Speaker Kit MCP Server",
		serverInfo: MCP_SERVER_INFO,
		description:
			"Unauthenticated Model Context Protocol (MCP) server for Alex Patterson's executive DevRel hub, conference speaker bios, talk abstracts, Sanity CDN headshots, and speaking ledger.",
		transport: {
			type: "streamable-http",
			endpoint: `${origin}/mcp`,
		},
		mcpServers: {
			main: {
				url: `${origin}/mcp`,
				name: "Alex Patterson Speaker Kit MCP Server",
				description:
					"Fetch speaker bios, talk abstracts, Sanity CDN headshots, and conference speaking ledger with no authentication required.",
				transport: "streamable-http",
			},
		},
		capabilities: {
			tools: { listChanged: false },
			resources: { subscribe: false, listChanged: false },
			prompts: { listChanged: false },
		},
		auth: {
			type: "none",
		},
		tools: MCP_TOOLS,
		resources: MCP_RESOURCES,
	};

	return new Response(JSON.stringify(serverCard, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			"access-control-allow-origin": "*",
			Vary: "Accept",
			Link: `<${origin}/mcp>; rel="mcp-endpoint", <${origin}/llms.txt>; rel="llms-txt"`,
		},
	});
};
