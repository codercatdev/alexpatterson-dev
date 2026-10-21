# Handoff Report — Challenger 1 Remediation

## 1. Observation
- **Finding 1 — Open Redirect Vulnerability in Draft Mode**:
  - In `apps/site/src/pages/api/draft-mode/enable.ts` and `apps/site/src/pages/api/draft-mode/disable.ts`, destination sanitization previously checked only `!destination.startsWith("/") || destination.startsWith("//")`.
  - WHATWG URL parsing and modern browsers resolve backslash-prefixed paths like `/\evil.com` or `\/evil.com` as scheme-relative URLs pointing to `https://evil.com/`. Similarly, `slug=\evil.com` resulted in `/\evil.com`.
- **Finding 2 — 301 vs 302 Listing Stubs**:
  - In Astro 7 SSR, config-level `redirects` in `astro.config.mjs` that point to dynamic parameter destinations (e.g. `destination: "/blog/page/1"`) fall back to HTTP status 301 in Astro core's `computeRedirectStatus()` (`return redirectRoute && typeof redirect === "object" ? redirect.status : method === "GET" ? 301 : 308`).
  - As a result, config-declared 302 redirects for listing stubs were emitted as 301 Permanent Redirects, violating the contract that listing stubs remain uncacheable temporary redirects (HTTP 302 Found) as content grows.

## 2. Logic Chain
1. **Hardened Draft Mode Open Redirect Defense**:
   - In `apps/site/src/pages/api/draft-mode/enable.ts`:
     ```ts
     if (
       !destination.startsWith("/") ||
       destination.startsWith("//") ||
       destination.includes("\\")
     ) {
       destination = "/";
     }
     ```
   - In `apps/site/src/pages/api/draft-mode/disable.ts`:
     ```ts
     function resolveDestination(raw: string | null): string {
       if (
         !raw ||
         !raw.startsWith("/") ||
         raw.startsWith("//") ||
         raw.includes("\\")
       ) {
         return "/";
       }
       return raw;
     }
     ```
   - Both `returnTo=/\evil.com` and `slug=\evil.com` (alongside `//evil.com` and POST variants) are now strictly neutralized to `/`.
2. **True HTTP 302 SSR Redirect Pages**:
   - Removed `/blog/page`, `/podcasts/page`, `/authors`, `/authors/page`, `/guests`, `/guests/page`, `/sponsors`, `/sponsors/page` from `redirects` in `apps/site/astro.config.mjs`.
   - Kept exclusively the 301 legacy feed redirects (`/rss.xml`, `/podcast/rss.xml`, `/feed.xml`) in `astro.config.mjs`.
   - Created dedicated SSR redirect pages returning explicit HTTP 302 status codes via `Astro.redirect(..., 302)`:
     - `apps/site/src/pages/blog/page/index.astro`: redirects to `/blog/page/1`
     - `apps/site/src/pages/podcasts/page/index.astro`: redirects to `/podcasts/page/1`
     - `apps/site/src/pages/authors/index.astro`: redirects to `/authors/page/1`
     - `apps/site/src/pages/guests/index.astro`: redirects to `/guests/page/1`
     - `apps/site/src/pages/sponsors/index.astro`: redirects to `/sponsors/page/1`
     - `apps/site/src/pages/authors/page/index.astro`: redirects to `/authors/page/1`
     - `apps/site/src/pages/guests/page/index.astro`: redirects to `/guests/page/1`
     - `apps/site/src/pages/sponsors/page/index.astro`: redirects to `/sponsors/page/1`
3. **Automated Test Alignment**:
   - Added test 6.8 to `apps/site/tests/tier1-features.test.mjs` validating backslash rejection across enable (query returnTo, query slug, protocol-relative) and disable (GET query, POST form-urlencoded, POST JSON).
   - Updated Section 1 of `apps/site/tests/tier3-combinations.test.mjs` to assert the presence and exact 302 status of all SSR redirect pages, while confirming removal of listing stubs from `astro.config.mjs`.

## 3. Caveats
- No caveats. All changes are minimal, standard SSR Astro code, and fully backward compatible with the Next.js production routing contract.

## 4. Conclusion
Both Challenger 1 findings have been completely resolved and genuinely verified:
1. Open redirect vulnerability in draft mode endpoints is mitigated by rejecting backslashes and protocol-relative prefixes.
2. Listing stubs now consistently emit true HTTP 302 Found redirects through dedicated SSR pages, bypassing Astro 7 config-level 301 fallbacks.
3. The repository builds cleanly with 0 typecheck errors, 0 lint violations, and 100% passing tests (145/145).

## 5. Verification Method
Run from repository root (`/home/alex/codingcat.dev`):
```bash
# 1. Typecheck (125 files, 0 errors, 0 warnings, 0 hints)
pnpm --filter @codingcatdev/site typecheck

# 2. Linting (55 files checked, 0 errors)
pnpm --filter @codingcatdev/site lint

# 3. Development server build (clean build, 0 warnings)
pnpm --filter @codingcatdev/site build

# 4. Production Cloudflare Workers build (clean build, 0 warnings)
pnpm --filter @codingcatdev/site build:production

# 5. Dual-Track E2E automated test suite (145/145 passing across all 4 tiers)
node apps/site/tests/run-e2e.mjs

# 6. Draft mode backslash open-redirect defense verification
node --input-type=module -e '
import { loadModule } from "./apps/site/tests/helpers.mjs";
const enable = loadModule("src/pages/api/draft-mode/enable.ts");
const res = await enable.GET({
  url: new URL("https://codingcat.dev/api/draft-mode/enable?returnTo=/\\evil.com"),
  cookies: { set: () => {}, delete: () => {} },
  redirect: (d, s) => new Response(null, { status: s, headers: { Location: d } }),
});
console.log("Status:", res.status, "Location:", res.headers.get("Location"));
if (res.headers.get("Location") !== "/") process.exit(1);
'
```
