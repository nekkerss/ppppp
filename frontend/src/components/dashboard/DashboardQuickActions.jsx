import { Link } from "react-router-dom";
import { Plus, Upload, ClipboardList } from "lucide-react";

export default function DashboardQuickActions({ mounted }) {
  const actions = [
    {
      to: "/quotes",
      label: "Request quotation",
      icon: Plus,
      className:
        "border-2 border-[#2563eb] bg-white text-[#1d4ed8] hover:bg-[#eff6ff] hover:shadow-md hover:shadow-blue-200/50"
    },
    {
      to: "/declaration-sinistre",
      label: "Declare claim",
      icon: ClipboardList,
      className:
        "border-2 border-red-500/80 bg-white text-red-700 hover:bg-red-50 hover:shadow-md hover:shadow-red-200/40"
    },
    {
      to: "/documents",
      label: "Upload document",
      icon: Upload,
      className:
        "border-2 border-[#00a67e] bg-white text-[#047857] hover:bg-[#ecfdf5] hover:shadow-md hover:shadow-emerald-200/50"
    }
  ];

  return (
    <section
      className={`
        relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/80 to-[#f0f9ff] p-6 shadow-sm
        transition-all duration-500
        ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
      `}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#2563eb]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-[#00a67e]/10 blur-2xl" />

      <h2 className="relative text-lg font-bold text-[#1a365d]">Quick actions</h2>
      <p className="relative mt-1 text-sm text-slate-500">Common tasks in one place</p>

      <div className="relative mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {actions.map(({ to, label, icon: Icon, className }) => (
          <Link
            key={to}
            to={to}
            className={`
              flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl px-4 py-5 text-center font-semibold
              transition-all duration-300 hover:-translate-y-0.5 ${className}
            `}
          >
            <Icon className="h-6 w-6" strokeWidth={2} />
            <span className="text-sm leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
