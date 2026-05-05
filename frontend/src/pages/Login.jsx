import { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(location.state?.type === "error" ? location.state?.message || "" : "");
  const [successMessage] = useState(location.state?.type === "success" ? location.state?.message || "" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Email et mot de passe sont requis");
      return;
    }
    setIsLoading(true);
    const result = await login(form);
    setIsLoading(false);
    if (!result.success) {
      if (result.requiresVerification) {
        navigate("/verify-email", { state: { email: result.email } });
        return;
      }
      setError(result.message);
    } else {
      sessionStorage.setItem("loginSuccessMessage", "Login successful");
      const targetPath =
        result.user?.role === "admin"
          ? "/admin/dashboard"
          : result.user?.role === "gestionnaire"
            ? "/gestionnaire/dashboard"
            : "/dashboard";
      navigate(targetPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(3deg); }
          66% { transform: translateY(-8px) rotate(-2deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-24px) rotate(-4deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0,166,126,0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0,166,126,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0,166,126,0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .float-1 { animation: float 7s ease-in-out infinite; }
        .float-2 { animation: float2 9s ease-in-out infinite; }
        .float-3 { animation: float 11s ease-in-out infinite reverse; }
        .float-4 { animation: float2 6s ease-in-out infinite 2s; }
        .shimmer-btn {
          background: linear-gradient(90deg, #00a67e, #00c494, #00a67e);
          background-size: 200% auto;
        }
        .shimmer-btn:hover { animation: shimmer 1.5s linear infinite; }
        .slide-up { animation: slideUp 0.6s ease-out forwards; }
        .fade-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-[#0a1c2e] via-[#0f2744] to-[#153356]">
        {/* Animated orbs */}
        <div className="float-1 absolute top-[12%] left-[18%] w-56 h-56 rounded-full bg-[#00a67e]/15 blur-3xl pointer-events-none" />
        <div className="float-2 absolute bottom-[18%] right-[10%] w-80 h-80 rounded-full bg-[#00a67e]/10 blur-3xl pointer-events-none" />
        <div className="float-3 absolute top-[55%] left-[5%] w-48 h-48 rounded-full bg-[#1a3a5c]/50 blur-2xl pointer-events-none" />

        {/* Geometric floating shapes */}
        <div className="float-1 absolute top-[20%] right-[15%] w-20 h-20 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm rotate-12 pointer-events-none" />
        <div className="float-2 absolute bottom-[28%] left-[12%] w-14 h-14 rounded-xl border border-[#00a67e]/20 bg-[#00a67e]/10 backdrop-blur-sm -rotate-6 pointer-events-none" />
        <div className="float-3 absolute top-[42%] right-[8%] w-10 h-10 rounded-lg border border-white/15 bg-white/5 rotate-45 pointer-events-none" />
        <div className="float-4 absolute top-[65%] left-[30%] w-8 h-8 rounded-full border border-[#00a67e]/30 bg-[#00a67e]/15 pointer-events-none" />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 flex flex-col justify-center items-start w-full px-14 py-16 text-white"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease" }}
        >
          <Link to="/" className="mb-12 group flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00a67e]/40 rounded-2xl blur-md group-hover:blur-lg transition-all" />
              <img
                src="/images/logo.jpg"
                alt="BNA Assurances"
                className="relative h-14 w-14 object-contain bg-white rounded-2xl p-2 shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-white tracking-wide">BNA</p>
              <p className="text-xs font-semibold text-[#00a67e] uppercase tracking-widest">Assurances</p>
            </div>
          </Link>

          <div
            className="inline-flex items-center gap-2 rounded-full border border-[#00a67e]/30 bg-[#00a67e]/15 px-4 py-2 mb-8"
            style={{ animationDelay: "0.2s" }}
          >
            <Sparkles className="w-4 h-4 text-[#00a67e]" />
            <span className="text-sm font-semibold text-[#00c494]">Espace sécurisé</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-5">
            Bienvenue sur votre
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#00a67e] to-[#00d4a0]">
              Espace Client
            </span>
          </h1>

          <p className="text-blue-200/80 text-lg leading-relaxed max-w-sm mb-10">
            Accédez à vos contrats, suivez vos remboursements et gérez vos garanties en toute simplicité.
          </p>

          <div className="space-y-4 w-full max-w-sm">
            {[
              { icon: Shield, text: "Connexion 100% sécurisée" },
              { icon: CheckCircle, text: "Données chiffrées et protégées" },
              { icon: Sparkles, text: "Support disponible 24/7" }
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 hover:bg-white/10 transition-all duration-300 group"
                style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
              >
                <div className="w-9 h-9 rounded-xl bg-[#00a67e]/20 border border-[#00a67e]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="w-4 h-4 text-[#00a67e]" />
                </div>
                <span className="text-sm text-blue-100/90 font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div className="mt-auto pt-12">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00a67e]" style={{ animation: "pulse-ring 2s infinite" }} />
              <p className="text-xs text-blue-200/60 font-medium uppercase tracking-widest">
                Système sécurisé BNA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-[48%] flex flex-col justify-center items-center px-6 py-12 bg-white dark:bg-slate-800">
        <div
          className="w-full max-w-[420px]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s"
          }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo.jpg" alt="BNA Assurances" className="h-12 w-12 object-contain rounded-xl border border-slate-200 p-1" />
              <div>
                <p className="font-bold text-[#0f2744] text-xl">BNA</p>
                <p className="text-xs text-[#00a67e] font-semibold uppercase tracking-wider">Assurances</p>
              </div>
            </Link>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-[#0f2744] dark:hover:text-slate-100 text-sm font-medium mb-10 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#00a67e] mb-2">Espace Client</p>
            <h2 className="text-3xl font-bold text-[#0f2744] leading-tight">Connexion</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Accédez à votre espace personnel BNA Assurances</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-emerald-700 text-sm font-medium">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Adresse email
              </label>
              <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === "email" ? "ring-2 ring-[#00a67e]/40" : ""}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 transition-colors duration-200 ${focusedField === "email" ? "text-[#00a67e]" : "text-slate-400"}`} />
                </div>
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-600 rounded-2xl bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:border-[#00a67e] focus:ring-0 outline-none transition-all duration-200 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mot de passe
              </label>
              <div className={`relative rounded-2xl transition-all duration-300 ${focusedField === "password" ? "ring-2 ring-[#00a67e]/40" : ""}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors duration-200 ${focusedField === "password" ? "text-[#00a67e]" : "text-slate-400"}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:border-[#00a67e] focus:ring-0 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border-2 border-slate-300 rounded peer-checked:bg-[#00a67e] peer-checked:border-[#00a67e] transition-all" />
                </div>
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Se souvenir de moi</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#00a67e] hover:text-[#008c6a] font-semibold transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="shimmer-btn w-full text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#00a67e]/30 hover:shadow-xl hover:shadow-[#00a67e]/40 hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium px-1">Nouveau client ?</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Link
            to="/register"
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#0f2744] text-[#0f2744] font-bold py-3.5 px-6 rounded-2xl hover:bg-[#0f2744] hover:text-white transition-all duration-300 text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            Créer un compte
          </Link>

          <p className="text-center text-xs text-slate-400 mt-8">
            Besoin d&apos;aide ?{" "}
            <Link to="/contact" className="text-[#00a67e] hover:underline font-semibold">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
