import {
	Check,
	ChevronDown,
	Copy,
	Download,
	Image as ImageIcon,
	Loader2,
	Sparkles,
	Wand2,
} from "lucide-react";
import { type SyntheticEvent, useState } from "react";
import { buildSanityHeadshotUrl, type HeadshotItem } from "@/lib/sanity";

interface Props {
	headshots: HeadshotItem[];
}

type AspectRatioOption = "1:1" | "16:9";
type FormatOption = "webp" | "png";

const REMIX_PRESETS = [
	{
		id: "Cyberpunk Keynote",
		label: "Cyberpunk Keynote",
		prompt:
			"Neon-lit cyberpunk conference keynote stage portrait with royal violet and emerald holographic rim lighting, dark zinc background, sharp editorial photography.",
	},
	{
		id: "8-Bit Retro",
		label: "8-Bit Retro",
		prompt:
			"Crisp 16-bit/8-bit retro pixel art developer avatar with deep zinc and royal purple palette suitable for a retro game conference badge.",
	},
	{
		id: "Conference Sketch",
		label: "Conference Sketch",
		prompt:
			"Editorial ink-and-charcoal technical illustration portrait on dark blueprint paper with subtle violet grid lines.",
	},
	{
		id: "Synthwave",
		label: "Synthwave",
		prompt:
			"Synthwave outrun conference poster portrait with deep purple wireframe horizon and emerald laser accents.",
	},
] as const;

const CLOUDFLARE_OPEN_MODELS = [
	{
		id: "@cf/black-forest-labs/flux-1-schnell",
		label: "FLUX.1 [schnell] + LLaVA Vision (Recommended)",
	},
	{
		id: "@cf/runwayml/stable-diffusion-v1-5-img2img",
		label: "Stable Diffusion v1.5 (Direct Img2Img)",
	},
	{
		id: "@cf/bytedance/stable-diffusion-xl-lightning",
		label: "SDXL-Lightning (Fast 4-Step Open Model)",
	},
] as const;

interface RemixResponse {
	ok: boolean;
	mode: "workers-ai-live" | "worker-fallback";
	model: string;
	stylePreset: string;
	promptUsed: string;
	sourceHeadshotUrl: string;
	previewDataUrl: string;
	message: string;
	generatedAt: string;
}

export default function HeadshotGridIsland({ headshots }: Props) {
	const [aspect, setAspect] = useState<AspectRatioOption>("1:1");
	const [format, setFormat] = useState<FormatOption>("webp");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [fallbackActive, setFallbackActive] = useState<Record<string, boolean>>(
		{},
	);

	// AI Headshot Remix Drawer State
	const [remixOpen, setRemixOpen] = useState(false);
	const [selectedHeadshotId, setSelectedHeadshotId] = useState<string>(
		headshots[0]?._id ?? "",
	);
	const [selectedPreset, setSelectedPreset] = useState<string>(
		REMIX_PRESETS[0].id,
	);
	const [selectedModel, setSelectedModel] = useState<string>(
		CLOUDFLARE_OPEN_MODELS[0].id,
	);
	const [customPrompt, setCustomPrompt] = useState<string>("");
	const [isRemixing, setIsRemixing] = useState(false);
	const [remixResult, setRemixResult] = useState<RemixResponse | null>(null);
	const [remixError, setRemixError] = useState<string | null>(null);

	const activeQueryPreview =
		aspect === "1:1"
			? `?w=1200&h=1200&fit=crop&crop=focalpoint&fm=${format}`
			: `?w=1920&h=1080&fit=crop&crop=focalpoint&fm=${format}`;

	const handleCopyUrl = async (id: string, fullUrl: string) => {
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopiedId(id);
			setTimeout(() => setCopiedId(null), 2200);
		} catch {
			// ignore
		}
	};

	const handleDownload = async (
		item: HeadshotItem,
		fullSanityUrl: string,
		useLocalFallback: boolean,
	) => {
		const targetUrl =
			useLocalFallback && item.fallbackLocalUrl
				? item.fallbackLocalUrl
				: fullSanityUrl;
		const slug = item.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");
		const filename = `alex-patterson-${slug}-${aspect === "1:1" ? "1200x1200" : "1920x1080"}.${format}`;

		try {
			const response = await fetch(targetUrl);
			const blob = await response.blob();
			const blobUrl = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(blobUrl);
		} catch {
			window.open(targetUrl, "_blank", "noopener,noreferrer");
		}
	};

	const handleRunRemix = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsRemixing(true);
		setRemixError(null);

		const chosenHeadshot =
			headshots.find((h) => h._id === selectedHeadshotId) ?? headshots[0];
		const presetObj = REMIX_PRESETS.find((p) => p.id === selectedPreset);
		const promptToUse =
			customPrompt.trim() || presetObj?.prompt || REMIX_PRESETS[0].prompt;

		const { fullUrl } = buildSanityHeadshotUrl(
			chosenHeadshot.sanityBaseUrl,
			aspect,
			format,
			chosenHeadshot.hotspot,
		);

		try {
			const res = await fetch("/api/remix-headshot", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					headshotId: chosenHeadshot._id,
					headshotTitle: chosenHeadshot.title,
					headshotUrl: fullUrl,
					fallbackLocalUrl: chosenHeadshot.fallbackLocalUrl,
					stylePreset: selectedPreset,
					model: selectedModel,
					prompt: promptToUse,
				}),
			});
			if (!res.ok) {
				throw new Error(`Remix request failed (${res.status})`);
			}
			const data = (await res.json()) as RemixResponse;
			setRemixResult(data);
		} catch (err) {
			setRemixError(
				err instanceof Error ? err.message : "Failed to run AI headshot remix",
			);
		} finally {
			setIsRemixing(false);
		}
	};

	return (
		<section id="headshots" className="mt-16 scroll-mt-12">
			{/* Section 02 Header */}
			<div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800">
				<div className="flex items-center gap-2.5 font-mono text-xs tracking-wider uppercase text-zinc-400">
					<span className="text-violet-400 font-semibold">02</span>
					<span className="text-zinc-600" aria-hidden="true">
						/
					</span>
					<span>HEADSHOTS &amp; MEDIA</span>
				</div>
				<span className="font-mono text-[11px] text-violet-300">
					cdn.sanity.io • Sanity Image Pipeline
				</span>
			</div>

			{/* Sanity Image Pipeline Interactive Controls */}
			<div className="mt-6 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-5">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<ImageIcon className="w-4 h-4 text-violet-400" />
							<h2 className="text-sm font-semibold text-zinc-100">
								How Do I Download High-Res Headshots or Remix via AI?
							</h2>
						</div>
						<p className="text-xs text-zinc-400">
							Toggle aspect ratio and encoding format to dynamically rewrite
							Sanity CDN transformation parameters across all speaker photos.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						{/* Aspect Ratio Toggle */}
						<div
							role="group"
							aria-label="Aspect Ratio Toggle"
							className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-1 gap-1"
						>
							<button
								type="button"
								onClick={() => setAspect("1:1")}
								aria-pressed={aspect === "1:1"}
								className={`rounded-md px-2.5 py-1 font-mono text-xs transition-all cursor-pointer ${
									aspect === "1:1"
										? "bg-violet-600 text-zinc-100 font-medium"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								1:1 Square
							</button>
							<button
								type="button"
								onClick={() => setAspect("16:9")}
								aria-pressed={aspect === "16:9"}
								className={`rounded-md px-2.5 py-1 font-mono text-xs transition-all cursor-pointer ${
									aspect === "16:9"
										? "bg-violet-600 text-zinc-100 font-medium"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								16:9 Landscape
							</button>
						</div>

						{/* Format Toggle */}
						<div
							role="group"
							aria-label="Image Format Toggle"
							className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-1 gap-1"
						>
							<button
								type="button"
								onClick={() => setFormat("webp")}
								aria-pressed={format === "webp"}
								className={`rounded-md px-2.5 py-1 font-mono text-xs uppercase transition-all cursor-pointer ${
									format === "webp"
										? "bg-violet-600 text-zinc-100 font-medium"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								webp
							</button>
							<button
								type="button"
								onClick={() => setFormat("png")}
								aria-pressed={format === "png"}
								className={`rounded-md px-2.5 py-1 font-mono text-xs uppercase transition-all cursor-pointer ${
									format === "png"
										? "bg-violet-600 text-zinc-100 font-medium"
										: "text-zinc-400 hover:text-zinc-200"
								}`}
							>
								png
							</button>
						</div>
					</div>
				</div>

				{/* Live Pipeline Query String Banner */}
				<div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-950 border border-zinc-800/90 px-3 py-2 font-mono text-xs">
					<span className="text-zinc-400">ACTIVE PIPELINE PARAMS:</span>
					<code className="text-violet-300 break-all">
						{activeQueryPreview}
					</code>
				</div>
			</div>

			{/* Headshot Cards Grid */}
			<div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
				{headshots.map((item) => {
					const { fullUrl, queryString } = buildSanityHeadshotUrl(
						item.sanityBaseUrl,
						aspect,
						format,
						item.hotspot,
					);
					const useFallback = Boolean(fallbackActive[item._id]);
					const displaySrc =
						useFallback && item.fallbackLocalUrl
							? item.fallbackLocalUrl
							: fullUrl;
					const isCopied = copiedId === item._id;

					return (
						<article
							key={item._id}
							className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden flex flex-col justify-between"
						>
							<div>
								{/* Image Container with Live Aspect Ratio */}
								<div
									className={`relative w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/80 transition-all duration-300 ${
										aspect === "1:1" ? "aspect-square" : "aspect-video"
									}`}
								>
									<img
										src={displaySrc}
										alt={item.alt}
										loading="lazy"
										decoding="async"
										width={aspect === "1:1" ? 600 : 640}
										height={aspect === "1:1" ? 600 : 360}
										onError={() => {
											if (item.fallbackLocalUrl && !fallbackActive[item._id]) {
												setFallbackActive((prev) => ({
													...prev,
													[item._id]: true,
												}));
											}
										}}
										className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-[1.02]"
									/>
									<div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
										<span className="rounded-md bg-zinc-950/90 backdrop-blur-sm border border-zinc-700/80 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-200">
											{item.primaryFocalTag}
										</span>
									</div>
									<div className="absolute bottom-2.5 right-2.5">
										<span className="rounded-md bg-zinc-950/90 backdrop-blur-sm border border-violet-500/40 px-2 py-0.5 font-mono text-[10px] uppercase text-violet-300">
											{aspect === "1:1" ? "1200×1200" : "1920×1080"} • {format}
										</span>
									</div>
								</div>

								{/* Card Metadata & Monospace CDN Query */}
								<div className="p-4 space-y-2.5">
									<h3 className="text-sm font-semibold text-zinc-100">
										{item.title}
									</h3>
									{item.caption && (
										<p className="text-xs text-zinc-400 leading-relaxed">
											{item.caption}
										</p>
									)}

									<div className="rounded-md bg-zinc-950 border border-zinc-800/90 p-2 font-mono text-[11px] text-zinc-400 overflow-x-auto">
										<div className="text-zinc-400 text-[10px] uppercase mb-0.5">
											Sanity CDN Query String
										</div>
										<code className="text-violet-300 whitespace-nowrap">
											{queryString}
										</code>
									</div>
								</div>
							</div>

							{/* 1-Click Actions */}
							<div className="px-4 pb-4 pt-1 flex items-center gap-2">
								<button
									type="button"
									onClick={() => handleDownload(item, fullUrl, useFallback)}
									className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-2 font-mono text-xs font-medium text-zinc-100 transition-colors cursor-pointer"
								>
									<Download className="w-3.5 h-3.5" />
									<span>Download High-Res</span>
								</button>

								<button
									type="button"
									onClick={() => handleCopyUrl(item._id, fullUrl)}
									className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs transition-colors cursor-pointer ${
										isCopied
											? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
											: "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
									}`}
								>
									{isCopied ? (
										<>
											<Check className="w-3.5 h-3.5 text-emerald-400" />
											<span>Copied URL</span>
										</>
									) : (
										<>
											<Copy className="w-3.5 h-3.5" />
											<span>Copy Image URL</span>
										</>
									)}
								</button>
							</div>
						</article>
					);
				})}
			</div>

			{/* Collapsible "Try AI Headshot Remix" (Cloudflare Workers AI Open Models) */}
			<div className="mt-6 rounded-xl border border-violet-500/30 bg-zinc-900/40 overflow-hidden">
				<button
					type="button"
					onClick={() => setRemixOpen((prev) => !prev)}
					aria-expanded={remixOpen}
					aria-controls="remix-headshot-form"
					toolname="toggle_ai_headshot_remix"
					tooldescription="Toggle the Cloudflare Workers AI speaker headshot remix drawer"
					tool-name="toggle_ai_headshot_remix"
					tool-description="Toggle the Cloudflare Workers AI speaker headshot remix drawer"
					className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-zinc-900/80 transition-colors cursor-pointer"
				>
					<div className="flex items-center gap-3">
						<span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-400">
							<Wand2 className="w-4 h-4" />
						</span>
						<div>
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm font-semibold text-zinc-100">
									Try AI Headshot Remix
								</span>
								<span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 font-mono text-[10px] uppercase text-violet-300">
									Cloudflare Workers AI • Open Models
								</span>
							</div>
							<p className="text-xs text-zinc-400 mt-0.5">
								Generate themed speaker artwork for custom conference badges,
								retro events, or synthwave flyers using open models on
								Cloudflare Workers AI.
							</p>
						</div>
					</div>

					<ChevronDown
						className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
							remixOpen ? "rotate-180 text-violet-400" : ""
						}`}
					/>
				</button>

				<form
					id="remix-headshot-form"
					hidden={!remixOpen}
					onSubmit={handleRunRemix}
					action="/api/remix-headshot"
					method="post"
					toolname="remix_speaker_headshot"
					tooldescription="Generate an AI-remixed speaker headshot using Cloudflare Workers AI open models"
					tool-name="remix_speaker_headshot"
					tool-description="Generate an AI-remixed speaker headshot using Cloudflare Workers AI open models"
					className={
						remixOpen
							? "p-4 sm:p-5 pt-0 border-t border-zinc-800/80 space-y-4"
							: "hidden"
					}
				>
					<div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Base Headshot Selector */}
						<div>
							<label
								htmlFor="remix-base-headshot"
								className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5"
							>
								1. Base Sanity Headshot
							</label>
							<select
								id="remix-base-headshot"
								name="headshotId"
								toolparamdescription="Base Sanity speaker headshot ID to transform"
								tool-param-description="Base Sanity speaker headshot ID to transform"
								value={selectedHeadshotId}
								onChange={(e) => setSelectedHeadshotId(e.target.value)}
								className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
							>
								{headshots.map((h) => (
									<option key={h._id} value={h._id}>
										{h.title} ({h.primaryFocalTag})
									</option>
								))}
							</select>
						</div>

						{/* Open Model Selector */}
						<div>
							<label
								htmlFor="remix-open-model"
								className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5"
							>
								2. Cloudflare Open AI Model
							</label>
							<select
								id="remix-open-model"
								name="model"
								toolparamdescription="Cloudflare Workers AI open model identifier (FLUX.1 schnell, SD 1.5 img2img, or SDXL Lightning)"
								tool-param-description="Cloudflare Workers AI open model identifier (FLUX.1 schnell, SD 1.5 img2img, or SDXL Lightning)"
								value={selectedModel}
								onChange={(e) => setSelectedModel(e.target.value)}
								className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
							>
								{CLOUDFLARE_OPEN_MODELS.map((m) => (
									<option key={m.id} value={m.id}>
										{m.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Preset Style Pills */}
					<div>
						<span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
							3. Preset Style Pill
						</span>
						<div className="flex flex-wrap gap-1.5">
							{REMIX_PRESETS.map((preset) => {
								const active = selectedPreset === preset.id;
								return (
									<button
										key={preset.id}
										type="button"
										aria-pressed={active}
										onClick={() => {
											setSelectedPreset(preset.id);
											setCustomPrompt(preset.prompt);
										}}
										className={`rounded-md border px-2.5 py-1 font-mono text-xs transition-all cursor-pointer ${
											active
												? "bg-violet-600 border-violet-500 text-zinc-100"
												: "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
										}`}
									>
										{preset.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* Custom Prompt Input */}
					<div>
						<label
							htmlFor="remix-custom-prompt"
							className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5"
						>
							4. Custom Style Prompt (Optional Override)
						</label>
						<div className="flex flex-col sm:flex-row gap-2">
							<input
								id="remix-custom-prompt"
								name="prompt"
								type="text"
								autoComplete="off"
								toolparamdescription="Custom visual style prompt for AI headshot generation"
								tool-param-description="Custom visual style prompt for AI headshot generation"
								value={customPrompt}
								onChange={(e) => setCustomPrompt(e.target.value)}
								placeholder={
									REMIX_PRESETS.find((p) => p.id === selectedPreset)?.prompt
								}
								className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500"
							/>
							<button
								type="submit"
								disabled={isRemixing}
								className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 px-4 py-2 font-mono text-xs font-medium text-zinc-100 transition-colors cursor-pointer shrink-0"
							>
								{isRemixing ? (
									<>
										<Loader2 className="w-3.5 h-3.5 animate-spin" />
										<span>Generating via Workers AI...</span>
									</>
								) : (
									<>
										<Sparkles className="w-3.5 h-3.5" />
										<span>Run Workers AI Remix</span>
									</>
								)}
							</button>
						</div>
					</div>

					<output aria-live="polite" className="sr-only">
						{isRemixing
							? "Generating AI headshot remix via Cloudflare Workers AI..."
							: remixResult
								? `Generated ${remixResult.stylePreset} headshot remix using ${remixResult.model}`
								: ""}
					</output>

					{remixError && (
						<div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300">
							{remixError}
						</div>
					)}

					{remixResult && (
						<div className="rounded-lg border border-violet-500/30 bg-zinc-950 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
							<div className="sm:col-span-1 space-y-2">
								<img
									src={remixResult.previewDataUrl}
									alt={`AI Remix: ${remixResult.stylePreset}`}
									width="512"
									height="512"
									className="w-full aspect-square rounded-lg border border-zinc-800 object-cover"
								/>
								<a
									href={remixResult.previewDataUrl}
									download={`alex-patterson-remix-${remixResult.stylePreset.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`}
									className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-violet-600 hover:bg-violet-500 px-3 py-1.5 font-mono text-xs text-zinc-100 transition-colors"
								>
									<Download className="w-3.5 h-3.5" />
									<span>Download Remix</span>
								</a>
							</div>
							<div className="sm:col-span-2 space-y-2 font-mono text-xs">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<span className="text-violet-300 font-semibold">
										STYLE: {remixResult.stylePreset}
									</span>
									<span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] text-emerald-400">
										{remixResult.mode} ({remixResult.model})
									</span>
								</div>
								<p className="text-zinc-400 font-sans text-xs leading-relaxed">
									{remixResult.message}
								</p>
								<div className="rounded bg-zinc-900/90 border border-zinc-800 p-2 text-[11px] text-zinc-400 break-all">
									<span className="text-zinc-400">PROMPT: </span>
									{remixResult.promptUsed}
								</div>
							</div>
						</div>
					)}
				</form>
			</div>
		</section>
	);
}
