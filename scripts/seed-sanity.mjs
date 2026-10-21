#!/usr/bin/env node
/**
 * Seeds `speakerProfile`, `headshot`, `talkAbstract`, and `speakingEvent`
 * documents into Sanity project `hfh83o0w` (`production` dataset).
 *
 * Usage:
 *   SANITY_API_WRITE_TOKEN=<token> npm run seed:sanity
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || "hfh83o0w";
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";
const token =
	process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_AUTH_TOKEN || "";

if (!token) {
	console.error(
		"[seed:sanity] Missing SANITY_API_WRITE_TOKEN or SANITY_AUTH_TOKEN environment variable.",
	);
	process.exit(1);
}

const client = createClient({
	projectId,
	dataset,
	apiVersion: "2025-09-30",
	token,
	useCdn: false,
});

const HEADSHOT_FILES = [
	{
		_id: "headshot-studio-dark",
		title: "Studio Portrait (Conference Default)",
		caption:
			"High-contrast portrait optimized for dark conference schedules, speaker grids, and social cards.",
		primaryFocalTag: "Studio Dark",
		alt: "Alex Patterson — Official Speaker Portrait",
		file: "public/headshots/alex_headshot_1.jpg",
		order: 1,
	},
	{
		_id: "headshot-keynote-stage",
		title: "Warm Keynote & Podcast Glow",
		caption:
			"Warm ambient lighting backdrop suited for keynote announcements, fireside chats, and hero banners.",
		primaryFocalTag: "Keynote Stage",
		alt: "Alex Patterson — Warm Keynote Backdrop Headshot",
		file: "public/headshots/alex_fire.jpg",
		order: 2,
	},
	{
		_id: "headshot-studio-soundproof",
		title: "CodingCat.dev Studio Booth",
		caption:
			"In-studio shot with acoustic paneling and laptop stickers—ideal for developer workshops and podcasts.",
		primaryFocalTag: "Studio Soundproof",
		alt: "Alex Patterson — Recording Studio Headshot",
		file: "public/headshots/alex_soundproof.jpg",
		order: 3,
	},
	{
		_id: "headshot-casual-outdoor",
		title: "Casual Outdoor Portrait",
		caption:
			"Natural daylight portrait in Europe—great for community events, panels, and editorial profiles.",
		primaryFocalTag: "Casual",
		alt: "Alex Patterson — Casual Outdoor Headshot",
		file: "public/headshots/alex_casual.jpg",
		order: 4,
	},
];

async function run() {
	console.log(`[seed:sanity] Seeding ${projectId}/${dataset}...`);

	for (const item of HEADSHOT_FILES) {
		const absPath = path.resolve(process.cwd(), item.file);
		if (!fs.existsSync(absPath)) {
			continue;
		}
		const asset = await client.assets.upload(
			"image",
			fs.createReadStream(absPath),
			{
				filename: path.basename(absPath),
			},
		);
		await client.createOrReplace({
			_id: item._id,
			_type: "headshot",
			title: item.title,
			caption: item.caption,
			primaryFocalTag: item.primaryFocalTag,
			order: item.order,
			image: {
				_type: "image",
				alt: item.alt,
				asset: {
					_type: "reference",
					_ref: asset._id,
				},
			},
		});
		console.log(`[seed:sanity] Upserted headshot: ${item._id} (${asset._id})`);
	}

	console.log("[seed:sanity] Done.");
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
