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
3. Deploy.

No `vercel.json` is required. Vercel will auto-detect `api/index.js` as a Serverless Function.

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

- The server forwards your token to Forem as both `Authorization: Bearer ...` and `api-key: ...` for compatibility.
- Endpoint transport is MCP JSON-RPC over HTTP (`POST /`).
