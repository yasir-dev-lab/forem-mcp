# Forem Remote MCP Server (Vercel-ready)

A zero-config remote MCP server that lets AI clients manage a Forem account using the API key passed in the MCP server `api-key` header.

## Supported tools

- `create_post`
- `update_post`
- `delete_post`
- `get_post`
- `list_my_posts`
- `set_publish_state`

## Deploy (zero config)

1. Push this repo to GitHub.
2. Import into Vercel.
3. Set env var `FOREM_INSTANCE_URL` (or `FOREM_BASE_URL`) to your Forem instance URL, e.g. `https://dev.to` or `https://community.example.com`.
4. Deploy.

`vercel.json` rewrites `/` (and `/mcp`) to `/api/index.js` explicitly, avoiding route-resolution ambiguity and making the deployed root URL work directly as the MCP endpoint expected by clients.

## MCP client config

Use your server URL and pass Forem API key in the `api-key` header:

```json
{
  "mcpServers": {
    "my-remote-server": {
      "url": "https://forem-mcp.vercel.app",
      "headers": {
        "Content-Type": "application/json",
        "api-key": "YOUR_FOREM_API_KEY",
        "User-Agent": "forem-remote-mcp/1.0.0"
      }
    }
  }
}
```

**Important:** Forem API requires:
- The `api-key` header for authentication (not `Authorization: Bearer`)
- A `User-Agent` header (required by Forem API, returns 401 if missing)

## Local dev

```bash
npm run start
```

## Notes

- The server extracts your token from the `api-key` header (or `Authorization: Bearer` as fallback) and forwards it to Forem as `api-key` header.
- Endpoint transport is MCP JSON-RPC over HTTP (`POST /`).


## Required environment variable

- `FOREM_INSTANCE_URL` (preferred) or `FOREM_BASE_URL`: Base URL of your Forem instance (no trailing slash needed).
