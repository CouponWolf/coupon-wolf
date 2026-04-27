"use client";

import { useEffect, useState } from "react";
import CouponRow from "@/components/CouponRow";

export default function ClothingPage() {
  const [activeBrand, setActiveBrand] = useState("all");

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
      { threshold: 0.25 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const brands = [
    { id: "all", label: "All" },
    { id: "nike", label: "Nike" },
    { id: "adidas", label: "Adidas" },
    { id: "zara", label: "Zara" },
    { id: "hm", label: "H&M" },
    { id: "asos", label: "ASOS" },
  ];

  return (
    <div className="clothing-page">

      {/* ===== HERO ===== */}
      <section className="clothing-hero">
        <h1 className="animate">Clothing Deals</h1>
        <p className="animate delay-1">
          Discover the best fashion deals from top brands.
        </p>
      </section>

      {/* ===== BRAND FILTER ===== */}
      <div className="brand-tabs animate delay-2">
        {brands.map((b) => (
          <button
            key={b.id}
            className={`brand-btn ${activeBrand === b.id ? "active" : ""}`}
            onClick={() => setActiveBrand(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* ===== CONTENT ===== */}
      <div className="clothing-content">

        {activeBrand === "all" && (
          <>
            <CouponRow title="Top Clothing Deals" category="clothing" />
            <CouponRow title="Trending Now" category="clothing" />
          </>
        )}

        {activeBrand === "nike" && (
          <CouponRow title="Nike Deals" category="nike" />
        )}

        {activeBrand === "adidas" && (
          <CouponRow title="Adidas Deals" category="adidas" />
        )}

        {activeBrand === "zara" && (
          <CouponRow title="Zara Deals" category="zara" />
        )}

        {activeBrand === "hm" && (
          <CouponRow title="H&M Deals" category="hm" />
        )}

        {activeBrand === "asos" && (
          <CouponRow title="ASOS Deals" category="asos" />
        )}

      </div>

    </div>
  );
}