import { displayContractType, normalizeClaimStatus } from "../../utils/dashboardMaps";

export default function MiniStatCharts({ contracts, claims, mounted }) {
  const typeBuckets = { Auto: 0, Health: 0, Home: 0, Other: 0 };
  (contracts || []).forEach((c) => {
    const t = displayContractType(c.type);
    if (typeBuckets[t] !== undefined) typeBuckets[t] += 1;
    else typeBuckets.Other += 1;
  });
  const typeMax = Math.max(1, ...Object.values(typeBuckets));

  const claimBuckets = { pending: 0, approved: 0, rejected: 0 };
  (claims || []).forEach((c) => {
    const k = normalizeClaimStatus(c.status);
    if (claimBuckets[k] !== undefined) claimBuckets[k] += 1;
  });
  const claimMax = Math.max(1, ...Object.values(claimBuckets));

  const Bar = ({ label, value, max, colorClass }) => (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <section
      className={`
        grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2
        transition-all duration-500
        ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
      `}
    >
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Contracts by type</h3>
        <div className="mt-4 space-y-3">
          <Bar label="Auto" value={typeBuckets.Auto} max={typeMax} colorClass="bg-[#2563eb]" />
          <Bar label="Health" value={typeBuckets.Health} max={typeMax} colorClass="bg-[#00a67e]" />
          <Bar label="Home" value={typeBuckets.Home} max={typeMax} colorClass="bg-indigo-500" />
          {typeBuckets.Other > 0 && (
            <Bar label="Other" value={typeBuckets.Other} max={typeMax} colorClass="bg-slate-400" />
          )}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Claims by status</h3>
        <div className="mt-4 space-y-3">
          <Bar label="Pending" value={claimBuckets.pending} max={claimMax} colorClass="bg-amber-500" />
          <Bar label="Approved" value={claimBuckets.approved} max={claimMax} colorClass="bg-emerald-500" />
          <Bar label="Rejected" value={claimBuckets.rejected} max={claimMax} colorClass="bg-red-500" />
        </div>
      </div>
    </section>
  );
}
