const SERVER_INFO = {
  name: "forem-remote-mcp",
  version: "1.0.0",
};

const TOOLS = [
  {
    name: "create_post",
    description: "Create a new Forem post.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 1 },
        body_markdown: { type: "string", minLength: 1 },
        published: { type: "boolean", default: false },
        tags: {
          type: "array",
          items: { type: "string" },
          maxItems: 4,
        },
        series: { type: "string" },
        canonical_url: { type: "string" },
        description: { type: "string" },
        main_image: { type: "string" },
      },
      required: ["title", "body_markdown"],
      additionalProperties: false,
    },
  },
  {
    name: "update_post",
    description: "Update an existing Forem post by id.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer" },
        title: { type: "string" },
        body_markdown: { type: "string" },
        published: { type: "boolean" },
        tags: {
          type: "array",
          items: { type: "string" },
          maxItems: 4,
        },
        series: { type: "string" },
        canonical_url: { type: "string" },
        description: { type: "string" },
        main_image: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "delete_post",
    description: "Delete a Forem post by id.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "get_post",
    description: "Get a Forem post by id.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "list_my_posts",
    description: "List your Forem posts, including unpublished drafts.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1, default: 1 },
        per_page: { type: "integer", minimum: 1, maximum: 100, default: 30 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "set_publish_state",
    description: "Publish or unpublish a Forem post.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer" },
        published: { type: "boolean" },
      },
      required: ["id", "published"],
      additionalProperties: false,
    },
  },
];

function json(res, statusCode, data) {
  res.status(statusCode).setHeader("content-type", "application/json");
  res.send(JSON.stringify(data));
}

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id, code, message, data) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message, data },
  };
}

function extractToken(req) {
  const auth = req.headers.authorization;
<<<<<<< codex/build-vercel-ready-mcp-server-for-forem-uf11ly
  if (!auth) {
    return null;
  }

  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  return auth.trim();
}


function getForemBaseUrl() {
  const baseUrl = process.env.FOREM_INSTANCE_URL || process.env.FOREM_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "Missing FOREM_INSTANCE_URL (or FOREM_BASE_URL). Set it to your Forem site URL, e.g. https://dev.to or https://community.example.com.",
    );
  }

  return baseUrl.replace(/\/$/, "");
}

async function foremRequest(path, { method = "GET", token, body, query }) {
  const url = new URL(`${getForemBaseUrl()}${path}`);
=======
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return auth.slice(7).trim();
}

async function foremRequest(path, { method = "GET", token, body, query }) {
  const url = new URL(`https://forem.com${path}`);
>>>>>>> main
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const headers = {
    Accept: "application/json",
<<<<<<< codex/build-vercel-ready-mcp-server-for-forem-uf11ly
    "api-key": token,
    api_key: token,
=======
    Authorization: `Bearer ${token}`,
    "api-key": token,
>>>>>>> main
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(
      `Forem API ${response.status} ${response.statusText}: ${JSON.stringify(payload)}`,
    );
  }

  return payload;
}

async function callTool(name, args, token) {
  switch (name) {
    case "create_post":
      return foremRequest("/api/articles", {
        method: "POST",
        token,
        body: { article: args },
      });

    case "update_post": {
      const { id, ...article } = args;
      return foremRequest(`/api/articles/${id}`, {
        method: "PUT",
        token,
        body: { article },
      });
    }

    case "delete_post":
      return foremRequest(`/api/articles/${args.id}`, {
        method: "DELETE",
        token,
      });

    case "get_post":
      return foremRequest(`/api/articles/${args.id}`, {
        method: "GET",
        token,
      });

    case "list_my_posts":
      return foremRequest("/api/articles/me/all", {
        method: "GET",
        token,
        query: args,
      });

    case "set_publish_state": {
      const { id, published } = args;
      return foremRequest(`/api/articles/${id}`, {
        method: "PUT",
        token,
        body: { article: { published } },
      });
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleRpc(body, token) {
  const { id, method, params } = body || {};

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: "2024-11-05",
        serverInfo: SERVER_INFO,
        capabilities: {
          tools: { listChanged: false },
        },
      });

    case "tools/list":
      return rpcResult(id, { tools: TOOLS });

    case "tools/call": {
      if (!token) {
        return rpcError(
          id,
          -32001,
<<<<<<< codex/build-vercel-ready-mcp-server-for-forem-uf11ly
          "Missing API token. Set Authorization: Bearer <FOREM_API_KEY> in MCP client headers.",
=======
          "Missing Bearer token. Set Authorization: Bearer <FOREM_API_KEY> in MCP client headers.",
>>>>>>> main
        );
      }

      const toolName = params?.name;
      const args = params?.arguments || {};

      try {
        const output = await callTool(toolName, args, token);
        return rpcResult(id, {
          content: [
            {
              type: "text",
              text: JSON.stringify(output, null, 2),
            },
          ],
        });
      } catch (error) {
        return rpcResult(id, {
          isError: true,
          content: [{ type: "text", text: String(error.message || error) }],
        });
      }
    }

    default:
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return json(res, 200, {
      ok: true,
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      usage: {
        endpoint: "POST /",
        transport: "MCP JSON-RPC over HTTP",
      },
<<<<<<< codex/build-vercel-ready-mcp-server-for-forem-uf11ly
      requiredEnv: ["FOREM_INSTANCE_URL"],
=======
>>>>>>> main
    });
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  const token = extractToken(req);

  try {
    const response = await handleRpc(body, token);
    return json(res, 200, response);
  } catch (error) {
    return json(res, 500, rpcError(body?.id, -32603, "Internal error", String(error)));
  }
}
