import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";
	const slug = params.slug ? `/${params.slug}` : "";

	const protectedResource = {
		resource: `${origin}${slug}`,
		authorization_servers: [origin],
		scopes_supported: [
			"openid",
			"profile",
			"email",
			"read:speaker_kit",
			"mcp:tools",
			"agent",
		],
		bearer_methods_supported: ["header"],
		resource_documentation: `${origin}/auth.md`,
	};

	return new Response(JSON.stringify(protectedResource, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
