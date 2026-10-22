import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { buildSanityHeadshotUrl, getSpeakerKitData } from "@/lib/sanity";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const runtimeEnv = env as unknown as Record<string, unknown>;
	const data = await getSpeakerKitData(runtimeEnv);
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const lines: string[] = [
		`# ${data.profile.name} — Full Speaker Kit & DevRel Ledger (llms-full.txt)`,
		"",
		`> ${data.profile.headline}`,
		"",
		`Canonical URL: ${origin}`,
		`Programmatic JSON: ${origin}/speaker-kit.json`,
		`Unauthenticated MCP Server: ${origin}/mcp`,
		`Media & Tutorials Hub: ${data.profile.socialLinks.codingcat}`,
		"",
		"## 1. All 6 Speaker Bio Variations",
		"",
		"### Short Bio (50w) — 3rd Person",
		data.profile.bios.shortThird,
		"",
		"### Short Bio (50w) — 1st Person",
		data.profile.bios.shortFirst,
		"",
		"### Medium Bio (120w) — 3rd Person (Conference Default)",
		data.profile.bios.mediumThird,
		"",
		"### Medium Bio (120w) — 1st Person",
		data.profile.bios.mediumFirst,
		"",
		"### Full Executive Bio (200w) — 3rd Person",
		data.profile.bios.fullThird,
		"",
		"### Full Executive Bio (200w) — 1st Person",
		data.profile.bios.fullFirst,
		"",
		"## 2. Ready-to-Run Conference Talk Abstracts",
		...data.talks.flatMap((t) => [
			`### ${t.title} (${t.format.toUpperCase()})`,
			`Tags: ${t.tags.join(", ")}`,
			"",
			t.abstract,
			"",
			...(t.takeaways?.length
				? ["Key Takeaways:", ...t.takeaways.map((k) => `- ${k}`), ""]
				: []),
		]),
		"## 3. Official High-Res Sanity CDN Headshots",
		...data.headshots.flatMap((h) => [
			`### ${h.title} (${h.primaryFocalTag})`,
			`- 1:1 Square WebP (1200x1200): ${buildSanityHeadshotUrl(h.sanityBaseUrl, "1:1", "webp", h.hotspot).fullUrl}`,
			`- 1:1 Square PNG (1200x1200): ${buildSanityHeadshotUrl(h.sanityBaseUrl, "1:1", "png", h.hotspot).fullUrl}`,
			`- 16:9 Landscape WebP (1920x1080): ${buildSanityHeadshotUrl(h.sanityBaseUrl, "16:9", "webp", h.hotspot).fullUrl}`,
			`- 16:9 Landscape PNG (1920x1080): ${buildSanityHeadshotUrl(h.sanityBaseUrl, "16:9", "png", h.hotspot).fullUrl}`,
			"",
		]),
		"## 4. Complete Speaking Ledger",
		...data.events.map(
			(ev) =>
				`- **${ev.date}** | **${ev.eventName}** — "${ev.talkTitle}" (${ev.role}, ${ev.eventFormat}) — ${ev.city}, ${ev.country}`,
		),
		"",
	];

	return new Response(lines.join("\n"), {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=300, s-maxage=3600",
			"Access-Control-Allow-Origin": "*",
		},
	});
};
