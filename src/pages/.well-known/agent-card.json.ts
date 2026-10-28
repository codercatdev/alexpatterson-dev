import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Serves Google A2A Agent Card for autonomous agent-to-agent discovery.
 */
export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const agentCard = {
		name: "Alex Patterson Speaker Kit Agent",
		description:
			"Autonomous speaker kit and DevRel agent for Alex Patterson (Senior Solutions Architect @ Sanity.io, Founder & Host @ CodingCat.dev, Google Developer Expert). Provides unauthenticated access to bios, talk abstracts, Sanity CDN headshots, and speaking ledger.",
		url: `${origin}/mcp`,
		version: "2.0.0",
		protocol: "a2a",
		supportedInterfaces: [
			{
				url: `${origin}/api/mcp`,
				protocolBinding: "JSONRPC",
				protocolVersion: "2.0",
			},
			{
				url: `${origin}/speaker-kit.json`,
				protocolBinding: "HTTP+JSON",
				protocolVersion: "1.0",
			},
		],
		endpoints: {
			mcp: `${origin}/api/mcp`,
			speakerKit: `${origin}/speaker-kit.json`,
			remixHeadshot: `${origin}/api/remix-headshot`,
			auth: `${origin}/agent/auth`,
			claim: `${origin}/agent/claim`,
		},
		capabilities: {
			streaming: false,
			pushNotifications: false,
			stateTransitionHistory: false,
			mcp: true,
			read_content: true,
		},
		skills: [
			{
				id: "get_speaker_kit",
				name: "Get Speaker Kit & Bios",
				description:
					"Retrieve Alex Patterson's 6 speaker bio variations, talk abstracts, Sanity CDN headshots, and speaking ledger.",
				tags: ["speaker-kit", "devrel", "bios", "headshots", "conferences"],
				examples: [
					"Get Alex Patterson's 120-word 3rd-person conference bio",
					"List Alex Patterson's active keynote and workshop abstracts",
					"Get 1:1 square WebP headshot URL for Alex Patterson",
				],
			},
		],
		defaultInputModes: ["text/plain", "application/json"],
		defaultOutputModes: ["text/plain", "application/json"],
		documentation: `${origin}/AGENTS.md`,
	};

	return new Response(JSON.stringify(agentCard, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			"access-control-allow-origin": "*",
		},
	});
};
