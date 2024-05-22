export function nl_pac_file(env) {

const nl =
`
function FindProxyForURL(url, host) {
// No proxy for private (RFC 1918) IP addresses (intranet sites)
  // if (
  //   isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0") ||
  //   isInNet(dnsResolve(host), "172.16.0.0", "255.240.0.0") ||
  //   isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0")
  // ) {
  //   return "DIRECT";
  // }

  // No proxy for localhost
  // if (isInNet(dnsResolve(host), "127.0.0.0", "255.0.0.0")) {
  //   return "DIRECT";
  // }
  // Example logic to determine whether to use a proxy
  return "HTTPS ${env.NL_DOMAIN}.proxy.cloudflare-gateway.com:443";
}
`;
  // Set headers to prevent caching
  const headers = new Headers({
    "Content-Type": "application/x-ns-proxy-auto-config",
    "Cache-Control": "no-store, max-age=0",
  });

  return new Response(nl, { headers: headers });
}

export function sg_pac_file(env) {

const sg =
`
function FindProxyForURL(url, host) {
// No proxy for private (RFC 1918) IP addresses (intranet sites)
  // if (
  //   isInNet(dnsResolve(host), "10.0.0.0", "255.0.0.0") ||
  //   isInNet(dnsResolve(host), "172.16.0.0", "255.240.0.0") ||
  //   isInNet(dnsResolve(host), "192.168.0.0", "255.255.0.0")
  // ) {
  //   return "DIRECT";
  // }

  // No proxy for localhost
  // if (isInNet(dnsResolve(host), "127.0.0.0", "255.0.0.0")) {
  //   return "DIRECT";
  // }
  // Example logic to determine whether to use a proxy
  return "HTTPS ${env.SG_DOMAIN}.proxy.cloudflare-gateway.com:443";
}
`;
  // Set headers to prevent caching
  const headers = new Headers({
    "Content-Type": "application/x-ns-proxy-auto-config",
    "Cache-Control": "no-store, max-age=0",
  });

  return new Response(sg, { headers: headers });
}
