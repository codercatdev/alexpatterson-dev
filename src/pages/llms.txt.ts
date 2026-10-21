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
		"## Core Positioning & Media Referral",
		`- **Executive Speaker Hub**: [${origin}](${origin})`,
		`- **Programmatic Speaker Kit (JSON / MCP)**: [${origin}/speaker-kit.json](${origin}/speaker-kit.json)`,
		"- **Tutorials, Blog Posts & Podcasts**: [https://codingcat.dev](https://codingcat.dev) (All educational media lives exclusively on CodingCat.dev)",
		"- **DevRel Activity Ledger MCP**: [https://devrel.codingcat.dev](https://devrel.codingcat.dev)",
		"",
		"## Credentials & Metadata",
		...data.profile.credentials.map(
			(c) => `- **${c.label}**${c.url ? ` (${c.url})` : ""}`,
		),
		`- **Location**: ${data.profile.location} (${data.profile.homeAirport})`,
		`- **Education**: ${data.profile.education}`,
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
	];

	return new Response(lines.join("\n"), {
		status: 200,
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=300",
		},
	});
};
