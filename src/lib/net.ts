import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Outbound webhook URLs are entered by staff. Make sure they point to the public
// internet, not to this server, the office network or a cloud metadata endpoint (SSRF).

function isPrivateAddress(ip: string) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
    return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb");
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, incl. cloud metadata 169.254.169.254
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

/** Resolves the URL's host and returns an error message if it is not a public https address. */
export async function publicHttpsUrlProblem(url: string): Promise<string | null> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return "Enter a full https:// link";
  }
  if (u.protocol !== "https:") return "Enter a full https:// link";
  if (u.username || u.password) return "Links with a username or password aren't allowed";
  if (u.port && u.port !== "443") return "Use the standard https port";
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) return "Use a public internet address";
  try {
    const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) return "Use a public internet address";
  } catch {
    return "That address could not be found";
  }
  return null;
}
