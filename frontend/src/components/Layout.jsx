import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import API from "../api/axios";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Calculator,
  FolderOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Headphones,
  HelpCircle,
  ClipboardList,
  Users,
  Bell
} from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const { openChat } = useContext(ChatContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loginBanner, setLoginBanner] = useState(false);
  const loginBannerShown = useRef(false);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await API.get("/messages/unread-count");
      const count = res.data?.count || 0;
      setUnreadCount(count);
      return count;
    } catch (_) {
      return 0;
    }
  }, []);

  // On login: fetch unread once, show banner if > 0
  useEffect(() => {
    if (!user) {
      loginBannerShown.current = false;
      return;
    }
    if (loginBannerShown.current) return;
    loginBannerShown.current = true;

    fetchUnread().then((count) => {
      if (count > 0) {
        setLoginBanner(true);
        setTimeout(() => setLoginBanner(false), 6000);
      }
    });
  }, [user, fetchUnread]);

  // Poll unread count every 20s
  useEffect(() => {
    if (!user) return;
    const id = setInterval(fetchUnread, 20000);
    return () => clearInterval(id);
  }, [user, fetchUnread]);

  // Clear badge when navigating to messages
  useEffect(() => {
    if (location.pathname === "/messages") {
      setUnreadCount(0);
      setLoginBanner(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const menuItems = user?.role === "admin"
    ? [
        { path: "/contracts", label: "Contrats", icon: FileText },
        { path: "/admin/dashboard", label: "Users", icon: Users }
      ]
    : user?.role === "gestionnaire"
      ? [
          { path: "/gestionnaire/dashboard", label: "Gestionnaire", icon: LayoutDashboard },
          { path: "/gestionnaire/dossiers", label: "Dossiers clients", icon: Users },
          { path: "/gestionnaire/contracts", label: "Contrats clients", icon: ClipboardList },
          { path: "/gestionnaire/sinistres", label: "Sinistres clients", icon: AlertTriangle },
          { path: "/messages", label: "Messages", icon: MessageSquare, badge: true }
        ]
      : [
        { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
        { path: "/contracts", label: "Contrats", icon: FileText },
        { path: "/declaration-sinistre", label: "Declaration sinistre", icon: ClipboardList },
        { path: "/claims", label: "Reclamations", icon: AlertTriangle },
        { path: "/mon-sinistre", label: "Mon sinistre", icon: AlertTriangle },
        { path: "/quotes", label: "Devis", icon: Calculator },
        { path: "/documents", label: "Documents", icon: FolderOpen },
        { path: "/messages", label: "Messages", icon: MessageSquare, badge: true }
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Login unread notification banner */}
      {loginBanner && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-[#0f2744] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#00a67e]/30 cursor-pointer"
          style={{ animation: "slideInRight 0.4s cubic-bezier(0.22,1,0.36,1)" }}
          onClick={() => { setLoginBanner(false); navigate("/messages"); }}
        >
          <style>{`
            @keyframes slideInRight {
              from { opacity: 0; transform: translateX(60px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          <div className="w-9 h-9 rounded-xl bg-[#00a67e]/20 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-[#00a67e]" />
          </div>
          <div>
            <p className="font-semibold text-sm">Nouveaux messages</p>
            <p className="text-xs text-blue-200/70">
              Vous avez {unreadCount} message{unreadCount > 1 ? "s" : ""} non lu{unreadCount > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setLoginBanner(false); }}
            className="ml-2 text-blue-200/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed left-0 top-0 z-30 w-[280px] h-screen bg-[#0f2744] text-white overflow-hidden
          transform transition-all duration-500 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${mounted ? "opacity-100" : "opacity-0"}
        `}>
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#153356] via-[#0f2744] to-[#0a1c30]" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#00a67e]/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="relative z-10 flex h-full min-h-0 flex-col">
            {/* Logo Section */}
            <div className={`
              shrink-0 p-5 border-b border-white/10
              transform transition-all duration-700 delay-100
              ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
            `}>
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00a67e]/30 rounded-xl blur-md group-hover:blur-lg transition-all" />
                  <img
                    src="/images/logo.jpg"
                    alt="BNA Assurances"
                    className="relative h-12 w-12 object-contain bg-white rounded-xl p-1.5 shadow-lg group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-wide">BNA</h1>
                  <p className="text-xs font-medium text-[#00a67e]">Assurances</p>
                </div>
              </Link>
            </div>

            {/* Client Badge */}
            <div className={`
              shrink-0 mx-4 mt-3 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-3
              transform transition-all duration-700 delay-200
              ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
            `}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00a67e] animate-pulse" />
                <p className="text-[11px] uppercase tracking-wider text-blue-200/80 font-medium">
                  {user?.role === "admin" ? "Espace admin securise" : "Espace client securise"}
                </p>
              </div>
            </div>

            {/* Scrollable: nav + help (profile stays pinned below) */}
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-2 pt-2 [scrollbar-gutter:stable]">
              <nav>
                <p className={`
                  px-3 pb-3 text-[10px] uppercase tracking-widest text-blue-300/60 font-semibold
                  transform transition-all duration-700 delay-300
                  ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
                `}>
                  Navigation
                </p>
                <div className="space-y-1">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300
                          transform
                          ${mounted ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"}
                          ${active
                            ? "bg-gradient-to-r from-[#00a67e] to-[#00b98b] text-white shadow-lg shadow-[#00a67e]/25"
                            : "text-blue-100/80 hover:bg-white/5 hover:text-white"
                          }
                        `}
                        style={{ transitionDelay: `${350 + index * 50}ms` }}
                      >
                        <div className={`
                          w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300
                          ${active
                            ? "bg-white/20"
                            : "bg-white/5 group-hover:bg-white/10"
                          }
                        `}>
                          <Icon className="w-[18px] h-[18px]" />
                        </div>
                        <span className="font-medium text-sm flex-1">{item.label}</span>
                        {item.badge && unreadCount > 0 && !active && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#00a67e] text-white text-[9px] font-bold flex items-center justify-center ml-auto">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                        {active && (
                          <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Help Section — hidden for admin and gestionnaire */}
              {!["admin", "gestionnaire"].includes(user?.role) && (
                <div className={`
                  mt-4 mb-2 rounded-xl bg-gradient-to-br from-[#00a67e]/20 to-[#00a67e]/5 border border-[#00a67e]/20 p-4
                  transform transition-all duration-700 delay-700
                  ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
                `}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00a67e]/20 flex items-center justify-center">
                      <Headphones className="w-4 h-4 text-[#00a67e]" />
                    </div>
                    <p className="font-semibold text-sm text-white">Besoin d&apos;aide?</p>
                  </div>
                  <p className="text-xs text-blue-200/70 mb-3">Notre equipe est disponible 24/7</p>
                  <button type="button" onClick={openChat} className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Contacter le support
                  </button>
                </div>
              )}

            </div>

            {/* User Section — always visible at bottom of sidebar */}
            <div className={`
              shrink-0 p-4 border-t border-white/10 bg-black/30 backdrop-blur-sm
              transform transition-all duration-700 delay-800
              ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
            `}>
              <Link
                to="/profile"
                onClick={() => setSidebarOpen(false)}
                className="block p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={`http://localhost:5000/uploads/${user.avatar.split(/[/\\]/).pop()}`}
                        alt={user?.name}
                        className="w-11 h-11 rounded-full object-cover shadow-lg border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00a67e] to-[#008c6a] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#0f2744]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user?.name || "Utilisateur"}</p>
                    <p className="text-xs text-blue-200/70 truncate">{user?.email}</p>
                  </div>
                  <Settings className="w-4 h-4 text-blue-200/50 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white py-2.5 px-4 rounded-xl transition-all duration-300 font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Deconnexion</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`
            md:hidden fixed top-4 left-4 z-40 bg-[#0f2744] text-white p-3 rounded-xl shadow-lg
            transition-all duration-300 hover:bg-[#153356]
            ${sidebarOpen ? "left-[240px]" : "left-4"}
          `}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Main Content */}
        <main className={`
          flex-1 min-h-screen min-w-0 md:ml-[280px]
          transform transition-all duration-700 delay-300
          ${mounted ? "opacity-100" : "opacity-0"}
        `}>
          {children}
        </main>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-20 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
