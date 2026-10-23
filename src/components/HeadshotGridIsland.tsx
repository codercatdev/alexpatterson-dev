import {
	Check,
	ChevronDown,
	Copy,
	Download,
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
			"Neon-lit cyberpunk conference keynote stage portrait with royal violet and emerald holographic rim lighting, dark background, sharp editorial photography.",
	},
	{
		id: "8-Bit Retro",
		label: "8-Bit Retro",
		prompt:
			"Crisp 16-bit/8-bit retro pixel art developer avatar with indigo and emerald palette suitable for a retro game conference badge.",
	},
	{
		id: "Conference Sketch",
		label: "Conference Sketch",
		prompt:
			"Editorial ink-and-charcoal technical illustration portrait on blueprint paper with subtle indigo grid lines.",
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
		<section id="headshots" className="mt-14 scroll-mt-24">
			{/* Clean Executive Section Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
						Press Photos &amp; Event Graphics
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
						How Do I Download High-Res Headshots or Remix via AI?
					</h2>
					<p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
						Choose Square (1:1) for speaker directories or Landscape (16:9) for
						social banners and thumbnails, then download in one click.
					</p>
				</div>

				{/* Aspect Ratio & Format Toggles */}
				<div className="flex flex-wrap items-center gap-2.5 shrink-0">
					<div
						role="group"
						aria-label="Aspect Ratio Toggle"
						className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1b1e26] p-1 gap-1 shadow-2xs"
					>
						<button
							type="button"
							onClick={() => setAspect("1:1")}
							aria-pressed={aspect === "1:1"}
							className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
								aspect === "1:1"
									? "bg-indigo-600 dark:bg-indigo-500 text-white"
									: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
							}`}
						>
							1:1 Square
						</button>
						<button
							type="button"
							onClick={() => setAspect("16:9")}
							aria-pressed={aspect === "16:9"}
							className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
								aspect === "16:9"
									? "bg-indigo-600 dark:bg-indigo-500 text-white"
									: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
							}`}
						>
							16:9 Landscape
						</button>
					</div>

					<div
						role="group"
						aria-label="Image Format Toggle"
						className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1b1e26] p-1 gap-1 shadow-2xs"
					>
						<button
							type="button"
							onClick={() => setFormat("webp")}
							aria-pressed={format === "webp"}
							className={`rounded-lg px-2.5 py-1.5 text-xs font-medium uppercase transition-all cursor-pointer ${
								format === "webp"
									? "bg-indigo-600 dark:bg-indigo-500 text-white"
									: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
							}`}
						>
							WebP
						</button>
						<button
							type="button"
							onClick={() => setFormat("png")}
							aria-pressed={format === "png"}
							className={`rounded-lg px-2.5 py-1.5 text-xs font-medium uppercase transition-all cursor-pointer ${
								format === "png"
									? "bg-indigo-600 dark:bg-indigo-500 text-white"
									: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
							}`}
						>
							PNG
						</button>
					</div>
				</div>
			</div>

			{/* Headshot Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{headshots.map((item) => {
					const { fullUrl } = buildSanityHeadshotUrl(
						item.sanityBaseUrl,
						aspect,
						format,
						item.hotspot,
					);
					const useFallback =
						Boolean(item.fallbackLocalUrl) || Boolean(fallbackActive[item._id]);
					const displaySrc =
						useFallback && item.fallbackLocalUrl
							? item.fallbackLocalUrl
							: fullUrl;
					const isCopied = copiedId === item._id;

					return (
						<article
							key={item._id}
							className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#1b1e26] overflow-hidden flex flex-col justify-between shadow-xs hover:border-indigo-300 dark:hover:border-slate-700 transition-all"
						>
							<div>
								{/* Image Container with Live Aspect Ratio */}
								<div
									className={`relative w-full overflow-hidden bg-slate-100 dark:bg-[#151820] border-b border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
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
									<div className="absolute top-2.5 left-2.5">
										<span className="rounded-full bg-white/90 dark:bg-[#1b1e26]/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-2xs">
											{item.primaryFocalTag}
										</span>
									</div>
									<div className="absolute bottom-2.5 right-2.5">
										<span className="rounded-full bg-white/90 dark:bg-[#1b1e26]/90 backdrop-blur-sm border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-700 dark:text-indigo-300">
											{aspect === "1:1" ? "1200×1200" : "1920×1080"} •{" "}
											{format.toUpperCase()}
										</span>
									</div>
								</div>

								{/* Card Metadata */}
								<div className="p-4 space-y-1.5">
									<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
										{item.title}
									</h3>
									{item.caption && (
										<p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
											{item.caption}
										</p>
									)}
								</div>
							</div>

							{/* 1-Click Actions */}
							<div className="px-4 pb-4 pt-1 flex flex-col gap-2">
								<button
									type="button"
									onClick={() => handleDownload(item, fullUrl, useFallback)}
									className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
								>
									<Download className="w-3.5 h-3.5" />
									<span>Download High-Res</span>
								</button>

								<button
									type="button"
									onClick={() => handleCopyUrl(item._id, fullUrl)}
									className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
										isCopied
											? "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
											: "bg-slate-50 dark:bg-[#151820] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700"
									}`}
								>
									{isCopied ? (
										<>
											<Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
											<span>Copied CDN Link!</span>
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
			<div className="mt-6 rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-white dark:bg-[#1b1e26] overflow-hidden shadow-2xs">
				<button
					type="button"
					onClick={() => setRemixOpen((prev) => !prev)}
					aria-expanded={remixOpen}
					aria-controls="remix-headshot-form"
					toolname="toggle_ai_headshot_remix"
					tooldescription="Toggle the Cloudflare Workers AI speaker headshot remix drawer"
					tool-name="toggle_ai_headshot_remix"
					tool-description="Toggle the Cloudflare Workers AI speaker headshot remix drawer"
					className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
				>
					<div className="flex items-center gap-3.5">
						<span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 shrink-0">
							<Wand2 className="w-5 h-5" />
						</span>
						<div>
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
									Want a Fun Custom Graphic for Your Event? Try AI Headshot
									Remix
								</span>
								<span className="rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
									Free Open AI Studio
								</span>
							</div>
							<p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
								Generate a custom Cyberpunk, 8-Bit Retro, Sketch, or Synthwave
								version of Alex’s headshot for your event social card.
							</p>
						</div>
					</div>

					<ChevronDown
						className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
							remixOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
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
							? "p-5 pt-0 border-t border-slate-200/80 dark:border-slate-800 space-y-4"
							: "hidden"
					}
				>
					<div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Base Headshot Selector */}
						<div>
							<label
								htmlFor="remix-base-headshot"
								className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
							>
								1. Choose Base Headshot
							</label>
							<select
								id="remix-base-headshot"
								name="headshotId"
								toolparamdescription="Base Sanity speaker headshot ID to transform"
								tool-param-description="Base Sanity speaker headshot ID to transform"
								value={selectedHeadshotId}
								onChange={(e) => setSelectedHeadshotId(e.target.value)}
								className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] px-3 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
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
								className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
							>
								2. Select AI Model
							</label>
							<select
								id="remix-open-model"
								name="model"
								toolparamdescription="Cloudflare Workers AI open model identifier (FLUX.1 schnell, SD 1.5 img2img, or SDXL Lightning)"
								tool-param-description="Cloudflare Workers AI open model identifier (FLUX.1 schnell, SD 1.5 img2img, or SDXL Lightning)"
								value={selectedModel}
								onChange={(e) => setSelectedModel(e.target.value)}
								className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] px-3 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
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
						<span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
							3. Pick a Theme Style
						</span>
						<div className="flex flex-wrap gap-2">
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
										className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
											active
												? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white"
												: "bg-slate-50 dark:bg-[#151820] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300"
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
							className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
						>
							4. Custom Style Prompt (Optional)
						</label>
						<div className="flex flex-col sm:flex-row gap-2.5">
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
								className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
							/>
							<button
								type="submit"
								disabled={isRemixing}
								className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:opacity-60 px-5 py-2.5 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0 shadow-xs"
							>
								{isRemixing ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Generating Remix...</span>
									</>
								) : (
									<>
										<Sparkles className="w-4 h-4" />
										<span>Generate AI Headshot</span>
									</>
								)}
							</button>
						</div>
					</div>

					<output aria-live="polite" className="sr-only">
						{isRemixing
							? "Generating AI headshot remix..."
							: remixResult
								? `Generated ${remixResult.stylePreset} headshot remix`
								: ""}
					</output>

					{remixError && (
						<div className="rounded-xl border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
							{remixError}
						</div>
					)}

					{remixResult && (
						<div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-slate-50 dark:bg-[#151820] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
							<div className="sm:col-span-1 space-y-2">
								<img
									src={remixResult.previewDataUrl}
									alt={`AI Remix: ${remixResult.stylePreset}`}
									width="512"
									height="512"
									className="w-full aspect-square rounded-xl border border-slate-200 dark:border-slate-700 object-cover"
								/>
								<a
									href={remixResult.previewDataUrl}
									download={`alex-patterson-remix-${remixResult.stylePreset.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`}
									className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition-colors"
								>
									<Download className="w-3.5 h-3.5" />
									<span>Download Remix</span>
								</a>
							</div>
							<div className="sm:col-span-2 space-y-2 text-xs">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<span className="font-bold text-indigo-700 dark:text-indigo-300">
										Style: {remixResult.stylePreset}
									</span>
									<span className="rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
										{remixResult.mode}
									</span>
								</div>
								<p className="text-slate-600 dark:text-slate-300 leading-relaxed">
									{remixResult.message}
								</p>
							</div>
						</div>
					)}
				</form>
			</div>
		</section>
	);
}
