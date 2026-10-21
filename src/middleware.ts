import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";

function resolveSiteUrl(
	envSiteUrl: string | undefined,
	fallback: URL | undefined,
): URL {
	if (envSiteUrl) {
		try {
			return new URL(envSiteUrl);
		} catch {
			// ignore invalid URL
		}
	}
	return fallback ?? new URL("https://alexpatterson.dev");
}

export const onRequest = defineMiddleware(async (context, next) => {
	const runtimeEnv = env as unknown as Record<string, string | undefined>;
	context.locals.siteUrl = resolveSiteUrl(runtimeEnv?.SITE_URL, context.site);

	const origin = context.locals.siteUrl.origin;
	const response = await next();

	response.headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains; preload",
	);
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	response.headers.set(
		"Link",
		`<${origin}/speaker-kit.json>; rel="alternate"; type="application/json"; title="Alex Patterson Speaker Kit JSON", <${origin}/llms.txt>; rel="llms-txt"`,
	);

	return response;
});
