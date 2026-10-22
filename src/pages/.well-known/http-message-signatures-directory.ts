import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Web Bot Auth / HTTP Message Signatures Directory (RFC 9421 / draft-meunier-web-bot-auth-architecture)
 * Publishes a JWKS with public Ed25519 keys for verifying signed bot/agent requests.
 */
export const PUBLIC_JWKS = {
	keys: [
		{
			alg: "EdDSA",
			crv: "Ed25519",
			kty: "OKP",
			use: "sig",
			x: "2KZd5-3bT1SibLVO26SW5o6IxfbpnhJAiHDpRl2eX_o",
			kid: "IFc7GiWLhvkCMoy5wasQWXr3coWets0F",
		},
	],
};

export const GET: APIRoute = async () => {
	return new Response(JSON.stringify(PUBLIC_JWKS, null, 2), {
		headers: {
			"content-type":
				"application/http-message-signatures-directory+json; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
