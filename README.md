# Worker Proxy PAC

A Cloudflare Worker that serves PAC (Proxy Auto-Configuration) files for routing network traffic through Cloudflare Gateway proxies. This service enables automated proxy configuration for browsers and operating systems using location-specific gateway endpoints.

## Table of Contents

- [Overview](#overview)
- [What are PAC Files?](#what-are-pac-files)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Local Development](#local-development)
  - [Available Endpoints](#available-endpoints)
  - [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Technical Details](#technical-details)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

This Cloudflare Worker application provides a lightweight, serverless solution for distributing PAC files that automatically configure client devices to route traffic through Cloudflare Gateway proxies. It supports multiple geographical regions with dedicated endpoints for each location.

The worker is designed to:

- Serve PAC files with appropriate MIME types and caching headers
- Support multiple geographical proxy configurations (Netherlands, Singapore)
- Deploy seamlessly to Cloudflare's edge network for global availability
- Provide environment-specific configurations (staging, production)

## What are PAC Files?

PAC (Proxy Auto-Configuration) files are JavaScript files that define how web browsers and other user agents automatically select the appropriate proxy server when accessing the internet.

A PAC file contains a JavaScript function `FindProxyForURL(url, host)` that returns a proxy server string for each URL request. This enables:

- Automatic proxy selection based on destination
- Conditional routing (direct vs proxied connections)
- Network-aware traffic management
- Centralized proxy configuration management

## Features

- **Multi-Region Support**: Separate PAC configurations for different geographical regions
  - Netherlands (NL) endpoint: `/nl.pac`
  - Singapore (SG) endpoint: `/sg.pac`
- **Cloudflare Gateway Integration**: Pre-configured to work with Cloudflare Gateway proxies using HTTPS protocol
- **Cache Control**: Explicit no-cache headers to ensure clients always receive the latest configuration
- **TypeScript**: Fully typed with TypeScript for enhanced developer experience and type safety
- **Environment Management**: Separate configurations for staging and production environments
- **Custom Domain Support**: Production deployment on custom domain (proxy.erfi.dev)
- **Node.js Compatibility**: Built with Node.js compatibility flags for enhanced functionality

## Architecture

The application follows a simple request-response pattern:

```
Client Request → Cloudflare Edge → Worker → PAC File Response
```

### Request Flow

1. Client makes HTTP request to one of the PAC file endpoints
2. Cloudflare Workers runtime intercepts the request at the edge
3. Worker's fetch handler examines the URL pathname
4. Appropriate PAC file generator function is called with environment variables
5. PAC file content is returned with proper headers
6. Response is delivered to client from nearest Cloudflare edge location

### Components

- **index.ts**: Main entry point containing the fetch handler and route logic
- **pac_file.ts**: PAC file generators and response builders for each region
- **wrangler.jsonc**: Cloudflare Workers configuration with environment-specific settings

## Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn package manager
- Cloudflare account with Workers enabled
- Wrangler CLI (installed as dev dependency)
- Cloudflare Gateway organization ID for NL and SG regions

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd worker-proxy-pac
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (see [Configuration](#configuration) section)

4. Verify installation:

```bash
npm run dev
```

## Configuration

### Environment Variables

The worker requires two environment variables for Cloudflare Gateway domain configuration:

- `NL_DOMAIN`: Cloudflare Gateway organization ID for Netherlands proxy
- `SG_DOMAIN`: Cloudflare Gateway organization ID for Singapore proxy

These variables are injected at runtime and must be configured in your Cloudflare Workers dashboard or `.dev.vars` file.

### Local Development Configuration

Create a `.dev.vars` file in the project root (this file is gitignored):

```bash
NL_DOMAIN=your-nl-organization-id
SG_DOMAIN=your-sg-organization-id
```

### Wrangler Configuration

The `wrangler.jsonc` file contains deployment configuration:

```jsonc
{
	"name": "worker-proxy-pac",
	"main": "src/index.ts",
	"compatibility_date": "2024-05-12",
	"compatibility_flags": ["nodejs_compat"],
	"env": {
		"staging": {
			"name": "staging-pac",
			"vars": {
				"ENVIRONMENT": "staging",
			},
			"workers_dev": true,
		},
		"prod": {
			"name": "prod-pac",
			"vars": {
				"ENVIRONMENT": "production",
			},
			"routes": [
				{
					"pattern": "proxy.erfi.dev",
					"custom_domain": true,
				},
			],
		},
	},
}
```

#### Configuration Options

- **name**: Worker name in Cloudflare dashboard
- **main**: Entry point TypeScript file
- **compatibility_date**: Cloudflare Workers runtime compatibility date
- **compatibility_flags**: Enables Node.js built-in APIs
- **dev.port**: Local development server port (9001)
- **dev.local_protocol**: Protocol for local server (http)
- **dev.upstream_protocol**: Protocol for upstream requests (https)

## Usage

### Local Development

Start the development server:

```bash
npm run dev
# or
npm start
```

The worker will be available at `http://localhost:9001`

Test endpoints locally:

```bash
# Netherlands PAC file
curl http://localhost:9001/nl.pac

# Singapore PAC file
curl http://localhost:9001/sg.pac
```

### Available Endpoints

| Endpoint        | Description                             | Response Type                        |
| --------------- | --------------------------------------- | ------------------------------------ |
| `/nl.pac`       | Netherlands Cloudflare Gateway PAC file | `application/x-ns-proxy-auto-config` |
| `/sg.pac`       | Singapore Cloudflare Gateway PAC file   | `application/x-ns-proxy-auto-config` |
| All other paths | 404 Not Found                           | `text/plain`                         |

### PAC File Response Headers

```
Content-Type: application/x-ns-proxy-auto-config
Cache-Control: no-store, max-age=0
```

The `Cache-Control` header ensures that browsers and operating systems always fetch the latest PAC file configuration without caching stale versions.

### Deployment

#### Deploy to Staging

```bash
npm run deploy -- --env staging
```

This deploys to `staging-pac.workers.dev` subdomain.

#### Deploy to Production

```bash
npm run deploy -- --env prod
```

This deploys to the custom domain `proxy.erfi.dev`.

#### Deploy to Default Environment

```bash
npm run deploy
```

Deploys without environment specification.

### Configuring Clients to Use PAC Files

#### Windows

1. Open Internet Options
2. Go to Connections tab → LAN settings
3. Check "Use automatic configuration script"
4. Enter: `https://proxy.erfi.dev/nl.pac` (or `/sg.pac`)

#### macOS

1. System Preferences → Network
2. Select your network → Advanced
3. Proxies tab
4. Check "Automatic Proxy Configuration"
5. Enter URL: `https://proxy.erfi.dev/nl.pac`

#### Linux

Configure in network manager or browser settings using the same URL.

#### Firefox

1. Settings → General → Network Settings
2. Select "Automatic proxy configuration URL"
3. Enter: `https://proxy.erfi.dev/nl.pac`

#### Chrome/Edge

Uses system proxy settings by default. Can be overridden with command-line flag:

```bash
chrome --proxy-pac-url="https://proxy.erfi.dev/nl.pac"
```

## Project Structure

```
worker-proxy-pac/
├── src/
│   ├── index.ts           # Main entry point with fetch handler
│   └── pac_file.ts        # PAC file generators for each region
├── .editorconfig          # Editor configuration for consistent formatting
├── .gitignore            # Git ignore patterns
├── .prettierrc           # Prettier formatting configuration
├── eslint.config.js      # ESLint configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript compiler configuration
├── vitest.config.js      # Vitest testing configuration
└── wrangler.jsonc        # Cloudflare Workers deployment configuration
```

### Source Files

#### src/index.ts

Main worker entry point that:

- Exports the default fetch handler
- Routes requests based on URL pathname
- Returns 404 for unknown paths
- Passes environment variables to PAC generators

#### src/pac_file.ts

Contains:

- `Env` interface defining required environment variables
- `nl_pac_file()`: Generates Netherlands PAC file
- `sg_pac_file()`: Generates Singapore PAC file
- Response builders with appropriate headers

## Technical Details

### Runtime Environment

- **Platform**: Cloudflare Workers (V8 isolate)
- **Language**: TypeScript (compiled to ES2022)
- **Module System**: ES Modules
- **Compatibility**: Node.js compatibility enabled

### TypeScript Configuration

- Target: ES2022
- Module: ES2022
- Strict mode enabled
- Type checking for Cloudflare Workers and Vitest

### Proxy Configuration

The PAC files configure clients to route all traffic through Cloudflare Gateway using:

```javascript
return 'HTTPS <organization-id>.proxy.cloudflare-gateway.com:443';
```

#### Commented-Out Features

The PAC files include commented-out logic for:

- Direct connections for private IP ranges (RFC 1918)
  - 10.0.0.0/8
  - 172.16.0.0/12
  - 192.168.0.0/16
- Direct connections for localhost (127.0.0.0/8)

These can be uncommented to bypass the proxy for local network resources.

### Response Headers Explained

- **Content-Type: application/x-ns-proxy-auto-config**
  - Standard MIME type for PAC files
  - Recognized by all major browsers and operating systems

- **Cache-Control: no-store, max-age=0**
  - `no-store`: Prevents caching in any cache (browser, CDN, proxy)
  - `max-age=0`: If cached, expire immediately
  - Ensures clients always fetch current configuration

## Testing

The project includes Vitest for testing with Cloudflare Workers pool:

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Test Configuration

Tests run using `@cloudflare/vitest-pool-workers`, which provides:

- Miniflare-based test environment
- Cloudflare Workers runtime simulation
- Environment variable injection
- Request/Response API testing

## Troubleshooting

### Common Issues

#### 1. PAC file not loading in browser

**Symptoms**: Browser shows proxy configuration error

**Solutions**:

- Verify the PAC file URL is accessible: `curl https://proxy.erfi.dev/nl.pac`
- Check browser console for JavaScript errors in PAC file
- Ensure MIME type is `application/x-ns-proxy-auto-config`
- Clear browser cache and retry

#### 2. Environment variables not set

**Symptoms**: Worker returns PAC with undefined domains

**Solutions**:

- Check `.dev.vars` file exists and contains correct values (local)
- Verify environment variables set in Cloudflare Workers dashboard (production)
- Redeploy after updating environment variables

#### 3. Deployment fails

**Symptoms**: `wrangler deploy` command errors

**Solutions**:

- Verify you're authenticated: `wrangler whoami`
- Login if needed: `wrangler login`
- Check account has Workers enabled
- Verify custom domain is configured in Cloudflare dashboard

#### 4. Port 9001 already in use

**Symptoms**: Local development server won't start

**Solutions**:

- Kill process using port: `lsof -ti:9001 | xargs kill -9` (macOS/Linux)
- Change port in `wrangler.jsonc` under `dev.port`

#### 5. TypeScript compilation errors

**Symptoms**: Build or type-checking fails

**Solutions**:

- Verify Node.js version: `node --version` (should be 16+)
- Clean install: `rm -rf node_modules package-lock.json && npm install`
- Check tsconfig.json for syntax errors

### Debugging

Enable verbose logging for Wrangler:

```bash
# Development with debug logs
wrangler dev --log-level debug

# Deployment with verbose output
wrangler deploy --verbose
```

Test PAC file functionality:

```bash
# Fetch and display PAC file
curl -v https://proxy.erfi.dev/nl.pac

# Check response headers
curl -I https://proxy.erfi.dev/nl.pac
```

## Contributing

### Development Workflow

1. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

2. Make changes and test locally:

```bash
npm run dev
```

3. Run linting:

```bash
npm run lint
```

4. Fix linting issues:

```bash
npm run lint:fix
```

5. Run tests:

```bash
npm test
```

6. Commit changes following conventional commits:

```bash
git commit -m "feat: add new region endpoint"
```

7. Push and create pull request

### Code Style

- TypeScript with strict mode enabled
- ESLint for code quality
- Prettier for formatting (configuration in `.prettierrc`)
- Editor config for consistent indentation and line endings

### Adding New Regions

To add a new regional PAC endpoint:

1. Add environment variable in `wrangler.jsonc`:

```jsonc
"vars": {
  "NEW_REGION_DOMAIN": "your-organization-id"
}
```

2. Update `Env` interface in `src/pac_file.ts`:

```typescript
export interface Env {
	NL_DOMAIN: string;
	SG_DOMAIN: string;
	NEW_REGION_DOMAIN: string;
}
```

3. Create PAC generator function in `src/pac_file.ts`:

```typescript
export function new_region_pac_file(env: Env): Response {
	const pac = `
function FindProxyForURL(url, host) {
  return "HTTPS ${env.NEW_REGION_DOMAIN}.proxy.cloudflare-gateway.com:443";
}
`;
	const headers = new Headers({
		'Content-Type': 'application/x-ns-proxy-auto-config',
		'Cache-Control': 'no-store, max-age=0',
	});
	return new Response(pac, { headers });
}
```

4. Add route in `src/index.ts`:

```typescript
if (url.pathname === '/new-region.pac') {
	return new_region_pac_file(env);
}
```

5. Test locally and deploy

### Pull Request Guidelines

- Ensure all tests pass
- Update documentation for new features
- Follow existing code style and patterns
- Include clear description of changes
- Reference related issues

---

**Note**: Replace Cloudflare Gateway organization IDs with your actual values. Never commit `.dev.vars` or credentials to version control.
