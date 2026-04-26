import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, CreditCard, Loader2, Shield, CheckCircle, ArrowLeft, Sparkles } from "lucide-react";
import API from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", CIN: "", phone: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabel = (s) => s <= 2 ? "Faible" : s <= 3 ? "Moyen" : "Fort";
  const strengthColor = (s) => s <= 2 ? "bg-red-500" : s <= 3 ? "bg-amber-400" : "bg-[#00a67e]";
  const strengthTextColor = (s) => s <= 2 ? "text-red-500" : s <= 3 ? "text-amber-500" : "text-[#00a67e]";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.CIN || !form.phone) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) {
      setError("Le nom ne doit contenir que des lettres");
      return;
    }
    if (!/^[01]\d{7}$/.test(form.CIN)) {
      setError("Le CIN doit commencer par 0 ou 1 et contenir exactement 8 chiffres");
      return;
    }
    if (!/^\d{8}$/.test(form.phone)) {
      setError("Le numéro de téléphone doit contenir exactement 8 chiffres");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (calculatePasswordStrength(form.password) < 3) {
      setError("Le mot de passe doit être fort (au moins 8 caractères avec majuscules, minuscules, chiffres et symboles)");
      return;
    }
    setIsLoading(true);
    try {
      await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        CIN: form.CIN,
        phone: form.phone
      });
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Échec de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full pl-12 pr-4 py-3.5 border rounded-2xl bg-slate-50 outline-none transition-all duration-200 text-slate-800 placeholder-slate-400 text-sm ${
      focusedField === field
        ? "border-[#00a67e] bg-white ring-2 ring-[#00a67e]/30"
        : "border-slate-200 hover:border-slate-300"
    }`;

  const benefits = [
    "Accès à tous nos services d'assurance",
    "Gestion de vos contrats en ligne",
    "Déclaration de sinistres simplifiée",
    "Support client prioritaire 24/7"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-16px) rotate(4deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-22px) rotate(-3deg)} }
        @keyframes floatC { 0%,100%{transform:translateY(0)} 33%{transform:translateY(-10px)} 66%{transform:translateY(-18px)} }
        .fa{animation:floatA 7s ease-in-out infinite}
        .fb{animation:floatB 9s ease-in-out infinite}
        .fc{animation:floatC 11s ease-in-out infinite reverse}
      `}</style>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-[#0a1c2e] via-[#0f2744] to-[#153356]">
        {/* Orbs */}
        <div className="fa absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-[#00a67e]/15 blur-3xl pointer-events-none" />
        <div className="fb absolute bottom-[15%] right-[8%] w-80 h-80 rounded-full bg-[#00a67e]/10 blur-3xl pointer-events-none" />
        {/* Shapes */}
        <div className="fa absolute top-[18%] right-[12%] w-20 h-20 rounded-2xl border border-white/10 bg-white/5 rotate-12 pointer-events-none" />
        <div className="fb absolute bottom-[30%] left-[10%] w-14 h-14 rounded-xl border border-[#00a67e]/20 bg-[#00a67e]/10 -rotate-6 pointer-events-none" />
        <div className="fc absolute top-[60%] right-[6%] w-10 h-10 rounded-lg border border-white/15 bg-white/5 rotate-45 pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.15) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

        <div
          className="relative z-10 flex flex-col justify-center w-full px-12 py-16 text-white"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease" }}
        >
          <Link to="/" className="mb-10 flex items-center gap-3 group w-fit">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00a67e]/40 rounded-2xl blur-md group-hover:blur-lg transition-all" />
              <img src="/images/logo.jpg" alt="BNA" className="relative h-14 w-14 object-contain bg-white rounded-2xl p-2 shadow-xl group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-wide">BNA</p>
              <p className="text-xs font-semibold text-[#00a67e] uppercase tracking-widest">Assurances</p>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#00a67e]/30 bg-[#00a67e]/15 px-4 py-2 mb-7 w-fit">
            <Sparkles className="w-4 h-4 text-[#00a67e]" />
            <span className="text-sm font-semibold text-[#00c494]">Inscription gratuite</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-5">
            Rejoignez-nous
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-[#00a67e] to-[#00d4a0]">
              dès aujourd'hui
            </span>
          </h1>
          <p className="text-blue-200/75 text-base leading-relaxed max-w-sm mb-10">
            Créez votre compte et accédez à tous nos services d'assurance en quelques minutes.
          </p>

          <div className="space-y-3 w-full max-w-sm">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3.5 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-7 h-7 rounded-lg bg-[#00a67e]/25 border border-[#00a67e]/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-3.5 h-3.5 text-[#00a67e]" />
                </div>
                <span className="text-sm text-blue-100/85 font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-12">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#00a67e] animate-pulse" />
              <p className="text-xs text-blue-200/50 font-medium uppercase tracking-widest">Inscription sécurisée BNA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[52%] flex items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        <div
          className="w-full max-w-[460px]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s"
          }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/logo.jpg" alt="BNA" className="h-12 w-12 object-contain rounded-xl border border-slate-200 p-1" />
              <div>
                <p className="font-bold text-[#0f2744] text-xl">BNA</p>
                <p className="text-xs text-[#00a67e] font-semibold uppercase tracking-wider">Assurances</p>
              </div>
            </Link>
          </div>

          <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0f2744] text-sm font-medium mb-7 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la connexion
          </Link>

          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-widest text-[#00a67e] mb-2">Nouveau compte</p>
            <h2 className="text-3xl font-bold text-[#0f2744]">Créer un compte</h2>
            <p className="text-slate-500 mt-2 text-sm">Remplissez vos informations pour commencer</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <div className="w-7 h-7 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`w-5 h-5 transition-colors ${focusedField === "name" ? "text-[#00a67e]" : "text-slate-400"}`} />
                </div>
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, "") })}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className={inputClass("name")}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 transition-colors ${focusedField === "email" ? "text-[#00a67e]" : "text-slate-400"}`} />
                </div>
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={inputClass("email")}
                />
              </div>
            </div>

            {/* CIN & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">CIN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className={`w-5 h-5 transition-colors ${focusedField === "cin" ? "text-[#00a67e]" : "text-slate-400"}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="12345678"
                    value={form.CIN}
                    onChange={(e) => setForm({ ...form, CIN: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                    onFocus={() => setFocusedField("cin")}
                    onBlur={() => setFocusedField(null)}
                    className={inputClass("cin")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className={`w-5 h-5 transition-colors ${focusedField === "phone" ? "text-[#00a67e]" : "text-slate-400"}`} />
                  </div>
                  <input
                    type="tel"
                    placeholder="12345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    className={inputClass("phone")}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors ${focusedField === "password" ? "text-[#00a67e]" : "text-slate-400"}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe fort requis"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setPasswordStrength(calculatePasswordStrength(e.target.value)); }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClass("password")} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Force du mot de passe</span>
                    <span className={`text-xs font-bold ${strengthTextColor(passwordStrength)}`}>{strengthLabel(passwordStrength)}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength ? strengthColor(passwordStrength) : "bg-slate-200"}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors ${focusedField === "confirm" ? "text-[#00a67e]" : "text-slate-400"}`} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  className={`${inputClass("confirm")} pr-12`}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.confirmPassword && form.password && (
                <p className={`text-xs mt-1.5 font-medium ${form.password === form.confirmPassword ? "text-[#00a67e]" : "text-red-500"}`}>
                  {form.password === form.confirmPassword ? "✓ Les mots de passe correspondent" : "✗ Les mots de passe ne correspondent pas"}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 rounded accent-[#00a67e]" />
              <label htmlFor="terms" className="text-sm text-slate-500 leading-relaxed">
                J&apos;accepte les{" "}
                <Link to="/terms" className="text-[#00a67e] hover:underline font-semibold">conditions d&apos;utilisation</Link>{" "}
                et la{" "}
                <Link to="/privacy" className="text-[#00a67e] hover:underline font-semibold">politique de confidentialité</Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00a67e] hover:bg-[#008c6a] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#00a67e]/30 hover:shadow-xl hover:shadow-[#00a67e]/40 hover:-translate-y-0.5 active:translate-y-0 text-sm mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-[#00a67e] font-bold hover:underline">Se connecter</Link>
          </p>

          <p className="text-center text-xs text-slate-400 mt-4">
            © 2024 BNA Assurances. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
