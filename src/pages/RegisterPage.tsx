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
        // Show success message about email verification
        alert(data.message || "Registration successful! Please check your email to verify your account.");
        window.location.href = "/login";
      } else {
        setError(data.error || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm mode="register" onSubmit={handleRegister} loading={loading} />;
} 