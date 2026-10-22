/**
 * High-performance, edge-compatible HTML to Markdown converter.
 * Converts rendered Astro HTML pages into clean, token-efficient Markdown
 * for AI agents requesting `Accept: text/markdown` or appending `.md`.
 */

export function htmlToMarkdown(html: string, pageUrl?: string): string {
	if (!html) {
		return "";
	}

	const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
	const pageTitle = titleMatch ? decodeEntities(titleMatch[1].trim()) : "";

	let text = html
		.replace(/<!--[\s\S]*?-->/g, "")
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
		.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
		.replace(/<dialog\b[^<]*(?:(?!<\/dialog>)<[^<]*)*<\/dialog>/gi, "")
		.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, "")
		.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
		.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "");

	const mainMatch = text.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
	if (mainMatch) {
		text = mainMatch[1];
	} else {
		const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		if (bodyMatch) {
			text = bodyMatch[1];
		}
	}

	text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_match, code) => {
		return `\`${decodeEntities(stripTags(code))}\``;
	});

	text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
	text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
	text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
	text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");

	text = text.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2** ");
	text = text.replace(/\*\* +([.,!?:;])/g, "**$1");
	text = text.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");

	text = text.replace(
		/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
		(_match, href, label) => {
			const cleanLabel = stripTags(label).trim();
			if (!cleanLabel) {
				return "";
			}
			return `[${cleanLabel}](${href})`;
		},
	);

	text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, item) => {
		return `\n- ${stripTags(item).replace(/\s+/g, " ").trim()}`;
	});
	text = text.replace(/<\/(ul|ol)>/gi, "\n\n");

	text = text.replace(/<hr\s*[/]?>/gi, "\n\n---\n\n");
	text = text.replace(/<br\s*[/]?>/gi, "\n");
	text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");

	text = stripTags(text);
	text = decodeEntities(text);

	text = text
		.split("\n")
		.map((line) => line.trimEnd())
		.join("\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim();

	if (pageTitle && !text.startsWith("# ")) {
		text = `# ${pageTitle}\n\n${text}`;
	}

	if (pageUrl) {
		text = `> Canonical URL: ${pageUrl}\n\n${text}`;
	}

	return text;
}

export function estimateTokens(text: string): number {
	return Math.max(1, Math.ceil(text.length / 4));
}

function stripTags(str: string): string {
	return str.replace(/<[^>]+>/g, "");
}

function decodeEntities(str: string): string {
	return str
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, " ");
}
