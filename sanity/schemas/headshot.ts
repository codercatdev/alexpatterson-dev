import { defineField, defineType } from "sanity";

export const headshot = defineType({
	name: "headshot",
	title: "Speaker Headshot",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			description: "e.g., Studio Dark, Keynote Stage, Casual",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "image",
			title: "High-Res Speaker Photo",
			type: "image",
			options: {
				hotspot: true,
			},
			fields: [
				defineField({
					name: "alt",
					title: "Alt Text",
					type: "string",
					validation: (rule) => rule.required(),
				}),
			],
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "caption",
			title: "Caption / Usage Notes",
			type: "string",
			description:
				"Recommended context for conference organizers (e.g., Dark background badges, Keynote banners).",
		}),
		defineField({
			name: "primaryFocalTag",
			title: "Primary Focal Tag",
			type: "string",
			options: {
				list: [
					{ title: "Studio Dark", value: "Studio Dark" },
					{ title: "Keynote Stage", value: "Keynote Stage" },
					{ title: "Casual", value: "Casual" },
					{ title: "Studio Soundproof", value: "Studio Soundproof" },
				],
				layout: "radio",
			},
			initialValue: "Studio Dark",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "order",
			title: "Display Order",
			type: "number",
			initialValue: 1,
		}),
	],
	orderings: [
		{
			title: "Display Order",
			name: "orderAsc",
			by: [{ field: "order", direction: "asc" }],
		},
	],
	preview: {
		select: {
			title: "title",
			subtitle: "primaryFocalTag",
			media: "image",
		},
	},
});

export default headshot;
