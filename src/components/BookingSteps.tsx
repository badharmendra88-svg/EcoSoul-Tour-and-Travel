// Partner-based booking workflow (review §C): makes clear that a request is
// not a confirmed booking until availability and fare are confirmed.
const steps = [
  { title: "Request received", text: "We get your route, date and travellers." },
  { title: "Partner availability checked", text: "We confirm a suitable vehicle and driver." },
  { title: "Fare confirmed", text: "You receive an itemised written quote." },
  { title: "Booking confirmed", text: "After you accept and pay the agreed advance." },
];

export function BookingSteps({ current = -1, className = "" }: { current?: number; className?: string }) {
  return (
    <ol className={`grid grid-cols-2 gap-3 text-left sm:grid-cols-4 ${className}`} aria-label="How taxi and driver bookings are confirmed">
      {steps.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s.title} className={`rounded-xl p-4 ring-1 ${done ? "bg-forest-700 text-white ring-forest-700" : "bg-white text-slate-700 ring-slate-200"}`}>
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-accent text-forest-900" : "bg-forest-50 text-forest-700"}`}>
              {done ? "✓" : i + 1}
            </span>
            <p className={`mt-2 text-sm font-semibold ${done ? "text-white" : "text-forest-900"}`}>{s.title}</p>
            <p className={`mt-0.5 text-xs ${done ? "text-forest-100" : "text-slate-500"}`}>{s.text}</p>
          </li>
        );
      })}
    </ol>
  );
}
