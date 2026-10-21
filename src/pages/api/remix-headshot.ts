import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";

interface RemixRequestBody {
	headshotId?: string;
	headshotTitle?: string;
	headshotUrl?: string;
	fallbackLocalUrl?: string;
	stylePreset?: string;
	prompt?: string;
}

function buildStylizedPreviewSvg(
	stylePreset: string,
	headshotTitle: string,
	prompt: string,
): string {
	const safePreset = stylePreset.replace(/[<>&"']/g, "");
	const safeTitle = headshotTitle.replace(/[<>&"']/g, "");
	const safePrompt = prompt.slice(0, 72).replace(/[<>&"']/g, "");

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
		<defs>
			<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="#09090b" />
				<stop offset="55%" stop-color="#1e1b4b" />
				<stop offset="100%" stop-color="#064e3b" />
			</linearGradient>
			<radialGradient id="glow" cx="50%" cy="42%" r="48%">
				<stop offset="0%" stop-color="#7c3aed" stop-opacity="0.55" />
				<stop offset="65%" stop-color="#10b981" stop-opacity="0.18" />
				<stop offset="100%" stop-color="#09090b" stop-opacity="0" />
			</radialGradient>
			<pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
				<path d="M 30 0 L 0 0 0 30" fill="none" stroke="#7c3aed" stroke-width="0.6" stroke-opacity="0.22" />
			</pattern>
		</defs>
		<rect width="600" height="600" fill="url(#bg)" />
		<rect width="600" height="600" fill="url(#grid)" />
		<circle cx="300" cy="255" r="220" fill="url(#glow)" />
		<circle cx="300" cy="230" r="88" fill="#18181b" stroke="#7c3aed" stroke-width="3" />
		<path d="M180 420 C180 340 420 340 420 420" fill="#18181b" stroke="#10b981" stroke-width="3" />
		<text x="300" y="242" text-anchor="middle" fill="#f4f4f5" font-family="monospace" font-size="38" font-weight="bold">AP</text>
		<rect x="36" y="455" width="528" height="110" rx="12" fill="#09090b" fill-opacity="0.88" stroke="#7c3aed" stroke-width="1.5" />
		<text x="58" y="486" fill="#a78bfa" font-family="monospace" font-size="15" font-weight="bold">GEMINI FLASH IMAGE REMIX // ${safePreset.toUpperCase()}</text>
		<text x="58" y="514" fill="#f4f4f5" font-family="sans-serif" font-size="15">Base: ${safeTitle}</text>
		<text x="58" y="542" fill="#10b981" font-family="monospace" font-size="12">${safePrompt}...</text>
	</svg>`;

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const POST: APIRoute = async ({ request }) => {
	let body: RemixRequestBody = {};
	try {
		body = (await request.json()) as RemixRequestBody;
	} catch {
		return new Response(
			JSON.stringify({ ok: false, error: "Invalid JSON body" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json; charset=utf-8" },
			},
		);
	}

	const stylePreset = body.stylePreset?.trim() || "Cyberpunk Keynote";
	const headshotTitle = body.headshotTitle?.trim() || "Studio Portrait";
	const headshotUrl =
		body.headshotUrl?.trim() ||
		"https://cdn.sanity.io/images/hfh83o0w/production/a606dfaa381aab08ddbe16a33fe1d3e1fb37c927-400x400.jpg";
	const promptUsed =
		body.prompt?.trim() ||
		`Transform speaker headshot into ${stylePreset} aesthetic with deep zinc and royal purple lighting.`;

	const runtimeEnv = env as unknown as Record<string, string | undefined>;
	const geminiKey =
		runtimeEnv?.GEMINI_API_KEY ||
		(import.meta.env as Record<string, string | undefined>).GEMINI_API_KEY;

	// If GEMINI_API_KEY is configured, attempt live Gemini Flash Image generation
	if (geminiKey) {
		try {
			const imgRes = await fetch(headshotUrl);
			if (imgRes.ok) {
				const arrayBuffer = await imgRes.arrayBuffer();
				const bytes = new Uint8Array(arrayBuffer);
				let binary = "";
				for (let i = 0; i < bytes.byteLength; i++) {
					binary += String.fromCharCode(bytes[i]);
				}
				const base64Image = btoa(binary);
				const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

				const geminiRes = await fetch(
					`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${geminiKey}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							contents: [
								{
									parts: [
										{ text: promptUsed },
										{
											inlineData: {
												mimeType,
												data: base64Image,
											},
										},
									],
								},
							],
							generationConfig: {
								responseModalities: ["TEXT", "IMAGE"],
							},
						}),
					},
				);

				if (geminiRes.ok) {
					const geminiJson = (await geminiRes.json()) as {
						candidates?: Array<{
							content?: {
								parts?: Array<{
									inlineData?: { mimeType?: string; data?: string };
								}>;
							};
						}>;
					};
					const imagePart = geminiJson.candidates?.[0]?.content?.parts?.find(
						(p) => p.inlineData?.data,
					);
					if (imagePart?.inlineData?.data) {
						const outMime = imagePart.inlineData.mimeType || "image/png";
						return new Response(
							JSON.stringify({
								ok: true,
								mode: "gemini-live",
								model: "gemini-2.0-flash-exp-image-generation",
								stylePreset,
								promptUsed,
								sourceHeadshotUrl: headshotUrl,
								previewDataUrl: `data:${outMime};base64,${imagePart.inlineData.data}`,
								message:
									"Live headshot remix generated via Gemini Flash Image API from Sanity CDN source.",
								generatedAt: new Date().toISOString(),
							}),
							{
								status: 200,
								headers: { "Content-Type": "application/json; charset=utf-8" },
							},
						);
					}
				}
			}
		} catch {
			// Fall through to deterministic edge preview stub
		}
	}

	const previewDataUrl = buildStylizedPreviewSvg(
		stylePreset,
		headshotTitle,
		promptUsed,
	);

	return new Response(
		JSON.stringify({
			ok: true,
			mode: "worker-stub",
			model: "gemini-2.5-flash-image-preview",
			stylePreset,
			promptUsed,
			sourceHeadshotUrl: headshotUrl,
			previewDataUrl,
			message:
				"Cloudflare Worker Phase 2 stub active. Set GEMINI_API_KEY in Worker secrets to enable live Gemini Flash image-to-image transformations from your Sanity CDN headshot.",
			generatedAt: new Date().toISOString(),
		}),
		{
			status: 200,
			headers: { "Content-Type": "application/json; charset=utf-8" },
		},
	);
};
