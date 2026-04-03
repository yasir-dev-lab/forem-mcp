---
name: mcp-server-builder
description: Build MCP (Model Context Protocol) servers. Use when user wants to create, develop, or modify MCP servers, or mentions building MCP integrations. This skill provides guidance on MCP server architecture, best practices, and implementation patterns.
---

# MCP Server Builder

Build MCP (Model Context Protocol) servers following industry best practices and established patterns from successful MCP implementations.

## Workflow

### Step 1: Gather Intent

Before creating anything, ask the user:

1. **Server name**: What should the MCP server be called? (lowercase, digits, hyphens only, e.g., `forem-mcp`, `github-mcp`)
2. **Purpose**: What API/service should this server integrate with? Include specific use cases (e.g., "Fetch posts from Forem API", "Manage GitHub repositories")
3. **Transport type**: Which transport protocol to use?
   - `stdio` - For local CLI integration
   - `streamableHttp` - For remote/web deployment
   - `sse` - For server-sent events
4. **Authentication method**: How will the server authenticate with the target API?
   - API key header
   - Bearer token
   - OAuth
   - No authentication (public API)
5. **Deployment target**: Where will this server be deployed?
   - Local only
   - Vercel/Netlify
   - Docker container
   - Other cloud provider

If the user provides partial info, proceed with reasonable defaults (stdio for local, streamableHttp for remote) and ask to confirm.

### Step 2: Research Target API

Always research the target API before implementation:

1. **API Documentation**: Find the official API docs
2. **Authentication requirements**: Identify required headers, tokens, or OAuth flows
3. **Rate limits**: Note any rate limiting constraints
4. **Required headers**: Some APIs require specific headers (e.g., `User-Agent` for Forem)
5. **Endpoint structure**: Understand base URL patterns and endpoint paths

Search the web for latest documentation rather than relying on outdated knowledge.

### Step 3: Create Project Structure

Create the following directory structure for a typical MCP server:

```
<server-name>/
├── package.json
├── api/
│   └── index.js          # Main MCP server entry point
├── .env.example          # Environment variables template
├── README.md             # Setup and usage instructions
├── vercel.json           # Deployment config (if deploying to Vercel)
└── .gitignore
```

**package.json essentials:**
```json
{
  "name": "<server-name>",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch api/index.js",
    "start": "node api/index.js",
    "check": "node --check api/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0"
  }
}
```

### Step 4: Implement Core MCP Server

Create `api/index.js` with the following structure:

**Basic template:**
```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { parse as parseQuery } from "node:querystring";

// Get configuration from environment
function getConfig() {
  return {
    baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
    apiKey: process.env.API_KEY,
    userAgent: process.env.USER_AGENT || '<server-name>/1.0.0'
  };
}

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const config = getConfig();
  const url = `${config.baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': config.userAgent,
    ...(config.apiKey && { 'api-key': config.apiKey }),
    ...options.headers
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API ${response.status}: ${error}`);
  }
  
  return response.json();
}

// Create MCP server
const server = new McpServer({
  name: '<server-name>',
  version: '1.0.0'
});

// Register tools/resources/prompts
server.tool(
  'example-tool',
  'Description of what this tool does',
  {
    param1: { type: 'string', description: 'Parameter description' }
  },
  async ({ param1 }) => {
    const result = await apiRequest('/endpoint', {
      method: 'POST',
      body: JSON.stringify({ param1 })
    });
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Handle transport selection
const transportType = process.argv[2] || 'stdio';

if (transportType === 'stdio') {
  const transport = new StdioServerTransport();
  await server.connect(transport);
} else if (transportType === 'streamableHttp') {
  const transport = new StreamableHTTPServerTransport();
  await server.connect(transport);
} else {
  console.error('Unknown transport type:', transportType);
  process.exit(1);
}
```

### Step 5: Authentication Best Practices

**Critical authentication patterns:**

1. **Use correct header names**: Some APIs use `api-key`, others use `Authorization: Bearer`. Check the API docs.
2. **Never hardcode credentials**: Always use environment variables
3. **Provide fallback auth methods**: Support both `api-key` and `Authorization` headers if the API allows
4. **Include User-Agent**: Many APIs require a `User-Agent` header and return 401 without it
5. **Handle auth errors gracefully**: Return clear error messages when authentication fails

**Example auth helper:**
```javascript
function getAuthHeaders(req) {
  // Try api-key first, then Authorization header
  const apiKey = req.headers['api-key'] || 
                 req.headers['x-api-key'] ||
                 process.env.API_KEY;
  
  const authHeader = req.headers['authorization'];
  
  if (apiKey) {
    return { 'api-key': apiKey };
  }
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { 'Authorization': authHeader };
  }
  
  throw new Error('No valid authentication provided');
}
```

### Step 6: Environment Configuration

Create `.env.example`:
```bash
# Base URL for the target API
API_BASE_URL=https://api.example.com

# API key for authentication (get from your account settings)
API_KEY=your-api-key-here

# User-Agent string (some APIs require this)
USER_AGENT=<server-name>/1.0.0
```

**Important**: Never commit actual `.env` files. Only commit `.env.example`.

### Step 7: Deployment Configuration

**For Vercel deployment (`vercel.json`):**
```json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/mcp",
      "destination": "/api/index.js"
    }
  ]
}
```

**Environment variables in deployment:**
- Set all required env vars in the deployment platform
- Test with the deployed URL before sharing with users

### Step 8: Client Configuration Documentation

Document how users should configure their MCP client:

**For stdio transport:**
```json
{
  "mcpServers": {
    "<server-name>": {
      "command": "node",
      "args": ["path/to/api/index.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

**For streamableHttp transport:**
```json
{
  "mcpServers": {
    "<server-name>": {
      "type": "streamableHttp",
      "url": "https://your-deployment.com/mcp",
      "headers": {
        "Content-Type": "application/json",
        "api-key": "your-api-key",
        "User-Agent": "<server-name>/1.0.0"
      }
    }
  }
}
```

### Step 9: Testing & Validation

Test the server:

1. **Syntax check**: `node --check api/index.js`
2. **Local test**: Run with stdio transport and verify tools respond
3. **Auth test**: Verify authentication works with valid/invalid keys
4. **Error handling**: Test error responses are clear and helpful
5. **Deployed test**: If deployed, test the remote endpoint

### Step 10: Documentation

Create comprehensive `README.md` including:

- **Description**: What the server does
- **Prerequisites**: Node.js version, API account requirements
- **Setup**: How to get API keys, install dependencies
- **Configuration**: Environment variables needed
- **Usage**: Client configuration examples for both stdio and http
- **Tools/Resources**: List of available MCP tools and what they do
- **Troubleshooting**: Common issues (especially 401 errors) and solutions
- **Important notes**: Any API-specific requirements (e.g., required headers)

## Common Pitfalls

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check if API requires `api-key` vs `Authorization` header; ensure `User-Agent` is set |
| CORS errors | Not applicable for MCP servers (not browser-based) |
| Timeout errors | Increase function timeout in deployment config |
| Missing env vars | Verify all required env vars are set in deployment |
| Wrong endpoint | Double-check API base URL and endpoint paths |

## Naming Rules

- Use lowercase letters, digits, and hyphens only
- Prefer descriptive names ending in `-mcp` (e.g., `forem-mcp`, `github-mcp`)
- Match the server name in package.json, README, and client configs

## Commands Reference

```bash
# Install dependencies
npm install

# Check syntax
npm run check

# Run locally (stdio)
npm start

# Run locally (http)
node api/index.js streamableHttp

# Deploy to Vercel
vercel
```

## Constraints

- Never hardcode API keys or secrets in code
- Always validate input parameters in tools
- Handle API errors gracefully with clear messages
- Follow the target API's rate limits and terms of service
- Keep dependencies minimal and up-to-date
- Document all environment variables and configuration options
