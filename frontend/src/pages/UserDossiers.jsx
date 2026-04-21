import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../api/axios";

export default function UserDossiers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");

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
    return users
      .filter((u) => u.role !== "gestionnaire")
      .filter((u) =>
        !term ||
        [u.name, u.email, u.CIN]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term))
      )
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
          messages: userMessages
        };
      });
  }, [users, claims, documents, messages, search]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-2 text-gray-600">Chargement des dossiers utilisateurs...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dossiers utilisateurs</h1>
          <p className="text-gray-600 mt-1">Vue globale: sinistres, réclamations, documents et messages</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, CIN..."
            className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#00a67e]"
          />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Utilisateur</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Sinistres</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Réclamations</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Documents</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Messages</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{row.name}</p>
                      <p className="text-xs text-gray-600">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-[#1a365d]">{row.sinistres}</td>
                    <td className="px-4 py-3 text-center font-semibold text-[#1a365d]">{row.reclamations}</td>
                    <td className="px-4 py-3 text-center font-semibold text-[#1a365d]">{row.documents}</td>
                    <td className="px-4 py-3 text-center font-semibold text-[#1a365d]">{row.messages}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
