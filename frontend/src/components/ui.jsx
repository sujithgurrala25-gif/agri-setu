export function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-ink text-white hover:bg-black",
    ghost: "bg-cream text-ink hover:bg-line",
    outline: "border border-line bg-white hover:bg-cream",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-mute">{hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-2xl border border-line bg-cream/40 px-3 py-2.5 text-sm ${className}`}
      {...props}
    />
  );
}

export function Textarea(props) {
  return <textarea className="w-full rounded-2xl border border-line bg-cream/40 px-3 py-2.5 text-sm" {...props} />;
}

export function Select(props) {
  return <select className="w-full rounded-2xl border border-line bg-cream/40 px-3 py-2.5 text-sm" {...props} />;
}

export function Empty({ title, body }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-cream/50 p-10 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-mute">{body}</p>
    </div>
  );
}

export function ErrorText({ message }) {
  if (!message) return null;
  return <p className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-800">{message}</p>;
}

export function Stat({ label, value, hint }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-mute">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-sm text-mute">{hint}</p>}
    </div>
  );
}
