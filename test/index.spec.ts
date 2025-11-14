import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src";
import type { Env } from "../src/pac_file";

describe("Worker Proxy PAC", () => {
	const testEnv: Env = {
		...env,
		NL_DOMAIN: "test-nl",
		SG_DOMAIN: "test-sg",
	};

	it("responds with 404 for root path (unit style)", async () => {
		const request = new Request("http://example.com");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, testEnv, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(404);
		expect(await response.text()).toBe("Not Found");
	});

	it("responds with NL PAC file (unit style)", async () => {
		const request = new Request("http://example.com/nl.pac");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, testEnv, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("application/x-ns-proxy-auto-config");
		const text = await response.text();
		expect(text).toContain("FindProxyForURL");
		expect(text).toContain("test-nl.proxy.cloudflare-gateway.com");
	});

	it("responds with SG PAC file (unit style)", async () => {
		const request = new Request("http://example.com/sg.pac");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, testEnv, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("application/x-ns-proxy-auto-config");
		const text = await response.text();
		expect(text).toContain("FindProxyForURL");
		expect(text).toContain("test-sg.proxy.cloudflare-gateway.com");
	});

	it("responds correctly (integration style)", async () => {
		const request = new Request("http://example.com");
		const response = await SELF.fetch(request);
		expect(response.status).toBe(404);
	});
});
