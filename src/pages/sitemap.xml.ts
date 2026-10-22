import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";
	const lastmod = new Date().toISOString().split("T")[0];

	const urls = [
		{ loc: `${origin}/`, priority: "1.0" },
		{ loc: `${origin}/about`, priority: "0.8" },
		{ loc: `${origin}/contact`, priority: "0.8" },
		{ loc: `${origin}/privacy`, priority: "0.7" },
		{ loc: `${origin}/developers`, priority: "0.8" },
		{ loc: `${origin}/speaker-kit.json`, priority: "0.9" },
		{ loc: `${origin}/mcp`, priority: "0.9" },
		{ loc: `${origin}/llms.txt`, priority: "0.8" },
		{ loc: `${origin}/llms-full.txt`, priority: "0.8" },
		{ loc: `${origin}/AGENTS.md`, priority: "0.8" },
		{ loc: `${origin}/auth.md`, priority: "0.6" },
		{ loc: `${origin}/pricing.md`, priority: "0.6" },
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `	<url>
		<loc>${u.loc}</loc>
		<lastmod>${lastmod}</lastmod>
		<changefreq>weekly</changefreq>
		<priority>${u.priority}</priority>
	</url>`,
	)
	.join("\n")}
</urlset>`;

	return new Response(xml, {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};
