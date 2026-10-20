// Small helpers for admin forms (server components, uncontrolled inputs).
import { Icon } from "./ui";

export { StatusBadge } from "./ui";

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
      <label htmlFor={name} className="admin-label">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} maxLength={maxLength} className="admin-input" />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
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
      <label htmlFor={name} className="admin-label">
        {label}
        {required && <span className="text-rose-600"> *</span>}
      </label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className="admin-input" />
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function FormBanner({ saved, error, savedText = "Saved. The public site has been refreshed." }: { saved?: string; error?: string; savedText?: string }) {
  if (error)
    return (
      <p role="alert" className="flex items-center gap-2 rounded-2xl bg-rose-50 px-5 py-3 text-sm text-rose-800 ring-1 ring-rose-100">
        <Icon name="bell" /> {error}
      </p>
    );
  if (saved)
    return (
      <p role="status" className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
        <Icon name="check" /> {savedText}
      </p>
    );
  return null;
}
