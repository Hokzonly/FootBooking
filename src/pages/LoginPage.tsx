import React, { useState } from "react";
import { AuthForm } from "../components/AuthForm";
import { API_URL } from "../config/api";
import { useLanguage } from "../contexts/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ email, password, setError }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data.user));
        window.location.href = "/";
      } else if (res.status === 403 && data.needsVerification) {
        // Handle email verification requirement
        setError(`Veuillez vérifier votre email avant de vous connecter. Vérifiez votre boîte de réception pour ${data.email} ou cliquez sur "Renvoyer la vérification" ci-dessous.`);
        // You could add a resend verification button here
      } else {
        setError(data.error || t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} loading={loading} />;
} 