"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function Login() {
  const router = useRouter();

  const [step, setStep] = useState("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.push("/");
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async () => {
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
    }
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/",
      },
    });
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Enter your email first");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    });

    if (error) {
      setError(error.message);
    } else {
      setError("Check your email for reset link");
    }
  };

  return (
    <div className="page">

      {/* BACKGROUND */}
      <div className="dark-panel" />
      <div className="light-panel" />

      {/* LOGO */}
      <Image
        src="/logo.png"
        alt="Logo"
        width={220}
        height={220}
        className="logo"
      />

      {/* AUTH BOX */}
      <div className="auth-box">

        {/* STEP 1 */}
        {step === "choice" && (
          <>
            <h2>Log In</h2>

            <button
              className="btn-primary"
              onClick={() => setStep("email")}
            >
              Log in with Email
            </button>

            <button
              className="btn-google"
              onClick={handleGoogle}
            >
              Continue with Google
            </button>

            <p className="auth-text">
              Don’t have an account?{" "}
              <Link href="/signup">Sign up</Link>
            </p>
          </>
        )}

        {/* STEP 2 */}
        {step === "email" && (
          <>
            <h2>Welcome Back</h2>

            <input
              placeholder="Email"
              value={email}
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

            <button className="btn-primary" onClick={handleLogin}>
              Log In
            </button>

            {error && <p className="error-text">{error}</p>}

            {/* ✅ FIXED STRUCTURE */}
            <p className="auth-text">
              Don’t have an account?{" "}
              <Link href="/signup">Sign up</Link>
            </p>

            <div
              style={{
                marginTop: "10px",
                cursor: "pointer",
                fontSize: "14px",
                textAlign: "center",
                color: "#5A2A24",
                fontWeight: "500"
              }}
              onClick={handleResetPassword}
            >
              Forgot password?
            </div>
          </>
        )}

      </div>
    </div>
  );
}