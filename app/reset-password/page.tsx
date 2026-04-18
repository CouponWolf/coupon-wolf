"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleUpdatePassword = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Password updated! You can now log in.");
      window.location.href = "/login";
    }
  };

  return (
    <div className="page">

      <div className="dark-panel" />
      <div className="light-panel" />

      <Image
        src="/logo.png"
        alt="Logo"
        width={220}
        height={150}
        className="logo"
      />

      <div className="auth-box">
        <h2>Reset Password</h2>

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>👁</span>
        </div>

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>👁</span>
        </div>

        <button className="btn-primary" onClick={handleUpdatePassword}>
          Update Password
        </button>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}