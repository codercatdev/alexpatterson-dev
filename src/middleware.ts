import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { estimateTokens, htmlToMarkdown } from "./lib/html-to-markdown";

function buildLinkHeader(origin: string): string {
	return [
		`<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
		`<${origin}/.well-known/mcp/server-card.json>; rel="mcp-server-card"`,
		`<${origin}/.well-known/agent-skills/index.json>; rel="agent-skills"`,
		`<${origin}/.well-known/ai-catalog.json>; rel="ai-catalog"`,
		`<${origin}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`,
		`<${origin}/.well-known/oauth-authorization-server>; rel="oauth-authorization-server"`,
		`<${origin}/llms.txt>; rel="llms-txt"`,
		`<${origin}/auth.md>; rel="auth-md"`,
		`<${origin}/AGENTS.md>; rel="agent-guide"`,
		`<${origin}/pricing.md>; rel="pricing"`,
		`<${origin}/speaker-kit.json>; rel="alternate"; type="application/json"; title="Alex Patterson Speaker Kit JSON"`,
	].join(", ");
}

function applySecurityAndAgentHeaders(
	headers: Headers,
	origin: string,
	request: Request,
): void {
	headers.set("Link", buildLinkHeader(origin));
	headers.set("Content-Usage", "train-ai=n, search=y");
	headers.set("X-Content-Type-Options", "nosniff");
	headers.set("X-Frame-Options", "SAMEORIGIN");
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains; preload",
	);
	if (!headers.has("Content-Security-Policy")) {
		headers.set(
			"Content-Security-Policy",
			"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://cdn.sanity.io https:; font-src 'self' data:; connect-src 'self' https://cdn.sanity.io https://*.sanity.io; frame-ancestors 'self' https://*.sanity.studio https://*.sanity.io https://sanity.io http://localhost:3333",
		);
	}

	const reqOrigin = request.headers.get("origin");
	headers.set("Access-Control-Allow-Origin", reqOrigin || "*");
	headers.delete("Access-Control-Allow-Credentials");
	headers.set(
		"Access-Control-Allow-Methods",
		request.headers.get("access-control-request-method") ||
			"GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
	);
	headers.set(
		"Access-Control-Allow-Headers",
		request.headers.get("access-control-request-headers") ||
			"Content-Type, Authorization, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID, X-Requested-With",
	);
	headers.set("Access-Control-Max-Age", "86400");

	const existingVary = headers.get("Vary");
	const varyParts = new Set(
		existingVary
			? existingVary
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean)
			: [],
	);
	varyParts.add("Accept");
	varyParts.add("Origin");
	headers.set("Vary", Array.from(varyParts).join(", "));
}

export const onRequest = defineMiddleware(async (context, next) => {
	const runtimeEnv = env as unknown as { SITE_URL?: string };
	const configuredSiteUrl = runtimeEnv?.SITE_URL;
	const requestOrigin = new URL(context.request.url).origin;

	context.locals.siteUrl = new URL(configuredSiteUrl || requestOrigin);
	const origin = context.locals.siteUrl.origin;

	// Handle CORS preflight OPTIONS globally for all endpoints
	if (context.request.method === "OPTIONS") {
		const preflightHeaders = new Headers();
		applySecurityAndAgentHeaders(preflightHeaders, origin, context.request);
		return new Response(null, {
			status: 204,
			headers: preflightHeaders,
		});
	}

	const url = new URL(context.request.url);
	const pathname = url.pathname;
	const acceptHeader = context.request.headers.get("accept") || "";

	const isExplicitMdExtension =
		pathname.endsWith(".md") &&
		!pathname.startsWith("/.well-known/") &&
		pathname !== "/AGENTS.md" &&
		pathname !== "/auth.md" &&
		pathname !== "/pricing.md" &&
		pathname !== "/SKILL.md";

	const wantsMarkdown =
		isExplicitMdExtension || acceptHeader.includes("text/markdown");

	if (isExplicitMdExtension) {
		const strippedPath = pathname.slice(0, -3) || "/";
		const targetPath = strippedPath === "/index" ? "/" : strippedPath;
		const internalUrl = new URL(targetPath + url.search, url.origin);
		const subReqHeaders = new Headers(context.request.headers);
		subReqHeaders.set("accept", "text/html");

		const subResponse = await context.rewrite(
			new Request(internalUrl.toString(), {
				method: context.request.method,
				headers: subReqHeaders,
			}),
		);

		const contentType = subResponse.headers.get("content-type") || "";
		if (subResponse.ok && contentType.includes("text/html")) {
			const html = await subResponse.text();
			const markdown = htmlToMarkdown(html, `${origin}${targetPath}`);
			const tokens = estimateTokens(markdown);
			const headers = new Headers(subResponse.headers);
			headers.set("Content-Type", "text/markdown; charset=utf-8");
			headers.set("x-markdown-tokens", String(tokens));
			applySecurityAndAgentHeaders(headers, origin, context.request);

			return new Response(markdown, {
				status: subResponse.status,
				headers,
			});
		}
		return subResponse;
	}

	const response = await next();
	const contentType = response.headers.get("content-type") || "";

	// Return RFC 9457 Problem Details JSON for unknown /api/* routes
	if (
		response.status === 404 &&
		pathname.startsWith("/api/") &&
		!contentType.includes("json")
	) {
		const problem = {
			type: `${origin}/errors/not-found`,
			title: "Not Found",
			status: 404,
			detail: `The requested API endpoint '${pathname}' does not exist.`,
			instance: pathname,
		};
		const headers = new Headers(response.headers);
		headers.set("Content-Type", "application/problem+json; charset=utf-8");
		applySecurityAndAgentHeaders(headers, origin, context.request);
		return new Response(JSON.stringify(problem, null, 2), {
			status: 404,
			headers,
		});
	}

	if (
		wantsMarkdown &&
		response.ok &&
		contentType.includes("text/html") &&
		!pathname.startsWith("/api/")
	) {
		const html = await response.text();
		const markdown = htmlToMarkdown(html, `${origin}${pathname}`);
		const tokens = estimateTokens(markdown);
		const headers = new Headers(response.headers);
		headers.set("Content-Type", "text/markdown; charset=utf-8");
		headers.set("x-markdown-tokens", String(tokens));
		applySecurityAndAgentHeaders(headers, origin, context.request);

		return new Response(markdown, {
			status: response.status,
			headers,
		});
	}

	const newHeaders = new Headers(response.headers);
	applySecurityAndAgentHeaders(newHeaders, origin, context.request);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders,
	});
});
