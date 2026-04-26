import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, getStatusBadgeColor, getContractStatus } from "../utils/helpers";
import {
  CheckCircle2, XCircle, Clock, Search, RefreshCw, ChevronRight,
  FileText, Calendar, User, Phone, MapPin, CreditCard, X, Shield,
  AlertCircle, Wallet, Tag
} from "lucide-react";

const TYPE_ICONS = { auto: "🚗", habitation: "🏠", sante: "❤️", voyage: "✈️", vie: "💚" };

function StatusBadge({ contract }) {
  if (contract.status === "en attente") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <span className="w-2.5 h-2.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        En attente
      </span>
    );
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
      contract.status === "actif" ? "bg-green-100 text-green-700 border-green-200"
      : contract.status === "refusé" ? "bg-red-100 text-red-700 border-red-200"
      : "bg-slate-100 text-slate-600 border-slate-200"
    }`}>
      {getContractStatus(contract.status, contract.endDate)}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value, color = "text-slate-600" }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
        <p className={`text-sm font-semibold ${color} break-words`}>{value}</p>
      </div>
    </div>
  );
}

export default function GestionnaireContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [contractFilter, setContractFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [detailContract, setDetailContract] = useState(null);

  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refusingContract, setRefusingContract] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/contracts/gestionnaire/all");
      setContracts(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les contrats");
    } finally {
      setLoading(false);
    }
  };

  const userGroups = useMemo(() => {
    const groups = {};
    contracts.forEach((c) => {
      if (!c.userId) return;
      const uid = c.userId._id;
      if (!groups[uid]) groups[uid] = { user: c.userId, contracts: [] };
      groups[uid].contracts.push(c);
    });
    return Object.values(groups).filter((g) => {
      if (!userSearch) return true;
      const term = userSearch.toLowerCase();
      return g.user.name?.toLowerCase().includes(term) || g.user.email?.toLowerCase().includes(term);
    });
  }, [contracts, userSearch]);

  const selectedUserContracts = useMemo(() => {
    if (!selectedUser) return [];
    return contracts.filter(
      (c) => c.userId?._id === selectedUser._id && (contractFilter === "all" || c.status === contractFilter)
    );
  }, [contracts, selectedUser, contractFilter]);

  const pendingCount = selectedUser
    ? contracts.filter((c) => c.userId?._id === selectedUser._id && c.status === "en attente").length
    : 0;

  const handleAccept = async (contract) => {
    setError(""); setSuccess("");
    try {
      const res = await API.patch(`/contracts/${contract._id}/review`, { action: "accept" });
      const updated = { ...res.data, userId: contract.userId };
      setContracts((prev) => prev.map((c) => c._id === contract._id ? updated : c));
      if (detailContract?._id === contract._id) setDetailContract(updated);
      setSuccess(`Contrat ${contract.contractNumber} accepté`);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'acceptation");
    }
  };

  const openRefuse = (contract) => {
    setRefusingContract(contract);
    setRejectReason("");
    setError("");
    setShowRefuseModal(true);
  };

  const handleRefuse = async () => {
    if (!rejectReason.trim()) { setError("Veuillez indiquer le motif de refus"); return; }
    setError(""); setSuccess("");
    try {
      setSubmitting(true);
      const res = await API.patch(`/contracts/${refusingContract._id}/review`, {
        action: "refuse",
        rejectionReason: rejectReason.trim()
      });
      const updated = { ...res.data, userId: refusingContract.userId };
      setContracts((prev) => prev.map((c) => c._id === refusingContract._id ? updated : c));
      if (detailContract?._id === refusingContract._id) setDetailContract(updated);
      setSuccess(`Contrat ${refusingContract.contractNumber} refusé`);
      setShowRefuseModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du refus");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full border-4 border-[#00a67e]/20 border-t-[#00a67e] animate-spin mx-auto" />
            <p className="mt-4 text-[#1a365d] font-semibold">Chargement des contrats...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#153356] to-[#1a3a5c] px-6 py-10 md:px-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#00a67e]/10 blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#00a67e]/20 border border-[#00a67e]/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#00a67e]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gestion des Contrats</h1>
                <p className="text-blue-200/70 text-sm">Consultez et validez les contrats de vos clients</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 space-y-4">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />{success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>

            {/* LEFT — user list */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-[#1a365d] text-sm">Clients ({userGroups.length})</h2>
                  <button onClick={fetchContracts} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Rechercher un client..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                {userGroups.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun client trouvé</p>
                  </div>
                ) : (
                  userGroups.map(({ user, contracts: uc }) => {
                    const pending = uc.filter((c) => c.status === "en attente").length;
                    const isSelected = selectedUser?._id === user._id;
                    return (
                      <button
                        key={user._id}
                        onClick={() => { setSelectedUser(user); setContractFilter("all"); setDetailContract(null); }}
                        className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-all duration-150 ${
                          isSelected
                            ? "bg-[#0f2744]/5 border-l-[3px] border-l-[#0f2744]"
                            : "hover:bg-slate-50 border-l-[3px] border-l-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0f2744] to-[#1a3a5c] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[11px] text-slate-400">{uc.length} contrat{uc.length > 1 ? "s" : ""}</span>
                            {pending > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">{pending} en attente</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT — contracts list */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              {!selectedUser ? (
                <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
                  <div className="text-center">
                    <FileText className="w-14 h-14 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-slate-500">Sélectionnez un client</p>
                    <p className="text-sm mt-1">pour voir ses contrats</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Sub-header */}
                  <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0f2744] to-[#1a3a5c] flex items-center justify-center text-white font-bold text-sm">
                        {selectedUser.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#1a365d] text-sm">{selectedUser.name}</p>
                        <p className="text-xs text-slate-400">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pendingCount > 0 && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> {pendingCount} en attente
                        </span>
                      )}
                      <select
                        value={contractFilter}
                        onChange={(e) => setContractFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00a67e] bg-slate-50"
                      >
                        <option value="all">Tous</option>
                        <option value="en attente">En attente</option>
                        <option value="actif">Actif</option>
                        <option value="refusé">Refusé</option>
                        <option value="expiré">Expiré</option>
                      </select>
                    </div>
                  </div>

                  {/* Contract cards */}
                  <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {selectedUserContracts.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Aucun contrat pour ce filtre</p>
                      </div>
                    ) : (
                      selectedUserContracts.map((contract) => (
                        <button
                          key={contract._id}
                          onClick={() => setDetailContract(contract)}
                          className="w-full text-left group rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#00a67e]/40 hover:shadow-md transition-all duration-200 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                              {TYPE_ICONS[contract.type] || "📄"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-bold text-slate-800 capitalize">{contract.type}</p>
                                <StatusBadge contract={contract} />
                                {contract.paymentStatus === "paid" && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    ✓ Payé
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">
                                N° {contract.contractNumber} · {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                              </p>
                              {contract.status === "refusé" && contract.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1 line-clamp-1">Refus : {contract.rejectionReason}</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#00a67e] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTRACT DETAIL MODAL ─────────────────────────────────────────────── */}
      {detailContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                  {TYPE_ICONS[detailContract.type] || "📄"}
                </div>
                <div>
                  <p className="font-bold text-[#1a365d] capitalize">Contrat {detailContract.type}</p>
                  <p className="text-xs text-slate-400">N° {detailContract.contractNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge contract={detailContract} />
                <button onClick={() => setDetailContract(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">

              {/* Rejection reason */}
              {detailContract.status === "refusé" && detailContract.rejectionReason && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Motif de refus</p>
                  <p className="text-sm text-red-700">{detailContract.rejectionReason}</p>
                </div>
              )}

              {/* Payment status */}
              {detailContract.paymentStatus === "paid" && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700">Paiement effectué</p>
                    <p className="text-xs text-emerald-600">
                      {detailContract.paymentMethod === "online" ? "En ligne" : "En agence"}
                    </p>
                  </div>
                </div>
              )}

              {/* Client info */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Informations client</p>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4">
                  <DetailRow icon={User} label="Nom" value={selectedUser?.name} />
                  <DetailRow icon={Tag} label="Email" value={selectedUser?.email} />
                </div>
              </div>

              {/* Contract details */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Détails du contrat</p>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4">
                  <DetailRow icon={Shield} label="Type d'assurance" value={detailContract.type} />
                  <DetailRow icon={FileText} label="Numéro de contrat" value={detailContract.contractNumber} />
                  <DetailRow icon={Calendar} label="Date de début" value={formatDate(detailContract.startDate)} />
                  <DetailRow icon={Calendar} label="Date de fin" value={formatDate(detailContract.endDate)} />
                  <DetailRow icon={Clock} label="Durée" value={detailContract.durationMonths ? `${detailContract.durationMonths} mois` : null} />
                  <DetailRow icon={MapPin} label="Adresse" value={detailContract.address} />
                  <DetailRow icon={User} label="Âge" value={detailContract.age ? `${detailContract.age} ans` : null} />
                  <DetailRow icon={Phone} label="Numéro de contact" value={detailContract.contactNumber} />
                  <DetailRow
                    icon={Wallet}
                    label="Statut paiement"
                    value={detailContract.paymentStatus === "paid" ? "Payé" : "Non payé"}
                    color={detailContract.paymentStatus === "paid" ? "text-emerald-600" : "text-slate-600"}
                  />
                </div>
              </div>
            </div>

            {/* Modal footer — actions */}
            {detailContract.status === "en attente" && (
              <div className="p-5 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => handleAccept(detailContract)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00a67e] hover:bg-[#008c6a] text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-[#00a67e]/20 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accepter le contrat
                </button>
                <button
                  onClick={() => openRefuse(detailContract)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-3 rounded-2xl transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Refuser
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REFUSE MODAL ──────────────────────────────────────────────────────── */}
      {showRefuseModal && refusingContract && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Refuser le contrat</h2>
                <p className="text-xs text-slate-400">N° {refusingContract.contractNumber} — {refusingContract.type}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Motif de refus <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi ce contrat est refusé..."
                rows={4}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none transition-all resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRefuse}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl disabled:opacity-60 transition-all"
              >
                {submitting ? "Envoi..." : "Confirmer le refus"}
              </button>
              <button
                onClick={() => { setShowRefuseModal(false); setError(""); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
