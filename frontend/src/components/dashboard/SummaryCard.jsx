import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string|number} props.value
 * @param {string} [props.subtext]
 * @param {string} [props.extraInfo]
 * @param {import('lucide-react').LucideIcon} props.icon
 * @param {string} props.iconBgClass
 * @param {string} props.iconColorClass
 * @param {string} props.link
 * @param {string} props.linkText
 * @param {number} [props.delay]
 * @param {boolean} [props.mounted]
 * @param {"blue"|"green"|"amber"|"slate"} [props.accent]
 */
export default function SummaryCard({
  title,
  value,
  subtext,
  extraInfo,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  link,
  linkText,
  delay = 0,
  mounted = true,
  accent = "blue"
}) {
  const ring =
    accent === "green"
      ? "hover:ring-[#00a67e]/25"
      : accent === "amber"
        ? "hover:ring-amber-400/30"
        : accent === "slate"
          ? "hover:ring-slate-300/40"
          : "hover:ring-blue-400/25";

  return (
    <div
      className={`
        group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm
        transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60 hover:ring-2 ${ring}
        ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#1a365d] md:text-4xl">{value}</p>
          {subtext && (
            <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="truncate">{subtext}</span>
            </p>
          )}
          {extraInfo && <p className="mt-1 text-xs font-medium text-slate-600">{extraInfo}</p>}
        </div>
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBgClass} transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className={`h-7 w-7 ${iconColorClass}`} />
        </div>
      </div>
      <Link
        to={link}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] transition-colors hover:text-[#1d4ed8] group/link"
      >
        {linkText}
        <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
      </Link>
    </div>
  );
}
