# alexpatterson.dev

Astro 7 SSR on Cloudflare Workers with React 19 Islands, Tailwind CSS v4, Sanity (`hfh83o0w` / `production`), and Cloudflare D1 (`devrel-mcp`).

## Conventions

- **`output: "server"` on Cloudflare Workers** via `@astrojs/cloudflare` v14.
- **Sanity Project:** `hfh83o0w`, dataset `production`. Declarative schemas live in `/sanity/schemas/` (`speakerProfile`, `headshot`, `talkAbstract`, `speakingEvent`) and GROQ queries + fallback seed data live in `src/lib/sanity.ts`.
- **Cloudflare D1 Integration:** `DEVREL_DB` binds to `devrel-mcp` (`88e72347-89a2-4ddd-9cb5-b049f93579f5`) to sync public speaking and workshop activities while strictly excluding routine `content-creation` posts.
- **Visual Aesthetic:** Deep zinc (`bg-zinc-950`), muted zinc surfaces (`bg-zinc-900/50`), Royal Purple (`#7c3aed` / `violet-500`) primary accents, and CodingCat Emerald (`#10b981` / `emerald-400`) strictly for `codingcat.dev` referral pills and live availability indicators. Strictly NO orange.
