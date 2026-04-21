import { Link } from "react-router-dom"
import { Shield, Users, Clock, Award } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-[#00a67e]/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-[#1a365d]/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00a67e]/10 text-[#00a67e] mb-8">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Votre protection, notre priorité</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a365d] leading-tight mb-6">
            Protégez ce qui compte{" "}
            <span className="text-[#00a67e]">le plus</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            BNA Assurances vous accompagne avec des solutions personnalisées pour sécuriser votre avenir, 
            votre famille et votre patrimoine.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              to="/register"
              className="w-full sm:w-auto bg-[#1a365d] hover:bg-[#1a365d]/90 text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors"
            >
              Demander un devis gratuit
            </Link>
            <a 
              href="#services"
              className="w-full sm:w-auto border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white px-8 py-4 text-lg font-medium rounded-lg transition-colors text-center"
            >
              Découvrir nos services
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-[#00a67e]/10 flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-[#00a67e]" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-[#1a365d]">50K+</span>
              <span className="text-sm text-gray-600">Clients satisfaits</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-[#00a67e]/10 flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-[#00a67e]" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-[#1a365d]">30+</span>
              <span className="text-sm text-gray-600">Années d'expérience</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-[#00a67e]/10 flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-[#00a67e]" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-[#1a365d]">24/7</span>
              <span className="text-sm text-gray-600">Support disponible</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-full bg-[#00a67e]/10 flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-[#00a67e]" />
              </div>
              <span className="text-2xl md:text-3xl font-bold text-[#1a365d]">98%</span>
              <span className="text-sm text-gray-600">Taux de satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}