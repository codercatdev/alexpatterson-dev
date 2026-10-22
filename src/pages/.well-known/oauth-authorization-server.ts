import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const metadata = {
		scopes_supported: [
			"openid",
			"profile",
			"email",
			"offline_access",
			"read:speaker_kit",
			"mcp:tools",
			"agent",
		],
		issuer: origin,
		authorization_endpoint: `${origin}/agent/auth`,
		token_endpoint: `${origin}/agent/claim`,
		jwks_uri: `${origin}/jwks`,
		registration_endpoint: `${origin}/agent/auth`,
		introspection_endpoint: `${origin}/agent/auth`,
		revocation_endpoint: `${origin}/agent/auth`,
		service_documentation: `${origin}/auth.md`,
		response_types_supported: ["code"],
		response_modes_supported: ["query"],
		grant_types_supported: [
			"authorization_code",
			"client_credentials",
			"refresh_token",
		],
		token_endpoint_auth_methods_supported: [
			"none",
			"client_secret_basic",
			"client_secret_post",
			"private_key_jwt",
		],
		token_endpoint_auth_signing_alg_values_supported: [
			"RS256",
			"ES256",
			"EdDSA",
		],
		code_challenge_methods_supported: ["S256"],
		authorization_response_iss_parameter_supported: true,
		dpop_signing_alg_values_supported: ["EdDSA", "ES256", "RS256"],
		subject_types_supported: ["public"],
		id_token_signing_alg_values_supported: ["EdDSA"],
		agent_auth: {
			skill: `${origin}/auth.md`,
			register_uri: `${origin}/agent/auth`,
			unauthenticated_mcp_uri: `${origin}/mcp`,
			identity_types_supported: ["anonymous", "identity_assertion"],
			identity_assertion: {
				assertion_types_supported: [
					"urn:ietf:params:oauth:token-type:id-jag",
					"verified_email",
				],
				credential_types_supported: ["bearer", "none"],
				claim_uri: `${origin}/agent/claim`,
			},
			anonymous: {
				credential_types_supported: ["none", "bearer"],
				claim_uri: `${origin}/agent/claim`,
			},
		},
	};

	return new Response(JSON.stringify(metadata, null, 2), {
		status: 200,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
