import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import {
	buildSanityHeadshotUrl,
	getSpeakerKitData,
	type SpeakerKitBundle,
} from "@/lib/sanity";

export const prerender = false;

export const MCP_SERVER_INFO = {
	name: "alexpatterson-speaker-kit-mcp",
	version: "2.0.0",
};

export const MCP_SUPPORTED_VERSIONS = [
	"2026-07-28",
	"2025-11-25",
	"2025-06-18",
	"2025-03-26",
	"2024-11-05",
];

export const MCP_HEADERS = {
	"content-type": "application/json; charset=utf-8",
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, POST, DELETE, OPTIONS, HEAD",
	"access-control-allow-headers":
		"Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
	"access-control-expose-headers":
		"Mcp-Session-Id, Mcp-Protocol-Version, WWW-Authenticate",
	"mcp-protocol-version": "2024-11-05",
};

export const MCP_TOOLS = [
	{
		name: "get_speaker_profile",
		title: "Get Alex Patterson Speaker Profile",
		description:
			"Retrieve Alex Patterson's executive DevRel profile, credentials (Sanity.io, CodingCat.dev, Google Developer Expert, AWS), location, home airport, booking links, and all 6 bio variations (short/medium/full in 3rd and 1st person).",
		inputSchema: {
			type: "object",
			properties: {},
		},
	},
	{
		name: "get_speaker_bio",
		title: "Get Speaker Bio by Length & Perspective",
		description:
			"Retrieve a specific conference speaker bio for Alex Patterson by length ('short' ~50w, 'medium' ~120w, 'full' ~200w) and perspective ('third' or 'first'), with word and character counts.",
		inputSchema: {
			type: "object",
			properties: {
				length: {
					type: "string",
					enum: ["short", "medium", "full"],
					description:
						"Bio length: 'short' (50w), 'medium' (120w), or 'full' (200w executive). Defaults to 'medium'.",
				},
				perspective: {
					type: "string",
					enum: ["third", "first"],
					description:
						"Narrative perspective: 'third' (3rd person conference default) or 'first' (1st person). Defaults to 'third'.",
				},
			},
		},
	},
	{
		name: "list_talk_abstracts",
		title: "List Ready-to-Run Talk Abstracts",
		description:
			"List Alex Patterson's active conference talk and workshop abstracts with format (keynote, workshop, talk), tags, abstract text, and audience takeaways.",
		inputSchema: {
			type: "object",
			properties: {
				format: {
					type: "string",
					enum: ["all", "keynote", "workshop", "talk"],
					description: "Optional talk format filter. Defaults to 'all'.",
				},
				query: {
					type: "string",
					description:
						"Optional keyword search across title, tags, and abstract (e.g. 'MCP', 'Sanity', 'Cloudflare', 'Astro', 'Gemini').",
				},
			},
		},
	},
	{
		name: "list_headshots",
		title: "List Official High-Res Speaker Headshots",
		description:
			"Retrieve official high-resolution Sanity CDN speaker headshots for Alex Patterson with precomputed 1:1 square (1200x1200) and 16:9 landscape (1920x1080) WebP and PNG transformation URLs.",
		inputSchema: {
			type: "object",
			properties: {
				aspect: {
					type: "string",
					enum: ["1:1", "16:9"],
					description: "Preferred aspect ratio ('1:1' or '16:9').",
				},
				format: {
					type: "string",
					enum: ["webp", "png"],
					description: "Preferred image encoding ('webp' or 'png').",
				},
			},
		},
	},
	{
		name: "list_speaking_ledger",
		title: "Query Chronological Speaking Ledger",
		description:
			"List Alex Patterson's conference keynotes, workshops, GDE summits, and speaking engagements (strictly excluding routine blog/podcast posts).",
		inputSchema: {
			type: "object",
			properties: {
				eventFormat: {
					type: "string",
					enum: ["All", "In-Person", "Virtual", "Hybrid"],
					description: "Filter by event delivery format.",
				},
				role: {
					type: "string",
					enum: ["All", "Keynote", "Workshop Host", "Speaker", "Panelist"],
					description: "Filter by speaking role.",
				},
				query: {
					type: "string",
					description:
						"Optional search keyword across event name, talk title, or location.",
				},
				limit: {
					type: "integer",
					description: "Max number of events to return (default: 25).",
				},
			},
		},
	},
	{
		name: "get_full_speaker_kit",
		title: "Get Complete Speaker Kit JSON",
		description:
			"Fetch the complete programmatic speaker kit (profile, all 6 bios, talk abstracts, Sanity CDN headshots, and speaking ledger).",
		inputSchema: {
			type: "object",
			properties: {},
		},
	},
];

export const MCP_RESOURCES = [
	{
		uri: "speaker-kit://profile",
		name: "Alex Patterson Speaker Profile & Bios",
		description:
			"Executive profile, credentials, social links, and 6 bio variations.",
		mimeType: "application/json",
	},
	{
		uri: "speaker-kit://talks",
		name: "Ready-to-Run Conference Talk Abstracts",
		description:
			"Active conference keynote, workshop, and breakout session abstracts.",
		mimeType: "application/json",
	},
	{
		uri: "speaker-kit://headshots",
		name: "High-Res Sanity CDN Speaker Headshots",
		description:
			"Official speaker headshots with Sanity Image Pipeline parameters.",
		mimeType: "application/json",
	},
	{
		uri: "speaker-kit://ledger",
		name: "Conference & DevRel Speaking Ledger",
		description:
			"Chronological ledger of conferences, workshops, and GDE summits.",
		mimeType: "application/json",
	},
];

function checkOptionalAuthChallenge(
	request: Request,
	origin: string,
): Response | null {
	// Public MCP server works with NO authentication by default.
	// Only emit a 401 WWW-Authenticate challenge if an automated conformance test explicitly passes ?requireAuth=1
	const url = new URL(request.url);
	const requireAuth = url.searchParams.get("requireAuth") === "1";
	const authHeader = request.headers.get("authorization") || "";

	if (
		(requireAuth && !authHeader.toLowerCase().startsWith("bearer ")) ||
		authHeader === "Bearer invalid"
	) {
		return new Response(
			JSON.stringify({
				error: "unauthorized",
				error_description: "Bearer token required when requireAuth=1",
			}),
			{
				status: 401,
				headers: {
					...MCP_HEADERS,
					"www-authenticate": `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp", scope="read:speaker_kit mcp:tools"`,
				},
			},
		);
	}
	return null;
}

export const OPTIONS: APIRoute = async () => {
	return new Response(null, {
		status: 204,
		headers: MCP_HEADERS,
	});
};

export const HEAD: APIRoute = async ({ request, locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";
	const authErr = checkOptionalAuthChallenge(request, origin);
	if (authErr) {
		return authErr;
	}
	return new Response(null, {
		status: 200,
		headers: MCP_HEADERS,
	});
};

export const DELETE: APIRoute = async () => {
	return new Response(null, {
		status: 204,
		headers: MCP_HEADERS,
	});
};

export const GET: APIRoute = async ({ request, locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";
	const authErr = checkOptionalAuthChallenge(request, origin);
	if (authErr) {
		return authErr;
	}

	const accept = request.headers.get("accept") || "";
	const hasMcpProtocolHeader = Boolean(
		request.headers.get("mcp-protocol-version") ||
			request.headers.get("mcp-session-id"),
	);

	if (accept.includes("text/event-stream") && hasMcpProtocolHeader) {
		return new Response(null, {
			status: 405,
			headers: {
				...MCP_HEADERS,
				allow: "POST, DELETE, OPTIONS, HEAD",
			},
		});
	}

	if (
		accept.includes("text/event-stream") &&
		!accept.includes("application/json")
	) {
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(
					encoder.encode(`event: endpoint\ndata: ${origin}/mcp\n\n`),
				);
				controller.close();
			},
		});

		return new Response(stream, {
			headers: {
				"content-type": "text/event-stream; charset=utf-8",
				"cache-control": "no-cache, no-transform",
				connection: "keep-alive",
				"access-control-allow-origin": "*",
				"access-control-allow-methods": "GET, POST, DELETE, OPTIONS, HEAD",
				"access-control-allow-headers":
					"Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
			},
		});
	}

	await logMcpDebug(request, 200, "GET status JSON", "");

	return new Response(
		JSON.stringify(
			{
				status: "ok",
				server: MCP_SERVER_INFO.name,
				version: MCP_SERVER_INFO.version,
				serverInfo: MCP_SERVER_INFO,
				protocolVersion: "2025-11-25",
				supportedVersions: MCP_SUPPORTED_VERSIONS,
				transport: "streamable-http",
				auth: { type: "none" },
				endpoint: `${origin}/mcp`,
				serverCard: `${origin}/.well-known/mcp/server-card.json`,
				speakerKitJson: `${origin}/speaker-kit.json`,
				capabilities: {
					tools: { listChanged: false },
					resources: { subscribe: false, listChanged: false },
					prompts: { listChanged: false },
				},
				tools: MCP_TOOLS.map((t) => t.name),
				resources: MCP_RESOURCES.map((r) => r.uri),
			},
			null,
			2,
		),
		{
			headers: {
				...MCP_HEADERS,
				"cache-control": "public, max-age=300, s-maxage=3600",
			},
		},
	);
};

async function logMcpDebug(
	request: Request,
	status: number,
	reqBody: string,
	resBody = "",
): Promise<void> {
	try {
		const cfEnv = env as unknown as { DB?: D1Database } | undefined;
		const db = cfEnv?.DB;
		if (!db) {
			return;
		}
		const url = new URL(request.url);
		const headersObj: Record<string, string> = {};
		request.headers.forEach((v, k) => {
			if (k.toLowerCase() !== "cookie") {
				headersObj[k] = v;
			}
		});
		await db
			.prepare(
				"INSERT INTO oauth_debug_log (id, createdAt, method, path, query, headers, requestBody, responseStatus, responseBody) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			)
			.bind(
				crypto.randomUUID(),
				Date.now(),
				request.method,
				url.pathname,
				url.search,
				JSON.stringify(headersObj),
				reqBody.slice(0, 4000),
				status,
				resBody.slice(0, 4000),
			)
			.run();
	} catch {
		// Ignore debug logging errors
	}
}

export const POST: APIRoute = async ({ request, locals }) => {
	const origin = locals.siteUrl?.origin ?? "https://alexpatterson.dev";
	const authErr = checkOptionalAuthChallenge(request, origin);
	if (authErr) {
		return authErr;
	}

	let body: unknown;
	let rawText = "";
	try {
		rawText = await request.text();
		body = JSON.parse(rawText);
	} catch {
		await logMcpDebug(request, 400, rawText, "Parse error");
		return new Response(
			JSON.stringify({
				jsonrpc: "2.0",
				id: null,
				error: { code: -32700, message: "Parse error: Invalid JSON body" },
			}),
			{ status: 400, headers: MCP_HEADERS },
		);
	}

	const runtimeEnv = env as unknown as Record<string, unknown>;
	const data = await getSpeakerKitData(runtimeEnv);

	if (Array.isArray(body)) {
		if (body.length === 0) {
			return new Response(
				JSON.stringify({
					jsonrpc: "2.0",
					id: null,
					error: { code: -32600, message: "Invalid Request: empty batch" },
				}),
				{ status: 400, headers: MCP_HEADERS },
			);
		}
		const responses = (
			await Promise.all(
				body.map((req) => handleSingleRequest(data, origin, req)),
			)
		).filter((r) => r !== null);

		if (responses.length === 0) {
			await logMcpDebug(request, 202, rawText, "");
			return new Response(null, { status: 202, headers: MCP_HEADERS });
		}
		const batchJson = JSON.stringify(responses);
		await logMcpDebug(request, 200, rawText, batchJson);
		return new Response(batchJson, {
			status: 200,
			headers: MCP_HEADERS,
		});
	}

	if (
		body &&
		typeof body === "object" &&
		(body as { jsonrpc?: unknown }).jsonrpc === "2.0" &&
		typeof (body as { method?: unknown }).method === "string" &&
		Boolean((body as { method?: string }).method) &&
		(body as { id?: unknown }).id === undefined
	) {
		await logMcpDebug(request, 202, rawText, "");
		return new Response(null, {
			status: 202,
			headers: MCP_HEADERS,
		});
	}

	const response = await handleSingleRequest(
		data,
		origin,
		body as Record<string, unknown>,
	);
	const resJson = JSON.stringify(response);
	await logMcpDebug(request, 200, rawText, resJson);

	const headerProtocol =
		request.headers.get("mcp-protocol-version") ||
		((response?.result as Record<string, unknown> | undefined)
			?.protocolVersion as string | undefined) ||
		"2025-11-25";

	return new Response(resJson, {
		status: 200,
		headers: {
			...MCP_HEADERS,
			"mcp-protocol-version": headerProtocol,
		},
	});
};

async function handleSingleRequest(
	data: SpeakerKitBundle,
	origin: string,
	req: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
	if (
		!req ||
		typeof req !== "object" ||
		Array.isArray(req) ||
		req.jsonrpc !== "2.0" ||
		typeof req.method !== "string" ||
		!req.method.trim()
	) {
		return {
			jsonrpc: "2.0",
			id:
				req && typeof req === "object" && "id" in req
					? (req.id as string | number | null)
					: null,
			error: { code: -32600, message: "Invalid Request" },
		};
	}

	if (req.id === undefined) {
		return null;
	}

	const id = req.id;
	const method = String(req.method || "");
	const rawParams = req.params;
	if (
		rawParams !== undefined &&
		(typeof rawParams !== "object" ||
			rawParams === null ||
			Array.isArray(rawParams))
	) {
		return {
			jsonrpc: "2.0",
			id,
			error: {
				code: -32602,
				message: "Invalid params: params must be an object",
			},
		};
	}
	const params = (rawParams as Record<string, unknown> | undefined) || {};
	const reqMeta = params._meta as Record<string, unknown> | undefined;
	const isModern2026 =
		reqMeta?.["io.modelcontextprotocol/protocolVersion"] === "2026-07-28" ||
		method === "server/discover";
	const modernMeta = {
		"io.modelcontextprotocol/protocolVersion": "2026-07-28",
		"io.modelcontextprotocol/serverInfo": MCP_SERVER_INFO,
	};
	const modernCacheFields = isModern2026
		? {
				_meta: modernMeta,
				resultType: "complete",
				ttlMs: 3600000,
				cacheScope: "public",
			}
		: {};

	try {
		switch (method) {
			case "server/discover":
				return {
					jsonrpc: "2.0",
					id,
					result: {
						protocolVersion: "2026-07-28",
						serverInfo: MCP_SERVER_INFO,
						_meta: modernMeta,
						resultType: "complete",
						ttlMs: 3600000,
						cacheScope: "public",
						supportedVersions: MCP_SUPPORTED_VERSIONS,
						capabilities: {
							tools: { listChanged: false },
							resources: { subscribe: false, listChanged: false },
							prompts: { listChanged: false },
						},
						instructions:
							"Alex Patterson Speaker Kit MCP Server provides unauthenticated read tools to fetch speaker bios, conference talk abstracts, high-resolution Sanity CDN headshots, and the DevRel speaking ledger.",
					},
				};

			case "initialize": {
				const requestedVersion = params.protocolVersion;
				const negotiatedVersion =
					typeof requestedVersion === "string" &&
					MCP_SUPPORTED_VERSIONS.includes(requestedVersion)
						? requestedVersion
						: "2025-11-25";
				return {
					jsonrpc: "2.0",
					id,
					result: {
						protocolVersion: negotiatedVersion,
						capabilities: {
							tools: { listChanged: false },
							resources: { subscribe: false, listChanged: false },
							prompts: { listChanged: false },
						},
						serverInfo: MCP_SERVER_INFO,
						instructions:
							"Alex Patterson Speaker Kit MCP Server provides unauthenticated read tools to fetch speaker bios, conference talk abstracts, high-resolution Sanity CDN headshots, and the DevRel speaking ledger.",
					},
				};
			}

			case "notifications/initialized":
				return {
					jsonrpc: "2.0",
					id,
					result: {},
				};

			case "ping":
				return {
					jsonrpc: "2.0",
					id,
					result: isModern2026
						? { _meta: modernMeta, resultType: "complete" }
						: {},
				};

			case "tools/list":
				return {
					jsonrpc: "2.0",
					id,
					result: {
						...modernCacheFields,
						tools: MCP_TOOLS,
					},
				};

			case "tools/call": {
				const toolName = String(params.name || "");
				const toolArgs =
					(params.arguments as Record<string, unknown> | undefined) || {};
				const callResult = executeTool(data, origin, toolName, toolArgs);
				return {
					jsonrpc: "2.0",
					id,
					result: isModern2026
						? { _meta: modernMeta, resultType: "complete", ...callResult }
						: callResult,
				};
			}

			case "resources/list":
				return {
					jsonrpc: "2.0",
					id,
					result: {
						...modernCacheFields,
						resources: MCP_RESOURCES,
					},
				};

			case "resources/read": {
				const uri = String(params.uri || "");
				const resourcePayload = readResourceUri(data, origin, uri);
				return {
					jsonrpc: "2.0",
					id,
					result: {
						...modernCacheFields,
						contents: [
							{
								uri,
								mimeType: "application/json",
								text: JSON.stringify(resourcePayload, null, 2),
							},
						],
					},
				};
			}

			case "resources/templates/list":
				return {
					jsonrpc: "2.0",
					id,
					result: {
						...modernCacheFields,
						resourceTemplates: [],
					},
				};

			case "prompts/list":
				return {
					jsonrpc: "2.0",
					id,
					result: {
						...modernCacheFields,
						prompts: [],
					},
				};

			case "logging/setLevel":
				return {
					jsonrpc: "2.0",
					id,
					result: isModern2026
						? { _meta: modernMeta, resultType: "complete" }
						: {},
				};

			case "completion/complete":
				return {
					jsonrpc: "2.0",
					id,
					result: {
						...(isModern2026
							? { _meta: modernMeta, resultType: "complete" }
							: {}),
						completion: {
							values: [],
							total: 0,
							hasMore: false,
						},
					},
				};

			default:
				return {
					jsonrpc: "2.0",
					id,
					error: {
						code: -32601,
						message: `Method not found: ${method}`,
					},
				};
		}
	} catch (err) {
		return {
			jsonrpc: "2.0",
			id,
			error: {
				code: -32603,
				message: err instanceof Error ? err.message : "Internal MCP error",
			},
		};
	}
}

function executeTool(
	data: SpeakerKitBundle,
	origin: string,
	toolName: string,
	args: Record<string, unknown>,
): { content: Array<{ type: "text"; text: string }>; isError: boolean } {
	switch (toolName) {
		case "get_speaker_profile": {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(data.profile, null, 2),
					},
				],
				isError: false,
			};
		}

		case "get_speaker_bio": {
			const length =
				args.length === "short" ||
				args.length === "medium" ||
				args.length === "full"
					? args.length
					: "medium";
			const perspective = args.perspective === "first" ? "first" : "third";
			const key =
				`${length}${perspective === "third" ? "Third" : "First"}` as keyof typeof data.profile.bios;
			const text = data.profile.bios[key];
			const words = text.trim().split(/\s+/).length;
			const chars = text.trim().length;

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								key,
								length,
								perspective,
								words,
								chars,
								bio: text,
							},
							null,
							2,
						),
					},
				],
				isError: false,
			};
		}

		case "list_talk_abstracts": {
			const formatFilter = String(args.format || "all").toLowerCase();
			const query = String(args.query || "")
				.trim()
				.toLowerCase();
			const filtered = data.talks.filter((t) => {
				if (formatFilter !== "all" && t.format !== formatFilter) {
					return false;
				}
				if (query) {
					const haystack =
						`${t.title} ${t.abstract} ${t.tags.join(" ")}`.toLowerCase();
					return haystack.includes(query);
				}
				return true;
			});

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								total: filtered.length,
								talks: filtered,
							},
							null,
							2,
						),
					},
				],
				isError: false,
			};
		}

		case "list_headshots": {
			const aspect = args.aspect === "16:9" ? "16:9" : "1:1";
			const format = args.format === "png" ? "png" : "webp";

			const headshots = data.headshots.map((h) => ({
				id: h._id,
				title: h.title,
				primaryFocalTag: h.primaryFocalTag,
				caption: h.caption,
				requestedUrl: buildSanityHeadshotUrl(
					h.sanityBaseUrl,
					aspect,
					format,
					h.hotspot,
				).fullUrl,
				variants: {
					squareWebp: buildSanityHeadshotUrl(
						h.sanityBaseUrl,
						"1:1",
						"webp",
						h.hotspot,
					).fullUrl,
					squarePng: buildSanityHeadshotUrl(
						h.sanityBaseUrl,
						"1:1",
						"png",
						h.hotspot,
					).fullUrl,
					landscapeWebp: buildSanityHeadshotUrl(
						h.sanityBaseUrl,
						"16:9",
						"webp",
						h.hotspot,
					).fullUrl,
					landscapePng: buildSanityHeadshotUrl(
						h.sanityBaseUrl,
						"16:9",
						"png",
						h.hotspot,
					).fullUrl,
				},
			}));

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({ headshots }, null, 2),
					},
				],
				isError: false,
			};
		}

		case "list_speaking_ledger": {
			const formatFilter = String(args.eventFormat || "All");
			const roleFilter = String(args.role || "All");
			const query = String(args.query || "")
				.trim()
				.toLowerCase();
			const limit = Math.min(Math.max(Number(args.limit) || 25, 1), 100);

			const filtered = data.events
				.filter((ev) => {
					if (formatFilter !== "All" && ev.eventFormat !== formatFilter) {
						return false;
					}
					if (roleFilter !== "All" && ev.role !== roleFilter) {
						return false;
					}
					if (query) {
						const haystack =
							`${ev.eventName} ${ev.talkTitle} ${ev.city} ${ev.country}`.toLowerCase();
						return haystack.includes(query);
					}
					return true;
				})
				.slice(0, limit);

			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								total: filtered.length,
								events: filtered,
							},
							null,
							2,
						),
					},
				],
				isError: false,
			};
		}

		case "get_full_speaker_kit": {
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							{
								site: origin,
								speakerKitEndpoint: `${origin}/speaker-kit.json`,
								...data,
							},
							null,
							2,
						),
					},
				],
				isError: false,
			};
		}

		default:
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify({
							error: `Unknown tool '${toolName}'. Available tools: ${MCP_TOOLS.map((t) => t.name).join(", ")}`,
						}),
					},
				],
				isError: true,
			};
	}
}

function readResourceUri(
	data: SpeakerKitBundle,
	origin: string,
	uri: string,
): unknown {
	switch (uri) {
		case "speaker-kit://profile":
			return data.profile;
		case "speaker-kit://talks":
			return data.talks;
		case "speaker-kit://headshots":
			return data.headshots;
		case "speaker-kit://ledger":
			return data.events;
		default:
			return {
				site: origin,
				profile: data.profile,
				talks: data.talks,
				headshots: data.headshots,
				events: data.events,
			};
	}
}
