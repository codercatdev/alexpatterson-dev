import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const content = `# alexpatterson.dev Pricing for Agents

> Machine-readable pricing, usage tiers, and API constraints for AI agents and conference organizers.

## Public Read & MCP Operations
- **Cost**: $0.00 (Completely Free)
- **Authentication**: None required (\`auth: none\`)
- **Access**: Full access to speaker bios, conference talk abstracts, Sanity CDN high-res headshots, and the speaking ledger via \`${origin}/speaker-kit.json\` and \`${origin}/mcp\`.

## Speaking Inquiries & Enterprise Advisory
- **Booking Calendar**: [\`https://codingcat.dev/book\`](https://codingcat.dev/book)
- **Direct Contact**: alex@codingcat.dev
- **Media & Tutorials Hub**: [\`https://codingcat.dev\`](https://codingcat.dev)
`;

	return new Response(content, {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			Vary: "Accept",
			Link: `<${origin}/.well-known/api-catalog>; rel="api-catalog", <${origin}/llms.txt>; rel="llms-txt", <${origin}/auth.md>; rel="auth-md"`,
		},
	});
};
