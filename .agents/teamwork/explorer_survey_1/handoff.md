# Route & Content Parity Audit Handoff Report

## 1. Observation
- **Next.js Reference (`apps/web`)**:
  - Contains 37 `page.tsx` routes across `(main)`, `(dashboard)`, and `(sponsor-portal)`.
  - Public routes in `(main)`: Home (`/`), `blog`, `blog/page/[num]`, `post/[slug]`, `podcasts`, `podcasts/page/[num]`, `podcast/[slug]`, `podcast/preview/[token]`, `authors`, `authors/page/[num]`, `author/[slug]`, `guests`, `guests/page/[num]`, `guest/[slug]`, `sponsors`, `sponsors/page/[num]`, `sponsor/[slug]`, `[slug]`, `pro`, `search`, `sponsorships`.
  - Stubs (`/blog/page`, `/podcasts/page`, `/authors`, `/authors/page`, `/guests`, `/guests/page`, `/sponsors`, `/sponsors/page`) in Next.js execute `redirect("/.../page/1")`.
  - Preview routes in Next.js: `app/api/draft-mode/enable/route.tsx` and `app/api/draft-mode/disable/route.tsx`.
  - Feeds and SEO: `app/(post)/blog/rss.xml/route.ts`, `rss.json/route.ts`, `app/(podcast)/podcasts/rss.xml/route.ts`, `rss.json/route.ts`, `app/sitemap.ts`, `app/robots.ts`.
- **Astro Target (`apps/site`)**:
  - `astro.config.mjs` lines 73-82 defines 302 redirects for `/blog/page`, `/podcasts/page`, `/authors`, `/authors/page`, `/guests`, `/guests/page`, `/sponsors`, `/sponsors/page` to their respective `/page/1` endpoints.
  - Core content pages exist in `src/pages/`: `index.astro`, `blog/index.astro`, `blog/page/[num].astro`, `post/[slug].astro`, `podcasts/index.astro`, `podcasts/page/[num].astro`, `podcast/[slug].astro`, `authors/page/[num].astro`, `author/[slug].astro`, `guests/page/[num].astro`, `guest/[slug].astro`, `sponsors/page/[num].astro`, `sponsor/[slug].astro`, `[slug].astro`, `404.astro`.
  - Feeds and SEO exist: `blog/rss.xml.ts`, `blog/rss.json.ts`, `podcasts/rss.xml.ts`, `podcasts/rss.json.ts`, `sitemap.xml.ts`, `robots.txt.ts`.
  - `Header.astro` lines 28-46 contains `<a href="/search" aria-label="Search">`.
  - `sitemap.xml.ts` line 21 contains `${origin}/search`.
  - However, `apps/site/src/pages/search.astro` does NOT exist.
  - `src/lib/sanity/preview.ts`, `src/middleware.ts`, and `src/components/DraftModeToggle.astro` reference `/api/draft-mode/enable` and `/api/draft-mode/disable`.
  - However, `apps/site/src/pages/api/draft-mode/` does NOT exist.
  - `apps/site/src/pages/sponsorships.astro` does NOT exist (falls back to generic `[slug].astro`), and `/api/sponsorship.ts` does not exist.
  - `pnpm --filter @codingcatdev/site typecheck` reports 0 errors across 102 files.
  - `pnpm --filter @codingcatdev/site build` succeeds in 1.0s creating Cloudflare server entrypoint.

## 2. Logic Chain
1. `Header.astro` and `sitemap.xml.ts` advertise `/search`. Without `src/pages/search.astro`, the router falls back to `src/pages/[slug].astro`.
2. In `src/pages/[slug].astro`, `pageQuery` looks up `*[_type == "page" && slug.current == "search"][0]`. Since there is no `page` document with slug `"search"`, it returns a 404 response. Thus, search is broken for visitors and search crawlers.
3. In `DraftModeToggle.astro`, the exit button submits a POST request to `/api/draft-mode/disable`. Because no file exists at `src/pages/api/draft-mode/disable.ts`, the browser receives a 404 response and users cannot exit preview mode.
4. Similarly, Sanity Studio Presentation or editors navigating to `/api/draft-mode/enable` receive a 404, preventing draft preview.
5. In Next.js, `/sponsorships` is a dedicated conversion page with pricing tiers and a Turnstile form submitting to `/api/sponsorship`. In Astro, it degrades to a plain markdown content page without tiers or contact form.
6. In `src/lib/feeds.ts`, podcast feed items strictly output `<guid isPermaLink="false">${escapeXml(item._id)}</guid>` and iTunes namespace elements matching baseline `podcasts_rss.xml`, guaranteeing syndication stability across Apple Podcasts and Spotify.

## 3. Caveats
- Algolia API credentials (`NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY`, `NEXT_PUBLIC_ALGOLIA_INDEX`) are defined in Next.js `.env` and must be mapped to Cloudflare Workers environment variables or public Vite variables (`PUBLIC_ALGOLIA_*`).
- Cloudflare Turnstile keys (`NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`, `PRIVATE_CLOUDFLARE_TURNSTILE_SECRET_KEY`) are needed for the sponsorship form.
- The dashboard (`/dashboard/*`) and sponsor portal (`/portal/*`) are explicitly excluded from `apps/site` and moving to `admin.codingcat.dev`.
- Transcripts exist as a field on `podcast` documents in Sanity but were not displayed in the Next.js UI; rendering them in Astro is optional.

## 4. Conclusion
The Astro site migration is substantially complete (~85% public route parity) with excellent architecture, rigorous Portable Text rendering, clean Shiki code highlighting, exact feed GUID preservation, and working Cloudflare build configurations. Full parity requires resolving three key missing features:
1. Implement `src/pages/search.astro` with an Algolia search client island.
2. Implement `src/pages/api/draft-mode/enable.ts` and `src/pages/api/draft-mode/disable.ts`.
3. Implement `src/pages/sponsorships.astro` and `/api/sponsorship.ts`.

## 5. Verification Method
- Independent verification commands:
  - Run `pnpm --filter @codingcatdev/site typecheck` (verifies TypeScript & Astro check).
  - Run `pnpm --filter @codingcatdev/site build` (verifies SSR bundling).
  - Check missing routes: `test -f apps/site/src/pages/search.astro` (currently returns 1).
  - Check missing draft routes: `test -f apps/site/src/pages/api/draft-mode/enable.ts` (currently returns 1).
  - Check baseline snapshot diff: `diff -u apps/site/baseline/robots.txt <(curl -s http://localhost:4321/robots.txt)`.
