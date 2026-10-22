import type { APIRoute } from "astro";
import { PUBLIC_JWKS } from "./http-message-signatures-directory";

export const prerender = false;

export const GET: APIRoute = async () => {
	return new Response(JSON.stringify(PUBLIC_JWKS, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600, s-maxage=86400",
		},
	});
};
