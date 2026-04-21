import { Link } from "react-router-dom"
import { ArrowRight, Clock, ShieldCheck, Sparkles, Users } from "lucide-react"
import Header from "../components/Header"
import ServicesSection from "../components/ServicesSection"
import Footer from "../components/Footer"
import PublicIconSidebar from "../components/PublicIconSidebar"
import Reveal from "../components/Reveal"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PublicIconSidebar />
      <main className="pt-20 md:pt-24 md:pl-16 lg:pl-20">
        <section className="relative flex min-h-[70vh] w-full items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80"
            alt="Professional insurance consultation"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f2744]/70 via-black/55 to-black/40" />

          {/* Soft overlay glow */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#00a67e]/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#1a365d]/20 blur-3xl" />

          <div className="relative z-10 mx-auto w-full max-w-5xl px-6 text-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md text-white shadow-lg shadow-black/10">
                <Sparkles className="h-4 w-4 text-[#00a67e]" />
                <span className="text-sm font-semibold">Assurance claire. Devis rapide.</span>
              </div>
            </Reveal>

            <Reveal delayMs={80} className="mt-6">
              <h1 className="text-3xl font-bold leading-tight drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl text-white">
                BNA Assurances, votre partenaire de confiance
              </h1>
            </Reveal>

            <Reveal delayMs={140} className="mt-5">
              <p className="mx-auto max-w-2xl text-base text-white/90 sm:text-lg md:text-xl">
                Protégez ce qui compte avec des couvertures adaptées et un accompagnement sécurisé à chaque étape.
              </p>
            </Reveal>

            <Reveal delayMs={220} className="mt-8">
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/quotes"
                  className="inline-flex items-center justify-center rounded-full bg-[#00a67e] px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008c6a] hover:shadow-xl sm:text-base"
                >
                  Demander un devis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#services"
                  className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/10 px-8 py-3 text-sm font-semibold text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 hover:shadow-lg sm:text-base"
                >
                  Découvrir nos services
                </a>
              </div>
            </Reveal>

            <Reveal delayMs={280} className="mt-12">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 text-left">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#00a67e]" />
                    <p className="text-sm font-semibold text-white">Couvertures fiables</p>
                  </div>
                  <p className="mt-2 text-sm text-white/80">Garanties claires et transparence.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 text-left">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-[#7dd3fc]" />
                    <p className="text-sm font-semibold text-white">Réponse rapide</p>
                  </div>
                  <p className="mt-2 text-sm text-white/80">Devis en quelques étapes.</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 text-left">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-[#00a67e]" />
                    <p className="text-sm font-semibold text-white">Accompagnement client</p>
                  </div>
                  <p className="mt-2 text-sm text-white/80">Support et suivi 24/7.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
        <ServicesSection />

        {/* How it works */}
        <section className="bg-gray-100/40 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <Reveal>
                <span className="text-sm font-semibold uppercase tracking-wider text-[#00a67e]">How it works</span>
              </Reveal>
              <Reveal delayMs={80}>
                <h2 className="mt-3 text-3xl font-bold text-[#1a365d] md:text-4xl lg:text-5xl">
                  Un parcours simple, comme une banque
                </h2>
              </Reveal>
              <Reveal delayMs={160}>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                  De la demande de devis à la couverture, tout est pensé pour aller vite et rester clair.
                </p>
              </Reveal>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Reveal>
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a67e]/10 border border-[#00a67e]/20">
                      <ShieldCheck className="h-6 w-6 text-[#00a67e]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1a365d]">1. Choisissez</h3>
                      <p className="mt-2 text-slate-600">Sélectionnez l’assurance qui correspond à votre besoin.</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delayMs={80}>
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a365d]/10 border border-[#1a365d]/20">
                      <Clock className="h-6 w-6 text-[#1a365d]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1a365d]">2. Demandez un devis</h3>
                      <p className="mt-2 text-slate-600">Complétez votre demande en ligne, en toute sécurité.</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delayMs={160}>
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a67e]/10 border border-[#00a67e]/20">
                      <Sparkles className="h-6 w-6 text-[#00a67e]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1a365d]">3. Démarrez</h3>
                      <p className="mt-2 text-slate-600">Recevez votre estimation et activez votre couverture.</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-10 flex justify-center">
              <Reveal delayMs={220}>
                <Link
                  to="/quotes"
                  className="inline-flex items-center justify-center rounded-full bg-[#00a67e] px-7 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#008c6a] hover:shadow-lg"
                >
                  Demander un devis gratuit
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-8">
                  <Reveal>
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#00a67e]">
                      Why choose us
                    </span>
                  </Reveal>
                  <Reveal delayMs={80}>
                    <h2 className="mt-3 text-3xl font-bold text-[#1a365d] md:text-4xl">
                      La confiance, c est notre produit
                    </h2>
                  </Reveal>
                  <Reveal delayMs={160}>
                    <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                      Transparence, proximité et accompagnement: votre expérience doit être aussi simple que sécurisée.
                    </p>
                  </Reveal>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Tarifs clairs",
                      desc: "Des garanties expliquées simplement, sans surprises.",
                      icon: ShieldCheck
                    },
                    {
                      title: "Support 24/7",
                      desc: "Un interlocuteur disponible pour vos questions et démarches.",
                      icon: Clock
                    },
                    {
                      title: "Processus digital",
                      desc: "Demande de devis fluide et suivi de votre dossier.",
                      icon: Sparkles
                    }
                  ].map((f, idx) => (
                    <Reveal key={f.title} delayMs={idx * 80}>
                      <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-gray-50 p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a67e]/10 border border-[#00a67e]/20">
                          <f.icon className="h-6 w-6 text-[#00a67e]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#1a365d]">{f.title}</h3>
                          <p className="mt-1 text-slate-600">{f.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Reveal>
                  <div className="rounded-3xl bg-gradient-to-br from-[#0f2744] via-[#153356] to-[#1a3a5c] p-7 text-white shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#7dd3fc]">BNA performance</p>
                        <h3 className="mt-2 text-2xl font-bold">Des résultats concrets</h3>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3 border border-white/15">
                        <Sparkles className="h-6 w-6 text-[#00a67e]" />
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      {[
                        { value: "24/7", label: "Support" },
                        { value: "Devis", label: "Rapide" },
                        { value: "30+", label: "Années" }
                      ].map((s) => (
                        <div key={s.value} className="rounded-2xl bg-white/10 border border-white/15 p-4">
                          <p className="text-2xl font-bold">{s.value}</p>
                          <p className="mt-1 text-sm text-white/80">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>

                <Reveal delayMs={140}>
                  <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                    <p className="text-sm font-semibold text-[#1a365d]">Témoignage</p>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                      “J’ai reçu mon devis rapidement et j’ai eu un accompagnement clair. Le processus est vraiment fluide.”
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-full bg-[#00a67e]/10 border border-[#00a67e]/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-[#00a67e]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1a365d]">Client BNA</p>
                          <p className="text-sm text-slate-500">Espace client</p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-[#00a67e]">★ ★ ★ ★ ★</div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}