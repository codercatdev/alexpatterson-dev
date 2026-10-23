import { createClient, type SanityClient } from "@sanity/client";
import { stegaClean } from "@sanity/client/stega";
import {
	createImageUrlBuilder,
	type SanityImageSource,
} from "@sanity/image-url";
import { defineQuery } from "groq";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SanityConfig {
	projectId: string;
	dataset: string;
	apiVersion: string;
	studioUrl: string;
	token?: string;
}

export interface CredentialBadge {
	_key: string;
	label: string;
	url?: string;
	accent?: "violet" | "emerald" | "zinc";
}

export interface SocialLinks {
	codingcat: string;
	github: string;
	x: string;
	youtube: string;
	linkedin: string;
	gdeProfile: string;
}

export interface BioVariations {
	shortThird: string;
	shortFirst: string;
	mediumThird: string;
	mediumFirst: string;
	fullThird: string;
	fullFirst: string;
}

export interface SpeakerProfile {
	_id: string;
	_type: "speakerProfile";
	name: string;
	headline: string;
	credentials: CredentialBadge[];
	location: string;
	homeAirport: string;
	education: string;
	bookingUrl: string;
	speakerEmail: string;
	availableForSpeaking: boolean;
	socialLinks: SocialLinks;
	bios: BioVariations;
	avatarUrl?: string;
}

export interface SanityImageHotspot {
	x: number;
	y: number;
	height: number;
	width: number;
}

export interface HeadshotItem {
	_id: string;
	_type: "headshot";
	title: string;
	caption: string;
	primaryFocalTag:
		| "Studio Dark"
		| "Keynote Stage"
		| "Casual"
		| "Studio Soundproof"
		| string;
	alt: string;
	/** Base Sanity CDN URL (`https://cdn.sanity.io/images/hfh83o0w/production/...`) */
	sanityBaseUrl: string;
	/** Optional local high-res fallback URL if Sanity asset is not yet uploaded */
	fallbackLocalUrl?: string;
	assetId?: string;
	hotspot?: SanityImageHotspot;
	dimensions?: {
		width: number;
		height: number;
		aspectRatio: number;
	};
}

export type TalkFormat = "keynote" | "workshop" | "talk";

export interface TalkAbstract {
	_id: string;
	_type: "talkAbstract";
	title: string;
	slug: string;
	format: TalkFormat;
	status: "active" | "archived";
	tags: string[];
	abstract: string;
	takeaways?: string[];
}

export type EventFormat = "In-Person" | "Virtual" | "Hybrid";
export type SpeakerRole = "Keynote" | "Speaker" | "Workshop Host" | "Panelist";

export interface SpeakingEvent {
	_id: string;
	_type: "speakingEvent";
	eventName: string;
	talkTitle: string;
	date: string;
	eventFormat: EventFormat;
	city: string;
	country: string;
	role: SpeakerRole;
	eventUrl?: string;
	slidesUrl?: string;
	videoUrl?: string;
	featured: boolean;
	source?: "sanity" | "d1" | "seed";
}

export interface SpeakerKitBundle {
	profile: SpeakerProfile;
	headshots: HeadshotItem[];
	talks: TalkAbstract[];
	events: SpeakingEvent[];
	meta: {
		source: "sanity-live" | "sanity-hybrid-seed";
		d1SyncedCount: number;
		generatedAt: string;
	};
}

// ── Configuration & Client ────────────────────────────────────────────────────

type EnvLike = Record<string, unknown>;

const DEFAULTS = {
	projectId: "hfh83o0w",
	dataset: "production",
	apiVersion: "2025-09-30",
	studioUrl: "https://codingcat-prod.sanity.studio",
} as const;

function readEnvString(
	env: EnvLike | undefined,
	key: string,
): string | undefined {
	const fromRuntime = env?.[key];
	if (typeof fromRuntime === "string" && fromRuntime.trim().length > 0) {
		return fromRuntime.trim();
	}
	const metaEnv = (import.meta.env ?? {}) as Record<string, string | undefined>;
	const fromBuild = metaEnv[key];
	if (typeof fromBuild === "string" && fromBuild.trim().length > 0) {
		return fromBuild.trim();
	}
	return undefined;
}

export function resolveSanityConfig(env?: EnvLike): SanityConfig {
	return {
		projectId:
			readEnvString(env, "PUBLIC_SANITY_PROJECT_ID") ?? DEFAULTS.projectId,
		dataset: readEnvString(env, "PUBLIC_SANITY_DATASET") ?? DEFAULTS.dataset,
		apiVersion:
			readEnvString(env, "PUBLIC_SANITY_API_VERSION") ?? DEFAULTS.apiVersion,
		studioUrl:
			readEnvString(env, "PUBLIC_SANITY_STUDIO_URL") ?? DEFAULTS.studioUrl,
		token: readEnvString(env, "SANITY_API_READ_TOKEN"),
	};
}

const clientCache = new Map<string, SanityClient>();

export function getSanityClient(config: SanityConfig): SanityClient {
	const key = `${config.projectId}:${config.dataset}:${config.apiVersion}`;
	let client = clientCache.get(key);
	if (!client) {
		client = createClient({
			projectId: config.projectId,
			dataset: config.dataset,
			apiVersion: config.apiVersion,
			useCdn: true,
			perspective: "published",
			stega: false,
		});
		clientCache.set(key, client);
	}
	return client;
}

export function urlForSanityImage(
	config: SanityConfig,
	source: SanityImageSource,
) {
	return createImageUrlBuilder({
		projectId: config.projectId,
		dataset: config.dataset,
	}).image(source);
}

/**
 * Generates a live Sanity Image Pipeline URL with explicit aspect ratio & format query params.
 */
export function buildSanityHeadshotUrl(
	baseUrl: string,
	aspect: "1:1" | "16:9",
	format: "webp" | "png",
	hotspot?: SanityImageHotspot,
): { fullUrl: string; queryString: string } {
	const cleanBase = stegaClean(baseUrl).split("?")[0];
	const dims = aspect === "1:1" ? { w: 1200, h: 1200 } : { w: 1920, h: 1080 };
	const fpParams =
		hotspot &&
		typeof hotspot.x === "number" &&
		typeof hotspot.y === "number" &&
		(hotspot.x !== 0.5 || hotspot.y !== 0.5)
			? `&fp-x=${hotspot.x.toFixed(2)}&fp-y=${hotspot.y.toFixed(2)}`
			: "";
	const queryString = `?w=${dims.w}&h=${dims.h}&fit=crop&crop=focalpoint${fpParams}&fm=${format}`;
	return {
		fullUrl: `${cleanBase}${queryString}`,
		queryString,
	};
}

// ── GROQ Queries (Sanity TypeGen compatible) ──────────────────────────────────

export const SPEAKER_PROFILE_QUERY = defineQuery(/* groq */ `
	*[_type == "speakerProfile"][0] {
		_id,
		_type,
		name,
		headline,
		credentials[] {
			_key,
			label,
			url,
			accent
		},
		location,
		homeAirport,
		education,
		bookingUrl,
		speakerEmail,
		availableForSpeaking,
		socialLinks {
			codingcat,
			github,
			x,
			youtube,
			linkedin,
			gdeProfile
		},
		bios {
			shortThird,
			shortFirst,
			mediumThird,
			mediumFirst,
			fullThird,
			fullFirst
		}
	}
`);

export const AUTHOR_FALLBACK_QUERY = defineQuery(/* groq */ `
	*[_type == "author" && slug.current == "alex-patterson"][0] {
		_id,
		title,
		"avatarUrl": coverImage.asset->url,
		"avatarAssetId": coverImage.asset->_id,
		"avatarDimensions": coverImage.asset->metadata.dimensions,
		socials
	}
`);

export const HEADSHOTS_QUERY = defineQuery(/* groq */ `
	*[_type == "headshot"] | order(order asc, _createdAt asc) {
		_id,
		_type,
		title,
		caption,
		primaryFocalTag,
		"alt": coalesce(image.alt, title),
		"sanityBaseUrl": image.asset->url,
		"assetId": image.asset->_id,
		"hotspot": image.hotspot,
		"dimensions": image.asset->metadata.dimensions
	}
`);

export const TALK_ABSTRACTS_QUERY = defineQuery(/* groq */ `
	*[_type == "talkAbstract" && status == "active"] | order(order asc, _createdAt desc) {
		_id,
		_type,
		title,
		"slug": slug.current,
		format,
		status,
		tags,
		abstract,
		takeaways
	}
`);

export const SPEAKING_EVENTS_QUERY = defineQuery(/* groq */ `
	*[_type == "speakingEvent"] | order(date desc) {
		_id,
		_type,
		eventName,
		talkTitle,
		date,
		eventFormat,
		city,
		country,
		role,
		eventUrl,
		slidesUrl,
		videoUrl,
		featured
	}
`);

// ── Fallback Seed Data (Alex Patterson Real Credentials & Talks) ──────────────

export const SEED_SPEAKER_PROFILE: SpeakerProfile = {
	_id: "speakerProfile",
	_type: "speakerProfile",
	name: "Alex Patterson",
	headline:
		"Senior Solutions Engineer at Sanity.io, Founder & Host of CodingCat.dev, and Google Developer Expert (GDE) partnering with developer brands for conference keynotes, dedicated YouTube videos, podcast hosting, and full-funnel media sponsorships.",
	credentials: [
		{
			_key: "cred-sanity",
			label: "Senior Solutions Engineer @ Sanity.io",
			url: "https://www.sanity.io",
			accent: "violet",
		},
		{
			_key: "cred-codingcat",
			label: "Founder & Host @ CodingCat.dev",
			url: "https://codingcat.dev/sponsorships",
			accent: "emerald",
		},
		{
			_key: "cred-gde",
			label: "Google Developer Expert (GDE)",
			url: "https://developers.google.com/profile/u/codercatdev",
			accent: "violet",
		},
		{
			_key: "cred-gvsu",
			label: "M.S., Grand Valley State University (GVSU)",
			url: "https://www.gvsu.edu",
			accent: "zinc",
		},
		{
			_key: "cred-aws",
			label: "AWS Certified Cloud Practitioner",
			url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
			accent: "zinc",
		},
	],
	location: "Grand Rapids, MI",
	homeAirport: "GRR / DTW",
	education: "M.S., Grand Valley State University (GVSU)",
	bookingUrl: "https://codingcat.dev/book",
	speakerEmail: "alex@codingcat.dev",
	availableForSpeaking: true,
	socialLinks: {
		codingcat: "https://codingcat.dev",
		github: "https://github.com/codercatdev",
		x: "https://x.com/codercatdev",
		youtube: "https://www.youtube.com/@CodingCatDev",
		linkedin: "https://www.linkedin.com/in/alexpatterson",
		gdeProfile: "https://developers.google.com/profile/u/codercatdev",
	},
	avatarUrl:
		"https://cdn.sanity.io/images/hfh83o0w/production/a606dfaa381aab08ddbe16a33fe1d3e1fb37c927-400x400.jpg",
	bios: {
		shortThird:
			"Alex Patterson is a Senior Solutions Engineer at Sanity.io, Founder and Host of CodingCat.dev, and a Google Developer Expert (GDE). Holding a Master of Science from Grand Valley State University (GVSU) and based in Grand Rapids, Michigan, he helps developer brands and enterprise teams tell authentic technical stories through keynotes, podcasts, and YouTube deep-dives.",
		shortFirst:
			"I’m a Senior Solutions Engineer at Sanity.io, Founder and Host of CodingCat.dev, and a Google Developer Expert (GDE). With a Master of Science from Grand Valley State University (GVSU) and based in Grand Rapids, Michigan, I help developer brands and enterprise teams tell authentic technical stories through keynotes, podcasts, and YouTube deep-dives.",
		mediumThird:
			"Alex Patterson is a Senior Solutions Engineer at Sanity.io and the Founder of CodingCat.dev, where he produces technical YouTube deep-dives and hosts podcasts with engineering and product leaders across the web ecosystem. Recognized as a Google Developer Expert (GDE) and AWS Certified Cloud Practitioner, Alex specializes in bridging enterprise content architecture with modern AI workflows, Model Context Protocol (MCP), and edge web platforms. Holding a Master of Science degree from Grand Valley State University (GVSU) and based in Grand Rapids, MI, Alex brings nearly two decades of production engineering and developer advocacy experience to global conference stages and developer brand partnerships.",
		mediumFirst:
			"I’m a Senior Solutions Engineer at Sanity.io and the Founder of CodingCat.dev, where I produce technical YouTube deep-dives and host podcasts with engineering and product leaders across the web ecosystem. As a Google Developer Expert (GDE) and AWS Certified Cloud Practitioner, I specialize in bridging enterprise content architecture with modern AI workflows, Model Context Protocol (MCP), and edge web platforms. Holding a Master of Science degree from Grand Valley State University (GVSU) and based in Grand Rapids, MI, I bring nearly two decades of production engineering and developer advocacy experience to global conference stages and developer brand partnerships.",
		fullThird:
			"Alex Patterson is a Senior Solutions Engineer at Sanity.io, Founder and Host of CodingCat.dev, Google Developer Expert (GDE), and AWS Certified Cloud Practitioner. At Sanity, he partners with enterprise organizations to design structured Content Operating Systems, event-driven Sanity Functions, and compiled Context Knowledge Bases served over the Model Context Protocol (MCP). Through CodingCat.dev, Alex has built a multi-channel developer media network reaching 61.2K+ YouTube subscribers and 405K+ views—producing dedicated product launches, technical tutorials, and long-form podcast interviews with the creators of the modern web stack.\n\nAlex holds a Master of Science degree from Grand Valley State University (GVSU) and began his engineering career building mission-critical SAP ABAP and Manufacturing Execution Systems (MES) for global office furniture manufacturers. That foundation in rigorous enterprise systems shapes how he approaches developer relations, product storytelling, and AI engineering today. Based in Grand Rapids, Michigan, Alex is a frequent keynote speaker, workshop host, podcast guest, and custom podcast producer for developer-first brands worldwide.",
		fullFirst:
			"I’m a Senior Solutions Engineer at Sanity.io, Founder and Host of CodingCat.dev, a Google Developer Expert (GDE), and an AWS Certified Cloud Practitioner. At Sanity, I partner with enterprise engineering teams to design structured Content Operating Systems, event-driven Sanity Functions, and compiled Context Knowledge Bases served over the Model Context Protocol (MCP). Through CodingCat.dev, I’ve built a multi-channel developer media network reaching 61.2K+ YouTube subscribers and 405K+ views—producing dedicated product videos, tutorials, and long-form podcast conversations with the builders behind today’s most impactful web frameworks and cloud platforms.\n\nI hold a Master of Science degree from Grand Valley State University (GVSU) and started my career writing SAP ABAP before architecting a full Manufacturing Execution System (MES) for a major office furniture manufacturer. That background in mission-critical enterprise systems drives how I approach developer marketing, product storytelling, and AI architecture today. Based in Grand Rapids, Michigan, I partner with CMOs, DevRel leads, and event organizers for conference keynotes, hands-on workshops, YouTube video creation, and podcast hosting.",
	},
};

export const SEED_HEADSHOTS: HeadshotItem[] = [
	{
		_id: "headshot-studio-dark",
		_type: "headshot",
		title: "Studio Portrait (Conference Default)",
		caption:
			"High-contrast portrait optimized for dark conference schedules, speaker grids, and social cards.",
		primaryFocalTag: "Studio Dark",
		alt: "Alex Patterson — Official Speaker Portrait",
		sanityBaseUrl:
			"https://cdn.sanity.io/images/hfh83o0w/production/a606dfaa381aab08ddbe16a33fe1d3e1fb37c927-400x400.jpg",
		fallbackLocalUrl: "/headshots/alex_headshot_1.webp",
		assetId: "image-a606dfaa381aab08ddbe16a33fe1d3e1fb37c927-400x400-jpg",
		hotspot: { x: 0.5, y: 0.42, height: 0.8, width: 0.8 },
		dimensions: { width: 1000, height: 1000, aspectRatio: 1 },
	},
	{
		_id: "headshot-keynote-stage",
		_type: "headshot",
		title: "Warm Keynote & Podcast Glow",
		caption:
			"Warm ambient lighting backdrop suited for keynote announcements, fireside chats, and hero banners.",
		primaryFocalTag: "Keynote Stage",
		alt: "Alex Patterson — Warm Keynote Backdrop Headshot",
		sanityBaseUrl:
			"https://cdn.sanity.io/images/hfh83o0w/production/e4c3255612674b2f16f75c90b24a42f85ae98109-1000x1000.jpg",
		fallbackLocalUrl: "/headshots/alex_fire.webp",
		assetId: "image-e4c3255612674b2f16f75c90b24a42f85ae98109-1000x1000-jpg",
		hotspot: { x: 0.5, y: 0.45, height: 0.85, width: 0.85 },
		dimensions: { width: 1000, height: 1000, aspectRatio: 1 },
	},
	{
		_id: "headshot-studio-soundproof",
		_type: "headshot",
		title: "CodingCat.dev Studio Booth",
		caption:
			"In-studio shot with acoustic paneling and laptop stickers—ideal for developer workshops and podcasts.",
		primaryFocalTag: "Studio Soundproof",
		alt: "Alex Patterson — Recording Studio Headshot",
		sanityBaseUrl:
			"https://cdn.sanity.io/images/hfh83o0w/production/52c6b886a0c8a719536b3d1f97b82330b29e0ec2-1000x1000.jpg",
		fallbackLocalUrl: "/headshots/alex_soundproof.webp",
		assetId: "image-52c6b886a0c8a719536b3d1f97b82330b29e0ec2-1000x1000-jpg",
		hotspot: { x: 0.5, y: 0.44, height: 0.85, width: 0.85 },
		dimensions: { width: 1000, height: 1000, aspectRatio: 1 },
	},
	{
		_id: "headshot-casual-outdoor",
		_type: "headshot",
		title: "Casual Outdoor Portrait",
		caption:
			"Natural daylight portrait in Europe—great for community events, panels, and editorial profiles.",
		primaryFocalTag: "Casual",
		alt: "Alex Patterson — Casual Outdoor Headshot",
		sanityBaseUrl:
			"https://cdn.sanity.io/images/hfh83o0w/production/de0f6fd275173866f415dea4def74a391620ce60-1000x1000.jpg",
		fallbackLocalUrl: "/headshots/alex_casual.webp",
		assetId: "image-de0f6fd275173866f415dea4def74a391620ce60-1000x1000-jpg",
		hotspot: { x: 0.5, y: 0.4, height: 0.85, width: 0.85 },
		dimensions: { width: 1000, height: 1000, aspectRatio: 1 },
	},
];

export const SEED_TALK_ABSTRACTS: TalkAbstract[] = [
	{
		_id: "talk-five-layers-agentic-context",
		_type: "talkAbstract",
		title:
			"From Naive Vector RAG to Compiled Knowledge: The Five Layers of Agentic Context",
		slug: "five-layers-of-agentic-context-compiled-knowledge-mcp",
		format: "keynote",
		status: "active",
		tags: [
			"Sanity",
			"MCP",
			"Agentic AI",
			"Context Engineering",
			"Architecture",
		],
		abstract:
			"Most enterprise AI agents fail in production not because the model is weak, but because teams dump every PDF, wiki page, and Slack thread into a single vector database and force the LLM to resolve conflicting claims at query time. In this keynote, we dissect the five distinct layers of agentic context—Situation, Records, Memory, Process, and Canon—which move at different speeds and have different owners. You will see how pre-compiling structured datasets and documentation into human-verified topic outlines served over Context MCP slashes token costs, surfaces contradictory claims before deployment, and lets fast, inexpensive models outperform frontier models running on uncurated RAG.",
		takeaways: [
			"Why 'company brain' vector stores degrade into high-latency data swamps for customer-facing agents.",
			"How to separate Situation, Records, Memory, Process, and Canon in your architecture.",
			"Live demonstration of an outline-first Context MCP retrieval workflow using Sanity Knowledge Bases.",
		],
	},
	{
		_id: "talk-zero-touch-devrel-mcp",
		_type: "talkAbstract",
		title:
			"Zero-Touch DevRel: Building Autonomous Content & Activity Pipelines with MCP, Sanity, and Cloudflare D1",
		slug: "zero-touch-devrel-mcp-sanity-cloudflare-d1",
		format: "workshop",
		status: "active",
		tags: ["MCP", "Cloudflare Workers", "Cloudflare D1", "Sanity", "OAuth 2.1"],
		abstract:
			"Developer advocates and solutions engineers spend far too much time manually copying metrics, formatting syndication posts, and updating speaker kits across half a dozen dashboards. In this hands-on workshop, we build a production Model Context Protocol (MCP) server hosted on Cloudflare Workers and D1 (modeled after devrel.codingcat.dev) paired with Sanity event-driven Functions. Attendees will wire up OAuth 2.1 with PKCE, AES-256-GCM encrypted credential vaults in D1, and conversational Sanity MCP tools so a single prompt can log GDE/community impact, syndicate technical content, and update a live portfolio with zero CMS friction.",
		takeaways: [
			"Implementing Streamable HTTP MCP servers on Cloudflare Workers with D1 SQLite storage.",
			"Securing multi-provider API credentials with Better Auth, OAuth 2.1, and Web Crypto AES-256-GCM.",
			"Automating content syndication and schema deployments via Sanity Blueprints and Sanity MCP.",
		],
	},
	{
		_id: "talk-wtf-is-firebase-now",
		_type: "talkAbstract",
		title:
			"What the F*ck is Firebase Now? Navigating Data Connect, Genkit, and Modern App Hosting",
		slug: "what-the-fck-is-firebase-now",
		format: "talk",
		status: "active",
		tags: ["Firebase", "Google Cloud", "PostgreSQL", "Genkit", "GDE"],
		abstract:
			"If your mental model of Firebase is still a NoSQL realtime JSON tree from 2018, you are missing a massive architectural shift. Firebase has evolved into a deeply integrated Google Cloud and AI application platform featuring relational PostgreSQL via Firebase Data Connect, full-stack framework deployments with App Hosting, and type-safe AI flows powered by Genkit. Drawing from years as a Firebase Google Developer Expert (GDE), Alex cuts through the marketing noise to show what works in production, where the sharp edges live, and how Firebase stacks up against modern edge runtimes.",
		takeaways: [
			"When to choose Firestore vs. PostgreSQL-backed Firebase Data Connect with generated GraphQL SDKs.",
			"Building observable, type-safe generative AI workflows using Firebase Genkit.",
			"Practical migration and cost patterns for teams scaling on Google Cloud.",
		],
	},
	{
		_id: "talk-dockerless-serverless-gpus-astro",
		_type: "talkAbstract",
		title:
			"3,000 AI Images for $1: Dockerless Serverless GPUs & Edge SSR with Astro",
		slug: "dockerless-serverless-gpus-and-edge-ssr",
		format: "talk",
		status: "active",
		tags: ["Astro", "Cloudflare Workers", "Serverless GPUs", "Web Performance"],
		abstract:
			"Commercial image generation APIs charge 3–4 cents per generation—a pricing wall that kills creative developer tools and event experiences. What happens when you combine an ultra-fast Astro SSR edge application on Cloudflare Workers with dockerless serverless GPU workers that scale to zero? In this session, we break down the real-world architecture, cold-start benchmarks, and unit economics of generating up to 3,000 AI images per dollar without writing a single Dockerfile.",
		takeaways: [
			"Architecting Astro 7 SSR on Cloudflare Workers with zero cold-start overhead.",
			"Dispatching Python GPU workloads from TypeScript edge routes without maintaining Docker images.",
			"Real-world cost and latency benchmarks comparing hosted AI APIs against serverless GPU endpoints.",
		],
	},
];

export const SEED_SPEAKING_EVENTS: SpeakingEvent[] = [
	{
		_id: "event-gde-summit-vegas-2026",
		_type: "speakingEvent",
		eventName: "Google Developer Experts (GDE) Summit North America",
		talkTitle:
			"Agentic Context & Compiled Knowledge Bases over Model Context Protocol",
		date: "2026-10-08",
		eventFormat: "In-Person",
		city: "Las Vegas, NV",
		country: "USA",
		role: "Speaker",
		eventUrl: "https://developers.google.com/community/experts",
		slidesUrl: "https://codingcat.dev/post/sanity-knowledge-bases",
		videoUrl: "https://www.youtube.com/watch?v=jm5Vq60qYTk",
		featured: true,
		source: "seed",
	},
	{
		_id: "event-sanity-agentic-context-2026",
		_type: "speakingEvent",
		eventName: "Sanity Enterprise Architecture Briefing",
		talkTitle:
			"The Five Layers of Agentic Context: Why Canon Only Turns When Someone Signs Off",
		date: "2026-09-18",
		eventFormat: "In-Person",
		city: "San Francisco, CA",
		country: "USA",
		role: "Keynote",
		eventUrl: "https://www.sanity.io",
		slidesUrl:
			"https://codingcat.dev/post/the-five-layers-of-agentic-context-why-canon-only-turns-when-someone-signs-off",
		featured: true,
		source: "seed",
	},
	{
		_id: "event-cloudflare-mcp-workshop-2026",
		_type: "speakingEvent",
		eventName: "Cloudflare Edge & AI Builders Workshop",
		talkTitle:
			"Hosted MCP Servers with OAuth 2.1 & Encrypted D1 Credential Vaults",
		date: "2026-07-24",
		eventFormat: "In-Person",
		city: "Austin, TX",
		country: "USA",
		role: "Workshop Host",
		eventUrl: "https://devrel.codingcat.dev",
		slidesUrl: "https://github.com/CodingCatDev/devrel-mcp",
		featured: true,
		source: "seed",
	},
	{
		_id: "event-google-io-extended-gr-2026",
		_type: "speakingEvent",
		eventName: "Google I/O Extended Grand Rapids",
		talkTitle:
			"What the F*ck is Firebase Now? GenAI, Data Connect & App Hosting",
		date: "2026-05-28",
		eventFormat: "In-Person",
		city: "Grand Rapids, MI",
		country: "USA",
		role: "Keynote",
		eventUrl: "https://gdg.community.dev/",
		slidesUrl: "https://dev.to/codingcatdev/what-the-fck-is-firebase-now-2iaj",
		featured: true,
		source: "seed",
	},
	{
		_id: "event-beer-city-code-2026",
		_type: "speakingEvent",
		eventName: "Beer City Code",
		talkTitle:
			"Full-Stack Content Operating Systems with Sanity, Astro Islands & Cloudflare Workers",
		date: "2026-04-11",
		eventFormat: "In-Person",
		city: "Grand Rapids, MI",
		country: "USA",
		role: "Workshop Host",
		eventUrl: "https://www.beercitycode.com/",
		featured: false,
		source: "seed",
	},
	{
		_id: "event-gde-global-summit-2025",
		_type: "speakingEvent",
		eventName: "Google Developer Experts Global Summit",
		talkTitle:
			"Automating DevRel Telemetry & Community Impact Reporting with MCP",
		date: "2025-11-12",
		eventFormat: "Virtual",
		city: "Remote",
		country: "Global",
		role: "Speaker",
		eventUrl: "https://developers.google.com/community/experts",
		featured: false,
		source: "seed",
	},
	{
		_id: "event-kcdc-2025",
		_type: "speakingEvent",
		eventName: "Kansas City Developer Conference (KCDC)",
		talkTitle:
			"Edge-Rendered Web Architecture: Moving Beyond Monolithic React Frameworks",
		date: "2025-08-15",
		eventFormat: "In-Person",
		city: "Kansas City, MO",
		country: "USA",
		role: "Speaker",
		eventUrl: "https://www.kcdc.info/",
		featured: false,
		source: "seed",
	},
	{
		_id: "event-firebase-cloud-day-2025",
		_type: "speakingEvent",
		eventName: "Firebase & Cloud Builders Summit",
		talkTitle:
			"Reactive Data Streams & Authentication Patterns Across Web Frameworks",
		date: "2025-03-20",
		eventFormat: "Virtual",
		city: "Remote",
		country: "USA",
		role: "Workshop Host",
		eventUrl: "https://codingcat.dev",
		featured: false,
		source: "seed",
	},
];

// ── D1 DevRel Ledger Sync (`devrel-mcp` database) ─────────────────────────────

interface D1ActivityLogRow {
	id: string;
	program: string;
	activity_type: string;
	title: string;
	description: string | null;
	url: string;
	activity_date: string;
	metrics_json: string | null;
}

async function fetchD1SpeakingEvents(env?: EnvLike): Promise<SpeakingEvent[]> {
	const db = env?.DEVREL_DB as D1Database | undefined;
	if (!db || typeof db.prepare !== "function") {
		return [];
	}

	try {
		// Strictly exclude routine 'content-creation' (tutorials/blog/video posts)
		const stmt = db.prepare(`
			SELECT id, program, activity_type, title, description, url, activity_date, metrics_json
			FROM activity_logs
			WHERE activity_type IN ('public-speaking', 'workshop', 'speaking', 'keynote', 'panel')
			ORDER BY activity_date DESC
			LIMIT 50
		`);
		const { results } = await stmt.all<D1ActivityLogRow>();
		if (!Array.isArray(results) || results.length === 0) {
			return [];
		}

		return results.map((row) => {
			let metrics: Record<string, unknown> = {};
			if (row.metrics_json) {
				try {
					metrics = JSON.parse(row.metrics_json) as Record<string, unknown>;
				} catch {
					// ignore malformed metrics_json
				}
			}

			const isWorkshop = row.activity_type === "workshop";
			const isKeynote =
				row.activity_type === "keynote" ||
				row.title.toLowerCase().includes("keynote");
			const formatRaw = String(metrics.eventFormat ?? metrics.format ?? "");
			const eventFormat: EventFormat =
				formatRaw === "Virtual"
					? "Virtual"
					: formatRaw === "Hybrid"
						? "Hybrid"
						: "In-Person";

			return {
				_id: `d1-${row.id}`,
				_type: "speakingEvent",
				eventName:
					typeof metrics.eventName === "string" && metrics.eventName
						? metrics.eventName
						: row.program === "gde"
							? "Google Developer Expert Engagement"
							: "DevRel Speaking Engagement",
				talkTitle: row.title,
				date: row.activity_date,
				eventFormat,
				city:
					typeof metrics.city === "string" && metrics.city
						? metrics.city
						: eventFormat === "Virtual"
							? "Remote"
							: "USA",
				country:
					typeof metrics.country === "string" && metrics.country
						? metrics.country
						: "USA",
				role: isKeynote ? "Keynote" : isWorkshop ? "Workshop Host" : "Speaker",
				eventUrl: row.url || undefined,
				featured: Boolean(metrics.featured),
				source: "d1",
			};
		});
	} catch {
		return [];
	}
}

// ── Main Data Fetching Orchestrator ───────────────────────────────────────────

export async function getSpeakerKitData(
	env?: EnvLike,
): Promise<SpeakerKitBundle> {
	const config = resolveSanityConfig(env);
	const client = getSanityClient(config);

	let sanityProfile: SpeakerProfile | null = null;
	let authorDoc: {
		_id?: string;
		title?: string;
		avatarUrl?: string;
		socials?: Record<string, string>;
	} | null = null;
	let sanityHeadshots: HeadshotItem[] = [];
	let sanityTalks: TalkAbstract[] = [];
	let sanityEvents: SpeakingEvent[] = [];

	const [profileRes, authorRes, headshotsRes, talksRes, eventsRes, d1Events] =
		await Promise.all([
			client
				.fetch<SpeakerProfile | null>(SPEAKER_PROFILE_QUERY)
				.catch(() => null),
			client
				.fetch<{
					_id?: string;
					title?: string;
					avatarUrl?: string;
					socials?: Record<string, string>;
				} | null>(AUTHOR_FALLBACK_QUERY)
				.catch(() => null),
			client.fetch<HeadshotItem[]>(HEADSHOTS_QUERY).catch(() => []),
			client.fetch<TalkAbstract[]>(TALK_ABSTRACTS_QUERY).catch(() => []),
			client.fetch<SpeakingEvent[]>(SPEAKING_EVENTS_QUERY).catch(() => []),
			fetchD1SpeakingEvents(env),
		]);

	sanityProfile = profileRes;
	authorDoc = authorRes;
	sanityHeadshots = Array.isArray(headshotsRes)
		? headshotsRes.filter((h) => Boolean(h?.sanityBaseUrl))
		: [];
	sanityTalks = Array.isArray(talksRes) ? talksRes : [];
	sanityEvents = Array.isArray(eventsRes)
		? eventsRes.map((e) => ({ ...e, source: "sanity" as const }))
		: [];

	// Merge profile with live author record from codingcat.dev's `production` dataset (`hfh83o0w`)
	const profile: SpeakerProfile = sanityProfile
		? {
				...SEED_SPEAKER_PROFILE,
				...sanityProfile,
				credentials:
					sanityProfile.credentials?.length > 0
						? sanityProfile.credentials
						: SEED_SPEAKER_PROFILE.credentials,
				socialLinks: {
					...SEED_SPEAKER_PROFILE.socialLinks,
					...(sanityProfile.socialLinks ?? {}),
				},
				bios: {
					...SEED_SPEAKER_PROFILE.bios,
					...(sanityProfile.bios ?? {}),
				},
				avatarUrl:
					sanityProfile.avatarUrl ??
					authorDoc?.avatarUrl ??
					SEED_SPEAKER_PROFILE.avatarUrl,
			}
		: {
				...SEED_SPEAKER_PROFILE,
				avatarUrl: authorDoc?.avatarUrl
					? stegaClean(authorDoc.avatarUrl)
					: SEED_SPEAKER_PROFILE.avatarUrl,
			};

	const headshots =
		sanityHeadshots.length > 0
			? sanityHeadshots
			: SEED_HEADSHOTS.map((h, idx) =>
					idx === 0 && authorDoc?.avatarUrl
						? { ...h, sanityBaseUrl: stegaClean(authorDoc.avatarUrl) }
						: h,
				);

	const talks = sanityTalks.length > 0 ? sanityTalks : SEED_TALK_ABSTRACTS;

	const baseEvents =
		sanityEvents.length > 0 ? sanityEvents : SEED_SPEAKING_EVENTS;

	// Merge D1 speaking events without duplicating by title+date
	const seenKeys = new Set(
		baseEvents.map((e) => `${e.date}::${e.talkTitle.toLowerCase()}`),
	);
	const mergedEvents = [...baseEvents];
	for (const d1Event of d1Events) {
		const key = `${d1Event.date}::${d1Event.talkTitle.toLowerCase()}`;
		if (!seenKeys.has(key)) {
			seenKeys.add(key);
			mergedEvents.push(d1Event);
		}
	}
	mergedEvents.sort((a, b) => b.date.localeCompare(a.date));

	const hasLiveSpeakerDocs = Boolean(
		sanityProfile ||
			sanityHeadshots.length > 0 ||
			sanityTalks.length > 0 ||
			sanityEvents.length > 0,
	);

	return {
		profile,
		headshots,
		talks,
		events: mergedEvents,
		meta: {
			source: hasLiveSpeakerDocs ? "sanity-live" : "sanity-hybrid-seed",
			d1SyncedCount: d1Events.length,
			generatedAt: new Date().toISOString(),
		},
	};
}
