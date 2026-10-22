import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const config = {
		issuer: origin,
		authorization_endpoint: `${origin}/agent/auth`,
		token_endpoint: `${origin}/agent/claim`,
		jwks_uri: `${origin}/jwks`,
		registration_endpoint: `${origin}/agent/auth`,
		response_types_supported: ["code", "token", "id_token"],
		subject_types_supported: ["public"],
		id_token_signing_alg_values_supported: ["EdDSA", "RS256"],
		scopes_supported: [
			"openid",
			"profile",
			"email",
			"read:speaker_kit",
			"mcp:tools",
			"agent",
		],
		token_endpoint_auth_methods_supported: [
			"none",
			"client_secret_basic",
			"client_secret_post",
		],
		claims_supported: ["sub", "iss", "aud", "exp", "iat", "email"],
		grant_types_supported: ["authorization_code", "client_credentials"],
	};

	return new Response(JSON.stringify(config, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
