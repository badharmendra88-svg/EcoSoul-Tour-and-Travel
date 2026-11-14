import { MEDIA_NAME_RE, readUpload } from "@/lib/media";

// Serves admin-uploaded photos (from disk or Vercel Blob). File names are random and immutable.
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!MEDIA_NAME_RE.test(file)) return new Response("Not found", { status: 404 });
  const data = await readUpload(file);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data as BodyInit, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
