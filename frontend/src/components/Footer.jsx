import { Link } from "react-router-dom"
import { Phone, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#1a365d] text-white scroll-mt-24 md:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src="/images/logo.png"
              alt="BNA Assurances"
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-white/80 text-sm leading-relaxed mt-4">
              BNA Assurances, votre partenaire de confiance depuis plus de 30 ans. 
              Nous vous accompagnons dans la protection de votre avenir.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Liens Rapides</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors text-sm">
                  Nos Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/80 hover:text-white transition-colors text-sm">
                  Espace Client
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-white/80 hover:text-white transition-colors text-sm">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Nos Assurances</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/services/auto" className="text-white/80 hover:text-white transition-colors text-sm">
                  Assurance Auto
                </Link>
              </li>
              <li>
                <Link to="/services/home" className="text-white/80 hover:text-white transition-colors text-sm">
                  Assurance Habitation
                </Link>
              </li>
              <li>
                <Link to="/services/health" className="text-white/80 hover:text-white transition-colors text-sm">
                  Assurance Santé
                </Link>
              </li>
              <li>
                <a href="#" className="text-white/80 hover:text-white transition-colors text-sm">
                  Assurance Entreprise
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#00a67e] shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm">
                  rue de la fleur d'érable cité les pins, Tunis 1053<br />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#00a67e] shrink-0" />
                <a href="tel:+21321000000" className="text-white/80 hover:text-white transition-colors text-sm">
                  70 026 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#00a67e] shrink-0" />
                <a href="mailto:contact@bna-assurances.dz" className="text-white/80 hover:text-white transition-colors text-sm">
                  contact@bna-assurances.dz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} BNA Assurances. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                Mentions légales
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}