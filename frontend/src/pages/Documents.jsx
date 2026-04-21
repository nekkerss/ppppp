import { useContext, useEffect, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";

// ── Pure helpers (no hooks) ──────────────────────────────────────────────────

const getFileIcon = (filename = "") => {
  const ext = filename.split(".").pop().toLowerCase();
  const icons = {
    pdf: "📄", doc: "📝", docx: "📝",
    xls: "📊", xlsx: "📊",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️",
    txt: "📋",
  };
  return icons[ext] || "📎";
};

const normalizePath = (value = "") => value.replace(/\\/g, "/");
const getFileName = (path = "") => normalizePath(path).split("/").pop();
const getFileExt  = (filename = "") => filename.split(".").pop().toLowerCase();
const isImage     = (f) => ["jpg","jpeg","png","gif","webp"].includes(getFileExt(f));
const isPDF       = (f) => getFileExt(f) === "pdf";

// Build an absolute URL — handles both full URLs and relative server paths
const getFileUrl = (fileUrl = "") => {
  if (!fileUrl) return "#";
  const normalizedFileUrl = normalizePath(fileUrl);
  if (normalizedFileUrl.startsWith("http://") || normalizedFileUrl.startsWith("https://")) {
    return normalizedFileUrl;
  }
  const apiBase = API?.defaults?.baseURL || import.meta.env.VITE_API_URL || "";
  const backendBase = apiBase.replace(/\/api\/?$/, "").replace(/\/$/, "");
  return `${backendBase}/${normalizedFileUrl.replace(/^\//, "")}`;
};

// Fetch with auth token → save to disk via a temporary <a> click
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

// ── Component ────────────────────────────────────────────────────────────────

const documentTypes = [
  "CIN", "Passport", "Licence", "Justificatif de domicile", "Autre",
];

export default function Documents() {
  const { user } = useContext(AuthContext);
  const [documents,       setDocuments]       = useState([]);
  const [sinistres,       setSinistres]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file,            setFile]            = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterType,      setFilterType]      = useState("all");
  const [filterUser,      setFilterUser]      = useState("all");
  const [uploadFormData,  setUploadFormData]  = useState({ type: "CIN", file: null, claimId: "" });

  // Preview
  const [previewDoc,     setPreviewDoc]     = useState(null);
  const [previewUrl,     setPreviewUrl]     = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ── Fetch documents on mount ──
  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const [docsRes, claimsRes] = await Promise.all([
        API.get("/documents"),
        API.get("/claims")
      ]);
      setDocuments(docsRes.data || []);
      setSinistres((claimsRes.data || []).filter((item) => !!item.sinistreType));
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Load an authenticated blob URL whenever previewDoc changes ──
  useEffect(() => {
    if (!previewDoc) {
      setPreviewUrl(null);
      return;
    }

    let objectUrl = null;
    setPreviewLoading(true);
    setPreviewUrl(null);

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(getFileUrl(previewDoc.fileUrl), {
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
  }, [previewDoc]);

  // ── Upload ──
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFormData.file) { alert("Veuillez sélectionner un fichier"); return; }
    try {
      const formData = new FormData();
      formData.append("file", uploadFormData.file);
      formData.append("type", uploadFormData.type);
      if (uploadFormData.claimId) {
        formData.append("claimId", uploadFormData.claimId);
      }

      const res    = await API.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newDoc = res.data;

      alert("Document uploadé avec succès!");
      setUploadFormData({ type: "CIN", file: null, claimId: "" });
      setFile(null);
      setShowUploadModal(false);
      await fetchDocuments();
      setPreviewDoc(newDoc); // auto-open preview for verification
    } catch (err) {
      alert("Erreur lors de l'upload: " + err.response?.data?.message);
    }
  };

  // ── Delete ──
  const handleDelete = async (docId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document?")) return;
    try {
      await API.delete(`/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      if (previewDoc?._id === docId) setPreviewDoc(null);
      alert("Document supprimé avec succès!");
    } catch (err) {
      alert("Erreur lors de la suppression: " + err.response?.data?.message);
    }
  };

  // ── Filter ──
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.fileUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc._id.toString().includes(searchTerm);
    const matchesFilter = filterType === "all" || doc.type === filterType;
    const docUserId = typeof doc.userId === "object" ? doc.userId._id : doc.userId;
    const matchesUser = filterUser === "all" || docUserId === filterUser;
    return matchesSearch && matchesFilter && matchesUser;
  });
  const uniqueUsers = [...new Map(
    documents
      .filter((d) => d.userId && typeof d.userId === "object")
      .map((d) => [d.userId._id, d.userId])
  ).values()];

  // ── Loading screen ──
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">Chargement des documents...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Render ──
  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Documents</h1>
            <p className="text-gray-600 mt-1">Gérez vos fichiers et documents</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            + Charger un document
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Rechercher par nom de fichier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tous les types</option>
              {documentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {["admin", "gestionnaire"].includes(user?.role) && (
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

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredDocuments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Aucun document trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fichier</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc._id} className="border-b border-gray-200 hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getFileIcon(getFileName(doc.fileUrl))}</span>
                          <div>
                            <p className="font-semibold text-gray-900 max-w-xs truncate">
                              {getFileName(doc.fileUrl)}
                            </p>
                            <p className="text-xs text-gray-500">ID: {doc._id.slice(-6)}</p>
                            {["admin", "gestionnaire"].includes(user?.role) && doc.userId && typeof doc.userId === "object" && (
                              <p className="text-xs text-[#1a365d]">
                                Utilisateur: {doc.userId.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {doc.type || "Non spécifié"}
                        </span>
                        {doc.claimId && (
                          <p className="text-xs text-emerald-700 mt-1 font-medium">
                            Lié au sinistre #{(typeof doc.claimId === "object" ? doc.claimId._id : doc.claimId).slice(-6)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            title="Aperçu du document"
                            className="text-green-600 hover:text-green-800 transition-colors text-xl"
                          >👁️</button>
                          <button
                            onClick={() => downloadWithAuth(doc.fileUrl, getFileName(doc.fileUrl))}
                            title="Télécharger"
                            className="text-blue-600 hover:text-blue-800 transition-colors text-xl"
                          >📥</button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            title="Supprimer"
                            className="text-red-600 hover:text-red-800 transition-colors text-xl"
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Preview Modal ── */}
        {previewDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
              style={{ height: "90vh" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">
                    {getFileIcon(getFileName(previewDoc.fileUrl))}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate max-w-xs md:max-w-lg">
                      {getFileName(previewDoc.fileUrl)}
                    </p>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {previewDoc.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => downloadWithAuth(previewDoc.fileUrl, getFileName(previewDoc.fileUrl))}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-all"
                  >
                    📥 Télécharger
                  </button>
                  <button
                    onClick={() => setPreviewDoc(null)}
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
                    <p className="text-red-500 font-semibold">Impossible de charger l'aperçu.</p>
                    <button
                      onClick={() => downloadWithAuth(previewDoc.fileUrl, getFileName(previewDoc.fileUrl))}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                    >
                      📥 Télécharger à la place
                    </button>
                  </div>
                ) : isImage(getFileName(previewDoc.fileUrl)) ? (
                  <div className="flex items-center justify-center h-full p-6">
                    <img
                      src={previewUrl}
                      alt={getFileName(previewDoc.fileUrl)}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                    />
                  </div>
                ) : isPDF(getFileName(previewDoc.fileUrl)) ? (
                  <iframe
                    src={previewUrl}
                    title="Aperçu PDF"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 p-8">
                    <span className="text-7xl">{getFileIcon(getFileName(previewDoc.fileUrl))}</span>
                    <p className="text-lg font-semibold text-gray-700">
                      Aperçu non disponible pour ce format
                    </p>
                    <p className="text-sm text-gray-500">
                      Téléchargez le fichier pour le visualiser dans l'application appropriée.
                    </p>
                    <button
                      onClick={() => downloadWithAuth(previewDoc.fileUrl, getFileName(previewDoc.fileUrl))}
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

        {/* ── Upload Modal ── */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Charger un document</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Type de document *
                  </label>
                  <select
                    required
                    value={uploadFormData.type}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {documentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fichier *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-all">
                    <input
                      type="file"
                      required
                      onChange={(e) => {
                        setUploadFormData({ ...uploadFormData, file: e.target.files[0] });
                        setFile(e.target.files[0]);
                      }}
                      className="hidden"
                      id="fileInput"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer">
                      <p className="text-gray-600">
                        {file ? `✓ ${file.name}` : "Cliquez pour sélectionner un fichier"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">ou déposez le fichier ici</p>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Lier à un sinistre (optionnel)
                  </label>
                  <select
                    value={uploadFormData.claimId}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, claimId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">Aucun sinistre</option>
                    {sinistres.map((s) => (
                      <option key={s._id} value={s._id}>
                        Sinistre #{s._id.slice(-6)} - {s.sinistreType || "type"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Charger
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setFile(null);
                      setUploadFormData({ type: "CIN", file: null, claimId: "" });
                    }}
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