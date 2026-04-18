"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import CouponRow from "@/components/CouponRow";
import SearchCoupons from "@/components/SearchCoupons";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // 🔥 SCROLL ANIMATION ENGINE
  useEffect(() => {
    const elements = document.querySelectorAll(".animate");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show"); // replay
          }
        });
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="container">

      {/* ===== PAGE 1 ===== */}
      <section className="page">

        <div className="dark-panel" />
        <div className="light-panel" />

        <Image
          src="/logo.png"
          alt="Logo"
          width={220}
          height={220}
          className="logo"
        />

        {/* TOP RIGHT */}
        <div className="top-buttons">
          {user ? (
            <>
              <div className="user-pill">
                {user.user_metadata?.name || "User"}
              </div>

              <button className="btn-flat" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/signup">
                <button className="btn-flat primary">
                  Sign Up
                </button>
              </Link>

              <Link href="/login">
                <button className="btn-flat">
                  Log In
                </button>
              </Link>
            </>
          )}
        </div>

        {/* HERO */}
        <div className="content animate">
          <h1>
            Welcome to Coupon Wolf! Find the best coupons and deals here.
          </h1>
        </div>

        {/* CENTER UI */}
        <div className="center-ui">
          <div className="center-buttons animate delay-1">
            <Link href="/about">
              <button className="btn-flat primary">
                About Us
              </button>
            </Link>

            <button className="btn-flat">
              Add Extension
            </button>
          </div>

          <div className="arrows bounce animate delay-2">
            ↓↓↓
          </div>
        </div>

      </section>

      {/* ===== PAGE 2 ===== */}
      <section className="page">
        <div className="dark-panel" />
        <div className="light-panel" />

        <div className="rows-container">
          <CouponRow title="New Coupons" category="new" />
          <CouponRow title="Best Value" category="best" />
          <CouponRow title="Most Used" category="used" />
        </div>
      </section>

      {/* ===== PAGE 3 ===== */}
      <section className="page">
        <div className="dark-panel" />
        <div className="light-panel" />

        <div className="content">

          <h1 className="animate">Explore More Coupons</h1>

          {/* 🔥 SEARCH */}
          <SearchCoupons />

          {/* 🔥 SUBMIT BUTTON */}
          <div className="animate delay-1" style={{ marginTop: "30px" }}>
            <Link href="/submit">
              <button className="btn-flat primary">
                + Add Your Coupon
              </button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}