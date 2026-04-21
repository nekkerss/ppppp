import { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(location.state?.type === "error" ? location.state?.message || "" : "");
  const [successMessage] = useState(location.state?.type === "success" ? location.state?.message || "" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!form.email || !form.password) {
      setError("Email et mot de passe sont requis");
      return;
    }
    
    setIsLoading(true);
    const result = await login(form);
    setIsLoading(false);
    
    if (!result.success) {
      if (result.requiresVerification) {
        // Redirect to email verification page
        navigate("/verify-email", {
          state: { email: result.email }
        });
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a365d] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d] to-[#0f2744]"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#00a67e]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#00a67e]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <Link to="/" className="mb-8">
            <img 
              src="/images/logo.png" 
              alt="BNA Assurances" 
              className="h-20 w-auto brightness-0 invert"
            />
          </Link>
          
          <h1 className="text-4xl font-bold text-center mb-4">
            Bienvenue sur votre
            <span className="text-[#00a67e] block">Espace Client</span>
          </h1>
          
          <p className="text-gray-300 text-center max-w-md mb-8">
            Accédez à vos contrats, suivez vos remboursements et gérez vos garanties en toute simplicité.
          </p>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00a67e]/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#00a67e]" />
              </div>
              <span className="text-sm text-gray-300">Connexion sécurisée</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00a67e]/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#00a67e]" />
              </div>
              <span className="text-sm text-gray-300">Données protégées</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/">
              <img 
                src="/images/logo.png" 
                alt="BNA Assurances" 
                className="h-16 w-auto"
              />
            </Link>
          </div>

          {/* Back to Home */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1a365d] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#1a365d] mb-2">Connexion</h2>
            <p className="text-gray-600">
              Accédez à votre espace personnel BNA Assurances
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-[#00a67e] outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-[#00a67e] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-[#00a67e] border-gray-300 rounded focus:ring-[#00a67e]"
                />
                <span className="text-sm text-gray-600">Se souvenir de moi</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-[#00a67e] hover:text-[#008c6a] font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00a67e] hover:bg-[#008c6a] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">Nouveau client ?</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#1a365d] text-[#1a365d] font-semibold py-3 px-6 rounded-lg hover:bg-[#1a365d] hover:text-white transition-all duration-200"
          >
            Créer un compte
          </Link>

          {/* Help */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Besoin d&apos;aide ?{" "}
            <Link to="/contact" className="text-[#00a67e] hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}