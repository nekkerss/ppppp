import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import {
  Search, X, Users, AlertTriangle, MessageSquare,
  FileText, RotateCcw, Car, Heart, Home, Plane, Shield
} from "lucide-react";

export default function UserDossiers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, claimsRes, docsRes, messagesRes] = await Promise.all([
          API.get("/users/admin/accounts"),
          API.get("/claims"),
          API.get("/documents"),
          API.get("/messages")
        ]);
        setUsers(usersRes.data || []);
        setClaims(claimsRes.data || []);
        setDocuments(docsRes.data || []);
        setMessages(messagesRes.data || []);
      } catch (error) {
        console.error("Failed loading dossiers:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getUserId = (value) => (typeof value === "object" ? value?._id : value);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = users
      .filter((u) => u.role !== "gestionnaire")
      .map((u) => {
        const userClaims = claims.filter((c) => getUserId(c.userId) === u._id);
        const userSinistres = userClaims.filter((c) => !!c.sinistreType).length;
        const userReclamations = userClaims.filter((c) => !c.sinistreType).length;
        const userDocuments = documents.filter((d) => getUserId(d.userId) === u._id).length;
        const userMessages = messages.filter((m) => {
          const sender = getUserId(m.senderId);
          const receiver = getUserId(m.receiverId);
          return sender === u._id || receiver === u._id;
        }).length;
        return {
          ...u,
          sinistres: userSinistres,
          reclamations: userReclamations,
          documents: userDocuments,
          messages: userMessages,
          totalActivity: userSinistres + userReclamations + userDocuments + userMessages
        };
      });

    if (term) {
      result = result.filter((u) =>
        [u.name, u.email, u.CIN]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term))
      );
    }

    switch (activityFilter) {
      case "hasSinistres":   result = result.filter((u) => u.sinistres > 0); break;
      case "hasReclamations": result = result.filter((u) => u.reclamations > 0); break;
      case "hasDocuments":   result = result.filter((u) => u.documents > 0); break;
      case "hasMessages":    result = result.filter((u) => u.messages > 0); break;
      case "active":         result = result.filter((u) => u.totalActivity > 0); break;
      case "inactive":       result = result.filter((u) => u.totalActivity === 0); break;
      default: break;
    }

    switch (sortBy) {
      case "sinistres":    result = [...result].sort((a, b) => b.sinistres - a.sinistres); break;
      case "reclamations": result = [...result].sort((a, b) => b.reclamations - a.reclamations); break;
      case "documents":    result = [...result].sort((a, b) => b.documents - a.documents); break;
      case "activity":     result = [...result].sort((a, b) => b.totalActivity - a.totalActivity); break;
      default:             result = [...result].sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
    }

    return result;
  }, [users, claims, documents, messages, search, activityFilter, sortBy]);

  const totalSinistres   = rows.reduce((s, r) => s + r.sinistres, 0);
  const totalReclamations = rows.reduce((s, r) => s + r.reclamations, 0);
  const totalDocuments   = rows.reduce((s, r) => s + r.documents, 0);
  const activeUsers      = rows.filter((r) => r.totalActivity > 0).length;

  const handleReset = () => {
    setSearch("");
    setActivityFilter("all");
    setSortBy("name");
  };

  const CountBadge = ({ value, color }) => {
    const colors = {
      blue:   "bg-blue-100 text-blue-700",
      orange: "bg-orange-100 text-orange-700",
      green:  "bg-green-100 text-green-700",
      purple: "bg-purple-100 text-purple-700",
      slate:  "bg-slate-100 text-slate-600"
    };
    return (
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${colors[color] || colors.slate}`}>
        {value}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a67e]" />
            <p className="mt-2 text-gray-600">Chargement des dossiers utilisateurs...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Dossiers utilisateurs</h1>
            <p className="text-gray-600 mt-1">Vue globale des activités clients</p>
          </div>
          <span className="bg-[#0f2744] text-white px-4 py-2 rounded-full text-sm font-semibold">
            {rows.length} utilisateur{rows.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Clients actifs",   value: activeUsers,        icon: Users,          bg: "bg-gradient-to-br from-[#0f2744] to-[#1a3a5c]" },
            { label: "Sinistres totaux", value: totalSinistres,     icon: AlertTriangle,  bg: "bg-gradient-to-br from-blue-600 to-blue-700" },
            { label: "Réclamations",     value: totalReclamations,  icon: Shield,         bg: "bg-gradient-to-br from-orange-500 to-orange-600" },
            { label: "Documents",        value: totalDocuments,     icon: FileText,       bg: "bg-gradient-to-br from-[#00a67e] to-[#008060]" },
          ].map(({ label, value, icon: Icon, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-4 text-white shadow-md`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{label}</p>
                  <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <div className="bg-white/20 rounded-full p-2">
                  <Icon size={20} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, email, CIN..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00a67e] focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Activity filter */}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00a67e] text-gray-700"
            >
              <option value="all">Tous les clients</option>
              <option value="active">Clients actifs</option>
              <option value="inactive">Clients sans activité</option>
              <option value="hasSinistres">Avec sinistres</option>
              <option value="hasReclamations">Avec réclamations</option>
              <option value="hasDocuments">Avec documents</option>
              <option value="hasMessages">Avec messages</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00a67e] text-gray-700"
            >
              <option value="name">Trier par nom</option>
              <option value="activity">Trier par activité totale</option>
              <option value="sinistres">Trier par sinistres</option>
              <option value="reclamations">Trier par réclamations</option>
              <option value="documents">Trier par documents</option>
            </select>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={14} />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#0f2744] to-[#1a3a5c] text-white">
                  <th className="px-5 py-4 text-left text-sm font-semibold">Utilisateur</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    <span className="flex items-center justify-center gap-1.5">
                      <AlertTriangle size={14} />
                      Sinistres
                    </span>
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    <span className="flex items-center justify-center gap-1.5">
                      <Shield size={14} />
                      Réclamations
                    </span>
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    <span className="flex items-center justify-center gap-1.5">
                      <FileText size={14} />
                      Documents
                    </span>
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold">
                    <span className="flex items-center justify-center gap-1.5">
                      <MessageSquare size={14} />
                      Messages
                    </span>
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <Users size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
                      <p className="text-gray-400 text-sm mt-1">Modifiez vos filtres pour voir plus de résultats</p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr
                      key={row._id}
                      className={`border-b border-gray-100 hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      {/* User info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0f2744] to-[#1a3a5c] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {(row.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{row.name}</p>
                            <p className="text-xs text-gray-500">{row.email}</p>
                            {row.CIN && (
                              <p className="text-xs text-gray-400">CIN: {row.CIN}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <CountBadge value={row.sinistres} color="blue" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <CountBadge value={row.reclamations} color="orange" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <CountBadge value={row.documents} color="green" />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <CountBadge value={row.messages} color="purple" />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        {row.totalActivity > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Inactif
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              {rows.length} utilisateur{rows.length !== 1 ? "s" : ""} affiché{rows.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
