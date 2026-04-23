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
            entry.target.classList.remove("show");
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
          src="/Logo.png"
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
        <div className="content">
          <div className="animate">
            <h1>
              Welcome to Coupon Wolf! Find the best coupons and deals here.
            </h1>

            <p style={{ fontSize: "12px", opacity: 0.6 }}>
              Impact-Site-Verification: 534f4d97-fb71-4b99-b767-2f87956bc7b9
            </p>
          </div>
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

        {/* 🔥 REMOVE PANELS FOR CLEAN FOOTER LOOK */}
        <div style={{ position: "absolute", inset: 0, background: "#5A2A24", zIndex: 0 }} />

        <div className="content">

          <h1 className="animate" style={{ color: "white" }}>
            Explore More Coupons
          </h1>

          <SearchCoupons />

          <div className="animate delay-1" style={{ marginTop: "30px" }}>
            <Link href="/submit">
              <button className="btn-flat primary">
                + Add Your Coupon
              </button>
            </Link>
          </div>

        </div>

        {/* 🔥 NEW FOOTER SECTION */}
        <div className="footer-section animate delay-2">

          <div className="footer-columns">

            <div>
              <h3>Company</h3>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </div>

            <div>
              <h3>Legal</h3>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>

            <div>
              <h3>Product</h3>
              <span>Coupons</span>
              <span>Deals</span>
              <span>Extension (Soon)</span>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}