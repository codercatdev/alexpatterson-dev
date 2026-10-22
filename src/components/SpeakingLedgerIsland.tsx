import {
	Calendar,
	ExternalLink,
	FileJson,
	Filter,
	MapPin,
	Presentation,
	Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { SpeakingEvent } from "@/lib/sanity";

interface Props {
	events: SpeakingEvent[];
}

type FilterOption = "All" | "In-Person" | "Virtual" | "Workshop" | "Keynote";

const FILTER_PILLS: FilterOption[] = [
	"All",
	"In-Person",
	"Virtual",
	"Workshop",
	"Keynote",
];

function roleBadgeClasses(role: SpeakingEvent["role"]): string {
	switch (role) {
		case "Keynote":
			return "bg-violet-500/15 text-violet-300 border-violet-500/40";
		case "Workshop Host":
			return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
		default:
			return "bg-zinc-800/80 text-zinc-300 border-zinc-700";
	}
}

function formatBadgeClasses(format: SpeakingEvent["eventFormat"]): string {
	switch (format) {
		case "In-Person":
			return "bg-zinc-900 text-zinc-200 border-zinc-700";
		case "Virtual":
			return "bg-zinc-900/60 text-zinc-400 border-zinc-800";
		case "Hybrid":
			return "bg-violet-500/10 text-violet-300 border-violet-500/30";
	}
}

export default function SpeakingLedgerIsland({ events }: Props) {
	const [activeFilter, setActiveFilter] = useState<FilterOption>("All");

	const filteredEvents = useMemo(() => {
		return events.filter((ev) => {
			if (activeFilter === "All") {
				return true;
			}
			if (activeFilter === "In-Person") {
				return ev.eventFormat === "In-Person";
			}
			if (activeFilter === "Virtual") {
				return ev.eventFormat === "Virtual";
			}
			if (activeFilter === "Workshop") {
				return ev.role === "Workshop Host";
			}
			if (activeFilter === "Keynote") {
				return ev.role === "Keynote";
			}
			return true;
		});
	}, [events, activeFilter]);

	const counts = useMemo(() => {
		return {
			All: events.length,
			"In-Person": events.filter((e) => e.eventFormat === "In-Person").length,
			Virtual: events.filter((e) => e.eventFormat === "Virtual").length,
			Workshop: events.filter((e) => e.role === "Workshop Host").length,
			Keynote: events.filter((e) => e.role === "Keynote").length,
		};
	}, [events]);

	return (
		<section id="speaking-ledger" className="mt-16 scroll-mt-12">
			{/* Section 03 Header */}
			<div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800">
				<div className="flex items-center gap-2.5 font-mono text-xs tracking-wider uppercase text-zinc-400">
					<span className="text-violet-400 font-semibold">03</span>
					<span className="text-zinc-600" aria-hidden="true">
						/
					</span>
					<h2 className="font-mono text-xs tracking-wider uppercase text-zinc-400 font-normal">
						Where Has Alex Patterson Spoken Recently?
					</h2>
				</div>
				<a
					href="/speaker-kit.json"
					className="inline-flex items-center gap-1.5 font-mono text-[11px] text-violet-300 hover:text-violet-200 transition-colors"
				>
					<FileJson className="w-3.5 h-3.5" />
					<span>Export JSON / MCP</span>
				</a>
			</div>

			{/* Filter Bar */}
			<form
				action="#speaking-ledger"
				method="get"
				onSubmit={(e) => e.preventDefault()}
				toolname="filter_speaking_ledger"
				tooldescription="Filter Alex Patterson's chronological conference speaking ledger by event format or role"
				tool-name="filter_speaking_ledger"
				tool-description="Filter Alex Patterson's chronological conference speaking ledger by event format or role"
				className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
			>
				<div className="flex items-center gap-2 flex-wrap">
					<label
						htmlFor="speaking-ledger-filter-select"
						className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 mr-1"
					>
						<Filter className="w-3.5 h-3.5 text-violet-400" />
						FILTER:
					</label>
					<select
						id="speaking-ledger-filter-select"
						name="filter"
						value={activeFilter}
						onChange={(e) => setActiveFilter(e.target.value as FilterOption)}
						toolparamdescription="Speaking engagement filter category: All, In-Person, Virtual, Workshop, or Keynote"
						tool-param-description="Speaking engagement filter category: All, In-Person, Virtual, Workshop, or Keynote"
						className="sr-only"
					>
						{FILTER_PILLS.map((pill) => (
							<option key={pill} value={pill}>
								{pill}
							</option>
						))}
					</select>
					{FILTER_PILLS.map((pill) => {
						const isActive = activeFilter === pill;
						return (
							<button
								key={pill}
								type="button"
								onClick={() => setActiveFilter(pill)}
								aria-pressed={isActive}
								className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition-all cursor-pointer ${
									isActive
										? "bg-violet-600 border-violet-500 text-zinc-100 font-medium shadow-sm"
										: "bg-zinc-900/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
								}`}
							>
								<span>{pill}</span>
								<span
									className={`text-[10px] ${
										isActive ? "text-violet-200" : "text-zinc-400"
									}`}
								>
									({counts[pill]})
								</span>
							</button>
						);
					})}
				</div>

				<output aria-live="polite" className="font-mono text-xs text-zinc-400">
					Showing <span className="text-zinc-200">{filteredEvents.length}</span>{" "}
					of {events.length} engagements
				</output>
			</form>

			{/* Chronological Ledger Table */}
			<div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-zinc-800 bg-zinc-950/70 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
								<th className="py-3 px-4 whitespace-nowrap">Date</th>
								<th className="py-3 px-4">Event &amp; Talk Title</th>
								<th className="py-3 px-4 whitespace-nowrap">Format Badge</th>
								<th className="py-3 px-4 whitespace-nowrap">Location</th>
								<th className="py-3 px-4 text-right whitespace-nowrap">
									Links
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-800/70 text-sm">
							{filteredEvents.map((ev) => (
								<tr
									key={ev._id}
									className="hover:bg-zinc-900/90 transition-colors group"
								>
									{/* Date (YYYY-MM-DD in mono) */}
									<td className="py-3.5 px-4 align-top whitespace-nowrap font-mono text-xs text-zinc-400">
										<div className="inline-flex items-center gap-1.5">
											<Calendar className="w-3.5 h-3.5 text-violet-400/80 shrink-0" />
											<time dateTime={ev.date}>{ev.date}</time>
										</div>
										{ev.featured && (
											<div className="mt-1">
												<span className="inline-block rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 font-mono text-[10px] text-emerald-400">
													FEATURED
												</span>
											</div>
										)}
									</td>

									{/* Event & Talk Title */}
									<td className="py-3.5 px-4 align-top">
										<div className="font-semibold text-zinc-100 group-hover:text-violet-200 transition-colors">
											{ev.eventName}
										</div>
										<div className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
											{ev.talkTitle}
										</div>
									</td>

									{/* Format & Role Badges */}
									<td className="py-3.5 px-4 align-top whitespace-nowrap">
										<div className="flex flex-col items-start gap-1.5 font-mono text-[11px]">
											<span
												className={`inline-flex items-center rounded border px-2 py-0.5 ${roleBadgeClasses(
													ev.role,
												)}`}
											>
												{ev.role}
											</span>
											<span
												className={`inline-flex items-center rounded border px-2 py-0.5 ${formatBadgeClasses(
													ev.eventFormat,
												)}`}
											>
												{ev.eventFormat}
											</span>
										</div>
									</td>

									{/* Location */}
									<td className="py-3.5 px-4 align-top whitespace-nowrap font-mono text-xs text-zinc-300">
										<div className="inline-flex items-center gap-1.5">
											<MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
											<span>
												{ev.city}
												{ev.country && ev.city !== "Remote"
													? `, ${ev.country}`
													: ""}
											</span>
										</div>
									</td>

									{/* Links (Slides / Recording / Event URL) */}
									<td className="py-3.5 px-4 align-top text-right whitespace-nowrap font-mono text-xs">
										<div className="inline-flex items-center justify-end gap-1.5">
											{ev.slidesUrl && (
												<a
													href={ev.slidesUrl}
													target="_blank"
													rel="noopener noreferrer"
													title="View Slides / Technical Writeup"
													className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-950 hover:border-violet-500/50 hover:text-violet-300 px-2 py-1 text-zinc-300 transition-colors"
												>
													<Presentation className="w-3 h-3 text-violet-400" />
													<span>Slides</span>
												</a>
											)}
											{ev.videoUrl && (
												<a
													href={ev.videoUrl}
													target="_blank"
													rel="noopener noreferrer"
													title="Watch Recording"
													className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-950 hover:border-violet-500/50 hover:text-violet-300 px-2 py-1 text-zinc-300 transition-colors"
												>
													<Video className="w-3 h-3 text-emerald-400" />
													<span>Video</span>
												</a>
											)}
											{ev.eventUrl && (
												<a
													href={ev.eventUrl}
													target="_blank"
													rel="noopener noreferrer"
													title="Event Website"
													className="inline-flex items-center gap-1 rounded border border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:text-zinc-100 px-2 py-1 text-zinc-400 transition-colors"
												>
													<span>Event</span>
													<ExternalLink className="w-3 h-3" />
												</a>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Programmatic Speaker Kit / MCP Footer Note */}
			<div className="mt-4 rounded-lg border border-zinc-800/80 bg-zinc-900/30 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs text-zinc-400">
				<div>
					<span className="text-violet-400">MCP / AUTOMATION:</span> Fetch full
					bios, Sanity headshot URLs, talk abstracts, and ledger via{" "}
					<a
						href="/speaker-kit.json"
						className="text-zinc-200 underline decoration-violet-500/50 hover:text-violet-300"
					>
						GET /speaker-kit.json
					</a>
				</div>
				<a
					href="https://devrel.codingcat.dev"
					target="_blank"
					rel="noopener noreferrer"
					className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
				>
					<span>devrel.codingcat.dev</span>
					<ExternalLink className="w-3 h-3" />
				</a>
			</div>
		</section>
	);
}
