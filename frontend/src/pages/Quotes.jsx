import { useEffect, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, formatCurrency } from "../utils/helpers";

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Quote Request Form
  const [formData, setFormData] = useState({
    type: "auto",
    age: ""
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await API.get("/quotes");
      setQuotes(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      setLoading(false);
    }
  };

  const handleRequestQuote = async (e) => {
    e.preventDefault();
    try {
      if (!formData.type) {
        alert("Veuillez sélectionner un type d'assurance");
        return;
      }
      if (formData.type === "auto" && !formData.age) {
        alert("Veuillez entrer votre âge");
        return;
      }

      const requestData = {
        type: formData.type,
        parametres: formData.type === "auto" ? { age: Number(formData.age) } : {}
      };

      const res = await API.post("/quotes", requestData);
      setQuotes([...quotes, res.data]);
      alert("Devis généré avec succès!");
      setFormData({ type: "auto", age: "" });
      setShowRequestModal(false);
    } catch (error) {
      alert("Erreur lors de la génération du devis: " + error.response?.data?.message);
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote._id.toString().includes(searchTerm);
    return matchesSearch;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des devis...</p>
          </div>
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
            <p className="text-gray-600 mt-1">Consultez et demandez vos devis</p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            + Demander un devis
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <input
            type="text"
            placeholder="Rechercher par type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Aucun devis trouvé. Commencez par en demander un!</p>
            </div>
          ) : (
            filteredQuotes.map(quote => (
              <div
                key={quote._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-all border-t-4 border-t-green-600"
                onClick={() => {
                  setSelectedQuote(quote);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold uppercase">
                      {quote.type === "auto" ? "Assurance Auto" : "Assurance Santé"}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatCurrency(quote.prix)}
                    </p>
                  </div>
                  <span className="text-3xl">💰</span>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  {quote.parametres && quote.parametres.age && (
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">Âge:</span> {quote.parametres.age} ans
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Généré:</span> {formatDate(quote.createdAt)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQuote(quote);
                    setShowDetailModal(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Voir les détails
                </button>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Détails du devis</h2>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">Type d'assurance</p>
                  <p className="font-semibold text-gray-900">
                    {selectedQuote.type === "auto" ? "Assurance Automobile" : "Assurance Santé"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Prime annuelle</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(selectedQuote.prix)}
                  </p>
                </div>
                {selectedQuote.parametres && selectedQuote.parametres.age && (
                  <div>
                    <p className="text-gray-600 text-sm">Âge</p>
                    <p className="font-semibold text-gray-900">{selectedQuote.parametres.age} ans</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 text-sm">Date de génération</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedQuote.createdAt)}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  ℹ️ Ce devis est valide pour 30 jours. Vous pouvez l'accepter ou en demander un nouveau.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    alert("La souscription en ligne sera disponible très prochainement!");
                    setShowDetailModal(false);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  ✓ Accepter
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedQuote(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Request Quote Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Demander un devis</h2>

              <form onSubmit={handleRequestQuote} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Type d'assurance *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="auto">Assurance Automobile</option>
                    <option value="sante">Assurance Santé</option>
                  </select>
                </div>

                {formData.type === "auto" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Votre âge *
                    </label>
                    <input
                      type="number"
                      required
                      min="18"
                      max="120"
                      placeholder="Entrez votre âge"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    📝 Votre devis sera généré instantanément. Vous pourrez l'accepter ou en demander un nouveau.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Générer le devis
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}