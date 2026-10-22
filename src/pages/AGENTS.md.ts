import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const content = `# alexpatterson.dev: Agent Guide

> Autonomous AI Agent Navigation & Capability Guide for Alex Patterson's Executive DevRel & Speaker Kit Hub.

This site welcomes AI agents, conference automation tools, LLM researchers, and coding assistants. **No authentication or API keys are required** for any read or MCP operations.

## Capabilities & Protocols
- **MCP Server Card**: [\`${origin}/.well-known/mcp/server-card.json\`](${origin}/.well-known/mcp/server-card.json)
- **MCP Streamable HTTP Endpoint**: \`${origin}/mcp\` (and \`${origin}/api/mcp\`)
- **Programmatic Speaker Kit JSON**: [\`${origin}/speaker-kit.json\`](${origin}/speaker-kit.json)
- **JSON API (OpenAPI 3.1)**: [\`${origin}/openapi.json\`](${origin}/openapi.json)
- **API Catalog (RFC 9727)**: [\`${origin}/.well-known/api-catalog\`](${origin}/.well-known/api-catalog)
- **Agent Skills**: [\`${origin}/.well-known/agent-skills/index.json\`](${origin}/.well-known/agent-skills/index.json)
- **AI Resource Manifest (ARD)**: [\`${origin}/.well-known/ai-catalog.json\`](${origin}/.well-known/ai-catalog.json)
- **A2A Agent Card**: [\`${origin}/.well-known/agent.json\`](${origin}/.well-known/agent.json)
- **Agent Index**: [\`${origin}/.well-known/agents.json\`](${origin}/.well-known/agents.json)
- **WebMCP Manifest**: [\`${origin}/.well-known/webmcp.json\`](${origin}/.well-known/webmcp.json)

## Content Contracts
- **Authentication**: [\`${origin}/auth.md\`](${origin}/auth.md)
- **Pricing**: [\`${origin}/pricing.md\`](${origin}/pricing.md)
- **LLM Summary**: [\`${origin}/llms.txt\`](${origin}/llms.txt)
- **LLM Full Index**: [\`${origin}/llms-full.txt\`](${origin}/llms-full.txt)

## How to Connect

### 1. Direct Speaker Kit JSON API (Unauthenticated)
\`\`\`http
GET ${origin}/speaker-kit.json HTTP/1.1
Accept: application/json
\`\`\`

### 2. Streamable HTTP Model Context Protocol (MCP — Unauthenticated)
\`\`\`http
POST ${origin}/mcp HTTP/1.1
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_speaker_bio",
    "arguments": { "length": "medium", "perspective": "third" }
  },
  "id": 1
}
\`\`\`

### 3. Markdown Content Negotiation
Every URL on \`alexpatterson.dev\` serves clean, token-efficient Markdown:
- Request \`${origin}/index.md\`
- Or send header: \`Accept: text/markdown\`
`;

	return new Response(content, {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			Vary: "Accept",
			Link: `<${origin}/.well-known/api-catalog>; rel="api-catalog", <${origin}/llms.txt>; rel="llms-txt", <${origin}/pricing.md>; rel="pricing", <${origin}/auth.md>; rel="auth-md"`,
		},
	});
};
