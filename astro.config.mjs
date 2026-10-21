import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
	session: false,
	security: {
		checkOrigin: false,
	},
	site: process.env.SITE_URL ?? "https://alexpatterson.dev",
	output: "server",
	adapter: cloudflare({
		// Images are Sanity CDN URLs already transformed by @sanity/image-url;
		// do not route them through Cloudflare Images.
		imageService: "passthrough",
		platformProxy: { enabled: true },
	}),
	integrations: [react()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Geist",
			cssVariable: "--font-geist",
			weights: ["400 700"],
			styles: ["normal"],
			subsets: ["latin"],
			fallbacks: ["Inter", "system-ui", "sans-serif"],
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-jetbrains-mono",
			weights: ["400 700"],
			styles: ["normal"],
			subsets: ["latin"],
			fallbacks: ["ui-monospace", "SFMono-Regular", "monospace"],
		},
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
