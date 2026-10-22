import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";

	const spec = {
		openapi: "3.1.0",
		info: {
			title: "Alex Patterson — Speaker Kit & DevRel MCP API",
			description:
				"Public unauthenticated API and Model Context Protocol (MCP) endpoints for Alex Patterson's speaker bios, conference talk abstracts, high-resolution Sanity CDN headshots, Cloudflare Workers AI headshot remixing, and DevRel speaking ledger.",
			version: "2.0.0",
			contact: {
				name: "Alex Patterson",
				url: origin,
				email: "alex@codingcat.dev",
			},
			license: {
				name: "MIT",
				url: "https://opensource.org/licenses/MIT",
			},
		},
		servers: [
			{
				url: origin,
				description: "Primary Cloudflare Edge Server",
			},
		],
		paths: {
			"/speaker-kit.json": {
				get: {
					operationId: "getSpeakerKit",
					summary: "Get Complete Speaker Kit JSON",
					description:
						"Returns Alex Patterson's complete speaker profile, all 6 bio variations (short/medium/full in 3rd & 1st person), active conference talk abstracts, Sanity CDN headshot variants, and chronological speaking ledger.",
					tags: ["Speaker Kit"],
					responses: {
						"200": {
							description: "Complete Speaker Kit JSON payload",
							content: {
								"application/json": {
									schema: {
										$ref: "#/components/schemas/SpeakerKitResponse",
									},
								},
							},
						},
						"400": {
							description: "Invalid request parameters",
							content: {
								"application/problem+json": {
									schema: {
										$ref: "#/components/schemas/ProblemDetails",
									},
								},
							},
						},
						"500": {
							description: "Internal server error while assembling speaker kit",
							content: {
								"application/problem+json": {
									schema: {
										$ref: "#/components/schemas/ProblemDetails",
									},
								},
							},
						},
					},
				},
			},
			"/mcp": {
				post: {
					operationId: "mcpEndpoint",
					summary: "Model Context Protocol (MCP) Server",
					description:
						"Unauthenticated Streamable HTTP JSON-RPC 2.0 MCP endpoint supporting initialize, server/discover, tools/list, tools/call, resources/list, and resources/read.",
					tags: ["MCP"],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/McpJsonRpcRequest",
								},
							},
						},
					},
					responses: {
						"200": {
							description: "JSON-RPC 2.0 MCP response",
							content: {
								"application/json": {
									schema: {
										$ref: "#/components/schemas/McpJsonRpcResponse",
									},
								},
							},
						},
						"400": {
							description: "Invalid JSON-RPC request payload or parse error",
							content: {
								"application/problem+json": {
									schema: {
										$ref: "#/components/schemas/ProblemDetails",
									},
								},
							},
						},
						"500": {
							description: "Unexpected MCP execution error",
							content: {
								"application/problem+json": {
									schema: {
										$ref: "#/components/schemas/ProblemDetails",
									},
								},
							},
						},
					},
				},
			},
			"/api/remix-headshot": {
				post: {
					operationId: "remixHeadshot",
					summary: "AI Headshot Remix (Cloudflare Workers AI)",
					description:
						"Transforms an official Sanity CDN speaker headshot into a stylized conference portrait using open/free Cloudflare Workers AI models (@cf/black-forest-labs/flux-1-schnell, @cf/runwayml/stable-diffusion-v1-5-img2img, or @cf/bytedance/stable-diffusion-xl-lightning).",
					tags: ["Headshots"],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									$ref: "#/components/schemas/RemixHeadshotRequest",
								},
							},
						},
					},
					responses: {
						"200": {
							description: "Generated AI headshot remix data URL and metadata",
							content: {
								"application/json": {
									schema: {
										$ref: "#/components/schemas/RemixHeadshotResponse",
									},
								},
							},
						},
						"400": {
							description: "Invalid headshot remix request parameters",
							content: {
								"application/problem+json": {
									schema: {
										$ref: "#/components/schemas/ProblemDetails",
									},
								},
							},
						},
						"500": {
							description: "Workers AI image generation failure",
							content: {
								"application/problem+json": {
									schema: {
										$ref: "#/components/schemas/ProblemDetails",
									},
								},
							},
						},
					},
				},
			},
		},
		components: {
			schemas: {
				ProblemDetails: {
					type: "object",
					description:
						"RFC 9457 standard problem details object for HTTP API errors",
					properties: {
						type: {
							type: "string",
							format: "uri",
							description: "URI reference identifying the problem type",
							example: `${origin}/errors/bad-request`,
						},
						title: {
							type: "string",
							description: "Short human-readable summary of the problem type",
							example: "Bad Request",
						},
						status: {
							type: "integer",
							description: "HTTP status code generated by the origin server",
							example: 400,
						},
						detail: {
							type: "string",
							description:
								"Human-readable explanation specific to this occurrence of the problem",
							example: "Missing or invalid request parameters.",
						},
						instance: {
							type: "string",
							format: "uri-reference",
							description:
								"URI reference identifying the specific occurrence of the problem",
							example: "/api/remix-headshot",
						},
					},
					required: ["type", "title", "status", "detail"],
				},
				SpeakerKitResponse: {
					type: "object",
					description:
						"Complete speaker kit payload containing profile, bios, talks, headshots, and speaking ledger",
					properties: {
						$schema: {
							type: "string",
							description: "Schema version identifier for the speaker kit JSON",
						},
						meta: {
							type: "object",
							description: "Generation metadata and canonical URLs",
							properties: {
								site: {
									type: "string",
									format: "uri",
									description: "Canonical site URL",
								},
								generatedAt: {
									type: "string",
									format: "date-time",
									description: "ISO 8601 timestamp when payload was generated",
								},
								source: {
									type: "string",
									description: "Data source indicator",
								},
							},
							required: ["site", "generatedAt", "source"],
						},
						speaker: {
							type: "object",
							description:
								"Speaker identity, credentials, social links, and bios",
							properties: {
								name: {
									type: "string",
									description: "Full name of the speaker",
								},
								headline: {
									type: "string",
									description: "Executive role and DevRel headline",
								},
								location: {
									type: "string",
									description: "City and state location",
								},
								bios: {
									type: "object",
									description:
										"Six speaker bio variations by length and perspective",
								},
							},
							required: ["name", "headline", "bios"],
						},
						headshots: {
							type: "array",
							description:
								"High-resolution Sanity CDN headshots with aspect/format URLs",
							items: {
								type: "object",
								description: "Speaker headshot item with CDN variants",
							},
						},
						talks: {
							type: "array",
							description: "Ready-to-run conference talk abstracts",
							items: {
								type: "object",
								description: "Conference talk abstract item",
							},
						},
						speakingLedger: {
							type: "object",
							description: "Chronological DevRel speaking engagements ledger",
							properties: {
								totalCount: {
									type: "integer",
									description: "Total number of speaking events",
								},
								events: {
									type: "array",
									description: "List of speaking engagements",
									items: {
										type: "object",
										description: "Individual speaking event record",
									},
								},
							},
							required: ["totalCount", "events"],
						},
					},
					required: ["meta", "speaker", "headshots", "talks", "speakingLedger"],
				},
				McpJsonRpcRequest: {
					type: "object",
					description: "Model Context Protocol JSON-RPC 2.0 request object",
					properties: {
						jsonrpc: {
							type: "string",
							enum: ["2.0"],
							description: "JSON-RPC protocol version (must be 2.0)",
						},
						id: {
							oneOf: [{ type: "string" }, { type: "integer" }],
							description: "Unique request identifier echoed in the response",
						},
						method: {
							type: "string",
							description:
								"MCP JSON-RPC method name (initialize, server/discover, tools/list, tools/call, resources/list, resources/read)",
						},
						params: {
							type: "object",
							description: "Optional method parameters object",
						},
					},
					required: ["jsonrpc", "method"],
				},
				McpJsonRpcResponse: {
					type: "object",
					description: "Model Context Protocol JSON-RPC 2.0 response object",
					properties: {
						jsonrpc: {
							type: "string",
							enum: ["2.0"],
							description: "JSON-RPC protocol version",
						},
						id: {
							oneOf: [
								{ type: "string" },
								{ type: "integer" },
								{ type: "null" },
							],
							description: "Echoed request identifier",
						},
						result: {
							type: "object",
							description: "Successful MCP method execution result",
						},
						error: {
							type: "object",
							description: "JSON-RPC 2.0 error object when an error occurs",
							properties: {
								code: {
									type: "integer",
									description: "Standard JSON-RPC error code",
								},
								message: {
									type: "string",
									description: "Human-readable error message",
								},
							},
							required: ["code", "message"],
						},
					},
					required: ["jsonrpc", "id"],
				},
				RemixHeadshotRequest: {
					type: "object",
					description: "Request body for Cloudflare Workers AI headshot remix",
					properties: {
						headshotId: {
							type: "string",
							description: "ID of the base headshot to transform",
						},
						baseImageUrl: {
							type: "string",
							format: "uri",
							description: "Sanity CDN URL of the base speaker headshot",
						},
						preset: {
							type: "string",
							enum: [
								"cyberpunk-keynote",
								"8bit-retro",
								"conference-sketch",
								"synthwave",
							],
							description: "Visual style preset to apply",
						},
						customPrompt: {
							type: "string",
							description: "Optional custom style prompt override",
						},
						model: {
							type: "string",
							enum: [
								"@cf/black-forest-labs/flux-1-schnell",
								"@cf/runwayml/stable-diffusion-v1-5-img2img",
								"@cf/bytedance/stable-diffusion-xl-lightning",
							],
							description: "Cloudflare Workers AI open model identifier",
						},
					},
					required: ["baseImageUrl", "preset"],
				},
				RemixHeadshotResponse: {
					type: "object",
					description: "Response containing the generated AI headshot remix",
					properties: {
						ok: {
							type: "boolean",
							description: "Whether the remix succeeded",
						},
						mode: {
							type: "string",
							enum: ["workers-ai-live", "sanity-pipeline-fallback"],
							description: "Execution mode used to generate the image",
						},
						model: {
							type: "string",
							description: "Cloudflare Workers AI model used",
						},
						stylePreset: {
							type: "string",
							description: "Applied style preset label",
						},
						promptUsed: {
							type: "string",
							description: "Full prompt passed to the Workers AI model",
						},
						previewDataUrl: {
							type: "string",
							description:
								"Base64 data URL (data:image/jpeg;base64,... or data:image/png;base64,...) of the generated portrait",
						},
						message: {
							type: "string",
							description: "Human-readable status summary",
						},
					},
					required: ["ok", "mode", "model", "previewDataUrl"],
				},
			},
		},
	};

	return new Response(JSON.stringify(spec, null, 2), {
		status: 200,
		headers: {
			"content-type": "application/vnd.oai.openapi+json; charset=utf-8",
			"access-control-allow-origin": "*",
			"cache-control": "public, max-age=3600",
		},
	});
};
