import { Link } from "react-router-dom"
import { Phone, MapPin, Calculator, UserCircle2 } from "lucide-react"

function SidebarIcon({
  label,
  href,
  to,
  onClick,
  Icon
}) {
  const content = (
    <div className="relative flex items-center justify-center">
      <Icon className="h-5 w-5 text-white" />

      <span
        className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#1a365d] shadow-lg opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
      >
        {label}
      </span>
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10 hover:border-white/20"
        aria-label={label}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10 hover:border-white/20"
      aria-label={label}
    >
      {content}
    </Link>
  )
}

export default function PublicIconSidebar() {
  return (
    <div className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40">
      <div className="rounded-2xl bg-[#0f2744]/80 backdrop-blur-md border border-white/10 shadow-lg shadow-black/20 p-2">
        <div className="flex flex-col gap-2">
          <SidebarIcon
            label="Contact"
            href="#contact"
            Icon={Phone}
          />
          <SidebarIcon
            label="Map"
            to="/contact"
            Icon={MapPin}
          />
          <SidebarIcon
            label="Devis"
            to="/quotes"
            Icon={Calculator}
          />
          <SidebarIcon
            label="Client Space"
            to="/login"
            Icon={UserCircle2}
          />
        </div>
      </div>
    </div>
  )
}

