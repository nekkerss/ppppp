import { useContext, useEffect, useRef, useState, useCallback } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import {
  Send, Search, MessageSquare, User, ArrowLeft,
  RefreshCw, Circle, CheckCheck, Trash2
} from "lucide-react";

function Avatar({ name, avatar, size = "md" }) {
  const dim = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-base" : "w-10 h-10 text-sm";
  if (avatar) {
    return (
      <img
        src={`http://localhost:5000/uploads/${avatar.split(/[/\\]/).pop()}`}
        alt={name}
        className={`${dim} rounded-full object-cover border-2 border-white shadow-sm shrink-0`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-[#0f2744] to-[#1a3a5c] flex items-center justify-center text-white font-bold shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function RoleBadge({ role }) {
  if (role === "gestionnaire") return (
    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wide">Gestionnaire</span>
  );
  if (role === "admin") return (
    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wide">Admin</span>
  );
  return (
    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">Client</span>
  );
}

function formatTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "maintenant";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
  if (diff < 86400000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString("fr-FR", { weekday: "short" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatFullTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export default function Messages() {
  const { user } = useContext(AuthContext);
  const myId = user?._id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [activeConv, setActiveConv] = useState(null); // { user, unreadCount }
  const [thread, setThread] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatUser, setNewChatUser] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [deletingConv, setDeletingConv] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // ── Fetch conversations list ───────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await API.get("/messages/conversations");
      setConversations(res.data || []);
    } catch (_) { /* silent */ }
    finally { setLoadingConvs(false); }
  }, []);

  // ── Fetch thread for active conversation ──────────────────────────────────
  const fetchThread = useCallback(async (otherId, silent = false) => {
    if (!otherId) return;
    if (!silent) setLoadingThread(true);
    try {
      const res = await API.get(`/messages/conversation/${otherId}`);
      setThread(res.data || []);
      // Refresh conversation list to clear the unread badge
      fetchConversations();
    } catch (_) { /* silent */ }
    finally { if (!silent) setLoadingThread(false); }
  }, [fetchConversations]);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
    API.get("/users/message-recipients").then(r => setRecipients(r.data || [])).catch(() => {});
  }, [fetchConversations]);

  // ── Poll for new messages in active conversation every 6 s ─────────────────
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeConv) return;
    pollRef.current = setInterval(() => {
      fetchThread(activeConv.user._id, true);
    }, 6000);
    return () => clearInterval(pollRef.current);
  }, [activeConv, fetchThread]);

  // ── Poll conversations list every 15 s ────────────────────────────────────
  useEffect(() => {
    const id = setInterval(fetchConversations, 15000);
    return () => clearInterval(id);
  }, [fetchConversations]);

  // ── Auto-scroll to bottom when thread updates ────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  // ── Open a conversation ───────────────────────────────────────────────────
  const openConversation = (conv) => {
    setActiveConv(conv);
    setMobileShowThread(true);
    fetchThread(conv.user._id);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || !activeConv || sending) return;
    setSending(true);
    try {
      const res = await API.post("/messages", {
        receiverId: activeConv.user._id,
        content: text
      });
      setInput("");
      setThread(prev => [...prev, res.data]);
      fetchConversations();
    } catch (_) { /* silent */ }
    finally { setSending(false); }
  };

  // ── Start new conversation ────────────────────────────────────────────────
  const startNewChat = async () => {
    if (!newChatUser) return;
    const target = recipients.find(u => u._id === newChatUser);
    if (!target) return;
    // Check if conversation already exists
    const existing = conversations.find(c => c.user._id === newChatUser);
    if (existing) {
      openConversation(existing);
    } else {
      setActiveConv({ user: target, unreadCount: 0 });
      setThread([]);
      setMobileShowThread(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    setShowNewChat(false);
    setNewChatUser("");
  };

  // ── Delete a conversation ─────────────────────────────────────────────────
  const handleDeleteConversation = async (conv, e) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer la conversation avec ${conv.user.name} ?`)) return;
    try {
      await API.delete(`/messages/conversation/${conv.user._id}`);
      setConversations(prev => prev.filter(c => c.user._id !== conv.user._id));
      if (activeConv?.user._id === conv.user._id) {
        setActiveConv(null);
        setThread([]);
        setMobileShowThread(false);
      }
    } catch (_) { /* silent */ }
  };

  // ── Filtered conversations ────────────────────────────────────────────────
  const filtered = conversations.filter(c => {
    if (!search) return true;
    const t = search.toLowerCase();
    return c.user.name?.toLowerCase().includes(t) || c.user.email?.toLowerCase().includes(t);
  });

  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getSenderId = (msg) => typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-0px)] bg-slate-50 overflow-hidden" style={{ height: "calc(100vh - 0px)" }}>

        {/* ── LEFT: Conversations list ─────────────────────────────────────── */}
        <div className={`
          flex flex-col w-full md:w-80 lg:w-96 shrink-0
          bg-white border-r border-slate-200
          ${mobileShowThread ? "hidden md:flex" : "flex"}
        `}>
          {/* Header */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#0f2744]">Messages</h1>
                {totalUnread > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#00a67e] text-white text-[10px] font-bold flex items-center justify-center">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={fetchConversations} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f2744] hover:bg-[#153356] text-white text-xs font-bold transition-colors"
                >
                  + Nouveau
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <div className="w-8 h-8 border-2 border-[#00a67e]/30 border-t-[#00a67e] rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400 px-4">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-slate-500 text-sm">
                  {search ? "Aucun résultat" : "Aucune conversation"}
                </p>
                <p className="text-xs mt-1">
                  {search ? "" : "Démarrez une nouvelle conversation"}
                </p>
              </div>
            ) : (
              filtered.map(conv => {
                const isActive = activeConv?.user._id === conv.user._id;
                const lastMsg = conv.lastMessage;
                const isMyLastMsg = getSenderId(lastMsg) === myId;
                return (
                  <div
                    key={conv.user._id}
                    className={`group relative flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 cursor-pointer transition-all duration-150 ${
                      isActive
                        ? "bg-[#0f2744]/5 border-l-[3px] border-l-[#0f2744]"
                        : "hover:bg-slate-50 border-l-[3px] border-l-transparent"
                    }`}
                    onClick={() => openConversation(conv)}
                  >
                    <div className="relative shrink-0">
                      <Avatar name={conv.user.name} avatar={conv.user.avatar} />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm truncate ${conv.unreadCount > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                          {conv.user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 shrink-0">{formatTime(lastMsg?.createdAt)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                          {isMyLastMsg && <span className="text-slate-400">Vous: </span>}
                          {lastMsg?.content}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="min-w-[18px] h-4.5 px-1.5 py-0.5 rounded-full bg-[#00a67e] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Delete button — visible on hover */}
                    <button
                      onClick={(e) => handleDeleteConversation(conv, e)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-all duration-150"
                      title="Supprimer la conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Chat thread ────────────────────────────────────────────── */}
        <div className={`
          flex-1 flex flex-col min-w-0
          ${!mobileShowThread ? "hidden md:flex" : "flex"}
        `}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-15" />
                <p className="font-semibold text-slate-500">Sélectionnez une conversation</p>
                <p className="text-sm mt-1">ou démarrez-en une nouvelle</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="mt-6 px-5 py-2.5 bg-[#00a67e] hover:bg-[#008c6a] text-white text-sm font-bold rounded-2xl shadow-lg shadow-[#00a67e]/20 transition-all"
                >
                  + Nouvelle conversation
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
                <button
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <Avatar name={activeConv.user.name} avatar={activeConv.user.avatar} size="md" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#0f2744] truncate">{activeConv.user.name}</p>
                    <RoleBadge role={activeConv.user.role} />
                  </div>
                  <p className="text-xs text-slate-400 truncate">{activeConv.user.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-slate-50">
                {loadingThread ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-2 border-[#00a67e]/30 border-t-[#00a67e] rounded-full animate-spin" />
                  </div>
                ) : thread.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm">Démarrez la conversation</p>
                  </div>
                ) : (
                  thread.map((msg, i) => {
                    const isMine = getSenderId(msg) === myId;
                    const showDate = i === 0 || (
                      new Date(msg.createdAt) - new Date(thread[i - 1].createdAt) > 300000
                    );
                    return (
                      <div key={msg._id}>
                        {showDate && (
                          <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {formatFullTime(msg.createdAt)}
                            </span>
                            <div className="flex-1 h-px bg-slate-200" />
                          </div>
                        )}
                        <div className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                          {!isMine && (
                            <Avatar name={activeConv.user.name} avatar={activeConv.user.avatar} size="sm" />
                          )}
                          <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                            <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                              isMine
                                ? "bg-[#0f2744] text-white rounded-br-sm"
                                : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                            }`}>
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                              <p className="text-[10px] text-slate-400">{formatTime(msg.createdAt)}</p>
                              {isMine && (
                                <CheckCheck className={`w-3 h-3 ${msg.read ? "text-[#00a67e]" : "text-slate-300"}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex items-end gap-3 px-4 py-3 bg-white border-t border-slate-200">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    rows={1}
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all text-sm resize-none"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-2xl bg-[#00a67e] hover:bg-[#008c6a] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#00a67e]/20 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
                >
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── NEW CHAT MODAL ──────────────────────────────────────────────────── */}
        {showNewChat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#0f2744] text-lg">Nouvelle conversation</h2>
                <button onClick={() => setShowNewChat(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                  <span className="text-slate-400 text-lg leading-none">×</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Destinataire</label>
                <select
                  value={newChatUser}
                  onChange={e => setNewChatUser(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-2 focus:ring-[#00a67e]/20 outline-none transition-all"
                >
                  <option value="">-- Choisir un destinataire --</option>
                  {recipients
                    .filter(u => u._id !== myId)
                    .map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startNewChat}
                  disabled={!newChatUser}
                  className="flex-1 bg-[#00a67e] hover:bg-[#008c6a] text-white font-bold py-3 rounded-2xl disabled:opacity-40 transition-all"
                >
                  Démarrer
                </button>
                <button
                  onClick={() => { setShowNewChat(false); setNewChatUser(""); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
