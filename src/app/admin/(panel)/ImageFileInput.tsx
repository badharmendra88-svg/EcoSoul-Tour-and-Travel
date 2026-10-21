"use client";

// File picker that rejects unsupported or oversized photos in the browser, before
// the form is sent. Files above the server's request limit would otherwise fail
// with a generic error instead of a helpful message. The server still validates.

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024; // keep in sync with MAX_UPLOAD_BYTES in lib/media.ts

export function ImageFileInput({ className }: { className?: string }) {
  return (
    <input
      type="file"
      name="image"
      accept={ACCEPTED.join(",")}
      className={className}
      onChange={(e) => {
        const input = e.currentTarget;
        const file = input.files?.[0];
        let problem = "";
        if (file && !ACCEPTED.includes(file.type)) problem = "Upload a JPG, PNG, WebP or AVIF image.";
        else if (file && file.size > MAX_BYTES) problem = `This photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please use an image up to 8 MB.`;
        input.setCustomValidity(problem);
        if (problem) input.reportValidity();
      }}
    />
  );
}
