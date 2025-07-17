import React, { useState } from "react";
import { AuthForm } from "../components/AuthForm";
import { API_URL } from "../config/api";

export default function LoginPage() {
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
        window.location.href = "/";
      } else {
        setError(data.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm mode="login" onSubmit={handleLogin} loading={loading} />;
} 