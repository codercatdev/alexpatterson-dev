## 2026-10-07T14:58:00Z
You are the Implementation Worker for Feature Parity and Cloudflare Readiness in @codingcatdev/site.
Your working directory is: /home/alex/codingcat.dev/.agents/teamwork/worker_parity/
Orchestrator Conversation ID: ba87226a-19f8-4f3d-a0a2-bff8e323f987

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TOOL USAGE NOTE:
If the write_to_file tool prompts or times out in your environment, use standard scripting via run_command (e.g., python3 -c "..." or node -e "..." or cat << 'EOF' > ...) to write and update the files cleanly.

YOUR OBJECTIVES:
Implement the complete feature parity and configuration hardening across 4 key areas:

### 1. Cloudflare Configuration, Build Hardening & Lint Cleanup
- In apps/site/astro.config.mjs:
  - Set session: false in defineConfig (prevents dummy KV "SESSION" namespace injection).
  - Under redirects, add 3 legacy RSS 301 redirects:
    "/rss.xml": { status: 301, destination: "/blog/rss.xml" },
    "/podcast/rss.xml": { status: 301, destination: "/podcasts/rss.xml" },
    "/feed.xml": { status: 301, destination: "/blog/rss.xml" },
- In apps/site/src/pages/sitemap.xml.ts:
  - Line 8: Replace comment mentioning "getStaticPaths" (* Sanity — there is no getStaticPaths to read.) with * Sanity — there is no static route generation to read. to eliminate Astro router warning.
- In apps/site/src/lib/og-utils.ts:
  - Line 174: Fix Biome style warning by replacing typeColor + "26" with template literal ${typeColor}26.
- In apps/site/package.json:
  - Update "cf-typegen": "CI=true wrangler types".
  - Add "test:e2e": "node tests/run-e2e.mjs".
- In root package.json:
  - Add convenience scripts:
    "build:production": "pnpm --filter @codingcatdev/site build:production",
    "preview": "pnpm --filter @codingcatdev/site preview",
    "test:e2e": "pnpm --filter @codingcatdev/site test:e2e"

### 2. Search Page Feature Parity (/search)
- Reference Next.js implementation in apps/web/app/(main)/(top-level-pages)/search/page.tsx and apps/web/components/algolia-search.tsx.
- Create apps/site/src/pages/search.astro:
  - Wraps in BaseLayout with title "Search", description, breadcrumbs.
  - Implements Algolia search functionality (can be an interactive client island or vanilla JS / TypeScript component):
    - Connects using PUBLIC_ALGOLIA_APP_ID, PUBLIC_ALGOLIA_SEARCH_API_KEY, and PUBLIC_ALGOLIA_INDEX (or sensible defaults/graceful fallback when env vars are not set).
    - Includes search box, filters by content type (posts, podcasts, authors, guests), and search results list rendering title, excerpt/summary, type badge, and link.
    - Gracefully displays informative empty/ready state when no query is typed or if index is unavailable.
  - Ensures visiting /search returns HTTP 200 and fulfills the /search entry in sitemap.xml and the Search link in Header.astro.

### 3. Sanity Draft Mode API Endpoints
- In apps/site/src/lib/sanity/preview.ts, preview cookie is defined as __sanity_preview.
- DraftModeToggle.astro submits a POST to /api/draft-mode/disable.
- Create apps/site/src/pages/api/draft-mode/enable.ts:
  - Handles GET request (with query params secret, slug, returnTo).
  - Reads SANITY_API_READ_TOKEN via cloudflare:workers env.
  - Sets __sanity_preview=true cookie (path: "/", httpOnly: true, secure: true, sameSite: "lax").
  - Redirects to requested slug / returnTo (default "/").
- Create apps/site/src/pages/api/draft-mode/disable.ts:
  - Handles POST and GET requests.
  - Clears __sanity_preview cookie (maxAge: 0, path: "/").
  - Reads returnTo form field / query param, redirects to returnTo or "/".

### 4. Sponsorships Page & API Feature Parity (/sponsorships & /api/sponsorship)
- Reference Next.js in apps/web/app/(main)/(top-level-pages)/sponsorships/page.tsx and apps/web/app/api/sponsorship/route.ts.
- Create apps/site/src/pages/sponsorships.astro:
  - Wraps in BaseLayout with metadata and breadcrumbs.
  - Renders the 5 sponsorship tiers:
    1. Dedicated Video ($4,000)
    2. Integrated Mid-Roll Ad ($1,800)
    3. Quick Shout-Out ($900)
    4. Blog Post / Newsletter ($500)
    5. Video Series (Custom)
  - Includes sponsorship inquiry form with fields: Name, Email, Company, Sponsorship Tier, Message.
- Create apps/site/src/pages/api/sponsorship.ts:
  - Handles POST request with JSON or form-encoded submission.
  - Validates required fields (email, name, tier).
  - Returns JSON response { success: true, message: "Inquiry received" }.

### 5. Verification
After applying the implementations:
1. pnpm --filter @codingcatdev/site typecheck (must pass 0 errors)
2. pnpm --filter @codingcatdev/site lint (must pass 0 errors)
3. pnpm --filter @codingcatdev/site build (clean build, no router regex warning, no dummy SESSION KV binding)
4. pnpm --filter @codingcatdev/site build:production (clean build)
5. node apps/site/tests/run-e2e.mjs (verify all tests pass, and add any new tests if appropriate)

Send your complete report and verification results via send_message to ba87226a-19f8-4f3d-a0a2-bff8e323f987.
