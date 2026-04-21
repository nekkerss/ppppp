import { Link } from "react-router-dom";
import { Bell, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { buildDashboardNotifications } from "../../utils/dashboardNotifications";

const toneIcons = {
  success: CheckCircle2,
  alert: Bell,
  info: FileText,
  neutral: Bell
};

export default function NotificationsPanel({ claims, quotes, mounted }) {
  const raw = buildDashboardNotifications(claims, quotes);
  const list = raw.map((n) => ({
    ...n,
    icon: n.tone === "info" && n.text.includes("quotation") ? Sparkles : toneIcons[n.tone] || Bell
  }));

  return (
    <section
      className={`
        rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
        transition-all duration-500
        ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
      `}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff6ff]">
            <Bell className="h-5 w-5 text-[#2563eb]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1a365d]">Notifications</h2>
            <p className="text-xs text-slate-500">Recent updates</p>
          </div>
        </div>
        <Link to="/messages" className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
          Open inbox
        </Link>
      </div>

      <ul className="space-y-3">
        {list.map((n) => {
          const Icon = n.icon;
          const border =
            n.tone === "success"
              ? "border-emerald-100 bg-emerald-50/50"
              : n.tone === "alert"
                ? "border-red-100 bg-red-50/40"
                : n.tone === "info"
                  ? "border-blue-100 bg-[#f8fafc]"
                  : "border-slate-100 bg-slate-50/80";
          const iconColor =
            n.tone === "success"
              ? "text-emerald-600"
              : n.tone === "alert"
                ? "text-red-600"
                : n.tone === "info"
                  ? "text-[#2563eb]"
                  : "text-slate-600";

          return (
            <li
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border px-3 py-3 text-sm ${border}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
              <span className="leading-snug text-slate-700">{n.text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
