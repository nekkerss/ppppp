import { useContext, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, getStatusBadgeColor, truncateText, getSinistreTypeLabel } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";

const getFileUrl = (fileUrl = "") => {
  if (!fileUrl) return "#";

  const normalized = fileUrl.replace(/\\/g, "/");

  // Already a full URL — use as-is
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  const apiBase = API?.defaults?.baseURL || "http://localhost:5000/api";
  const backendBase = apiBase.replace(/\/api\/?$/, "").replace(/\/$/, "");

  // Extract just the filename — handles:
  //   "uploads/1234-file.png"  → "1234-file.png"
  //   "C:/Users/.../uploads/1234-file.png"  → "1234-file.png"
  //   "1234-file.png"  → "1234-file.png"
  const filename = normalized.split("/uploads/").pop().replace(/^\//, "");

  return `${backendBase}/uploads/${filename}`;
};

const getFileName = (path = "") => path.replace(/\\/g, "/").split("/").pop();
const getFileExt  = (f = "") => f.split(".").pop().toLowerCase();
const isImage     = (f) => ["jpg", "jpeg", "png", "gif", "webp"].includes(getFileExt(f));
const isPDF       = (f) => getFileExt(f) === "pdf";
const getFileIcon = (filename = "") => {
  const ext = getFileExt(filename);
  const icons = { pdf: "📄", doc: "📝", docx: "📝", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️", txt: "📋" };
  return icons[ext] || "📎";
};

const SINISTRE_TYPE_OPTIONS = ["sante", "voyage", "auto", "batiment"];
const getContractTypeLabel = (type = "") => getSinistreTypeLabel(type) || type || "Contrat";
const formatContractLabel = (contract) => {
  if (!contract) return "Contrat";
  if (contract.__fallback) {
    const shortId = contract?._id ? String(contract._id).slice(-6).toUpperCase() : "inconnu";
    return `Contrat actuel — ${shortId}`;
  }
  const typeLabel = getContractTypeLabel(contract.type);
  const number = contract.contractNumber || `CTR-${String(contract._id).slice(-6).toUpperCase()}`;
  const status = contract.status ? ` • ${contract.status}` : "";
  return `${typeLabel} — ${number}${status}`;
};

const downloadWithAuth = async (fileUrl, filename) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(getFileUrl(fileUrl), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob    = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link    = document.createElement("a");
    link.href     = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert("Impossible de télécharger le fichier : " + err.message);
  }
};

export default function MonSinistre() {
  const { user } = useContext(AuthContext);
  const canManage = ["admin", "gestionnaire"].includes(user?.role);

  const [sinistres, setSinistres] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSinistre, setSelectedSinistre] = useState(null);

  // Preview state
  const [previewUpload,  setPreviewUpload]  = useState(null);
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    cinNumber: "",
    email: "",
    sinistreType: "",
    contractId: "",
    description: "",
    date: "",
    gsm: "",
    immatriculation: "",
    files: {
      attestationTiers: null,
      constat: null,
      photoVehicule: null
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUser, setFilterUser] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  // Load authenticated blob URL whenever previewUpload changes
  useEffect(() => {
    if (!previewUpload) { setPreviewUrl(null); return; }
    let objectUrl = null;
    setPreviewLoading(true);
    setPreviewUrl(null);
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(getFileUrl(previewUpload.fileUrl), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        objectUrl  = window.URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (err) {
        console.error("Preview error:", err);
        setPreviewUrl(null);
      } finally {
        setPreviewLoading(false);
      }
    })();
    return () => { if (objectUrl) window.URL.revokeObjectURL(objectUrl); };
  }, [previewUpload]);

  const fetchData = async () => {
    try {
      const claimsRes = await API.get("/claims");
      const onlySinistres = (claimsRes.data || []).filter((item) => {
        if (item?.sinistreType) return true;

        // Fallback for older or partially migrated records that still represent a sinistre.
        return Boolean(
          item?.fullName ||
          item?.cinNumber ||
          item?.gsm ||
          item?.immatriculation ||
          item?.files?.attestationTiers ||
          item?.files?.constat ||
          item?.files?.photoVehicule
        );
      });
      setSinistres(onlySinistres);

      const [docsResult, contractsResult] = await Promise.allSettled([
        API.get("/documents"),
        API.get("/contracts")
      ]);

      if (docsResult.status === "fulfilled") {
        setDocuments(docsResult.value.data || []);
      } else {
        console.error("Error fetching linked documents:", docsResult.reason);
        setDocuments([]);
      }

      if (contractsResult.status === "fulfilled") {
        setContracts(contractsResult.value.data || []);
      } else {
        console.error("Error fetching contracts:", contractsResult.reason);
        setContracts([]);
      }
    } catch (error) {
      console.error("Error fetching sinistres:", error);
    } finally {
      setLoading(false);
    }
  };

  const contractOptions = useMemo(() => {
    const options = (contracts || []).filter((c) => c?._id);
    const hasCurrent = editForm.contractId && options.some((c) => c._id === editForm.contractId);
    if (editForm.contractId && !hasCurrent) {
      return [{ _id: editForm.contractId, __fallback: true }, ...options];
    }
    return options;
  }, [contracts, editForm.contractId]);

  const documentsByClaimId = useMemo(() => {
    const map = new Map();
    (documents || []).forEach((doc) => {
      const claimId = typeof doc.claimId === "object" ? doc.claimId?._id : doc.claimId;
      if (!claimId) return;
      if (!map.has(claimId)) map.set(claimId, []);
      map.get(claimId).push(doc);
    });
    return map;
  }, [documents]);

  const filteredSinistres = sinistres.filter((sinistre) => {
    const matchesSearch =
      (sinistre.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistre._id.toString().includes(searchTerm);
    const matchesFilter = filterStatus === "all" || sinistre.status === filterStatus;
    const sinistreUserId = typeof sinistre.userId === "object" ? sinistre.userId._id : sinistre.userId;
    const matchesUser = filterUser === "all" || sinistreUserId === filterUser;
    return matchesSearch && matchesFilter && matchesUser;
  });

  const uniqueUsers = [
    ...new Map(
      sinistres
        .filter((s) => s.userId && typeof s.userId === "object")
        .map((s) => [s.userId._id, s.userId])
    ).values()
  ];

  const getClaimUploads = (sinistre) => {
    const uploads = [];
    const seenUrls = new Set();
    const addUpload = (upload) => {
      const normalizedUrl = (upload.fileUrl || "").replace(/\\/g, "/");
      if (!normalizedUrl || seenUrls.has(normalizedUrl)) return;
      seenUrls.add(normalizedUrl);
      uploads.push(upload);
    };

    if (sinistre?.files?.attestationTiers) {
      addUpload({
        id: `${sinistre._id}-attestation`,
        label: "Attestation du tiers",
        type: "Sinistre",
        fileUrl: sinistre.files.attestationTiers
      });
    }
    if (sinistre?.files?.constat) {
      addUpload({
        id: `${sinistre._id}-constat`,
        label: "Copie du constat",
        type: "Sinistre",
        fileUrl: sinistre.files.constat
      });
    }
    if (sinistre?.files?.photoVehicule) {
      addUpload({
        id: `${sinistre._id}-photo`,
        label: "Photo du véhicule",
        type: "Sinistre",
        fileUrl: sinistre.files.photoVehicule
      });
    }

    const linkedDocs = documentsByClaimId.get(sinistre._id) || [];
    linkedDocs.forEach((doc) => {
      addUpload({
        id: doc._id,
        label: doc.type || "Document lié",
        type: "Document",
        fileUrl: doc.fileUrl,
        createdAt: doc.createdAt
      });
    });

    return uploads;
  };

  const canEditSinistre = (sinistre) => {
    const sinistreUserId = typeof sinistre.userId === "object" ? sinistre.userId?._id : sinistre.userId;
    const isOwner = sinistreUserId === user?._id;
    return !canManage && isOwner;
  };

  const canDeleteSinistre = (sinistre) => {
    const sinistreUserId = typeof sinistre.userId === "object" ? sinistre.userId?._id : sinistre.userId;
    const isOwner = sinistreUserId === user?._id;
    return !canManage && isOwner;
  };

  const handleStatusUpdate = async (sinistreId, status) => {
    try {
      const res = await API.patch(`/claims/${sinistreId}/status`, { status });
      setSinistres((prev) => prev.map((s) => (s._id === sinistreId ? res.data : s)));
      if (selectedSinistre?._id === sinistreId) {
        setSelectedSinistre(res.data);
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut: " + (error.response?.data?.message || "Erreur"));
    }
  };

  const handleDeleteSinistre = async (sinistreId) => {
    if (!window.confirm("Supprimer ce sinistre ?")) return;
    try {
      await API.delete(`/claims/${sinistreId}`);
      setSinistres((prev) => prev.filter((s) => s._id !== sinistreId));
      if (selectedSinistre?._id === sinistreId) {
        setSelectedSinistre(null);
        setShowDetailModal(false);
      }
    } catch (error) {
      alert("Erreur lors de la suppression: " + (error.response?.data?.message || "Erreur"));
    }
  };

  const openEditModal = (sinistre) => {
    setSelectedSinistre(sinistre);
    setEditForm({
      fullName: sinistre.fullName || "",
      cinNumber: sinistre.cinNumber || "",
      email: sinistre.email || "",
      sinistreType: sinistre.sinistreType || "",
      contractId: typeof sinistre.contractId === "object" ? sinistre.contractId?._id : (sinistre.contractId || ""),
      description: sinistre.description || "",
      date: sinistre.date ? new Date(sinistre.date).toISOString().split("T")[0] : "",
      gsm: sinistre.gsm || "",
      immatriculation: sinistre.immatriculation || "",
      files: {
        attestationTiers: null,
        constat: null,
        photoVehicule: null
      }
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSinistre) return;
    if (!editForm.contractId) {
      alert("Veuillez choisir un contrat.");
      return;
    }

    try {
      setSavingEdit(true);
      const payload = new FormData();
      payload.append("fullName", editForm.fullName || "");
      payload.append("cinNumber", editForm.cinNumber || "");
      payload.append("email", editForm.email || "");
      if (editForm.sinistreType) {
        payload.append("sinistreType", editForm.sinistreType);
      }
      payload.append("contractId", editForm.contractId);
      payload.append("description", editForm.description);
      payload.append("date", editForm.date);
      payload.append("gsm", editForm.gsm || "");
      payload.append("immatriculation", editForm.immatriculation || "");

      if (editForm.files.attestationTiers) {
        payload.append("attestationTiers", editForm.files.attestationTiers);
      }
      if (editForm.files.constat) {
        payload.append("constat", editForm.files.constat);
      }
      if (editForm.files.photoVehicule) {
        payload.append("photoVehicule", editForm.files.photoVehicule);
      }

      const res = await API.patch(`/claims/${selectedSinistre._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSinistres((prev) => prev.map((s) => (s._id === selectedSinistre._id ? res.data : s)));
      setSelectedSinistre(res.data);
      setShowEditModal(false);
      await fetchData();
      alert("Déclaration modifiée avec succès.");
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de la modification.");
    } finally {
      setSavingEdit(false);
    }
  };

  const showImmatriculationField = editForm.sinistreType === "auto" || Boolean(editForm.immatriculation);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">Chargement des sinistres...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon Sinistre</h1>
            <p className="text-gray-600 mt-1">Suivez vos sinistres, leurs détails et leurs uploads</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Rechercher par description ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="en attente">En attente</option>
              <option value="accepté">Accepté</option>
              <option value="refusé">Refusé</option>
            </select>
            {canManage && (
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">Tous les utilisateurs</option>
                {uniqueUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSinistres.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Aucun sinistre trouvé</p>
            </div>
          ) : (
            filteredSinistres.map((sinistre) => {
              const uploadCount = getClaimUploads(sinistre).length;
              const showDeleteAction = canManage || canEditSinistre(sinistre);
              const canDeleteAction = canManage || canDeleteSinistre(sinistre);
              return (
                <div
                  key={sinistre._id}
                  className="h-full bg-white rounded-lg shadow-md p-6 border-l-4 border-l-red-500 hover:shadow-lg cursor-pointer transition-all"
                  onClick={() => {
                    setSelectedSinistre(sinistre);
                    setShowDetailModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">Sinistre #{sinistre._id.slice(-6)}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f7f2] text-[#00664d]">
                          {getSinistreTypeLabel(sinistre.sinistreType)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(sinistre.status)}`}>
                          {sinistre.status === "en attente" ? "En attente" : sinistre.status === "accepté" ? "Accepté" : "Refusé"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {uploadCount} upload(s)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{truncateText(sinistre.description, 80)}</p>
                      {canManage && sinistre.userId && typeof sinistre.userId === "object" && (
                        <p className="text-xs text-[#1a365d] mb-1">Utilisateur: {sinistre.userId.name} ({sinistre.userId.email})</p>
                      )}
                      <p className="text-xs text-gray-500">Soumis le {formatDate(sinistre.date)}</p>
                      {canManage && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(sinistre._id, "accepté");
                            }}
                            disabled={sinistre.status === "accepté"}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              sinistre.status === "accepté"
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            Accepter
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(sinistre._id, "refusé");
                            }}
                            disabled={sinistre.status === "refusé"}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              sinistre.status === "refusé"
                                ? "bg-red-100 text-red-700 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700"
                            }`}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      {canEditSinistre(sinistre) && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(sinistre);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00a67e] text-white hover:bg-[#008b69] transition-colors"
                          >
                            Modifier
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {showDeleteAction && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canDeleteAction) {
                              handleDeleteSinistre(sinistre._id);
                            }
                          }}
                          disabled={!canDeleteAction}
                          className={`p-2 rounded-full transition-colors ${
                            canDeleteAction
                              ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                              : "text-red-300 bg-red-50 cursor-not-allowed"
                          }`}
                          title={canDeleteAction ? "Supprimer ce sinistre" : "Suppression possible uniquement si en attente"}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      <div className="text-3xl">🚨</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showDetailModal && selectedSinistre && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900">Détails du sinistre</h2>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">ID du sinistre</p>
                  <p className="font-semibold text-gray-900">{selectedSinistre._id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Type de sinistre</p>
                  <p className="font-semibold text-gray-900">{getSinistreTypeLabel(selectedSinistre.sinistreType)}</p>
                </div>
                {selectedSinistre.fullName && (
                  <div>
                    <p className="text-gray-600 text-sm">Nom</p>
                    <p className="font-semibold text-gray-900">{selectedSinistre.fullName}</p>
                  </div>
                )}
                {selectedSinistre.gsm && (
                  <div>
                    <p className="text-gray-600 text-sm">GSM</p>
                    <p className="font-semibold text-gray-900">{selectedSinistre.gsm}</p>
                  </div>
                )}
                {selectedSinistre.immatriculation && (
                  <div>
                    <p className="text-gray-600 text-sm">Immatriculation</p>
                    <p className="font-semibold text-gray-900">{selectedSinistre.immatriculation}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="font-semibold text-gray-900">{selectedSinistre.description}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Statut</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(selectedSinistre.status)}`}>
                    {selectedSinistre.status === "en attente" ? "En attente" : selectedSinistre.status === "accepté" ? "Accepté" : "Refusé"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Date de soumission</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedSinistre.date)}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Uploads du sinistre</h3>
                {getClaimUploads(selectedSinistre).length === 0 ? (
                  <p className="text-sm text-gray-600">Aucun upload pour ce sinistre.</p>
                ) : (
                  <div className="space-y-2">
                    {getClaimUploads(selectedSinistre).map((upload) => (
                      <button
                        key={upload.id}
                        onClick={() => setPreviewUpload(upload)}
                        className="w-full flex items-center gap-3 p-3 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-left"
                      >
                        <span className="text-xl shrink-0">{getFileIcon(getFileName(upload.fileUrl))}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-blue-700 truncate">{upload.label}</p>
                          <p className="text-xs text-gray-500">{getFileName(upload.fileUrl)}{upload.createdAt ? ` • ${formatDate(upload.createdAt)}` : ""}</p>
                        </div>
                        <span className="ml-auto text-xs font-semibold text-blue-600 shrink-0">👁️ Aperçu</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {canManage && (
                <div className="flex gap-2">
                  <select
                    value={selectedSinistre.status}
                    onChange={(e) => handleStatusUpdate(selectedSinistre._id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="en attente">En attente</option>
                    <option value="accepté">Accepté</option>
                    <option value="refusé">Refusé</option>
                  </select>
                  <button
                    onClick={() => handleDeleteSinistre(selectedSinistre._id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Supprimer
                  </button>
                </div>
              )}

              {canDeleteSinistre(selectedSinistre) && (
                <button
                  onClick={() => handleDeleteSinistre(selectedSinistre._id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  <span className="text-lg">🗑️</span>
                  Supprimer ma declaration
                </button>
              )}

              {canEditSinistre(selectedSinistre) && (
                <button
                  onClick={() => openEditModal(selectedSinistre)}
                  className="w-full bg-[#00a67e] hover:bg-[#008b69] text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Modifier ma déclaration
                </button>
              )}

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSinistre(null);
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* ── File Preview Modal ── */}
        {previewUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden" style={{ height: "90vh" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{getFileIcon(getFileName(previewUpload.fileUrl))}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate max-w-xs md:max-w-md">{previewUpload.label}</p>
                    <p className="text-xs text-gray-500 truncate">{getFileName(previewUpload.fileUrl)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => downloadWithAuth(previewUpload.fileUrl, getFileName(previewUpload.fileUrl))}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-all"
                  >
                    📥 Télécharger
                  </button>
                  <button
                    onClick={() => { setPreviewUpload(null); setPreviewUrl(null); }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-4 rounded-lg transition-all"
                  >
                    ✕ Fermer
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden bg-gray-100">
                {previewLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                      <p className="mt-2 text-gray-500 text-sm">Chargement de l'aperçu...</p>
                    </div>
                  </div>
                ) : !previewUrl ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                    <span className="text-6xl">⚠️</span>
                    <p className="text-red-500 font-semibold">Impossible de charger l'aperçu.</p>
                    <button
                      onClick={() => downloadWithAuth(previewUpload.fileUrl, getFileName(previewUpload.fileUrl))}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                    >
                      📥 Télécharger à la place
                    </button>
                  </div>
                ) : isImage(getFileName(previewUpload.fileUrl)) ? (
                  <div className="flex items-center justify-center h-full p-6">
                    <img
                      src={previewUrl}
                      alt={previewUpload.label}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                    />
                  </div>
                ) : isPDF(getFileName(previewUpload.fileUrl)) ? (
                  <iframe
                    src={getFileUrl(previewUpload.fileUrl)}
                    title="Aperçu PDF"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 p-8">
                    <span className="text-7xl">{getFileIcon(getFileName(previewUpload.fileUrl))}</span>
                    <p className="text-lg font-semibold text-gray-700">Aperçu non disponible pour ce format</p>
                    <p className="text-sm text-gray-500">Téléchargez le fichier pour le visualiser.</p>
                    <button
                      onClick={() => downloadWithAuth(previewUpload.fileUrl, getFileName(previewUpload.fileUrl))}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                    >
                      📥 Télécharger le fichier
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showEditModal && selectedSinistre && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[92vh] flex flex-col">
              <div className="bg-gradient-to-r from-[#0f2744] to-[#1a365d] px-6 py-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200/80">Modification du sinistre</p>
                <h2 className="text-2xl font-bold mt-1">Mettre à jour la déclaration</h2>
                <p className="text-sm text-blue-100/80 mt-2">Modifiez les informations principales et remplacez les fichiers si nécessaire.</p>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Type de sinistre</label>
                    <select
                      value={editForm.sinistreType}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, sinistreType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e] bg-white"
                    >
                      <option value="">— Choisir un type —</option>
                      {SINISTRE_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {getSinistreTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e] bg-white"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Contrat concerné</label>
                  <select
                    required
                    value={editForm.contractId}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, contractId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e] bg-white"
                  >
                    <option value="">— Choisir un contrat —</option>
                    {contractOptions.map((contract) => (
                      <option key={contract._id} value={contract._id}>
                        {formatContractLabel(contract)}
                      </option>
                    ))}
                  </select>
                  {contracts.length === 0 && editForm.contractId && (
                    <p className="text-xs text-amber-700 mt-2">Contrat actuel conservé (liste indisponible).</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Nom</label>
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e] bg-white"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">CIN</label>
                    <input
                      type="text"
                      value={editForm.cinNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, cinNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e] bg-white"
                    />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">GSM</label>
                    <input
                      type="text"
                      value={editForm.gsm}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, gsm: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e] bg-white"
                    />
                  </div>
                </div>

                {showImmatriculationField && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Immatriculation</label>
                    <input
                      type="text"
                      value={editForm.immatriculation}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, immatriculation: e.target.value.toUpperCase() }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e] bg-white"
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <textarea
                    rows={5}
                    required
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "attestationTiers", label: "Attestation du tiers", accept: ".pdf,.jpg,.jpeg,.png" },
                    { key: "constat", label: "Constat", accept: ".pdf,.jpg,.jpeg,.png" },
                    { key: "photoVehicule", label: "Photo du véhicule", accept: ".jpg,.jpeg,.png,.pdf" }
                  ].map((fileField) => (
                    <div key={fileField.key} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">{fileField.label}</p>
                      <input
                        type="file"
                        accept={fileField.accept}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            files: { ...prev.files, [fileField.key]: e.target.files?.[0] || null }
                          }))
                        }
                        className="w-full text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {editForm.files[fileField.key] ? `Nouveau fichier: ${editForm.files[fileField.key].name}` : "Aucun nouveau fichier choisi"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-6 py-3 rounded-xl bg-[#00a67e] hover:bg-[#008b69] disabled:opacity-60 text-white font-semibold transition-all"
                  >
                    {savingEdit ? "Enregistrement..." : "Enregistrer les modifications"}
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
