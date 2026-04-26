import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Car, HeartPulse, Home, Heart, Plane, ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { servicesData } from "../data/servicesData"
import Reveal from "./Reveal"

const serviceCards = [
  { icon: Car,       type: "auto",   title: "Assurance Auto",       description: "Protection complète pour votre véhicule avec des garanties adaptées." },
  { icon: Home,      type: "home",   title: "Assurance Habitation", description: "Sécurisez votre logement et vos biens contre les risques du quotidien." },
  { icon: Heart,     type: "health", title: "Assurance Santé",      description: "Des couvertures santé complètes pour vous et votre famille." },
  { icon: Plane,     type: "travel", title: "Assurance Voyage",     description: "Voyagez sereinement avec une couverture médicale internationale." },
  { icon: HeartPulse,type: "life",   title: "Assurance Vie",        description: "Protégez vos proches et préparez l'avenir avec une épargne flexible." }
]

export default function ServicesSection() {
  const [activeType, setActiveType] = useState("auto")
  const detailsRef = useRef(null)
  const activeService = servicesData[activeType]

  const handleCardClick = (type) => {
    setActiveType(type)
    setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)
  }

  return (
    <section id="services" className="relative bg-slate-50 py-20 md:py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#00a67e]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#1a365d]/5 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00a67e]/10 border border-[#00a67e]/20 px-4 py-2 text-sm font-bold text-[#00a67e] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Nos Services
            </span>
          </Reveal>
          <Reveal delayMs={80}>
            <h2 className="mt-5 text-3xl font-extrabold text-[#1a365d] md:text-4xl lg:text-5xl">
              Des solutions pour{" "}
              <span className="text-[#00a67e]">chaque besoin</span>
            </h2>
          </Reveal>
          <Reveal delayMs={160}>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Cliquez sur un service pour afficher ses détails, ses avantages et demander un devis.
            </p>
          </Reveal>
        </div>

        {/* Service Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-10">
          {serviceCards.map((service, idx) => {
            const isActive = activeType === service.type
            return (
              <Reveal key={service.type} delayMs={idx * 60}>
                <button
                  type="button"
                  onClick={() => handleCardClick(service.type)}
                  className={`group w-full rounded-2xl border p-5 text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a67e]/40 ${
                    isActive
                      ? "border-[#00a67e]/60 bg-gradient-to-b from-[#00a67e]/10 via-white to-white ring-2 ring-[#00a67e]/20 shadow-lg shadow-[#00a67e]/10 -translate-y-1"
                      : "border-slate-200 bg-white hover:border-[#00a67e]/40 hover:bg-gradient-to-b hover:from-[#effaf5] hover:to-white hover:-translate-y-1 hover:shadow-xl shadow-sm"
                  }`}
                >
                  <div className={`mb-4 flex h-13 w-13 items-center justify-center rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-[#00a67e]/20 border border-[#00a67e]/30 scale-110"
                      : "bg-[#00a67e]/10 border border-[#00a67e]/15 group-hover:bg-[#00a67e]/20 group-hover:scale-105"
                  }`}
                    style={{ width: "52px", height: "52px" }}
                  >
                    <service.icon className={`h-6 w-6 text-[#00a67e] transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:rotate-[-6deg]"}`} />
                  </div>

                  <h3 className={`mb-2 text-base font-bold transition-colors duration-200 ${isActive ? "text-[#00a67e]" : "text-[#1a365d] group-hover:text-[#00a67e]"}`}>
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{service.description}</p>

                  <div className={`mt-3 flex items-center gap-1 text-xs font-bold transition-all duration-200 ${isActive ? "text-[#00a67e]" : "text-slate-400 group-hover:text-[#00a67e]"}`}>
                    {isActive ? "Sélectionné" : "Voir les détails"}
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isActive ? "translate-x-0.5" : "group-hover:translate-x-1"}`} />
                  </div>

                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="mt-3 h-0.5 rounded-full bg-gradient-to-r from-[#00a67e] to-[#00d4a0]" />
                  )}
                </button>
              </Reveal>
            )
          })}
        </div>

        {/* Detail Panel */}
        <div
          ref={detailsRef}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
          style={{ scrollMarginTop: "100px" }}
        >
          {/* Glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#00a67e]/5 blur-3xl pointer-events-none" />

          <div className="relative p-7 md:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              {/* Info */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#00a67e]/10 border border-[#00a67e]/15 px-3 py-1.5 text-xs font-bold text-[#00a67e] uppercase tracking-wider mb-4">
                  <Sparkles className="w-3 h-3" />
                  Détails du service
                </span>
                <h3 className="text-3xl font-extrabold text-[#1a365d]">{activeService.label}</h3>
                <p className="mt-4 leading-relaxed text-slate-500">{activeService.fullDescription}</p>

                <ul className="mt-6 space-y-3">
                  {activeService.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-slate-700">
                      <div className="w-6 h-6 rounded-lg bg-[#00a67e]/10 border border-[#00a67e]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#00a67e]" />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/quotes"
                  className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#00a67e] px-7 py-3.5 font-bold text-white shadow-lg shadow-[#00a67e]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008c6a] hover:shadow-xl hover:shadow-[#00a67e]/40"
                >
                  Demander un devis
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Image */}
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#00a67e]/10 to-transparent pointer-events-none" />
                <img
                  src={activeService.image}
                  alt={activeService.label}
                  className="h-[300px] w-full rounded-3xl object-cover shadow-2xl md:h-[400px] transition-all duration-500"
                  style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
