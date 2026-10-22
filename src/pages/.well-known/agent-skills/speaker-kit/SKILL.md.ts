import type { APIRoute } from "astro";

export const prerender = false;

export const SKILL_CONTENT = `---
name: speaker-kit
description: Retrieve Alex Patterson's speaker bios, conference talk abstracts, high-resolution Sanity CDN headshots, and DevRel speaking ledger
---

# Alex Patterson Speaker Kit & DevRel Hub

Use this skill to retrieve Alex Patterson's official conference speaker kit (50w/120w/200w bios in 3rd and 1st person, ready-to-run talk abstracts, 1:1 and 16:9 Sanity CDN headshots, and chronological speaking ledger).

## Actions
- Speaker Kit JSON: GET https://alexpatterson.dev/speaker-kit.json
- Model Context Protocol (MCP): POST https://alexpatterson.dev/api/mcp
- Workers AI Headshot Remix: POST https://alexpatterson.dev/api/remix-headshot
`;

export const GET: APIRoute = async () => {
	return new Response(SKILL_CONTENT, {
		headers: {
			"content-type": "text/markdown; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			"access-control-allow-origin": "*",
		},
	});
};
