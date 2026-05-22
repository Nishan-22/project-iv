const styles = {
  open: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  active: "bg-blue-100 text-blue-800 ring-blue-600/20",
  closed: "bg-slate-100 text-slate-600 ring-slate-500/10",
  draft: "bg-amber-100 text-amber-900 ring-amber-600/20",
};

export function StatusBadge({ status, isOpen }) {
  const key =
    status === "active" && isOpen
      ? "open"
      : status === "active"
        ? "active"
        : status === "closed"
          ? "closed"
          : "draft";

  const label =
    status === "active" && isOpen
      ? "Open"
      : status === "active"
        ? "Active"
        : status === "closed"
          ? "Closed"
          : "Draft";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ${styles[key]}`}
    >
      {label}
    </span>
  );
}
