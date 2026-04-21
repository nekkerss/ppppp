import { useContext, useEffect, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDateTime } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";

export default function Messages() {
  const { user } = useContext(AuthContext);
  const isStaff = ["admin", "gestionnaire"].includes(user?.role);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    receiverId: "",
    content: ""
  });
  const [filterUser, setFilterUser] = useState("all");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [messagesRes, usersRes] = await Promise.all([
        API.get("/messages"),
        API.get("/users/message-recipients")
      ]);
      setMessages(messagesRes.data || []);
      setUsers(usersRes?.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await API.get("/messages");
      setMessages(res.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const getUserLabel = (value) => {
    if (!value) return "Inconnu";
    if (typeof value === "object") {
      return `${value.name || "Utilisateur"} (${value.email || "sans email"})`;
    }
    const found = users.find((u) => u._id === value);
    return found ? `${found.name} (${found.email})` : value;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      if (!formData.receiverId || !formData.content) {
        alert("Veuillez remplir tous les champs");
        return;
      }

      const res = await API.post("/messages", {
        receiverId: formData.receiverId,
        content: formData.content
      });

      setMessages([...messages, res.data]);
      alert("Message envoyé avec succès!");
      setFormData({ receiverId: "", content: "" });
      setShowComposeModal(false);
      await fetchMessages();
    } catch (error) {
      alert("Erreur lors de l'envoi du message: " + error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Chargement des messages...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const scopedMessages = isStaff
    ? messages
    : messages.filter((msg) => {
        const sender = typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
        const receiver = typeof msg.receiverId === "object" ? msg.receiverId?._id : msg.receiverId;
        return sender === user?._id || receiver === user?._id;
      });

  const filteredMessages = isStaff
    ? scopedMessages.filter((msg) => {
        if (filterUser === "all") return true;
        const sender = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
        const receiver = typeof msg.receiverId === "object" ? msg.receiverId._id : msg.receiverId;
        return sender === filterUser || receiver === filterUser;
      })
    : scopedMessages;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              {["admin", "gestionnaire"].includes(user?.role)
                ? "Toutes les conversations des utilisateurs"
                : "Vos conversations avec le support"}
            </p>
          </div>
          <button
            onClick={() => setShowComposeModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            + Nouveau message
          </button>
        </div>

        {["admin", "gestionnaire"].includes(user?.role) && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tous les utilisateurs</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Vous n'avez pas de messages pour le moment</p>
            </div>
          ) : (
            filteredMessages.map(msg => (
              <div
                key={msg._id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-600 hover:shadow-lg cursor-pointer transition-all"
                onClick={() => {
                  setSelectedMessage(msg);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">💬 Message</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {msg.content}
                    </p>
                    <p className="text-xs text-[#1a365d] mb-1">
                      De: {getUserLabel(msg.senderId)} | À: {getUserLabel(msg.receiverId)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(msg.createdAt)}
                    </p>
                  </div>
                  <div className="text-3xl">📧</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Détails du message</h2>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">De</p>
                  <p className="font-semibold text-gray-900">{getUserLabel(selectedMessage.senderId)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">À</p>
                  <p className="font-semibold text-gray-900">{getUserLabel(selectedMessage.receiverId)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Date</p>
                  <p className="font-semibold text-gray-900">{formatDateTime(selectedMessage.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Message</p>
                  <p className="font-semibold text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedMessage(null);
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Compose Modal */}
        {showComposeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Nouveau message</h2>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Destinataire *</label>
                  <select
                    required
                    value={formData.receiverId}
                    onChange={(e) => setFormData({...formData, receiverId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- Choisir un destinataire --</option>
                    {users
                      .filter((u) => u._id !== user?._id)
                      .map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email}) - {u.role}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    placeholder="Écrivez votre message..."
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    rows="5"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Envoyer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowComposeModal(false);
                      setFormData({ receiverId: "", content: "" });
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