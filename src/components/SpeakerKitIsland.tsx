import {
	BookOpen,
	Check,
	ChevronDown,
	Copy,
	Mic,
	Sparkles,
	Terminal,
	Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { BioVariations, TalkAbstract, TalkFormat } from "@/lib/sanity";

interface Props {
	bios: BioVariations;
	talks: TalkAbstract[];
}

type BioLength = "short" | "medium" | "full";
type BioPerspective = "third" | "first";

const LENGTH_OPTIONS: Array<{ id: BioLength; label: string; target: string }> =
	[
		{ id: "short", label: "Short (50w)", target: "~50w" },
		{ id: "medium", label: "Medium (120w)", target: "~120w" },
		{ id: "full", label: "Full Executive (200w)", target: "~200w" },
	];

const PERSPECTIVE_OPTIONS: Array<{ id: BioPerspective; label: string }> = [
	{ id: "third", label: "3rd Person (Conference Default)" },
	{ id: "first", label: "1st Person" },
];

function getBioText(
	bios: BioVariations,
	length: BioLength,
	perspective: BioPerspective,
): string {
	if (length === "short") {
		return perspective === "third" ? bios.shortThird : bios.shortFirst;
	}
	if (length === "medium") {
		return perspective === "third" ? bios.mediumThird : bios.mediumFirst;
	}
	return perspective === "third" ? bios.fullThird : bios.fullFirst;
}

function formatBadgeMeta(format: TalkFormat): {
	label: string;
	classes: string;
} {
	switch (format) {
		case "keynote":
			return {
				label: "Keynote",
				classes: "bg-violet-500/15 text-violet-300 border-violet-500/40",
			};
		case "workshop":
			return {
				label: "Workshop",
				classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
			};
		default:
			return {
				label: "Breakout",
				classes: "bg-zinc-800/90 text-zinc-300 border-zinc-700",
			};
	}
}

export default function SpeakerKitIsland({ bios, talks }: Props) {
	const [length, setLength] = useState<BioLength>("medium");
	const [perspective, setPerspective] = useState<BioPerspective>("third");
	const [copiedBio, setCopiedBio] = useState(false);
	const [expandedTalkIds, setExpandedTalkIds] = useState<
		Record<string, boolean>
	>(() => (talks[0]?._id ? { [talks[0]._id]: true } : {}));
	const [copiedTalkId, setCopiedTalkId] = useState<string | null>(null);

	const activeBio = useMemo(
		() => getBioText(bios, length, perspective),
		[bios, length, perspective],
	);

	const stats = useMemo(() => {
		const trimmed = activeBio.trim();
		const words = trimmed ? trimmed.split(/\s+/).length : 0;
		const chars = trimmed.length;
		return { words, chars };
	}, [activeBio]);

	const handleCopyBio = async () => {
		try {
			await navigator.clipboard.writeText(activeBio);
			setCopiedBio(true);
			setTimeout(() => setCopiedBio(false), 2200);
		} catch {
			// Clipboard write not permitted in current context
		}
	};

	const handleCopyTalk = async (talk: TalkAbstract) => {
		const payload = `${talk.title} (${formatBadgeMeta(talk.format).label})\n\n${talk.abstract}${
			talk.takeaways?.length
				? `\n\nKey Takeaways:\n${talk.takeaways.map((t) => `- ${t}`).join("\n")}`
				: ""
		}`;
		try {
			await navigator.clipboard.writeText(payload);
			setCopiedTalkId(talk._id);
			setTimeout(() => setCopiedTalkId(null), 2200);
		} catch {
			// ignore
		}
	};

	const toggleTalk = (id: string) => {
		setExpandedTalkIds((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const activeKeyName = `${length}${perspective === "third" ? "Third" : "First"}`;

	return (
		<section id="speaker-kit" className="mt-16 scroll-mt-12">
			{/* Section 01 Header */}
			<div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800">
				<div className="flex items-center gap-2.5 font-mono text-xs tracking-wider uppercase text-zinc-400">
					<span className="text-violet-400 font-semibold">01</span>
					<span className="text-zinc-600" aria-hidden="true">
						/
					</span>
					<span>SPEAKER KIT</span>
				</div>
				<span className="font-mono text-[11px] text-zinc-400">
					speakerProfile.bios.{activeKeyName}
				</span>
			</div>

			{/* 1. Interactive Bio Matrix */}
			<div className="mt-6 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5">
				<h2 className="sr-only">
					What Bio Variations Are Available for Alex Patterson?
				</h2>
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
					{/* Length Toggle Group */}
					<div className="space-y-1.5">
						<span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">
							Bio Length
						</span>
						<div
							role="group"
							aria-label="Select bio length"
							className="inline-flex flex-wrap rounded-lg border border-zinc-800 bg-zinc-950 p-1 gap-1"
						>
							{LENGTH_OPTIONS.map((opt) => {
								const isActive = length === opt.id;
								return (
									<button
										key={opt.id}
										type="button"
										onClick={() => setLength(opt.id)}
										aria-pressed={isActive}
										className={`rounded-md px-3 py-1.5 font-mono text-xs transition-all cursor-pointer ${
											isActive
												? "bg-violet-600 text-zinc-100 font-medium shadow-sm"
												: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
										}`}
									>
										{opt.label}
									</button>
								);
							})}
						</div>
					</div>

					{/* Perspective Toggle Group */}
					<div className="space-y-1.5">
						<span className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400">
							Perspective
						</span>
						<div
							role="group"
							aria-label="Select bio perspective"
							className="inline-flex flex-wrap rounded-lg border border-zinc-800 bg-zinc-950 p-1 gap-1"
						>
							{PERSPECTIVE_OPTIONS.map((opt) => {
								const isActive = perspective === opt.id;
								return (
									<button
										key={opt.id}
										type="button"
										onClick={() => setPerspective(opt.id)}
										aria-pressed={isActive}
										className={`rounded-md px-3 py-1.5 font-mono text-xs transition-all cursor-pointer ${
											isActive
												? "bg-violet-600 text-zinc-100 font-medium shadow-sm"
												: "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
										}`}
									>
										{opt.label}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Bio Output Area */}
				<div className="mt-4 rounded-lg border border-zinc-800/90 bg-zinc-950/90 p-4 sm:p-5">
					<div className="space-y-3 text-sm sm:text-[15px] text-zinc-200 leading-relaxed whitespace-pre-line">
						{activeBio}
					</div>
				</div>

				{/* Live Word/Char Count + One-Click Copy Bar */}
				<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-3 font-mono text-xs text-zinc-400">
						<span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-950 border border-zinc-800 px-2.5 py-1">
							<span className="text-zinc-400">WORDS:</span>
							<span className="text-violet-300 font-semibold">
								{stats.words}
							</span>
						</span>
						<span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-950 border border-zinc-800 px-2.5 py-1">
							<span className="text-zinc-400">CHARS:</span>
							<span className="text-violet-300 font-semibold">
								{stats.chars}
							</span>
						</span>
						<span className="hidden sm:inline text-zinc-400">
							Ready for CFP &amp; Event Programs
						</span>
					</div>

					<button
						type="button"
						onClick={handleCopyBio}
						toolname="copy_speaker_bio"
						tooldescription="Copy Alex Patterson's selected speaker bio variation to the clipboard"
						tool-name="copy_speaker_bio"
						tool-description="Copy Alex Patterson's selected speaker bio variation to the clipboard"
						className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-medium transition-all cursor-pointer border ${
							copiedBio
								? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
								: "bg-violet-600 hover:bg-violet-500 border-violet-500 text-zinc-100"
						}`}
					>
						{copiedBio ? (
							<>
								<Check className="w-3.5 h-3.5 text-emerald-400" />
								<span>Copied to Clipboard</span>
							</>
						) : (
							<>
								<Copy className="w-3.5 h-3.5" />
								<span>Copy Bio to Clipboard</span>
							</>
						)}
					</button>
					<output aria-live="polite" className="sr-only">
						{copiedBio
							? `Copied ${length} ${perspective} person bio (${stats.words} words)`
							: `Active bio: ${length} ${perspective} person (${stats.words} words, ${stats.chars} characters)`}
					</output>
				</div>
			</div>

			{/* 2. Ready-to-Run Talk Abstracts */}
			<div className="mt-8">
				<div className="flex flex-wrap items-center justify-between gap-2 mb-4">
					<div className="flex items-center gap-2">
						<Mic className="w-4 h-4 text-violet-400" />
						<h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-zinc-200">
							What Ready-to-Run Talk Abstracts Are Available? ({talks.length})
						</h2>
					</div>
					<span className="font-mono text-xs text-zinc-400">
						Click any session to expand abstract &amp; takeaways
					</span>
				</div>

				<div className="space-y-3">
					{talks.map((talk) => {
						const isExpanded = Boolean(expandedTalkIds[talk._id]);
						const badge = formatBadgeMeta(talk.format);
						const isCopied = copiedTalkId === talk._id;

						return (
							<article
								key={talk._id}
								className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700/80 transition-colors overflow-hidden"
							>
								<div className="p-4 sm:p-5">
									<div className="flex items-start justify-between gap-4">
										<button
											type="button"
											onClick={() => toggleTalk(talk._id)}
											aria-expanded={isExpanded}
											className="flex-1 text-left group cursor-pointer"
										>
											<div className="flex flex-wrap items-center gap-2 mb-2">
												<span
													className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] font-medium uppercase ${badge.classes}`}
												>
													{talk.format === "keynote" ? (
														<Sparkles className="w-3 h-3" />
													) : talk.format === "workshop" ? (
														<Wrench className="w-3 h-3" />
													) : (
														<Terminal className="w-3 h-3" />
													)}
													{badge.label}
												</span>
												{talk.tags.map((tag) => (
													<span
														key={tag}
														className="rounded bg-zinc-950 border border-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-400"
													>
														{tag}
													</span>
												))}
											</div>

											<h3 className="text-base sm:text-lg font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors">
												{talk.title}
											</h3>
										</button>

										<div className="flex items-center gap-2 shrink-0">
											<button
												type="button"
												onClick={() => handleCopyTalk(talk)}
												title="Copy Talk Title & Abstract"
												className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
													isCopied
														? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
														: "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
												}`}
											>
												{isCopied ? (
													<>
														<Check className="w-3.5 h-3.5 text-emerald-400" />
														<span>Copied</span>
													</>
												) : (
													<>
														<Copy className="w-3.5 h-3.5" />
														<span className="hidden sm:inline">
															Copy Abstract
														</span>
													</>
												)}
											</button>

											<button
												type="button"
												onClick={() => toggleTalk(talk._id)}
												aria-label={
													isExpanded ? "Collapse abstract" : "Expand abstract"
												}
												className="inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
											>
												<ChevronDown
													className={`w-4 h-4 transition-transform duration-200 ${
														isExpanded ? "rotate-180 text-violet-400" : ""
													}`}
												/>
											</button>
										</div>
									</div>

									{isExpanded && (
										<div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-4">
											<p className="text-sm text-zinc-300 leading-relaxed">
												{talk.abstract}
											</p>

											{talk.takeaways && talk.takeaways.length > 0 && (
												<div className="rounded-lg bg-zinc-950/80 border border-zinc-800/80 p-3.5">
													<div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-violet-400 mb-2">
														<BookOpen className="w-3.5 h-3.5" />
														<span>Key Audience Takeaways</span>
													</div>
													<ul className="space-y-1.5 text-xs sm:text-sm text-zinc-400">
														{talk.takeaways.map((item) => (
															<li key={item} className="flex items-start gap-2">
																<span className="font-mono text-violet-400 mt-0.5">
																	→
																</span>
																<span>{item}</span>
															</li>
														))}
													</ul>
												</div>
											)}
										</div>
									)}
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
