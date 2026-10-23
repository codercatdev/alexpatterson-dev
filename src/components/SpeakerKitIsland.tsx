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

const LENGTH_OPTIONS: Array<{ id: BioLength; label: string }> = [
	{ id: "short", label: "Short (~50 words)" },
	{ id: "medium", label: "Medium (~120 words)" },
	{ id: "full", label: "Full Executive (~200 words)" },
];

const PERSPECTIVE_OPTIONS: Array<{ id: BioPerspective; label: string }> = [
	{ id: "third", label: "3rd Person (Event Default)" },
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
				classes:
					"bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/35",
			};
		case "workshop":
			return {
				label: "Hands-On Workshop",
				classes:
					"bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/35",
			};
		default:
			return {
				label: "Breakout Session",
				classes:
					"bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
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

	return (
		<section id="speaker-kit" className="mt-14 scroll-mt-24">
			{/* Clean Executive Section Heading */}
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
						For Event Organizers, MCs &amp; Podcast Hosts
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
						What Bio Variations Are Available for Alex Patterson?
					</h2>
				</div>
				<span className="text-xs text-slate-600 dark:text-slate-300">
					Ready-to-paste bios &amp; session abstracts
				</span>
			</div>

			{/* 1. Interactive Bio Selector Card */}
			<div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#1b1e26] p-5 sm:p-6 shadow-xs">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800">
					{/* Length Toggle Group */}
					<div className="space-y-1.5">
						<span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
							1. Select Bio Length
						</span>
						<div
							role="group"
							aria-label="Select bio length"
							className="inline-flex flex-wrap rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#151820] p-1 gap-1"
						>
							{LENGTH_OPTIONS.map((opt) => {
								const isActive = length === opt.id;
								return (
									<button
										key={opt.id}
										type="button"
										onClick={() => setLength(opt.id)}
										aria-pressed={isActive}
										className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
											isActive
												? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs"
												: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
						<span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
							2. Select Perspective
						</span>
						<div
							role="group"
							aria-label="Select bio perspective"
							className="inline-flex flex-wrap rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-[#151820] p-1 gap-1"
						>
							{PERSPECTIVE_OPTIONS.map((opt) => {
								const isActive = perspective === opt.id;
								return (
									<button
										key={opt.id}
										type="button"
										onClick={() => setPerspective(opt.id)}
										aria-pressed={isActive}
										className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
											isActive
												? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs"
												: "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
				<div className="mt-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#151820] p-5">
					<div className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
						{activeBio}
					</div>
				</div>

				{/* Live Word/Char Count + One-Click Copy Bar */}
				<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
						<span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-[#151820] border border-slate-200/80 dark:border-slate-800 px-3 py-1 font-medium">
							<span>Words:</span>
							<strong className="text-indigo-700 dark:text-indigo-300 font-mono">
								{stats.words}
							</strong>
						</span>
						<span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-[#151820] border border-slate-200/80 dark:border-slate-800 px-3 py-1 font-medium">
							<span>Characters:</span>
							<strong className="text-indigo-700 dark:text-indigo-300 font-mono">
								{stats.chars}
							</strong>
						</span>
						<span className="hidden sm:inline text-slate-600 dark:text-slate-300">
							Approved for event websites, podcast intros &amp; press releases
						</span>
					</div>

					<button
						type="button"
						onClick={handleCopyBio}
						toolname="copy_speaker_bio"
						tooldescription="Copy Alex Patterson's selected speaker bio variation to the clipboard"
						tool-name="copy_speaker_bio"
						tool-description="Copy Alex Patterson's selected speaker bio variation to the clipboard"
						className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
							copiedBio
								? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
								: "bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 border-indigo-600 dark:border-indigo-500 text-white shadow-xs"
						}`}
					>
						{copiedBio ? (
							<>
								<Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
								<span>Copied to Clipboard!</span>
							</>
						) : (
							<>
								<Copy className="w-4 h-4" />
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
			<div className="mt-10">
				<div className="flex flex-wrap items-center justify-between gap-2 mb-4">
					<div className="flex items-center gap-2">
						<Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
						<h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
							What Ready-to-Run Talk Abstracts Are Available? ({talks.length})
						</h2>
					</div>
					<span className="text-xs text-slate-600 dark:text-slate-300">
						Click any topic to view full abstract &amp; audience takeaways
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
								className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#1b1e26] hover:border-indigo-300 dark:hover:border-slate-700 transition-colors overflow-hidden shadow-2xs"
							>
								<div className="p-5">
									<div className="flex items-start justify-between gap-4">
										<button
											type="button"
											onClick={() => toggleTalk(talk._id)}
											aria-expanded={isExpanded}
											className="flex-1 text-left group cursor-pointer"
										>
											<div className="flex flex-wrap items-center gap-2 mb-2">
												<span
													className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
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
														className="rounded-full bg-slate-100 dark:bg-[#151820] border border-slate-200/80 dark:border-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300"
													>
														{tag}
													</span>
												))}
											</div>

											<h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
												{talk.title}
											</h3>
										</button>

										<div className="flex items-center gap-2 shrink-0">
											<button
												type="button"
												onClick={() => handleCopyTalk(talk)}
												title="Copy Talk Title & Abstract"
												className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
													isCopied
														? "bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
														: "bg-slate-50 dark:bg-[#151820] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700"
												}`}
											>
												{isCopied ? (
													<>
														<Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
												className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#151820] p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
											>
												<ChevronDown
													className={`w-4 h-4 transition-transform duration-200 ${
														isExpanded
															? "rotate-180 text-indigo-600 dark:text-indigo-400"
															: ""
													}`}
												/>
											</button>
										</div>
									</div>

									{isExpanded && (
										<div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-4">
											<p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
												{talk.abstract}
											</p>

											{talk.takeaways && talk.takeaways.length > 0 && (
												<div className="rounded-xl bg-slate-50 dark:bg-[#151820] border border-slate-200/80 dark:border-slate-800 p-4">
													<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
														<BookOpen className="w-3.5 h-3.5" />
														<span>Key Audience Takeaways</span>
													</div>
													<ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
														{talk.takeaways.map((item) => (
															<li key={item} className="flex items-start gap-2">
																<span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
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
