import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const content = `# alexpatterson.dev Pricing & Sponsorships

> Machine-readable pricing, sponsorship links, and API access for CMOs, DevRel leads, conference organizers, and AI agents.

## Public Speaker Kit & MCP Operations
- **Cost**: $0.00 (Completely Free)
- **Authentication**: None required (\`auth: none\`)
- **Access**: Full access to speaker bios, conference talk abstracts, Sanity CDN high-res headshots, and the speaking ledger via \`${origin}/speaker-kit.json\` and \`${origin}/mcp\`.

## CodingCat.dev Sponsorships, YouTube Videos & Podcast Hosting
- **Sponsorships & Media Kit**: [\`https://codingcat.dev/sponsorships\`](https://codingcat.dev/sponsorships)
- **Offerings**: Dedicated YouTube Deep-Dive Videos (61.2K+ subscribers), CodingCat.dev Podcast Sponsorships, Custom Brand Podcast Hosting, and 7-Platform Multi-Channel Launch Bundles.
- **Booking Calendar**: [\`https://codingcat.dev/book\`](https://codingcat.dev/book)
- **Direct Contact**: alex@codingcat.dev
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
