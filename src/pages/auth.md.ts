import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const body = `# alexpatterson.dev auth.md

> Autonomous AI Agent Authentication & Access Specification for Alex Patterson's Speaker Kit & MCP Server.

## 1. Overview & Unauthenticated Access
All speaker kit data (\`/speaker-kit.json\`), Streamable HTTP Model Context Protocol tools (\`/mcp\` and \`/api/mcp\`), and Markdown content negotiation (\`Accept: text/markdown\`) work with **NO authentication required** (\`auth.type = "none"\`).

- **Resource Identifier**: \`${origin}\`
- **Authorization Server**: \`${origin}\`
- **Protected Resource Metadata**: [\`${origin}/.well-known/oauth-protected-resource\`](${origin}/.well-known/oauth-protected-resource)
- **OAuth Authorization Server Metadata**: [\`${origin}/.well-known/oauth-authorization-server\`](${origin}/.well-known/oauth-authorization-server)
- **OpenID Connect Discovery**: [\`${origin}/.well-known/openid-configuration\`](${origin}/.well-known/openid-configuration)

## 2. Optional Anonymous Instant Token Claim
For agent frameworks that require a bearer token by convention:
- **Endpoint**: \`POST ${origin}/agent/claim\`
- **Identity Type**: \`anonymous\`
- **Credential Type**: \`bearer\`
- **Registration Endpoint**: \`POST ${origin}/agent/auth\`
`;

	return new Response(body, {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
