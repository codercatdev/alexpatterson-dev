/// <reference path="../.astro/types.d.ts" />

declare namespace App {
	interface Locals {
		siteUrl: URL;
	}
}

declare namespace Cloudflare {
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
