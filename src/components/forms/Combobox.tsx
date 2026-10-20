"use client";

import { useId, useMemo, useRef, useState } from "react";

export type ComboOption = { value: string; hint?: string };

/**
 * Accessible text input with a styled suggestion list (replaces <datalist>,
 * whose native popup is narrow and unstyled). Free text is still allowed.
 * ARIA 1.2 combobox pattern: ↑/↓ to move, Enter to choose, Esc to close.
 */
export function Combobox({
  id,
  value,
  onChange,
  options,
  placeholder,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboOption[];
  placeholder?: string;
  describedBy?: string;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q || options.some((o) => o.value.toLowerCase() === q)) return options;
    return options.filter((o) => o.value.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q));
  }, [value, options]);

  function choose(i: number) {
    const o = filtered[i];
    if (!o) return;
    onChange(o.value);
    setOpen(false);
    setActive(-1);
  }

  function move(delta: number) {
    if (!open) setOpen(true);
    const next = filtered.length ? (active + delta + filtered.length) % filtered.length : -1;
    setActive(next);
    listRef.current?.querySelector<HTMLElement>(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open && filtered.length > 0}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-describedby={describedBy}
        placeholder={placeholder}
        value={value}
        className="input pr-10"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Enter" && open && active >= 0) {
            e.preventDefault();
            choose(active);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      <svg
        viewBox="0 0 24 24"
        className={`pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(15,38,27,0.25),0_2px_6px_rgba(15,38,27,0.08)]"
        >
          {filtered.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                // mousedown keeps focus in the input so blur doesn't close the list first
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(i);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] ${
                  i === active ? "bg-forest-50 text-forest-800" : selected ? "bg-forest-100/60 text-forest-900" : "text-slate-700"
                }`}
              >
                <span className={selected ? "font-semibold" : ""}>{o.value}</span>
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  {o.hint}
                  {selected && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-forest-700" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
