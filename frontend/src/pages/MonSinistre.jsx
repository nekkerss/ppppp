import { useContext, useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, getStatusBadgeColor, truncateText, getSinistreTypeLabel, getVoyageSubTypeLabel, getSanteSubTypeLabel, getBatimentSubTypeLabel } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";
import { Car, Heart, Home, Plane, AlertTriangle, Calendar, FileText, Pencil, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";

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
const getCleanFileName = (path = "") => getFileName(path).replace(/^\d+-/, "");
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
    voyageSubType: "",
    santeSubType: "",
    batimentSubType: "",
    numeroPoliceBatiment: "",
    contractId: "",
    description: "",
    date: "",
    gsm: "",
    immatriculation: "",
    files: {
      attestationTiers: null,
      constat: null,
      photoVehicule: null,
      cinPasseport: null,
      policeAssurance: null,
      billetsAvion: null,
      preuveReservation: null,
      feuilleSoins: null,
      rapportMedical: null,
      facturesOriginales: null,
      facturesPharmacie: null,
      resultatsAnalyses: null,
      prescription: null,
      bulletinHospitalisation: null,
      factureClinic: null,
      compteRenduHospitalisation: null,
      carteIdentiteBatiment: null,
      contratAssuranceHabitation: null,
      declarationEcriteBatiment: null,
      photosDegats: null,
      listeBiensDommages: null,
      constatAmiableEaux: null,
      coordonneesImpliques: null,
      rapportProtectionCivile: null,
      preuveIntervention: null,
      rapportExpert: null,
      titrePropriete: null
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSinistreType, setFilterSinistreType] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");

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
      sinistre._id.toString().includes(searchTerm) ||
      (sinistre.fullName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || sinistre.status === filterStatus;
    const matchesType   = filterSinistreType === "all" || sinistre.sinistreType === filterSinistreType;
    const sinistreUserId = typeof sinistre.userId === "object" ? sinistre.userId._id : sinistre.userId;
    const matchesUser = filterUser === "all" || sinistreUserId === filterUser;
    const d = sinistre.date ? new Date(sinistre.date) : null;
    const matchesFrom = !dateFrom || (d && d >= new Date(dateFrom));
    const matchesTo   = !dateTo   || (d && d <= new Date(dateTo + "T23:59:59"));
    return matchesSearch && matchesStatus && matchesType && matchesUser && matchesFrom && matchesTo;
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
    if (sinistre?.files?.cinPasseport) {
      addUpload({
        id: `${sinistre._id}-cinPasseport`,
        label: "CIN / Passeport",
        type: "Sinistre",
        fileUrl: sinistre.files.cinPasseport
      });
    }
    if (sinistre?.files?.policeAssurance) {
      addUpload({
        id: `${sinistre._id}-policeAssurance`,
        label: "Police d'assurance voyage",
        type: "Sinistre",
        fileUrl: sinistre.files.policeAssurance
      });
    }
    if (sinistre?.files?.billetsAvion) {
      addUpload({
        id: `${sinistre._id}-billetsAvion`,
        label: "Billets d'avion + carte d'embarquement",
        type: "Sinistre",
        fileUrl: sinistre.files.billetsAvion
      });
    }
    if (sinistre?.files?.preuveReservation) {
      addUpload({
        id: `${sinistre._id}-preuveReservation`,
        label: "Preuve de réservation",
        type: "Sinistre",
        fileUrl: sinistre.files.preuveReservation
      });
    }

    const SANTE_FILES = [
      { key: "feuilleSoins",              label: "Feuille de soins" },
      { key: "rapportMedical",            label: "Rapport / certificat médical" },
      { key: "facturesOriginales",        label: "Factures originales" },
      { key: "facturesPharmacie",         label: "Factures de pharmacie" },
      { key: "resultatsAnalyses",         label: "Résultats d'analyses / radios / scanner" },
      { key: "prescription",              label: "Prescription correspondante" },
      { key: "bulletinHospitalisation",   label: "Bulletin d'hospitalisation" },
      { key: "factureClinic",             label: "Facture de la clinique / hôpital" },
      { key: "compteRenduHospitalisation",label: "Compte rendu d'hospitalisation" }
    ];
    SANTE_FILES.forEach(({ key, label }) => {
      if (sinistre?.files?.[key]) {
        addUpload({ id: `${sinistre._id}-${key}`, label, type: "Sinistre", fileUrl: sinistre.files[key] });
      }
    });

    const BATIMENT_FILES = [
      { key: "carteIdentiteBatiment",      label: "Carte d'identité" },
      { key: "contratAssuranceHabitation", label: "Contrat d'assurance habitation" },
      { key: "declarationEcriteBatiment",  label: "Déclaration écrite du sinistre" },
      { key: "photosDegats",               label: "Photos des dégâts" },
      { key: "listeBiensDommages",          label: "Liste des biens endommagés" },
      { key: "constatAmiableEaux",          label: "Constat amiable dégâts des eaux" },
      { key: "coordonneesImpliques",        label: "Coordonnées des personnes impliquées" },
      { key: "rapportProtectionCivile",     label: "Rapport protection civile / police" },
      { key: "preuveIntervention",          label: "Preuve de l'intervention" },
      { key: "rapportExpert",               label: "Rapport d'expert" },
      { key: "titrePropriete",              label: "Titre de propriété / contrat de location" }
    ];
    BATIMENT_FILES.forEach(({ key, label }) => {
      if (sinistre?.files?.[key]) {
        addUpload({ id: `${sinistre._id}-${key}`, label, type: "Sinistre", fileUrl: sinistre.files[key] });
      }
    });

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
      voyageSubType: sinistre.voyageSubType || "",
      santeSubType: sinistre.santeSubType || "",
      batimentSubType: sinistre.batimentSubType || "",
      numeroPoliceBatiment: sinistre.numeroPoliceBatiment || "",
      contractId: typeof sinistre.contractId === "object" ? sinistre.contractId?._id : (sinistre.contractId || ""),
      description: sinistre.description || "",
      date: sinistre.date ? new Date(sinistre.date).toISOString().split("T")[0] : "",
      gsm: sinistre.gsm || "",
      immatriculation: sinistre.immatriculation || "",
      files: {
        attestationTiers: null,
        constat: null,
        photoVehicule: null,
        cinPasseport: null,
        policeAssurance: null,
        billetsAvion: null,
        preuveReservation: null,
        feuilleSoins: null,
        rapportMedical: null,
        facturesOriginales: null,
        facturesPharmacie: null,
        resultatsAnalyses: null,
        prescription: null,
        bulletinHospitalisation: null,
        factureClinic: null,
        compteRenduHospitalisation: null,
        carteIdentiteBatiment: null,
        contratAssuranceHabitation: null,
        declarationEcriteBatiment: null,
        photosDegats: null,
        listeBiensDommages: null,
        constatAmiableEaux: null,
        coordonneesImpliques: null,
        rapportProtectionCivile: null,
        preuveIntervention: null,
        rapportExpert: null,
        titrePropriete: null
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
      if (editForm.sinistreType === "voyage" && editForm.voyageSubType) {
        payload.append("voyageSubType", editForm.voyageSubType);
      }
      if (editForm.sinistreType === "sante" && editForm.santeSubType) {
        payload.append("santeSubType", editForm.santeSubType);
      }
      if (editForm.sinistreType === "batiment") {
        if (editForm.batimentSubType) payload.append("batimentSubType", editForm.batimentSubType);
        if (editForm.numeroPoliceBatiment) payload.append("numeroPoliceBatiment", editForm.numeroPoliceBatiment);
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
      if (editForm.files.cinPasseport) {
        payload.append("cinPasseport", editForm.files.cinPasseport);
      }
      if (editForm.files.policeAssurance) {
        payload.append("policeAssurance", editForm.files.policeAssurance);
      }
      if (editForm.files.billetsAvion) {
        payload.append("billetsAvion", editForm.files.billetsAvion);
      }
      if (editForm.files.preuveReservation) {
        payload.append("preuveReservation", editForm.files.preuveReservation);
      }
      const SANTE_KEYS = [
        "feuilleSoins","rapportMedical","facturesOriginales",
        "facturesPharmacie","resultatsAnalyses","prescription",
        "bulletinHospitalisation","factureClinic","compteRenduHospitalisation"
      ];
      SANTE_KEYS.forEach((k) => {
        if (editForm.files[k]) payload.append(k, editForm.files[k]);
      });
      const BATIMENT_KEYS = [
        "carteIdentiteBatiment","contratAssuranceHabitation","declarationEcriteBatiment",
        "photosDegats","listeBiensDommages","constatAmiableEaux","coordonneesImpliques",
        "rapportProtectionCivile","preuveIntervention","rapportExpert","titrePropriete"
      ];
      BATIMENT_KEYS.forEach((k) => {
        if (editForm.files[k]) payload.append(k, editForm.files[k]);
      });

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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select value={filterSinistreType} onChange={(e) => setFilterSinistreType(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-gray-700">
              <option value="all">Tous les types</option>
              <option value="sante">Santé</option>
              <option value="auto">Auto</option>
              <option value="batiment">Bâtiment</option>
              <option value="voyage">Voyage</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-gray-700">
              <option value="all">Tous les statuts</option>
              <option value="en attente">En attente</option>
              <option value="accepté">Accepté</option>
              <option value="refusé">Refusé</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Du</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-400 whitespace-nowrap">Au</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all" />
            </div>
          </div>
          {canManage && (
            <div className="mt-3">
              <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}
                className="w-full sm:w-72 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-gray-700">
                <option value="all">Tous les utilisateurs</option>
                {uniqueUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          )}
          {(filterStatus !== "all" || filterSinistreType !== "all" || dateFrom || dateTo || filterUser !== "all") && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">{filteredSinistres.length} sinistre{filteredSinistres.length !== 1 ? "s" : ""} trouvé{filteredSinistres.length !== 1 ? "s" : ""}</p>
              <button onClick={() => { setFilterStatus("all"); setFilterSinistreType("all"); setDateFrom(""); setDateTo(""); setFilterUser("all"); }}
                className="text-xs font-semibold text-[#00a67e] hover:underline">Réinitialiser les filtres</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSinistres.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 font-medium">Aucun sinistre trouvé</p>
            </div>
          ) : (
            filteredSinistres.map((sinistre) => {
              const uploadCount = getClaimUploads(sinistre).length;
              const canDeleteAction = canManage || canDeleteSinistre(sinistre);

              const typeConfig = {
                auto:     { Icon: Car,           gradient: "from-orange-500 to-red-600",     light: "bg-orange-50",  text: "text-orange-600" },
                sante:    { Icon: Heart,          gradient: "from-rose-500 to-pink-600",      light: "bg-rose-50",    text: "text-rose-600" },
                voyage:   { Icon: Plane,          gradient: "from-sky-500 to-blue-600",       light: "bg-sky-50",     text: "text-sky-600" },
                batiment: { Icon: Home,           gradient: "from-amber-500 to-orange-600",   light: "bg-amber-50",   text: "text-amber-600" },
              }[sinistre.sinistreType] || { Icon: AlertTriangle, gradient: "from-slate-500 to-slate-700", light: "bg-slate-50", text: "text-slate-600" };

              const { Icon } = typeConfig;

              const statusConfig = {
                "en attente": { label: "En attente",  Icon: Clock,        cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
                "accepté":    { label: "Accepté",     Icon: CheckCircle,  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
                "refusé":     { label: "Refusé",      Icon: XCircle,      cls: "bg-red-100 text-red-700 border-red-200" },
              }[sinistre.status] || { label: sinistre.status, Icon: Clock, cls: "bg-gray-100 text-gray-600 border-gray-200" };

              const StatusIcon = statusConfig.Icon;

              return (
                <div key={sinistre._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">

                  {/* Colored header */}
                  <div className={`bg-gradient-to-r ${typeConfig.gradient} p-5 flex items-center justify-between`}>
                    <div>
                      <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest mb-1">Sinistre BNA</p>
                      <h3 className="text-white font-bold text-base">{getSinistreTypeLabel(sinistre.sinistreType)}</h3>
                      <p className="text-white/60 text-xs mt-0.5">Réf. #{sinistre._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col gap-3">

                    {/* Status + uploads row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.cls}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                      {uploadCount > 0 && (
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${typeConfig.light} ${typeConfig.text}`}>
                          <FileText className="w-3 h-3" /> {uploadCount} fichier{uploadCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {sinistre.description || "Aucune description"}
                    </p>

                    {/* Rejection reason */}
                    {sinistre.status === "refusé" && sinistre.rejectionReason && (
                      <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                        <span className="font-semibold">Motif :</span> {sinistre.rejectionReason}
                      </div>
                    )}

                    {/* User info (gestionnaire/admin only) */}
                    {canManage && sinistre.userId && typeof sinistre.userId === "object" && (
                      <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                        {sinistre.userId.name} — {sinistre.userId.email}
                      </p>
                    )}

                    {/* Date */}
                    <div className={`flex items-center gap-2 ${typeConfig.light} rounded-xl px-3 py-2`}>
                      <Calendar className={`w-3.5 h-3.5 shrink-0 ${typeConfig.text}`} />
                      <p className={`text-xs font-semibold ${typeConfig.text}`}>Soumis le {formatDate(sinistre.date)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto pt-1">
                      <button
                        onClick={() => { setSelectedSinistre(sinistre); setShowDetailModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> Détails
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(sinistre._id, "accepté"); }}
                            disabled={sinistre.status === "accepté"}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            title="Accepter"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(sinistre._id, "refusé"); }}
                            disabled={sinistre.status === "refusé"}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            title="Refuser"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {canEditSinistre(sinistre) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(sinistre); }}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {canDeleteAction && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteSinistre(sinistre._id); }}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-all"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showDetailModal && selectedSinistre && (() => {
          const tc = {
            auto:     { Icon: Car,           gradient: "from-orange-500 to-red-600",   light: "bg-orange-50",  border: "border-orange-200", text: "text-orange-600" },
            sante:    { Icon: Heart,          gradient: "from-rose-500 to-pink-600",    light: "bg-rose-50",    border: "border-rose-200",   text: "text-rose-600" },
            voyage:   { Icon: Plane,          gradient: "from-sky-500 to-blue-600",     light: "bg-sky-50",     border: "border-sky-200",    text: "text-sky-600" },
            batiment: { Icon: Home,           gradient: "from-amber-500 to-orange-600", light: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-600" },
          }[selectedSinistre.sinistreType] || { Icon: AlertTriangle, gradient: "from-slate-500 to-slate-700", light: "bg-slate-50", border: "border-slate-200", text: "text-slate-600" };
          const TypeIcon = tc.Icon;
          const uploads = getClaimUploads(selectedSinistre);
          const sc = {
            "en attente": { label: "En attente",  Icon: Clock,        cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
            "accepté":    { label: "Accepté",     Icon: CheckCircle,  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
            "refusé":     { label: "Refusé",      Icon: XCircle,      cls: "bg-red-100 text-red-700 border-red-200" },
          }[selectedSinistre.status] || { label: selectedSinistre.status, Icon: Clock, cls: "bg-gray-100 text-gray-600 border-gray-200" };
          const StatusIcon = sc.Icon;

          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className={`bg-gradient-to-r ${tc.gradient} p-6 shrink-0`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                        <TypeIcon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Déclaration de sinistre</p>
                        <h2 className="text-white font-bold text-xl">{getSinistreTypeLabel(selectedSinistre.sinistreType)}</h2>
                        <p className="text-white/60 text-sm mt-0.5">Réf. #{selectedSinistre._id.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowDetailModal(false); setSelectedSinistre(null); }}
                      className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all shrink-0"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status pill in header */}
                  <div className="mt-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-white/15 text-white border-white/30`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {sc.label}
                    </span>
                  </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                  {/* Rejection banner */}
                  {selectedSinistre.status === "refusé" && selectedSinistre.rejectionReason && (
                    <div className="flex gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-700 mb-0.5">Motif de refus</p>
                        <p className="text-sm text-red-600">{selectedSinistre.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Info grid */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Informations</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Type", value: getSinistreTypeLabel(selectedSinistre.sinistreType) },
                        { label: "Date", value: formatDate(selectedSinistre.date) },
                        selectedSinistre.fullName   && { label: "Nom",              value: selectedSinistre.fullName },
                        selectedSinistre.gsm        && { label: "GSM",              value: selectedSinistre.gsm },
                        selectedSinistre.immatriculation && { label: "Immatriculation", value: selectedSinistre.immatriculation },
                        selectedSinistre.sinistreType === "voyage" && selectedSinistre.voyageSubType   && { label: "Sous-type", value: getVoyageSubTypeLabel(selectedSinistre.voyageSubType) },
                        selectedSinistre.sinistreType === "sante"  && selectedSinistre.santeSubType    && { label: "Sous-type", value: getSanteSubTypeLabel(selectedSinistre.santeSubType) },
                        selectedSinistre.sinistreType === "batiment" && selectedSinistre.batimentSubType && { label: "Sous-type", value: getBatimentSubTypeLabel(selectedSinistre.batimentSubType) },
                        selectedSinistre.numeroPoliceBatiment && { label: "N° police", value: selectedSinistre.numeroPoliceBatiment },
                        canManage && selectedSinistre.userId && typeof selectedSinistre.userId === "object" && { label: "Client", value: `${selectedSinistre.userId.name} (${selectedSinistre.userId.email})` },
                      ].filter(Boolean).map((item, i) => (
                        <div key={i} className={`${tc.light} rounded-xl p-3`}>
                          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${tc.text}`}>{item.label}</p>
                          <p className="text-sm font-bold text-slate-800 truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Description</p>
                    <div className={`${tc.light} ${tc.border} border rounded-2xl p-4`}>
                      <p className="text-sm text-slate-700 leading-relaxed">{selectedSinistre.description}</p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Documents joints</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tc.light} ${tc.text}`}>{uploads.length} fichier{uploads.length !== 1 ? "s" : ""}</span>
                    </div>
                    {uploads.length === 0 ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                        <p className="text-sm text-slate-400">Aucun document joint</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {uploads.map((upload) => (
                          <button
                            key={upload.id}
                            onClick={() => setPreviewUpload(upload)}
                            className={`w-full flex items-center gap-3 p-3.5 bg-white border ${tc.border} rounded-xl hover:${tc.light} transition-all text-left group`}
                          >
                            <div className={`w-9 h-9 rounded-xl ${tc.light} flex items-center justify-center shrink-0 text-lg`}>
                              {getFileIcon(getFileName(upload.fileUrl))}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-semibold ${tc.text} truncate`}>{upload.label}</p>
                              <p className="text-xs text-slate-400 truncate">{getCleanFileName(upload.fileUrl)}</p>
                            </div>
                            <Eye className={`w-4 h-4 ${tc.text} opacity-0 group-hover:opacity-100 shrink-0 transition-opacity`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gestionnaire status change */}
                  {canManage && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Changer le statut</p>
                      <div className="flex gap-2">
                        {["en attente", "accepté", "refusé"].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(selectedSinistre._id, s)}
                            disabled={selectedSinistre.status === s}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                              s === "accepté" ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" :
                              s === "refusé"  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" :
                                               "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                            }`}
                          >
                            {s === "accepté" ? "✓ Accepter" : s === "refusé" ? "✗ Refuser" : "⏳ En attente"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div className="shrink-0 p-5 border-t border-slate-100 flex gap-3">
                  {canEditSinistre(selectedSinistre) && (
                    <button
                      onClick={() => openEditModal(selectedSinistre)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#00a67e] hover:bg-[#008b69] text-white text-sm font-bold rounded-xl transition-all"
                    >
                      <Pencil className="w-4 h-4" /> Modifier
                    </button>
                  )}
                  {(canManage || canDeleteSinistre(selectedSinistre)) && (
                    <button
                      onClick={() => handleDeleteSinistre(selectedSinistre._id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-all"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  )}
                  <button
                    onClick={() => { setShowDetailModal(false); setSelectedSinistre(null); }}
                    className="ml-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

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
                    <p className="text-xs text-gray-400 truncate">{getCleanFileName(previewUpload.fileUrl)}</p>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[92vh] flex flex-col">

              {/* Header */}
              <div className="bg-gradient-to-r from-[#0f2744] to-[#1a3a5c] px-7 py-6 text-white shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                      <Pencil className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-blue-200/70 mb-0.5">Modification</p>
                      <h2 className="text-xl font-bold text-white">Mettre à jour la déclaration</h2>
                      <p className="text-xs text-blue-200/60 mt-0.5">Réf. #{selectedSinistre._id.slice(-6).toUpperCase()} — {getSinistreTypeLabel(selectedSinistre.sinistreType)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all shrink-0 mt-0.5"
                  >✕</button>
                </div>
              </div>
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto">
                <div className="p-7 space-y-7">

                  {/* ── Section: Informations générales ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-[#0f2744] flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-[#0f2744] uppercase tracking-wider">Informations générales</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Type de sinistre</label>
                        <select
                          value={editForm.sinistreType}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, sinistreType: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-sm font-medium text-slate-800"
                        >
                          <option value="">— Choisir un type —</option>
                          {SINISTRE_TYPE_OPTIONS.map((type) => (
                            <option key={type} value={type}>{getSinistreTypeLabel(type)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Date du sinistre</label>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-sm font-medium text-slate-800"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Contrat concerné</label>
                        <select
                          required
                          value={editForm.contractId}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, contractId: e.target.value }))}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-sm font-medium text-slate-800"
                        >
                          <option value="">— Choisir un contrat —</option>
                          {contractOptions.map((c) => (
                            <option key={c._id} value={c._id}>{formatContractLabel(c)}</option>
                          ))}
                        </select>
                        {contracts.length === 0 && editForm.contractId && (
                          <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">⚠ Contrat actuel conservé (liste indisponible)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Section: Coordonnées ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-[#00a67e] flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">✦</span>
                      </div>
                      <p className="text-sm font-bold text-[#0f2744] uppercase tracking-wider">Coordonnées du déclarant</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "fullName",   label: "Nom complet",   type: "text",  val: editForm.fullName },
                        { key: "cinNumber",  label: "Numéro CIN",    type: "text",  val: editForm.cinNumber },
                        { key: "email",      label: "Email",         type: "email", val: editForm.email },
                        { key: "gsm",        label: "GSM",           type: "text",  val: editForm.gsm },
                      ].map(({ key, label, type, val }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
                          <input
                            type={type}
                            value={val}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-sm"
                          />
                        </div>
                      ))}
                      {showImmatriculationField && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Immatriculation</label>
                          <input
                            type="text"
                            value={editForm.immatriculation}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, immatriculation: e.target.value.toUpperCase() }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-sm font-mono tracking-widest"
                            placeholder="Ex: 123 TUN 4567"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Section: Description ── */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">✎</span>
                      </div>
                      <p className="text-sm font-bold text-[#0f2744] uppercase tracking-wider">Description</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez les circonstances du sinistre..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-sm resize-none"
                    />
                  </div>

                {/* Auto file fields */}
                {editForm.sinistreType === "auto" && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                        <Car className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-[#0f2744] uppercase tracking-wider">Documents Auto</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { key: "attestationTiers", label: "Attestation du tiers" },
                        { key: "constat",          label: "Constat amiable" },
                        { key: "photoVehicule",    label: "Photo du véhicule" }
                      ].map((f) => (
                        <div key={f.key} className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-4 flex flex-col gap-2">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                          {selectedSinistre?.files?.[f.key] && (
                            <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })}
                              className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-medium">
                              <Eye className="w-3 h-3" /> Voir fichier actuel
                            </button>
                          )}
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))}
                            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white hover:file:bg-[#1a3a5c] cursor-pointer" />
                          {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Santé file fields */}
                {editForm.sinistreType === "sante" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center shrink-0">
                        <Heart className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-[#0f2744] uppercase tracking-wider">Documents Santé</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Sous-type santé</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[{ id: "medicaments_examens", label: "Médicaments / Examens" }, { id: "hospitalisation", label: "Hospitalisation" }].map((opt) => (
                          <button key={opt.id} type="button" onClick={() => setEditForm((prev) => ({ ...prev, santeSubType: opt.id }))}
                            className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${editForm.santeSubType === opt.id ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50/40"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[{ key: "feuilleSoins", label: "Feuille de soins" }, { key: "rapportMedical", label: "Rapport médical" }, { key: "facturesOriginales", label: "Factures originales" }].map((f) => (
                        <div key={f.key} className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-4 flex flex-col gap-2">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                          {selectedSinistre?.files?.[f.key] && <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })} className="flex items-center gap-1.5 text-xs text-sky-600 font-medium"><Eye className="w-3 h-3" /> Voir actuel</button>}
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))} className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white cursor-pointer" />
                          {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                        </div>
                      ))}
                    </div>

                    {editForm.santeSubType === "medicaments_examens" && (
                      <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-4">
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-3">Médicaments / Examens</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[{ key: "facturesPharmacie", label: "Factures pharmacie" }, { key: "resultatsAnalyses", label: "Résultats d'analyses" }, { key: "prescription", label: "Prescription" }].map((f) => (
                            <div key={f.key} className="rounded-xl border-2 border-dashed border-rose-200 bg-white p-3 flex flex-col gap-2">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                              {selectedSinistre?.files?.[f.key] && <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })} className="flex items-center gap-1 text-xs text-sky-600 font-medium"><Eye className="w-3 h-3" /> Voir actuel</button>}
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white cursor-pointer" />
                              {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {editForm.santeSubType === "hospitalisation" && (
                      <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-4">
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-3">Hospitalisation</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[{ key: "bulletinHospitalisation", label: "Bulletin d'hospitalisation" }, { key: "factureClinic", label: "Facture clinique" }, { key: "compteRenduHospitalisation", label: "Compte rendu" }].map((f) => (
                            <div key={f.key} className="rounded-xl border-2 border-dashed border-rose-200 bg-white p-3 flex flex-col gap-2">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                              {selectedSinistre?.files?.[f.key] && <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })} className="flex items-center gap-1 text-xs text-sky-600 font-medium"><Eye className="w-3 h-3" /> Voir actuel</button>}
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white cursor-pointer" />
                              {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bâtiment file fields */}
                {editForm.sinistreType === "batiment" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                        <Home className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-[#0f2744] uppercase tracking-wider">Documents Bâtiment</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Sous-type bâtiment</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ id: "degats_eaux", label: "Dégâts des eaux" }, { id: "incendie", label: "Incendie" }, { id: "gros_sinistre", label: "Gros sinistre" }].map((opt) => (
                          <button key={opt.id} type="button" onClick={() => setEditForm((prev) => ({ ...prev, batimentSubType: opt.id }))}
                            className={`py-3 px-3 rounded-xl border-2 text-xs font-semibold transition-all text-center ${editForm.batimentSubType === opt.id ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-amber-50/40"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">N° de police d'assurance</label>
                      <input type="text" value={editForm.numeroPoliceBatiment} onChange={(e) => setEditForm((prev) => ({ ...prev, numeroPoliceBatiment: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-sm"
                        placeholder="Ex: POL-2024-XXXXXX" />
                    </div>

                    {[{ key: "carteIdentiteBatiment", label: "Carte d'identité" }, { key: "contratAssuranceHabitation", label: "Contrat assurance habitation" }, { key: "declarationEcriteBatiment", label: "Déclaration écrite" }, { key: "photosDegats", label: "Photos des dégâts" }, { key: "listeBiensDommages", label: "Liste biens endommagés" }].length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[{ key: "carteIdentiteBatiment", label: "Carte d'identité" }, { key: "contratAssuranceHabitation", label: "Contrat habitation" }, { key: "declarationEcriteBatiment", label: "Déclaration écrite" }, { key: "photosDegats", label: "Photos des dégâts" }, { key: "listeBiensDommages", label: "Liste biens endommagés" }].map((f) => (
                          <div key={f.key} className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 p-4 flex flex-col gap-2">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                            {selectedSinistre?.files?.[f.key] && <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })} className="flex items-center gap-1 text-xs text-sky-600 font-medium"><Eye className="w-3 h-3" /> Voir actuel</button>}
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))} className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white cursor-pointer" />
                            {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {editForm.batimentSubType === "degats_eaux" && (
                      <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3">Dégâts des eaux</p>
                        <div className="grid grid-cols-2 gap-4">
                          {[{ key: "constatAmiableEaux", label: "Constat amiable" }, { key: "coordonneesImpliques", label: "Coordonnées impliqués" }].map((f) => (
                            <div key={f.key} className="rounded-xl border-2 border-dashed border-amber-200 bg-white p-3 flex flex-col gap-2">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                              {selectedSinistre?.files?.[f.key] && <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })} className="flex items-center gap-1 text-xs text-sky-600 font-medium"><Eye className="w-3 h-3" /> Voir actuel</button>}
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white cursor-pointer" />
                              {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {editForm.batimentSubType === "incendie" && (
                      <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3">Incendie</p>
                        <div className="grid grid-cols-2 gap-4">
                          {[{ key: "rapportProtectionCivile", label: "Rapport protection civile" }, { key: "preuveIntervention", label: "Preuve d'intervention" }].map((f) => (
                            <div key={f.key} className="rounded-xl border-2 border-dashed border-amber-200 bg-white p-3 flex flex-col gap-2">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                              {selectedSinistre?.files?.[f.key] && <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })} className="flex items-center gap-1 text-xs text-sky-600 font-medium"><Eye className="w-3 h-3" /> Voir actuel</button>}
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white cursor-pointer" />
                              {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {editForm.batimentSubType === "gros_sinistre" && (
                      <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3">Gros sinistre</p>
                        <div className="grid grid-cols-2 gap-4">
                          {[{ key: "rapportExpert", label: "Rapport d'expert" }, { key: "titrePropriete", label: "Titre de propriété" }].map((f) => (
                            <div key={f.key} className="rounded-xl border-2 border-dashed border-amber-200 bg-white p-3 flex flex-col gap-2">
                              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                              {selectedSinistre?.files?.[f.key] && <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })} className="flex items-center gap-1 text-xs text-sky-600 font-medium"><Eye className="w-3 h-3" /> Voir actuel</button>}
                              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white cursor-pointer" />
                              {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Voyage file fields */}
                {editForm.sinistreType === "voyage" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center shrink-0">
                        <Plane className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm font-bold text-[#0f2744] uppercase tracking-wider">Documents Voyage</p>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Sous-type voyage</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[{ id: "medical_etranger", label: "Médical à l'étranger" }, { id: "retard_annulation_vol", label: "Retard / annulation" }, { id: "perte_vol_bagages", label: "Perte / vol bagages" }].map((opt) => (
                          <button key={opt.id} type="button" onClick={() => setEditForm((prev) => ({ ...prev, voyageSubType: opt.id }))}
                            className={`py-3 px-4 rounded-xl border-2 text-xs font-semibold transition-all text-center ${editForm.voyageSubType === opt.id ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-sky-50/40"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[{ key: "cinPasseport", label: "CIN / Passeport" }, { key: "policeAssurance", label: "Police d'assurance voyage" }, { key: "billetsAvion", label: "Billets d'avion + embarquement" }, { key: "preuveReservation", label: "Preuve de réservation" }].map((f) => (
                        <div key={f.key} className="rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/30 p-4 flex flex-col gap-2">
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">{f.label}</p>
                          {selectedSinistre?.files?.[f.key] && <button type="button" onClick={() => setPreviewUpload({ id: f.key, label: f.label, fileUrl: selectedSinistre.files[f.key] })} className="flex items-center gap-1.5 text-xs text-sky-600 font-medium"><Eye className="w-3 h-3" /> Voir actuel</button>}
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setEditForm((prev) => ({ ...prev, files: { ...prev.files, [f.key]: e.target.files?.[0] || null } }))} className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0f2744] file:text-white cursor-pointer" />
                          {editForm.files[f.key] && <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {editForm.files[f.key].name}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                </div>{/* end p-7 */}

                {/* Pinned footer */}
                <div className="shrink-0 px-7 py-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00a67e] hover:bg-[#008b69] disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-lg shadow-[#00a67e]/20"
                  >
                    {savingEdit
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enregistrement...</>
                      : <><CheckCircle className="w-4 h-4" /> Enregistrer</>
                    }
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
