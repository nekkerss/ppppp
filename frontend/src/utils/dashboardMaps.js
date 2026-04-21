/** Map API contract.type to display label (Auto / Health / Home) */
export function displayContractType(type) {
  if (!type) return "—";
  const t = String(type).toLowerCase();
  if (t.includes("auto")) return "Auto";
  if (t.includes("sante") || t.includes("health") || t.includes("santé")) return "Health";
  if (
    t.includes("habitation") ||
    t.includes("home") ||
    t.includes("maison") ||
    t.includes("batiment") ||
    t.includes("bâtiment")
  ) {
    return "Home";
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** Normalize claim status to pending | approved | rejected */
export function normalizeClaimStatus(status) {
  if (!status) return "pending";
  const s = String(status).toLowerCase();
  if (s.includes("attente") || s === "pending") return "pending";
  if (s.includes("accept") || s === "approved") return "approved";
  if (s.includes("refus") || s === "rejected") return "rejected";
  return "pending";
}

export function claimStatusMeta(status) {
  const key = normalizeClaimStatus(status);
  const map = {
    pending: {
      key: "pending",
      label: "Pending",
      dotClass: "bg-amber-400",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      barClass: "bg-amber-500",
      progress: 40
    },
    approved: {
      key: "approved",
      label: "Approved",
      dotClass: "bg-emerald-500",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      barClass: "bg-emerald-500",
      progress: 100
    },
    rejected: {
      key: "rejected",
      label: "Rejected",
      dotClass: "bg-red-500",
      badgeClass: "bg-red-50 text-red-800 border-red-200",
      barClass: "bg-red-500",
      progress: 100
    }
  };
  return map[key] || map.pending;
}
