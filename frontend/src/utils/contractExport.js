import { formatDate } from "./helpers";
import { displayContractType } from "./dashboardMaps";

/** Download a minimal HTML summary the user can print to PDF from the browser */
export function downloadContractSummaryHtml(contract) {
  const type = displayContractType(contract.type);
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>Contract summary</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;color:#1a365d;} table{border-collapse:collapse;width:100%;} td{padding:8px;border:1px solid #e2e8f0;}</style>
</head>
<body>
<h1>BNA Assurances — Contract summary</h1>
<table>
<tr><td>Type</td><td>${escapeHtml(type)}</td></tr>
<tr><td>Start date</td><td>${escapeHtml(formatDate(contract.startDate))}</td></tr>
<tr><td>End date</td><td>${escapeHtml(formatDate(contract.endDate))}</td></tr>
<tr><td>Status</td><td>${escapeHtml(contract.status || "—")}</td></tr>
</table>
<p style="color:#64748b;font-size:12px;margin-top:24px;">Use your browser Print → Save as PDF for a PDF copy.</p>
</body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contract-${contract._id}-summary.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
