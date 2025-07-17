import React, { useState } from "react";
import { AuthForm } from "../components/AuthForm";
import { API_URL } from "../config/api";

export default function RegisterPage() {
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
        setError("Unexpected server error. Please try again.");
        return;
      }
      if (res.ok) {
        // Optionally, auto-login after registration
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem("token", loginData.token);
          window.location.href = "/";
        } else {
          setError(loginData.error || "Registration succeeded, but login failed");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm mode="register" onSubmit={handleRegister} loading={loading} />;
} 