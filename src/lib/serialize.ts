// Runs async work one-at-a-time per key, so a "check for duplicate, then insert"
// sequence can't interleave when the same form is submitted several times at once.
// In-process only (like the rate limiter): fine for a single server instance.

const chains = new Map<string, Promise<unknown>>();

export async function serialize<T>(key: string, work: () => Promise<T>): Promise<T> {
  const previous = chains.get(key) ?? Promise.resolve();
  const run = previous.catch(() => undefined).then(work);
  chains.set(key, run);
  try {
    return await run;
  } finally {
    if (chains.get(key) === run) chains.delete(key);
  }
}
