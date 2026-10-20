// SQLite stores lists as JSON strings; these helpers parse them defensively.

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export type Faq = { q: string; a: string };
export type ItineraryDay = { day: number; title: string; detail: string };

export function parseFaqs(value: string | null | undefined): Faq[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((f) => f && typeof f.q === "string" && typeof f.a === "string")
      : [];
  } catch {
    return [];
  }
}

export function parseItinerary(value: string | null | undefined): ItineraryDay[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((d) => d && typeof d.title === "string")
      : [];
  } catch {
    return [];
  }
}

// Admin textareas: one item per line <-> JSON list
export function linesToJson(text: string): string {
  return JSON.stringify(
    text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  );
}

export function jsonToLines(value: string | null | undefined): string {
  return parseList(value).join("\n");
}

// Itinerary textarea format: "Title | detail" per line, day numbers implied
export function itineraryToLines(value: string | null | undefined): string {
  return parseItinerary(value)
    .map((d) => `${d.title} | ${d.detail}`)
    .join("\n");
}

export function linesToItinerary(text: string): string {
  const days = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [title, ...rest] = line.split("|");
      return { day: i + 1, title: title.trim(), detail: rest.join("|").trim() };
    });
  return JSON.stringify(days);
}

// FAQ textarea format: "Question? | Answer" per line
export function faqsToLines(value: string | null | undefined): string {
  return parseFaqs(value)
    .map((f) => `${f.q} | ${f.a}`)
    .join("\n");
}

export function linesToFaqs(text: string): string {
  return JSON.stringify(
    text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.includes("|"))
      .map((line) => {
        const [q, ...rest] = line.split("|");
        return { q: q.trim(), a: rest.join("|").trim() };
      }),
  );
}
