import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getSpeakerKitData } from "@/lib/sanity";

export const GET: APIRoute = async ({ locals }) => {
	const runtimeEnv = env as unknown as Record<string, unknown>;
	const data = await getSpeakerKitData(runtimeEnv);
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const lines = [
		`# ${data.profile.name} — Executive DevRel & Interactive Speaker Kit`,
		"",
		`> ${data.profile.headline}`,
		"",
		"## Core Positioning & Agent Endpoints",
		`- [Executive Speaker Hub](${origin}/): Single-page interactive speaker kit, bios, headshots, and speaking ledger.`,
		`- [MCP Server (No Auth Required)](${origin}/mcp): Streamable HTTP Model Context Protocol server (\`POST /mcp\`, \`GET /mcp\`) with 6 tools and 4 resources.`,
		`- [Programmatic Speaker Kit JSON](${origin}/speaker-kit.json): Complete JSON payload of bios, headshots, talk abstracts, and speaking ledger.`,
		`- [Full LLM Context](${origin}/llms-full.txt): Complete inline text of all 6 bios, talk abstracts, headshots, and speaking history.`,
		`- [Agent Instructions](${origin}/AGENTS.md): Capabilities, endpoints, rate limits, and authentication policy (\`none\`).`,
		`- [Agent Skill (SKILL.md)](${origin}/.well-known/agent-skills/speaker-kit/SKILL.md): Reusable skill instructions for AI agents.`,
		`- [OpenAPI 3.1 Specification](${origin}/.well-known/openapi.json): Machine-readable REST & MCP API specification.`,
		"- [Tutorials, Blog Posts & Podcasts](https://codingcat.dev): All educational media lives exclusively on CodingCat.dev.",
		"- [DevRel Activity Ledger MCP](https://devrel.codingcat.dev): Full DevRel activity ledger.",
		"",
		"## Credentials & Metadata",
		...data.profile.credentials.map(
			(c) => `- **${c.label}**${c.url ? ` (${c.url})` : ""}`,
		),
		`- **Location**: ${data.profile.location} (${data.profile.homeAirport})`,
		`- **Booking Calendar**: [${data.profile.bookingUrl}](${data.profile.bookingUrl})`,
		`- **Speaker Inquiry Email**: mailto:${data.profile.speakerEmail}`,
		"",
		"## Official Speaker Bio (Medium, 3rd Person)",
		data.profile.bios.mediumThird,
		"",
		"## Ready-to-Run Talk Abstracts",
		...data.talks.map(
			(t) =>
				`- **${t.title}** [${t.format.toUpperCase()}] — ${t.abstract} (Tags: ${t.tags.join(", ")})`,
		),
		"",
		"## Recent Speaking Ledger",
		...data.events.map(
			(e) =>
				`- \`${e.date}\` — **${e.eventName}** (${e.city}, ${e.country}) [${e.role} / ${e.eventFormat}]: "${e.talkTitle}"`,
		),
		"",
		"## Optional",
		`- [Authentication Policy](${origin}/auth.md): Public read-only access (\`auth: none\`).`,
		`- [Pricing & Rate Limits](${origin}/pricing.md): 100% free public endpoints.`,
	];

	return new Response(lines.join("\n"), {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=300",
		},
	});
};
