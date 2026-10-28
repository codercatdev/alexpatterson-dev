# alexpatterson.dev | Minimalist DevRel & Interactive Speaker Hub

Minimalist, single-page developer relations portfolio and interactive speaker kit for **Alex Patterson** (Senior Solutions Architect @ Sanity.io, Founder & Host @ CodingCat.dev, Google Developer Expert, AWS Certified Cloud Practitioner).

- **Media & Tutorials Hub:** [https://codingcat.dev](https://codingcat.dev) (`alexpatterson.dev` strictly serves executive DevRel & conference speaker kit assets; routine tutorials, blog posts, and podcast episodes live on CodingCat.dev).
- **Programmatic Speaker Kit (JSON / MCP):** [`/speaker-kit.json`](https://alexpatterson.dev/speaker-kit.json)
- **LLM Overview:** [`/llms.txt`](https://alexpatterson.dev/llms.txt)
- **Sanity Project:** `hfh83o0w` (`production` dataset)
- **Cloudflare D1 DevRel Ledger:** `devrel-mcp` (`88e72347-89a2-4ddd-9cb5-b049f93579f5`)

## Architecture & Stack

- **Framework:** Astro 7 SSR on Cloudflare Workers + React 19 Islands
- **Styling:** Tailwind CSS v4 + Lucide Icons (`Geist` + `JetBrains Mono`)
- **Content Layer:** Sanity (`@sanity/client` + `@sanity/image-url`) with declarative schemas in `/sanity/schemas/` ready for Sanity MCP (`deploy_schema` / `patch_documents`), plus optional speaking event sync from Cloudflare D1 (`DEVREL_DB`).

## Quick Start

```bash
npm install
npm run dev
```

## Build & Verify

```bash
npm run check
npm run build
```
