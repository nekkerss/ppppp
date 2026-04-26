import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import {
  getSinistreTypeLabel, getSanteSubTypeLabel,
  getVoyageSubTypeLabel, getBatimentSubTypeLabel
} from "../utils/helpers";
import {
  CheckCircle2, XCircle, Clock, Search, RefreshCw, ChevronRight,
  AlertTriangle, User, Phone, Mail, CreditCard, FileText, Calendar,
  X, AlertCircle, Car, Tag, ExternalLink
} from "lucide-react";

const STATUS_COLORS = {
  "en attente": "bg-amber-100 text-amber-700 border-amber-200",
  "accepté":    "bg-green-100 text-green-700 border-green-200",
  "refusé":     "bg-red-100 text-red-700 border-red-200"
};

const TYPE_ICONS = { sante: "❤️", voyage: "✈️", auto: "🚗", batiment: "🏠" };

function subTypeLabel(claim) {
  if (claim.sinistreType === "sante")    return getSanteSubTypeLabel(claim.santeSubType);
  if (claim.sinistreType === "voyage")   return getVoyageSubTypeLabel(claim.voyageSubType);
  if (claim.sinistreType === "batiment") return getBatimentSubTypeLabel(claim.batimentSubType);
  return null;
}

function DetailRow({ icon: Icon, label, value, color = "text-slate-700" }) {
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

const FILE_LABELS = {
  attestationTiers: "Attestation tiers", constat: "Constat", photoVehicule: "Photo véhicule",
  cinPasseport: "CIN / Passeport", policeAssurance: "Police assurance",
  billetsAvion: "Billets avion", preuveReservation: "Preuve réservation",
  feuilleSoins: "Feuille de soins", rapportMedical: "Rapport médical",
  facturesOriginales: "Factures originales", facturesPharmacie: "Factures pharmacie",
  resultatsAnalyses: "Résultats analyses", prescription: "Prescription",
  bulletinHospitalisation: "Bulletin hospitalisation", factureClinic: "Facture clinique",
  compteRenduHospitalisation: "Compte rendu hospitalisation",
  carteIdentiteBatiment: "Carte identité bâtiment", contratAssuranceHabitation: "Contrat assurance habitation",
  declarationEcriteBatiment: "Déclaration écrite", photosDegats: "Photos des dégâts",
  listeBiensDommages: "Liste biens endommagés", constatAmiableEaux: "Constat amiable eaux",
  coordonneesImpliques: "Coordonnées impliqués", rapportProtectionCivile: "Rapport protection civile",
  preuveIntervention: "Preuve intervention", rapportExpert: "Rapport expert", titrePropriete: "Titre propriété"
};

export default function GestionnaireSinistres() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [claimFilter, setClaimFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [detailClaim, setDetailClaim] = useState(null);

  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refusingClaim, setRefusingClaim] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchClaims(); }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await API.get("/claims");
      setClaims(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les déclarations");
    } finally {
      setLoading(false);
    }
  };

  const userGroups = useMemo(() => {
    const groups = {};
    claims.forEach((c) => {
      if (!c.userId) return;
      const uid = typeof c.userId === "object" ? c.userId._id : c.userId;
      if (!groups[uid]) groups[uid] = { user: c.userId, claims: [] };
      groups[uid].claims.push(c);
    });
    return Object.values(groups).filter((g) => {
      if (!userSearch) return true;
      const u = typeof g.user === "object" ? g.user : {};
      const term = userSearch.toLowerCase();
      return u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term);
    });
  }, [claims, userSearch]);

  const selectedUserClaims = useMemo(() => {
    if (!selectedUser) return [];
    return claims.filter((c) => {
      const uid = typeof c.userId === "object" ? c.userId._id : c.userId;
      return uid === selectedUser._id && (claimFilter === "all" || c.status === claimFilter);
    });
  }, [claims, selectedUser, claimFilter]);

  const pendingCount = selectedUser
    ? claims.filter((c) => {
        const uid = typeof c.userId === "object" ? c.userId._id : c.userId;
        return uid === selectedUser._id && c.status === "en attente";
      }).length
    : 0;

  const handleAccept = async (claim) => {
    setError(""); setSuccess("");
    try {
      const res = await API.patch(`/claims/${claim._id}/status`, { status: "accepté" });
      setClaims((prev) => prev.map((c) => c._id === claim._id ? res.data : c));
      if (detailClaim?._id === claim._id) setDetailClaim(res.data);
      setSuccess("Déclaration acceptée");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'acceptation");
    }
  };

  const openRefuse = (claim) => {
    setRefusingClaim(claim);
    setRejectReason("");
    setError("");
    setShowRefuseModal(true);
  };

  const handleRefuse = async () => {
    if (!rejectReason.trim()) { setError("Veuillez indiquer le motif de refus"); return; }
    setError(""); setSuccess("");
    try {
      setSubmitting(true);
      const res = await API.patch(`/claims/${refusingClaim._id}/status`, {
        status: "refusé",
        rejectionReason: rejectReason.trim()
      });
      setClaims((prev) => prev.map((c) => c._id === refusingClaim._id ? res.data : c));
      if (detailClaim?._id === refusingClaim._id) setDetailClaim(res.data);
      setSuccess("Déclaration refusée");
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
            <p className="mt-4 text-[#1a365d] font-semibold">Chargement des sinistres...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const uploadedFiles = detailClaim?.files
    ? Object.entries(detailClaim.files).filter(([, v]) => v)
    : [];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#153356] to-[#1a3a5c] px-6 py-10 md:px-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#00a67e]/10 blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00a67e]/20 border border-[#00a67e]/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#00a67e]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sinistres Clients</h1>
                <p className="text-blue-200/70 text-sm">Consultez et validez les déclarations de sinistre</p>
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
                  <button onClick={fetchClaims} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
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
                    <p className="text-sm">Aucun client avec des sinistres</p>
                  </div>
                ) : (
                  userGroups.map(({ user, claims: uc }) => {
                    const userObj = typeof user === "object" ? user : { _id: user, name: "?", email: "" };
                    const pending = uc.filter((c) => c.status === "en attente").length;
                    const isSelected = selectedUser?._id === userObj._id;
                    return (
                      <button
                        key={userObj._id}
                        onClick={() => { setSelectedUser(userObj); setClaimFilter("all"); setDetailClaim(null); }}
                        className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-all duration-150 ${
                          isSelected
                            ? "bg-[#0f2744]/5 border-l-[3px] border-l-[#0f2744]"
                            : "hover:bg-slate-50 border-l-[3px] border-l-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0f2744] to-[#1a3a5c] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {userObj.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 text-sm truncate">{userObj.name}</p>
                            <p className="text-xs text-slate-400 truncate">{userObj.email}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[11px] text-slate-400">{uc.length} sinistre{uc.length > 1 ? "s" : ""}</span>
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

            {/* RIGHT — sinistre cards */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              {!selectedUser ? (
                <div className="flex-1 flex items-center justify-center p-12 text-slate-400">
                  <div className="text-center">
                    <AlertTriangle className="w-14 h-14 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-slate-500">Sélectionnez un client</p>
                    <p className="text-sm mt-1">pour voir ses déclarations</p>
                  </div>
                </div>
              ) : (
                <>
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
                        value={claimFilter}
                        onChange={(e) => setClaimFilter(e.target.value)}
                        className="text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00a67e] bg-slate-50"
                      >
                        <option value="all">Tous</option>
                        <option value="en attente">En attente</option>
                        <option value="accepté">Accepté</option>
                        <option value="refusé">Refusé</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {selectedUserClaims.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Aucune déclaration pour ce filtre</p>
                      </div>
                    ) : (
                      selectedUserClaims.map((claim) => {
                        const sub = subTypeLabel(claim);
                        return (
                          <button
                            key={claim._id}
                            onClick={() => setDetailClaim(claim)}
                            className="w-full text-left group rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#00a67e]/40 hover:shadow-md transition-all duration-200 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                {TYPE_ICONS[claim.sinistreType] || "🛡️"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="font-bold text-slate-800">
                                    {getSinistreTypeLabel(claim.sinistreType) || claim.sinistreType}
                                  </p>
                                  {sub && <span className="text-xs text-slate-400">— {sub}</span>}
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_COLORS[claim.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                    {claim.status === "en attente"
                                      ? <span className="flex items-center gap-1"><span className="w-2 h-2 border border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />En attente</span>
                                      : claim.status.charAt(0).toUpperCase() + claim.status.slice(1)
                                    }
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                  {claim.fullName && <span>{claim.fullName} · </span>}
                                  {new Date(claim.date).toLocaleDateString("fr-FR")}
                                </p>
                                {claim.description && (
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{claim.description}</p>
                                )}
                                {claim.status === "refusé" && claim.rejectionReason && (
                                  <p className="text-xs text-red-500 mt-1 line-clamp-1">Refus : {claim.rejectionReason}</p>
                                )}
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#00a67e] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SINISTRE DETAIL MODAL ──────────────────────────────────────────────── */}
      {detailClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                  {TYPE_ICONS[detailClaim.sinistreType] || "🛡️"}
                </div>
                <div>
                  <p className="font-bold text-[#1a365d]">
                    Sinistre {getSinistreTypeLabel(detailClaim.sinistreType)}
                    {subTypeLabel(detailClaim) && <span className="font-normal text-slate-400"> — {subTypeLabel(detailClaim)}</span>}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(detailClaim.date).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[detailClaim.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {detailClaim.status.charAt(0).toUpperCase() + detailClaim.status.slice(1)}
                </span>
                <button onClick={() => setDetailClaim(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">

              {/* Rejection reason */}
              {detailClaim.status === "refusé" && detailClaim.rejectionReason && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Motif de refus</p>
                  <p className="text-sm text-red-700">{detailClaim.rejectionReason}</p>
                </div>
              )}

              {/* Description */}
              {detailClaim.description && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description du sinistre</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{detailClaim.description}</p>
                </div>
              )}

              {/* Declarant info */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Informations du déclarant</p>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4">
                  <DetailRow icon={User}       label="Nom complet"  value={detailClaim.fullName} />
                  <DetailRow icon={CreditCard} label="CIN"          value={detailClaim.cinNumber} />
                  <DetailRow icon={Mail}       label="Email"        value={detailClaim.email} />
                  <DetailRow icon={Phone}      label="GSM"          value={detailClaim.gsm} />
                </div>
              </div>

              {/* Type-specific fields */}
              {detailClaim.sinistreType === "auto" && detailClaim.immatriculation && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Véhicule</p>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4">
                    <DetailRow icon={Car} label="Immatriculation" value={detailClaim.immatriculation} />
                  </div>
                </div>
              )}

              {detailClaim.sinistreType === "batiment" && detailClaim.numeroPoliceBatiment && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Bâtiment</p>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4">
                    <DetailRow icon={FileText} label="N° police bâtiment" value={detailClaim.numeroPoliceBatiment} />
                  </div>
                </div>
              )}

              {/* Date / contract */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Détails de la déclaration</p>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4">
                  <DetailRow icon={Calendar} label="Date du sinistre" value={new Date(detailClaim.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })} />
                  <DetailRow icon={Tag}      label="Contrat lié"      value={detailClaim.contractId ? `Contrat #${typeof detailClaim.contractId === "object" ? detailClaim.contractId.contractNumber || detailClaim.contractId._id : detailClaim.contractId}` : null} />
                </div>
              </div>

              {/* Documents */}
              {uploadedFiles.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Documents fournis ({uploadedFiles.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {uploadedFiles.map(([key, path]) => {
                      const filename = path.split(/[/\\]/).pop();
                      const fileUrl = `http://localhost:5000/uploads/${filename}`;
                      return (
                        <a
                          key={key}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#00a67e]/40 hover:bg-[#f0fdf9] p-3 transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                            <FileText className="w-4 h-4 text-[#00a67e]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              {FILE_LABELS[key] || key}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{filename}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#00a67e] shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer — actions */}
            {detailClaim.status === "en attente" && (
              <div className="p-5 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => handleAccept(detailClaim)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#00a67e] hover:bg-[#008c6a] text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-[#00a67e]/20 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accepter la déclaration
                </button>
                <button
                  onClick={() => openRefuse(detailClaim)}
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
      {showRefuseModal && refusingClaim && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Refuser la déclaration</h2>
                <p className="text-xs text-slate-400">
                  {getSinistreTypeLabel(refusingClaim.sinistreType)}
                  {refusingClaim.fullName && ` — ${refusingClaim.fullName}`}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Motif de refus <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquez pourquoi cette déclaration est refusée..."
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
