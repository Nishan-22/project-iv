export function formatDateRange(start, end) {
  const opts = { dateStyle: "medium", timeStyle: "short" };
  return `${new Date(start).toLocaleString(undefined, opts)} – ${new Date(end).toLocaleString(undefined, opts)}`;
}

export function statusLabel(status, isOpen) {
  if (status === "active" && isOpen) return "Open for voting";
  if (status === "active") return "Active";
  if (status === "closed") return "Closed";
  return "Draft";
}

export function shortenAddress(addr) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
