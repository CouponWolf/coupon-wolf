"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function Signup() {
  const [step, setStep] = useState("choice"); // choice or email
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    setError("");

    // ❌ passwords don't match
    if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      alert("Check your email!");
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <div className="page">

      {/* BACKGROUND (same style as home/login) */}
      <div className="dark-panel" />
      <div className="light-panel" />

      {/* LOGO */}
      <Image
        src="/Logo.png"
        alt="Logo"
        width={220}
        height={220}
        className="logo"
      />

      {/* AUTH BOX */}
      <div className="auth-box">

        {/* STEP 1: CHOICE */}
        {step === "choice" && (
          <>
            <h2>Sign Up</h2>

            <button
              className="btn-primary"
              onClick={() => setStep("email")}
            >
              Sign up with Email
            </button>

            <button
              className="btn-google"
              onClick={handleGoogle}
            >
              Continue with Google
            </button>

            <p className="auth-text">
              Already have an account?{" "}
              <Link href="/login">Log in</Link>
            </p>
          </>
        )}

        {/* STEP 2: EMAIL FORM */}
        {step === "email" && (
          <>
            <h2>Create Account</h2>

            <input
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

       <div style={{ position: "relative" }}>
         <input
           type={showPassword ? "text" : "password"}
           placeholder="Password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
         />

         <span
           onClick={() => setShowPassword(!showPassword)}
           style={{
             position: "absolute",
             right: "10px",
             top: "50%",
             transform: "translateY(-50%)",
             cursor: "pointer",
             fontSize: "14px",
           }}
         >
           👁
         </span>
       </div>

       <div style={{ position: "relative" }}>
         <input
           type={showPassword ? "text" : "password"}
           placeholder="Password"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
         />

         <span
           onClick={() => setShowPassword(!showPassword)}
           style={{
             position: "absolute",
             right: "10px",
             top: "50%",
             transform: "translateY(-50%)",
             cursor: "pointer",
             fontSize: "14px",
           }}
         >
           👁
         </span>
       </div>

            <button className="btn-primary" onClick={handleSignup}>
              Sign Up
            </button>
            {error && <p className="error-text">{error}</p>}

            <p className="auth-text">
              Already have an account?{" "}
              <Link href="/login">Log in</Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}