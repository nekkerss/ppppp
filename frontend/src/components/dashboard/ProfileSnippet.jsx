import { Link } from "react-router-dom";
import { User, Mail, Pencil } from "lucide-react";

export default function ProfileSnippet({ user, mounted }) {
  return (
    <section
      className={`
        rounded-2xl border border-slate-200 bg-gradient-to-br from-[#f8fafc] to-white p-6 shadow-sm
        transition-all duration-500
        ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563eb]/10 text-xl font-bold text-[#1d4ed8]">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#1a365d]">Profile</h2>
            <p className="mt-0.5 flex items-center gap-2 truncate text-sm font-medium text-slate-800">
              <User className="h-4 w-4 shrink-0 text-slate-400" />
              {user?.name || "User"}
            </p>
            <p className="mt-0.5 flex items-center gap-2 truncate text-sm text-slate-500">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              {user?.email || "—"}
            </p>
          </div>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2563eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#2563eb] shadow-sm transition hover:bg-[#eff6ff]"
        >
          <Pencil className="h-4 w-4" />
          Update info
        </Link>
      </div>
    </section>
  );
}
