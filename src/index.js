import { nl_pac_file, sg_pac_file } from './pac_file.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/nl.pac') {
      return nl_pac_file(env);
    } else if (url.pathname === '/sg.pac') {
      return sg_pac_file(env);
    } else {
      return new Response('Not Found', { status: 404 });
    }
  }
};
