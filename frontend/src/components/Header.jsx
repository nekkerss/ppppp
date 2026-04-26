import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { Car, ChevronDown, Heart, HeartPulse, Home as HomeIcon, Menu, Plane, ShieldCheck, X, Sparkles } from "lucide-react"
import { servicesData } from "../data/servicesData"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesMobileOpen, setServicesMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const servicesMenu = [
    { type: "auto",   title: servicesData.auto.label,   description: servicesData.auto.shortDescription,   to: "/services/auto",   icon: Car },
    { type: "home",   title: servicesData.home.label,   description: servicesData.home.shortDescription,   to: "/services/home",   icon: HomeIcon },
    { type: "health", title: servicesData.health.label, description: servicesData.health.shortDescription, to: "/services/health", icon: Heart },
    { type: "travel", title: servicesData.travel.label, description: servicesData.travel.shortDescription, to: "/services/travel", icon: Plane },
    { type: "life",   title: servicesData.life.label,   description: servicesData.life.shortDescription,   to: "/services/life",   icon: HeartPulse }
  ]

  const closeMenus = () => {
    setMobileMenuOpen(false)
    setServicesMobileOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/80"
          : "bg-white/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#00a67e]/25 to-[#0f2744]/10 blur-md opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <img
                src="/images/logo.jpg"
                alt="BNA"
                className="relative h-10 md:h-11 w-10 md:w-11 object-contain rounded-xl bg-white ring-1 ring-slate-200/80 shadow-md group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-[#0f2744] tracking-tight leading-none">BNA</span>
              <span className="text-[10px] font-bold text-[#00a67e] uppercase tracking-[0.18em] leading-none mt-[5px]">Assurances</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Services mega menu */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-[#0f2744] hover:bg-slate-100 transition-all duration-200"
                aria-haspopup="true"
              >
                Nos Services
                <ChevronDown className="h-3.5 w-3.5 text-[#00a67e] transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div
                className="absolute left-1/2 top-full mt-3 w-[920px] max-w-[90vw] rounded-3xl bg-white shadow-2xl shadow-slate-900/10 border border-slate-200/80
                  opacity-0 translate-y-2 scale-[0.97] pointer-events-none
                  transition-all duration-250 ease-out
                  group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                  group-hover:pointer-events-auto
                  group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100
                  group-focus-within:pointer-events-auto"
                style={{ transform: "translateX(-50%)" }}
              >
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                      Nos Assurances
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {servicesMenu.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.type}
                            to={item.to}
                            className="group/item rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:border-[#00a67e]/40 hover:bg-[#effaf5] transition-all duration-200 flex items-start gap-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00a67e]/10 border border-[#00a67e]/15 group-hover/item:bg-[#00a67e]/20 transition-colors">
                              <Icon className="h-5 w-5 text-[#00a67e]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#1a365d] text-sm">{item.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500 leading-snug">{item.description}</p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0a1c2e] via-[#0f2744] to-[#153356] p-5 text-white">
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#00a67e]/15 blur-2xl pointer-events-none" />
                    <div className="relative flex items-center gap-3 mb-4">
                      <div className="rounded-xl bg-white/10 border border-white/15 p-2.5">
                        <ShieldCheck className="h-5 w-5 text-[#00a67e]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#00a67e] uppercase tracking-wider">Devis gratuit</p>
                        <p className="text-base font-bold text-white">En quelques minutes</p>
                      </div>
                    </div>
                    <p className="relative text-xs text-white/70 leading-relaxed mb-5">
                      Recevez une estimation adaptée à votre profil et continuez votre parcours en toute sérénité.
                    </p>
                    <div className="relative grid gap-2">
                      <Link
                        to="/quotes"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a67e] hover:bg-[#008c6a] px-4 py-2.5 text-sm font-bold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Démarrer
                      </Link>
                      <a
                        href="#services"
                        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-semibold transition-colors"
                      >
                        Voir les offres
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {[
              { to: "/actualites", label: "Actualités" },
              { to: "/about", label: "À Propos" },
              { to: "/contact", label: "Contact" }
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-[#0f2744] hover:bg-slate-100 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#0f2744] hover:bg-slate-100 transition-all duration-200"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00a67e] text-white hover:bg-[#008c6a] shadow-md shadow-[#00a67e]/20 hover:shadow-lg hover:shadow-[#00a67e]/30 hover:-translate-y-px transition-all duration-200"
            >
              Créer un compte
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() =>
              setMobileMenuOpen((prev) => {
                if (prev) setServicesMobileOpen(false)
                return !prev
              })
            }
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-slate-200 px-4 py-4 space-y-2">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => setServicesMobileOpen((prev) => !prev)}
          >
            <span>Nos Services</span>
            <ChevronDown className={`h-4 w-4 text-[#00a67e] transition-transform duration-200 ${servicesMobileOpen ? "rotate-180" : ""}`} />
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${servicesMobileOpen ? "max-h-[500px]" : "max-h-0"}`}>
            <div className="space-y-2 px-2 pb-2">
              {servicesMenu.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.type}
                    to={item.to}
                    onClick={closeMenus}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-[#00a67e]/40 hover:bg-[#effaf5] transition-all"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00a67e]/10 border border-[#00a67e]/15">
                      <Icon className="h-4 w-4 text-[#00a67e]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#1a365d]">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.description}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {[
            { to: "/about",      label: "À Propos" },
            { to: "/actualites", label: "Actualités" },
            { to: "/contact",    label: "Contact" }
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={closeMenus}
              className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {item.label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <Link
              to="/login"
              onClick={closeMenus}
              className="w-full px-4 py-3 text-sm font-bold text-center border-2 border-[#0f2744] text-[#0f2744] hover:bg-[#0f2744] hover:text-white rounded-xl transition-all duration-200"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              onClick={closeMenus}
              className="w-full px-4 py-3 text-sm font-bold text-center bg-[#00a67e] text-white hover:bg-[#008c6a] rounded-xl shadow-md transition-all duration-200"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
