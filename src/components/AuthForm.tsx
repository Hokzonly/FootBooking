import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Calendar,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { API_URL } from "../config/api";

export function AuthForm({ mode = "login", onSubmit, loading }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
    if (mode === "register" && !name) {
      setError(t('required'));
      return;
    }
    if (!email || !password) {
      setError("Email et mot de passe requis");
      return;
    }
    await onSubmit({ email, password, name, setError });
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Veuillez d'abord entrer votre email");
      return;
    }
    
    setResendLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("Email de vérification envoyé avec succès ! Veuillez vérifier votre boîte de réception.");
      } else {
        setError(data.error || 'Échec de l\'envoi de l\'email de vérification');
      }
    } catch (error) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4 shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {mode === "login" ? "Bon Retour" : "Rejoindre FootBooking"}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {mode === "login" 
              ? "Connectez-vous à votre compte pour continuer à réserver" 
              : "Créez votre compte pour commencer à réserver des terrains de football"
            }
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (Register only) */}
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom Complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Entrez votre nom complet"
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: mode === "login" ? 0.2 : 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                          placeholder="Entrez votre email"
                    autoComplete="email"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: mode === "login" ? 0.3 : 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de Passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                          placeholder="Entrez votre mot de passe"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mode === "login" && (
                  <div className="mt-2 text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-red-800">{error}</p>
                      {error.includes("verify your email") && (
                        <button
                          onClick={handleResendVerification}
                          disabled={resendLoading}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                          {resendLoading ? "Envoi..." : "Renvoyer l'Email de Vérification"}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: mode === "login" ? 0.4 : 0.5 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "login" ? "Se Connecter" : "Créer un Compte"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Switch Mode */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="text-center"
            >
              <p className="text-gray-600 text-sm">
                {mode === "login" ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
                <Link
                  to={mode === "login" ? "/register" : "/login"}
                  className="ml-1 text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  {mode === "login" ? "S'inscrire" : "Se connecter"}
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Features List (Register only) */}
        {mode === "register" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Réservation Facile</h3>
              <p className="text-xs text-gray-600">Réservez des terrains en 3 clics</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Confirmation Instantanée</h3>
              <p className="text-xs text-gray-600">Obtenez des réservations confirmées instantanément</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Tableau de Bord Personnel</h3>
              <p className="text-xs text-gray-600">Suivez toutes vos réservations</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 