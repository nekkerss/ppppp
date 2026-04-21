import { Link } from "react-router-dom";
import { formatDate } from "../../utils/helpers";
import { displayContractType } from "../../utils/dashboardMaps";

export default function ContractsPreviewTable({ contracts, mounted }) {
  const rows = (contracts || []).slice(0, 8);

  return (
    <section
      className={`
        overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50
        transition-all duration-500
        ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
      `}
    >
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1a365d]">Contracts</h2>
          <p className="text-sm text-slate-500">Type, start date & status</p>
        </div>
        <Link
          to="/contracts"
          className="text-sm font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3.5">Type</th>
              <th className="px-6 py-3.5">Start date</th>
              <th className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-14 text-center text-slate-500">
                  No contracts yet. Request a quotation to get started.
                </td>
              </tr>
            ) : (
              rows.map((c) => {
                const typeLabel = displayContractType(c.type);
                const statusOk = c.status === "actif";
                return (
                  <tr
                    key={c._id}
                    className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4 font-semibold text-[#1a365d]">{typeLabel}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(c.startDate)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusOk
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border border-red-200 bg-red-50 text-red-800"
                        }`}
                      >
                        {statusOk ? "Active" : c.status || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
