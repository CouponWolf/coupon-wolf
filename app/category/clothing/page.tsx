"use client";

import { useEffect } from "react";
import CouponRow from "@/components/CouponRow";

export default function ClothingPage() {

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

  return (
    <div className="clothing-page">

      {/* HERO */}
      <div className="clothing-hero animate">
        <h1>Clothing Deals</h1>
        <p>Top fashion brands. Best discounts. No wasted time.</p>
      </div>

      {/* CONTENT */}
      <div className="clothing-sections">

        <div className="animate">
          <CouponRow title="🔥 Trending Clothing" category="clothing" />
        </div>

        <div className="animate delay-1">
          <CouponRow title="👟 Nike Deals" category="nike" />
        </div>

        <div className="animate delay-2">
          <CouponRow title="👕 Adidas Deals" category="adidas" />
        </div>

      </div>

    </div>
  );
}