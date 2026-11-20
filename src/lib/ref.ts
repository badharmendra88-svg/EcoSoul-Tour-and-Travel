import "server-only";

// Human-friendly references read out over the phone: date (IST) + 4 characters with no 0/O/1/I.
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function makeRef(prefix: string) {
  const date = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(2, 10).replace(/-/g, "");
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const rand = Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
  return `${prefix}-${date}-${rand}`;
}
