# Forem Remote MCP Server (Vercel-ready)

A zero-config remote MCP server that lets AI clients manage a Forem account using the API key passed in the MCP server `Authorization` header.

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

Use your server URL and pass Forem API key as Bearer token:

```json
{
  "mcpServers": {
    "my-remote-server": {
      "url": "https://forem-mcp.vercel.app",
      "headers": {
        "Authorization": "Bearer YOUR_FOREM_API"
      }
    }
  }
}
```

## Local dev

```bash
npm run start
```

## Notes

- The server extracts your token from `Authorization` and forwards it to Forem as `api-key`/`api_key` headers (Forem key auth), which avoids Forem `401 unauthorized` responses caused by bearer-style upstream auth.
- Endpoint transport is MCP JSON-RPC over HTTP (`POST /`).


## Required environment variable

- `FOREM_INSTANCE_URL` (preferred) or `FOREM_BASE_URL`: Base URL of your Forem instance (no trailing slash needed).
