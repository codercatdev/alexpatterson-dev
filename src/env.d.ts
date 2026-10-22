/// <reference path="../.astro/types.d.ts" />
import "react";

declare global {
	namespace App {
		interface Locals {
			siteUrl: URL;
		}
	}

	namespace Cloudflare {
		interface Env {
			PUBLIC_SANITY_PROJECT_ID?: string;
			PUBLIC_SANITY_DATASET?: string;
			PUBLIC_SANITY_API_VERSION?: string;
			PUBLIC_SANITY_STUDIO_URL?: string;
			SANITY_API_READ_TOKEN?: string;
			SANITY_API_WRITE_TOKEN?: string;
			GEMINI_API_KEY?: string;
			SITE_URL?: string;
			DEVREL_LEDGER_URL?: string;
			DEVREL_DB?: D1Database;
			DB?: D1Database;
			AI?: unknown;
		}
	}

	namespace astroHTML.JSX {
		interface FormHTMLAttributes {
			toolname?: string;
			tooldescription?: string;
			"tool-name"?: string;
			"tool-description"?: string;
		}
		interface InputHTMLAttributes {
			toolparamdescription?: string;
			"tool-param-description"?: string;
		}
		interface SelectHTMLAttributes {
			toolparamdescription?: string;
			"tool-param-description"?: string;
		}
		interface TextareaHTMLAttributes {
			toolparamdescription?: string;
			"tool-param-description"?: string;
		}
		interface ButtonHTMLAttributes {
			toolname?: string;
			tooldescription?: string;
			"tool-name"?: string;
			"tool-description"?: string;
		}
	}
}

declare module "sanity" {
	export interface Rule {
		required(): Rule;
		email(): Rule;
		min(n: number): Rule;
		max(n: number): Rule;
	}
	export function defineType<T extends Record<string, unknown>>(schema: T): T;
	export function defineField<T extends Record<string, unknown>>(
		field: T & { validation?: (rule: Rule) => unknown },
	): T;
	export function defineArrayMember<T extends Record<string, unknown>>(
		member: T,
	): T;
}

declare module "react" {
	// biome-ignore lint/correctness/noUnusedVariables: Augmenting React HTMLAttributes generic interface
	interface FormHTMLAttributes<T> {
		toolname?: string;
		tooldescription?: string;
		"tool-name"?: string;
		"tool-description"?: string;
	}
	// biome-ignore lint/correctness/noUnusedVariables: Augmenting React HTMLAttributes generic interface
	interface InputHTMLAttributes<T> {
		toolparamdescription?: string;
		"tool-param-description"?: string;
	}
	// biome-ignore lint/correctness/noUnusedVariables: Augmenting React HTMLAttributes generic interface
	interface SelectHTMLAttributes<T> {
		toolparamdescription?: string;
		"tool-param-description"?: string;
	}
	// biome-ignore lint/correctness/noUnusedVariables: Augmenting React HTMLAttributes generic interface
	interface TextareaHTMLAttributes<T> {
		toolparamdescription?: string;
		"tool-param-description"?: string;
	}
	// biome-ignore lint/correctness/noUnusedVariables: Augmenting React HTMLAttributes generic interface
	interface ButtonHTMLAttributes<T> {
		toolname?: string;
		tooldescription?: string;
		"tool-name"?: string;
		"tool-description"?: string;
	}
}
