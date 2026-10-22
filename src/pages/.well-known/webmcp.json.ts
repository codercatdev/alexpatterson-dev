import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const manifest = {
		spec: "webmcp/0.1",
		tools: [
			{
				name: "get_speaker_kit",
				description:
					"Retrieve Alex Patterson's complete speaker kit JSON (6 bio variations, talk abstracts, Sanity CDN headshots, and speaking ledger)",
				url: `${origin}/speaker-kit.json`,
				method: "GET",
				parameters: [],
			},
			{
				name: "remix_speaker_headshot",
				description:
					"Generate an AI-remixed speaker headshot using Cloudflare Workers AI open models (@cf/black-forest-labs/flux-1-schnell, @cf/runwayml/stable-diffusion-v1-5-img2img, @cf/bytedance/stable-diffusion-xl-lightning)",
				url: `${origin}/api/remix-headshot`,
				method: "POST",
				parameters: [
					{
						name: "stylePreset",
						type: "string",
						description:
							"Style preset (Cyberpunk Keynote, 8-Bit Retro, Conference Sketch, Synthwave)",
						required: false,
					},
					{
						name: "model",
						type: "string",
						description: "Cloudflare Workers AI open model identifier",
						required: false,
					},
					{
						name: "prompt",
						type: "string",
						description: "Custom visual style prompt",
						required: false,
					},
				],
			},
		],
	};

	return new Response(JSON.stringify(manifest, null, 2), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "public, max-age=3600, s-maxage=86400",
			"access-control-allow-origin": "*",
		},
	});
};
