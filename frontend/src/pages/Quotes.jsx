import { useEffect, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, formatCurrency } from "../utils/helpers";
import { Sparkles, Car, Heart, Home, Plane, Shield, X, Loader2 } from "lucide-react";

const TYPES = [
  { value: "auto",       label: "Assurance Auto",       icon: Car,    color: "blue" },
  { value: "sante",      label: "Assurance Santé",       icon: Heart,  color: "rose" },
  { value: "habitation", label: "Assurance Habitation",  icon: Home,   color: "amber" },
  { value: "voyage",     label: "Assurance Voyage",      icon: Plane,  color: "sky" },
  { value: "vie",        label: "Assurance Vie",         icon: Shield, color: "emerald" },
];

const TYPE_FIELDS = {
  auto: [
    { name: "age",          label: "Votre âge",            type: "number", min: 18, max: 80,   placeholder: "Ex: 35" },
    { name: "marque",       label: "Marque du véhicule",   type: "text",                        placeholder: "Ex: Toyota" },
    { name: "anneeVehicule",label: "Année du véhicule",    type: "number", min: 1990, max: 2025,placeholder: "Ex: 2019" },
    { name: "ville",        label: "Ville",                type: "text",                        placeholder: "Ex: Alger" },
  ],
  sante: [
    { name: "age",            label: "Votre âge",                   type: "number", min: 1, max: 100, placeholder: "Ex: 40" },
    { name: "nombrePersonnes",label: "Nombre de personnes à assurer",type: "number", min: 1, max: 10,  placeholder: "Ex: 3" },
    { name: "couverture",     label: "Niveau de couverture",        type: "select",
      options: ["Basique","Confort","Premium"] },
  ],
  habitation: [
    { name: "superficie",  label: "Superficie (m²)",      type: "number", min: 20,            placeholder: "Ex: 90" },
    { name: "ville",       label: "Ville",                type: "text",                        placeholder: "Ex: Oran" },
    { name: "typeLogement",label: "Type de logement",     type: "select",
      options: ["Appartement","Villa","Maison individuelle"] },
  ],
  voyage: [
    { name: "destination",      label: "Destination",          type: "text",                       placeholder: "Ex: France" },
    { name: "duree",            label: "Durée du séjour (jours)",type: "number", min: 1, max: 365, placeholder: "Ex: 14" },
    { name: "nombreVoyageurs",  label: "Nombre de voyageurs",  type: "number", min: 1, max: 10,   placeholder: "Ex: 2" },
  ],
  vie: [
    { name: "age",            label: "Votre âge",              type: "number", min: 18, max: 70, placeholder: "Ex: 45" },
    { name: "montantSouhaite",label: "Capital souhaité (TND)", type: "number", min: 10000,        placeholder: "Ex: 100000" },
  ],
};

const TYPE_ICONS = Object.fromEntries(TYPES.map((t) => [t.value, t.icon]));
const TYPE_COLORS = {
  auto:       "border-t-blue-500",
  sante:      "border-t-rose-500",
  habitation: "border-t-amber-500",
  voyage:     "border-t-sky-500",
  vie:        "border-t-emerald-500",
};

export default function Quotes() {
  const [quotes, setQuotes]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [generating, setGenerating]       = useState(false);
  const [showDetailModal, setShowDetailModal]   = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm]       = useState("");
  const [formType, setFormType]           = useState("auto");
  const [formFields, setFormFields]       = useState({});

  useEffect(() => { fetchQuotes(); }, []);
  useEffect(() => { setFormFields({}); }, [formType]);

  const fetchQuotes = async () => {
    try {
      const res = await API.get("/quotes");
      setQuotes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await API.post("/quotes", { type: formType, parametres: formFields });
      setQuotes((prev) => [res.data, ...prev]);
      setShowRequestModal(false);
      setFormFields({});
      setFormType("auto");
      // Open the new quote detail immediately
      setSelectedQuote(res.data);
      setShowDetailModal(true);
    } catch (err) {
      alert("Erreur: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const filteredQuotes = quotes.filter((q) =>
    q.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q._id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Devis d'Assurance</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00a67e]" />
              Tarification intelligente par IA
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 bg-[#00a67e] hover:bg-[#008c6a] text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-[#00a67e]/20"
          >
            <Sparkles className="w-4 h-4" />
            Demander un devis
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <input
            type="text"
            placeholder="Rechercher par type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a67e]/40"
          />
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuotes.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-gray-100 p-10 text-center">
              <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun devis. Commencez par en demander un !</p>
            </div>
          ) : (
            filteredQuotes.map((quote) => {
              const Icon = TYPE_ICONS[quote.type] || Shield;
              return (
                <div
                  key={quote._id}
                  onClick={() => { setSelectedQuote(quote); setShowDetailModal(true); }}
                  className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${TYPE_COLORS[quote.type] || "border-t-gray-400"} p-5 cursor-pointer hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {TYPES.find((t) => t.value === quote.type)?.label || quote.type}
                      </p>
                    </div>
                    <span className="text-xs bg-[#effaf5] text-[#00a67e] border border-[#00a67e]/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> IA
                    </span>
                  </div>

                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {formatCurrency(quote.prix)}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">Prime annuelle estimée</p>

                  {quote.explication && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3 italic">
                      "{quote.explication}"
                    </p>
                  )}

                  <p className="text-xs text-gray-400">Généré le {formatDate(quote.createdAt)}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── DETAIL MODAL ─────────────────────────────────────────────── */}
      {showDetailModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Détails du devis</h2>
              <button onClick={() => setShowDetailModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-gray-500">Type d'assurance</p>
                <p className="font-semibold text-gray-900">
                  {TYPES.find((t) => t.value === selectedQuote.type)?.label || selectedQuote.type}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Prime annuelle</p>
                <p className="text-3xl font-black text-[#00a67e]">{formatCurrency(selectedQuote.prix)}</p>
              </div>
              {selectedQuote.parametres && Object.keys(selectedQuote.parametres).length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedQuote.parametres).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-gray-500 capitalize">{k}</p>
                      <p className="text-sm font-semibold text-gray-700">{v}</p>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Généré le</p>
                <p className="text-sm font-semibold text-gray-700">{formatDate(selectedQuote.createdAt)}</p>
              </div>
            </div>

            {selectedQuote.explication && (
              <div className="flex gap-3 bg-[#effaf5] border border-[#00a67e]/20 rounded-xl p-4">
                <Sparkles className="w-4 h-4 text-[#00a67e] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#00a67e] mb-1">Analyse IA</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedQuote.explication}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
              Ce devis est valide 30 jours. Vous pouvez l'accepter ou en demander un nouveau.
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── REQUEST MODAL ────────────────────────────────────────────── */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Demander un devis</h2>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-[#00a67e]" /> Tarification par intelligence artificielle
                </p>
              </div>
              <button onClick={() => setShowRequestModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'assurance</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFormType(t.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        formType === t.value
                          ? "border-[#00a67e] bg-[#effaf5] text-[#00a67e]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {t.label.replace("Assurance ", "")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic fields */}
            <form onSubmit={handleRequestQuote} className="space-y-4">
              {(TYPE_FIELDS[formType] || []).map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      required
                      value={formFields[field.name] || ""}
                      onChange={(e) => setFormFields((p) => ({ ...p, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]/40"
                    >
                      <option value="">Sélectionner...</option>
                      {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      required
                      min={field.min}
                      max={field.max}
                      placeholder={field.placeholder}
                      value={formFields[field.name] || ""}
                      onChange={(e) => setFormFields((p) => ({ ...p, [field.name]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]/40"
                    />
                  )}
                </div>
              ))}

              {generating && (
                <div className="flex items-center gap-3 bg-[#effaf5] rounded-xl p-3 text-sm text-[#00a67e]">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  L'IA calcule votre tarif personnalisé...
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00a67e] hover:bg-[#008c6a] text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Calcul en cours..." : "Générer le devis"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
