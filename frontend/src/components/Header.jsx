import { Link } from "react-router-dom"
import { useState } from "react"
import { Car, ChevronDown, Heart, HeartPulse, Home as HomeIcon, Menu, Plane, ShieldCheck, X } from "lucide-react"
import { servicesData } from "../data/servicesData"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [servicesMobileOpen, setServicesMobileOpen] = useState(false)

  const servicesMenu = [
    {
      type: "auto",
      title: servicesData.auto.label,
      description: servicesData.auto.shortDescription,
      to: "/services/auto",
      icon: Car
    },
    {
      type: "home",
      title: servicesData.home.label,
      description: servicesData.home.shortDescription,
      to: "/services/home",
      icon: HomeIcon
    },
    {
      type: "health",
      title: servicesData.health.label,
      description: servicesData.health.shortDescription,
      to: "/services/health",
      icon: Heart
    },
    {
      type: "travel",
      title: servicesData.travel.label,
      description: servicesData.travel.shortDescription,
      to: "/services/travel",
      icon: Plane
    },
    {
      type: "life",
      title: servicesData.life.label,
      description: servicesData.life.shortDescription,
      to: "/services/life",
      icon: HeartPulse
    }
  ]

  const closeMenus = () => {
    setMobileMenuOpen(false)
    setServicesMobileOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="BNA Assurances"
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="relative group">
              <button
                type="button"
                className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors flex items-center gap-2"
                aria-haspopup="true"
              >
                Nos Services
                <ChevronDown className="h-4 w-4 text-[#00a67e] transition-transform duration-200 group-hover:rotate-180" />
              </button>

              {/* Mega menu */}
              <div
                className="absolute left-1/2 top-full mt-4 w-[920px] max-w-[90vw] rounded-2xl bg-white shadow-xl border border-slate-200
                  opacity-0 translate-y-2 scale-95 pointer-events-none
                  transition-all duration-200
                  group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100
                  group-hover:pointer-events-auto
                  group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100
                  group-focus-within:pointer-events-auto"
              >
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Assurances
                    </p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {servicesMenu.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.type}
                            to={item.to}
                            className="group rounded-xl border border-slate-200 bg-white p-4 hover:border-[#00a67e]/40 hover:bg-[#effaf5] transition-all duration-200 flex items-start gap-3"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00a67e]/10 border border-[#00a67e]/20">
                              <Icon className="h-5 w-5 text-[#00a67e]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#1a365d]">{item.title}</p>
                              <p className="mt-1 text-sm text-slate-600 leading-snug">
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-b from-[#0f2744] via-[#153356] to-[#1a3a5c] p-5 text-white border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                        <ShieldCheck className="h-5 w-5 text-[#00a67e]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#7dd3fc]">Demander un devis</p>
                        <p className="text-lg font-bold">En quelques minutes</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-white/80 leading-relaxed">
                      Recevez une estimation adaptée à votre profil et continuez votre parcours en toute sérénité.
                    </p>

                    <div className="mt-5 grid gap-3">
                      <Link
                        to="/quotes"
                        className="inline-flex items-center justify-center rounded-xl bg-[#00a67e] hover:bg-[#008c6a] px-4 py-3 font-semibold transition-colors"
                      >
                        Démarrer
                      </Link>
                      <a
                        href="#services"
                        className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-3 font-semibold transition-colors"
                      >
                        Voir les offres
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/actualites"
              className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors"
            >
              Actualités
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors"
            >
              À Propos
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/login"
              className="px-4 py-2 text-sm font-medium text-[#1a365d] hover:bg-gray-100 rounded-lg transition-colors"
            >
              Connexion
            </Link>
            <Link 
              to="/register"
              className="px-4 py-2 text-sm font-medium bg-[#00a67e] text-white hover:bg-[#00a67e]/90 rounded-lg transition-colors"
            >
              Créer un compte
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-900"
            onClick={() =>
              setMobileMenuOpen((prev) => {
                if (prev) setServicesMobileOpen(false)
                return !prev
              })
            }
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-3">
              <button
                type="button"
                className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors py-2 flex items-center justify-between w-full"
                aria-expanded={servicesMobileOpen}
                onClick={() => setServicesMobileOpen((prev) => !prev)}
              >
                <span>Nos Services</span>
                <ChevronDown
                  className={`h-4 w-4 text-[#00a67e] transition-transform duration-200 ${
                    servicesMobileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {servicesMobileOpen && (
                <div className="space-y-2 pl-4 pb-2">
                  {servicesMenu.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.type}
                        to={item.to}
                        onClick={closeMenus}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-[#00a67e]/40 hover:bg-[#effaf5] transition-colors"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00a67e]/10 border border-[#00a67e]/20">
                          <Icon className="h-4 w-4 text-[#00a67e]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1a365d]">{item.title}</p>
                          <p className="mt-0.5 text-xs text-slate-600 leading-snug">{item.description}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
              <Link
                to="/about"
                className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors py-2"
                onClick={closeMenus}
              >
                À Propos
              </Link>
              <Link
                to="/actualites"
                className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors py-2"
                onClick={closeMenus}
              >
                Actualités
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium text-gray-600 hover:text-[#1a365d] transition-colors py-2"
                onClick={closeMenus}
              >
                Contact
              </Link>
            </nav>
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              <Link 
                to="/login"
                className="w-full px-4 py-2 text-sm font-medium text-center border border-gray-300 text-[#1a365d] hover:bg-gray-50 rounded-lg transition-colors"
                onClick={closeMenus}
              >
                Connexion
              </Link>
              <Link 
                to="/register"
                className="w-full px-4 py-2 text-sm font-medium text-center bg-[#00a67e] text-white hover:bg-[#00a67e]/90 rounded-lg transition-colors"
                onClick={closeMenus}
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}