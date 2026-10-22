import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { buildSanityHeadshotUrl, getSpeakerKitData } from "@/lib/sanity";

export const GET: APIRoute = async ({ locals }) => {
	const runtimeEnv = env as unknown as Record<string, unknown>;
	const data = await getSpeakerKitData(runtimeEnv);
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const payload = {
		$schema: "https://alexpatterson.dev/speaker-kit.schema.json",
		version: "2.0.0",
		canonicalUrl: origin,
		speakerKitEndpoint: `${origin}/speaker-kit.json`,
		mediaReferralHub: {
			name: "CodingCat.dev",
			url: "https://codingcat.dev",
			note: "alexpatterson.dev is strictly Alex Patterson's executive DevRel & conference speaker kit. All tutorials, blog posts, and podcast episodes are published on https://codingcat.dev.",
		},
		devrelLedgerMcp: {
			url: "https://devrel.codingcat.dev",
			mcpEndpoint: "https://devrel.codingcat.dev/mcp",
		},
		mcpServer: {
			endpoint: `${origin}/mcp`,
			serverCard: `${origin}/.well-known/mcp/server-card.json`,
			auth: "none",
		},
		contentLayer: {
			source: data.meta.source,
			d1SyncedCount: data.meta.d1SyncedCount,
			generatedAt: data.meta.generatedAt,
		},
		identity: {
			name: data.profile.name,
			headline: data.profile.headline,
			location: data.profile.location,
			homeAirport: data.profile.homeAirport,
			education: data.profile.education,
			availableForSpeaking: data.profile.availableForSpeaking,
			bookingUrl: data.profile.bookingUrl,
			speakerEmail: data.profile.speakerEmail,
			credentials: data.profile.credentials,
			socialLinks: data.profile.socialLinks,
		},
		bios: {
			shortThird: {
				perspective: "3rd Person (Conference Default)",
				targetWords: 50,
				wordCount: data.profile.bios.shortThird.trim().split(/\s+/).length,
				charCount: data.profile.bios.shortThird.length,
				text: data.profile.bios.shortThird,
			},
			shortFirst: {
				perspective: "1st Person",
				targetWords: 50,
				wordCount: data.profile.bios.shortFirst.trim().split(/\s+/).length,
				charCount: data.profile.bios.shortFirst.length,
				text: data.profile.bios.shortFirst,
			},
			mediumThird: {
				perspective: "3rd Person (Conference Default)",
				targetWords: 120,
				wordCount: data.profile.bios.mediumThird.trim().split(/\s+/).length,
				charCount: data.profile.bios.mediumThird.length,
				text: data.profile.bios.mediumThird,
			},
			mediumFirst: {
				perspective: "1st Person",
				targetWords: 120,
				wordCount: data.profile.bios.mediumFirst.trim().split(/\s+/).length,
				charCount: data.profile.bios.mediumFirst.length,
				text: data.profile.bios.mediumFirst,
			},
			fullThird: {
				perspective: "3rd Person (Conference Default)",
				targetWords: 200,
				wordCount: data.profile.bios.fullThird.trim().split(/\s+/).length,
				charCount: data.profile.bios.fullThird.length,
				text: data.profile.bios.fullThird,
			},
			fullFirst: {
				perspective: "1st Person",
				targetWords: 200,
				wordCount: data.profile.bios.fullFirst.trim().split(/\s+/).length,
				charCount: data.profile.bios.fullFirst.length,
				text: data.profile.bios.fullFirst,
			},
		},
		headshots: data.headshots.map((h) => ({
			id: h._id,
			title: h.title,
			primaryFocalTag: h.primaryFocalTag,
			caption: h.caption,
			alt: h.alt,
			sanityBaseUrl: h.sanityBaseUrl,
			variants: {
				squareWebp: buildSanityHeadshotUrl(
					h.sanityBaseUrl,
					"1:1",
					"webp",
					h.hotspot,
				).fullUrl,
				squarePng: buildSanityHeadshotUrl(
					h.sanityBaseUrl,
					"1:1",
					"png",
					h.hotspot,
				).fullUrl,
				landscapeWebp: buildSanityHeadshotUrl(
					h.sanityBaseUrl,
					"16:9",
					"webp",
					h.hotspot,
				).fullUrl,
				landscapePng: buildSanityHeadshotUrl(
					h.sanityBaseUrl,
					"16:9",
					"png",
					h.hotspot,
				).fullUrl,
			},
		})),
		talkAbstracts: data.talks,
		speakingLedger: data.events,
	};

	return new Response(JSON.stringify(payload, null, 2), {
		status: 200,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=60, s-maxage=300",
			"Access-Control-Allow-Origin": "*",
		},
	});
};
