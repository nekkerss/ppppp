import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Clock, ShieldCheck, Sparkles, Users, ChevronDown, Star, TrendingUp, Award } from "lucide-react"
import Header from "../components/Header"
import ServicesSection from "../components/ServicesSection"
import Footer from "../components/Footer"
import PublicIconSidebar from "../components/PublicIconSidebar"
import Reveal from "../components/Reveal"

function CountUp({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmerText {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,166,126,0.3); }
          50% { box-shadow: 0 0 0 16px rgba(0,166,126,0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        .hero-float { animation: heroFloat 6s ease-in-out infinite; }
        .rotate-slow { animation: rotateSlow 20s linear infinite; }
        .shimmer-text {
          background: linear-gradient(270deg, #00a67e, #00d4a0, #7dd3fc, #00a67e);
          background-size: 300% 300%;
          animation: shimmerText 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pulse-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
        .bounce-arrow { animation: bounceArrow 2s ease-in-out infinite; }
        .hero-badge { animation: fadeUp 0.8s ease-out 0.3s both; }
        .hero-title { animation: fadeUp 0.8s ease-out 0.5s both; }
        .hero-sub { animation: fadeUp 0.8s ease-out 0.7s both; }
        .hero-btns { animation: fadeUp 0.8s ease-out 0.9s both; }
        .hero-cards { animation: fadeUp 0.8s ease-out 1.1s both; }
      `}</style>

      <Header />
      <PublicIconSidebar />

      <main className="pt-20 md:pt-24 md:pl-16 lg:pl-20">

        {/* ─── Hero ─── */}
        <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80"
            alt="Professional insurance consultation"
            className="absolute inset-0 h-full w-full object-cover scale-105 transition-transform duration-[8000ms]"
            style={{ transform: heroLoaded ? "scale(1)" : "scale(1.05)" }}
          />

          {/* Layered gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1c2e]/90 via-[#0f2744]/75 to-[#0f2744]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Animated glow orbs */}
          <div className="hero-float absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#00a67e]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-[#1a365d]/30 blur-3xl pointer-events-none" style={{ animation: "heroFloat 8s ease-in-out infinite 2s" }} />
          <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[#00a67e]/10 blur-2xl pointer-events-none" style={{ animation: "heroFloat 10s ease-in-out infinite 1s" }} />

          {/* Rotating ring decoration */}
          <div className="rotate-slow absolute top-[10%] right-[5%] w-40 h-40 rounded-full border border-[#00a67e]/20 pointer-events-none hidden xl:block" />
          <div className="rotate-slow absolute bottom-[15%] left-[3%] w-24 h-24 rounded-full border border-white/10 pointer-events-none hidden xl:block" style={{ animationDirection: "reverse" }} />

          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-6xl px-6 text-center">
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 backdrop-blur-md text-white shadow-lg">
              <div className="w-2 h-2 rounded-full bg-[#00a67e] pulse-glow" />
              <Sparkles className="h-4 w-4 text-[#00a67e]" />
              <span className="text-sm font-bold tracking-wide">Assurance claire · Devis rapide · Support 24/7</span>
            </div>

            {/* Title */}
            <h1 className="hero-title mt-8 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
              BNA Assurances,
              <br />
              <span className="shimmer-text">votre partenaire</span>
            </h1>

            <p className="hero-sub mx-auto mt-6 max-w-2xl text-base text-white/80 sm:text-lg md:text-xl leading-relaxed">
              Protégez ce qui compte avec des couvertures adaptées et un accompagnement sécurisé à chaque étape de votre vie.
            </p>

            {/* CTA Buttons */}
            <div className="hero-btns mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/quotes"
                className="group inline-flex items-center justify-center rounded-full bg-[#00a67e] px-9 py-4 text-sm font-bold text-white shadow-xl shadow-[#00a67e]/40 transition-all duration-300 hover:-translate-y-1 hover:bg-[#008c6a] hover:shadow-2xl hover:shadow-[#00a67e]/50 sm:text-base"
              >
                Demander un devis gratuit
                <ArrowRight className="ml-2.5 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#services"
                className="group inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-9 py-4 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:border-white/60 hover:shadow-xl sm:text-base"
              >
                Découvrir nos services
                <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
              </a>
            </div>

            {/* Stats cards */}
            <div className="hero-cards mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, color: "#00a67e", title: "Couvertures fiables", desc: "Garanties claires et transparentes" },
                { icon: Clock, color: "#7dd3fc", title: "Réponse rapide", desc: "Devis en quelques minutes" },
                { icon: Users, color: "#00a67e", title: "Accompagnement client", desc: "Support et suivi disponible 24/7" }
              ].map((item, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-5 text-left hover:bg-white/15 hover:-translate-y-1 transition-all duration-300 cursor-default"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}25`, border: `1px solid ${item.color}40` }}>
                      <item.icon className="h-4 w-4" style={{ color: item.color }} />
                    </div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                  </div>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Scroll indicator */}
            <div className="bounce-arrow mt-16 flex flex-col items-center gap-2 opacity-60">
              <p className="text-xs text-white/60 font-medium uppercase tracking-widest">Découvrir</p>
              <ChevronDown className="h-5 w-5 text-white/60" />
            </div>
          </div>
        </section>

        {/* ─── Services ─── */}
        <ServicesSection />

        {/* ─── Stats Strip ─── */}
        <section className="bg-gradient-to-r from-[#0a1c2e] via-[#0f2744] to-[#153356] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                {[
                  { value: 30, suffix: "+", label: "Années d'expérience", icon: Award },
                  { value: 98, suffix: "%", label: "Clients satisfaits", icon: Star },
                  { value: 24, suffix: "/7", label: "Support disponible", icon: Clock },
                  { value: 15, suffix: "k+", label: "Contrats actifs", icon: TrendingUp }
                ].map((stat, i) => (
                  <div key={i} className="text-center group">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#00a67e]/20 border border-[#00a67e]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-5 h-5 text-[#00a67e]" />
                    </div>
                    <p className="text-3xl md:text-4xl font-extrabold text-white">
                      <CountUp target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-1 text-sm text-blue-200/70 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="relative bg-slate-50 py-20 md:py-28 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#00a67e]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#1a365d]/5 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#00a67e]/10 border border-[#00a67e]/20 px-4 py-2 text-sm font-bold text-[#00a67e] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Comment ça marche
                </span>
              </Reveal>
              <Reveal delayMs={80}>
                <h2 className="mt-5 text-3xl font-extrabold text-[#1a365d] md:text-4xl lg:text-5xl">
                  Un parcours simple,{" "}
                  <span className="text-[#00a67e]">en 3 étapes</span>
                </h2>
              </Reveal>
              <Reveal delayMs={160}>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
                  De la demande de devis à la couverture, tout est pensé pour aller vite et rester clair.
                </p>
              </Reveal>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Connecting line */}
              <div className="absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-[#00a67e]/30 via-[#00a67e]/50 to-[#00a67e]/30 hidden md:block" />

              {[
                {
                  step: "01",
                  icon: ShieldCheck,
                  title: "Choisissez",
                  desc: "Sélectionnez l'assurance qui correspond à votre besoin parmi nos offres.",
                  color: "#00a67e",
                  delay: 0
                },
                {
                  step: "02",
                  icon: Clock,
                  title: "Demandez un devis",
                  desc: "Complétez votre demande en ligne, en toute sécurité et sans engagement.",
                  color: "#1a365d",
                  delay: 100
                },
                {
                  step: "03",
                  icon: Sparkles,
                  title: "Démarrez",
                  desc: "Recevez votre estimation et activez votre couverture en quelques clics.",
                  color: "#00a67e",
                  delay: 200
                }
              ].map((item, i) => (
                <Reveal key={i} delayMs={item.delay}>
                  <div className="group relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    {/* Step number badge */}
                    <div className="absolute -top-4 left-8 px-3 py-1 rounded-full text-xs font-extrabold text-white shadow-lg" style={{ backgroundColor: item.color }}>
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}
                    >
                      <item.icon className="h-7 w-7" style={{ color: item.color }} />
                    </div>

                    <h3 className="text-xl font-extrabold text-[#1a365d] mb-3">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{item.desc}</p>

                    {/* Bottom accent */}
                    <div
                      className="absolute bottom-0 left-8 right-8 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Reveal delayMs={300}>
                <Link
                  to="/quotes"
                  className="group inline-flex items-center justify-center rounded-full bg-[#00a67e] px-9 py-4 font-bold text-white shadow-lg shadow-[#00a67e]/30 transition-all duration-300 hover:-translate-y-1 hover:bg-[#008c6a] hover:shadow-xl hover:shadow-[#00a67e]/40"
                >
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ─── Why choose us ─── */}
        <section className="bg-white py-20 md:py-28 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-2">

              {/* Left column */}
              <div>
                <Reveal>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#00a67e]/10 border border-[#00a67e]/20 px-4 py-2 text-sm font-bold text-[#00a67e] uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    Pourquoi nous choisir
                  </span>
                </Reveal>
                <Reveal delayMs={80}>
                  <h2 className="mt-5 text-3xl font-extrabold text-[#1a365d] md:text-4xl leading-tight">
                    La confiance,{" "}
                    <span className="text-[#00a67e]">c'est notre produit</span>
                  </h2>
                </Reveal>
                <Reveal delayMs={160}>
                  <p className="mt-4 text-lg text-slate-500 leading-relaxed">
                    Transparence, proximité et accompagnement — votre expérience doit être aussi simple que sécurisée.
                  </p>
                </Reveal>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: "Tarifs clairs et transparents",
                      desc: "Des garanties expliquées simplement, sans surprises ni frais cachés.",
                      icon: ShieldCheck,
                      idx: 0
                    },
                    {
                      title: "Support disponible 24/7",
                      desc: "Un interlocuteur disponible à toute heure pour vos questions et démarches.",
                      icon: Clock,
                      idx: 1
                    },
                    {
                      title: "Processus 100% digital",
                      desc: "Demande de devis fluide, suivi de dossier en temps réel depuis votre espace.",
                      icon: Sparkles,
                      idx: 2
                    }
                  ].map((f) => (
                    <Reveal key={f.title} delayMs={f.idx * 100}>
                      <div className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:border-[#00a67e]/40 hover:bg-[#f0fdf9] hover:shadow-md transition-all duration-300 cursor-default">
                        <div className="w-12 h-12 rounded-2xl bg-[#00a67e]/10 border border-[#00a67e]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-[#00a67e]/20 transition-all duration-300">
                          <f.icon className="h-5 w-5 text-[#00a67e]" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#1a365d]">{f.title}</h3>
                          <p className="mt-1 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <Reveal>
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1c2e] via-[#0f2744] to-[#153356] p-8 text-white shadow-2xl">
                    {/* Glow orb */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#00a67e]/15 blur-3xl pointer-events-none" />

                    <div className="relative flex items-center justify-between mb-8">
                      <div>
                        <p className="text-sm font-bold text-[#00a67e] uppercase tracking-wider">BNA Performance</p>
                        <h3 className="mt-2 text-2xl font-extrabold">Des résultats concrets</h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-[#00a67e]/20 border border-[#00a67e]/30 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-[#00a67e]" />
                      </div>
                    </div>

                    <div className="relative grid gap-4 sm:grid-cols-3">
                      {[
                        { value: 30, suffix: "+", label: "Années" },
                        { value: 98, suffix: "%", label: "Satisfaction" },
                        { value: 15, suffix: "k+", label: "Clients" }
                      ].map((s) => (
                        <div key={s.label} className="rounded-2xl bg-white/10 border border-white/15 p-4 hover:bg-white/15 transition-colors">
                          <p className="text-2xl font-extrabold">
                            <CountUp target={s.value} suffix={s.suffix} />
                          </p>
                          <p className="mt-1 text-sm text-white/70">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>

                {/* Testimonial */}
                <Reveal delayMs={120}>
                  <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm italic">
                      &ldquo;J'ai reçu mon devis rapidement et j'ai eu un accompagnement clair. Le processus est vraiment fluide et la plateforme très intuitive.&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00a67e] to-[#008c6a] flex items-center justify-center shadow-md">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a365d] text-sm">Client BNA</p>
                        <p className="text-xs text-slate-400">Espace client vérifié</p>
                      </div>
                      <div className="ml-auto">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#00a67e] bg-[#00a67e]/10 rounded-full px-3 py-1">
                          <ShieldCheck className="w-3 h-3" />
                          Vérifié
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA Banner ─── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#00a67e] via-[#00b98b] to-[#008c6a] py-20">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }} />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <Reveal>
              <Sparkles className="mx-auto mb-4 h-10 w-10 text-white/80" />
              <h2 className="text-3xl font-extrabold text-white md:text-4xl lg:text-5xl">
                Prêt à vous protéger ?
              </h2>
              <p className="mt-4 text-lg text-white/85 max-w-xl mx-auto">
                Obtenez votre devis personnalisé en quelques minutes. Sans engagement, sans frais cachés.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/quotes"
                  className="group inline-flex items-center justify-center rounded-full bg-white text-[#00a67e] font-bold px-9 py-4 text-sm shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                >
                  Obtenir un devis gratuit
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border-2 border-white/60 text-white font-bold px-9 py-4 text-sm hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                >
                  Nous contacter
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}
