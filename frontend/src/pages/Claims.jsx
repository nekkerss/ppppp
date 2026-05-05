import { useContext, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, getStatusBadgeColor, truncateText } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";

export default function Claims() {
  const { user } = useContext(AuthContext);
  const canManage = ["admin", "gestionnaire"].includes(user?.role);
  const canSubmit = user?.role !== "gestionnaire";
  const [claims, setClaims] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUser, setFilterUser] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    contractId: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [claimsRes, contractsRes] = await Promise.all([
        API.get("/claims"),
        API.get("/contracts")
      ]);
      setClaims(claimsRes.data || []);
      setContracts(contractsRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    try {
      if (!formData.contractId || !formData.description) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
      }
      await API.post("/claims", formData);
      alert("Réclamation soumise avec succès!");
      setFormData({
        description: "",
        contractId: "",
        date: new Date().toISOString().split("T")[0]
      });
      setShowSubmitModal(false);
      await fetchData();
    } catch (error) {
      alert("Erreur lors de la soumission: " + error.response?.data?.message);
    }
  };

  const handleStatusUpdate = async (claimId, status) => {
    try {
      const res = await API.patch(`/claims/${claimId}/status`, { status });
      setClaims((prev) => prev.map((c) => (c._id === claimId ? res.data : c)));
      if (selectedClaim?._id === claimId) {
        setSelectedClaim(res.data);
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut: " + error.response?.data?.message);
    }
  };

  const handleDeleteClaim = async (claimId) => {
    if (!window.confirm("Supprimer cette réclamation ?")) return;
    try {
      await API.delete(`/claims/${claimId}`);
      setClaims((prev) => prev.filter((c) => c._id !== claimId));
      if (selectedClaim?._id === claimId) {
        setSelectedClaim(null);
        setShowDetailModal(false);
      }
    } catch (error) {
      alert("Erreur lors de la suppression: " + error.response?.data?.message);
    }
  };

  const reclamationsOnly = claims.filter((claim) => !claim.sinistreType);
  const uniqueUsers = [...new Map(
    reclamationsOnly
      .filter((c) => c.userId && typeof c.userId === "object")
      .map((c) => [c.userId._id, c.userId])
  ).values()];

  const filteredClaims = reclamationsOnly.filter(claim => {
    const matchesSearch = claim.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim._id.toString().includes(searchTerm);
    const matchesFilter = filterStatus === "all" || claim.status === filterStatus;
    const claimUserId = typeof claim.userId === "object" ? claim.userId._id : claim.userId;
    const matchesUser = filterUser === "all" || claimUserId === filterUser;
    return matchesSearch && matchesFilter && matchesUser;
  });

  const getClaimProgressStatus = (status) => {
    const steps = ["en attente", "accepté", "refusé"];
    return {
      current: steps.indexOf(status),
      total: 3
    };
  };

  const canRemoveAsUser = (claim) => {
    if (canManage) return false;
    const claimUserId = typeof claim.userId === "object" ? claim.userId?._id : claim.userId;
    return claimUserId === user?._id && claim.status === "en attente";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-slate-400">Chargement des réclamations...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Mes Réclamations</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Gérez vos réclamations d'assurance</p>
          </div>
          {canSubmit && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
            >
              + Nouvelle réclamation
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Rechercher par description ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-700 dark:text-slate-100"
              >
                <option value="all">Tous les statuts</option>
                <option value="en attente">En attente</option>
                <option value="accepté">Accepté</option>
                <option value="refusé">Refusé</option>
              </select>
            </div>
            {["admin", "gestionnaire"].includes(user?.role) && (
              <div>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-slate-700 dark:text-slate-100"
                >
                  <option value="all">Tous les utilisateurs</option>
                  {uniqueUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {filteredClaims.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Aucune réclamation trouvée</p>
            </div>
          ) : (
            filteredClaims.map(claim => (
              <div
                key={claim._id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-red-500 hover:shadow-lg cursor-pointer transition-all"
                onClick={() => {
                  setSelectedClaim(claim);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">Réclamation #{claim._id.slice(-6)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(claim.status)}`}>
                        {claim.status === "en attente" ? "En attente" :
                         claim.status === "accepté" ? "Acceptée" : "Refusée"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {truncateText(claim.description, 80)}
                    </p>
                    {canManage && claim.userId && typeof claim.userId === "object" && (
                      <p className="text-xs text-[#1a365d] mb-1">
                        Utilisateur: {claim.userId.name} ({claim.userId.email})
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Soumise le {formatDate(claim.date)}
                    </p>
                    {canManage && (
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={claim.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(claim._id, e.target.value);
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="en attente">En attente</option>
                          <option value="accepté">Accepté</option>
                          <option value="refusé">Refusé</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClaim(claim._id);
                          }}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {canRemoveAsUser(claim) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClaim(claim._id);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                        title="Supprimer cette réclamation"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                    <div className="text-3xl">🚨</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Détails de la réclamation</h2>

              {/* Status Timeline */}
              <div className="flex items-center gap-2 mb-6">
                {["en attente", "accepté", "refusé"].map((step, idx) => (
                  <div key={step} className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold
                      ${step === selectedClaim.status ? "bg-blue-600 text-white" : 
                        (["en attente", "accepté", "refusé"].indexOf(selectedClaim.status) > idx ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600")}
                    `}>
                      {step === "en attente" ? "1" : step === "accepté" ? "2" : "3"}
                    </div>
                    {idx < 2 && <div className="w-8 h-1 bg-gray-300 mx-1"></div>}
                  </div>
                ))}
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">ID de la réclamation</p>
                  <p className="font-semibold text-gray-900">{selectedClaim._id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="font-semibold text-gray-900">{selectedClaim.description}</p>
                </div>
                {canManage && selectedClaim.userId && typeof selectedClaim.userId === "object" && (
                  <div>
                    <p className="text-gray-600 text-sm">Utilisateur</p>
                    <p className="font-semibold text-gray-900">
                      {selectedClaim.userId.name} ({selectedClaim.userId.email})
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 text-sm">Statut</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedClaim.status)}`}>
                    {selectedClaim.status === "en attente" ? "En attente" :
                     selectedClaim.status === "accepté" ? "Acceptée" : "Refusée"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date de soumission</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedClaim.date)}</p>
                </div>
              </div>

              {canManage && (
                <div className="flex gap-2">
                  <select
                    value={selectedClaim.status}
                    onChange={(e) => handleStatusUpdate(selectedClaim._id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="en attente">En attente</option>
                    <option value="accepté">Accepté</option>
                    <option value="refusé">Refusé</option>
                  </select>
                  <button
                    onClick={() => handleDeleteClaim(selectedClaim._id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Supprimer
                  </button>
                </div>
              )}

              {!canManage && canRemoveAsUser(selectedClaim) && (
                <button
                  onClick={() => handleDeleteClaim(selectedClaim._id)}
                  className="w-full bg-red-100 text-red-700 rounded-lg hover:bg-red-200 px-4 py-2"
                >
                  Supprimer la réclamation
                </button>
              )}

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedClaim(null);
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Submit Modal */}
        {canSubmit && showSubmitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Soumettre une nouvelle réclamation</h2>

              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Sélectionnez un contrat *
                  </label>
                  <select
                    required
                    value={formData.contractId}
                    onChange={(e) => setFormData({...formData, contractId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- Choisir un contrat --</option>
                    {contracts.filter(c => c.status === "actif").map(contract => (
                      <option key={contract._id} value={contract._id}>
                        {contract.type} - Actif jusqu'au {formatDate(contract.endDate)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Date de la réclamation
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description de la réclamation *
                  </label>
                  <textarea
                    required
                    placeholder="Décrivez les détails de votre réclamation..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows="5"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Soumettre la réclamation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
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