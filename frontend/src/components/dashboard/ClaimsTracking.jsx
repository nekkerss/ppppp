import { Link } from "react-router-dom";
import { claimStatusMeta } from "../../utils/dashboardMaps";
import { formatDate, truncateText } from "../../utils/helpers";

export default function ClaimsTracking({ claims, mounted }) {
  const sorted = [...(claims || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <section
      className={`
        rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
        transition-all duration-500
        ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
      `}
    >
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1a365d]">Claims tracking</h2>
          <p className="text-sm text-slate-500">Status with color indicators</p>
        </div>
        <Link to="/claims" className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
          View all claims
        </Link>
      </div>

      <ul className="space-y-4">
        {sorted.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
            No claims submitted yet.
          </li>
        ) : (
          sorted.map((claim) => {
            const meta = claimStatusMeta(claim.status);
            return (
              <li
                key={claim._id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 hover:bg-white"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1a365d]">{truncateText(claim.description, 120)}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(claim.date)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
                      {meta.label}
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all ${meta.barClass}`}
                    style={{ width: `${meta.progress}%` }}
                  />
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
