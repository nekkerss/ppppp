import { useEffect, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { Trash2, CreditCard, Building2, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { formatDate, getStatusBadgeColor, expiresSoon, getContractStatus } from "../utils/helpers";

const contractTypes = [
  { value: "auto", label: "Assurance Auto" },
  { value: "home", label: "Assurance Habitation" },
  { value: "health", label: "Assurance Sante" },
  { value: "travel", label: "Assurance Voyage" },
  { value: "life", label: "Assurance Vie" }
];

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

const formatCardNumber = (v) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
};

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);

  // modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // forms / loading states
  const [editingContract, setEditingContract] = useState(false);
  const [editForm, setEditForm] = useState({ address: "", age: "", contactNumber: "", durationMonths: "12" });
  const [cancelReason, setCancelReason] = useState("");
  const [creatingContract, setCreatingContract] = useState(false);
  const [createForm, setCreateForm] = useState({
    address: "", age: "", type: "auto", contactNumber: "", durationMonths: "12", contractNumber: ""
  });

  // payment
  const [paymentStep, setPaymentStep] = useState("choice"); // choice | inperson | online | processing | success
  const [paymentForm, setPaymentForm] = useState({ cardNumber: "", expiry: "", cvv: "", name: "" });
  const [payingContract, setPayingContract] = useState(false);
  const [aiEstimate, setAiEstimate] = useState({ prix: null, explication: null, loading: false });

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { fetchContracts(); }, []);

  useEffect(() => {
    if (!showCreateModal) return;
    setCreateForm((prev) => ({ ...prev, contractNumber: prev.contractNumber || generateContractNumber() }));
  }, [showCreateModal]);

  const fetchContracts = async () => {
    try {
      const res = await API.get("/contracts");
      setContracts(res.data || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleRenew = async () => {
    try {
      await API.post(`/contracts/${selectedContract._id}/renew`);
      await fetchContracts();
      setShowRenewModal(false);
      setShowDetailModal(false);
      setSelectedContract(null);
    } catch (error) {
      alert("Erreur lors du renouvellement: " + error.response?.data?.message);
    }
  };

  const handleCancel = async () => {
    try {
      await API.post(`/contracts/${selectedContract._id}/cancel`, { reason: cancelReason });
      await fetchContracts();
      setShowCancelModal(false);
      setShowDetailModal(false);
      setSelectedContract(null);
      setCancelReason("");
    } catch (error) {
      alert("Erreur lors de l'annulation: " + error.response?.data?.message);
    }
  };

  const handleDelete = async (e, contract) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer le contrat ${contract.contractNumber || contract._id} ?`)) return;
    try {
      await API.delete(`/contracts/${contract._id}`);
      setContracts((prev) => prev.filter((c) => c._id !== contract._id));
      if (selectedContract?._id === contract._id) {
        setSelectedContract(null);
        setShowDetailModal(false);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Erreur lors de la suppression";
      alert(msg);
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    if (!createForm.address || !createForm.age || !createForm.type || !createForm.contactNumber || !createForm.durationMonths) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    try {
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
      setShowCreateModal(false);
      setCreateForm({ address: "", age: "", type: "auto", contactNumber: "", durationMonths: "12", contractNumber: "" });
    } catch (error) {
      alert("Erreur: " + error.response?.data?.message);
    } finally {
      setCreatingContract(false);
    }
  };

  const handleEditContract = async (e) => {
    e.preventDefault();
    if (!editForm.address || !editForm.age || !editForm.contactNumber || !editForm.durationMonths) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    try {
      setEditingContract(true);
      const res = await API.patch(`/contracts/${selectedContract._id}`, {
        address: editForm.address,
        age: Number(editForm.age),
        contactNumber: editForm.contactNumber,
        durationMonths: Number(editForm.durationMonths)
      });
      setContracts((prev) => prev.map((c) => (c._id === res.data._id ? res.data : c)));
      setSelectedContract(res.data);
      setShowEditModal(false);
    } catch (error) {
      alert("Erreur: " + error.response?.data?.message);
    } finally {
      setEditingContract(false);
    }
  };

  // ── PAYMENT ───────────────────────────────────────────────────────────────

  const openPayment = async (e, contract) => {
    e.stopPropagation();
    setSelectedContract(contract);
    setPaymentStep("choice");
    setPaymentForm({ cardNumber: "", expiry: "", cvv: "", name: "" });
    setAiEstimate({ prix: null, explication: null, loading: true });
    setShowPaymentModal(true);
    try {
      const res = await API.post("/quotes/estimate", {
        type: contract.type,
        parametres: {
          age: contract.age || "non renseigné",
          duree: `${contract.durationMonths || 12} mois`,
          ville: contract.address || "non renseignée",
        },
      });
      setAiEstimate({ prix: res.data.prix, explication: res.data.explication, loading: false });
    } catch {
      setAiEstimate({ prix: null, explication: null, loading: false });
    }
  };

  const handlePayInperson = async () => {
    try {
      setPayingContract(true);
      const res = await API.patch(`/contracts/${selectedContract._id}/pay`, { paymentMethod: "inperson" });
      setContracts((prev) => prev.map((c) => (c._id === res.data._id ? res.data : c)));
      setPaymentStep("success");
    } catch (error) {
      alert("Erreur: " + error.response?.data?.message);
    } finally {
      setPayingContract(false);
    }
  };

  const handlePayOnline = async (e) => {
    e.preventDefault();
    setPaymentStep("processing");
    await new Promise((r) => setTimeout(r, 1800));
    try {
      const res = await API.patch(`/contracts/${selectedContract._id}/pay`, { paymentMethod: "online" });
      setContracts((prev) => prev.map((c) => (c._id === res.data._id ? res.data : c)));
      setPaymentStep("success");
    } catch (error) {
      setPaymentStep("online");
      alert("Erreur: " + error.response?.data?.message);
    }
  };

  // ── FILTERS ───────────────────────────────────────────────────────────────

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c._id.toString().includes(searchTerm) ||
      (c.contractNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">Chargement des contrats...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

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
              setCreateForm((prev) => ({ ...prev, contractNumber: generateContractNumber() }));
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            + Nouveau contrat
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Rechercher par type ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="en attente">En attente</option>
              <option value="actif">Actif</option>
              <option value="refusé">Refusé</option>
              <option value="expiré">Expiré</option>
            </select>
          </div>
        </div>

        {/* Contract cards */}
        <div className="space-y-4">
          {filteredContracts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
              Aucun contrat trouvé
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <div
                key={contract._id}
                onClick={() => { setSelectedContract(contract); setShowDetailModal(true); }}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 cursor-pointer transition-all hover:shadow-lg
                  ${contract.status === "expiré" || contract.status === "refusé" ? "border-l-red-500 opacity-80" :
                    contract.status === "en attente" ? "border-l-yellow-400" : "border-l-green-500"}
                  ${expiresSoon(contract.endDate) ? "bg-yellow-50" : ""}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900 capitalize">Contrat {contract.type}</h3>

                      {/* Status badge — spinner when pending */}
                      {contract.status === "en attente" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          <span className="inline-block w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                          En attente
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(contract.status)}`}>
                          {getContractStatus(contract.status, contract.endDate)}
                        </span>
                      )}

                      {/* Payment badge */}
                      {contract.paymentStatus === "paid" && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          ✓ Payé {contract.paymentMethod === "online" ? "(en ligne)" : "(en agence)"}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      N° {contract.contractNumber || `CTR-${String(contract._id).slice(-6).toUpperCase()}`}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-gray-500">Date de début</p>
                        <p className="font-semibold">{formatDate(contract.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date d'expiration</p>
                        <p className="font-semibold">{formatDate(contract.endDate)}</p>
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {contract.status === "refusé" && contract.rejectionReason && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        <strong>Motif de refus :</strong> {contract.rejectionReason}
                      </div>
                    )}

                    {expiresSoon(contract.endDate) && contract.status === "actif" && (
                      <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                        ⚠️ Ce contrat expire bientôt. Veuillez le renouveler.
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 ml-4 items-end">
                    {/* Payment button — only when actif and unpaid */}
                    {contract.status === "actif" && contract.paymentStatus !== "paid" && (
                      <button
                        onClick={(e) => openPayment(e, contract)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Paiement
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, contract)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer le contrat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── DETAIL MODAL ───────────────────────────────────────────────────── */}
        {showDetailModal && selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Détails du contrat</h2>

              <div className="space-y-3">
                <Row label="Type" value={selectedContract.type} />
                <Row label="Numéro" value={selectedContract.contractNumber || `CTR-${String(selectedContract._id).slice(-6).toUpperCase()}`} />
                <Row label="Statut">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedContract.status)}`}>
                    {getContractStatus(selectedContract.status, selectedContract.endDate)}
                  </span>
                </Row>

                {selectedContract.status === "en attente" && (
                  <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
                    <span className="inline-block w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                    En attente de validation par le gestionnaire.
                  </div>
                )}

                {selectedContract.status === "refusé" && selectedContract.rejectionReason && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <strong>Motif de refus :</strong> {selectedContract.rejectionReason}
                  </div>
                )}

                {selectedContract.paymentStatus === "paid" && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Payé {selectedContract.paymentMethod === "online" ? "en ligne" : "en agence"}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Row label="Date de début" value={formatDate(selectedContract.startDate)} />
                  <Row label="Date d'expiration" value={formatDate(selectedContract.endDate)} />
                  <Row label="Adresse" value={selectedContract.address || "N/A"} />
                  <Row label="Age" value={selectedContract.age || "N/A"} />
                  <Row label="Contact" value={selectedContract.contactNumber || "N/A"} />
                  <Row label="Durée" value={selectedContract.durationMonths ? `${selectedContract.durationMonths} mois` : "N/A"} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {selectedContract.status === "actif" && selectedContract.paymentStatus !== "paid" && (
                  <button
                    onClick={(e) => { setShowDetailModal(false); openPayment(e, selectedContract); }}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    <CreditCard className="w-4 h-4" /> Paiement
                  </button>
                )}
                <button onClick={() => setShowRenewModal(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
                  ✓ Renouveler
                </button>
                <button
                  onClick={() => { setEditForm({ address: selectedContract.address || "", age: selectedContract.age || "", contactNumber: selectedContract.contactNumber || "", durationMonths: selectedContract.durationMonths || "12" }); setShowEditModal(true); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  ✎ Modifier
                </button>
                <button onClick={() => setShowCancelModal(true)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">
                  ✗ Annuler
                </button>
                <button onClick={() => { setShowDetailModal(false); setSelectedContract(null); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT MODAL ─────────────────────────────────────────────────────── */}
        {showEditModal && selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Modifier le contrat</h2>
              <form onSubmit={handleEditContract} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldInput label="Adresse *" value={editForm.address} onChange={(v) => setEditForm((p) => ({ ...p, address: v }))} placeholder="Ville, adresse" required />
                  <FieldInput label="Age *" type="number" min="18" value={editForm.age} onChange={(v) => setEditForm((p) => ({ ...p, age: v }))} placeholder="Votre age" required />
                  <FieldInput label="Contact *" value={editForm.contactNumber} onChange={(v) => setEditForm((p) => ({ ...p, contactNumber: v }))} placeholder="Numéro" required />
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Durée *</label>
                    <select value={editForm.durationMonths} onChange={(e) => setEditForm((p) => ({ ...p, durationMonths: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" required>
                      {["6", "12", "24", "36"].map((m) => <option key={m} value={m}>{m} mois</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={editingContract} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-60">
                    {editingContract ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── RENEW MODAL ────────────────────────────────────────────────────── */}
        {showRenewModal && selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Renouveler le contrat</h2>
              <p className="text-gray-600">Êtes-vous sûr de vouloir renouveler le contrat <strong>{selectedContract.type}</strong> ?</p>
              <div className="flex gap-3">
                <button onClick={handleRenew} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">Confirmer</button>
                <button onClick={() => setShowRenewModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg">Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* ── CANCEL MODAL ───────────────────────────────────────────────────── */}
        {showCancelModal && selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Annuler le contrat</h2>
              <p className="text-gray-600">Êtes-vous sûr de vouloir annuler définitivement ce contrat ?</p>
              <textarea
                placeholder="Raison de l'annulation (optionnelle)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                rows="3"
              />
              <div className="flex gap-3">
                <button onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg">Confirmer</button>
                <button onClick={() => setShowCancelModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg">Retour</button>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE MODAL ───────────────────────────────────────────────────── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Nouveau contrat</h2>
              <form onSubmit={handleCreateContract} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldInput label="Adresse *" value={createForm.address} onChange={(v) => setCreateForm((p) => ({ ...p, address: v }))} placeholder="Ville, adresse" required />
                  <FieldInput label="Age *" type="number" min="18" value={createForm.age} onChange={(v) => setCreateForm((p) => ({ ...p, age: v }))} placeholder="Votre age" required />
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Type d'assurance *</label>
                    <select value={createForm.type} onChange={(e) => setCreateForm((p) => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" required>
                      {contractTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <FieldInput label="Contact *" value={createForm.contactNumber} onChange={(v) => setCreateForm((p) => ({ ...p, contactNumber: v }))} placeholder="Votre numéro" required />
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Numéro de contrat</label>
                    <input value={createForm.contractNumber} readOnly className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Durée *</label>
                    <select value={createForm.durationMonths} onChange={(e) => setCreateForm((p) => ({ ...p, durationMonths: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" required>
                      {["6", "12", "24", "36"].map((m) => <option key={m} value={m}>{m} mois</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={creatingContract} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-60">
                    {creatingContract ? "Création..." : "Créer le contrat"}
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── PAYMENT MODAL ──────────────────────────────────────────────────── */}
        {showPaymentModal && selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">

              {/* CHOICE step */}
              {paymentStep === "choice" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">Choisir le mode de paiement</h2>
                  <p className="text-sm text-gray-500">Contrat : <strong>{selectedContract.contractNumber}</strong></p>

                  {/* AI Price Estimate */}
                  {aiEstimate.loading ? (
                    <div className="flex items-center gap-3 bg-[#effaf5] border border-[#00a67e]/20 rounded-xl p-4 text-sm text-[#00a67e]">
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      L'IA calcule votre prime annuelle...
                    </div>
                  ) : aiEstimate.prix ? (
                    <div className="bg-[#effaf5] border border-[#00a67e]/20 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#00a67e]" />
                        <span className="text-xs font-bold text-[#00a67e] uppercase tracking-wide">Prime estimée par IA</span>
                      </div>
                      <p className="text-2xl font-black text-gray-900">
                        {aiEstimate.prix.toLocaleString("fr-TN")} TND
                        <span className="text-sm font-normal text-gray-500 ml-1">/ an</span>
                      </p>
                      {aiEstimate.explication && (
                        <p className="text-xs text-gray-600 leading-relaxed italic">"{aiEstimate.explication}"</p>
                      )}
                    </div>
                  ) : null}
                  <button
                    onClick={() => setPaymentStep("inperson")}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-blue-500 rounded-xl transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Payer en agence</p>
                      <p className="text-xs text-gray-500">Venez payer directement à nos locaux</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentStep("online")}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-emerald-500 rounded-xl transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
                      <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Paiement en ligne</p>
                      <p className="text-xs text-gray-500">Paiement sécurisé par carte bancaire</p>
                    </div>
                  </button>
                  <button onClick={() => setShowPaymentModal(false)} className="w-full text-sm text-gray-500 hover:text-gray-700 pt-2">
                    Annuler
                  </button>
                </div>
              )}

              {/* INPERSON step */}
              {paymentStep === "inperson" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">Payer en agence</h2>
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2 text-sm text-blue-900">
                    <p className="font-semibold">BNA Assurances — Siège Social</p>
                    <p>Rue de la Banque, Tunis 1001</p>
                    <p>Lundi – Vendredi : 08h00 – 17h00</p>
                    <p>Tél : +216 71 000 000</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
                    Présentez votre numéro de contrat : <strong>{selectedContract.contractNumber}</strong>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handlePayInperson}
                      disabled={payingContract}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
                    >
                      {payingContract ? "Confirmation..." : "Confirmer le rendez-vous"}
                    </button>
                    <button onClick={() => setPaymentStep("choice")} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2.5 rounded-lg">
                      Retour
                    </button>
                  </div>
                </div>
              )}

              {/* ONLINE step */}
              {paymentStep === "online" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">Paiement par carte</h2>
                  <div className="rounded-xl bg-gradient-to-br from-[#1a365d] to-[#2d4a7c] p-4 text-white">
                    <p className="text-xs opacity-70 mb-4">Carte de paiement (test)</p>
                    <p className="font-mono text-lg tracking-widest mb-4">
                      {paymentForm.cardNumber || "•••• •••• •••• ••••"}
                    </p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="opacity-60 text-xs">Titulaire</p>
                        <p className="font-medium uppercase">{paymentForm.name || "VOTRE NOM"}</p>
                      </div>
                      <div>
                        <p className="opacity-60 text-xs">Expiration</p>
                        <p className="font-medium">{paymentForm.expiry || "MM/AA"}</p>
                      </div>
                    </div>
                  </div>
                  <form onSubmit={handlePayOnline} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Numéro de carte</label>
                      <input
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm((p) => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Expiration</label>
                        <input
                          value={paymentForm.expiry}
                          onChange={(e) => setPaymentForm((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">CVV</label>
                        <input
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                          placeholder="•••"
                          maxLength={3}
                          type="password"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nom sur la carte</label>
                      <input
                        value={paymentForm.name}
                        onChange={(e) => setPaymentForm((p) => ({ ...p, name: e.target.value.toUpperCase() }))}
                        placeholder="PRÉNOM NOM"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg">
                        Payer maintenant
                      </button>
                      <button type="button" onClick={() => setPaymentStep("choice")} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2.5 rounded-lg">
                        Retour
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PROCESSING step */}
              {paymentStep === "processing" && (
                <div className="py-12 text-center space-y-4">
                  <div className="inline-block w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <p className="font-semibold text-gray-800">Traitement en cours...</p>
                  <p className="text-sm text-gray-500">Veuillez ne pas fermer cette fenêtre</p>
                </div>
              )}

              {/* SUCCESS step */}
              {paymentStep === "success" && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Paiement confirmé !</h2>
                  <p className="text-sm text-gray-500">
                    Votre paiement pour le contrat <strong>{selectedContract.contractNumber}</strong> a été enregistré avec succès.
                  </p>
                  <button
                    onClick={() => { setShowPaymentModal(false); setPaymentStep("choice"); }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg"
                  >
                    Fermer
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Row({ label, value, children }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      {children ?? <p className="font-semibold text-gray-900">{value}</p>}
    </div>
  );
}

function FieldInput({ label, value, onChange, type = "text", placeholder, required, min }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  );
}
