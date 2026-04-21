import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import API from "../api/axios";

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Get email from location state or URL params
  const email = location.state?.email || new URLSearchParams(location.search).get('email');

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!verificationCode.trim()) {
      setError("Veuillez entrer le code de vérification");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Le code de vérification doit contenir 6 chiffres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await API.post("/auth/verify-email", {
        email,
        code: verificationCode.trim()
      });

      // Success - redirect to login with success message
      navigate("/login", {
        state: {
          message: "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.",
          type: "success"
        }
      });
    } catch (err) {
      const message = err.response?.data?.message || "Code de vérification invalide";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setResendMessage("");
    setError("");

    try {
      await API.post("/auth/resend-verification", { email });
      setResendMessage("Un nouveau code de vérification a été envoyé à votre email");
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'envoi du code";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Same as Register */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a365d] relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#00a67e]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00a67e]/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="mb-8">
            <img
              src="/images/logo.png"
              alt="BNA Assurances"
              className="h-24 w-auto brightness-0 invert"
            />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Vérifiez votre email
          </h1>
          <p className="text-[#94a3b8] text-lg text-center max-w-md mb-12">
            Nous avons envoyé un code de vérification à votre adresse email. Entrez-le ci-dessous pour activer votre compte.
          </p>

          <div className="space-y-4 w-full max-w-md">
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex-shrink-0 w-6 h-6 bg-[#00a67e] rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span>Vérification par email sécurisée</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex-shrink-0 w-6 h-6 bg-[#00a67e] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span>Code valide pendant 10 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="flex-shrink-0 w-6 h-6 bg-[#00a67e] rounded-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <span>Possibilité de renvoyer le code</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Verification Form */}
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
              <div className="w-16 h-16 bg-[#00a67e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#00a67e]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a365d]">Vérification email</h2>
              <p className="text-[#64748b] mt-2">
                Entrez le code de 6 chiffres envoyé à
                <br />
                <span className="font-medium text-[#1a365d]">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {resendMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-600 text-sm">{resendMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1a365d] mb-2 text-center">
                  Code de vérification
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={handleCodeChange}
                    placeholder="123456"
                    className="w-full text-center text-2xl font-mono tracking-widest border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#00a67e] focus:border-transparent outline-none transition-all bg-[#f8fafc] py-4"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-[#64748b] mt-2 text-center">
                  Entrez les 6 chiffres reçus par email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-[#00a67e] hover:bg-[#008f6b] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Vérification en cours...
                  </>
                ) : (
                  "Vérifier mon email"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                className="text-[#00a67e] hover:text-[#008f6b] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : countdown > 0 ? (
                  `Renvoyer le code (${countdown}s)`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Renvoyer le code
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="text-[#64748b] hover:text-[#1a365d] text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'inscription
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-[#94a3b8]">
            &copy; 2024 BNA Assurances. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}