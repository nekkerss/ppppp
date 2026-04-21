import { normalizeClaimStatus } from "./dashboardMaps";

export function buildDashboardNotifications(claims, quotes) {
  const items = [];

  (claims || []).forEach((c) => {
    const st = normalizeClaimStatus(c.status);
    if (st === "approved") {
      items.push({
        id: `claim-ok-${c._id}`,
        text: "Your claim has been approved",
        tone: "success"
      });
    } else if (st === "rejected") {
      items.push({
        id: `claim-no-${c._id}`,
        text: "Your claim was rejected — check details for next steps",
        tone: "alert"
      });
    }
  });

  (quotes || []).slice(0, 3).forEach((q, i) => {
    items.push({
      id: `quote-${q._id || i}`,
      text: "Your quotation is ready",
      tone: "info"
    });
  });

  const examples = [
    { id: "ex-1", text: "Your claim has been approved", tone: "success" },
    { id: "ex-2", text: "Your quotation is ready", tone: "info" },
    { id: "ex-3", text: "Reminder: review your contract before renewal", tone: "neutral" }
  ];

  const merged = [...items];
  for (const ex of examples) {
    if (merged.length >= 6) break;
    if (!merged.some((m) => m.text === ex.text)) merged.push(ex);
  }

  return merged.slice(0, 6);
}
