// Small helpers for admin forms (server components, uncontrolled inputs).

export function TextField({
  name,
  label,
  defaultValue,
  required,
  hint,
  type = "text",
  maxLength,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  required?: boolean;
  hint?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} maxLength={maxLength} className="input" />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextArea({
  name,
  label,
  defaultValue,
  rows = 4,
  hint,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  rows?: number;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className="input font-[inherit]" />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function FormBanner({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  if (saved) return <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Saved. The public site has been refreshed.</p>;
  return null;
}

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "PUBLISHED" ? "bg-green-100 text-green-800" : status === "PAUSED" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
}
