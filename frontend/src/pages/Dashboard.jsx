import { useEffect, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, formatCurrency, truncateText } from "../utils/helpers";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertTriangle,
  FileCheck,
  FolderOpen,
  ArrowRight,
  Plus,
  Upload,
  Clock,
  CheckCircle,
  RefreshCw,
  Shield,
  TrendingUp,
  Sparkles,
  Bell,
  Calendar,
  Wallet
} from "lucide-react";

export default function Dashboard() {
  const [contracts, setContracts] = useState([]);
  const [claims, setClaims] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    const flashMessage = sessionStorage.getItem("loginSuccessMessage");
    if (flashMessage) {
      setLoginSuccessMessage(flashMessage);
      sessionStorage.removeItem("loginSuccessMessage");
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [contractRes, claimRes, quoteRes, docRes] = await Promise.all([
          API.get("/contracts"),
          API.get("/claims"),
          API.get("/quotes"),
          API.get("/documents")
        ]);

        setContracts(contractRes.data || []);
        setClaims(claimRes.data || []);
        setQuotes(quoteRes.data || []);
        setDocuments(docRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActiveContractCount = () => {
    return contracts.filter((c) => c.status === "actif").length;
  };

  const getContractExpiryDate = () => {
    const sorted = [...contracts].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    return sorted[0]?.endDate;
  };

  const getPendingClaimsCount = () => {
    return claims.filter((c) => c.status === "en attente").length;
  };

  const getApprovedClaimsCount = () => {
    return claims.filter((c) => c.status === "accepte").length;
  };

  const getTotalCoverage = () => {
    return contracts.reduce((total, contract) => total + (Number(contract.premium) || 0), 0);
  };

  const getLastClaim = () => {
    if (claims.length === 0) return null;
    return [...claims].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  const getLastDocument = () => {
    if (documents.length === 0) return null;
    return [...documents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  };

  const generateActivityFeed = () => {
    const activities = [];

    claims.slice(0, 2).forEach((claim) => {
      activities.push({
        id: `claim-${claim._id}`,
        type: "claim",
        title: "Reclamation soumise",
        description: claim.description,
        date: claim.date,
        icon: AlertTriangle,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600"
      });
    });

    documents.slice(0, 2).forEach((doc) => {
      activities.push({
        id: `doc-${doc._id}`,
        type: "document",
        title: "Document charge",
        description: doc.type || "Document",
        date: doc.createdAt,
        icon: FolderOpen,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600"
      });
    });

    contracts.slice(0, 2).forEach((contract) => {
      activities.push({
        id: `contract-${contract._id}`,
        type: "contract",
        title: `Contrat ${contract.type}`,
        description: `Actif jusqu'au ${formatDate(contract.endDate)}`,
        date: contract.startDate,
        icon: FileText,
        iconBg: "bg-[#e6f7f2]",
        iconColor: "text-[#00a67e]"
      });
    });

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[#00a67e]/20 border-t-[#00a67e] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#1a365d]" />
              </div>
            </div>
            <p className="mt-6 text-[#1a365d] font-semibold">Chargement de votre espace...</p>
            <p className="text-sm text-slate-500 mt-1">BNA Assurances</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f2744] via-[#153356] to-[#1a3a5c]">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a67e]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00a67e]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div
            className={`
            relative w-full px-6 py-10 md:px-10 md:py-12
            transform transition-all duration-700
            ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
          `}
          >
            <div
              className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00a67e]/20 border border-[#00a67e]/30 text-[#00a67e] text-sm font-semibold mb-5
              transform transition-all duration-700 delay-100
              ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
            `}
            >
              <Sparkles className="w-4 h-4" />
              Espace Client BNA Assurances
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div
                className={`
                transform transition-all duration-700 delay-200
                ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
              `}
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Tableau de bord
                </h1>
                <p className="text-blue-200/80 mt-3 max-w-xl text-lg">
                  Gerez vos contrats, suivez vos demandes et consultez vos documents en toute securite.
                </p>
              </div>

              <div
                className={`
                grid grid-cols-2 gap-4 w-full lg:w-auto
                transform transition-all duration-700 delay-300
                ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
              `}
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2 text-blue-200/70 text-xs font-medium mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    Contrats actifs
                  </div>
                  <p className="text-3xl font-bold text-white">{getActiveContractCount()}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2 text-blue-200/70 text-xs font-medium mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    En attente
                  </div>
                  <p className="text-3xl font-bold text-white">{getPendingClaimsCount()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-6 md:px-10 py-8 space-y-8">
          {/* Success Message */}
          {loginSuccessMessage && (
            <div
              className={`
              bg-[#e6f7f2] border border-[#00a67e]/30 rounded-2xl p-4 flex items-center gap-4
              transform transition-all duration-500
              ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}
            `}
            >
              <div className="w-10 h-10 rounded-full bg-[#00a67e] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-[#00664d] font-medium">{loginSuccessMessage}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              {
                title: "Mes Contrats",
                value: getActiveContractCount(),
                subtext: `Expire le ${formatDate(getContractExpiryDate())}`,
                icon: FileText,
                iconBg: "bg-[#e6f7f2]",
                iconColor: "text-[#00a67e]",
                link: "/contracts",
                linkText: "Voir tous les contrats",
                delay: 100
              },
              {
                title: "Mes Reclamations",
                value: getPendingClaimsCount(),
                subtext: getLastClaim() ? `Derniere: ${formatDate(getLastClaim().date)}` : "Aucune reclamation",
                extraInfo: `${getApprovedClaimsCount()} acceptee(s)`,
                icon: AlertTriangle,
                iconBg: "bg-amber-100",
                iconColor: "text-amber-600",
                link: "/claims",
                linkText: "Voir toutes les reclamations",
                delay: 200
              },
              {
                title: "Devis",
                value: quotes.length,
                subtext: "Devis disponibles",
                extraInfo: `Valeur: ${formatCurrency(getTotalCoverage())}`,
                icon: FileCheck,
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600",
                link: "/quotes",
                linkText: "Voir les devis",
                delay: 300
              },
              {
                title: "Documents",
                value: documents.length,
                subtext: getLastDocument()
                  ? `Dernier: ${formatDate(getLastDocument().createdAt)}`
                  : "Aucun document",
                icon: FolderOpen,
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600",
                link: "/documents",
                linkText: "Voir tous les documents",
                delay: 400
              }
            ].map((card, index) => (
              <div
                key={index}
                className={`
                  group bg-white rounded-2xl shadow-sm border border-slate-200 p-6
                  hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1
                  transition-all duration-500
                  transform
                  ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
                `}
                style={{ transitionDelay: `${card.delay}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">{card.title}</p>
                    <p className="text-4xl font-bold text-[#1a365d] mt-2">{card.value}</p>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {card.subtext}
                    </p>
                    {card.extraInfo && <p className="text-xs text-slate-500 mt-1">{card.extraInfo}</p>}
                  </div>
                  <div
                    className={`w-14 h-14 ${card.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon className={`w-7 h-7 ${card.iconColor}`} />
                  </div>
                </div>
                <Link
                  to={card.link}
                  className="text-[#00a67e] hover:text-[#008c6a] text-sm font-semibold inline-flex items-center gap-1 group/link"
                >
                  {card.linkText}
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>

          {/* Quick Actions & Reminders Row */}
          <div
            className={`
            grid grid-cols-1 xl:grid-cols-3 gap-6
            transform transition-all duration-700 delay-500
            ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
          `}
          >
            {/* Quick Actions */}
            <div className="xl:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#f0fdf9] via-[#f6fffc] to-[#e7faf4] rounded-2xl p-6 border border-[#00a67e]/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00a67e]/10 rounded-full blur-3xl" />
              <h3 className="relative font-bold text-[#1a365d] mb-5 flex items-center gap-2 text-lg">
                <RefreshCw className="w-5 h-5 text-[#00a67e]" />
                Actions rapides
              </h3>
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/claims"
                  className="bg-white hover:bg-slate-50 border-2 border-[#1a365d] text-[#1a365d] font-semibold py-4 px-5 rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Soumettre une reclamation
                </Link>
                <Link
                  to="/quotes"
                  className="bg-white hover:bg-slate-50 border-2 border-[#00a67e] text-[#00a67e] font-semibold py-4 px-5 rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Demander un devis
                </Link>
                <Link
                  to="/documents"
                  className="bg-white hover:bg-slate-50 border-2 border-purple-600 text-purple-600 font-semibold py-4 px-5 rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Upload className="w-5 h-5" />
                  Charger un document
                </Link>
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-[#1a365d] mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#00a67e]" />
                Rappels utiles
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00a67e]/30 transition-colors">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Prochaine echeance
                  </div>
                  <p className="font-semibold text-[#1a365d] text-sm">
                    {getContractExpiryDate() ? formatDate(getContractExpiryDate()) : "Aucune date"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00a67e]/30 transition-colors">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Wallet className="w-3.5 h-3.5" />
                    Prime annuelle
                  </div>
                  <p className="font-semibold text-[#1a365d] text-sm">{formatCurrency(getTotalCoverage())}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00a67e]/30 transition-colors">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Documents stockes
                  </div>
                  <p className="font-semibold text-[#1a365d] text-sm">{documents.length} document(s)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Security Row */}
          <div
            className={`
            grid grid-cols-1 xl:grid-cols-3 gap-6
            transform transition-all duration-700 delay-600
            ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
          `}
          >
            {/* Recent Activity */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-[#1a365d] mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00a67e]" />
                Activites recentes
              </h2>
              {generateActivityFeed().length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">Aucune activite pour le moment</p>
                  <p className="text-slate-400 text-sm mt-1">Vos actions apparaitront ici</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generateActivityFeed().map((activity, index) => {
                    const IconComponent = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className={`
                          flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 hover:border-slate-200
                          transform transition-all duration-500
                          ${mounted ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}
                        `}
                        style={{ transitionDelay: `${700 + index * 100}ms` }}
                      >
                        <div className={`w-12 h-12 ${activity.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-5 h-5 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-[#1a365d]">{activity.title}</p>
                            <p className="text-xs text-slate-400 flex-shrink-0">{formatDate(activity.date)}</p>
                          </div>
                          <p className="text-sm text-slate-500 mt-1 truncate">{truncateText(activity.description)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Security Panel */}
            <div className="bg-gradient-to-br from-[#0f2744] to-[#1a365d] rounded-2xl p-6 text-white shadow-xl">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-5">
                <Shield className="w-5 h-5 text-[#00a67e]" />
                Securite du compte
              </h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-blue-200/80 text-xs mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00a67e]" />
                    Verification email
                  </div>
                  <p className="font-semibold text-white">Activee</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-blue-200/80 text-xs mb-1">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Documents securises
                  </div>
                  <p className="font-semibold text-white">{documents.length} fichier(s)</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-blue-200/80 text-xs mb-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Valeur couverte
                  </div>
                  <p className="font-semibold text-white">{formatCurrency(getTotalCoverage())}</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-xs text-blue-200/60 text-center">Vos donnees sont protegees et chiffrees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
