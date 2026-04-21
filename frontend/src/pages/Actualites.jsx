import { Link } from "react-router-dom"
import { ArrowRight, Clock, Video } from "lucide-react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Reveal from "../components/Reveal"

const news = [
  {
    id: "cyber-essentials",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80",
    title: "Cybersécurité : protégez vos données et vos paiements",
    description:
      "Des réflexes simples aux solutions dédiées, découvrez comment renforcer votre protection au quotidien.",
    date: "16 Avril 2026"
  },
  {
    id: "sinistre-dossier",
    image:
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1400&q=80",
    title: "Déclarer un sinistre : les étapes clés pour agir vite",
    description:
      "Préparez les documents utiles et suivez un parcours clair pour accélérer le traitement de votre dossier.",
    date: "10 Avril 2026"
  },
  {
    id: "assurance-auto",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
    title: "Assurance auto : choisir la bonne couverture",
    description:
      "Comprenez les garanties essentielles et comparez les options pour sécuriser chaque trajet.",
    date: "02 Avril 2026"
  }
]

export default function Actualites() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-20 md:pt-24">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1920&q=80"
            alt="Actualités et conseils"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f2744]/90 via-[#0f2744]/70 to-black/60" />
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#00a67e]/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[#00a67e]/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white shadow-lg shadow-black/20">
                <Clock className="h-4 w-4 text-[#7dd3fc]" />
                <span className="text-sm font-semibold">Mises à jour & conseils</span>
              </div>
            </Reveal>

            <Reveal delayMs={80}>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Actualités &amp; Conseils
              </h1>
            </Reveal>

            <Reveal delayMs={140}>
              <p className="mt-4 max-w-2xl text-lg text-white/85 leading-relaxed">
                Restez informé et prenez de meilleures décisions grâce à des contenus clairs, utiles et orientés client.
              </p>
            </Reveal>

            <Reveal delayMs={220}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/quotes"
                  className="inline-flex items-center justify-center rounded-xl bg-[#00a67e] px-6 py-3 font-semibold text-white shadow-lg shadow-[#00a67e]/30 transition-all hover:-translate-y-0.5 hover:bg-[#008c6a]"
                >
                  Demander un devis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <a
                  href="#news"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white/90 transition-all hover:bg-white/10"
                >
                  Voir les articles
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* NEWS */}
        <section id="news" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="mb-12 text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#00a67e]">Actualités</p>
            </Reveal>
            <Reveal delayMs={90}>
              <h2 className="mt-3 text-3xl font-bold text-[#1a365d] md:text-4xl">Conseils fintech, clairs et utiles</h2>
            </Reveal>
            <Reveal delayMs={160}>
              <p className="mx-auto mt-4 max-w-2xl text-gray-600">
                Sélection d’articles pour mieux comprendre l’assurance, le parcours client et la gestion des dossiers.
              </p>
            </Reveal>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {news.map((item, idx) => (
              <Reveal key={item.id} delayMs={idx * 120}>
                <article className="group rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#00a67e]/30">
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Article</p>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#00a67e]/10 px-3 py-1 text-xs font-semibold text-[#008c6a]">
                        <Clock className="h-3.5 w-3.5" />
                        {item.date}
                      </div>
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-[#1a365d] leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-5 flex">
                      <Link
                        to="/actualites"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#00a67e] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#008c6a] hover:shadow-md"
                      >
                        Lire plus
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* VIDEO */}
        <section className="bg-gray-100/40 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <Reveal>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#00a67e]">
                  Vidéo explicative
                </p>
                <h2 className="mt-3 text-3xl font-bold text-[#1a365d] md:text-4xl">
                  Vidéo explicative
                </h2>
              </Reveal>
              <Reveal delayMs={120}>
                <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm w-fit">
                  <Video className="h-5 w-5 text-[#00a67e]" />
                  <p className="text-sm font-semibold text-slate-700">Comprendre le parcours client</p>
                </div>
              </Reveal>
            </div>

            <div className="mt-10 grid grid-cols-1">
              <Reveal delayMs={160}>
                <div className="rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden">
                  <div className="relative w-full aspect-[16/9]">
                    <iframe
                      title="Vidéo explicative"
                      src="https://www.youtube.com/embed/ysz5S6PUM-U"
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

