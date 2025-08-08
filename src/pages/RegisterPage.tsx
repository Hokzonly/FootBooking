import React, { useState } from "react";
import { AuthForm } from "../components/AuthForm";
import { API_URL } from "../config/api";
import { useLanguage } from "../contexts/LanguageContext";

export default function RegisterPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleRegister = async ({ email, password, name, setError }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        setError("Erreur serveur inattendue. Veuillez réessayer.");
        return;
      }
      if (res.ok) {
        // Show success message about email verification
        alert(data.message || "Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.");
        window.location.href = "/login";
      } else {
        setError(data.error || t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm mode="register" onSubmit={handleRegister} loading={loading} />;
} 