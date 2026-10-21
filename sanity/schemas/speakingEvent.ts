import { defineField, defineType } from "sanity";

export const speakingEvent = defineType({
	name: "speakingEvent",
	title: "Speaking Event",
	type: "document",
	fields: [
		defineField({
			name: "eventName",
			title: "Conference / Event Name",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "talkTitle",
			title: "Talk / Session Title",
			type: "string",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "date",
			title: "Event Date (YYYY-MM-DD)",
			type: "date",
			options: {
				dateFormat: "YYYY-MM-DD",
			},
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "eventFormat",
			title: "Attendance Format",
			type: "string",
			options: {
				list: [
					{ title: "In-Person", value: "In-Person" },
					{ title: "Virtual", value: "Virtual" },
					{ title: "Hybrid", value: "Hybrid" },
				],
				layout: "radio",
			},
			initialValue: "In-Person",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "city",
			title: "City / State",
			type: "string",
			description: "e.g., Las Vegas, NV or Remote",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "country",
			title: "Country",
			type: "string",
			initialValue: "USA",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "role",
			title: "Speaker Role",
			type: "string",
			options: {
				list: [
					{ title: "Keynote", value: "Keynote" },
					{ title: "Speaker", value: "Speaker" },
					{ title: "Workshop Host", value: "Workshop Host" },
					{ title: "Panelist", value: "Panelist" },
				],
				layout: "radio",
			},
			initialValue: "Speaker",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "eventUrl",
			title: "Event URL",
			type: "url",
		}),
		defineField({
			name: "slidesUrl",
			title: "Slides Deck URL",
			type: "url",
		}),
		defineField({
			name: "videoUrl",
			title: "Recording / Video URL",
			type: "url",
		}),
		defineField({
			name: "featured",
			title: "Featured Engagement",
			type: "boolean",
			initialValue: false,
		}),
	],
	orderings: [
		{
			title: "Event Date (Newest First)",
			name: "dateDesc",
			by: [{ field: "date", direction: "desc" }],
		},
	],
	preview: {
		select: {
			title: "eventName",
			subtitle: "talkTitle",
		},
	},
});

export default speakingEvent;
