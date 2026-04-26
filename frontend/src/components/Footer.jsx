import { Link } from "react-router-dom"
import { Phone, Mail, MapPin, ShieldCheck, ArrowRight } from "lucide-react"

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-gradient-to-b from-[#0a1c2e] to-[#0f2744] text-white scroll-mt-24">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#00a67e]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#153356]/80 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
        backgroundSize: "32px 32px"
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Top CTA strip */}
        <div className="mb-14 rounded-3xl border border-[#00a67e]/20 bg-gradient-to-r from-[#00a67e]/10 via-[#00a67e]/5 to-transparent p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00a67e]/20 border border-[#00a67e]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#00a67e]" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">Prêt à vous protéger ?</p>
              <p className="text-sm text-blue-200/70">Obtenez votre devis gratuit en quelques minutes.</p>
            </div>
          </div>
          <Link
            to="/quotes"
            className="group inline-flex items-center gap-2 rounded-full bg-[#00a67e] hover:bg-[#008c6a] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#00a67e]/30 hover:-translate-y-0.5 transition-all duration-300 shrink-0"
          >
            Demander un devis
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 group w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00a67e]/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/images/logo.jpg" alt="BNA" className="relative h-12 w-12 object-contain bg-white rounded-xl p-1.5 shadow-lg" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">BNA</p>
                <p className="text-xs font-semibold text-[#00a67e] uppercase tracking-widest">Assurances</p>
              </div>
            </Link>
            <p className="text-blue-200/70 text-sm leading-relaxed">
              Votre partenaire de confiance depuis plus de 30 ans. Nous vous accompagnons dans la protection de votre avenir.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00a67e] animate-pulse" />
              <p className="text-xs text-blue-200/50 font-medium">Service disponible 24/7</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-blue-200/60 mb-5">Liens Rapides</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/", label: "Nos Services" },
                { to: "/about", label: "À Propos" },
                { to: "/actualites", label: "Actualités" },
                { to: "/contact", label: "Contact" },
                { to: "/login", label: "Espace Client" },
                { to: "/register", label: "Créer un compte" }
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-2 text-sm text-blue-100/70 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#00a67e]/60 group-hover:bg-[#00a67e] group-hover:scale-150 transition-all" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-blue-200/60 mb-5">Nos Assurances</h3>
            <ul className="space-y-2.5">
              {[
                { to: "/services/auto",   label: "Assurance Auto" },
                { to: "/services/home",   label: "Assurance Habitation" },
                { to: "/services/health", label: "Assurance Santé" },
                { to: "/services/travel", label: "Assurance Voyage" },
                { to: "/services/life",   label: "Assurance Vie" }
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-2 text-sm text-blue-100/70 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#00a67e]/60 group-hover:bg-[#00a67e] group-hover:scale-150 transition-all" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-blue-200/60 mb-5">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00a67e]/15 border border-[#00a67e]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-[#00a67e]" />
                </div>
                <span className="text-blue-100/70 text-sm leading-relaxed">
                  rue de la fleur d'érable cité les pins, Tunis 1053
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00a67e]/15 border border-[#00a67e]/20 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-[#00a67e]" />
                </div>
                <a href="tel:+21370026000" className="text-blue-100/70 hover:text-white transition-colors text-sm">
                  70 026 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00a67e]/15 border border-[#00a67e]/20 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#00a67e]" />
                </div>
                <a href="mailto:contact@bna-assurances.dz" className="text-blue-100/70 hover:text-white transition-colors text-sm">
                  contact@bna-assurances.dz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-blue-200/50 text-xs">
              © {new Date().getFullYear()} BNA Assurances. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              {[
                { href: "#", label: "Mentions légales" },
                { href: "#", label: "Politique de confidentialité" },
                { href: "#", label: "Cookies" }
              ].map((item) => (
                <a key={item.label} href={item.href} className="text-blue-200/50 hover:text-white transition-colors text-xs">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
