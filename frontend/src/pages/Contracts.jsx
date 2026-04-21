import { useEffect, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, getStatusBadgeColor, expiresSoon, getContractStatus } from "../utils/helpers";

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [creatingContract, setCreatingContract] = useState(false);
  const [createForm, setCreateForm] = useState({
    address: "",
    age: "",
    type: "auto",
    contactNumber: "",
    durationMonths: "12",
    contractNumber: ""
  });

  const contractTypes = [
    { value: "auto", label: "Assurance Auto" },
    { value: "home", label: "Assurance Habitation" },
    { value: "health", label: "Assurance Sante" },
    { value: "travel", label: "Assurance Voyage" },
    { value: "life", label: "Assurance Vie" }
  ];

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    if (!showCreateModal) return;
    setCreateForm((prev) => ({
      ...prev,
      contractNumber: prev.contractNumber || generateContractNumber()
    }));
  }, [showCreateModal]);

  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    return `CTR-${year}-${randomPart}`;
  };

  const computeEndDate = (startDate, durationMonths) => {
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + Number(durationMonths || 0));
    return end.toISOString().split("T")[0];
  };

  const fetchContracts = async () => {
    try {
      const res = await API.get("/contracts");
      setContracts(res.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    try {
      if (selectedContract) {
        await API.post(`/contracts/${selectedContract._id}/renew`);
        await fetchContracts();
        alert("Contrat renouvelé avec succès!");
        setShowRenewModal(false);
        setShowDetailModal(false);
        setSelectedContract(null);
      }
    } catch (error) {
      alert("Erreur lors du renouvellement: " + error.response?.data?.message);
    }
  };

  const handleCancel = async () => {
    try {
      if (selectedContract) {
        await API.post(`/contracts/${selectedContract._id}/cancel`, { reason: cancelReason });
        await fetchContracts();
        alert("Contrat annulé avec succès!");
        setShowCancelModal(false);
        setShowDetailModal(false);
        setSelectedContract(null);
        setCancelReason("");
      }
    } catch (error) {
      alert("Erreur lors de l'annulation: " + error.response?.data?.message);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      if (!createForm.address || !createForm.age || !createForm.type || !createForm.contactNumber || !createForm.durationMonths) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
      }

      setCreatingContract(true);
      const startDate = new Date().toISOString().split("T")[0];
      const endDate = computeEndDate(startDate, createForm.durationMonths);

      await API.post("/contracts", {
        type: createForm.type,
        startDate,
        endDate,
        contractNumber: createForm.contractNumber || undefined,
        address: createForm.address,
        age: Number(createForm.age),
        contactNumber: createForm.contactNumber,
        durationMonths: Number(createForm.durationMonths)
      });

      await fetchContracts();
      alert("Contrat créé avec succès!");
      setShowCreateModal(false);
      setCreateForm({
        address: "",
        age: "",
        type: "auto",
        contactNumber: "",
        durationMonths: "12",
        contractNumber: ""
      });
    } catch (error) {
      alert("Erreur lors de la création du contrat: " + error.response?.data?.message);
    } finally {
      setCreatingContract(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract._id.toString().includes(searchTerm) ||
                         (contract.contractNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des contrats...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Mes Contrats</h1>
            <p className="text-gray-600 mt-1">Gérez vos contrats d'assurance</p>
          </div>
          <button
            onClick={() => {
              setCreateForm((prev) => ({
                ...prev,
                contractNumber: generateContractNumber()
              }));
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            + Nouveau contrat
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Rechercher par type ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Tous les statuts</option>
                <option value="en attente">En attente</option>
                <option value="actif">Actif</option>
                <option value="expiré">Expiré</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-4">
          {filteredContracts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Aucun contrat found</p>
            </div>
          ) : (
            filteredContracts.map(contract => (
              <div
                key={contract._id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all hover:shadow-lg cursor-pointer
                  ${contract.status === "expiré" ? "border-l-red-500 opacity-70" : "border-l-green-500"}
                  ${expiresSoon(contract.endDate) ? "bg-yellow-50" : ""}
                `}
                onClick={() => {
                  setSelectedContract(contract);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">Contrat {contract.type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(contract.status)}`}>
                        {getContractStatus(contract.status, contract.endDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Numéro: {contract.contractNumber || `CTR-${String(contract._id).slice(-6).toUpperCase()}`}</p>
                    <p className="text-sm text-gray-600 mb-3">ID: {contract._id}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Date de début</p>
                        <p className="font-semibold text-gray-900">{formatDate(contract.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date d'expiration</p>
                        <p className="font-semibold text-gray-900">{formatDate(contract.endDate)}</p>
                      </div>
                    </div>
                    {expiresSoon(contract.endDate) && contract.status === "actif" && (
                      <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                        ⚠️ Ce contrat expire bientôt. Veuillez le renouveler.
                      </div>
                    )}
                  </div>
                  <div className="text-3xl">📄</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Détails du contrat</h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Type de contrat</p>
                  <p className="font-semibold text-gray-900">{selectedContract.type}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Numéro du contrat</p>
                  <p className="font-semibold text-gray-900">{selectedContract.contractNumber || `CTR-${String(selectedContract._id).slice(-6).toUpperCase()}`}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ID du contrat</p>
                  <p className="font-semibold text-gray-900">{selectedContract._id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Statut</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedContract.status)}`}>
                    {getContractStatus(selectedContract.status, selectedContract.endDate)}
                  </p>
                </div>
                {selectedContract.status === "en attente" && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    En attente de validation par le gestionnaire.
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Date de début</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedContract.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Date d'expiration</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedContract.endDate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Adresse</p>
                    <p className="font-semibold text-gray-900">{selectedContract.address || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Age</p>
                    <p className="font-semibold text-gray-900">{selectedContract.age || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Numero de contact</p>
                    <p className="font-semibold text-gray-900">{selectedContract.contactNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Duree (mois)</p>
                    <p className="font-semibold text-gray-900">{selectedContract.durationMonths || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRenewModal(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  ✓ Renouveler
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  ✗ Annuler
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedContract(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Renew Modal */}
        {showRenewModal && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Renouveler le contrat</h2>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir renouveler le contrat <strong>{selectedContract.type}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRenew}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setShowRenewModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && selectedContract && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Annuler le contrat</h2>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir annuler définitivement ce contrat?
              </p>
              <textarea
                placeholder="Raison de l'annulation (optionnelle)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                rows="3"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Annuler le contrat
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Retour
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Contract Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Nouveau contrat</h2>

              <form onSubmit={handleCreateContract} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Ou habitez-vous ? *</label>
                    <input
                      type="text"
                      value={createForm.address}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Ville, adresse"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Age *</label>
                    <input
                      type="number"
                      min="18"
                      value={createForm.age}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, age: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Votre age"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Type d'assurance *</label>
                    <select
                      value={createForm.type}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    >
                      {contractTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Numero de contact *</label>
                    <input
                      type="text"
                      value={createForm.contactNumber}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, contactNumber: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Votre numero"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Numero de contrat</label>
                    <input
                      type="text"
                      value={createForm.contractNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Duree du contrat (mois) *</label>
                    <select
                      value={createForm.durationMonths}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, durationMonths: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    >
                      <option value="6">6 mois</option>
                      <option value="12">12 mois</option>
                      <option value="24">24 mois</option>
                      <option value="36">36 mois</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={creatingContract}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-60"
                  >
                    {creatingContract ? "Creation..." : "Creer le contrat"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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