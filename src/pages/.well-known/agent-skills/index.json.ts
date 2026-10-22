import type { APIRoute } from "astro";
import { SKILL_CONTENT } from "./speaker-kit/SKILL.md";

export const prerender = false;

async function sha256Hex(input: string): Promise<string> {
	const bytes = new TextEncoder().encode(input);
	const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";
	const digestHex = await sha256Hex(SKILL_CONTENT);

	const skillsIndex = {
		$schema:
			"https://raw.githubusercontent.com/cloudflare/agent-skills-discovery-rfc/main/schema/index.schema.json",
		version: "0.2.0",
		provider: {
			name: "Alex Patterson — DevRel & Speaker Kit",
			url: origin,
		},
		skills: [
			{
				name: "speaker-kit",
				type: "skill-md",
				description:
					"Retrieve Alex Patterson's speaker bios, conference talk abstracts, high-resolution Sanity CDN headshots, and DevRel speaking ledger",
				url: `${origin}/.well-known/agent-skills/speaker-kit/SKILL.md`,
				digest: `sha256:${digestHex}`,
			},
		],
	};

	return new Response(JSON.stringify(skillsIndex, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			"access-control-allow-origin": "*",
			Vary: "Accept",
			Link: `<${origin}/llms.txt>; rel="llms-txt", <${origin}/.well-known/api-catalog>; rel="api-catalog"`,
		},
	});
};
