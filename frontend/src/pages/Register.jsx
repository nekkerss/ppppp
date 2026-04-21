import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, CreditCard, Loader2, Shield, CheckCircle } from "lucide-react";
import API from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    CIN: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getPasswordStrengthLabel = (score) => {
    if (score <= 2) return "Faible";
    if (score <= 3) return "Moyen";
    return "Fort";
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!form.name || !form.email || !form.password || !form.CIN || !form.phone) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    // Name validation - alphabetic only
    if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) {
      setError("Le nom ne doit contenir que des lettres");
      return;
    }

    // CIN validation - starts with 0 or 1, exactly 8 digits
    if (!/^[01]\d{7}$/.test(form.CIN)) {
      setError("Le CIN doit commencer par 0 ou 1 et contenir exactement 8 chiffres");
      return;
    }

    // Phone validation - exactly 8 digits
    if (!/^\d{8}$/.test(form.phone)) {
      setError("Le numéro de téléphone doit contenir exactement 8 chiffres");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Password strength validation
    const strength = calculatePasswordStrength(form.password);
    if (strength < 3) {
      setError("Le mot de passe doit être fort (au moins 8 caractères avec majuscules, minuscules, chiffres et symboles)");
      return;
    }

    setIsLoading(true);

    try {
      const data = {
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        CIN: form.CIN,
        phone: form.phone
      };

      const res = await API.post("/auth/register", data);
      
      // Redirect to email verification page
      navigate("/verify-email", {
        state: { email: form.email }
      });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || "Échec de l'inscription";
      console.error("Register error:", message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Accès à tous nos services d'assurance",
    "Gestion de vos contrats en ligne",
    "Déclaration de sinistres simplifiée",
    "Support client prioritaire 24/7"
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a365d] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#00a67e]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00a67e]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/images/logo.png" 
              alt="BNA Assurances" 
              className="h-24 w-auto brightness-0 invert"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Rejoignez-nous
          </h1>
          <p className="text-[#94a3b8] text-lg text-center max-w-md mb-12">
            Créez votre compte et accédez à tous nos services d&apos;assurance en quelques minutes
          </p>

          {/* Benefits List */}
          <div className="space-y-4 w-full max-w-md">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-white/90">
                <div className="flex-shrink-0 w-6 h-6 bg-[#00a67e] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
            <Shield className="w-5 h-5 text-[#00a67e]" />
            <span className="text-white/90 text-sm">Vos données sont sécurisées et protégées</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src="/images/logo.png" 
              alt="BNA Assurances" 
              className="h-16 w-auto"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1a365d]">Créer un compte</h2>
              <p className="text-[#64748b] mt-2">Remplissez vos informations pour commencer</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-[#1a365d] mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#94a3b8]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Votre nom complet"
                    value={form.name}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setForm({ ...form, name: value });
                    }}
                    className="w-full pl-12 pr-4 py-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-transparent outline-none transition-all bg-[#f8fafc]"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[#1a365d] mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#94a3b8]" />
                  </div>
                  <input
                    type="email"
                    placeholder="exemple@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-transparent outline-none transition-all bg-[#f8fafc]"
                  />
                </div>
              </div>

              {/* CIN and Phone Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* CIN Field */}
                <div>
                  <label className="block text-sm font-medium text-[#1a365d] mb-2">
                    CIN
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-[#94a3b8]" />
                    </div>
                    <input
                      type="text"
                      placeholder="12345678"
                      value={form.CIN}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setForm({ ...form, CIN: value });
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-transparent outline-none transition-all bg-[#f8fafc]"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-[#1a365d] mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-[#94a3b8]" />
                    </div>
                    <input
                      type="tel"
                      placeholder="12345678"
                      value={form.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setForm({ ...form, phone: value });
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-transparent outline-none transition-all bg-[#f8fafc]"
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-[#1a365d] mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#94a3b8]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe fort requis"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      setPasswordStrength(calculatePasswordStrength(e.target.value));
                    }}
                    className="w-full pl-12 pr-12 py-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-transparent outline-none transition-all bg-[#f8fafc]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-[#94a3b8] hover:text-[#1a365d]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#94a3b8] hover:text-[#1a365d]" />
                    )}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[#64748b]">Force du mot de passe:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength <= 2 ? 'text-red-600' :
                        passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[#64748b] mt-1">
                      Au moins 8 caractères avec majuscules, minuscules, chiffres et symboles
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-[#1a365d] mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#94a3b8]" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre mot de passe"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-transparent outline-none transition-all bg-[#f8fafc]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-[#94a3b8] hover:text-[#1a365d]" />
                    ) : (
                      <Eye className="h-5 w-5 text-[#94a3b8] hover:text-[#1a365d]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 text-[#00a67e] border-[#e2e8f0] rounded focus:ring-[#00a67e]"
                />
                <label htmlFor="terms" className="text-sm text-[#64748b]">
                  J&apos;accepte les{" "}
                  <Link to="/terms" className="text-[#00a67e] hover:underline">
                    conditions d&apos;utilisation
                  </Link>{" "}
                  et la{" "}
                  <Link to="/privacy" className="text-[#00a67e] hover:underline">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00a67e] hover:bg-[#008f6b] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-8 text-center text-[#64748b]">
              Vous avez déjà un compte?{" "}
              <Link 
                to="/login" 
                className="text-[#00a67e] font-semibold hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-[#94a3b8]">
            &copy; 2024 BNA Assurances. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}