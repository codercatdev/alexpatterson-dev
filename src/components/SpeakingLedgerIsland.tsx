import {
	Calendar,
	ExternalLink,
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
			return "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/35";
		case "Workshop Host":
			return "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/35";
		default:
			return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
	}
}

function formatBadgeClasses(format: SpeakingEvent["eventFormat"]): string {
	switch (format) {
		case "In-Person":
			return "bg-slate-100 dark:bg-[#151820] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700";
		case "Virtual":
			return "bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700";
		case "Hybrid":
			return "bg-indigo-50/70 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30";
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
		<section id="speaking-ledger" className="mt-14 scroll-mt-24">
			{/* Clean Executive Section Header */}
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
						Global Conferences, Summits &amp; Workshops
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
						Where Has Alex Patterson Spoken Recently?
					</h2>
				</div>
				<output
					aria-live="polite"
					className="text-xs font-medium text-slate-600 dark:text-slate-300"
				>
					Showing{" "}
					<strong className="text-slate-900 dark:text-slate-100">
						{filteredEvents.length}
					</strong>{" "}
					of {events.length} engagements
				</output>
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
				className="flex flex-wrap items-center gap-2 mb-4"
			>
				<label
					htmlFor="speaking-ledger-filter-select"
					className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1"
				>
					<Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
					<span>Filter:</span>
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
							className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
								isActive
									? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white shadow-xs"
									: "bg-white dark:bg-[#1b1e26] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-700"
							}`}
						>
							<span>{pill}</span>
							<span
								className={`text-[11px] ${
									isActive
										? "text-indigo-100"
										: "text-slate-600 dark:text-slate-300"
								}`}
							>
								({counts[pill]})
							</span>
						</button>
					);
				})}
			</form>

			{/* Chronological Ledger (Responsive Mobile Cards + Desktop Table) */}
			<div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#1b1e26] overflow-hidden shadow-xs">
				{/* Mobile Card List (< md) */}
				<div className="md:hidden divide-y divide-slate-200/70 dark:divide-slate-800/80">
					{filteredEvents.map((ev) => (
						<article key={`mobile-${ev._id}`} className="p-4 space-y-2.5">
							<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
								<div className="inline-flex items-center gap-1.5 font-mono">
									<Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
									<time dateTime={ev.date}>{ev.date}</time>
									{ev.featured && (
										<span className="ml-1 inline-block rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
											Featured
										</span>
									)}
								</div>
								<div className="inline-flex items-center gap-1 font-medium">
									<MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
									<span>
										{ev.city}
										{ev.country && ev.city !== "Remote"
											? `, ${ev.country}`
											: ""}
									</span>
								</div>
							</div>

							<div>
								<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
									{ev.eventName}
								</h3>
								<p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
									{ev.talkTitle}
								</p>
							</div>

							<div className="flex flex-wrap items-center justify-between gap-2 pt-1">
								<div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
									<span
										className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${roleBadgeClasses(
											ev.role,
										)}`}
									>
										{ev.role}
									</span>
									<span
										className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${formatBadgeClasses(
											ev.eventFormat,
										)}`}
									>
										{ev.eventFormat}
									</span>
								</div>

								<div className="inline-flex flex-wrap items-center gap-1.5 text-xs font-medium">
									{ev.slidesUrl && (
										<a
											href={ev.slidesUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] px-2.5 py-1 text-slate-700 dark:text-slate-200"
										>
											<Presentation className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
											<span>Slides</span>
										</a>
									)}
									{ev.videoUrl && (
										<a
											href={ev.videoUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] px-2.5 py-1 text-slate-700 dark:text-slate-200"
										>
											<Video className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
											<span>Video</span>
										</a>
									)}
									{ev.eventUrl && (
										<a
											href={ev.eventUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] px-2.5 py-1 text-slate-700 dark:text-slate-300"
										>
											<span>Event</span>
											<ExternalLink className="w-3 h-3" />
										</a>
									)}
								</div>
							</div>
						</article>
					))}
				</div>

				{/* Desktop Table (md+) */}
				<div className="hidden md:block overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-[#151820] text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
								<th className="py-3.5 px-4 whitespace-nowrap">Date</th>
								<th className="py-3.5 px-4">Conference &amp; Session</th>
								<th className="py-3.5 px-4 whitespace-nowrap">
									Role &amp; Format
								</th>
								<th className="py-3.5 px-4 whitespace-nowrap">Location</th>
								<th className="py-3.5 px-4 text-right whitespace-nowrap">
									Resources
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-sm">
							{filteredEvents.map((ev) => (
								<tr
									key={ev._id}
									className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
								>
									{/* Date */}
									<td className="py-4 px-4 align-top whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
										<div className="inline-flex items-center gap-1.5">
											<Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
											<time dateTime={ev.date}>{ev.date}</time>
										</div>
										{ev.featured && (
											<div className="mt-1.5">
												<span className="inline-block rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">
													Featured
												</span>
											</div>
										)}
									</td>

									{/* Event & Talk Title */}
									<td className="py-4 px-4 align-top">
										<div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
											{ev.eventName}
										</div>
										<div className="mt-0.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
											{ev.talkTitle}
										</div>
									</td>

									{/* Format & Role Badges */}
									<td className="py-4 px-4 align-top whitespace-nowrap">
										<div className="flex flex-col items-start gap-1.5 text-xs font-medium">
											<span
												className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${roleBadgeClasses(
													ev.role,
												)}`}
											>
												{ev.role}
											</span>
											<span
												className={`inline-flex items-center rounded-full border px-2.5 py-0.5 ${formatBadgeClasses(
													ev.eventFormat,
												)}`}
											>
												{ev.eventFormat}
											</span>
										</div>
									</td>

									{/* Location */}
									<td className="py-4 px-4 align-top whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-300">
										<div className="inline-flex items-center gap-1.5">
											<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
											<span>
												{ev.city}
												{ev.country && ev.city !== "Remote"
													? `, ${ev.country}`
													: ""}
											</span>
										</div>
									</td>

									{/* Links */}
									<td className="py-4 px-4 align-top text-right whitespace-nowrap text-xs font-medium">
										<div className="inline-flex items-center justify-end gap-1.5">
											{ev.slidesUrl && (
												<a
													href={ev.slidesUrl}
													target="_blank"
													rel="noopener noreferrer"
													title="View Slides / Writeup"
													className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] hover:border-indigo-400 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 transition-colors"
												>
													<Presentation className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
													<span>Slides</span>
												</a>
											)}
											{ev.videoUrl && (
												<a
													href={ev.videoUrl}
													target="_blank"
													rel="noopener noreferrer"
													title="Watch Recording"
													className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] hover:border-emerald-400 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 transition-colors"
												>
													<Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
													<span>Video</span>
												</a>
											)}
											{ev.eventUrl && (
												<a
													href={ev.eventUrl}
													target="_blank"
													rel="noopener noreferrer"
													title="Event Website"
													className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151820] hover:border-slate-400 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 transition-colors"
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
		</section>
	);
}
