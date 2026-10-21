import { defineArrayMember, defineField, defineType } from "sanity";

export const talkAbstract = defineType({
	name: "talkAbstract",
	title: "Talk Abstract",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Talk Title",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: {
				source: "title",
				maxLength: 96,
			},
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "format",
			title: "Session Format",
			type: "string",
			options: {
				list: [
					{ title: "Keynote (30–45 min)", value: "keynote" },
					{ title: "Workshop (90–180 min)", value: "workshop" },
					{ title: "Breakout / Technical Talk (30–45 min)", value: "talk" },
				],
				layout: "radio",
			},
			initialValue: "talk",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "status",
			title: "Availability Status",
			type: "string",
			options: {
				list: [
					{ title: "Active (Ready to Run)", value: "active" },
					{ title: "Archived", value: "archived" },
				],
				layout: "radio",
			},
			initialValue: "active",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "tags",
			title: "Technical Topic Tags",
			type: "array",
			of: [defineArrayMember({ type: "string" })],
		}),
		defineField({
			name: "abstract",
			title: "Full Session Abstract",
			type: "text",
			rows: 6,
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "takeaways",
			title: "Key Audience Takeaways",
			type: "array",
			of: [defineArrayMember({ type: "string" })],
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
			subtitle: "format",
		},
	},
});

export default talkAbstract;
