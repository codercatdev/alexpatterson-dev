import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";

export const prerender = false;

export const OPEN_AI_MODELS = [
	"@cf/black-forest-labs/flux-1-schnell",
	"@cf/runwayml/stable-diffusion-v1-5-img2img",
	"@cf/bytedance/stable-diffusion-xl-lightning",
] as const;

export type CloudflareImageModel = (typeof OPEN_AI_MODELS)[number];

interface RemixRequestBody {
	headshotId?: string;
	headshotTitle?: string;
	headshotUrl?: string;
	fallbackLocalUrl?: string;
	stylePreset?: string;
	model?: string;
	prompt?: string;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
	let binary = "";
	const chunkSize = 0x8000;
	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, i + chunkSize);
		binary += String.fromCharCode(...chunk);
	}
	return btoa(binary);
}

async function aiResultToDataUrl(result: unknown): Promise<string | null> {
	if (!result) {
		return null;
	}

	// 1. FLUX.1 Schnell returns { image: "<base64>" }
	if (
		typeof result === "object" &&
		"image" in result &&
		typeof (result as { image?: unknown }).image === "string"
	) {
		const b64 = (result as { image: string }).image;
		return b64.startsWith("data:") ? b64 : `data:image/jpeg;base64,${b64}`;
	}

	// 2. Uint8Array or ArrayBuffer
	if (result instanceof Uint8Array) {
		return `data:image/png;base64,${uint8ArrayToBase64(result)}`;
	}
	if (result instanceof ArrayBuffer) {
		return `data:image/png;base64,${uint8ArrayToBase64(new Uint8Array(result))}`;
	}

	// 3. ReadableStream (returned by SDXL-Lightning and SD-v1.5-img2img)
	if (
		typeof result === "object" &&
		result !== null &&
		"getReader" in result &&
		typeof (result as ReadableStream).getReader === "function"
	) {
		const ab = await new Response(result as ReadableStream).arrayBuffer();
		return `data:image/png;base64,${uint8ArrayToBase64(new Uint8Array(ab))}`;
	}

	return null;
}

function toSanity512Url(url: string): string {
	if (!url.includes("cdn.sanity.io/")) {
		return url;
	}
	const base = url.split("?")[0];
	return `${base}?w=512&h=512&fit=crop&crop=focalpoint&fm=jpg&q=85`;
}

function buildStylizedPreviewSvg(
	stylePreset: string,
	headshotTitle: string,
	model: string,
	prompt: string,
): string {
	const safePreset = stylePreset.replace(/[<>&"']/g, "");
	const safeTitle = headshotTitle.replace(/[<>&"']/g, "");
	const safeModel = model.replace(/[<>&"']/g, "");
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
		<text x="58" y="486" fill="#a78bfa" font-family="monospace" font-size="14" font-weight="bold">WORKERS AI REMIX // ${safePreset.toUpperCase()}</text>
		<text x="58" y="514" fill="#f4f4f5" font-family="sans-serif" font-size="14">Base: ${safeTitle} (${safeModel})</text>
		<text x="58" y="542" fill="#10b981" font-family="monospace" font-size="12">${safePrompt}...</text>
	</svg>`;

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const POST: APIRoute = async ({ request }) => {
	let body: RemixRequestBody = {};
	try {
		const contentType = request.headers.get("content-type") || "";
		if (contentType.includes("application/x-www-form-urlencoded")) {
			const formData = await request.formData();
			body = {
				headshotId: String(formData.get("headshotId") || ""),
				headshotTitle: String(formData.get("headshotTitle") || ""),
				headshotUrl: String(formData.get("headshotUrl") || ""),
				stylePreset: String(formData.get("stylePreset") || ""),
				model: String(formData.get("model") || ""),
				prompt: String(formData.get("prompt") || ""),
			};
		} else {
			body = (await request.json()) as RemixRequestBody;
		}
	} catch {
		return new Response(
			JSON.stringify({ ok: false, error: "Invalid request body" }),
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
	const requestedModel = (
		OPEN_AI_MODELS.includes(body.model as CloudflareImageModel)
			? body.model
			: "@cf/black-forest-labs/flux-1-schnell"
	) as CloudflareImageModel;

	const baseSubjectPrompt =
		"Portrait of Alex Patterson, friendly male software engineer and conference keynote speaker with glasses and a short beard";
	const userStylePrompt =
		body.prompt?.trim() ||
		`Transform speaker headshot into ${stylePreset} aesthetic with deep zinc and royal purple lighting.`;
	const fullPrompt = `${baseSubjectPrompt}. ${userStylePrompt}`;

	const runtimeEnv = env as unknown as {
		AI?: {
			run: (model: string, inputs: Record<string, unknown>) => Promise<unknown>;
		};
	};

	const ai = runtimeEnv?.AI;
	if (ai && typeof ai.run === "function") {
		// Fetch 512x512 Sanity headshot bytes for img2img or vision conditioning
		let sourceBytes: Uint8Array | null = null;
		let visionDescription = "";

		try {
			const imgRes = await fetch(toSanity512Url(headshotUrl));
			if (imgRes.ok) {
				sourceBytes = new Uint8Array(await imgRes.arrayBuffer());
			}
		} catch {
			// continue without sourceBytes if fetch fails
		}

		// Optional vision conditioning with open LLaVA 1.5 7B model on Workers AI
		if (
			sourceBytes &&
			requestedModel !== "@cf/runwayml/stable-diffusion-v1-5-img2img"
		) {
			try {
				const visionRes = (await ai.run("@cf/llava-hf/llava-1.5-7b-hf", {
					image: Array.from(sourceBytes),
					prompt:
						"Describe this speaker headshot's framing, glasses, beard, expression, and lighting in one concise sentence.",
					max_tokens: 60,
				})) as { description?: string } | undefined;
				if (visionRes?.description) {
					visionDescription = visionRes.description.trim();
				}
			} catch {
				// Vision conditioning is optional enhancement
			}
		}

		const conditionedPrompt = visionDescription
			? `${fullPrompt} Reference portrait details: ${visionDescription}`
			: fullPrompt;

		const candidateModels: CloudflareImageModel[] = [
			requestedModel,
			...OPEN_AI_MODELS.filter((m) => m !== requestedModel),
		];

		for (const modelName of candidateModels) {
			try {
				let rawResult: unknown = null;

				if (
					modelName === "@cf/runwayml/stable-diffusion-v1-5-img2img" &&
					sourceBytes
				) {
					rawResult = await ai.run(modelName, {
						prompt: conditionedPrompt,
						image: Array.from(sourceBytes),
						strength: 0.62,
						num_steps: 20,
						guidance: 7.5,
					});
				} else if (modelName === "@cf/black-forest-labs/flux-1-schnell") {
					rawResult = await ai.run(modelName, {
						prompt: conditionedPrompt,
						steps: 4,
					});
				} else if (
					modelName === "@cf/bytedance/stable-diffusion-xl-lightning"
				) {
					rawResult = await ai.run(modelName, {
						prompt: conditionedPrompt,
						num_steps: 4,
					});
				}

				const dataUrl = await aiResultToDataUrl(rawResult);
				if (dataUrl) {
					return new Response(
						JSON.stringify({
							ok: true,
							mode: "workers-ai-live",
							model: modelName,
							stylePreset,
							promptUsed: conditionedPrompt,
							sourceHeadshotUrl: headshotUrl,
							previewDataUrl: dataUrl,
							message: `Generated live on Cloudflare Workers AI using open model ${modelName}${
								visionDescription
									? " (conditioned on Sanity headshot via @cf/llava-hf/llava-1.5-7b-hf)"
									: ""
							}.`,
							generatedAt: new Date().toISOString(),
						}),
						{
							status: 200,
							headers: {
								"Content-Type": "application/json; charset=utf-8",
								"Cache-Control": "no-store",
							},
						},
					);
				}
			} catch {
				// Try next open model in fallback chain
			}
		}
	}

	const previewDataUrl = buildStylizedPreviewSvg(
		stylePreset,
		headshotTitle,
		requestedModel,
		fullPrompt,
	);

	return new Response(
		JSON.stringify({
			ok: true,
			mode: "worker-fallback",
			model: requestedModel,
			stylePreset,
			promptUsed: fullPrompt,
			sourceHeadshotUrl: headshotUrl,
			previewDataUrl,
			message:
				"Offline fallback preview rendered. Deploy to Cloudflare Workers with the AI binding enabled to run open models (@cf/black-forest-labs/flux-1-schnell, @cf/runwayml/stable-diffusion-v1-5-img2img, @cf/bytedance/stable-diffusion-xl-lightning).",
			generatedAt: new Date().toISOString(),
		}),
		{
			status: 200,
			headers: { "Content-Type": "application/json; charset=utf-8" },
		},
	);
};
