import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-20 md:pt-24">
        <section className="bg-gradient-to-br from-[#0f2744] via-[#153356] to-[#1a3a5c] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <p className="text-[#00d1a0] font-semibold uppercase tracking-wider text-sm">BNA Assurances</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold max-w-3xl">A propos de notre compagnie</h1>
            <p className="mt-4 text-blue-100/90 max-w-2xl">
              Nous accompagnons particuliers et professionnels avec des solutions fiables, transparentes et
              adaptees a chaque etape de vie.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <img
              src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1400&q=80"
              alt="Equipe assurance"
              className="w-full h-[360px] object-cover rounded-2xl shadow-lg"
            />
            <div>
              <h2 className="text-3xl font-bold text-[#1a365d]">Company presentation</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                BNA Assurances est un acteur de reference en Tunisie, reconnu pour sa solidite, son expertise
                metier et sa proximite client. Notre ambition est de rendre l'assurance plus simple grace a une
                relation humaine et des outils digitaux performants.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
              <h3 className="text-2xl font-bold text-[#1a365d]">Mission</h3>
              <p className="mt-3 text-slate-600">
                Offrir des protections accessibles et performantes, avec une experience client fluide et un
                accompagnement personnalise pour chaque dossier.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
              <h3 className="text-2xl font-bold text-[#1a365d]">Vision</h3>
              <p className="mt-3 text-slate-600">
                Devenir la reference fintech-assurance en Afrique du Nord en combinant innovation digitale,
                confiance et excellence operationnelle.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
