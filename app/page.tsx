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

  // 🔥 SCROLL ANIMATION
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
                <button className="btn-flat primary">Sign Up</button>
              </Link>

              <Link href="/login">
                <button className="btn-flat">Log In</button>
              </Link>
            </>
          )}
        </div>

        <div className="content">
          <div className="animate">
            <h1>
              Welcome to Coupon Wolf! Find the best coupons and deals here.
            </h1>
          </div>
        </div>

        <div className="center-ui">
          <div className="center-buttons animate delay-1">
            <Link href="/about">
              <button className="btn-flat primary">About Us</button>
            </Link>

            <button className="btn-flat">Add Extension</button>
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
      <section className="page page3">

        <div className="dark-panel" />
        <div className="light-panel" />

        {/* 🔥 FLOATING CATEGORY BAR */}
        <div className="categories-floating animate">
          {[
            "clothing",
            "gaming",
            "tech",
            "shoes",
            "beauty",
            "home",
            "fitness",
            "travel",
          ].map((cat) => (
            <Link key={cat} href={`/category/${cat}`}>
              <button className="category-btn">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            </Link>
          ))}
        </div>

        {/* 🔥 CONTENT */}
        <div className="page3-content">
          <h1 className="animate">Explore More Coupons</h1>

          <SearchCoupons />

          <div className="animate delay-1" style={{ marginTop: "25px" }}>
            <Link href="/submit">
              <button className="btn-flat primary">
                + Add Your Coupon
              </button>
            </Link>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="footer-section">
          <div className="footer-columns">

            <div>
              <h3>Company</h3>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>

            <div>
              <h3>Product</h3>
              <span>Coupons</span>
              <span>Extension (Soon)</span>
            </div>

            <div>
              <h3>Legal</h3>
              <span>Ad Disclosure</span>
              <span>Fair Use</span>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}