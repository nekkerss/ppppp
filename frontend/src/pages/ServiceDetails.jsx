import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { servicesData } from "../data/servicesData";

export default function ServiceDetails() {
  const { type } = useParams();
  const service = servicesData[type];

  if (!service) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-20 md:pt-24">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#153356] to-[#1a3a5c] text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour a l'accueil
            </Link>
            <h1 className="mt-6 text-4xl md:text-5xl font-bold max-w-3xl">{service.title}</h1>
            <p className="mt-4 text-blue-100/90 text-lg max-w-3xl">{service.shortDescription}</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-5">
              <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d]">Protection sur mesure</h2>
              <p className="text-slate-600 leading-relaxed">{service.fullDescription}</p>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-semibold text-[#1a365d] mb-3">Vos benefices</h3>
                <ul className="space-y-3">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-[#00a67e] mt-0.5 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/quotes"
                className="inline-flex items-center justify-center rounded-xl bg-[#00a67e] hover:bg-[#008c6a] text-white font-semibold px-6 py-3 transition-all hover:-translate-y-0.5"
              >
                Request quotation
              </Link>
            </div>
            <div className="space-y-6">
              <img
                src={service.image}
                alt={service.label}
                className="w-full h-[340px] md:h-[420px] object-cover rounded-2xl shadow-xl"
              />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Service</p>
                  <p className="mt-2 font-semibold text-[#1a365d]">{service.label}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Disponibilite</p>
                  <p className="mt-2 font-semibold text-[#1a365d]">Accompagnement 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
