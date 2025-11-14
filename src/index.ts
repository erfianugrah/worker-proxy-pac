import { nl_pac_file, sg_pac_file, type Env } from "./pac_file";

export default {
	fetch(request: Request, env: Env, _ctx: ExecutionContext): Response {
		const url = new URL(request.url);

		if (url.pathname === "/nl.pac") {
			return nl_pac_file(env);
		} else if (url.pathname === "/sg.pac") {
			return sg_pac_file(env);
		} else {
			return new Response("Not Found", { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;
