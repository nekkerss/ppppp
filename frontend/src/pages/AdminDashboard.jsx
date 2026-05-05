import { useContext, useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const ROLE_OPTIONS = ["user", "gestionnaire"];

export default function AdminDashboard() {
  const { user: currentUser } = useContext(AuthContext);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/users/admin/accounts");
      setAccounts(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountDetails = async (id) => {
    try {
      const res = await API.get(`/users/admin/accounts/${id}`);
      setSelectedAccount(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load account details");
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const roleFilter = activeTab === "users" ? "user" : "gestionnaire";
    const term = search.trim().toLowerCase();
    return accounts
      .filter((a) => a.role === roleFilter)
      .filter((a) =>
        !term ||
        [a.name, a.email, a.CIN]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term))
      );
  }, [accounts, search, activeTab]);

  const handleToggleVerification = async (account) => {
    try {
      setError("");
      setSuccess("");
      const res = await API.patch(`/users/admin/accounts/${account._id}`, {
        emailVerified: !account.emailVerified,
      });
      setSuccess("Statut de vérification mis à jour");
      setAccounts((prev) => prev.map((u) => (u._id === account._id ? res.data : u)));
      if (selectedAccount?._id === account._id) setSelectedAccount(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la mise à jour");
    }
  };

  const handleRoleChange = async (account, nextRole) => {
    try {
      setError("");
      setSuccess("");
      const res = await API.patch(`/users/admin/accounts/${account._id}`, { role: nextRole });
      setSuccess("Rôle mis à jour");
      setAccounts((prev) => prev.map((u) => (u._id === account._id ? res.data : u)));
      if (selectedAccount?._id === account._id) setSelectedAccount(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la mise à jour du rôle");
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Supprimer le compte ${account.email} ?`)) return;
    try {
      setError("");
      setSuccess("");
      await API.delete(`/users/admin/accounts/${account._id}`);
      setSuccess("Compte supprimé");
      setAccounts((prev) => prev.filter((u) => u._id !== account._id));
      if (selectedAccount?._id === account._id) setSelectedAccount(null);
    } catch (err) {
      setError(err.response?.data?.message || "Échec de la suppression");
    }
  };

  const userCount = accounts.filter((a) => a.role === "user").length;
  const gestionnaireCount = accounts.filter((a) => a.role === "gestionnaire").length;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a365d] to-[#2d4a7c] px-6 py-8 md:px-10">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-blue-100 mt-2">Gestion des comptes — utilisateurs et gestionnaires</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">{success}</div>
          )}

          {/* Search */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, CIN..."
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#00a67e] bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => { setActiveTab("users"); setSelectedAccount(null); }}
              className={`px-6 py-3 text-sm font-semibold rounded-t-lg border border-b-0 transition-colors ${
                activeTab === "users"
                  ? "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-[#1a365d]"
                  : "bg-transparent border-transparent text-gray-500 dark:text-slate-400 hover:text-[#1a365d]"
              }`}
            >
              Utilisateurs
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                {userCount}
              </span>
            </button>
            <button
              onClick={() => { setActiveTab("gestionnaires"); setSelectedAccount(null); }}
              className={`px-6 py-3 text-sm font-semibold rounded-t-lg border border-b-0 transition-colors ${
                activeTab === "gestionnaires"
                  ? "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-[#1a365d]"
                  : "bg-transparent border-transparent text-gray-500 dark:text-slate-400 hover:text-[#1a365d]"
              }`}
            >
              Gestionnaires
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                {gestionnaireCount}
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account list */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <h2 className="font-semibold text-[#1a365d]">
                  {activeTab === "users" ? "Liste des utilisateurs" : "Liste des gestionnaires"}
                </h2>
                <button
                  onClick={fetchAccounts}
                  className="text-sm bg-[#1a365d] text-white px-3 py-1.5 rounded-lg hover:bg-[#163050]"
                >
                  Actualiser
                </button>
              </div>

              {loading ? (
                <div className="p-6 text-gray-500 dark:text-slate-400">Chargement...</div>
              ) : filteredAccounts.length === 0 ? (
                <div className="p-6 text-gray-500 dark:text-slate-400">Aucun compte trouvé.</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredAccounts.map((account) => (
                    <div key={account._id} className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#1a365d]">{account.name}</p>
                        <p className="text-sm text-gray-600">{account.email}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span
                            className={`px-2 py-1 rounded font-medium ${
                              account.role === "gestionnaire"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {account.role}
                          </span>
                          <span
                            className={`px-2 py-1 rounded ${
                              account.emailVerified
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {account.emailVerified ? "Vérifié" : "Non vérifié"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          onClick={() => fetchAccountDetails(account._id)}
                          className="text-xs px-3 py-1.5 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Détails
                        </button>
                        {currentUser?.role === "gestionnaire" && account.role === "gestionnaire" ? (
                          <span className="text-xs px-3 py-1.5 rounded bg-gray-100 text-gray-400 border border-gray-200 select-none">
                            Lecture seule
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleVerification(account)}
                              className="text-xs px-3 py-1.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200"
                            >
                              Vérification
                            </button>
                            <select
                              value={account.role}
                              onChange={(e) => handleRoleChange(account, e.target.value)}
                              className="text-xs px-3 py-1.5 rounded bg-purple-100 text-purple-700 border border-purple-200"
                            >
                              {ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDelete(account)}
                              className="text-xs px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account details panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-semibold text-[#1a365d] mb-3">Détails du compte</h2>
              {!selectedAccount ? (
                <p className="text-sm text-gray-500">Sélectionnez un compte pour voir les détails.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Nom :</span> {selectedAccount.name}</p>
                  <p><span className="font-medium">Email :</span> {selectedAccount.email}</p>
                  <p><span className="font-medium">CIN :</span> {selectedAccount.CIN || "-"}</p>
                  <p><span className="font-medium">Téléphone :</span> {selectedAccount.phone || "-"}</p>
                  <p><span className="font-medium">Rôle :</span> {selectedAccount.role}</p>
                  <p>
                    <span className="font-medium">Vérifié :</span>{" "}
                    {selectedAccount.emailVerified ? "Oui" : "Non"}
                  </p>
                  <p>
                    <span className="font-medium">Créé le :</span>{" "}
                    {selectedAccount.createdAt
                      ? new Date(selectedAccount.createdAt).toLocaleString("fr-FR")
                      : "-"}
                  </p>
                  <button
                    onClick={() => setSelectedAccount(null)}
                    className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
