## 2026-10-07T15:33:23Z

You are the Remediation Worker for @codingcatdev/site addressing findings from Challenger 1.
Your working directory is: /home/alex/codingcat.dev/.agents/teamwork/worker_remediation/
Orchestrator Conversation ID: ba87226a-19f8-4f3d-a0a2-bff8e323f987

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TOOL USAGE NOTE:
Use standard scripting via `run_command` (e.g., `python3 -c "..."` or `node -e "..."` or `cat << 'EOF' > ...`) to write and update the files cleanly.

YOUR OBJECTIVES:
Fix the two specific findings identified by Challenger 1:

### 1. Fix Open Redirect Vulnerability in Draft Mode (`/api/draft-mode/enable` and `/api/draft-mode/disable`)
In `apps/site/src/pages/api/draft-mode/enable.ts` and `apps/site/src/pages/api/draft-mode/disable.ts`:
Ensure destination sanitization strictly rejects backslashes (`\`) to prevent WHATWG URL resolution of `/\evil.com` to `https://evil.com/`:
```ts
if (!destination.startsWith("/") || destination.startsWith("//") || destination.includes("\\")) {
  destination = "/";
}
```
Verify that `returnTo=/\evil.com` and `slug=\evil.com` safely redirect to `/`.

### 2. Fix 301 vs 302 Listing Stubs
In Astro 7 SSR, config-level `redirects` to dynamic parameter destinations fall back to 301 in `computeRedirectStatus`.
To guarantee true HTTP 302 Found status codes:
1. Remove `/blog/page`, `/podcasts/page`, `/authors`, `/guests`, `/sponsors` from `redirects` in `apps/site/astro.config.mjs` (keep the 301 legacy feed redirects `/rss.xml`, `/podcast/rss.xml`, `/feed.xml`).
2. Create dedicated SSR redirect pages:
   - `apps/site/src/pages/blog/page/index.astro`:
     ```astro
     ---
     return Astro.redirect("/blog/page/1", 302);
     ---
     ```
   - `apps/site/src/pages/podcasts/page/index.astro`:
     ```astro
     ---
     return Astro.redirect("/podcasts/page/1", 302);
     ---
     ```
   - `apps/site/src/pages/authors/index.astro`:
     ```astro
     ---
     return Astro.redirect("/authors/page/1", 302);
     ---
     ```
   - `apps/site/src/pages/guests/index.astro`:
     ```astro
     ---
     return Astro.redirect("/guests/page/1", 302);
     ---
     ```
   - `apps/site/src/pages/sponsors/index.astro`:
     ```astro
     ---
     return Astro.redirect("/sponsors/page/1", 302);
     ---
     ```

### 3. Verification
1. Run `pnpm --filter @codingcatdev/site typecheck` (must pass 0 errors)
2. Run `pnpm --filter @codingcatdev/site lint` (must pass 0 errors)
3. Run `pnpm --filter @codingcatdev/site build` (clean build)
4. Run `pnpm --filter @codingcatdev/site build:production` (clean build)
5. Run `node apps/site/tests/run-e2e.mjs` (must pass 100%)
6. Test draft mode backslash open-redirect defense:
   Confirm `/api/draft-mode/enable?returnTo=/\\evil.com` redirects to `/`.

Send your complete report via `send_message` to ba87226a-19f8-4f3d-a0a2-bff8e323f987.
