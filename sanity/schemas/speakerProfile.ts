import { defineArrayMember, defineField, defineType } from "sanity";

export const speakerProfile = defineType({
	name: "speakerProfile",
	title: "Speaker Profile (Singleton)",
	type: "document",
	fields: [
		defineField({
			name: "name",
			title: "Full Name",
			type: "string",
			initialValue: "Alex Patterson",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "headline",
			title: "Executive Headline",
			type: "string",
			description:
				"Primary positioning statement for conference organizers and enterprise partners.",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "credentials",
			title: "Role & Credential Badges",
			type: "array",
			of: [
				defineArrayMember({
					type: "object",
					name: "credentialBadge",
					fields: [
						defineField({
							name: "label",
							title: "Badge Label",
							type: "string",
							validation: (rule) => rule.required(),
						}),
						defineField({
							name: "url",
							title: "Verification / Organization URL",
							type: "url",
						}),
						defineField({
							name: "accent",
							title: "Badge Accent",
							type: "string",
							options: {
								list: [
									{ title: "Violet (Primary / Sanity / AI)", value: "violet" },
									{ title: "Emerald (CodingCat.dev / Live)", value: "emerald" },
									{ title: "Zinc (Neutral)", value: "zinc" },
								],
								layout: "radio",
							},
							initialValue: "zinc",
						}),
					],
				}),
			],
		}),
		defineField({
			name: "location",
			title: "Location",
			type: "string",
			initialValue: "Grand Rapids, MI",
		}),
		defineField({
			name: "homeAirport",
			title: "Home Airport Code",
			type: "string",
			initialValue: "GRR (Grand Rapids) / DTW (Detroit)",
		}),
		defineField({
			name: "education",
			title: "Education",
			type: "string",
			initialValue: "M.S., Grand Valley State University (GVSU)",
		}),
		defineField({
			name: "bookingUrl",
			title: "Primary Booking / Calendar URL",
			type: "url",
			initialValue: "https://codingcat.dev/book",
		}),
		defineField({
			name: "speakerEmail",
			title: "Direct Speaker Inquiry Email",
			type: "string",
			initialValue: "alex@codingcat.dev",
		}),
		defineField({
			name: "availableForSpeaking",
			title: "Available for Keynotes & Workshops",
			type: "boolean",
			initialValue: true,
		}),
		defineField({
			name: "socialLinks",
			title: "Social & Community Links",
			type: "object",
			fields: [
				defineField({
					name: "codingcat",
					title: "CodingCat.dev URL",
					type: "url",
					initialValue: "https://codingcat.dev",
				}),
				defineField({
					name: "github",
					title: "GitHub URL",
					type: "url",
					initialValue: "https://github.com/codercatdev",
				}),
				defineField({
					name: "linkedin",
					title: "LinkedIn URL",
					type: "url",
					initialValue: "https://www.linkedin.com/in/codercatdev/",
				}),
				defineField({
					name: "tiktok",
					title: "TikTok URL",
					type: "url",
					initialValue: "https://www.tiktok.com/@codingcatdev",
				}),
				defineField({
					name: "twitch",
					title: "Twitch URL",
					type: "url",
					initialValue: "https://www.twitch.tv/codingcatdev/",
				}),
				defineField({
					name: "x",
					title: "X (Twitter) URL",
					type: "url",
					initialValue: "https://x.com/codercatdev",
				}),
				defineField({
					name: "youtube",
					title: "YouTube URL",
					type: "url",
					initialValue: "https://www.youtube.com/codingcatdev",
				}),
				defineField({
					name: "aws",
					title: "AWS Builder Center URL",
					type: "url",
					initialValue: "https://builder.aws.com/community/@codingcatdev",
				}),
				defineField({
					name: "gdeProfile",
					title: "Google Developer Expert Directory URL",
					type: "url",
					initialValue: "https://developers.google.com/profile/u/codercatdev",
				}),
			],
		}),
		defineField({
			name: "bios",
			title: "Speaker Bio Variations (Length × Perspective)",
			type: "object",
			fields: [
				defineField({
					name: "shortThird",
					title: "Short (~50w) — 3rd Person (Conference Default)",
					type: "text",
					rows: 4,
					validation: (rule) => rule.required(),
				}),
				defineField({
					name: "shortFirst",
					title: "Short (~50w) — 1st Person",
					type: "text",
					rows: 4,
					validation: (rule) => rule.required(),
				}),
				defineField({
					name: "mediumThird",
					title: "Medium (~120w) — 3rd Person",
					type: "text",
					rows: 6,
					validation: (rule) => rule.required(),
				}),
				defineField({
					name: "mediumFirst",
					title: "Medium (~120w) — 1st Person",
					type: "text",
					rows: 6,
					validation: (rule) => rule.required(),
				}),
				defineField({
					name: "fullThird",
					title: "Full Executive (~200w) — 3rd Person",
					type: "text",
					rows: 9,
					validation: (rule) => rule.required(),
				}),
				defineField({
					name: "fullFirst",
					title: "Full Executive (~200w) — 1st Person",
					type: "text",
					rows: 9,
					validation: (rule) => rule.required(),
				}),
			],
		}),
	],
	preview: {
		select: {
			title: "name",
			subtitle: "headline",
		},
	},
});

export default speakerProfile;
