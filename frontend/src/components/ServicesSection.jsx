import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Car, HeartPulse, Home, Heart, Plane, ArrowRight, CheckCircle2 } from "lucide-react"
import { servicesData } from "../data/servicesData"

const serviceCards = [
  {
    icon: Car,
    type: "auto",
    title: "Assurance Auto",
    description: "Protection complete pour votre vehicule avec des garanties adaptees a vos besoins."
  },
  {
    icon: Home,
    type: "home",
    title: "Assurance Habitation",
    description: "Securisez votre logement et vos biens contre les risques du quotidien."
  },
  {
    icon: Heart,
    type: "health",
    title: "Assurance Sante",
    description: "Des couvertures sante completes pour vous et votre famille."
  },
  {
    icon: Plane,
    type: "travel",
    title: "Assurance Voyage",
    description: "Voyagez sereinement avec une couverture medicale et assistance internationale."
  },
  {
    icon: HeartPulse,
    type: "life",
    title: "Assurance Vie",
    description: "Proteger vos proches et preparer l'avenir avec une epargne flexible."
  }
]

export default function ServicesSection() {
  const [activeType, setActiveType] = useState("auto")
  const detailsRef = useRef(null)
  const activeService = servicesData[activeType]

  const handleCardClick = (type) => {
    setActiveType(type)
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section id="services" className="bg-gray-100/50 py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-[#00a67e]">Nos Services</span>
          <h2 className="mt-3 mb-4 text-3xl font-bold text-[#1a365d] md:text-4xl lg:text-5xl">
            Des solutions pour chaque besoin
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Cliquez sur un service pour afficher ses details, ses avantages et demander un devis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {serviceCards.map((service) => (
            <button
              key={service.type}
              type="button"
              onClick={() => handleCardClick(service.type)}
              className={`group rounded-xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a67e]/40 ${
                activeType === service.type
                  ? "border-[#00a67e]/70 ring-2 ring-[#00a67e]/20 bg-gradient-to-b from-[#00a67e]/10 via-white to-white"
                  : "border-gray-200 hover:border-[#00a67e]/50 hover:bg-gradient-to-b hover:from-[#effaf5] hover:to-white"
              }`}
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#00a67e]/10 transition-all duration-300 group-hover:bg-[#00a67e]/20 group-hover:scale-[1.08]">
                <service.icon className="h-7 w-7 text-[#00a67e] transition-transform duration-300 group-hover:rotate-[-6deg]" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-[#1a365d]">{service.title}</h3>
              <p className="leading-relaxed text-gray-600">{service.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#00a67e]">
                Voir les details
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>

        <div ref={detailsRef} className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#00a67e]">Détails du service</p>
              <h3 className="mt-2 text-3xl font-bold text-[#1a365d]">{activeService.label}</h3>
              <p className="mt-4 leading-relaxed text-slate-600">{activeService.fullDescription}</p>

              <ul className="mt-6 space-y-3">
                {activeService.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#00a67e]" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/quotes"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[#00a67e] px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008c6a] hover:shadow-lg"
              >
                Demander un devis
              </Link>
            </div>

            <div>
              <img
                src={activeService.image}
                alt={activeService.label}
                className="h-[320px] w-full rounded-2xl object-cover shadow-xl md:h-[420px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}