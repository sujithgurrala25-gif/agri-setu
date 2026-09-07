export const PUNE = { lat: 18.5204, lng: 73.8567 };

export function useBuyerOrigin() {
  return PUNE;
}

export function inr(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 1 })}`;
}

export function statusTone(status) {
  const map = {
    PENDING: "bg-amber-50 text-amber-800",
    ACCEPTED: "bg-sky-50 text-sky-800",
    PACKED: "bg-indigo-50 text-indigo-800",
    PICKED_UP: "bg-violet-50 text-violet-800",
    IN_TRANSIT: "bg-blue-50 text-blue-800",
    DELIVERED: "bg-emerald-50 text-emerald-800",
    CANCELLED: "bg-rose-50 text-rose-800",
    REJECTED: "bg-rose-50 text-rose-800",
    verified: "bg-emerald-50 text-emerald-800",
    pending: "bg-amber-50 text-amber-800",
    HIGH: "bg-emerald-50 text-emerald-800",
    MEDIUM: "bg-amber-50 text-amber-800",
    LOW: "bg-slate-100 text-slate-700",
  };
  return map[status] || "bg-slate-100 text-slate-700";
}

export function homeFor(role) {
  if (role === "farmer") return "/app/farmer";
  if (role === "institutional") return "/app/buyer";
  if (role === "admin") return "/app/admin";
  return "/app/market";
}
