import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MapComponent, { AGENCY_LOCATIONS } from "../components/MapComponent";
import { MapPin, Phone, Clock, Mail, ChevronRight, Building2 } from "lucide-react";

export default function Contact() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="pt-20 md:pt-24">

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0f2744] via-[#153356] to-[#1a3a5c] text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#00a67e]/20 border border-[#00a67e]/30 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#00a67e]" />
              </div>
              <span className="text-xs font-bold text-[#00a67e] uppercase tracking-widest">Nos agences</span>
            </div>
            <h1 className="text-4xl font-bold md:text-5xl">Trouvez votre agence</h1>
            <p className="mt-4 max-w-2xl text-blue-100/80 text-lg">
              {AGENCY_LOCATIONS.length} agences BNA Assurances à travers toute la Tunisie — cliquez sur une agence pour afficher ses détails.
            </p>
          </div>
        </section>

        {/* Map + list */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Left: scrollable location list */}
            <div className="lg:col-span-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1 mb-3">
                {AGENCY_LOCATIONS.length} agences disponibles
              </p>

              <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin">
                {AGENCY_LOCATIONS.map((agency) => {
                  const isSelected = selectedId === agency.id;
                  return (
                    <button
                      key={agency.id}
                      onClick={() => setSelectedId(isSelected ? null : agency.id)}
                      className={`w-full text-left rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? "border-[#00a67e] bg-[#effaf5] dark:bg-[#00a67e]/10 shadow-md shadow-[#00a67e]/10"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#00a67e]/40 hover:shadow-sm"
                      }`}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2 p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "bg-[#00a67e]" : "bg-slate-100 dark:bg-slate-700"
                          }`}>
                            <MapPin className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1a365d] dark:text-white leading-tight">{agency.city}</p>
                            {agency.main
                              ? <span className="text-[10px] font-bold text-[#00a67e] uppercase tracking-wide">Siège social</span>
                              : <span className="text-[10px] text-slate-400 dark:text-slate-500">{agency.name}</span>
                            }
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-transform duration-200 ${
                          isSelected ? "rotate-90 text-[#00a67e]" : "text-slate-300 dark:text-slate-600"
                        }`} />
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 px-4 pb-3 -mt-2 ml-12">
                        {agency.address}
                      </p>

                      {/* Expanded details */}
                      {isSelected && (
                        <div className="mx-4 mb-4 ml-[calc(1rem+2.25rem+0.75rem)] space-y-2 border-t border-[#00a67e]/20 pt-3">
                          <a
                            href={`tel:${agency.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-[#00a67e] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#00a67e] shrink-0" />
                            {agency.phone}
                          </a>
                          <a
                            href={`mailto:${agency.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 hover:text-[#00a67e] transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#00a67e] shrink-0" />
                            {agency.email}
                          </a>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-[#00a67e] shrink-0" />
                            {agency.hours}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: map */}
            <div className="lg:col-span-2 lg:sticky lg:top-28">
              <MapComponent focusedId={selectedId} onSelect={setSelectedId} />
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
